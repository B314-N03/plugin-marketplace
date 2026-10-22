export type TplPollerSnapshot = { dirty: number; unpushed: number | null; branch: string }

declare module 'claude-code' {
  interface PluginState {
    'tpl-poller': { snapshot: TplPollerSnapshot | null; isOff: boolean }
  }
}
