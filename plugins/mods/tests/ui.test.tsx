import type { On } from 'claude-code'
import { expect, test } from 'claude-code/testing'

declare const setTimeout: (callback: () => void, ms: number) => unknown

const PANE_PROPS = {
  title: 'Mods',
  isFocused: false,
  bodyColumns: 80,
  placement: 'dock' as const,
  scroll: { offset: 0, bodyRows: 40 },
  view: {},
}

const typed = (command: string, args: string) => ({
  command,
  args,
  origin: { kind: 'composer' as const },
  presentation: { isFullscreen: true, columns: 160 },
})

const HOME = '/u'
const SETTINGS = `${HOME}/.claude/settings.json`
const manifest = (name: string) => JSON.stringify({ name, description: `${name} description` })

const waitFor = async (check: () => boolean) => {
  for (let i = 0; i < 100 && !check(); i++) await new Promise<void>(resolve => setTimeout(resolve, 5))
}

// A fake disk: the mods home holds pr-flow and cost-meter, a session folder holds uptime.
const stubEngine = (on: On) => {
  const store = new Map<string, unknown>()
  const files = new Map<string, string>([
    [`${HOME}/claude-mods/pr-flow/.claude-plugin/plugin.json`, manifest('pr-flow')],
    [`${HOME}/claude-mods/cost-meter/.claude-plugin/plugin.json`, manifest('cost-meter')],
    [`${HOME}/.claude/dev-mods/s1/uptime/.claude-plugin/plugin.json`, manifest('uptime')],
    [SETTINGS, JSON.stringify({ env: { CLAUDE_CODE_PLUGIN_DIRS: `${HOME}/claude-mods/pr-flow` }, model: 'opus' })],
  ])
  const dirs: Record<string, string[]> = {
    [`${HOME}/claude-mods`]: ['pr-flow', 'cost-meter'],
    [`${HOME}/.claude/dev-mods`]: ['s1'],
    [`${HOME}/.claude/dev-mods/s1`]: ['uptime'],
  }
  const ran: string[] = []
  const opened: unknown[] = []
  on('store.get', ($, e) => ({ value: store.get(e.key) ?? null }))
  on('store.set', ($, e) => {
    store.set(e.key, e.value)
    return { value: undefined }
  })
  on('env.get', ($, e) => ({ value: e.name === 'HOME' ? HOME : undefined }))
  on('fs.list', ($, e) => {
    const names = dirs[e.path]
    if (names === undefined) throw new Error('ENOENT')
    return { value: names.map(name => ({ name, kind: 'dir' as const, size: 0, mtimeMs: 0, isLink: false })) }
  })
  on('fs.read', ($, e) => {
    const text = files.get(e.path)
    if (text === undefined) throw new Error('ENOENT')
    return { value: text }
  })
  on('fs.exists', ($, e) => ({ value: files.has(e.path) }))
  on('fs.write', ($, e) => {
    files.set(e.path, e.text)
    return { value: undefined }
  })
  on('command.list', () => ({
    value: [
      { name: 'flow', description: '', source: 'plugin' as const, plugin: 'pr-flow' },
      { name: 'cost', description: '', source: 'plugin' as const, plugin: 'cost-meter' },
      { name: 'mods', description: '', source: 'plugin' as const, plugin: 'mods' },
    ],
  }))
  const panes = new Set<string>()
  on('ui.open', ($, e) => {
    opened.push(e)
    panes.add(e.id)
    return { value: { isPlaced: true as const } }
  })
  on('ui.close', ($, e) => {
    panes.delete(e.id)
    return { value: undefined }
  })
  on('ui.panes', () => ({
    value: [...panes].map(id => ({ id, title: id, isShown: true, isFocused: true, isPlaced: true })),
  }))
  on('command.run', { command: 'flow' }, ($, e) => {
    ran.push(`flow ${e.args}`)
    return { text: 'ok' }
  })
  on('command.run', { command: 'cost' }, ($, e) => {
    ran.push(`cost ${e.args}`)
    return { text: 'ok' }
  })
  return { files, ran, opened, panes }
}

