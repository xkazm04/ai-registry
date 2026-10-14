# Friend overlay keys

Loaded on demand from `SKILL.md` § Project overlay. The overlay is ONE tracked file in the
consuming repo, `.claude/friend/config.md`: YAML frontmatter for scalars, markdown `##`
sections for lists and prose. Every key has a default, so the loop runs with no overlay at
all; say `overlay: defaults` once in the first cycle header when the file is absent.

## Scalars (default in brackets)

```yaml
---
product: "<product name>"          # cycle header  [the repo directory name]
stack: "<one-line stack>"          # sizing + gate detection  [detected from package.json / manifest, else "unknown"]
vault: ["<abs vault root>", ...]   # candidate roots, first existing wins  [<repo>/.friend/]
vault_subdir: Friend               # namespace inside the vault; "" = the root itself  [Friend]
base_branch: main                  # merge learning (Phase 0b) and the exit summary target it  [origin/HEAD, else current]
worktree_dir: .claude/worktrees    # where Phase 0d puts the cycle worktree  [.claude/worktrees]
active_runs_ledger: ""             # a live-sessions ledger, if the repo keeps one  [none; git status only]
context_taxonomy: ""               # file naming the areas/contexts  [none; derive from top-level source dirs]
context_outbox: ""                 # append-only per-context coverage file a host app ingests  [none; skip that step]
verify_url: ""                     # the running app a verified cycle drives  [none; verified mode unavailable]
locale_count: 1                    # sizing multiplier for string-heavy work  [1]
commit_types: "feat, polish"       # allowed commit types for this loop  [feat, polish]
---
```

## Sections

| Section | What it carries | Default when absent |
|---|---|---|
| `## Areas` | the area menu - one row per area, `name -> paths -> entry points`. Q1 offers these rows; Phase 0f resolves the ledger's `Paths:`, the scan scope and the registry-map contexts from them | derive one area per top-level source directory and say the menu was derived |
| `## Gates` | `builder:` (what every cycle passes before each commit) and `integration:` (what passes before the exit summary), each an exact command with a when-clause | detect from `package.json` scripts (`typecheck`/`check`, `lint`, `test`) or the build manifest; else `npx tsc --noEmit` when a tsconfig exists - say what was detected |
| `## Repo law` | the convention digest Phase 4 treats as binding: the reusable-component catalog, string/i18n rules, design tokens, call/error wrappers, staging discipline, max-lines - and where the authoritative rules file lives | "read the repo's CLAUDE.md / AGENTS.md first; reuse before building" |
| `## Codegen` | commands a change can oblige (binding export, command-name generation, catalog regeneration, locale merge), each with its trigger and whether a hook enforces it | none; nothing is generated |
| `## Docs` | source-area -> doc-file map, and whether a hook enforces it | none; no doc obligation |
| `## Verified mode` | how to boot the app a cycle drives, its port, the driver primitive to use, and the driver paths known to drop work | offered only when `verify_url` is set; otherwise Q2b is skipped and behavior-changing cycles carry a manual-verify checklist |
| `## Context sources` | which name set `context_outbox` anchors to, and any known-stale map NOT to read | the `## Areas` table is the name source |
| `## Direction taste` | learned acceptance pattern; Phase 2 weights the slate by it | outcome-value over cosmetic churn |
| `## Skill improvement log` | the dated one-liners the reflection clause produces | created on first wrap |

Writes to the overlay (taste, improvement log) are committed scoped -
`git commit --only .claude/friend/config.md` - never via a bare commit.
