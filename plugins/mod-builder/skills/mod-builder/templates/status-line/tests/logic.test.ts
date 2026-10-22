import { expect, test } from 'claude-code/testing'

import { formatDuration, isSlow, parseToggle, statusText } from '../hooks/logic'

test('durations read as seconds, then minutes', () => {
  expect(formatDuration(42_000)).toBe('42s')
  expect(formatDuration(125_000)).toBe('2m 5s')
})

test('the status line pluralises tool calls', () => {
  expect(statusText(3000, 1)).toBe('last turn 3s · 1 tool call')
  expect(statusText(3000, 4)).toBe('last turn 3s · 4 tool calls')
})

test('a slow turn starts at two minutes', () => {
  expect(isSlow(119_999)).toBe(false)
  expect(isSlow(120_000)).toBe(true)
})

test('the toggle accepts on, off and nothing', () => {
  expect(parseToggle(' OFF ')).toBe('off')
  expect(parseToggle('')).toBe('show')
  expect(parseToggle('maybe')).toBe('invalid')
})
