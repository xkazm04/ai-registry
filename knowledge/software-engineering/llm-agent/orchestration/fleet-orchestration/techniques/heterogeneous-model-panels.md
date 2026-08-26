---
layer: technique
type: technique
subject: fleet-orchestration
technique: heterogeneous-model-panels
status: forged
laws: [count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [a month-scale decision rests on one model's opinion, grokking a new tool or release with no in-house experience, a debate transcript is being read as evidence, deciding whether N calls should be one model sampled N times or N models convened once]
---

# Heterogeneous model panels

Most fleet runs are task-parallel: N sessions, N different tasks, one
aggregate. A panel inverts the shape — **N sessions, one question, N different
models** — and it exists to buy something no amount of sampling one model can
buy: answers whose errors are decorrelated because the members were trained
apart. The panel is still a fleet run; dispatch, roster accounting, and
harvest all apply unchanged. What this technique owns is when convening one is
worth N-times the spend, and which parts of the ritual carry the signal.

## The baseline the panel must beat

The cheap alternative is always available: sample your single best model N
times and vote. Measured head-to-head, homogeneous multi-round debate performs
about as well as that voting baseline at equal call count — and worse than
voting at equal *response* count — so the debate machinery itself is not where
the value lives. What voting one model cannot produce is **cross-family
agreement**: when independently trained models, behind different providers and
different training corpora, reach the same verdict from the same evidence,
that concordance is evidence of a kind a single family cannot generate about
itself. The panel's product is the concordance structure, not the transcript.

Two consequences follow directly:

- **A panel of one family is a sampling run wearing a costume.** If every seat
  resolves to variants of the same weights, convene nothing — vote.
- **Panels are for decision-shaped questions, not generation.** A question
  whose answer will bind for months, a new tool or release nobody in-house has
  touched, a claim that deserves a genuine attempt at refutation. Routine
  generation through a panel multiplies cost by N for a consistency gain the
  voting baseline already had.

## Round one is the product

Elicit every member's position **before any member sees another's**.
Independence is the entire epistemic value of the panel, and it is destroyed
in exactly one direction — exchange before commitment — so the orchestrator
sequences commitment first, exchange after, and the harvest records which
answers predate contamination.

Later rounds, where members read each other and may revise, are consistency
machinery: analysis of simultaneous-revision debate shows belief in the
correct answer moves as a martingale — no expected gain beyond what the
first-round vote already held. Rounds therefore get a **cap declared at
dispatch**, and "no member budged" is a completed measurement, not a failed
debate ([failure ≠ empty success](../../../../_laws.md#failure-not-empty-success)
applied to deliberation: an unchanged-positions round is a result, and it says
stop). What revision rounds are good for is surfacing *why* the dissenter
dissents — the argument structure — not for manufacturing agreement, and a
panel that converges only after exchange has produced conformity, which reads
identical to concordance in a summary and must not be recorded as it.

## The verdict carries its structure

A panel's finding is a count with predicates, never a headline
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)):
*which* members held the position, *independently or after exchange*, at
*what per-seat cost*. "Three of three families independently rejected the
claim" and "three of three agreed by round four" are different findings with
different weight. Divergence is equally first-class — a panel that splits has
located the uncertainty, which is often the thing the convener actually
needed. And because every question through a panel is also a live side-by-side
of the roster, the per-seat record (quality of position, latency, spend)
doubles as comparative measurement feeding whatever ranks the roster —
measurement the operator gets for free precisely because the members answered
the *same* question under the same evidence.

## Seats are masked and roles are explicit

- **Members are addressed by seat alias, never by model name.** Own-family
  preference and self-recognition are measured biases (the eval-side evidence
  lives in judge-stability); a member that can attribute positions to named
  rivals is reasoning about reputation as well as content. Masking costs
  nothing and removes the channel.
- **Symmetric panels for opinions and refutation; one synthesizer seat for
  builds.** When the panel must produce an artifact rather than a verdict, the
  working shape is proposers plus a single designated synthesizer that owns
  merging the proposals and the final integration. The synthesizer seat is
  where capability concentrates — staff it with the strongest member and spend
  down on proposers, because synthesis is where a weak model quietly discards
  the panel's diversity.
- **The synthesizer is a seat, not a second harvest.** Its merged artifact
  re-enters the ordinary result contract and roster accounting like any
  session's output; the fleet's harvest still accounts for every seat,
  including proposers whose plans were discarded.

## The produce–review pair: the two-seat form for routine work

The rule above — panels are for decision-shaped questions, not generation —
leaves routine generation with no way to buy decorrelation at all, and
routine generation is where most of a fleet's output comes from. The cheap
form that fills the gap is sequential and asymmetric: **one seat produces
the artifact, one seat from a different family reviews it**, every time, as
the standing shape of the pipeline rather than a convened event. It is not
a panel — there is no simultaneous elicitation, no concordance structure,
no N-times multiplier — but it is bought with the same currency: a reviewer
trained apart from the producer does not share the producer's blind spots,
where a same-family reviewer re-runs them and calls the result a review.
The correlated-judges argument in
[judgment-guardbands](../../../evaluation-and-cost/judgment-guardbands/judgment-guardbands.md)
is the same fact from the scoring side: an average over correlated biases
is a more confident version of the same bias, and a same-family
produce–review pair is that average with two samples.

Three rules keep the pair honest:

- **The review seat is fixed by policy, not picked per run.** "Producer's
  family ≠ reviewer's family" is a one-line routing constraint; left to
  per-run convenience it decays to whichever model is already warm, which
  is the producer's.
- **Stacking further reviewers pays only while they are differently
  sourced.** A second reviewer from a third family keeps finding new
  classes of defect; a second reviewer from either seated family mostly
  re-finds. Diversity, not count, is the axis that buys coverage.
- **The pair does not replace the panel where the panel is owed.** A
  month-scale decision still gets simultaneous independent elicitation;
  the pair is a generation-pipeline discipline, and its verdicts are
  review findings, never concordance evidence.

## Smells

- The debate transcript circulated as the deliverable, concordance structure
  nowhere stated.
- Seat prompts that name the other members' models.
- A "diverse panel" whose seats resolve to one family under the grouping the
  routing layer already maintains.
- No round cap, or rounds continued after an unchanged-positions round.
- A verdict published without per-seat attribution or cost — the two facts
  that let anyone later weigh it or price repeating it.
- Panels as the default path for routine work, with no voting-baseline
  comparison on record justifying the multiplier.
