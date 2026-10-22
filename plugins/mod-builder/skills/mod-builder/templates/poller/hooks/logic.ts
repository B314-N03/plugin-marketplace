import type { TplPollerSnapshot } from '../types'

export const countLines = (stdout: string) => (stdout.trim() === '' ? 0 : stdout.trim().split('\n').length)

export const statusText = (snap: TplPollerSnapshot) => {
  const parts = [snap.branch]
  if (snap.dirty > 0) parts.push(`${snap.dirty} uncommitted`)
  if (snap.unpushed === null) parts.push('no upstream')
  else if (snap.unpushed > 0) parts.push(`${snap.unpushed} unpushed`)
  if (parts.length === 1) parts.push('clean')
  return parts.join(' · ')
}

// Toasts fire on transitions only, never for the first snapshot of a session.
export const changesBetween = (before: TplPollerSnapshot | null, after: TplPollerSnapshot) => {
  if (before === null || before.branch !== after.branch) return []
  const changes: string[] = []
  if (before.unpushed !== null && before.unpushed > 0 && after.unpushed === 0) changes.push(`${after.branch} is pushed`)
  if (before.dirty === 0 && after.dirty > 0) changes.push(`${after.branch} has uncommitted changes`)
  return changes
}

export type Toggle = 'on' | 'off' | 'show' | 'invalid'

export const parseToggle = (args: string): Toggle => {
  const arg = args.trim().toLowerCase()
  if (arg === '') return 'show'
  return arg === 'on' || arg === 'off' ? arg : 'invalid'
}
