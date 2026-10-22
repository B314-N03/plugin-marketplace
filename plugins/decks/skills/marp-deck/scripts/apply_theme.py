"""Inject a marp-deck theme into a deck's frontmatter.

Usage: uv run python3 apply_theme.py <deck.md> <cyber-dark|light-clean|corporate-blue|nord> [--prompt "<user@path>"]

Sets `theme: default`, removes any existing `style:` block, and appends the theme's
variables plus the shared base.css as a `style: |` block. Safe to re-run to switch themes.
The shell prompt shown in terminal-styled code blocks defaults to root@<deck slug> (rendered red, with a root `#`).
"""
import sys
from pathlib import Path

THEMES_DIR = Path(__file__).resolve().parent.parent / "themes"


def main() -> int:
    args = sys.argv[1:]
    prompt = None
    if "--prompt" in args:
        i = args.index("--prompt")
        if i + 1 >= len(args):
            print(__doc__.strip())
            return 2
        prompt = args[i + 1]
        del args[i:i + 2]
    if len(args) != 2:
        print(__doc__.strip())
        return 2
    deck, theme = Path(args[0]), args[1]
    prompt = prompt or f"root@{deck.stem}"
    theme_file = THEMES_DIR / f"{theme}.css"
    if not theme_file.is_file():
        available = sorted(p.stem for p in THEMES_DIR.glob("*.css") if p.stem != "base")
        print(f"Unknown theme '{theme}'. Available: {', '.join(available)}")
        return 2

    text = deck.read_text()
    if not text.startswith("---\n"):
        print(f"{deck}: frontmatter must start on line 1 with '---'.")
        return 1
    end = text.find("\n---\n", 4)
    if end == -1:
        print(f"{deck}: closing '---' of the frontmatter not found.")
        return 1

    kept, in_style = [], False
    for line in text[4:end].splitlines():
        if line.startswith("style:"):
            in_style = True
            continue
        if in_style and (line.startswith(" ") or not line.strip()):
            continue
        in_style = False
        if not line.startswith("theme:"):
            kept.append(line)

    escaped = prompt.replace("\\", "\\\\").replace('"', '\\"')
    css = f'section {{ --shell-prompt: "{escaped}"; }}\n' + theme_file.read_text() + "\n" + (THEMES_DIR / "base.css").read_text()
    style = "style: |\n" + "\n".join(f"  {l}" if l else "" for l in css.splitlines())
    front = "\n".join(["theme: default", *kept, style])
    deck.write_text(f"---\n{front}\n---\n{text[end + 5:]}")
    print(f"Applied theme '{theme}' to {deck}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
