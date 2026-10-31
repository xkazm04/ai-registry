---
layer: application
type: application
subject: diff-comparison
technique: semantic-level-selection
stack: react
verified_on: 2026-10-31
verified_against: react@19
---

# Semantic level selection — four kernels, and which entity each one was chosen for

*Re-verified against the project tree at `a2ef6400e` on 2026-08-30. Every
citation still resolves except `getSectionSummary`, corrected below; the
`stringify-decided-equality` condition was re-checked and still holds — no
key-sorting replacer and no `Object.keys(x).sort()` on any comparison path
(the only sorted-key sites are test assertions).*

**Re-checked 2026-10-31 at `personas@61029d7ae0`.** The projection failure,
the prose LCS and the composed lab levels hold unchanged, and their anchors
are moved to HEAD. Two findings below are now resolved in the code, and the
measured results that record them are left as measured:

- **All three structural lies in `jsonDiff` are fixed.** Since 2026-10-31 the
  kernel lives in `libs/comparisonDiffCore.ts:94-137`. It recurses to leaf
  paths (`config.retries`, `tags[1]`), walks the union of keys so a nested
  reorder compares equal, and prints `(absent)` for a key one side lacks
  rather than folding it into `null` (`:80-81`, `:105-115`). Replaying the
  three table inputs against that file (with its JSON parser stubbed) gave
  `[]`, one change at `input.topic`, and one change at `b` reading
  `(absent)` → `null`. Arrays still align by index. The table below is the
  `a2ef6400e` measurement, and its `:85-86` anchors are from that tree.
- **The normalization policies are down to two.** The worker and its
  fallback now share `splitLogLines` (`comparisonDiffCore.ts:76-78`), so
  that pair cannot disagree. `PromptDiffModal.tsx` was deleted on
  2026-09-24, which leaves `conflictDiff.ts:20-21`'s bare `split('\n')` as
  the other policy. No document says which policy is intended.
- **The census rule now finds 4 sites in 4 files** (baseline 4/4). The
  kernel site is `comparisonDiffCore.ts:119`, which is now a leaf compare
  reached only after the walk has split containers apart. One correction to
  the 2026-08-30 note: a key-sorting canonicalizer does exist,
  `stableStringify` in `src/lib/tauriInvoke.ts` (present since 2026-04-25).
  It builds request-dedup keys, not a diff, so the claim about comparison
  paths holds.
- The set-membership `diffLines` moved with `jsonDiff` and keeps its
  docstring. `ComparisonDiff.tsx` still draws the left/right line-number
  gutters over it.

Every kernel in this repo was hand-written for one entity, and reading
them side by side is a level ladder with worked examples on each rung —
including the three "lies while looking structural" the technique names,
all of which were found here.

## Level chosen from the entity: the two that got it right

- **Prose → real LCS.**
  `src/features/plugins/obsidian-brain/sub_sync/conflictDiff.ts::diffNoteLines`
  is a genuine longest-common-subsequence over lines. Its docstring
  (`:12-17`) states the reason in the technique's own terms: a set
  difference would lose order and duplicates, and "the same blank line or
  heading legitimately recurs" in prose. Level chosen *from the entity*.
  It also names its cost (O(n·m)) and pushes the cap to callers — which is
  where the diff-honesty application picks the story up.
- **Sectioned prompt → structural outer, text inner.**
  `src/features/agents/sub_lab/shared/DiffViewer.tsx:29` and
  `src/features/agents/sub_lab/components/shared/InlineDiffPreview.tsx:29`
  compare section keys first, then run the token diff (`diffStrings`,
  `labPrimitives.ts:117`) only inside sections whose text differs. This is
  the technique's *levels compose* clause and is why those two stay cheap.

## Level chosen from convenience: the terminal-log set diff

