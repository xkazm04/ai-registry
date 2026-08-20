---
layer: technique
type: technique
subject: maturity-ladders
technique: rung-criteria
status: forged
laws: [count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [writing a new maturity rung, two assessors disagree on a rung, auditing an inherited ladder]
---

# Rung criteria

A rung's criteria are the only thing standing between a ladder and a vibe. The
target property is **intersubjective verifiability**: two competent assessors,
given the criteria and the same subject, independently reach the same rung. That
is a testable property, and testing it is the technique's acceptance gate.

## Write predicates, not adjectives

Every criterion is a sentence about which the answer is yes or no from an
observation, not from a judgment of degree. The reliable form is:

> *observable artifact or event* + *property that can be checked* + *where it is
> checked*

"Change management is mature" fails on all three. "Every merge to the release
branch carries a linked review record, and the branch rejects merges without
one" names the artifact (review record), the property (linked, required), and
the site (the branch's merge path).

Adjectives that must never carry a criterion alone: *mature, robust, adequate,
consistent, well-defined, appropriate, sufficient, comprehensive, effective*.
Each is a place where the assessor's optimism becomes the measurement. Where a
degree is genuinely intended, convert it into a threshold with a stated
denominator — "at least three quarters of services", not "most services" — and
remember the count carries its predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)): the criterion
states what is counted and how it is observed, or two assessors will count
different populations and both be right.

## The denial test

For each criterion, write down the single observation that would deny it. If you
cannot, delete the criterion — it is unfalsifiable and will always be satisfied.
This is cheap to do and catches most defects at authoring time:

- *Criterion:* "a dependency policy exists" — *denial:* no such document is
  reachable from the project root or its documented index. Good.
- *Criterion:* "the team values reliability" — *denial:* none available. Delete.
- *Criterion:* "the policy is enforced" — *denial:* a violating change merged
  without being blocked. Good, but note that this denial requires an *event*, so
  the criterion's evidence class is different from the ones above; that
  distinction is [present-vs-enforced](./present-vs-enforced.md).

Denials are also the ladder's regression suite: keep them beside the criteria,
because a criterion whose denial has become unobservable (the log was retired,
the gate moved) has silently stopped being assessable, and an unassessable
criterion that keeps returning "satisfied" is exactly the empty-success failure
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## Cumulativity, stated explicitly

Write rung *n* as "everything in rung *n-1*, plus …" and mean it literally. Two
consequences:

1. **Never repeat a lower rung's criteria in a higher rung.** Duplicated text
   drifts; when it drifts, the ladder contains two contradictory definitions of
   the same requirement and nobody knows which was applied.
2. **Test the cascade.** A subject that satisfies the rung-3 additions but fails
   a rung-2 criterion is at rung 1. If your evaluation code can produce rung 3
   in that case, it is not implementing a ladder — it is implementing a
   checklist with a maximum function on top.

If some capability genuinely does not stack — a subject can legitimately have
the rung-3 property without the rung-2 property — you have discovered a second
dimension. Split it into a second ladder rather than bending the order; two
short ladders that are each honestly ordered beat one long ladder that is not.

## Granularity: one rung per distinct next action

Add a rung only when the advice to a subject sitting on it differs from the
advice on both neighbours. If the recommended next move for rung 3 and rung 4 is
the same sentence, they are one rung with a decorative boundary, and the boundary
will absorb assessor time forever. Conversely, if a single rung's population
receives three different pieces of advice depending on which criterion they miss,
the rung is hiding a split.

The floor rung is always **absence**, named as absence ("none", "absent"), never
as a euphemism ("initial", "beginning"). Absence is the most common true answer
for a new subject, and a ladder that cannot say it will say something kinder and
wrong.

## Evidence classes belong in the criterion

Each criterion names *what kind of evidence* satisfies it, because the same
sentence read with different evidence standards produces different rungs:

- **Declared** — someone asserted it (a survey answer, a field in a form).
  Weakest; acceptable only for rungs that are about intent.
- **Referenced** — an artifact is named or linked, but its content was not read.
  A link is not a document; a reference to a policy is not a policy.
- **Inspected** — the artifact's content was retrieved and checked against the
  property. This is the normal standard for middle rungs.
- **Observed in operation** — an event record shows the mechanism running, and
  ideally failing at least once. Reserve for the top rung.

State the class per criterion. The single highest-value rule that falls out:
**only inspected content may satisfy a top rung.** A ladder that promotes on a
reference will promote on a broken link.

## When ambiguity remains, score down — by rule

Criteria will still land in the grey. Write the tie-break into the ladder itself
rather than leaving it to temperament: *when the evidence for a rung is arguable,
record the lower rung and note the ambiguity.* This is not pessimism, it is
error-symmetry — a rung recorded too high is invisible (nobody investigates good
news) while a rung recorded too low is self-correcting (the subject objects, with
evidence, and the assessment improves).

## When not to use this

Do not write criteria at this precision for a ladder that will be used once, by
one person, to sort a list. The cost is real and it buys reproducibility, which
matters only when the assessment is stored, repeated, or compared. And do not
push precision so far that criteria encode a specific tool's output format — a
criterion that can only be evaluated by one implementation is a rung that cannot
survive the implementation being replaced.
