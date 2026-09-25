---
layer: application
type: application
subject: agent-instruction-files
technique: single-source-topology
stack: claude-code
verified_on: 2026-09-24
verified_against: claude-code@2.1.281
---

# Instruction-file topology across the six-project fleet (Claude Code)

Read on 2026-08-24 across ascent, kp, personas-web, personas, pof and
systedo-case (all Claude Code v2-era checkouts), against the harness's
own documented loading rules (code.claude.com/docs/en/memory, fetched
same day).

## The harness facts the topology rests on

- Claude Code loads root `CLAUDE.md` **and** `.claude/CLAUDE.md` — both
  are discovered locations, concatenated, not shadowed. Until 2.1.277 it
  did **not** read `AGENTS.md` natively ("Claude Code reads CLAUDE.md, not
  AGENTS.md"; superseded, see the 2026-09-24 section); the documented bridge is a root `CLAUDE.md` containing
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

## A vendor plugin's bridge that resolves to nothing (read 2026-09-08)

A public multi-host plugin repository (a developer-portal vendor's official
plugin for three coding harnesses, at its 2026-08-17 commit) is the cleanest
instance of the technique's topology seen outside this fleet: one canonical
`skills/` directory, three host manifest directories that each point at it,
an `AGENTS.md` as the canonical instruction file, and a root `CLAUDE.md`
that is **one line long**. That line is the bare text `AGENTS.md`.

Re-resolved against the harness's documentation the same day: "Claude Code
reads CLAUDE.md, not AGENTS.md"; the import form is `@AGENTS.md`, and "on
Windows, creating a symlink requires Administrator privileges or Developer
Mode, so use the `@AGENTS.md` import instead." A bare filename is not an
import. So on the harness the plugin most prominently targets, a contributor
opening the checkout receives the string `AGENTS.md` as the repository's
entire instruction set — the technique's "nine bytes of text" case, produced
not by a platform materialising a link but by an author writing the pointer
in the form a *human* resolves rather than the form the *reader* resolves.

The structural fact is the negative one the technique predicts: nothing in
the tree can notice. The file exists, is non-empty, and contains a plausible
path; the repository's own validation step (the host's plugin validator)
checks manifests and skills, never the bridge. The single cheap assertion the
technique asks for — *the bridge resolves to the canonical document* — is
the only check that would have caught it, and it is absent. Compare this
fleet, where the bridges carry `@AGENTS.md` and one project's bridge says in
prose what to do if a tool does not expand the import.

## The harness learned to read AGENTS.md, conditionally (re-read 2026-09-24)

Re-resolved against the memory documentation on 2026-09-24 at 2.1.281.
Since 2.1.277 the harness reads `AGENTS.md` natively, and the condition is
the part that matters for this topology: **it reads `AGENTS.md` only when no
`CLAUDE.md`, `.claude/CLAUDE.md` or `CLAUDE.local.md` exists in the working
directory or above it** (the default *Project instructions* value,
`claude-md-or-agents-md`). A `CLAUDE.md` on the path therefore still
suppresses `AGENTS.md`, and the `@AGENTS.md` bridge remains the form that
works on every session and every version - the documentation says to keep
it ("Keeping the import never makes Claude read `AGENTS.md` twice"). What
changed is the repository with an `AGENTS.md` and no `CLAUDE.md` at all: it
is now served directly, and a `CLAUDE.md` that only *tells* the agent in
words to read `AGENTS.md` is now a worse bridge than having none, because the
agent reads the canonical file only if it decides to open it.

A delivery sweep of twelve fleet checkouts the same day classified each
pair: six import the canonical `AGENTS.md` through `@AGENTS.md`, four have
no `AGENTS.md`, one runs the reverse
topology (a canonical `CLAUDE.md` with `AGENTS.md` as a test-guarded pointer
for other tools - correct; a first-pass classifier flagged it because it
looked only for the import) - and one had **two populated files**: a 76-line
canonical `CLAUDE.md` and a later 52-line `AGENTS.md` carrying commands, an
architecture map and two rules the first file lacked, with no import between
them. Under the harness's rule that second file reached no session. A paired
headless probe asked four questions answerable only from it, tools
disallowed: 0/4 in both runs as the tree stood, 4/4 in both runs after its
content was folded into the canonical file and `AGENTS.md` became a pointer,
for 858 more tokens of floor and a 102-line file. That is the technique's
fork, and the new rule makes the naive reading of it worse: a repository
that adds an `AGENTS.md` beside an existing `CLAUDE.md` expecting "native
support" gets none.
