# Diff authoring — how to write a hardening change

A proposal is only useful if the change is safe, grounded, and lands in the right place with the
right tone. Rules for drafting the actual text.

## Principles

- **Grounded, not speculative.** Every rule must trace to observed evidence in the report. If you
  can't point to the sessions that motivated it, don't propose it.
- **Add the minimum.** Prefer one sharp sentence over a paragraph. Instruction files are read
  every turn — bloat has a real cost. Reword or tighten an existing rule before adding a new one.
- **Match the host file.** Mirror the existing heading structure, list style, and voice of the
  target `CLAUDE.md`. A global file that speaks in imperative bullets gets an imperative bullet.
- **Fix the class, not the instance.** "Don't `cd` into the my-app backend worktree" is worthless;
  "Never bare-`cd` into a package dir — use `npm --prefix`/`git -C`" fixes every recurrence.
- **Prefer a hook when the agent should be _stopped_.** Prose can be ignored; a `pre-commit` /
  `pre-push` / `UserPromptSubmit` gate cannot. Escalate risky_git and repeated-rejection signals
  to a hook when prose clearly hasn't held.

## Wording pattern

State the rule, then the _why_ in the same breath so it survives future edits:

> Before any `git push`, verify you're on a feature branch (not `main`/`master`) and that the
> `gh` credential helper is used — pushes to `main` and keychain-auth failures were the two most
> common push retries.

Bad (no why, easy to delete later): "Don't push to main."

## Placement

- Global `~/.claude/CLAUDE.md` — put the rule under the most relevant existing heading (Git
  Practices, Workflow Preferences, …). Don't invent a new top-level section for one rule.
- Project `CLAUDE.md` — same, and respect that repo's conventions doc if it has one.
- If the file uses `@import`ed sub-files (e.g. a `RTK.md`, a practices dir), add the rule where
  it topically belongs, not always the root file.

## Safety before writing

- **Read the target region first** if a formatter may have touched it. For a project-repo file
  (inside the cwd) use `Edit` with a unique `old_string`; for a home-dir file under
  `~/.claude/` the Edit/Write tools are containment-blocked, so apply it via a shell heredoc
  `str.replace` (count-equals-one) instead — see the skill's APPLY section.
- **Never commit on the user's behalf** as part of applying — edit the file and let the user
  commit, especially in repos that forbid commits on `main` or require a ticket branch. Surface
  that requirement; don't route around it.
- **One change at a time**, confirm each. If the user edits your wording, use theirs verbatim.
- After writing, state exactly what changed and in which file so the user can eyeball it.

## When a hook is the right output

Sketch it, don't force it in. Show the user what the hook would do (which event, what it blocks,
the message it prints) and let them approve before you create/modify anything under `.claude/`.
A good gate is soft where possible (warn + inject context) and hard only for genuinely
irreversible actions (push/force-push to `main`).
