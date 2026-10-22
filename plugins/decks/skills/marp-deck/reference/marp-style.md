# Marp Deck Themes

Styling lives in `themes/`, never in a deck. `scripts/apply_theme.py <deck.md> <theme>` writes `theme: default` plus a `style: |` block made of `themes/<theme>.css` (variables) followed by `themes/base.css` (layout). Re-running it switches themes.

## Themes

| Theme | Look | Use for |
|---|---|---|
| `cyber-dark` | GitHub-dark `#0d1117`, red H1 `#ff6b6b`, blue H2 `#79c0ff` with a rule under it, orange bold `#ffa657`, green inline code `#7ee787` | Security, incident and engineering decks |
| `light-clean` | White, near-black text, single blue accent `#0969da`, GitHub-light code | Projectors, printed PDFs |
| `corporate-blue` | White slides under a 16px `#0078d4` bar; title and closing slides solid brand blue; blue table headers | Leadership and stakeholder decks |
| `nord` | Blue-grey `#2e3440`, frost accents `#88c0d0` / `#81a1c1`, yellow bold `#ebcb8b`, extra padding | Calm technical talks |

## Layout rules (base.css)

- Content slides: top-aligned, left-aligned; title and closing slides (`<!-- _class: lead -->`) centered
- Code blocks: left-aligned, monospace, syntax colors from the theme's `--hl-*` variables
- Tables: always full content width, left-aligned cells, row striping, identifiers in cells never wrap, bold labels in the text color (not the accent)
- Shell fences (`bash`, `sh`, `shell`, `zsh`, `console`): terminal window with traffic-light title bar, dark background in every theme, red root prompt `root@<slug> #` before the command, no syntax colors
- `>` callouts: colored left border, tinted box, no quote marks
- H2: theme color; only `cyber-dark` draws a rule under it (a border, so it never strikes through inline code)
- Footer and page number: muted color, no text shadow

## Adding a theme

1. Copy `themes/light-clean.css` (light) or `themes/nord.css` (dark) to `themes/<name>.css`.
2. Change the variable values only. Add extra rules after the variable block when the theme needs them (see `corporate-blue.css`).
3. Add the theme to the Step 1 table in `SKILL.md` and to the table above.
4. Render a test deck with `--images png` and check a code slide, a table slide and the title slide.

Variables every theme defines: `--bg --fg --muted --footer --h1 --h2 --h2-rule --accent --link --code-bg --code-fg --pre-bg --pre-fg --border --th-bg --th-fg --td-bg --td-alt --callout-bg --callout-border --hl-keyword --hl-string --hl-attr --hl-comment --hl-number --hl-title --hl-builtin --hl-variable --hl-tag --term-bg --term-bar --term-fg --term-prompt --term-muted --term-border --pad-y --pad-x`. `apply_theme.py` adds `--shell-prompt` itself: `root@<deck slug>`, or `--prompt "…"` to override.
