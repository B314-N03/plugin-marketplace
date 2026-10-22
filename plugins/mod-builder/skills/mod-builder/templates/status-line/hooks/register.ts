import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import { formatDuration, isSlow, parseToggle, statusText } from './logic'

const NAME = 'tpl-status'
const OFF_KEY = 'isOff'
const isOff = atom({ plugin: 'tpl-status', key: 'isOff' } as const, false)

let toolCalls = 0

async function setOff($: EngineInterface, value: boolean) {
  await $.store.set(OFF_KEY, value)
  await update($, isOff, () => value)
  if (value) $.ui.status(undefined)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'tpl-status',
      description: `Last-turn status line. /${NAME} toggles it, /${NAME} off hides it, /${NAME} on shows it again`,
      argumentHint: '[on|off]',
    })
    const wasOff = (await $.store.get(OFF_KEY)) === true
    await update($, isOff, () => wasOff)
    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    toolCalls = 0
    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    if (e.agentId === undefined) toolCalls += 1
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (e.agentId !== undefined || (await read($, isOff))) return result
    $.ui.status(statusText(e.durationMs, toolCalls))
    if (isSlow(e.durationMs)) $.ui.toast(`That turn took ${formatDuration(e.durationMs)}`)
    return result
  })

  on('command.run', { command: 'tpl-status' }, async ($, e) => {
    const toggle = parseToggle(e.args)
    if (toggle === 'invalid') return { text: `Use /${NAME} (toggles), /${NAME} on or /${NAME} off.` }
    // No pane: a bare command toggles the status line, the mod's one surface.
    const value = toggle === 'show' ? !(await read($, isOff)) : toggle === 'off'
    await setOff($, value)
    return { text: value ? `${NAME} off (also in new sessions). /${NAME} on to bring it back.` : `${NAME} on.` }
  })
}
