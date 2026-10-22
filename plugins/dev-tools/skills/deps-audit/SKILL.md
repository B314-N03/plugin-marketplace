---
name: deps-audit
description: Audit project dependencies for outdated packages, security vulnerabilities, and unused imports. Use when the user says "check dependencies", "audit deps", "outdated packages", "security audit", "vulnerable dependencies", or "unused dependencies".
---

# Dependency Audit

Check project dependencies for security, freshness, and unused packages.

## Arguments

- `$ARGUMENTS`: Scope of audit - "security", "outdated", "unused", or empty for full audit.

## Instructions

### Step 1: Detect package manager

Check which ecosystem:
```bash
ls package.json package-lock.json yarn.lock pnpm-lock.yaml bun.lockb Cargo.toml go.mod pyproject.toml requirements.txt Gemfile 2>/dev/null
```

### Step 2: Security audit

**Node.js**:
```bash
npm audit 2>/dev/null || yarn audit 2>/dev/null || pnpm audit 2>/dev/null
```

**Python**:
```bash
pip audit 2>/dev/null || safety check 2>/dev/null
```

**Rust**:
```bash
cargo audit 2>/dev/null
```

### Step 3: Check outdated

**Node.js**:
```bash
npm outdated 2>/dev/null || yarn outdated 2>/dev/null
```

**Python**:
```bash
pip list --outdated 2>/dev/null
```

**Rust**:
```bash
cargo outdated 2>/dev/null
```

### Step 4: Check for unused dependencies (Node.js)

```bash
npx depcheck 2>/dev/null
```

Or manually: grep through source files for each dependency in package.json to check if it's actually imported.

### Step 5: Report

```markdown
## Dependency Audit Report

### Security Vulnerabilities
| Package | Severity | Issue | Fix |
|---------|----------|-------|-----|
| ...     | ...      | ...   | ... |

### Outdated Packages
| Package | Current | Latest | Type |
|---------|---------|--------|------|
| ...     | ...     | ...    | major/minor/patch |

### Unused Dependencies
- [list of deps not found in source code]

### Recommendations
1. [Prioritized actions]
```

## Rules

- Prioritize security fixes over version bumps
- For major version bumps, note potential breaking changes
- Don't recommend updating everything at once - group by risk
- Flag if lockfile is missing or inconsistent
