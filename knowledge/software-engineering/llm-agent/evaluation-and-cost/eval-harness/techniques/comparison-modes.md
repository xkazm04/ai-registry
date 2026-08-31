---
layer: technique
type: technique
subject: eval-harness
technique: comparison-modes
status: forged
laws: [count-carries-predicate, identity-survives-reuse]
shared_with: []
use_when: [deciding what question an eval answers, verdict flips when pair order mirrors, headline winner hides losing cells]
---

# Comparison modes

An eval answers one of three questions, and each question has its own run
geometry: **"is this good enough?"** (absolute scoring against a rubric),
**"which of these two is better?"** (pairwise arena), and **"how does
quality vary across this space?"** (matrix runs over model × variant ×
scenario). Choosing the wrong mode does not produce wrong numbers — it
produces *correct numbers that answer a question nobody asked*, which is
worse, because they get reused as if they answered yours.

## Absolute scoring: the threshold question

One candidate, scored per scenario against a rubric, aggregated to a
number or a pass-rate. This is the only mode that supports a *gate* ("ship
if above X") and the only mode that produces longitudinal series ("track
this score across versions") — provided the instrument holds still, which
is the whole burden of [scenario-design](./scenario-design.md) and
[judge-stability](./judge-stability.md): fixed scenarios, pinned judge, or
the series is fiction.

Its characteristic lie is **scale drift disguised as change**: absolute
numbers move when the judge, rubric, or scenario set moves, and a reader of
the chart cannot tell that from the product moving. Every plotted point
carries its instrument versions
([_laws: count-carries-predicate_](../../../../_laws.md#count-carries-predicate)),
and any instrument change is a marked discontinuity, never a smooth line
through it.

## Pairwise arenas: the preference question

Two candidates answer the same scenario; a judge (or human) picks a winner;
win-rate aggregates over scenarios. Pairwise is the right tool when no
trustworthy absolute scale exists — "better than" is an easier judgment
than "7 out of 10," for models and humans alike — and it is the natural
mode for prompt or variant shootouts.

Its pathologies are specific and standard:

- **Position bias** — judges measurably favor one presentation slot. Every
  pair is scored both ways (mirrored order); a verdict that flips under
  mirroring is recorded as a tie, not silently resolved.
- **Ties need a home.** Forcing a winner on a genuine tie manufactures
  signal from noise; win-rates are reported as win/loss/tie, and the tie
  mass is part of the finding.
- **Win-rate compresses magnitude.** Beating a rival 60% of the time by a
  hair and 60% of the time by a mile are the same number. Pairwise ranks;
  it does not size the gap.
- **Intransitivity is real.** A beats B, B beats C, C beats A happens with
  non-deterministic candidates and scenario-dependent strengths. A total
  order extracted from pairwise data is a summary that discards this — fine
  when stated, misleading when not.
- **No gate, no trend.** A win-rate is relative to an opponent; it cannot
  say "good enough," and it does not compare across time unless the
  opponent is frozen too.

### The opponent that is a previous you

The frozen-opponent rule has one violation worth naming separately, because
it is not a mistake teams drift into — it is the thing they reach for
deliberately when no external reference exists: **the opponent is an earlier
version of the candidate.**

Self-referential comparison is cheap, always available, and produces a
number that climbs reliably. That reliability is the defect. Beating your
own ancestors measures *divergence* from them, and divergence is unbounded
and free — a system can be tuned to defeat every previous version of itself,
posting an apparent gain of a thousand rating points or more, while being no
stronger against any opponent outside its own lineage and often weaker
against one that plays differently, because the lineage has spent its whole
history optimizing against a single style.

Two rules follow. First, a self-referential score is an **internal progress
signal and never a strength claim**; when it is reported, what it is relative
to is reported with it, in the same sentence. Second, the gain must be shown
to survive contact with an external reference before it is believed — and
where no external reference exists at all, *that absence is the finding*.
"We have no opponent outside our own lineage" is a fact about the evaluation
that belongs in the result, not a gap to be papered over with the only
number that happens to be available.

The self-referential trap and the win-rate's missing gate are the same
defect seen from two sides: a relative measure whose reference has been
allowed to move.

## Matrix runs: the landscape question

The full cross-product — candidates × configurations × scenarios, each cell
run N times — answers "where is quality strong and weak, and how do the
axes interact?" This is the mode for model-selection surveys, cost/quality
frontier mapping, and locating which scenario regions a candidate fails.

Two disciplines keep a matrix honest:

- **Cell identity.** A cell is the tuple of its coordinates plus every
  version and parameter that shaped it, minted when the run is planned, so
  results attach to identities that survive reruns, partial retries, and
  grid extensions
  ([_laws: identity-survives-reuse_](../../../../_laws.md#identity-survives-reuse)).
  A matrix keyed by display position is destroyed by its first added row.
- **Aggregation is declared with the run, not chosen after.** N trials per
  cell collapse to a cell verdict by a declared rule — mean, median,
  pass-rate, worst-of-N — and cells collapse to a **declared winner** by a
  declared rule. Choosing the aggregation after seeing the results is the
  quiet form of p-hacking; the harness computes the winner from the
  pre-declared rule, and any post-hoc re-slicing is labeled exploratory.
  (How multi-criterion cell scores compose is scoring-rubrics territory;
  this technique owns *that the rule precedes the data*.)

The matrix's characteristic lie is **the collapsed margin**: a headline
"variant A wins" hiding cells where A loses badly. The per-cell surface is
the finding; the winner is a summary of it. Report both, and mark
empty-or-errored cells as such — an incomplete matrix rendered as a
complete one misleads precisely at the cells that failed to run.

## Choosing, and switching

- Gating a release or tracking quality over time → **absolute**, on a
  frozen instrument.
- Picking between two concrete alternatives, no trusted scale → **pairwise**,
  mirrored, with ties.
- Surveying a decision space, hunting weak regions, mapping cost against
  quality → **matrix**, with declared aggregation.

The modes compose over a lifecycle: a matrix to shortlist, pairwise to
settle a close call, absolute to gate and monitor what shipped. What does
not compose is their *numbers* — a win-rate, an absolute score, and a
matrix ranking are three different quantities, and any report that lets
one impersonate another has already lied, whatever the data said.
