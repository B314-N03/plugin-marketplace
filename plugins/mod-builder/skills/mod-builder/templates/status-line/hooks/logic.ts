// Pure logic: no `$`, no I/O. Everything here is unit-tested.

export const SLOW_TURN_MS = 120_000

export const formatDuration = (ms: number) => {
  const seconds = Math.round(ms / 1000)
  return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

export const statusText = (durationMs: number, toolCalls: number) =>
  `last turn ${formatDuration(durationMs)} · ${toolCalls} tool call${toolCalls === 1 ? '' : 's'}`

export const isSlow = (durationMs: number) => durationMs >= SLOW_TURN_MS

export type Toggle = 'on' | 'off' | 'show' | 'invalid'

export const parseToggle = (args: string): Toggle => {
  const arg = args.trim().toLowerCase()
  if (arg === '') return 'show'
  return arg === 'on' || arg === 'off' ? arg : 'invalid'
}
