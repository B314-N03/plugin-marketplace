# Mod conventions

Rules that hold for every mod this skill builds. Each one exists because breaking it
cost a failed validation, a mod the person could not turn off, or a check that passed
without checking anything. The API itself is early access: the types file that the
`plugin-authoring` skill names is the authority, and this file only records how to use it.

## Module shape

- **`$` goes only to top-level functions.** Pass `$` to an `async function name($)`
  declared at the top of the module (or a top-level `const` bound to one). A helper
  defined inside `register`'s closure that takes `$` fails validation.
- **Pure logic lives in `hooks/logic.ts`.** No `$`, no I/O: parsing, formatting, change
  detection, toggle parsing. `register.ts(x)` stays thin wiring. Tests import `logic.ts`.
- **Name the command literally.** `$.command.register({ name: 'my-mod' })` and
  `on('command.run', { command: 'my-mod' }, …)` with the literal string, not a constant,
  or the validator lists the hook as a gate instead of "answers its own command".
- **Never take a built-in's name.** A command that matches a built-in or one of its
  aliases is refused at `session.start` (`"/cost" refused: it is the built-in /usage`), and
  the whole `session.start` hook fails with it. Prefer the mod's own name (`/cost-meter`).
- **One mod cannot reach into another.** `$.store` and `$.state` are per plugin. To switch
  another mod, run its command (`$.command.run({ command, args: 'off' })`); to learn its
  state, observe its commands with a `command.run` hook that `await next(e)`s first.
- **Types contract exports types only.** `types/index.d.ts` declares every `$.state` key
  under `interface PluginState { '<mod>': { … } }` and exports at least one type.
  `export {}` is refused. A mod with no `$.state` needs no contract and no `"types"` field.
- **Where state lives:** a value a render reads → `$.state` (via `atom`, `read`, `update`);
  a value that must survive across sessions → `$.store`; a module `let` → only for
  values a hot reload may lose (in-flight flags, timestamps) and for guards (below).
  `session.start` runs again on every reload, so re-hydrate from `$.store` there.

## The off switch (every mod)

- `/<mod>` with `on` / `off` / nothing / anything else, parsed by `parseToggle`
  in `logic.ts`; an unknown argument answers with usage. **Never ignore `e.args`:** a
  `/<mod> off` that silently does the default action leaves the person with no way out.
- **The bare command toggles; the way out is the way in.** A person who opened something
  with `/<mod>` expects `/<mod>` to close it, not to look up `off`:
  - mod with a pane: a bare `/<mod>` closes the pane while it is shown, else opens it
    (`paneAction(await $.ui.panes(), PANE)` in `logic.ts`; `$.ui.panes()` is the engine's
    record, so it survives a reload). It never changes on/off; while off it answers
    "`/<mod> on` first".
  - mod with no pane (status line, band only): a bare `/<mod>` toggles on/off.
  - guard (`tool.call` / `prompt.submit` deny or rewrite): a bare `/<mod>` only reports the
    state. Dropping a safety rule takes an explicit `off`.
- Off is stored in `$.store` under `isOff`, mirrored into `$.state` for renders, and:
  status line cleared (`$.ui.status(undefined)`), band hook returns `next(e)`, pane
  closed (`$.ui.close`), timers skip their work, guards pass everything through.
- Off is remembered across sessions; say so in the command's answer.

## Surfaces

- **Status line** — one per plugin; short; `undefined` removes it. Prefer it for text-only mods.
- **Toast** — for a change the person should notice now. Fire on **transitions** only, and
  never for the first snapshot of a session (no "CI green" spam on every start).
- **Band above the prompt** — one line, `wrap="truncate"`; return `next(e)` when there is
  nothing to show or `e.props.hasSurvey`. Size to `e.props.bodyColumns`.
- **Pane** — opened by its command (asked: placed at any width). Opened unasked it is placed
  only from 144 columns (110 once asked before) and otherwise waits undrawn, so auto-open
  only when the mod is clearly relevant (e.g. on a branch with an open PR), never always.
  Size it with `rows` from the content (`paneRows(count)` in `logic.ts`), capped.
- **Elements** come from `$.ui.resolve(e)`; text styling is nested `<Text>`; every `Button`
  has a `key`; colors use theme keys (`success`, `warning`, `error`, `suggestion`) so they
  follow the person's theme. A tree that does not validate is replaced by the engine's own:
  check the transcript's dim `refused:` line.

## Keyboard (every band and pane)

The main, non-fullscreen screen has **no pointer**. A control that works only by click
works only in fullscreen, and a pane that cannot take the keyboard cannot be used at all.

- **Every `Button` gets a `hotkey`**, shown in its label (`plain` draws `r: refresh`). A
  hotkey fires only while the plugin's site (its band or pane) holds the keyboard, never
  while the person types in the prompt, so letters are safe. Avoid bare digits on a
  band: a digit typed into an empty prompt presses a band Button.
- **Lists:** pick a row with `1`–`9` (`pickHotkey(index)` → `'1'…'9'`, then none), keep the
  picked index in `$.state` (`clampIndex` on every render, as the list can shrink), mark it
  with `›`, and draw the actions for the picked row below the list with their own letters.
- **Interactive pane** (the person acts in it: a picker, a manager): open it with
  `$.ui.open({ id, title, focus: true, closeOnEscape: true, rows })`, so it takes the keys
  at once and Esc closes it. Put the keys in its header: `1-9 pick · ctrl+x tab refocuses
  · esc closes`.
