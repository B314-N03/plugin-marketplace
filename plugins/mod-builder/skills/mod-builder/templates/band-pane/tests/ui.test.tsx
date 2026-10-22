import type { On } from 'claude-code'
import { expect, test } from 'claude-code/testing'

// Props the surface would hand the two sites; the plugin reads only a few.
const PANE_PROPS = {
  title: 'Tool calls',
  isFocused: false,
  bodyColumns: 60,
  placement: 'dock' as const,
  scroll: { offset: 0, bodyRows: 30 },
  view: {},
}
const BAND_PROPS = {
  hasSurvey: false,
  isWorking: false,
  maxRows: 10,
  bodyColumns: 80,
  scroll: { offset: 0, bodyRows: 10 },
  view: {},
}

// What the engine stamps on a command the person typed: `$.command.run` in a
// test needs origin and presentation, which a plugin's own call may leave out.
const typed = (args: string) => ({
  command: 'tpl-panel',
  args,
  origin: { kind: 'composer' as const },
  presentation: { isFullscreen: true, columns: 120 },
})

// The engine's I/O stands beneath the plugin. Every stub answers `{ value }`;
// a bare value (or undefined) is "no result" and the plugin's hook is skipped.
const stubEngine = (on: On) => {
  const store = new Map<string, unknown>()
  on('store.get', ($, e) => ({ value: store.get(e.key) ?? null }))
  on('store.set', ($, e) => {
    store.set(e.key, e.value)
    return { value: undefined }
  })
  on('tool.call', () => ({ isError: true as const, result: null, text: 'stub tool ran' }))
  // The engine's pane record: what `$.ui.panes()` lists, kept in step with open and close.
  const panes = new Set<string>()
  on('ui.open', ($, e) => {
    panes.add(e.id)
    return { value: { isPlaced: true as const } }
  })
  on('ui.close', ($, e) => {
    panes.delete(e.id)
    return { value: undefined }
  })
  on('ui.panes', () => ({
    value: [...panes].map(id => ({ id, title: id, isShown: true, isFocused: false, isPlaced: true })),
  }))
  return { panes }
}

test('a tool call shows in the band and the pane', async ($, on) => {
  stubEngine(on)
  await $.tool.call({ tool: 'Read', file_path: '/repo/a.ts' })

  const pane = await $.ui.mount({ plugin: 'tpl-panel', surface: 'terminal', component: 'Pane', requestId: 'tpl-panel', props: PANE_PROPS })
  expect(await pane.find({ type: 'Text', text: /Read/ })).toBeDefined()

  const band = await $.ui.mount({ plugin: 'tpl-panel', surface: 'terminal', component: 'AbovePrompt', props: BAND_PROPS })
  expect(await band.find({ type: 'Button', key: 'open' })).toBeDefined()
})

test('/tpl-panel off hides the band', async ($, on) => {
  stubEngine(on)
  await $.tool.call({ tool: 'Read', file_path: '/repo/a.ts' })
  await $.command.run(typed('off'))

  // Off, the band hook hands the site back to the engine (`next(e)`). In a test
  // nothing beneath draws it, so the mount rejects: the plugin drew nothing.
  const mounted = $.ui
    .mount({ plugin: 'tpl-panel', surface: 'terminal', component: 'AbovePrompt', props: BAND_PROPS })
    .then(() => 'drawn', (error: Error) => String(error.message))
  expect(await mounted).toMatch(/no implementation for ui.render/)
})

test('a bare /tpl-panel opens the pane, a second one closes it', async ($, on) => {
  const engine = stubEngine(on)
  await $.command.run(typed(''))
  expect(engine.panes.has('tpl-panel')).toBe(true)

  const closed = await $.command.run(typed(''))
  expect(closed.text).toMatch(/closed/)
  expect(engine.panes.has('tpl-panel')).toBe(false)
})

test('the pane\'s clear button empties the list', async ($, on) => {
  stubEngine(on)
  const pane = await $.ui.mount({ plugin: 'tpl-panel', surface: 'terminal', component: 'Pane', requestId: 'tpl-panel', props: PANE_PROPS })
  await pane.press({ key: 'clear' })
  expect(await pane.find({ type: 'Text', text: /No tool calls yet/ })).toBeDefined()
})
