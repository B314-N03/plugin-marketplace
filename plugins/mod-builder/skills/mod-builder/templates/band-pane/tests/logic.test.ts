import { expect, test } from 'claude-code/testing'

import { addCall, bandText, KEEP, markDone, paneAction } from '../hooks/logic'

const call = (id: string, turn = 1, tool = 'Read') => ({ id, tool, isDone: false, turn })

test('the list keeps only the newest calls', () => {
  let list = [call('0')]
  for (let i = 1; i <= KEEP; i++) list = addCall(list, call(String(i)))
  expect(list.length).toBe(KEEP)
  expect(list[0]!.id).toBe('1')
})

test('the band counts this turn only and names running calls', () => {
  const list = markDone([call('a', 1), call('b', 2, 'Bash'), call('c', 2, 'Edit')], 'b')
  expect(bandText(list, 2)).toBe('2 tool calls this turn · 1 running · last: Edit')
  expect(bandText(list, 3)).toBe(null)
})

test('paneAction closes only a pane the person is looking at', () => {
  expect(paneAction([], 'tpl-panel')).toBe('open')
  expect(paneAction([{ id: 'tpl-panel', isShown: true }], 'tpl-panel')).toBe('close')
  expect(paneAction([{ id: 'tpl-panel', isShown: false }], 'tpl-panel')).toBe('open')
})
