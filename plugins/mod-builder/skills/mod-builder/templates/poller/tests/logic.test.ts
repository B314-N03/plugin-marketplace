import { expect, test } from 'claude-code/testing'

import { changesBetween, countLines, statusText } from '../hooks/logic'

const snap = (dirty: number, unpushed: number | null, branch = 'feat-x') => ({ dirty, unpushed, branch })

test('porcelain output counts one file per line', () => {
  expect(countLines('')).toBe(0)
  expect(countLines(' M a.ts\n?? b.ts\n')).toBe(2)
})

test('the status line names what is pending, or says clean', () => {
  expect(statusText(snap(0, 0))).toBe('feat-x · clean')
  expect(statusText(snap(2, 1))).toBe('feat-x · 2 uncommitted · 1 unpushed')
  expect(statusText(snap(0, null))).toBe('feat-x · no upstream')
})

test('toasts fire on transitions, not on the first snapshot or a branch switch', () => {
  expect(changesBetween(null, snap(3, 2))).toEqual([])
  expect(changesBetween(snap(0, 2), snap(1, 0))).toEqual(['feat-x is pushed', 'feat-x has uncommitted changes'])
  expect(changesBetween(snap(0, 2, 'a'), snap(1, 0, 'b'))).toEqual([])
})
