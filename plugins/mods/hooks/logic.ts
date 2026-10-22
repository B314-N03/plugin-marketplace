import type { ModRow, ModState } from '../types'

export const SELF = 'mods'

export type Manifest = { name: string; description: string; version: string }
export type FoundMod = { manifest: Manifest; folder: string; hasReadme: boolean }
export type PluginCommand = { name: string; plugin: string }

const asText = (value: unknown) => (typeof value === 'string' ? value : '')

export const parseManifest = (text: string): Manifest | null => {
  try {
    const json = JSON.parse(text)
    const name = asText(json?.name)
    if (name === '') return null
    return { name, description: asText(json.description), version: asText(json.version) }
  } catch {
    return null
  }
}

export const trimSlash = (path: string) => path.replace(/\/+$/, '')

export const splitDirs = (value: string | undefined) =>
  (value ?? '')
    .split(':')
    .map(dir => trimSlash(dir.trim()))
    .filter(dir => dir !== '')

export const dirsFromSettings = (text: string): string[] => {
  try {
    return splitDirs(asText(JSON.parse(text)?.env?.CLAUDE_CODE_PLUGIN_DIRS))
  } catch {
    return []
  }
}

/** Adds or removes `dir` in env.CLAUDE_CODE_PLUGIN_DIRS, leaving every other setting as it was. Throws on unreadable settings. */
export const withPluginDir = (text: string, dir: string, shouldLoad: boolean): string => {
  const settings = text.trim() === '' ? {} : JSON.parse(text)
  if (typeof settings !== 'object' || settings === null || Array.isArray(settings)) {
    throw new Error('settings.json is not a JSON object')
  }
  const env = typeof settings.env === 'object' && settings.env !== null ? { ...settings.env } : {}
  const target = trimSlash(dir)
  const others = splitDirs(asText(env.CLAUDE_CODE_PLUGIN_DIRS)).filter(entry => entry !== target)
  const dirs = shouldLoad ? [...others, target] : others
  if (dirs.length === 0) delete env.CLAUDE_CODE_PLUGIN_DIRS
  else env.CLAUDE_CODE_PLUGIN_DIRS = dirs.join(':')
  return `${JSON.stringify({ ...settings, env }, null, 2)}\n`
}

export const buildRows = (input: {
  homeMods: readonly FoundMod[]
  strayMods: readonly FoundMod[]
  startupDirs: readonly string[]
  commands: readonly PluginCommand[]
  states: Readonly<Record<string, ModState>>
}): ModRow[] => {
  const homeNames = new Set(input.homeMods.map(mod => mod.manifest.name))
  const strays = input.strayMods.filter(
    (mod, index, all) =>
      !homeNames.has(mod.manifest.name) && all.findIndex(other => other.manifest.name === mod.manifest.name) === index,
  )
  const toRow = (mod: FoundMod, isHome: boolean): ModRow => {
    const commands = input.commands.filter(command => command.plugin === mod.manifest.name).map(command => command.name)
    return {
      ...mod.manifest,
      folder: mod.folder,
      hasReadme: mod.hasReadme,
      isHome,
      isLoaded: commands.length > 0,
      isAtStartup: input.startupDirs.includes(trimSlash(mod.folder)),
      commands,
      state: input.states[mod.manifest.name] ?? 'unknown',
    }
  }
  const byName = (a: ModRow, b: ModRow) => a.name.localeCompare(b.name)
  return [...input.homeMods.map(mod => toRow(mod, true)).sort(byName), ...strays.map(mod => toRow(mod, false)).sort(byName)]
}

/** The command that switches a mod: the one named after it, else its first. */
export const switchCommand = (row: Pick<ModRow, 'name' | 'commands'>) =>
  row.commands.includes(row.name) ? row.name : row.commands[0]

/** on/off when a command's arguments switch it, else null. */
export const parseStateArg = (args: string): ModState | null => {
  const first = args.trim().toLowerCase().split(/\s+/)[0]
  return first === 'on' || first === 'off' ? first : null
}

export const stateLabel = (row: ModRow) => {
  if (!row.isLoaded) return 'not loaded'
  return row.state === 'unknown' ? 'loaded' : row.state
}

export const startupLabel = (row: ModRow) => {
  if (!row.isHome) return 'session folder only'
  return row.isAtStartup ? 'loads at start' : 'not loaded at start'
}

export const listText = (rows: readonly ModRow[], modsHome: string) => {
  if (rows.length === 0) return `No mods found in ${modsHome} or session folders.`
  const lines = rows.map(row => {
    const commands = row.commands.length > 0 ? ` (${row.commands.map(name => `/${name}`).join(' ')})` : ''
    return `- ${row.name}${commands}: ${stateLabel(row)}, ${startupLabel(row)}\n  ${row.description || 'no description'}\n  ${row.folder}`
  })
  return [`Mods in ${modsHome}:`, ...lines].join('\n')
}

/** The digit that picks the mod at `index` in the pane: 1-9, then none. */
export const pickHotkey = (index: number) => (index < 9 ? String(index + 1) : undefined)

/** Keeps the picked row inside the list; the first row when nothing is left to pick. */
export const clampIndex = (index: number, length: number) => Math.max(0, Math.min(index, length - 1))

/** Body rows the pane asks for: a header, two lines per mod, the action bar. */
export const paneRows = (count: number) => Math.min(40, 6 + count * 2)

export type Toggle = 'on' | 'off' | 'show' | 'list' | 'invalid'

export const parseToggle = (args: string): Toggle => {
  const arg = args.trim().toLowerCase()
  if (arg === '') return 'show'
  return arg === 'on' || arg === 'off' || arg === 'list' ? arg : 'invalid'
}

/** What a bare `/<mod>` does to its pane: closes it while the person is looking at it, else opens it (or brings it to the front). */
export const paneAction = (panes: readonly { id: string; isShown: boolean }[], id: string): 'open' | 'close' =>
  panes.some(pane => pane.id === id && pane.isShown) ? 'close' : 'open'
