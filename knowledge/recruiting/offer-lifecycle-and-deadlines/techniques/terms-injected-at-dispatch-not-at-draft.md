---
layer: technique
type: technique
subject: offer-lifecycle-and-deadlines
technique: terms-injected-at-dispatch-not-at-draft
status: forged
laws: [say-only-what-the-record-holds, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [composing an offer letter, templating candidate messages that carry figures or dates, debugging a letter that contradicts the offer record]
---

# Terms injected at dispatch, not at draft

An offer letter is a claim about what was offered. It may therefore contain exactly
what the offer record contains, at the moment it leaves the building — not what the
record contained when a human opened the composer.

The technique: templates hold **placeholders**, not values. The compensation, start
date, deadline, role title and any conditions are resolved from the offer record in
the dispatch path, immediately before send, and the resolved values are stored with
the sent message so the record shows what the candidate actually received.
[Say only what the record holds](../../_laws.md#say-only-what-the-record-holds).

## The drift window is real and it is days long

Between drafting and sending, an offer is edited. Approval comes back with a
different figure. A hiring manager moves the start date. The deadline shifts because
the candidate asked. Compensation is re-banded. Each of these updates the offer
record — and each leaves a letter drafted earlier carrying superseded numbers.

The candidate then holds two artifacts that disagree: a letter saying one salary and
a live offer page saying another, or a letter saying one deadline and a countdown
enforcing a different one. Which one is binding is now a question for lawyers rather
than a fact. And it is the letter, the thing with the organisation's name on it,
that the candidate will believe.

Dispatch-time injection closes the window structurally rather than procedurally. A
rule that says "re-check the letter before sending" is a rule that fails on the busy
day; a template that *cannot* carry a stale figure fails never.

## What must be injected, and from where

- **From the offer record itself**: compensation and its components, start date,
  role title, deadline, employment type, location or work arrangement, and any
  stated conditions.
- **From the dispatch context**: the candidate's own accept/decline address, so
  every letter's link resolves to that candidate's offer and no other. Never a link
  baked into a template.
- **Never from the composer's memory or a previous letter.** Copy-forward from the
  last offer for a similar role is the single most common source of a wrong figure
  reaching a candidate.

The letter's own copy — tone, structure, the paragraph about the team — is what the
template is for. The numbers are not copy.

## The unpriced-offer fail-safe

The dangerous case is not a stale figure; it is an invented one. When a draft is
generated for an offer whose compensation is not yet determined — no approved band,
no agreed figure — a generative drafter faced with a salary-shaped hole will fill
it. And the drafts that exist *because* the number is unknown are precisely the
drafts most likely to receive a confident invention.

The rule is absolute: **no band, no figure.** When the compensation is absent, the
system does not draft a number, does not guess from the role title, does not
interpolate from similar past offers, and does not emit a plausible range. It
produces the draft without the figure and routes to a human to price it, saying
explicitly that it did so.

This is [absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence)
at its most expensive: an unpriced offer is not a zero, not a market median and not
a neutral placeholder. It is a distinct state — *unpriced* — that must reach a
person. A machine must not invent a number on the very drafts that exist because the
number is unknown.

The same posture covers other unresolved fields. A missing start date does not
become "as soon as possible"; a missing manager name does not become the recruiter's;
a missing deadline blocks dispatch entirely, because an offer without a clock is not
an offer this lifecycle can govern.

Where the number *does* come from — the band, its market basis, its defensibility —
belongs to the compensation-banding subject. This technique owns only that whatever
that subject determined is what reaches the candidate, unaltered and uninvented.

## The letter and the countdown must agree

The deadline is the field where drift is most visible to the candidate, because
they can see both artifacts at once: the date in the letter and the timer on the
page. Inject the deadline from the same record the expiry is enforced against, and
render it the same way in both — absolute date and time, named timezone. If the
letter says one thing and the countdown another, the candidate is entitled to
believe the more generous one, and you have made a promise you did not intend.

## Store what was sent

Resolution at dispatch is only half the technique; the other half is recording the
resolved output alongside the message. Six months later, "what did we actually
offer her" must be answerable from the record rather than reconstructed by
re-rendering a template against a record that has since changed. A re-rendered
letter is a new document, not evidence of an old one.

## When not to use this

- **Genuinely static content** — a benefits summary, a policy attachment, a
  company overview — is fine to hold as fixed template text, provided it is not
  candidate-specific and not a figure.
- **A letter the candidate has already received** must never be silently
  re-injected with new values. Superseded terms produce a *new* letter that says it
  supersedes; they do not retroactively edit the old one.
- **Manual, individually written letters** for unusual hires are legitimate — but
  they still resolve their figures from the record, and they still cannot be sent
  with an unpriced compensation field.
