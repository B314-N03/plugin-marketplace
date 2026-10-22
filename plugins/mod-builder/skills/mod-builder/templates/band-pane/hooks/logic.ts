import type { TplPanelCall } from '../types'

export const KEEP = 200

export const addCall = (list: readonly TplPanelCall[], call: TplPanelCall) => [...list, call].slice(-KEEP)

export const markDone = (list: readonly TplPanelCall[], id: string) =>
  list.map(call => (call.id === id ? { ...call, isDone: true } : call))

export const bandText = (list: readonly TplPanelCall[], turn: number) => {
  const thisTurn = list.filter(call => call.turn === turn)
  if (thisTurn.length === 0) return null
  const running = thisTurn.filter(call => !call.isDone).length
  const last = thisTurn[thisTurn.length - 1]!.tool
  return `${thisTurn.length} tool calls this turn${running > 0 ? ` · ${running} running` : ''} · last: ${last}`
}

export type Toggle = 'on' | 'off' | 'show' | 'invalid'

export const parseToggle = (args: string): Toggle => {
  const arg = args.trim().toLowerCase()
  if (arg === '') return 'show'
  return arg === 'on' || arg === 'off' ? arg : 'invalid'
}

/** What a bare `/<mod>` does to its pane: closes it while the person is looking at it, else opens it (or brings it to the front). */
export const paneAction = (panes: readonly { id: string; isShown: boolean }[], id: string): 'open' | 'close' =>
  panes.some(pane => pane.id === id && pane.isShown) ? 'close' : 'open'
