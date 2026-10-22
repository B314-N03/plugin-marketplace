---
name: obsidian-canvas
description: 'Generate an Obsidian `.canvas` JSON file — a visual map of an architecture, dependency graph, module breakdown, or concept network with positioned nodes, group containers, and labeled edges. Use when the user asks to "create canvas", "obsidian canvas", "architecture map", "system map", "dependency map", "concept map", or names a `.canvas` output path.'
when_to_use: 'When the user wants a visual map of a system saved as an Obsidian canvas file. Skip when the user wants Mermaid, Graphviz, draw.io, Excalidraw, or any non-Obsidian format — produce Markdown with embedded diagrams or call the relevant skill instead.'
---

# Obsidian Canvas

Build a `.canvas` JSON file the user can open in Obsidian as a visual graph. Output is one file — the skill does not launch Obsidian or render the canvas.

## Instructions

### Step 1: Determine Scope

Extract from the user's request; ask only when missing:

- **Subject** (required): what is being mapped — a codebase, a system, a domain model, a process
- **Source material**: codebase to explore, a doc to summarize, or a verbal description
- **Output path** (required): absolute path ending in `.canvas`. If the file exists and is non-empty, ask before overwriting (offer `<name>-v2.canvas` as alternative)
- **Granularity** (default: layer + key files): layer-only (~12 nodes) / layer + key files (~50 nodes) / exhaustive (~200 nodes — warn it gets noisy)
- **Edges** (default: mixed sparse): structural-only / mixed structural + sparse dependency / dense graph

If the subject is a real codebase and the user has not already provided an inventory, launch one `Explore` subagent (medium breadth) to enumerate the load-bearing files per layer **before** drawing. Do not invent file paths.

### Step 2: Plan Layout (before any JSON)

1. Identify **layers** (entry, providers, routing, data, components, utils, tests — or whatever the subject implies). 5-12 layers fits one canvas.
2. Pick a **layout pattern** from [reference/canvas-guide.md](reference/canvas-guide.md): usually a 3-column grid — center spine = render hierarchy, left column = data flow / sources, right column = shared / UI.
3. Assign each layer a **color** from the Obsidian palette (1-6) representing *concern*, not status. See the palette table in the reference.
4. Compute **group bounding boxes** with explicit non-overlapping coordinates. Leave ≥40px between groups and ~40px inside the top of each group for its label.

Write the coordinates down before composing JSON — fixing overlaps after the fact wastes turns.

### Step 3: Compose

Start from [templates/canvas-skeleton.json](templates/canvas-skeleton.json). For each group:

1. Add a `type: "group"` node with `label`, `x`, `y`, `width`, `height`, `color`
2. Add child `type: "text"` nodes positioned *inside* the group's bounding box (~20px inset from the group edges, ~40px below the top for the label)
3. In each text node's `text` field, use markdown — bold the filename/concept on line 1, one-line description on line 2 (use `\n\n` for a blank line)

For edges, prefer **group-to-group** arrows for cross-layer relationships and **node-to-node** only for one specific link. Use `fromSide`/`toSide` (`top` `right` `bottom` `left`) to make routing readable: `bottom → top` for top-down flow, `right → left` for siblings on the same row.

**Edge density rule**: 10-20 edges for a 50-node canvas. More turns into a hairball; drop the obvious ones, keep the surprising ones.

### Step 4: Write & Verify

1. Write the JSON to the target path. If the target is outside the current working directory (e.g., the user's Obsidian vault under `~/Documents/`), the Bash sandbox may need disabling — handle it inline, do not abort.
2. Validate JSON parses and count contents:
   ```bash
   jq '. | {nodes: (.nodes | length), edges: (.edges | length)}' <path>
   ```
3. When mapping a real codebase: spot-check 2-3 referenced file paths exist (`ls <path>`). If any is wrong, fix it — do not ship a map with broken paths.
4. Report the result. Remind the user that node positions are *starting positions* — they can drag nodes in Obsidian and the layout will save back to the file.

## Output Format

```
## Canvas Written: <name>

**File**: <absolute path>
**Nodes**: <N> (<G> groups + <T> text)
**Edges**: <E>
**Layers**: <comma-separated layer labels with their colors>

Open in Obsidian to view. Drag nodes to rearrange — coordinates are starting positions.
```

## Failure Handling

- **JSON validation fails**: re-read the file, fix syntax (commas, quotes, brackets), re-validate. Do not report success on broken JSON.
- **Target path exists and non-empty**: ask before overwriting; offer a `-v2` filename.
- **Sandbox blocks the write** (`Operation not permitted` on a path under `~/Documents` or `~/.claude`): retry the Write/Bash with sandbox disabled, note it briefly.
- **Codebase inventory comes back thin or contradictory**: report what is missing, ask the user to fill the gap. Do not fabricate files.
- **More than ~80 nodes**: warn the canvas will be hard to read; offer to split into multiple `.canvas` files (one per subsystem).

## Notes

- Obsidian renders markdown inside text nodes (bold, italic, inline code, lists, links). No HTML.
- Coordinates use a top-left negative origin: smaller (more negative) numbers = up / left.
- Group nodes are visual containers only — they do NOT logically own their children. The text nodes are independent and just happen to sit inside the group's rectangle.
- The full JSON schema, palette table, layout patterns, and pitfall list live in [reference/canvas-guide.md](reference/canvas-guide.md) — read it when in doubt.