test('a second bare /mods closes the pane; a third opens it again', async ($, on) => {
  const engine = stubEngine(on)
  await $.command.run(typed('mods', ''))
  expect(engine.panes.has('mods')).toBe(true)

  const closed = await $.command.run(typed('mods', ''))
  expect(closed.text).toMatch(/closed/)
  expect(engine.panes.has('mods')).toBe(false)

  await $.command.run(typed('mods', ''))
  expect(engine.panes.has('mods')).toBe(true)
  expect(engine.opened).toHaveLength(2)
})

test('the pane opens with the keyboard and lists every mod', async ($, on) => {
  const engine = stubEngine(on)
  await $.command.run(typed('mods', ''))
  const pane = await $.ui.mount({ plugin: 'mods', surface: 'terminal', component: 'Pane', requestId: 'mods', props: PANE_PROPS })

  expect(engine.opened[0]).toMatchObject({ id: 'mods', focus: true, closeOnEscape: true })
  expect(await pane.find({ type: 'Text', text: /\/flow · loaded · loads at start/ })).toBeDefined()
  expect(await pane.find({ type: 'Text', text: /\/cost · loaded · not loaded at start/ })).toBeDefined()
  expect(await pane.find({ type: 'Text', text: /not loaded · session folder only/ })).toBeDefined()
  expect(await pane.find({ type: 'Text', text: /cost-meter description/ })).toBeDefined()
  expect(await pane.find({ type: 'Button', key: 'pick-uptime' })).toBeDefined()
  // The first row is picked: its actions are offered.
  expect((await pane.find({ type: 'Button', key: 'live' }))?.text).toMatch(/turn cost-meter off/)

  await pane.press({ key: 'pick-uptime' })
  await waitFor(() => false)
  expect(await pane.find({ type: 'Button', key: 'live' })).toBe(undefined)
  expect(await pane.find({ type: 'Button', key: 'startup' })).toBeDefined()
})

test('Turn off runs the mod command and the row shows off', async ($, on) => {
  const engine = stubEngine(on)
  await $.command.run(typed('mods', ''))
  const pane = await $.ui.mount({ plugin: 'mods', surface: 'terminal', component: 'Pane', requestId: 'mods', props: PANE_PROPS })

  await pane.press({ key: 'live' })
  await waitFor(() => engine.ran.includes('cost off'))
  expect(engine.ran).toEqual(['cost off'])
  // The mod's command took the keys to the prompt: the pane asks for them back.
  await waitFor(() => engine.opened.length > 1)
  expect(engine.opened[1]).toMatchObject({ id: 'mods', focus: true })
  await waitFor(() => false)
  expect(await pane.find({ type: 'Text', text: /\/cost · off/ })).toBeDefined()
})

test("Don't load at start edits only CLAUDE_CODE_PLUGIN_DIRS", async ($, on) => {
  const engine = stubEngine(on)
  await $.command.run(typed('mods', ''))
  const pane = await $.ui.mount({ plugin: 'mods', surface: 'terminal', component: 'Pane', requestId: 'mods', props: PANE_PROPS })

  await pane.press({ key: 'pick-pr-flow' })
  await waitFor(() => false)
  await pane.press({ key: 'startup' })
  await waitFor(() => !engine.files.get(SETTINGS)!.includes('pr-flow'))
  expect(JSON.parse(engine.files.get(SETTINGS)!)).toEqual({ env: {}, model: 'opus' })
})

test('an on/off typed directly to a mod is remembered', async ($, on) => {
  stubEngine(on)
  await $.command.run(typed('flow', 'off'))
  await $.command.run(typed('mods', ''))
  const pane = await $.ui.mount({ plugin: 'mods', surface: 'terminal', component: 'Pane', requestId: 'mods', props: PANE_PROPS })
  expect(await pane.find({ type: 'Text', text: /\/flow · off/ })).toBeDefined()
})

test('/mods list prints a text summary; /mods off closes and stays off', async ($, on) => {
  stubEngine(on)
  const listed = await $.command.run(typed('mods', 'list'))
  expect(listed.text).toMatch(/- pr-flow \(\/flow\): loaded, loads at start/)
  await $.command.run(typed('mods', 'off'))
  const again = await $.command.run(typed('mods', ''))
  expect(again.text).toMatch(/mods is off/)
})
