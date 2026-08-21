---
layer: technique
type: technique
subject: candidate-consent-and-retention
technique: legal-claims-carve-out-from-erasure
status: forged
laws: [every-decision-names-its-actor, no-adverse-outcome-is-solely-automated]
shared_with: []
use_when: [deciding what survives an erasure request, defending a retention decision, scoping an audit record]
---

# The legal-claims carve-out from erasure

## The concern

The right to erasure is not absolute. Most data-protection regimes carve out
data that is necessary to establish, exercise, or defend legal claims — and in
hiring that carve-out is load-bearing, because the records most likely to be
subject to an erasure request are exactly the records a discrimination claim
would turn on. If a rejected candidate can compel destruction of the sealed
record of why they were rejected, then the organisation cannot defend the
decision *and the candidate cannot challenge it either*. The exemption protects
both sides.

The danger is equally real in the other direction. "We might get sued" is
available as a justification for keeping anything, forever, and an
unenumerated carve-out quietly restores indefinite retention through the
exemption door. This technique is about making the carve-out narrow enough to
be honest and explicit enough to be reviewed.

## Enumerate it; never define it by category

**Decision rule.** The carve-out is a written list of specific record types,
each with a stated ground and a stated end date. It is never a predicate
applied at scrub time ("keep anything that might be evidence"), and it is
never a whole table.

For a hiring system the defensible enumeration is small and stable:

- **The sealed decision record** — the outcome, the stage, the actor who
  decided, the timestamp, and the recorded reason in the form it was sealed.
  This is what a challenge is about.
- **The consent history** — the append-only transitions, including the erasure
  event itself. Deleting the record that proves you honoured the erasure is
  self-defeating.
- **The adverse-action trail** where a decision was contested, appealed, or is
  within its contest window.
- **Records under an explicit legal hold**, which is a distinct, actively
  applied state with a named owner, not an inference.

Everything else goes: the source document, the parsed profile, the free-text
analyses, the transcripts, the notes, the messages. A defence does not require
the candidate's CV; it requires the record of what was decided and on what
stated basis.

## Bound it in time

An enumeration without an end date is indefinite retention with better
paperwork. Each entry carries its own clock, anchored to the local limitation
period for the claim it defends against, and enters the ordinary sweep when the
clock expires. Where the deployment cannot know its own limitation period, that
is a per-deployment configuration with a conservative default — not a licence
to keep forever.

**Decision rule.** If a carve-out entry has no end date, it is not a carve-out;
it is a retention policy someone declined to write down.

## Minimise the surviving record, not just its lifetime

The carve-out justifies keeping *what is necessary*, which is usually far less
than what exists. A sealed decision record needs the decision, the actor, the
stage, the timestamp and the stated reason. It does not need the candidate's
address, their salary expectation, or the full text of the document. Strip the
surviving record to the fields that carry the defence, and de-identify the rest
of it wherever the defence does not require identification — noting that in
most discrimination claims it *does*, because the claim is about a specific
person, so honest minimisation here is about narrowing fields rather than
removing the link.

## The surviving record must name its actor

The whole value of the carve-out collapses if the retained record cannot answer
who decided. A sealed decision with a null actor tells a tribunal nothing and
is worse than useless, because it looks like a record.
[Every consequential decision names its actor](../../_laws.md#every-decision-names-its-actor)
is what the carve-out is preserving: a named human, or the automated process,
or an explicit "cannot determine" — and a human who reversed a machine's
decision sealed to themselves, never inheriting the machine's attribution.

The same record is what makes reconsideration possible. Because
[no adverse outcome is solely automated](../../_laws.md#no-adverse-outcome-is-solely-automated),
an adverse decision must stay contestable, and a contest path works only if the
sealed reason can be read back to the person contesting it. Destroying the
sealed record on erasure would remove the candidate's own route to challenge —
which is why the carve-out is genuinely in the candidate's interest and can be
explained to them as such.

## Tell the person what survived and why

An erasure receipt that says "all data deleted" while a sealed decision record
persists is false. The receipt enumerates: what was destroyed, what was reduced
to a de-identified shell, and what was retained — naming each retained record
type, the ground, and the date it will be deleted. This is more work than a
one-line confirmation and it is the difference between a defensible position
and a discovered discrepancy.

State it plainly rather than in exemption language. "We have kept the record of
the hiring decision and its stated reason until <date>, so that either of us
can refer to it if the decision is questioned" is honest, comprehensible, and
happens to be the truth.

## Review the enumeration on a schedule

The carve-out list grows by accretion — a table gets added, someone argues it
might matter, and it never leaves. Review it annually against a single
question, asked per entry: *has any record of this type ever actually been used
in a claim?* An entry that has never been used and cannot be described as
plausibly usable comes off the list.

## When not to use this

- **Do not invoke it for a whole candidate profile.** The exemption covers the
  evidence of a decision, not the raw material the decision was made from. A
  carve-out that retains the source document has stopped being a carve-out.
- **Do not invoke it speculatively across a database.** It applies where a
  claim is realistically possible for that record — which a decided
  application supports and an unopened talent-pool profile does not.
- **Do not use it to keep training or analytics data.** Model improvement is
  not the establishment of a legal claim, and dressing it as one is the single
  most common bad-faith use of this exemption.
- **Do not let it override an active legal hold in the other direction.** A
  hold expands what must be kept; the carve-out's end dates do not release
  records the hold still covers.
