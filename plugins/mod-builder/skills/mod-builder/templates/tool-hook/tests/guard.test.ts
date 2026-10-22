import { expect, test } from 'claude-code/testing'

// Behaviour through the engine: the test's own tool.call hook stands in for the
// real tool, beneath the plugin, so a call that reaches it was let through.
const stubTool = { isError: true as const, result: null, text: 'stub tool ran' }
test('an edit to .env is refused before the tool runs', async ($, on) => {
  let ranTool = false
  on('tool.call', () => {
    ranTool = true
    return stubTool
  })
  const result = await $.tool.call({ tool: 'Edit', file_path: '/repo/.env', old_string: 'a', new_string: 'b' })
  expect('deny' in result).toBe(true)
  expect(ranTool).toBe(false)
})

test('an edit to an ordinary file goes through', async ($, on) => {
  on('tool.call', () => stubTool)
  const result = await $.tool.call({ tool: 'Edit', file_path: '/repo/src/app.ts', old_string: 'a', new_string: 'b' })
  expect('deny' in result).toBe(false)
})
