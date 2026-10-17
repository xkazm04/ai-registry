# Judging the pool and composing the scope

The caller session is the judge. It did not write any proposal, but it is one model family
among the seats, and judges measurably favour their own family (two judges disagreed at
rho = 0.50 in tiger 2.x benchmarks, each ranking its own family first). Three habits keep
the verdict honest:

1. **Read `pool.md`, not `pool.json`, until the verdict is written.** pool.md hides which
   seat wrote what. The mapping is for the ledger, after the fact.
2. **Verify before you value.** A claim about the current code is checked in the code
   before it counts. In the adopt-bp bench (2026-10-12) the seat with 4x the volume had
   9/12 claims true against 12/12 for the sparse one: counts lie, verification does not.
3. **Peer scores are a second opinion, not a vote.** They exclude a seat's own ideas. A
   proposal you rank high and peers rank low needs a sentence saying why you overrule them.

## Step 1 - triage every proposal

For each proposal, one row in `verdict.md`:

| field | how |
|---|---|
| `premise` | `true` / `false` / `partly` - the proposal's claim about what the code does today, checked at its anchors (read the lines; the anchor check only proves they exist). A `false` premise drops the proposal unless the idea survives the correction. |
| `already` | the capability, or most of it, already exists (cite where) -> drop or shrink. |
| `value` | 1-5: how much more valuable the area becomes for its users, judged against the dossier's jobs. |
| `confidence` | 1-5: how sure the value is - observed evidence > prior art > reasoning > hope. |
| `effort` | the seat's S/M/L, corrected if the code says otherwise. |
| `fit` | does it build on the area's strength (the dossier's "does unusually well"), or bolt on something unrelated? |
| `verify` | is the acceptance check observable? Rewrite it if it is not; drop the proposal if it cannot be. |

Score = value x confidence, divided by effort weight (S 1, M 1.6, L 2.5). The score sorts;
it does not decide. A `leap` with value 5 and confidence 2 stays in the field - its job is
to be seen by the person, not to win on arithmetic.

## Step 2 - cluster and crossbreed

Independent proposals from different seats pointing at the same move are the strongest
signal the council produces: cluster them, keep the best-specified member as the lead, fold
in the others' sharpest details, and record every member id (`cluster: [P03, P09, P14]`).
Where two clusters are halves of one design, the judge may fuse them itself - say so.

If every seat converged on modest, obvious moves, suspect the dossier before the seats: a
sharper problem statement in the brief tends to fix it, a bigger model does not (tiger 2.x:
every model at every effort missed the same thing the prompt framing hid). Rewrite the
brief's "Why this area" and "Known limits" and run round 1 again rather than shipping a
timid scope.

## Step 3 - compose the scope

The deliverable is not the top N rows. It is a **scope**: a coherent set of moves that
together make the area markedly more valuable, with a one-sentence thesis ("turn X from a
tool you consult into one that acts on its own findings").

- 4-12 items. Each: title, the outcome in the user's words, anchors, effort, the `verify`
  check, its source ids (cluster), and dependencies on other items.
- Order by dependency, then by score. Mark the **core** (items the thesis cannot stand
  without), **supporting** (amplify the core), and **leaps** (bold, optional, still
  specified well enough to build).
- Name what the scope deliberately leaves out and why, in one line each - including any
  high-scoring proposal you dropped.

## Step 4 - the approval gate (multi-select)

Present the scope with one multi-select question per tier (the question tool takes up to 4
questions of up to 4 options each, so up to 16 items; group further only if needed). Option
label: the title (<= 5 words if the tool truncates). Description: outcome, effort, the
verify check, and `n seats` when a cluster has several. The core question goes first and
its options are listed in build order. "Other" lets the person add or reshape an item.

Nothing is built that was not selected. With no interactive person (headless, delegated),
write the scope to `scope.md`, stop, and report the path - an unattended run never approves
its own scope.

## verdict.json - what `ledger` reads

Written after the person chose and again after execution, ids are pool ids (all members of
a cluster that was kept / approved / landed):

```json
{
  "kept": ["P03", "P09", "P14", "P05"],
  "approved": ["P03", "P09", "P14"],
  "landed": ["P03", "P09"],
  "items": { "C1": ["P03", "P14"], "C2": ["P09"], "L1": ["P05"] },
  "approved_items": ["C1", "C2"],
  "landed_items": ["C1"],
  "dropped": { "P07": "false premise: retry already exists at src/a.ts:40" },
  "thesis": "one sentence",
  "judge": "claude-opus-5-5"
}
```
