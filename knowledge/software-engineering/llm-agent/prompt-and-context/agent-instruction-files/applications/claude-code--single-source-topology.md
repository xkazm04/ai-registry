---
layer: application
type: application
subject: agent-instruction-files
technique: single-source-topology
stack: claude-code
verified_on: 2026-08-24
verified_against: claude-code@2
---

# Instruction-file topology across the six-project fleet (Claude Code)

Read on 2026-08-24 across ascent, kp, personas-web, personas, pof and
systedo-case (all Claude Code v2-era checkouts), against the harness's
own documented loading rules (code.claude.com/docs/en/memory, fetched
same day).

## The harness facts the topology rests on

- Claude Code loads root `CLAUDE.md` **and** `.claude/CLAUDE.md` — both
  are discovered locations, concatenated, not shadowed. It does **not**
  read `AGENTS.md` natively ("Claude Code reads CLAUDE.md, not
  AGENTS.md"); the documented bridge is a root `CLAUDE.md` containing
  `@AGENTS.md`, and imports expand at launch (max 4 hops) — they
  organize, they do not save context.
- Nested `CLAUDE.md` and `.claude/rules/*.md` with `paths:` frontmatter
  load on demand; rules without `paths:` load at launch. Official
  adherence guidance: keep a file under ~200 lines.
- AGENTS.md-the-standard specifies nearest-file-wins; Claude Code
  concatenates — the combination-semantics divergence in the technique
  is live in this fleet the day any project adds a nested file.

## The fleet's bridge pattern — mostly conformant

4/6 projects (ascent, kp, personas-web, systedo-case) run the sanctioned
bridge: a near-empty root `CLAUDE.md` whose first line is `@AGENTS.md`.
The canonical guide, however, lives in **three different places by
project**: `AGENTS.md` (ascent, systedo-case), `.claude/CLAUDE.md` (kp,
personas-web, personas, pof) — and kp maintains a third file, an
AGENTS.md digest that intentionally restates the guide "in short",
which is the one deliberate fork in the fleet. Since both locations
load, the pointer files cost little; the inconsistency costs authors,
who must re-learn per project where an edit lands. Registry rules are
symlinked into every `.claude/rules/` (2-4 files, no `paths:`
frontmatter — always-on by design, ~1.9-2.7k tokens).

## The measured floor per project

Always-loaded weight (root file + imports + `.claude/CLAUDE.md` +
unconditional rules), bytes/4 token estimate, n=6 projects:

| project | bytes | ~tokens |
| --- | --- | --- |
| personas | 99,869 | ~25,000 |
| pof | 50,023 | ~12,500 |
| kp | 30,283 | ~7,600 |
| ascent | 20,607 | ~5,200 |
| personas-web | 17,748 | ~4,400 |
| systedo-case | 16,919 | ~4,200 |

personas' `.claude/CLAUDE.md` alone (89KB / 1,033 lines, ~5x the
official 200-line adherence target) outweighs the other five projects'
entire floors combined; pof's floor is 54% one table (the 26KB
shared-component manifest). Both are the technique's overflow case:
candidates for loaded-on-touch placement (`paths:`-scoped rules, nested
files, or pointer-to-artifact), not for a bigger root.

## Post-sync addendum (same day)

A four-worker sync wave landed the technique's fixes on 2026-08-24
(commits af7950a personas-web, 19fb247d kp, b1069a0a pof, d5fe056a4
personas). New floors: personas 67,867 B (~17.0k tokens, was ~25k — Rust
and i18n sections moved to `paths:`-scoped `.claude/rules/` files), pof
23,883 B (~6.0k, was ~12.5k — the shared-component manifest relocated the
same way), kp 28,420 B (~7.1k — AGENTS.md digest un-forked to a pure
bridge, duplicate map block removed), personas-web ~18.0k B (~4.5k).
Fleet total dropped from ~59k to ~46k always-loaded tokens; the remaining
personas overweight is hand-curated correction history, retained
deliberately.

## External evidence consulted for the same reading

Two 2026 measurements frame what the floor buys: developer-written
context files cut median agent runtime 28.6% and output tokens 16.6%
with comparable completion (n=10 repos / 124 PRs, arXiv:2601.20404),
while success rate did not generally improve and generated repo
overviews slightly hurt at >20% added cost (n=300+138 tasks,
arXiv:2602.11988). Efficiency, not correctness, is what the fleet's
floors purchase — which prices personas' ~25k tokens as the fleet's
most expensive efficiency feature.
