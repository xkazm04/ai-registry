---
layer: technique
type: technique
subject: judgment-guardbands
technique: score-guardband
status: forged
laws: [one-authority-per-vocabulary, one-validation-door, count-carries-predicate]
shared_with: []
use_when: [sizing how far a model may move a score, a model verdict feeds a user-visible number, reviewing whether a clamp is actually a bound]
---

# Score guardband

The guardband is the maximum distance, on the scoring scale, between the
computed value and the published value after the model has had its say. It is
a single declared number, and choosing it is the most consequential decision
in this subject — everything else adjusts *within* it, so it alone determines
what a total compromise of the model costs you.

## Bound the delta, never the result

A constraint of the form "the model must return a score between 0 and 100" is
not a guardband. It is the scale. A captured model returns 100.

A constraint of the form "the published score is the computed score plus a
model adjustment, and the adjustment is clamped to ±D" is a guardband,
because the adversary's best case is now *computed + D* rather than the top
of the scale. The difference between these two formulations is the entire
technique, and it is trivially easy to build the first while believing you
built the second — the tell is whether the clamp's arithmetic mentions the
computed value at all. If the clamp can be evaluated without knowing the
backbone's output, it is a range check, not a band.

Express it as an explicit subtraction and clamp: take the model's proposed
value, subtract the computed value, clamp that difference into ±D, add it
back. Written that way the bound is visible in the code and cannot be
misread.

## Size it by the adversarial outcome, not the typical one

The sizing question is not "how much does the model usually want to move
this?" It is: **if an adversary owned the model entirely, is computed + D a
number I am willing to publish?**

Work it backwards from consequences. If a score above some threshold unlocks
something — a badge, a recommendation, an automated approval — then D must be
smaller than the distance from a realistically-achievable computed score to
that threshold. If it is not, the threshold is model-controlled, and every
protection upstream is decoration.

The sanity check that catches most mis-sizings: **compare D against the width
of your qualitative tiers.** If the published score is bucketed into named
levels and D is as large as a tier is wide, then model influence alone can
move a subject a full level, and a widened band can move it two. That is not
a nuance budget; that is the verdict. Where you find a band that large, the
honest options are to shrink it, to narrow what a level means, or to record
explicitly that levels are model-influenced — not to leave the mismatch
undocumented because the arithmetic looks conservative in the average case.
The blend weight helps here but does not rescue you: the weight governs the
typical run, and the guardband is what remains when the weight is at its
maximum.

Resist two pressures to widen. The first is a genuine accuracy argument — the
model really is better on this dimension. The answer is to improve the
backbone, or to move the dimension to honestly model-scored with its own
label, not to loosen a bound that also protects every other dimension. The
second is a smoothness argument — the clamp binds often and the scores look
"blunt". A clamp that binds often is information, not a defect; see the
integrity record.

## One constant, one door

The band is a named constant defined once and imported everywhere a
correction is applied
([_laws: one-authority-per-vocabulary_](../../../../_laws.md#one-authority-per-vocabulary)).
Inline numeric literals at call sites are how a system ends up with two
different bands, discovers it during an incident, and cannot say which scores
were computed under which.

Equally, every path from a model verdict to a stored number passes through
the same clamping function
([_laws: one-validation-door_](../../../../_laws.md#one-validation-door)). The
common leak is not the main scoring path — that one gets reviewed — it is the
retry path, the re-score-on-demand path, the backfill script, the "quick fix
for one customer" path. Enumerate the writers. If you cannot enumerate them,
the band is unenforced somewhere.

## Widened bands are a separate, gated constant

There is one legitimate reason to exceed the base band: the model has
declared, through the budgeted audit channel, that the deterministic evidence
for this dimension is wrong (see
[self-audit-budget](./self-audit-budget.md)). Where that flag is honoured, the
band widens.

Design rules for the widened band:

- **It is its own named constant**, not a multiplier applied inline. Someone
  will need to shrink it after an incident, and they must be able to find it.
- **It is still a delta bound.** Widened does not mean unbounded; a dimension
  whose evidence the model rejects still gets a clamp, because "the evidence
  is wrong" is exactly what a captured model says.
- **Widening is a per-dimension event, and it is recorded.** A score computed
  under a widened band is not the same kind of number as one computed under
  the base band, and the record says which
  ([_laws: count-carries-predicate_](../../../../_laws.md#count-carries-predicate)).
- **Widening is granted by the budget enforcer, never by the dimension
  itself.** The decision of whether a flag is honoured is made globally,
  after all flags are known — a dimension cannot widen its own band on the
  strength of its own flag.

## Asymmetry is allowed, and usually right

Nothing requires the band to be symmetric. In most production settings the
downside risk is one-directional: an inflated score misleads a decision-maker
and can be gamed, while a deflated score annoys someone who then appeals and
gets a human look. Where that asymmetry holds, permit the model more room to
lower a score than to raise it. State the two constants separately and
document the reasoning next to them, because a future reader will otherwise
"fix" the asymmetry as a bug.

## Decision rules

- **When a threshold or tier boundary exists downstream, D must be smaller
  than the smallest gap that matters.** Otherwise the model controls the
  threshold.
- **When the clamp never binds in production, shrink D.** Free safety; the
  model was never using the room.
- **When the clamp binds on most scores, stop and investigate before
  widening.** Either the backbone is systematically off — fix the detectors —
  or the model is systematically pushing one direction, which is a signal
  about the prompt, not a reason to give it more room.
- **When adding a new consumer of model verdicts, route it through the
  existing clamp before it ships**, not after.

## When not to use this

A guardband is the wrong shape when the model's output is not a correction to
a computed number: free-form generation, retrieval-augmented answering,
classification into a closed set with no numeric scale. Clamping a class
label is meaningless; the analogous protection there is an allowlist over the
label vocabulary, which is a different discipline. And where a dimension is
honestly model-only — no backbone exists and none can — do not manufacture a
computed value just to have something to band around. Label it model-scored
and let readers weigh it accordingly; a band around a fiction protects
nothing while claiming to protect everything.
