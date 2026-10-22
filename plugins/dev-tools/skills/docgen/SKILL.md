---
name: docgen
description: Generate documentation for code, APIs, or modules. Use when the user says "document this", "generate docs", "write documentation", "add JSDoc", "API docs", or "README for this module".
---

# Documentation Generator

Generate clear, useful documentation for code and APIs.

## Arguments

- `$ARGUMENTS`: What to document - file path, module name, or "api" for API docs.

## Instructions

### Step 1: Analyze the target

Read the code and understand:
- Public API surface (exported functions, classes, types)
- Parameters, return types, side effects
- Usage patterns (how is this code called?)
- Dependencies and prerequisites

### Step 2: Determine documentation type

**Inline docs** (JSDoc/docstrings):
- For individual functions, classes, methods
- Focus on parameters, returns, throws, examples

**Module docs** (README or header comment):
- For a module/directory
- Focus on purpose, usage, architecture

**API docs**:
- For HTTP endpoints
- Focus on routes, params, request/response bodies, auth

### Step 3: Generate documentation

**For functions/methods**:
```typescript
/**
 * Brief description of what it does.
 *
 * @param paramName - What this parameter represents
 * @returns What the function returns
 * @throws When and why it throws
 *
 * @example
 * ```typescript
 * const result = functionName(input);
 * ```
 */
```

**For modules**:
```markdown
# Module Name

Brief description.

## Usage

Quick example of how to use this module.

## API

### `functionName(params): ReturnType`

Description.

## Architecture

How this module is structured internally (if complex).
```

**For API endpoints**:
```markdown
## `METHOD /path`

Description.

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|

### Request Body

### Response

### Errors
```

### Step 4: Validate

- Are all public exports documented?
- Are examples realistic and would they compile?
- Are edge cases mentioned?

## Rules

- Document the WHY, not just the WHAT
- Keep descriptions concise - developers read docs under time pressure
- Include at least one usage example for non-trivial APIs
- Match the documentation style already used in the project
- Don't document internal/private implementation details unless complex
- Don't add docs to trivially obvious code (getters, simple wrappers)
