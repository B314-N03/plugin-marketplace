import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { ModRow, ModState } from '../types'
import {
  buildRows,
  clampIndex,
  dirsFromSettings,
  listText,
  parseManifest,
  parseStateArg,
  paneAction,
  paneRows,
  parseToggle,
  pickHotkey,
  SELF,
  startupLabel,
  stateLabel,
  switchCommand,
  trimSlash,
  withPluginDir,
} from './logic'
import type { FoundMod } from './logic'

const PANE = 'mods'
const OFF_KEY = 'isOff'
const STATES_KEY = 'states'
const rows = atom({ plugin: 'mods', key: 'rows' } as const, [])
const modsHome = atom({ plugin: 'mods', key: 'modsHome' } as const, '')
const notice = atom({ plugin: 'mods', key: 'notice' } as const, '')
const isOff = atom({ plugin: 'mods', key: 'isOff' } as const, false)
const selected = atom({ plugin: 'mods', key: 'selected' } as const, 0)

async function paths($: EngineInterface) {
  const home = (await $.env.get('HOME')) ?? ''
  const custom = await $.env.get('CLAUDE_MODS_HOME')
  return {
    modsHome: trimSlash(custom || `${home}/claude-mods`),
    settings: `${home}/.claude/settings.json`,
    devMods: `${home}/.claude/dev-mods`,
  }
}

async function childDirs($: EngineInterface, dir: string) {
  const entries = await $.fs.list(dir).catch(() => [])
  return entries.filter(entry => entry.kind === 'dir' && !entry.name.startsWith('.')).map(entry => `${dir}/${entry.name}`)
}

async function readMod($: EngineInterface, folder: string): Promise<FoundMod | null> {
  const text = await $.fs.read(`${folder}/.claude-plugin/plugin.json`).catch(() => null)
  const manifest = typeof text === 'string' ? parseManifest(text) : null
  if (manifest === null) return null
  const hasReadme = await $.fs.exists(`${folder}/README.md`).catch(() => false)
  return { manifest, folder, hasReadme }
}

async function readMods($: EngineInterface, folders: string[]) {
  const found = await Promise.all(folders.map(folder => readMod($, folder)))
  return found.filter((mod): mod is FoundMod => mod !== null)
}

async function readStates($: EngineInterface): Promise<Record<string, ModState>> {
  const stored = await $.store.get(STATES_KEY)
  return typeof stored === 'object' && stored !== null ? (stored as Record<string, ModState>) : {}
}

async function scan($: EngineInterface) {
  const where = await paths($)
  const sessions = await childDirs($, where.devMods)
  const strayFolders = (await Promise.all(sessions.map(session => childDirs($, session)))).flat()
  const settingsText = await $.fs.read(where.settings).catch(() => '')
  const commands = (await $.command.list())
    .filter(command => command.source === 'plugin' && command.plugin !== undefined)
    .map(command => ({ name: command.name, plugin: command.plugin! }))
  const next = buildRows({
    homeMods: await readMods($, await childDirs($, where.modsHome)),
    strayMods: await readMods($, strayFolders),
    startupDirs: dirsFromSettings(typeof settingsText === 'string' ? settingsText : ''),
    commands,
    states: await readStates($),
  })
  await update($, rows, () => next)
  await update($, modsHome, () => where.modsHome)
  return next
}

async function recordState($: EngineInterface, name: string, state: ModState) {
  await $.store.set(STATES_KEY, { ...(await readStates($)), [name]: state })
}

async function say($: EngineInterface, text: string) {
  await update($, notice, () => text)
}

/** Opens the pane with the keyboard, or takes the keys back for an open one: a command it ran hands them to the prompt. */
async function openPane($: EngineInterface, count: number) {
  return $.ui.open({ id: PANE, title: 'Mods', focus: true, closeOnEscape: true, rows: paneRows(count) })
}

async function switchLive($: EngineInterface, row: ModRow, state: ModState) {
  const command = switchCommand(row)
  if (command === undefined) return say($, `${row.name} is not loaded in this session.`)
  await $.command.run({ command, args: state })
  await recordState($, row.name, state)
  await say($, `${row.name} ${state} (via /${command}; remembered in new sessions).`)
  const found = await scan($)
  await openPane($, found.length)
}

async function showMod($: EngineInterface, row: ModRow) {
  const command = switchCommand(row)
  if (command === undefined) return say($, `${row.name} is not loaded in this session.`)
  await $.command.run({ command, args: '' })
}

async function switchStartup($: EngineInterface, row: ModRow, shouldLoad: boolean) {
  const where = await paths($)
  try {
    const text = await $.fs.read(where.settings).catch(() => '')
    await $.fs.write(where.settings, withPluginDir(typeof text === 'string' ? text : '', row.folder, shouldLoad))
    await say($, `${row.name} ${shouldLoad ? 'will load' : 'will no longer load'} in new sessions.`)
  } catch (error) {
    await say($, `Could not update ${where.settings}: ${String(error)}`)
  }
  await scan($)
}

