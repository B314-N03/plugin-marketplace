---
name: package-scout
description: Analyze a project's dependencies, find outdated packages with changelog research, and suggest useful new packages based on the project's stack. Writes results into a markdown tracking file with tables. Use when the user says "scout packages", "find new packages", "package updates", "what packages should I add", "research dependencies", or "update package notes".
---

# Package Scout

Analyze a project's tech stack, research package updates (with breaking change details), and suggest new packages — then write everything into a structured markdown tracking file.

## Arguments

- `$ARGUMENTS`: Optional path to the target project directory. If omitted, use the current working directory.

## Instructions

### Step 1: Identify the project and tracking file

1. Read `package.json` (or equivalent) from the target project to understand the full dependency list.
2. Determine the tracking file location automatically:
   - Extract the project directory name from the working directory (e.g., `my-app` from `~/Coding/my-app`)
   - The tracking file is at: `<notes-dir>/<project-name>/New Packages & Upgrades.md`, where `<notes-dir>` is `$PACKAGE_SCOUT_NOTES_DIR` if set, else `~/Documents/package-notes`
   - If the file exists, read it to understand the existing table format and avoid duplicating entries.
   - If the file does not exist, create the parent directory and the file with the default table structure (see Step 6).

### Step 2: Understand the project stack

Explore the project to understand its architecture — this determines which new packages are relevant:

- Framework (React, Vue, Svelte, etc.) and version
- Routing solution
- State management approach
- CSS approach (modules, SCSS, Tailwind, etc.)
- Form handling
- Testing setup
- API layer (REST, GraphQL, codegen)
- UI component library
- Notable patterns (tables, charts, i18n, auth)

Use the Explore agent or read key files (vite.config, tsconfig, main entry, router config, a sampling of components).

### Step 3: Find outdated packages

Run the appropriate outdated command for the package manager:

```bash
npm outdated 2>&1
```

Categorize results into:
- **Safe updates**: Within semver range (minor/patch bumps)
- **Major version bumps**: Breaking changes likely, need research

### Step 4: Research major version bumps

For each major version bump, use WebSearch to find:
- Official release announcement / blog post
- Key breaking changes (summarize in 1-2 lines, in German if the tracking file uses German)
- Migration guide URL

Focus on what matters for the specific project. For example, if the project uses flat config ESLint, note that eslintrc removal in ESLint 10 is not a concern.

### Step 5: Suggest new packages

Based on the project analysis from Step 2, suggest packages that would genuinely benefit the project. Consider:

- Gaps in the current tooling (e.g., no className utility, no error boundary, no URL state management)
- Companions to existing libraries (e.g., user-event for testing-library)
- Ecosystem packages that fit the existing stack (e.g., TanStack packages when already using TanStack Router/Query)
- Testing utilities the project could benefit from

Do NOT suggest:
- Packages that replace well-functioning custom solutions unless asked
- Packages that overlap with existing dependencies
- Packages that are too immature for production unless explicitly noted

For each suggestion, use WebSearch to find the official link and verify it's actively maintained.

### Step 6: Write to the tracking file

Match the existing table format in the tracking file. If no file exists yet, use this default structure:

```markdown
## New Packages to look at:

| Package | Purpose | Link |
| ------- | ------- | ---- |

## Versions Updates:

| Version vorher | Version nachher | Breaking | Änderungen | Link |
| -------------- | --------------- | :------: | ---------- | ---- |
```

Rules for writing:
- Append to existing tables — never overwrite existing entries
- Breaking column: `[x]` if breaking, empty if not
- Änderungen: concise summary of key changes (match the language of existing entries)
- Link: official changelog, migration guide, or release blog
- For minor/patch updates, group by package family where possible (e.g., `@vitest/*^4.0`)

### Step 7: Present summary

After writing, give the user a brief summary of what was added:
- Count of new package suggestions
- Count of major version bumps found
- Count of safe updates
- Call out anything that needs immediate attention (security, EOL)

## Failure Handling

| Failure | Action |
|---------|--------|
| No package.json found | Ask the user for the correct project path |
| Tracking file doesn't exist | Create `<notes-dir>/<project-name>/New Packages & Upgrades.md` with default table structure |
| The notes project directory doesn't exist | Create it with `mkdir -p` before writing the file |
| WebSearch fails for a package | Note "changelog not found" in the Änderungen column, move on |
| npm outdated fails | Try alternative: read package.json versions and search npm registry manually |

## Notes

- This skill researches and documents — it does NOT install or update any packages
- Always read the existing tracking file before writing to avoid duplicates
- Match the language (German/English) of the existing tracking file
- For private/scoped packages (e.g., @my-company/*), skip WebSearch — just note the version bump
