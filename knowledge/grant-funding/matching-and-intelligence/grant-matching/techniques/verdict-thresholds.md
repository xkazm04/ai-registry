---
layer: technique
type: technique
subject: grant-matching
technique: verdict-thresholds
status: forged
laws: [hard-gates-precede-soft-scores, honest-null-over-forced-guess]
shared_with: []
use_when: [turning fit scores into user-facing recommendations, deciding how eligibility failures interact with high fit scores]
---

# Verdict thresholds

The concern: a 0-100 fit score is the ranker's internal currency, not a
recommendation. Users cannot act on "83 vs 79", and presenting raw scores
invites two failures — false precision (treating a 4-point gap as meaningful)
and the eloquent ineligible (a high score presented for something the
organization cannot submit to). The technique: derive a **small, fixed verdict
vocabulary** — ineligible / weak / possible / strong — from the score *and*
the deterministic eligibility, in one function, with the eligibility check
first and absolute.

## Procedure

1. **Enumerate the hard-gate checks by key.** Applicant type, deadline, and
   award-capacity fit are the canonical hard gates: each is a deterministic
   pass/fail fact, and a fail on any one makes submission pointless or
   impossible. Other checks (geographic nuance, unstated preferences) may
   inform the score without gating.
2. **Hard fail ⇒ "ineligible", unconditionally.** The verdict function tests
   the gates before it reads the score. No fit score, from either lane,
   outranks a failed gate — this is the law of the domain expressed in one
   `if` statement.
3. **Band the surviving scores with fixed thresholds.** Two cut points give
   three bands: strong (≥ 75), possible (≥ 50), weak (below). Round numbers
   are a feature — they are memorable, documentable, and honest about their
   own arbitrariness. Resist per-org or adaptive thresholds until you have
   outcome data proving the fixed ones misclassify.
4. **Derive the verdict in exactly one place**, shared by every lane that
   produces a score (heuristic and model alike). Two verdict derivations will
   disagree within a release cycle; a lane that ships its own verdict is a
   consistency bug waiting for a user to screenshot it.
5. **Present the band, keep the score.** The verdict drives sorting groups,
   badges and recommendations; the score remains visible for ordering within
   a band and for the curious. Never show a score without its band.

## Decision rules

- **When a gate's underlying data is missing** (no eligibility codes
  published, no deadline stated), the gate result is "unknown", not "pass" —
  and unknown does not force ineligibility. Route unknowns to the score with
  a neutral contribution and let the explanation surface the uncertainty; an
  honest "possible, but eligibility unverified" beats both a false pass and
  a false fail.
- **When a model lane returns a score,** clamp it into range *before*
  banding; a verdict computed from an unclamped 140 is garbage wearing a
  label.
- **When tempted to add a fourth band or a fifth,** don't — every added band
  halves the meaning of each. Three quality bands plus the gate verdict is
  the ceiling users can hold in their head.
- **When outcomes accumulate** (applications submitted, awards won),
  recalibrate thresholds against them — but only with enough decided
  outcomes to clear the small-sample floor; re-cutting bands on a handful of
  results is astrology.

## When NOT to use it

- Inside the ranking itself — bands are a presentation contract; sorting
  still uses the continuous score, or ties explode.
- For item-to-item similarity ("related opportunities"), where there is no
  submission decision and hence no gate; a plain ranked list with scores is
  honest there.
- As a substitute for showing eligibility detail. The "ineligible" verdict
  compresses; the per-check results (which gate failed, on what evidence)
  must remain one click away, or users will not believe the verdict — and
  should not.
