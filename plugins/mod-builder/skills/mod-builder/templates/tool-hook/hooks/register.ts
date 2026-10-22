import type { Register } from 'claude-code'

import { parseToggle, protectedReason, shortCommand } from './logic'

const NAME = 'tpl-guard'
const OFF_KEY = 'isOff'

// A guard decides from `e` and module values alone: its `.catch` may run as a
// re-entry, where `$` calls reject. session.start re-hydrates this on reload.
let isOff = false

const judge = (path: string) => (isOff ? null : protectedReason(path))

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'tpl-guard',
      description: `Protected-file guard. /${NAME} off disables it, /${NAME} on enables it again`,
      argumentHint: '[on|off]',
    })
    isOff = (await $.store.get(OFF_KEY)) === true
    return next(e)
  })

  // Guards: judge before next, refuse when the hook itself fails (fail closed).
  on('tool.call', { tool: 'Edit' }, ($, e, next) => {
    const reason = judge(e.file_path)
    return reason ? { deny: `${NAME}: ${reason}` } : next(e)
  }).catch(($, e, next) => (next.called ? next(e) : { deny: `${NAME}: the guard failed, so the edit was refused` }))

  on('tool.call', { tool: 'Write' }, ($, e, next) => {
    const reason = judge(e.file_path)
    return reason ? { deny: `${NAME}: ${reason}` } : next(e)
  }).catch(($, e, next) => (next.called ? next(e) : { deny: `${NAME}: the guard failed, so the write was refused` }))

  // Observer: acts on the result and never blocks (a throw just skips it).
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const ran = await next(e)
    if (!isOff && ran.deny === undefined && ran.isError === true) $.ui.toast(`failed: ${shortCommand(e.command)}`)
    return ran
  })

  on('command.run', { command: 'tpl-guard' }, async ($, e) => {
    const toggle = parseToggle(e.args)
    if (toggle === 'invalid') return { text: `Use /${NAME}, /${NAME} on or /${NAME} off.` }
    // A guard never switches off by a bare command: dropping a safety rule takes an explicit `off`.
    if (toggle === 'show') return { text: `${NAME} is ${isOff ? 'off' : 'on'}.` }
    isOff = toggle === 'off'
    await $.store.set(OFF_KEY, isOff)
    return { text: isOff ? `${NAME} off (also in new sessions). /${NAME} on to re-enable.` : `${NAME} on.` }
  })
}
