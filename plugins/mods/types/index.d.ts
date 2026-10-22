export type ModState = 'on' | 'off'

export type ModRow = {
  name: string
  description: string
  version: string
  folder: string
  /** Lives in the mods home (else a session-only dev folder). */
  isHome: boolean
  /** Has commands registered in this session. */
  isLoaded: boolean
  /** Listed in CLAUDE_CODE_PLUGIN_DIRS of the user settings. */
  isAtStartup: boolean
  commands: string[]
  /** Last on/off seen through its command; unknown when never seen. */
  state: ModState | 'unknown'
  hasReadme: boolean
}

declare module 'claude-code' {
  interface PluginState {
    mods: { rows: ModRow[]; modsHome: string; notice: string; isOff: boolean; selected: number }
  }
}
