export type TplPanelCall = { id: string; tool: string; isDone: boolean; turn: number }

declare module 'claude-code' {
  interface PluginState {
    'tpl-panel': { calls: TplPanelCall[]; turn: number; isOff: boolean }
  }
}