- **`$.command.run` hands the keyboard to the prompt.** A pane action that runs a command
  (switching another mod, say) must reopen its own pane with `focus: true` afterwards,
  through the same `openPane($)` helper, or every key after the first press is lost and
  only clicks still work. Test it: assert a second `ui.open` with `focus: true`.
- **Status pane** (the person reads it): no `focus`, so opening it never steals the
  prompt; still `closeOnEscape: true` and hotkeys, for a person who tabs in with ctrl+x tab.
- The `mods` plugin in this skill's marketplace is the full worked example of an
  interactive pane: digit picking, refocus after a command, a UI test for each.

## Background work (pollers)

- Start timers once, in `session.start` (`$.clock.every`); they end on reload. Never start
  one per turn.
- A refresh asked for while one runs **joins** it (`if (inFlight) return inFlight`), never
  returns early: a dropped request makes "Check now" during a background poll a silent
  no-op. Refresh after `turn.complete` only if the last refresh is older than a minimum
  gap, and only for the main loop (`e.agentId === undefined`).
- `$.process.run(argv, { cwd, timeoutMs })`: argv, no shell, no globbing; the person's
  shell hooks and aliases do not apply. Parse stdout even on a non-zero exit when the tool
  uses exit codes for state (e.g. a "checks pending" exit, `lsof` exiting 1 with output).
- `$.http.fetch` has **no timeout**: race it against the clock, or one hanging endpoint
  stalls every refresh behind it:
  `await Promise.race([$.http.fetch(url), $.clock.sleep(10_000).then(() => null)])`, where
  `null` means timed out. Send `accept: application/json` to health endpoints.
- Debounce alerts on flaky signals (network checks): require N failures in a row before a
  state change, so one blip never toasts.
- Poll at the rate the data actually changes (git: 15–30 s; CI / GitHub API: ≥ 60 s,
  mind API rate limits). Say the cost in the README.
- A failing poll keeps the last good snapshot and records the error; it never throws out
  of the timer.

## Tool and prompt hooks

- **Guards** (deny or rewrite): judge before calling `next`, and register with
  `.catch(($, e, next) => next.called ? next(e) : { deny: '<why>' })` so a failing guard
  refuses instead of letting the call through. Decide from `e` and module values only:
  the `.catch` may run as a re-entry where `$` calls reject.
- **Observers** (react to results): `await next(e)` and return its result unchanged; no
  `.catch` needed, a throw just skips the hook. The validator still lists them as
  "gating hook without .catch"; that is a fact, not a failure.
- Deny messages start with the mod's name and say how to proceed.

## Verification

- `scripts/check.sh <mod> <types-file>` must print `== PASS`: validate, type-check, test.
  It counts the mod files tsc checked, because a misconfigured tsc passes on zero files.
- At least one `*.test.ts` per mod, importing `test`, `expect` from `claude-code/testing`.
  The kit's `expect` has no `toBeCloseTo`: round instead.
- For a guard, test **through the engine**: register a stub tool beneath the plugin with
  `on('tool.call', () => ({ isError: true as const, result: null, text: 'stub' }))`, then
  `await $.tool.call({ tool: 'Edit', … })` and assert `'deny' in result` and that the stub
  did not run. Then break the rule on a **copy** of the mod and confirm the test fails.
- A mod that draws a **band or pane** gets a UI test that mounts it on the terminal surface
  (`$.ui.mount({ plugin, surface: 'terminal', component: 'Pane', requestId, props })`) and
  asserts with `find({ type: 'Text', text: /…/ })` / `find({ type: 'Button', key })`. A tree
  the surface would refuse fails the mount, which no logic test can catch. When a find
  misses, dump `await mounted.drawn()` with `console.log` before guessing. The `band-pane`
  template's `tests/ui.test.tsx` has the full prop sets for `Pane` and `AbovePrompt`.
- A site the plugin hands back to the engine (`next(e)`, e.g. the band while off) has
  nothing beneath it in a test, so the mount **rejects** with
  `no implementation for ui.render`: assert that rejection to prove the plugin drew nothing.
- Engine I/O the plugin calls (`$.store`, `$.clock`, `$.http`, `$.ui.status`, `$.ui.close`)
  is stubbed with `on('<noun>.<method>', …)` beneath the plugin, and every stub answers
  **`{ value }`**. A bare value is "not a result object", and `{ value: undefined }` from a
  getter is "no result": return `null` for a missing store key. A hook that calls an
  unstubbed noun is skipped, and the test sees `no implementation for <noun>.<method>`
  (e.g. `session.model` from a status-line refresh): stub exactly the one it names.
- **The bare-command toggle needs a pane record:** stub `ui.open`, `ui.close` and
  `ui.panes` over one shared `Set` of ids, then run the bare command twice and assert
  the pane is gone and the answer says "closed".
- `$.command.run` in a test takes the engine's full input: add
  `origin: { kind: 'composer' }` and `presentation: { isFullscreen: true, columns: 120 }`
  (a `typed(args)` helper keeps tests short).
- The mod's lib declares no timers. A test that needs one declares it:
  `declare const setTimeout: (callback: () => void, ms: number) => unknown`.
- **Static imports only in tests.** A dynamic `await import()` makes the test file fail to
  load. Inline `$.ui.mount(...)` in each test; a helper typed through
  `Parameters<typeof test>` does not type-check.
- What tests cannot show — layout, colors, placement — the person checks live after the
  hot reload. Do not claim a surface "looks right" without that.
