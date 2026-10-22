export type TplStatusToggle = boolean

declare module 'claude-code' {
  interface PluginState {
    'tpl-status': { isOff: TplStatusToggle }
  }
}