async function setOff($: EngineInterface, value: boolean) {
  await $.store.set(OFF_KEY, value)
  await update($, isOff, () => value)
  if (value) await $.ui.close({ id: PANE })
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'mods',
      description: 'Mod manager. /mods opens the pane, /mods list prints them, /mods off|on switches this manager',
      argumentHint: '[list|on|off]',
    })
    const wasOff = (await $.store.get(OFF_KEY)) === true
    await update($, isOff, () => wasOff)
    return next(e)
  })

  on('command.run', { command: 'mods' }, async ($, e) => {
    const toggle = parseToggle(e.args)
    if (toggle === 'invalid') return { text: 'Use /mods, /mods list, /mods on or /mods off.' }
    if (toggle === 'off') {
      await setOff($, true)
      return { text: 'mods off: pane closed (also in new sessions). /mods on to bring it back.' }
    }
    if (toggle === 'on') await setOff($, false)
    if (await read($, isOff)) return { text: 'mods is off. /mods on to turn it back on.' }
    if (toggle === 'show' && paneAction(await $.ui.panes(), PANE) === 'close') {
      await $.ui.close({ id: PANE })
      return { text: 'Mods pane closed. /mods opens it again.' }
    }
    const found = await scan($)
    if (toggle === 'list') return { text: listText(found, await read($, modsHome)) }
    await say($, '')
    await openPane($, found.length)
    return { text: toggle === 'on' ? 'mods on.' : `${found.length} mods.` }
  })

  // Observer: remembers on/off whenever a mod's command is run with on|off, by whoever.
  on('command.run', async ($, e, next) => {
    const ran = await next(e)
    const state = parseStateArg(e.args)
    if (state === null || e.command === 'mods') return ran
    const owner = (await $.command.list()).find(command => command.name === e.command)?.plugin
    if (owner !== undefined && owner !== SELF) await recordState($, owner, state)
    return ran
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Button, Text } = $.ui.resolve(e)
    const list = await read($, rows)
    const message = await read($, notice)
    const index = clampIndex(await read($, selected), list.length)
    const current = list[index]
    const canAct = current !== undefined && current.name !== SELF
    const isLiveOff = current?.state === 'off'

    return (
      <Box flexDirection="column">
        <Text wrap="truncate">
          <Text bold>{list.length} mods</Text>
          <Text dimColor> · {await read($, modsHome)} · 1-9 pick · ctrl+x tab refocuses · esc closes</Text>
        </Text>
        {message !== '' && <Text color="suggestion">{message}</Text>}
        {list.length === 0 && <Text dimColor>No mods found.</Text>}
        {list.map((row, at) => {
          const isPicked = at === index
          const color = !row.isLoaded ? undefined : row.state === 'off' ? 'warning' : 'success'
          return (
            <Box flexDirection="column">
              <Box gap={1}>
                <Text color={isPicked ? 'suggestion' : undefined}>{isPicked ? '›' : ' '}</Text>
                <Text color={color} dimColor={!row.isLoaded}>
                  ●
                </Text>
                <Button
                  key={`pick-${row.name}`}
                  plain
                  hotkey={pickHotkey(at)}
                  label={row.name}
                  onPress={() => void update($, selected, () => at)}
                />
                <Text dimColor wrap="truncate">
                  {row.commands.map(name => `/${name}`).join(' ')} · {stateLabel(row)} · {startupLabel(row)}
                </Text>
              </Box>
              <Text dimColor wrap="truncate-end">
                {'    '}
                {row.description || 'no description'}
              </Text>
            </Box>
          )
        })}
        <Box gap={2} marginTop={1}>
          {canAct && current.isLoaded && (
            <Button
              key="live"
              plain
              hotkey="t"
              label={isLiveOff ? `turn ${current.name} on` : `turn ${current.name} off`}
              onPress={() => void switchLive($, current, isLiveOff ? 'on' : 'off')}
            />
          )}
          {canAct && current.isLoaded && (
            <Button key="show" plain hotkey="s" label="pane" onPress={() => void showMod($, current)} />
          )}
          {canAct && (
            <Button
              key="startup"
              plain
              hotkey="l"
              label={current.isAtStartup ? "don't load at start" : 'load at start'}
              onPress={() => void switchStartup($, current, !current.isAtStartup)}
            />
          )}
          {current?.name === SELF && <Text dimColor>this pane · /mods off turns it off</Text>}
          <Button key="refresh" plain hotkey="r" label="refresh" dimColor onPress={() => void scan($)} />
        </Box>
      </Box>
    )
  })
}
