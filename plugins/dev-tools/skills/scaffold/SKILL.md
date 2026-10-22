---
name: scaffold
description: Generate boilerplate code for components, modules, API routes, or project structures. Use when the user says "scaffold", "generate", "create new component", "new module", "boilerplate", "stub out", or wants to create a new file following project conventions.
---

# Scaffold

Generate new code files that match the existing project conventions.

## Arguments

- `$ARGUMENTS`: What to scaffold (e.g., "react component UserProfile", "api route /users", "test for auth service").

## Instructions

### Step 1: Detect project conventions

Before generating anything, scan the project to understand patterns:

1. **Framework/language**: Check package.json, Cargo.toml, go.mod, pyproject.toml, etc.
2. **File structure**: Look at how existing similar files are organized
3. **Naming conventions**: PascalCase, camelCase, kebab-case for files and exports
4. **Import style**: Relative vs alias paths, named vs default exports
5. **Testing patterns**: Test file location, naming, framework, assertion style
6. **Existing examples**: Find 2-3 similar files to use as templates

### Step 2: Determine what to create

Parse $ARGUMENTS to understand:
- **Type**: component, page, api route, service, hook, util, test, model, migration
- **Name**: Extract the name from arguments
- **Location**: Where it should go based on project structure

### Step 3: Generate files

Create files that match project conventions exactly:

- Match the import style of neighboring files
- Match the export pattern (default vs named)
- Include TypeScript types if the project uses TS
- Include basic test file if the project has tests colocated
- Add i18n keys if the project uses internationalization
- Add proper file headers if the project uses them

### Step 4: Register if needed

Check if the new code needs to be registered anywhere:
- Route definitions
- Index barrel files
- Module registrations
- Navigation configs
- i18n translation files

### Step 5: Summary

Show what was created and any manual steps needed.

## Rules

- ALWAYS read existing files first to match conventions
- Never invent conventions - copy what already exists
- Ask if unsure about naming or placement
- Keep generated code minimal - just enough to be functional
- Don't add extra features beyond what was requested
