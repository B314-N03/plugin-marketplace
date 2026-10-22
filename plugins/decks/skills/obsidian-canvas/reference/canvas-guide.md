# Obsidian Canvas Reference

Complete spec for the `.canvas` file format plus layout patterns and pitfalls.

## Table of Contents

- [File format](#file-format)
- [Node types](#node-types)
- [Edge structure](#edge-structure)
- [Color palette](#color-palette)
- [Layout patterns](#layout-patterns)
- [Coordinate planning](#coordinate-planning)
- [Common pitfalls](#common-pitfalls)

## File format

A `.canvas` file is a single JSON document with two top-level arrays:

```json
{
  "nodes": [],
  "edges": []
}
```

Both arrays are required even when empty. Obsidian preserves whitespace; pretty-print for human-edit-ability.

## Node types

### `text` node — the workhorse

```json
{
  "id": "n-foo",
  "type": "text",
  "text": "**Title**\n\nMarkdown body.",
  "x": -200,
  "y": -100,
  "width": 360,
  "height": 100,
  "color": "5"
}
```

- `text` accepts Obsidian markdown (headings, bold, italic, inline code, links, lists). No HTML.
- Use `\n` for a single newline inside the string, `\n\n` for a paragraph break.
- Comfortable widths: 360-400 for paragraphs, 250-300 for labels.
- Comfortable heights: 80-100 for two-line nodes, 160-220 for nodes with bullets.

### `group` node — visual container

```json
{
  "id": "g-foo",
  "type": "group",
  "label": "Layer Name",
  "x": -400,
  "y": -300,
  "width": 800,
  "height": 500,
  "color": "5"
}
```

- A group is a labeled bounding box. It does **not** logically contain its children — child text nodes are independent and simply *positioned inside* the group's rectangle.
- Reserve ~40px of vertical space at the top of the group for the label.
- Groups can overlap with each other visually but should not, for readability.

### `file` and `link` nodes (rare)

`file` embeds a vault file (e.g. an image); `link` embeds a URL. Both follow the same coordinate fields. Not typically used for architecture maps.

```json
{ "id": "f1", "type": "file", "file": "Attachments/diagram.png", "x": 0, "y": 0, "width": 400, "height": 300 }
{ "id": "l1", "type": "link", "url": "https://example.com",       "x": 0, "y": 0, "width": 400, "height": 200 }
```

## Edge structure

```json
{
  "id": "e1",
  "fromNode": "g-pages",
  "fromSide": "right",
  "toNode": "g-components",
  "toSide": "left",
  "label": "uses"
}
```

- `fromSide` / `toSide`: one of `"top" | "right" | "bottom" | "left"` — controls where the arrow attaches to each node.
- `label` is optional but recommended for cross-layer dependency arrows ("uses", "renders", "calls", "wraps", "covered by").
- Edges can connect any node IDs, including group IDs.
- Pick sides that route the arrow around other groups rather than through them.

## Color palette

Obsidian preset color codes (`"color"` field on both nodes and edges):

| Code | Color  | Suggested layer concern                    |
|------|--------|--------------------------------------------|
| `1`  | red    | API boundary, external systems, errors     |
| `2`  | orange | Hooks, business logic, utilities           |
| `3`  | yellow | UI components, presentation, content       |
| `4`  | green  | Entry point, bootstrap, success states     |
| `5`  | cyan   | Providers, state, routing, infrastructure  |
| `6`  | purple | Pages, domain features, testing            |

You can also pass hex strings (`"color": "#ff8800"`) but the presets keep the palette consistent across canvases. **Use color for *concern*, not status** — a canvas of a system is meant to communicate structure, not workflow state.

## Layout patterns

### 3-column grid (default for architecture maps)

```
LEFT column            CENTER spine               RIGHT column
(data sources)         (render hierarchy)         (shared / UI)
────────────────       ────────────────────       ────────────────
state / context        entry                      components
hooks                  providers                  utils
api                    routing                    i18n
                       pages
TESTING (full-width strip at the bottom)
```

Recommended widths: center ~800, sides ~700-750. Horizontal gaps of 300-350px between columns. Vertical gaps of 40-60px between stacked groups. Bottom strip ~400px tall, spanning all three columns.

### Hub-and-spoke

One central node with arms radiating outward. Good for "X integrates with these N systems". Place the hub at `(0, 0)`; arrange spokes on a circle of radius 800-1000.

### Layered (top-down only)

If the system is purely sequential (a pipeline, a request flow, an auth handshake), drop the side columns and stack groups vertically along the y-axis. Useful for ETL flows, OAuth flows, deployment pipelines.

### Cluster (no fixed grid)

For concept maps without a hierarchy (a domain model, a glossary), cluster related nodes by topic and let edges define structure. Use group nodes to label clusters. Anchor clusters at convenient origins (e.g. `(-1000, 0)`, `(0, 0)`, `(1000, 0)`).

## Coordinate planning

Pick a top-left origin and count down/right in pixels. Negative values are normal — canvases often have content above/left of `(0, 0)`.

Worked example — 3 stacked groups in a column, each 800×300, with 50px gaps:

| Group | x    | y    | w   | h   | Bottom edge |
|-------|------|------|-----|-----|-------------|
| A     | -400 | -1000| 800 | 300 | -700        |
| B     | -400 | -650 | 800 | 300 | -350        |
| C     | -400 | -300 | 800 | 300 |    0        |

Check `B.y > A.y + A.height` → `-650 > -700` ✓ (no overlap).

For text nodes inside a group, inset by ~20px on the left and right, and ~40px below the top edge (to clear the label):

```
Group:      x=-400, y=-1000, w=800, h=300
Text node:  x=-380, y=-960,  w=760, h=240
```

## Common pitfalls

- **Overlapping groups**: groups don't enforce containment, but visual overlap is confusing. Plan rectangles on paper or in a table before writing JSON.
- **Text nodes drifting outside their group**: a text node at `(-380, -1450)` inside a group whose rect starts at `(-400, -1500)` is fine. A text node at `(-410, -1510)` peeks outside the group and looks wrong.
- **Edges crossing unrelated groups**: an arrow from PAGES → COMPONENTS that visually cuts through ROUTING reads as a relationship to ROUTING. Re-route by changing `fromSide`/`toSide`, or accept it and let the user reroute in Obsidian.
- **Too many edges**: more than ~20 edges turns into a hairball. Drop the obvious ones ("every page uses every util"); keep the surprising ones.
- **Too many nodes**: aim for under 80 nodes per canvas. Split into multiple `.canvas` files if the system is larger — one per subsystem reads better than one giant canvas.
- **Color-coding by status** (done / pending / blocked): the palette communicates *concern*, not workflow state. If you need status, encode it in the text body, not the layer color.
- **Magic numbers in coordinates**: 50-pixel grid is sufficient. Don't pretend pixel-perfect placement matters — the user can drag nodes.
- **Inventing file paths**: never reference a file you haven't verified exists on disk. Spot-check 2-3 referenced paths after writing.
