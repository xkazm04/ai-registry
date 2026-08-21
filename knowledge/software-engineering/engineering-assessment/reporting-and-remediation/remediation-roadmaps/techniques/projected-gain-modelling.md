---
layer: technique
type: technique
subject: remediation-roadmaps
technique: projected-gain-modelling
status: forged
laws: [count-carries-predicate, derivation-names-recomputation]
shared_with: []
use_when: [attaching a number to a recommendation, showing a total for a set of selected moves, deciding how confident a plan may sound]
---

# Projected gain modelling

The concern: every recommendation carries a number — "+6", "moves you to 71"
— and that number is the most-read, least-audited figure in the artifact. It
is not a measurement. It is the output of a small model: the affected
dimension's weight, an assumed post-move value for that dimension, and a
coefficient someone chose. The technique is about making that model explicit,
conservative, and impossible to confuse with a measured result.

## The model has named parts

State each part, because each is a place to over-claim:

- **The affected dimension and its weight**, taken from the rubric. If a move
  touches several dimensions, the model enumerates them; a single number
  attributed to a single dimension when the move touches three is a modelling
  error, not a rounding one.
- **The assumed post-move value.** Not the dimension's maximum — the value
  realistically reached by *this* move. "Record an owner for one of six
  ungoverned steps" moves the dimension by a sixth of its shortfall, not to
  full marks.
- **A confidence coefficient** for moves whose effect is uncertain, applied
  as a discount and never as a bonus.
- **The scoring function itself**, which turns hypothetical dimension values
  back into a composite. The projected gain is `score(with move) −
  score(current)`, computed by re-running the real function — never by a
  parallel shortcut formula that will drift from it
  ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).

Any projected number that travels — into a row, a total, an email, a
report — carries what it is a projection *of* and under what assumption
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)). A bare
"+6" with no attached dimension and no stated assumption will be quoted back
as a promise.

## Non-additivity is the default, not an edge case

Gains do not add, for at least four independent reasons: two moves on one
dimension overlap; a dimension's ceiling caps their combination; the
composite's normalization is rarely linear in the underlying values; and
bands truncate the visible effect. In practice, summing the top five items'
claims routinely produces a total exceeding the entire remaining headroom of
the rubric — an obviously impossible number that ships because nobody
computed the ceiling.

The rule is absolute: **any displayed total is produced by applying the
selected set to a copy of the inputs and re-running the score.** Never by
addition. This holds for the sandbox's live preview, for the cheapest-path
total, and for any summary line. If re-running is too expensive to do on
every keystroke, debounce the recomputation — do not substitute a sum.

## Conservatism, and the asymmetry that justifies it

Under-claiming and over-claiming are not symmetric errors. An under-claimed
gain is discovered as a pleasant surprise and costs nothing. An over-claimed
gain is discovered *after the reader has spent the effort* and did not get
what they were told — and that discovery discredits not just the item but the
scoring instrument, the assessment, and every future run of the product. So
where the estimate is uncertain, round down, discount, and prefer a range's
lower end. Calibrate over time by comparing claimed gains against realized
ones on the same dimension across runs; a catalog entry that consistently
over-delivers can have its coefficient raised, but that is an earned
adjustment, not a starting posture.

## The projection is display-only, and never feeds back

State it as an invariant and test it: the projection reads the scored inputs
and produces a number for a reader; it never writes back into the score,
the stored dimension values, or anything a later run consumes as evidence. A
projection that leaks into the scoring path creates a system that improves
its own assessment by imagining improvements — and because the leak is a
single assignment, it is nearly invisible in review and completely invisible
in output.

Two structural properties make the invariant checkable. First, the projection
function is **pure**: inputs in, number out, no store access — which also
lets the same function run client-side for a live preview without a round
trip. Second, it reuses the *exact* scoring function rather than a
lookalike; a parallel formula that agrees today will drift the first time the
rubric changes, and the drift shows up as a plan that promises points the
score cannot deliver.

Model drift defensively at the edges rather than crashing on it: an unknown
dimension identifier carries zero weight, an unknown lens falls back to the
declared default, and a target dimension absent from the inputs projects a
zero-point gain. A stored assessment from an older schema should render a
modest plan, not an error page.

## Projected and realized are different fields

Keep them structurally separate: different field names, different types where
the language allows, different provenance, different rendering. The failure
this prevents is a product that reports "improvements delivered" by summing
what it once predicted — reporting achievements nobody made. A realized gain
is computed by re-scoring after the work, against the same rubric version;
if the rubric changed in between, the difference is not attributable to the
work at all, and the honest report says so rather than crediting the delta to
the plan.

## Rendering rules

- Projections render in a register the reader can distinguish from measured
  values at a glance — a consistent prefix, an explicit "projected" label, or
  a distinct treatment applied everywhere, never only in the detail view.
- Precision matches confidence. A model with a hand-chosen coefficient does
  not report two decimal places; whole numbers, or coarse buckets, tell the
  truth about the resolution of the estimate.
- Where a projection cannot be computed for a move — no weight linkage, no
  assumable post-move value — show the item **without a number** rather than
  with a placeholder. An item honestly carrying "no estimate available" is
  more useful than one carrying a fabricated one, and vastly more useful than
  one silently dropped from the plan for lacking a number.

## When not to use it

- **When the score is not composite.** A single-signal assessment's "gain" is
  the signal's own movement; a modelling layer adds ceremony and a second
  place to drift.
- **When no move maps to a scored dimension.** Advice worth giving that the
  rubric cannot see should be given as advice, without a number, rather than
  forced into the scoring frame to earn a place in the ranking.