`src/features/agents/sub_executions/libs/comparisonDiffCore.ts::diffLines`
(`:52`; in `comparisonHelpers.ts` until 2026-09-20) is a **set-membership** diff — a line is `same` if the other side
contains it anywhere. The docstring (`:41-51`) is exemplary honesty about
what that gives up: repeat-count changes read as `same`, reordering is
invisible, all `added` lines are appended after A's rather than placed.
"Good enough for a quick 'did anything change' signal — do not rely on it
for exact positional diffing." The level is wrong for prose and
defensible for terminal logs, and the kernel *says which it is doing* —
the technique's last section, honored in a comment. What it does not do
is say so on the surface: `ComparisonDiff.tsx` renders it with left/right
line-number gutters (`:143-158`) that imply positional alignment the
kernel never computed.

## The three structural lies, all present in one function

`comparisonHelpers.ts::jsonDiff` (`:74-93`) is the kernel behind
`JsonDiffSection` — the surface that shows how two executions' input and
output payloads differ. Replayed verbatim (`version-diff-view.md` §0):

| input | reported | technique clause |
|---|---|---|
| nested keys in a different order, same values | **1 change** | equality by serialization — `JSON.stringify(objA[key])` vs `JSON.stringify(objB[key])` (`:85-86`), unsorted |
| `{"input":{"topic":"x"}}` vs `{"input":{"topic":"y"}}` | 1 change at path `input`, never `input.topic` | depth one — each top-level value stringified whole |
| `{"a":1}` vs `{"a":1,"b":null}` | **0 changes** | absent collapsed into null — `objA[key] ?? null` |

Nowhere in 4,801 files is `JSON.stringify` given a key-sorting replacer,
and nowhere is `Object.keys(x).sort()` applied on a comparison path (two
independent implementations agreed). The census rule
`stringify-decided-equality` (published from `version-diff-view.md` §9)
keys on the condition — serialized bytes deciding equality on both sides
of an operator — and finds **6 sites in 5 files**, five of them shipping.
Its paired-const alternative is load-bearing: it is the only form that
sees `comparisonHelpers.ts:85`, the diff kernel itself.

## The projection failure

`DiffViewer.tsx:14-16` normalizes both versions through `getSectionSummary`
(`src/lib/personas/promptMigration.ts:142`), which iterates
`STANDARD_SECTION_KEYS` — five of the seven fields a `StructuredPrompt`
holds; `customSections` and `webSearch` (the `StructuredPrompt` interface, `promptMigration.ts:43-44`)
never reach the diff. The empty state at `DiffViewer.tsx:54` then
re-walks *the same five keys* and, finding them equal, renders
`t.agents.lab.no_structural_diff` — an affirmative denial computed over
the projection. `DraftDiffViewer.tsx:24` has the identical blind spot by
a different route.

The 2026-08-30 pass found a second defect in the same projection, one rung
down from the missing fields. `getSectionSummary` keys its output map by
`SECTION_LABELS[key]` (`promptMigration.ts:150`) — the human-readable
display label — rather than by the schema key it just iterated. The pair is
therefore aligned on a presentation string: editing a label to improve the
UI silently re-keys both sides, and any section whose label changed between
the two versions' code paths would align against nothing. It is inert today
because the labels are a hardcoded constant (`:59-65`) and not localized,
which is exactly what makes it worth recording — the alignment key is
durable by accident, and the first translation of that constant converts a
copy edit into a diff bug with no visible connection to it. Measured against the pre-purge backup: **0 of 73**
persona prompts populate either field, so this is latent by measurement
and real by construction — the technique's "enumeration comes from the
schema" clause, violated at exactly the surface whose job is to say what
changed between versions.

## Four kernels, three whitespace policies, none written down

The normalization-ledger clause, measured: the worker drops blank lines
but does not trim survivors (`comparisonDiff.worker.ts:13-14`); its
synchronous fallback duplicates those two lines verbatim
(`comparisonDiffWorkerClient.ts:142-143`) with nothing asserting they
agree; `conflictDiff.ts:20-21` and `PromptDiffModal.tsx:36-37` do a bare
`split('\n')`. The same pair of texts yields different "differences"
depending on which surface the reader opened, and no document says which
policy is intended.
