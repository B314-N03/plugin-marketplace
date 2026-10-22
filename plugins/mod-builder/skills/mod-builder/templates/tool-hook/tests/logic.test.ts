import { expect, test } from 'claude-code/testing'

import { protectedReason, shortCommand } from '../hooks/logic'

test('env files and lockfiles are protected, ordinary files are not', () => {
  expect(protectedReason('/repo/.env')).not.toBe(null)
  expect(protectedReason('/repo/.env.local')).not.toBe(null)
  expect(protectedReason('/repo/frontend/package-lock.json')).not.toBe(null)
  expect(protectedReason('/repo/src/env.ts')).toBe(null)
  expect(protectedReason('/repo/.envrc-notes.md')).toBe(null)
})

test('long commands are cut to their first line', () => {
  expect(shortCommand('npm test\nmore')).toBe('npm test')
  expect(shortCommand('x'.repeat(50), 10)).toBe('xxxxxxxxx…')
})
