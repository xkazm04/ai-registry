---
layer: technique
type: technique
subject: adoption-measurement
technique: adoption-vs-outcome-separation
status: forged
laws: [count-carries-predicate, one-authority-per-vocabulary]
shared_with: []
use_when: [an uptake number is about to be presented as a business result, designing a rollout dashboard that shows adoption and delivery together, a composite score would include an adoption dimension]
---

# Adoption/outcome separation

## The concern

The sentence everybody wants is "we rolled out X and delivery improved by
Y%". It is the sentence that renews budgets, and it is almost never
supportable by the instruments an adoption program actually has. The
discipline of this technique is to make the unsupportable version
*structurally hard to produce* rather than merely discouraged — because
discouragement fails at exactly the moment it matters, when a real program
with real uptake needs a number for a real review.

Two ledgers, therefore. The **adoption ledger** records uptake: who took up
what, how deeply, when, with what provenance. The **outcome ledger** records
delivery, quality, cost, capability — measured by their own instruments,
against their own definitions, on their own cadence. They may be shown on the
same page. No automated path converts a value in one into a value in the
other.

## The procedure

1. **Separate the computations.** The uptake figure and the outcome figure
   are produced by different code paths, from different inputs, with no
   shared derivation step. Where a single assembly renders both, it composes
   two finished results; it never computes one from the other.
2. **Label the relationship in the payload, not just the caption.** The
   outcome block travels marked as *context shown alongside*, and consumers —
   exports, generated summaries, downstream briefs — read that marking. A
   caption on a chart protects only the reader who is looking at the chart.
3. **Forbid adoption as a dimension in any outcome composite.** A score that
   rises because a practice spread, independently of whether anything
   improved, is a metric the measured party can move without doing the work.
   If leadership wants one number, give them two.
4. **Render the outcome block absent, not zero, when it is unmeasured.** A
   null outcome and a zero outcome are different findings and a zero will be
   read as a result. Absence with a stated reason is the honest render — the
   same rule that governs any unmeasured value, applied where the temptation
   to fill it is strongest.
5. **State the direction of every joint sentence explicitly.** Every place
   both ledgers appear, the copy states that co-presentation is not
   attribution. Write it once, in the producer, and let every surface inherit
   it rather than trusting each author to remember.

## The phrasings

Sentences that survive review:

- "Sixty per cent of eligible teams have adopted the practice; over the same
  period, review latency fell 12%. The two are shown together as context and
  the comparison does not establish that one caused the other."
- "Among teams with a complete before/after pair, assessed capability moved
  +6 points after adoption. This is observational movement, not an effect
  estimate."
- "Adoption is up and the outcome ledger shows no movement." — publish this
  one. A program that only ever reports the periods where both moved is not
  running an instrument.

Sentences that do not:

- "Adoption drove a 12% improvement."
- "Each additional adopting team is worth N hours per quarter."
- "Projected annual value of the rollout at current adoption." — a
  multiplication of an uptake number by an unmeasured per-unit benefit is the
  fabricated tier of this subject, wearing a spreadsheet.

## Decision rules

- If a requested figure requires dividing an outcome by an adoption count,
  refuse it. Cost-per-adopter, hours-saved-per-adopting-team, and
  value-per-seat all encode a causal claim in the unit of the answer, which
  is the hardest kind to spot in review.
- If both ledgers are on one surface, each carries its own denominator,
  window, and provenance (`count-carries-predicate`). Two numbers over
  different populations placed side by side already imply a comparison that
  is not valid.
- If a governance or quality signal exists for the practice itself — whether
  adopted use was done properly, reviewed, checked — it belongs in the
  adoption ledger, not the outcome one. "Adopted and governed" is still a
  statement about uptake.
- If someone genuinely needs a causal answer, the escalation is a study
  design, not a better chart: a staged rollout with a comparison group, a
  pre-registered question, and someone accountable for the analysis. Say that
  out loud rather than approximating it.
- If the same term appears in both ledgers with different meanings, fix the
  vocabulary before shipping either (`one-authority-per-vocabulary`). Shared
  words are how the ledgers get joined by accident.

## Why the separation protects the adoption number

The usual argument for the wall is that outcome claims must be defensible.
The stronger argument runs the other way: an adoption number that is never
asked to prove value is never under pressure to inflate. The moment uptake
becomes the evidence of benefit, every ambiguous signal starts resolving
upward — the background sync becomes a use, the seat becomes an adopter, the
trial becomes routine. The wall is what lets the adoption ledger stay boring
and true, and a boring true uptake number is worth considerably more, over
several years, than a persuasive one.

## When not to use this

- **Not where a real experiment exists.** If a genuine controlled comparison
  was run, its causal claim is its own to make; do not launder it back down
  into "context shown alongside" out of habit.
- **Not to avoid reporting outcomes at all.** The separation is a wall
  between two published ledgers, not an excuse to publish only the flattering
  one. A program that reports uptake and never measures whether anything
  improved has replaced evidence with activity.
- **Not for a practice whose adoption *is* the outcome** — a compliance
  requirement, a mandated control, a migration that must reach 100%. There
  uptake is the goal by definition, and the honest report is coverage against
  a stated population, with no outcome ledger implied.
