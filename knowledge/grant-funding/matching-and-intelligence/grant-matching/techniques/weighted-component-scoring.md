---
layer: technique
type: technique
subject: grant-matching
technique: weighted-component-scoring
status: forged
laws: [hard-gates-precede-soft-scores, honest-null-over-forced-guess]
shared_with: []
use_when: [designing the ranking backbone of a matcher, tuning why the wrong grants rank high, adding a "related opportunities" similarity ranking]
---

# Weighted component scoring

The concern: a matcher needs a total ordering over eligible opportunities, and
that ordering must be predictable, tunable and explainable. The technique is to
build the score as a **sum of a few named components** — each measuring one
dimension the organization cares about, each with an explicit maximum — rather
than as one opaque similarity number. For an org-to-opportunity match the
canonical decomposition is *mission*, *geography*, and *award size*; for
item-to-item similarity ("opportunities like this one") it is *taxonomy
overlap*, *same funder*, *jurisdiction*, and *award band*. The components
change; the discipline does not.

## Procedure

1. **Name the components before weighting them.** Each component answers one
   question a program officer would ask ("do they fund our kind of work
   here, at our scale?"). If you cannot name the question, it is not a
   component — it is noise.
2. **Assign weights as an editorial judgment, summing to a round total.**
   Weights are a statement about which dimension carries genuine ranking
   signal. Rule: the dimension that is *mostly a gate* (geography, award
   size — usually near-binary once eligibility passed) gets a minority share;
   the dimension with continuous, discriminating signal (mission/topical fit)
   gets the plurality. A 50/30/20 mission/geography/award split is a sane
   starting point for org-to-opportunity ranking; for item similarity,
   taxonomy overlap deserves the plurality for the same reason.
3. **Score each component independently, in its own unit, capped at its
   maximum.** Partial credit is allowed and should be deliberate: a
   nationally-open program is a real but weaker geographic fit than one
   naming the org's own city — credit it at a fixed fraction (e.g. 60% of the
   geography maximum), not zero and not full marks.
4. **Encode hierarchy inside a component with tiered credit.** When one
   signal subsumes another, score the strong tier fully and the fallback tier
   at a token value — same-funder continuity worth several times
   same-funder-*type* — rather than letting both accumulate.
5. **Score unknowns with an honest neutral.** A missing value gets a small
   fixed default (or zero), never the component maximum. An unpublished award
   range is not evidence of fit; it is absence of evidence.
6. **Clamp the total** into the declared range, and keep the components
   attached to the result — downstream explanation and debugging need the
   parts, not just the sum.

## Decision rules

- **When a check is pass/fail in nature, gate — don't weight.** A hard
  geography mismatch (wrong country for a national-only program) scores the
  component zero *and* should already have failed eligibility; never let a
  strong mission score "average away" an impossibility.
- **When a structured field and a text heuristic disagree,** the structured
  field wins for gating and the text heuristic only *adds* credit. Prose
  saying "national" on a foreign program must not out-vote a country field.
- **When a signal is detectable only by text pattern** (e.g. "is this a
  federal/nationwide funder"), write the detector conservatively and document
  its known false positives — a sub-national agency whose name contains
  federal-sounding words is the classic one; require disambiguating anchors
  before granting the credit.
- **When amounts cross currencies,** normalize to one currency at ingest and
  score against the normalized value. A five-million-unit award in a minor
  currency scored as if it were the org's own currency corrupts the size
  component silently.
- **When tuning,** change one weight or one component's internals at a time
  and re-rank a fixed evaluation set. Weighted sums are legible precisely so
  that tuning is diffing, not divination.

## When NOT to use it

- When there is no eligible set yet — component scoring ranks; it does not
  decide eligibility, and running it as a substitute for the gate violates
  the gate-first law.
- When the components would exceed roughly five or six: past that, weights
  stop being an editorial statement and become an unfit regression; either
  merge components or move to a learned ranker *with* this technique retained
  as the explainable baseline.
- For qualitative judgment (tone of the RFP, funder-priority nuance) — that
  is the model lane's job; forcing it into a hand-weighted component produces
  a number nobody can defend.
