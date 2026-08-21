---
layer: application
type: application
subject: inference-labelling-and-refusal
technique: self-reported-confidence-is-not-a-measurement
stack: react
status: forged
verified_on: 2026-08-20
---

# Stripping the measurement grammar off a model's self-report (React decisions queue)

The screening and queued-reject payloads in the Decisions queue carry a 0–100
scalar the model emitted about its own verdict. `decisionsAiReviewCardLogic.ts:55-80`
is where the app decided what that number is and what it is therefore allowed to
look like, and the comment is the sharpest statement of the doctrine anywhere in
the tree:

> "The screening/queued-reject payload carries a 0-100 scalar the MODEL WROTE
> ABOUT ITSELF: asked for a verdict, it also states how sure it feels. Nothing
> measured it. It is evidence about the model, not about the candidate and not
> about the world — no outcome, no holdout, no base rate stands behind it."

## What was removed, and why the grammar was the defect

The value "used to be returned with a `confidenceTone` (moss / amber / coral,
banded at `SCREENING_CONFIDENCE_BAND`) that the card painted into a meter. Tone +
meter is the grammar this app reserves for MEASURED quantities, so a number with
nothing behind it rendered exactly like the calibration curve that has a cohort
behind it" (`:65-70`). The number was never wrong; the *chrome* was the claim.

`DecisionsAiReviewCard.tsx:155-174` carries the render-side consequence. A meter
"says a part of a known whole", a tone band "says graded against a threshold", and
the old ARIA wording "asserted the figure as a property of the recommendation".
So: no meter, no tone, no assertive ARIA role. What remains is a quoted number
under a label naming its author, with the label leading — "the disclosure is the
headline, never a footnote under the number" — as plain text, because "the
sentence IS the accessible name". The value is clamped and rounded
(`Math.max(0, Math.min(100, Math.round(...)))`, `logic:80`) so a malformed payload
cannot render an out-of-range figure.

## The refusal to substitute a cohort statistic

The most instructive part is what the card declined to do (`logic:72-76`):

> "It is NOT replaced by a measured statistic here: the honest measured sibling is
> the per-band advance rate, a COHORT property computed on the calibration
> surface. Printing a cohort rate on a single candidate's card would swap one
> mis-scoped claim for another, so this card quotes the model and says so, and the
> measured number stays where its cohort is."

This is the technique's rule against aggregate-shaped comfort. The obvious
"upgrade" — replace the guess with a real number — would have moved the error
rather than fixed it, because a cohort rate on an individual's card is read as a
property of that individual.

## Absent is absent

Scorecards carry a `{level, reason}` band and offers carry no scalar at all, so
both are excluded and "an absent value renders nothing at all" (`logic:78-80`;
the card guards on `modelSelfReport != null`). No zero, no placeholder, no
neutral default — the unmeasured state is a distinct type, not a magic number.
The same file holds the sibling case: unpriced offer drafts used to render nulls
through `Number(x ?? 0).toLocaleString()`, producing "a literal '0' headline and a
0–0 band meter — i.e. it fabricated the one number nobody was willing to invent,
on exactly the drafts that exist because the number is unknown" (`:36-45`).

## Seam

The card also names the *actor* behind each verdict rather than leaving the
reviewer to guess — `isHumanScorecard` keys off `parsed?.source === "human"` "so
the reviewer knows whose judgment they're ratifying" (`:53-54`), and
`isQueuedReject` tags the card whose Reject button *is* the adverse action
(`:49-52`). Verdict-source tagging as a general obligation belongs to the
degradation technique; the score-band grammar this card refuses to lend belongs to
the score-presentation subject.

## Deviation

The self-report is still emitted by the prompt and still collapsed into
`result.route` on the Python side, where `screen_candidate` combines
(recommendation, confidence, early-career gate) into an advance/hold gate
(`app/_lib/interview-recommendation.ts:65-68`). The standard's "never gate on it"
rule is therefore honoured at the display layer and not at the routing layer. The
mitigation is real — the gate's only two outcomes are advance and hold, so the
self-report can never route a rejection — but the standard stands: a decision
input that no outcome validates should not narrow a candidate's path, and the
honest form is a review lane rather than a threshold.
</content>
