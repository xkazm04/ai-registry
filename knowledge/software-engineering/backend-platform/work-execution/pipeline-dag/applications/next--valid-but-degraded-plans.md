---
layer: application
type: application
subject: pipeline-dag
technique: valid-but-degraded-plans
stack: next
verified_on: 2026-08-31
verified_against: next@16.3.3
applied: experiment
ab_verdict: better
proof: ab-paired
---

# An inert edge capping a severity scale (Next/TypeScript)

A research-review surface where a person decides which findings survive into a
script. The findings form a dependency graph — evidence supports a claim,
claims support a conclusion — and removing one is allowed to invalidate what
rested on it. Citations are against `xkazm04/gravitone-gcloud` at `b256f24`,
a public tree.

This is a negative application. The tree does not confirm the technique by
following it; it confirms the technique by carrying exactly the defect the
technique predicts, in code whose *correctness* half is unusually well built.

## The correctness half is thorough, and it is the whole of the checking

`app/_phases/_shared/notebook/cards.ts` validates the graph at a door, and it
validates it well. Every reference is checked against a universe of ids, and
then checked a second time against a *tighter* universe, because an edge that
resolves to some card may still name the wrong kind of thing — the comment
records that a claim citing the wrong node type "is a real mis-wiring that the
card pass would wave through." It goes further than most: it treats an absent
link as a defect rather than a pass, having previously shipped six unlinked
records "under a green gate."

Every one of those checks answers the same question — *does this edge resolve,
and to the right kind of thing?* Not one asks whether an edge that resolves is
an edge that is **needed**. That is the technique's split, drawn exactly: the
result-changing class is served twice over, and the price-only class is not
served at all.

## The structural fact: an edge that cannot fail, in a denominator

`app/_phases/research/scope.ts:67-68` computes what a removal costs:

```ts
const survivors = c.dependsOn.length - missing.length;
out.push({ cardId: c.id, missing, severity: survivors === 0 ? "broken" : "weakened" });
```

`missing` counts dependencies that were removed. `dependsOn.length` counts all
of them. The two are only comparable if every declared dependency *can* be
removed — and here one class cannot.

Claims declare dependencies on a mix of evidence and explanatory nodes. The
explanatory nodes carry no dependencies of their own — the fixture defines
three of them and none cites any evidence — so `cards.ts` gives each an empty
`dependsOn`, and `woundsOf` skips empty-dependency cards by its first guard.
An explanatory node therefore has no cascade path: nothing upstream can ever
remove it, and it can never appear in any `missing` set.

It still counts in `dependsOn.length`. So for every claim citing one,
`survivors >= 1` permanently, and the claim **can never be reported
`broken`** — only ever `weakened` — no matter how much of its actual evidence
is removed.

Nobody designed this. It falls out of two independently reasonable decisions:
that explanatory nodes may be cited as support, and that severity is a ratio
over the declared set. That is what makes it evidence rather than a bug report
— the technique's claim is that this class is *invisible*, and this instance was
invisible to a validator that catches strictly harder things.

## The A/B

Both arms run over the shipped fixture, in a harness that reads the product
data and changes no product code. Each node has every *failable* dependency
removed — the worst case the surface must describe honestly — and the severity
it reports is recorded.

- **A (shipped):** `survivors = declared − missing`.
- **B:** `survivors = failable − missing`, partitioning inert edges out of the
  denominator, per the technique's first decision rule.

| | result |
| --- | --- |
| nodes carrying an inert edge | 5 of 11 |
| A reports `broken` | 6 of 11 |
| B reports `broken` | 11 of 11 |
| **severity wrong under A** | **5 of 11** |

Every node that differs has exactly one inert edge, which is the predicted
signature: one uncancellable edge is sufficient to cap the scale.

**Verdict: better.** B is strictly more truthful on real data, and the
difference is user-visible rather than internal. `severity` reaches the
surface: `_parts/CardTile.tsx:188` renders "cannot stand — " against
"weakened — ", and `_parts/ScopeBar.tsx:75` escalates the whole bar from
`warning` to `error` on the broken count alone. Under A, five findings can be
stripped of all their evidence and the surface will still say *weakened*, in
amber, on a bar that never turns red.

The rule is also duplicated: `app/_phases/script/recalibrate.ts:423` carries a
second, independent copy of the same comparison, so the cap exists in two
places that were written to agree and do.

## What this realization cannot do

The harness measures the worst case — all failable support removed — because
the fixture holds one project's data and cannot supply a distribution. It
therefore proves the cap exists and bounds nothing about how often a real
person walks into it. The technique's shape measurements (width, depth, edge
decisiveness) need a run history this surface does not keep: it stores the
current scope, not a series of them, so "an edge never once decisive" is not
computable here yet. That instrument is the return condition.

## Not shipped, and why

No project change was made. Two blockers, both of the kind that are correct
outcomes rather than defects:

- **Confirmation.** The registry-side pick did not name this project, and a
  cross-repo edit needs its own authorization.
- **Indeterminacy.** Two different fixes are defensible and the choice is the
  owner's, not the run's. Either partition inert edges out of the denominator
  (B, above), or give explanatory nodes the evidence edges they were clearly
  built to carry — `cards.ts` already unions their evidence and dedupes it, and
  its comment notes the union "wounds nothing TODAY… the difference between a
  graph that cannot read the edge and one that has no edge to read." That
  reads as a capability deliberately built ahead of the data. If the data is
  meant to fill in, the severity math is right and the fixture is incomplete;
  if it is not, the math is wrong. Nothing in the tree settles which, and
  shipping either one would decide it silently.

What would settle it: whether explanatory nodes are intended to cite evidence
in future data. That is one answer from the owner, and it selects the fix.
