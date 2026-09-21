---
layer: technique
type: technique
subject: speed-to-lead-and-assisted-reply
technique: bant-lite-scoring
status: forged
laws: [label-convention-as-convention, not-measured-is-not-zero]
shared_with: []
use_when: [capturing qualification while answering a lead, deriving hot and warm bands from a score, deciding what an unanswered qualification field means]
---

# Light budget-authority-need-timeline scoring

The rep answering a lead has seconds, not a form. A light qualification captures three
things the reply conversation naturally surfaces - when they want it, what they can
spend, how big it is - plus the rep's gut, and rolls them into a score with two bands.
The instrument is deliberately small; its honesty lives in what *unknown* means and in
where the band thresholds are allowed to exist.

## The fields

- **Timeline** - as soon as possible, in the coming weeks, just exploring, unknown.
- **Budget** - confirmed, flexible, tight, unknown.
- **Scope** - large, medium, small, unknown. Scope stands in for need and authority
  together: a small business rarely learns who signs before it learns how big the job
  is, and asking "are you the decision-maker" in a first reply is the kind of question
  that ends conversations.
- **Disposition** - hot, warm, cold, unknown. The rep's gut. It nudges the score; it
  does not decide it.

Every field starts *unknown*, and *unknown* is the absent state, not a fourth opinion.
A lead nobody has judged and a lead judged warm must stay tellable apart, because the
assisted reply is grounded on what was captured: it asks only what is still unknown,
and it must never treat silence as an answer
([not measured is not zero](../../../_laws.md#not-measured-is-not-zero)). An
"answered count" - how many of the three fields are not unknown - is the second
output of the instrument and is shown beside the score, so a 30 from one confirmed
field and a 30 from three tepid ones read differently.

## The points and the bands - convention

Each captured field contributes up to a cap of roughly thirty points, so no single
field can carry a lead into the hot band alone; the disposition nudges by ten either
way; the sum is clamped to 0-100. Hot begins at 60, warm at 40, cold below. The point
values and the band edges are practitioner convention chosen for their shape - three
fields of equal weight, a hot band that needs two strong answers - and are not a
measurement of anything
([label convention as convention](../../../_laws.md#label-convention-as-convention)).
A business that finds its hot leads do not close should move the edges and say it
moved them, not discover that the edges were folklore.

The band thresholds live in exactly one function. The colour, the label in every
locale, and any sort all derive from it, so a threshold can never be moved in one place
and forgotten in another.

## Disposition versus band

The gut call and the score-derived band share the same three words and are different
things. A disposition of *hot* means the rep felt it; a band of *hot* means the score
crossed 60. Give them separate types even when the words coincide, store them
separately, and never render one where the other is expected. A surface that shows
"hot" without saying which is showing a word, not a fact.

## Procedure

1. Present the three fields as single-tap choices in the reply pane, each defaulting to
   unknown; the disposition as a fourth.
2. Compute the score as a pure function of the four fields - no clock, no storage - so
   it is testable and re-derivable.
3. Compute the band from the score in one place; derive tone and label from the band.
4. Show score, band and answered count together.
5. Hand the captured qualification, as text, to the assisted reply so it asks only what
   is still unknown.

## Decision rules

- When a field is unknown, contribute zero points and count it as unanswered, because
  a guessed answer would put a number where an absence belongs.
- When the rep's disposition and the band disagree, show both, because the
  disagreement is information - a rep who feels hot about a lead with no captured
  answers has a reason worth writing down.
- When the band edge is changed, change it in the one function and nowhere else,
  because a badge and a sort that disagree about one lead is the exact failure the
  single location exists to prevent.
- When the qualification is already known, do not ask it again in the reply, because
  re-asking tells the customer nobody read what they wrote.

## When not to use this

This is a first-minutes instrument, not a lead-quality model. Scoring a lead by its
*source* - which channel, which campaign, which page - and grading it on a
fit-versus-engagement grid is the concern of `lead-quality-and-source-diagnosis`; that
model may consume this score as one input to its engagement axis, but this technique
does not reach into firmographics or attribution. Do not use the score to auto-reject:
a cold band is a triage order, not a verdict, and a lead with three unknowns is
unassessed rather than cold. Do not add fields; the instrument works because it fits
in the seconds a rep has, and a ten-field form is a lead that goes unqualified.
