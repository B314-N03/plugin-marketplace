# Tool Sources & Fetch Technique

## Contents

- Fetch technique
- Verified registry (Claude Code, CodeRabbit)
- Any other tool or package
- Detecting the stack
- Org-wide team context
- Not-found search

## Fetch technique

Scratch directory: the session scratchpad, in a fresh subdirectory such as `<scratchpad>/feature-deck-<slug>/`. Downloads are data. Never run anything from that directory.

```bash
D=<scratchpad>/feature-deck-<slug>; mkdir -p "$D"
curl -sL -o "$D/changelog.md" -w '%{http_code} %{size_download}\n' '<url>'
grep -in -C3 '<feature name>' "$D/changelog.md" | head -60
```

- Check that the HTTP code is `200` and the size is non-zero before trusting an empty grep. An empty grep on a failed download proves nothing.
- Read a located section with `sed -n '<start>,<end>p'` and quote identifiers from it verbatim.
- Use WebFetch for prose pages under ~100k characters, or to summarize a section you have already located. It reads only the first ~100k characters and answers through a small model, so it misses entries deep in a long changelog.
- Mintlify-hosted docs (CodeRabbit, Claude Code, many others) serve any page as Markdown when you append `.md`, and list every page in `/llms.txt`. Try both before scraping HTML.

## Verified registry

### Claude Code

| Source | URL | Use |
|---|---|---|
| Changelog (Markdown, newest first, ~1 MB) | `https://code.claude.com/docs/en/changelog.md` | Versions and entries. Grep it; never WebFetch the whole file. |
| Raw CHANGELOG | `https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md` | Second source for version numbers |
| Docs index | `https://code.claude.com/docs/llms.txt` | Find the docs page for a feature, then fetch `<page>.md` |
| Announcements | `https://www.anthropic.com/news` | Launch posts for larger features |
| Releases | `gh api repos/anthropics/claude-code/releases --jq '.[0:10][] \| "\(.tag_name) \(.published_at)"'` | Release dates |

Changelog entries carry version numbers but not always dates. Take dates from the releases API.

### CodeRabbit

| Source | URL | Use |
|---|---|---|
| Changelog (Markdown, ~275k chars) | `https://docs.coderabbit.ai/changelog.md` | Full history. Grep it. |
| Changelog RSS (last ~15 entries) | `https://docs.coderabbit.ai/changelog/rss.xml` | Recent entries with dates, plan tiers and platforms in the `<title>`. Titles are CDATA, so grep `<title><!\[CDATA\[`. |
| Docs index | `https://docs.coderabbit.ai/llms.txt` | Feature docs pages, then fetch `<page>.md` |
| Blog | `https://www.coderabbit.ai/blog` | Launch narrative and screenshots context |
| Config schema | `https://docs.coderabbit.ai/reference/configuration.md` | `.coderabbit.yaml` keys for the setup slide |

RSS entry titles have the form `<Feature> | <Platforms> | <Plan tiers> | <Deployment>`. Carry the platforms and plan tiers onto the definition slide.

## Any other tool or package

Resolve sources in this order, stopping when you have a changelog plus a docs page:

1. **npm package**: `npm view <pkg> version repository.url homepage time --json`. The repository URL gives `<owner>/<repo>`.
2. **GitHub releases**: `gh api repos/<owner>/<repo>/releases --jq '.[0:15][] | "\(.tag_name) \(.published_at)"'`. The list is ordered by publish date, so backport releases on older majors appear among the newest. Filter to the major line the user asked about. Read a release body with `gh api repos/<owner>/<repo>/releases/tags/<tag> --jq .body`.
3. **Repo files**: `CHANGELOG.md` on the default branch, via `raw.githubusercontent.com`.
4. **Project site**: `<homepage>/llms.txt`, then `/blog` or the release announcement for majors.
5. **Languages and runtimes**:

| Topic | Primary source |
|---|---|
| TypeScript | `https://devblogs.microsoft.com/typescript/` ("Announcing TypeScript X.Y") |
| Node.js | `https://nodejs.org/en/blog` (release posts) and `gh api repos/nodejs/node/releases` |
| ECMAScript / TC39 | `https://github.com/tc39/proposals` (stage changes) |
| CSS / browser APIs | `https://web.dev/blog`, `https://developer.chrome.com/blog`, MDN release notes |

For an **upgrade-highlights deck**, read the installed version from the repo's `package.json` or lockfile and cover every release between the installed and latest versions. Breaking changes and their migration steps go first.

## Detecting the stack

For an "everything we use" roundup, build the candidate list from the current repo:

```bash
git ls-files 'package.json' '*/package.json' '.coderabbit.yaml' '.nvmrc' '.github/workflows/*'
```

- Take `dependencies` and `devDependencies` from each `package.json`, skipping `@types/*` and anything without a release in the window.
- Treat `.coderabbit.yaml` as using CodeRabbit, and `.claude/` or `CLAUDE.md` as using Claude Code.
- Get the Node version from `.nvmrc` or `engines.node`.
- For each candidate, check the latest release date (`npm view <pkg> time.modified`) and keep those with a release in the window. Rank by impact in this order: a major or breaking release, then a new capability we would use, then the rest. Cap the deck at 8 items.

## Org-wide team context

For the org-wide scope of the team slide. `<org>` is the owner from `git remote get-url origin`.

```bash
gh api "orgs/<org>/repos" --paginate --jq '.[] | select(.archived|not) | .name' | wc -l
gh search code '<term>' --owner <org> --extension yml --limit 100 --json repository,path \
  --jq '[.[] | select(.path|startswith(".github/workflows")) | .repository.nameWithOwner] | unique'
gh search code --owner <org> --filename '<exact-config-file>' --limit 100 --json repository \
  --jq '[.[].repository.nameWithOwner] | unique'
```

- The first command gives the denominator: active (non-archived) repos.
- Filter by **`--extension`** or by `--filename`. A glob such as `--filename '*.yml'` silently returns 0, and `--filename` matches any name *ending* in the string (`--filename socket.yml` also hits `rule-UnencryptedSocket.yml`), so always filter the JSON to the exact path, e.g. `select(.path == ".github/dependabot.yml")`.
- **Code search allows 10 queries per minute.** Plan at most 9 per batch; on a 403 wait with `until [ "$(gh api rate_limit --jq .resources.code_search.remaining)" -gt <n> ]; do sleep 5; done` before the next batch. Save each result to a file and compute unions from the files rather than re-querying.
- **Prove each search works**: the current repo must appear in a search it obviously matches (e.g. `npm ci` when its workflows run `npm ci`). If it is missing, the result is wrong, not empty.
- Code search returns at most 100 results per query. When a query hits 100, report "≥ k".
- Useful signals: the tool's config file (already adopted), the workflow step it attaches to (`npm ci`, `pnpm install`, `actions/setup-node`), and a dependency in `package.json` (`"<pkg>"` with `--filename package.json`).
- Org rollout options to assess: a reusable workflow in a shared repo, an org-level secret for a token, org-wide config (e.g. CodeRabbit's organization settings), and Dependabot coverage.

## Not-found search

Before telling the user a named feature does not exist:

1. Grep the full changelog download for the exact name, its lowercase form, its hyphenated form and its spaced form (`autopilot`, `auto-pilot`, `auto pilot`).
2. Grep the `llms.txt` docs index and the blog page.
3. Run one WebSearch restricted to the vendor domain (`allowed_domains`).
4. Note the 3 closest real entries by topic, for example other automation features, so the user can say "I meant X".

Report the steps you ran and the closest entries, then ask. Never build slides on an unconfirmed name.
