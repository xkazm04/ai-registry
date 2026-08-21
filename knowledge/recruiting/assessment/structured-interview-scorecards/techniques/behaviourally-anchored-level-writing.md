---
layer: technique
type: technique
subject: structured-interview-scorecards
technique: behaviourally-anchored-level-writing
status: forged
laws: [meaning-does-not-live-in-a-label, inference-must-look-like-inference]
shared_with: []
use_when: [authoring or revising the anchors for a competency, two raters disagree on a level, a scale's midpoint is absorbing most ratings]
---

# Behaviourally anchored level writing

The concern is the prose under each level of each competency: the paragraphs a
rater matches an observation against. Get these right and the rest of the
instrument is bookkeeping. Get them wrong and every downstream discipline —
evidence, calibration, comparison — is operating on a scale whose points do not
mean anything stable.

## The rule that generates all the others

**An anchor describes what a person did, at a level of detail that lets a
stranger recognise it.** Not what they are, not how much of a quality they have,
not how the rater felt. The test is mechanical: strike every evaluative word from
the anchor. If what remains still identifies a level, the anchor is behavioural.
If what remains is empty, the anchor was a degree word wearing a paragraph.

"Strong problem-solving" survives to "problem-solving" — empty. "Restates the
problem in their own terms, names the constraint they think is binding, and
checks that assumption before proposing an approach" survives intact.

## The bottom of the scale carries the weight

Write level 1 first, and write it as hard as level 5. Three reasons:

- **It is where adverse decisions are made.** A rating that contributes to a
  rejection is explained by its anchor. "Does not meet the bar" explains nothing.
- **Negation is not description.** The absence of the top behaviour covers
  everything from "did the opposite" to "was never asked". Those are different
  findings and one of them is not a rating at all
  (see unassessed-competency-handling).
- **The failure modes are specific and recognisable.** Real low performance has
  a shape — a characteristic wrong move — and naming that move is what lets a
  rater distinguish a weak performance from an unobserved one.

The strongest low anchors name a *behaviour with a direction*: not "does not
accept feedback" but "reflexively defends against the hint, or ignores it and
continues on the original path". A rater watching a candidate can confirm or
disconfirm that. They cannot confirm an absence.

## Levels must differ in kind at the top, not in intensity

The common defect at the top of a scale is that levels 3, 4 and 5 are the same
behaviour with escalating adverbs — "handles feedback", "handles feedback well",
"handles feedback extremely well". A usable ladder changes what the person *does*
at each step:

| Level | What changes |
| --- | --- |
| 1 | the characteristic wrong move, named |
| 2 | the right move, attempted but not completed, or only under prompting |
| 3 | the expected behaviour, unprompted and sufficient — this is the bar |
| 4 | the expected behaviour plus one thing the bar does not require |
| 5 | a qualitatively different move: generalising, anticipating, or improving the question |

The worked shape of a good ladder: at 1 the candidate ignores or defends against
a hint; at 3 they take the hint and correct course; at 5 they probe the hint, ask
a sharpening question, and generalise it beyond the immediate problem. Each step
is a different act, not a stronger one.

## Name the bar explicitly

One level is *the bar* — the performance that gets a hire at this level for this
role — and the scale must say which. Scales that omit it drift: without a stated
bar, raters place the bar at the midpoint by reflex, and the top two levels become
unreachable while the bottom two go unused. Labelling the anchor set from "well
below the bar" through "meets the bar" to "exceptional" costs nothing and stops
the drift, because the label is a claim about the decision, not about the
candidate.

Five levels is the workable default: enough to distinguish clearly-below,
below, at, above and exceptional, few enough that raters can hold the ladder in
mind. Adding levels does not add resolution; it adds argument. Removing the
midpoint to force a decision (an even-numbered scale) trades one distortion for
another and is only worth it when the instrument's job is a binary and the anchors
say so.

## Retranslation is the acceptance test

Before a rubric goes live, run the anchors past people who did not write them:

1. Strip competency headers and level numbers from every anchor paragraph.
2. Shuffle them.
3. Ask the reviewers to assign each one to a competency and to a level.

Anchors that land under the wrong competency are measuring something other than
what the header claims — usually general polish, which is how halo enters a
rubric at design time. Anchors that land out of order are not distinguishable in
use, so the scale has fewer real levels than boxes. Both are cheap to fix before
launch and expensive to discover from a year of ratings.

The same exercise repeated on live transcript fragments is calibration; the
difference is only whether the material under test is the anchor or the rater.

## Where the anchors come from

Anchors are written from observed behaviour in the role, not deduced from a
competency dictionary. The practical source is the set of interviews already run:
the responses that made people confident, the responses that made people uneasy,
and — most valuable — the responses the panel argued about. A ladder written from
argued cases distinguishes exactly where distinguishing is hard.

Where a machine drafts anchors, treat the draft as a first pass that has never
seen a candidate: it will produce fluent, symmetric, evaluative prose that fails
the strike-the-adjectives test almost everywhere, and it will invent behaviours
that sound right for the competency and never occur in your loops. The draft is a
starting point for retranslation, not a rubric
([inference must look like inference](../../../_laws.md#inference-must-look-like-inference)).

## When not to use this

- **Do not anchor a dimension you cannot observe in the room.** If the only
  honest evidence for a competency is a work sample or a reference, it is not an
  interview axis, and behavioural anchors will invite raters to score an
  inference at the same visual weight as an observation.
- **Do not anchor traits.** Anchors describe acts. A competency phrased as a
  disposition either resolves to acts — in which case rename it after the acts —
  or it does not, in which case it does not belong on an interview scorecard.
- **Do not rewrite anchors mid-cycle without versioning.** Sharpening an anchor
  changes what every future rating means and, if unversioned, what every past
  rating appears to have meant (see rubric-versioning-at-write-time).
