import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { TplPollerSnapshot } from '../types'
import { changesBetween, countLines, parseToggle, statusText } from './logic'

const NAME = 'tpl-poller'
const OFF_KEY = 'isOff'
const POLL_MS = 30_000
const MIN_GAP_MS = 10_000
const snapshot = atom({ plugin: 'tpl-poller', key: 'snapshot' } as const, null)
const isOff = atom({ plugin: 'tpl-poller', key: 'isOff' } as const, false)

// Module values reset on a hot reload; anything a drawing or a toast decision
// needs across reloads lives in $.state (session) or $.store (across sessions).
// A refresh asked for while one runs joins it instead of being dropped, so a
// "check now" during a background poll still waits for a fresh result.
let inFlight: Promise<void> | null = null
let lastRefresh = 0

// `$` may only be handed to functions declared at the top of the module.
async function git($: EngineInterface, args: string[]) {
  const ran = await $.process.run(['git', ...args], { cwd: await $.session.cwd(), timeoutMs: 10_000 })
  return { ok: ran.exitCode === 0, out: ran.stdout }
}

async function readSnapshot($: EngineInterface): Promise<TplPollerSnapshot | null> {
  const branch = await git($, ['rev-parse', '--abbrev-ref', 'HEAD'])
  if (!branch.ok) return null
  const [status, unpushed] = await Promise.all([
    git($, ['status', '--porcelain']),
    git($, ['rev-list', '--count', '@{u}..HEAD']),
  ])
  return {
    branch: branch.out.trim(),
    dirty: countLines(status.out),
    unpushed: unpushed.ok ? Number(unpushed.out.trim()) : null,
  }
}

async function refresh($: EngineInterface): Promise<void> {
  if (inFlight) return inFlight
  if (await read($, isOff)) return
  inFlight = poll($).finally(() => {
    inFlight = null
  })
  return inFlight
}

async function poll($: EngineInterface) {
  try {
    lastRefresh = await $.clock.now()
    const before = await read($, snapshot)
    const after = await readSnapshot($)
    if (after === null) return $.ui.status(undefined)
    for (const change of changesBetween(before, after)) $.ui.toast(change)
    await update($, snapshot, () => after)
    $.ui.status(statusText(after))
  } catch {
    $.ui.status(undefined)
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'tpl-poller',
      description: `Working-tree status line. /${NAME} toggles it, /${NAME} off hides it, /${NAME} on shows it again`,
      argumentHint: '[on|off]',
    })
    const wasOff = (await $.store.get(OFF_KEY)) === true
    await update($, isOff, () => wasOff)
    // Timers started here run until the module reloads; never start one per turn.
    $.clock.every(POLL_MS, () => void refresh($))
    void refresh($)
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (e.agentId === undefined && (await $.clock.now()) - lastRefresh > MIN_GAP_MS) void refresh($)
    return result
  })

  on('command.run', { command: 'tpl-poller' }, async ($, e) => {
    const toggle = parseToggle(e.args)
    if (toggle === 'invalid') return { text: `Use /${NAME} (toggles), /${NAME} on or /${NAME} off.` }
    // No pane: a bare command toggles the status line, the mod's one surface.
    const value = toggle === 'show' ? !(await read($, isOff)) : toggle === 'off'
    await $.store.set(OFF_KEY, value)
    await update($, isOff, () => value)
    if (value) $.ui.status(undefined)
    else void refresh($)
    return { text: value ? `${NAME} off (also in new sessions). /${NAME} on to bring it back.` : `${NAME} on.` }
  })
}
