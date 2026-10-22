import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import { addCall, bandText, markDone, paneAction, parseToggle } from './logic'

const NAME = 'tpl-panel'
const PANE = 'tpl-panel'
const OFF_KEY = 'isOff'
const calls = atom({ plugin: 'tpl-panel', key: 'calls' } as const, [])
const turn = atom({ plugin: 'tpl-panel', key: 'turn' } as const, 0)
const isOff = atom({ plugin: 'tpl-panel', key: 'isOff' } as const, false)

// A status pane: Esc closes it once the person has given it the keyboard (ctrl+x tab).
// A pane the person acts in (a picker, a manager) also passes `focus: true`, and
// calls this again after any `$.command.run`, which hands the keys to the prompt.
async function openPane($: EngineInterface) {
  return $.ui.open({ id: PANE, title: 'Tool calls', closeOnEscape: true })
}

async function setOff($: EngineInterface, value: boolean) {
  await $.store.set(OFF_KEY, value)
  await update($, isOff, () => value)
  if (value) await $.ui.close({ id: PANE })
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'tpl-panel',
      description: `Tool-call band and pane. /${NAME} opens or closes the pane, /${NAME} off hides both, /${NAME} on brings them back`,
      argumentHint: '[on|off]',
    })
    const wasOff = (await $.store.get(OFF_KEY)) === true
    await update($, isOff, () => wasOff)
    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    await update($, turn, n => n + 1)
    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    if (e.agentId !== undefined || (await read($, isOff))) return next(e)
    const id = e.tool_use_id ?? `${Date.now()}`
    const currentTurn = await read($, turn)
    await update($, calls, list => addCall(list, { id, tool: String(e.tool), isDone: false, turn: currentTurn }))
    const ran = await next(e)
    await update($, calls, list => markDone(list, id))
    return ran
  })

  on('command.run', { command: 'tpl-panel' }, async ($, e) => {
    const toggle = parseToggle(e.args)
    if (toggle === 'invalid') return { text: `Use /${NAME}, /${NAME} on or /${NAME} off.` }
    if (toggle === 'off') {
      await setOff($, true)
      return { text: `${NAME} off: band hidden, pane closed (also in new sessions). /${NAME} on to bring it back.` }
    }
    if (toggle === 'on') await setOff($, false)
    if (await read($, isOff)) return { text: `${NAME} is off. /${NAME} on first.` }
    // A bare command toggles the pane: the way out is the way in.
    if (toggle === 'show' && paneAction(await $.ui.panes(), PANE) === 'close') {
      await $.ui.close({ id: PANE })
      return { text: `Pane closed. /${NAME} opens it again.` }
    }
    await openPane($)
    return { text: toggle === 'on' ? `${NAME} on.` : 'Pane opened.' }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || (await read($, isOff))) return next(e)
    const text = bandText(await read($, calls), await read($, turn))
    if (text === null) return next(e)

    const { Box, Button, Text } = $.ui.resolve(e)
    return (
      <Box flexDirection="row">
        <Text dimColor wrap="truncate">
          {text}{' '}
        </Text>
        <Button key="open" label="Open" plain hotkey="o" onPress={() => void openPane($)} />
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Button, Text } = $.ui.resolve(e)
    const list = await read($, calls)
    const room = Math.max(1, (e.viewport?.rows ?? 24) - 5)

    return (
      <Box flexDirection="column">
        <Box gap={1}>
          {/* Every Button gets a hotkey: the main screen has no pointer, so a Button without one is unreachable. */}
          <Button key="clear" label="clear" plain hotkey="c" onPress={() => void update($, calls, () => [])} />
          <Text dimColor>· ctrl+x tab focuses · esc closes</Text>
        </Box>
        {list.length === 0 && <Text dimColor>No tool calls yet.</Text>}
        {list.slice(-room).map(call => (
          <Text wrap="truncate" dimColor={call.isDone}>
            <Text color={call.isDone ? 'success' : 'warning'}>{call.isDone ? '✓' : '…'} </Text>
            {call.tool}
          </Text>
        ))}
      </Box>
    )
  })
}
