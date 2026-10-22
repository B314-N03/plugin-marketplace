import { expect, test } from 'claude-code/testing'

import {
  buildRows,
  dirsFromSettings,
  paneAction,
  parseManifest,
  parseStateArg,
  pickHotkey,
  clampIndex,
  parseToggle,
  switchCommand,
  withPluginDir,
} from '../hooks/logic'

const mod = (name: string, folder: string) => ({
  manifest: { name, description: `${name} does things`, version: '0.1.0' },
  folder,
  hasReadme: false,
})

test('a manifest needs a name', () => {
  expect(parseManifest('{"name":"a","description":"d"}')).toEqual({ name: 'a', description: 'd', version: '' })
  expect(parseManifest('{"description":"d"}')).toBe(null)
  expect(parseManifest('not json')).toBe(null)
})

test('adding a startup dir keeps every other setting and entry', () => {
  const before = JSON.stringify({ env: { A: '1', CLAUDE_CODE_PLUGIN_DIRS: '/x' }, model: 'opus' }, null, 2)
  const after = JSON.parse(withPluginDir(before, '/m/flow/', true))
  expect(after).toEqual({ env: { A: '1', CLAUDE_CODE_PLUGIN_DIRS: '/x:/m/flow' }, model: 'opus' })
  expect(Object.keys(after)).toEqual(['env', 'model'])
})

test('adding twice lists it once; removing the last entry drops the key', () => {
  const once = withPluginDir('{}', '/m/a', true)
  expect(dirsFromSettings(withPluginDir(once, '/m/a', true))).toEqual(['/m/a'])
  expect(JSON.parse(withPluginDir(once, '/m/a', false))).toEqual({ env: {} })
})

test('unreadable settings are refused, not overwritten', () => {
  expect(() => withPluginDir('{ broken', '/m/a', true)).toThrow()
  expect(() => withPluginDir('[]', '/m/a', true)).toThrow()
})

test('rows: home mods first, session copies of home mods hidden, commands and startup mapped', () => {
  const rows = buildRows({
    homeMods: [mod('pr-flow', '/h/pr-flow'), mod('cost-meter', '/h/cost-meter')],
    strayMods: [mod('cost-meter', '/d/s1/cost-meter'), mod('uptime', '/d/s2/uptime'), mod('uptime', '/d/s3/uptime')],
    startupDirs: ['/h/pr-flow'],
    commands: [
      { name: 'flow', plugin: 'pr-flow' },
      { name: 'cost', plugin: 'cost-meter' },
    ],
    states: { 'cost-meter': 'off' },
  })
  expect(rows.map(row => `${row.name}:${row.isHome}`)).toEqual(['cost-meter:true', 'pr-flow:true', 'uptime:false'])
  expect(rows[1]).toMatchObject({ isLoaded: true, isAtStartup: true, commands: ['flow'], state: 'unknown' })
  expect(rows[0]).toMatchObject({ state: 'off', isAtStartup: false })
  expect(rows[2]).toMatchObject({ isLoaded: false, folder: '/d/s2/uptime' })
})

test('the switch command prefers the one named after the mod', () => {
  expect(switchCommand({ name: 'uptime', commands: ['check', 'uptime'] })).toBe('uptime')
  expect(switchCommand({ name: 'cost-meter', commands: ['cost'] })).toBe('cost')
  expect(switchCommand({ name: 'x', commands: [] })).toBe(undefined)
})

test('arguments parse into on/off and toggles', () => {
  expect(parseStateArg(' OFF ')).toBe('off')
  expect(parseStateArg('on now')).toBe('on')
  expect(parseStateArg('add x')).toBe(null)
  expect(parseToggle('')).toBe('show')
  expect(parseToggle('list')).toBe('list')
  expect(parseToggle('nope')).toBe('invalid')
})

test('rows 1-9 get a digit; the pick stays in the list', () => {
  expect(pickHotkey(0)).toBe('1')
  expect(pickHotkey(8)).toBe('9')
  expect(pickHotkey(9)).toBe(undefined)
  expect(clampIndex(7, 3)).toBe(2)
  expect(clampIndex(0, 0)).toBe(0)
})

test('paneAction closes only a pane the person is looking at', () => {
  expect(paneAction([], 'mods')).toBe('open')
  expect(paneAction([{ id: 'mods', isShown: true }], 'mods')).toBe('close')
  expect(paneAction([{ id: 'mods', isShown: false }], 'mods')).toBe('open')
  expect(paneAction([{ id: 'other', isShown: true }], 'mods')).toBe('open')
})
