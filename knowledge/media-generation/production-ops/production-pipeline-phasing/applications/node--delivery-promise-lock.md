---
layer: application
type: application
subject: production-pipeline-phasing
technique: delivery-promise-lock
stack: node
status: forged
verified_on: 2026-08-31
verified_against: node@24
applied: simulation
ab_verdict: better
proof: structural-only
---

# Node: a promise that is locked early and enforced nowhere

The Gravitone studio (`lib/projects.ts` in the `gravitone-gcloud` repo) asks
for a **discipline** before it asks for a template: `educational`, `trailer`,
or `free`. Its own comment states the position exactly — "the question asked
BEFORE the template: what kind of video is this at all" — and the three values
are a closed set, persisted on the record, and back-derived for records
written before the field existed.

That is the first half of this technique, implemented independently and
implemented well. The discipline is settled before the means, which is the
placement the technique argues for and the harder half to get right.

## The structural fact

The discipline carries **no rules**. Grepping every consumer of the field
across the app, the pipeline and the library, it resolves to three uses: an
asset folder path, a style-eligibility predicate, and a sentence of prose in
the brief. There is no table stating what each discipline obliges the
delivered cut to contain, and nothing at the `cut` phase compares the
assembled artifact against the discipline that was locked at creation.

Nobody designed that absence — it fell out of the field being introduced for
selection rather than for enforcement. It is better evidence than an adopting
tree would have given, because the classification half is present and
correct, which isolates the missing half cleanly: locking a promise and
enforcing one are separable, and this tree did the first and not the second.

The second structural fact is where the cost lands. `PhaseState` is
`blocked | review | working | done | empty`, and `empty` ranks **best** in the
worst-news-first merge. So `empty` is the token for both "this phase was not
required" and "this phase was required and produced nothing" — the two states
the promise exists to distinguish.

## Simulation: three cases from this tree

Policy A is the tree as it stands. Policy B adds rules to the discipline and
one check at `cut`.

**1. A cut ships with `score: "empty"`.** Under A, nothing downstream can say
whether the piece was never meant to have music or reached the score phase and
came away with none — and because `empty` is the best-ranked state, the
worst-news merge will not surface it either. Under B, `educational` and
`trailer` declare whether a score is owed; an owed-and-absent score is a
violation at `cut` and the run stops and asks. *Falsified if* the score phase
turns out to be exercised on every real project, in which case the ambiguity
never occurs and the rules are dead weight.

**2. The retired `motion` phase.** `RETIRED_PHASES` merges `motion` into
`frames` worst-news-first, so a blocked motion phase correctly makes the
merged `frames` blocked. That protects the *progress* claim. It says nothing
about the *delivery*: a piece whose motion work was blocked and whose stills
survived is a still-led cut, and the record continues to describe it by a
discipline that never promised either way. Under B the discipline names
whether motion is constitutive, and the merge has something to invalidate.
*Falsified if* a blocked phase already prevents reaching `cut` at all — the
migration code suggests it does not, but this was not executed.

**3. `free` and `trailer` are indistinguishable at the cut.** `free` means
"the craft library has no template for it — the studio only keeps time," and
`trailer` means "a promotional cut that opens a debt another artifact pays."
Those are different delivery contracts. Under A both produce identical
obligations at `cut`, which is none. Under B `free` is the discipline that
declares it has no rules — an explicit empty rule set, which is a different
statement from an absent one. *Falsified if* nearly every project is `free`,
which would make the distinction real but rarely exercised.

Verdict **better**, held at simulation strength: the three cases are real
states of this tree, but no cut was run through either policy and the
fulfilment metric the technique's sharper half describes does not exist here
to measure. The mode is `simulation` for a specific reason rather than a
general one — arm B has no implementation to run, so there is nothing to
count until the rules table exists.

## What this realization cannot do

It cannot test the technique's central claim at all. The anti-substitution
rule — that a fulfilment ratio must name the cheaper category it does not
count — needs a pipeline that *can* deliver the same brief in two media at
different cost, and needs the ratio to exist. This tree has the promise and
not the ratio, so what it confirms is the placement of the lock and the cost
of leaving it unenforced. A tree that assembles cuts from mixed motion and
slide grammar would test the half that matters most, and this is not one.
