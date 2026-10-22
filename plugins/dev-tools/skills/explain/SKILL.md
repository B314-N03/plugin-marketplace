---
name: explain
description: Provide a clear, deep explanation of code, architecture, or technical concepts. Use when the user says "explain this", "how does this work", "what does this do", "walk me through", or points to code they don't understand.
---

# Explain

Provide clear, layered explanations of code and technical concepts.

## Arguments

- `$ARGUMENTS`: File path, function name, concept, or code snippet to explain.

## Instructions

### Step 1: Identify scope

Determine what needs explaining:
- A specific function or class
- A file or module
- An architectural pattern
- A data flow across multiple files
- A concept or algorithm

### Step 2: Read the code

Read the relevant source code. For architectural explanations, trace the full flow:
- Entry points
- Key functions and their relationships
- Data transformations
- Side effects and external interactions

### Step 3: Explain in layers

**Layer 1 - One-liner**: What does it do in one sentence?

**Layer 2 - Overview**: How does it work at a high level? What are the main steps?

**Layer 3 - Details**: Walk through the implementation. For each significant block:
- What it does
- Why it's done this way (if the reason isn't obvious)
- Key edge cases handled

**Layer 4 - Context** (if relevant):
- How it fits into the larger system
- What calls this / what does this call
- Important design decisions or trade-offs

### Step 4: Highlight non-obvious aspects

- Subtle bugs or potential issues
- Performance implications
- Security considerations
- Clever tricks that might confuse future readers

## Rules

- Adjust depth to complexity - don't over-explain simple code
- Use the user's apparent experience level to calibrate explanation depth
- Reference specific line numbers when pointing to code
- If explaining architecture, consider drawing ASCII diagrams
- Don't explain obvious things (variable declarations, basic syntax)
