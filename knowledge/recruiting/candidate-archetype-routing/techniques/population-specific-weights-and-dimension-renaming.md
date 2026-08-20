---
layer: technique
type: technique
subject: candidate-archetype-routing
technique: population-specific-weights-and-dimension-renaming
status: forged
laws: [meaning-does-not-live-in-a-label, a-verdict-is-bound-to-what-it-judged]
use_when: [defining the scoring dimensions for a candidate population, a rubric is being reused across populations with adjusted weights, validating a weight configuration]
shared_with: []
---

# Population-specific weights and dimension renaming

## The concern

Once a candidate has been routed, the routing has to *mean* something, and the weak form
of meaning it — one rubric, one set of axes, a multiplier adjusted per population — is
worse than not routing at all. It produces numbers that look comparable across
populations, so people compare them; and it evaluates every candidate against the same
underlying questions, so a candidate without conventional experience is still measured by
how much conventional experience they have, just with the answer scaled.

The technique is that each archetype gets **its own dimensions, its own names for them,
and its own weights over them** — three different rubrics, not one rubric with three
settings. Renaming is not cosmetic. It is the mechanism that makes cross-population
comparison impossible by construction, and it changes what reviewers actually think
about.

## The procedure

1. **Design each population's dimensions from its own evidence.** Ask what is actually
   knowable about this kind of candidate and what actually predicts success for them.
   For an experienced candidate that is typically demonstrated skill, the shape of the
   career, and personal signals — with skill dominant, because it is the thing there is
   most evidence about. For an early-career or career-changing candidate it is typically
   foundation, potential and fit — because the record holds groundwork and trajectory
   rather than a track record.
2. **Rename, do not remap.** The early-career axes are not "experience with a
   discount"; they are different questions with different names. If a dimension keeps
   the same name across populations, check that it really is the same question — usually
   it is not, and the shared name is the bug.
3. **Weight within the population and never across it.** Weights are a distribution over
   that population's own axes. There is deliberately no formula relating one
   population's score to another's.
4. **Make each weight vector sum to one, and enforce it at load.** Refuse to start on a
   vector that does not. See below — this is the highest-value validation in the whole
   subject.
5. **Publish dimension names and weights together in the shared declaration**, so a
   recruiter can be shown exactly how each population is evaluated. A per-population
   rubric that only engineers can enumerate is not defensible.
6. **Stamp scores with the rubric version they were produced under.** When weights or
   dimension names change, previously computed scores were produced by a different
   instrument, and they must be marked as such rather than silently re-meant
   ([a verdict is bound to what it judged](../../_laws.md#a-verdict-is-bound-to-what-it-judged)).
7. **Forbid cross-population ranking in the surfaces, not just in the docs.** If a list
   mixes archetypes, it groups or labels; it does not sort by a number whose meaning
   changes row to row.

## Decision rules

- **When two populations would share a dimension name, they must share the question
  exactly.** Otherwise rename one. A shared label across different meanings is the
  purest form of the failure that
  [meaning does not live in a label](../../_laws.md#meaning-does-not-live-in-a-label)
  describes: rules, reviewers and dashboards all derive meaning from the string.
- **When someone asks to compare an early-career score with an experienced score, the
  correct answer is that the comparison is undefined.** Not "roughly equivalent", not
  "adjust by a factor". Undefined. If a shortlist genuinely needs one ordering, it needs
  a decision by a person about the role, not an arithmetic bridge between two rubrics.
- **When a weight vector fails the sum check, fail the load — loudly, at startup, naming
  the population and the actual sum.** Do not normalize silently. Silent normalization
  produces a working system with a policy nobody wrote.
- **When adding a dimension, re-derive the whole vector rather than shrinking the others
  proportionally.** Proportional shrink preserves the arithmetic and destroys the intent;
  the point of adding an axis is that the relative importance changed.
- **When a population's weights are being tuned to move one candidate, stop.** The
  weight vector is a statement about what matters for a whole population and must be
  justified at that level.
- **When a population is renamed for the recruiter-facing surface, keep the stable
  internal key.** Display strings change; the key that rules and stored scores reference
  does not.

## Why the sum-to-one check earns its place

It reads like schema pedantry and it is the single most valuable assertion in the
routing system, because of the failure it prevents. A one-digit typo in a weight — a
`0.5` that should be `0.05`, a missing decimal — does not crash anything, does not log
anything, and does not produce an output that looks wrong. It **rescales every score in
that population**, consistently. The ranking within the population stays internally
plausible. The tiers shift. The shortlist changes. And every downstream check passes,
because they are all checking relative ordering against a ruler that bent uniformly.

Nothing downstream can catch it. Not a snapshot test, because the new numbers are
self-consistent. Not a reviewer, because a shortlist of plausible candidates looks like
a shortlist of plausible candidates. Not a fairness metric, because the effect is
uniform within the affected population. Only the sum catches it, and only at load, before
a single candidate has been scored on the bent ruler.

The check must therefore be an import-time invariant of the configuration, not a unit
test — a test protects the values in the repository, while a load-time check protects
whatever the running system was actually handed.

## When NOT to use it

- **Not with more populations than you can staff.** Every archetype needs its own
  dimensions, its own weights, its own tuning and its own periodic review. Three or four
  populations is a real programme of work; a dozen is a configuration surface nobody
  maintains and every vector goes stale together.
- **Not where the populations genuinely share an instrument.** If two archetypes are
  scored on identical questions with identical intent, they are one population with a
  display distinction, and splitting them creates two rubrics that will drift apart for
  no reason.
- **Not as a substitute for validating the instrument.** Per-population weights make the
  rubric appropriate; they do not make it predictive. Whether a dimension predicts
  anything is a separate, harder question belonging to score calibration, and a
  well-formed weight vector over meaningless axes is still meaningless.
- **Not for legally-sensitive differentiation.** Scoring populations differently is
  defensible when the populations are evidence shapes and the differences are about what
  evidence exists. It is not defensible when the population correlates with a protected
  characteristic and the weights advantage one — that is a different analysis, and it
  belongs to adverse-impact work, not to rubric design.
