---
layer: technique
type: technique
subject: rejection-with-dignity
technique: feedback-line-ceiling
status: forged
laws: [say-only-what-the-record-holds]
shared_with: []
use_when: [deciding how much feedback a decline should carry, designing a rejection generation prompt, reviewing decline copy that feels long]
---

# The feedback-line ceiling

A decline carries **at most three** feedback lines. The number is not a style
preference and it is not about reading time; it marks the point where the genre
of the document changes.

At one or two points, a decline reads as a courtesy: here is the thing that
decided it. At three it is at the edge. Past three it reads as an enumeration
of a person's shortcomings, compiled by the organisation that just rejected
them — a case being built. The recipient experiences it that way, and so does
anyone who later reads it in a complaint file, where a long list of criticisms
looks like post-hoc justification regardless of how carefully each line was
sourced.

## The ceiling is also an invention brake

The second reason is epistemic and it is the stronger one. The record for a
typical declined candidate holds one, maybe two genuinely defensible
observations. A system asked for five will produce five; lines four and five
are extrapolation, because the material ran out at two. The cap therefore binds
output volume to what the record can actually support — the
[say-only-what-the-record-holds](../../_laws.md#say-only-what-the-record-holds)
law enforced by arithmetic rather than by good intentions.

This is why the cap must be applied as a **hard limit on the pipeline**, not
merely requested in a prompt. An instruction to "give at most three points" is
a suggestion to a generator; a truncation step is a guarantee. Ask for few, then
enforce few.

## Ordering and interaction with suppression

The cap is applied **after** contradiction checking and after
protected-attribute suppression, never before. The order matters:

- Cap-then-filter would let suppression cut a capped set down to one line while
  three valid lines waited unused — or worse, invite a backfill.
- Filter-then-cap keeps the strongest surviving lines and preserves the rule
  that suppression never triggers replacement.

When more valid lines survive than the ceiling allows, keep the ones tied most
directly to the recorded decisive reason, and drop the peripheral observations.
Feedback that explains the decision is useful; feedback about something that
did not affect the outcome is unsolicited criticism.

Two mechanics travel with the cap because they protect the same thing:

- **De-duplicate across sources, case-insensitively.** Reason sources overlap —
  a recruiter's unmet checklist item and a matcher's unmet requirement are
  frequently the same sentence. The same point twice reads as careless in the
  one message that cannot afford to, and it spends the scarce line budget
  saying one thing.
- **Cap each line, not just the count.** A "bullet" that runs to a paragraph
  defeats the ceiling by volume and breaks line-granular suppression. Enforce a
  per-line length limit as well as a line count — and prefer trimming the
  source of a long line over shipping an ellipsis, because a truncated quotation
  of the record is no longer the record.

## Zero is a valid, and often correct, output

An empty feedback section is a legitimate result and must be shippable end to
end — the template must render without it, the reviewer must not see it as an
error, and no downstream step may treat empty as a prompt to generate
something. Generic advice is strictly worse than silence, because generic
advice is a claim about a person that nobody made.

Pair the cap with exactly **one** acknowledged genuine strength. One is enough
to establish the letter was written about this person; two or more starts to
read as compensation, and the contrast with the rejection becomes uncomfortable
rather than kind.

## Decision rules

- Cap at three lines; treat four as a defect in the pipeline, not a judgment
  call for the recruiter.
- Keep lines short and discrete. A "line" is one observation; three paragraphs
  disguised as three bullets defeat the ceiling and break line-granular
  suppression.
- Never spend a line on something the candidate cannot act on, and never spend
  one restating the rejection.
- If nothing survives the checks, send with no feedback and record that no
  reason was explained, so the audit surface can distinguish *no feedback
  given* from *feedback lost*.
- Measure the distribution. If most declines carry the maximum, the generator
  is padding; if none carry any, the reason capture upstream is empty and the
  problem is not here.

## When not to use this

- **A solicited debrief on substantial work.** A candidate who completed a paid
  or multi-hour assessment and asked for detail is owed detail; the ceiling is
  for the unsolicited automated letter.
- **A finalist decline after several rounds.** The answer there is a
  conversation, not more bullets — a different medium, not a raised cap. Where
  a call is impossible, a longer written note is acceptable only if a human
  wrote and owns every sentence.
- **Where a jurisdiction requires enumerated reasons.** Statutory disclosure
  overrides the ceiling; that text is compliance output, not feedback, and
  should be visibly separated from any courtesy feedback so the two are not
  read as one list of complaints.
