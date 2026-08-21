---
layer: technique
type: technique
subject: offer-lifecycle-and-deadlines
technique: expired-is-a-different-answer-from-invalid
status: forged
laws: [absence-of-evidence-is-not-evidence, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [handling a failed offer link, choosing status codes for a candidate-facing terminal surface, writing the copy a candidate sees when their offer does not open]
---

# Expired is a different answer from invalid

When a candidate's offer link does not open, exactly one of two facts is true. The
link does not identify an offer at all — mistyped, truncated by a mail client,
revoked, or from a different process. Or it identifies a real offer whose deadline
has passed.

These are two different facts about the candidate's situation and they must be two
different answers. Collapsing them into one "not found", one generic error page, or
one "something went wrong" destroys the only information the candidate actually
needs, and it destroys the support channel's ability to answer the question without
an investigation.

## The two answers

**Unknown offer.** The system cannot identify this offer. Say that: the link could
not be matched to an offer, it may have been copied incompletely from an email, and
here is how to reach a person with the role you applied for. Do not speculate about
expiry — you do not know that it expired, you know that you cannot find it.
Structurally this is a *not found*.

**Known but lapsed offer.** The system knows this offer and its deadline has
passed. Say that: this offer for this role expired on this date and time, it can no
longer be accepted here, and here is how to ask about it. Structurally this is
*gone* — a distinct status from not-found, and distinct again from a generic error,
so that logs, monitoring and any client can tell the three apart without parsing
prose.

The distinction is [absence of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)
applied to states rather than to scores. "I have no record of this" and "I have a
record of this and it is over" are different states, and neither may be rendered as
the other. An unknown offer defaulting to the expired page tells a candidate their
offer lapsed when it may be sitting live in another email; a lapsed offer defaulting
to not-found tells a candidate the organisation has no record of an offer it made
them, which is worse.

## What the lapsed answer may disclose

An offer address is a bearer capability: whoever holds it, acts. That constrains
what the expired page may say to someone who might not be the candidate.

- **Name the role and the deadline.** These are what the holder needs and what the
  organisation already put in an email to them.
- **Do not name the candidate, their compensation, their evaluation, or any other
  candidate.** A page reached by a guessed address must never confirm a person's
  identity or reveal their terms.
- **Answer unknown and lapsed at indistinguishable cost.** If the unknown answer is
  instant and the lapsed answer takes a database round trip, the timing itself
  enumerates valid offers. Use identifiers long and random enough that guessing is
  not a practical attack, and do not let the two paths differ observably in any
  channel except the intended one.
- **Never enumerate.** No listing endpoint, no sequential identifiers, no "did you
  mean this other offer".

The general handling of bearer links, token entropy and enumeration defence is
engineering craft owned elsewhere; what belongs here is the hiring judgment about
*which facts about a person* an unauthenticated page may state.

## The third state people forget

There is a third failure that is neither: an offer that exists, is not expired, and
is nonetheless not actionable — withdrawn by the organisation, or already terminal
because the candidate accepted or declined it earlier.

Each gets its own answer too. A withdrawn offer says it was withdrawn and routes to
a named person, because a candidate discovering a withdrawal from a web page needs
a human immediately. An already-accepted offer shows the acceptance — the candidate
returning to re-read their terms should find them, not a dead end. An
already-declined offer says so plainly and offers a route to talk, because a
decline the candidate does not remember making is a fact worth surfacing fast.

Four distinct states, four distinct answers. The temptation to fold them into two
is always a UI convenience, never a candidate benefit.

## Order of evaluation

Resolve the identifier first, then evaluate lapse, then evaluate other terminal
states. Evaluating expiry before identity leaks the existence of offers; evaluating
other terminal states before expiry produces the confusing case where an offer that
expired last week reports as declined because a sweep mis-ordered.

And evaluate lapse **on read**, not only on write. A candidate opening a lapsed
offer should be told it lapsed, not shown a live-looking page with buttons that will
refuse them. The read path and the write path must agree, which in practice means
they run the same lapse evaluation.

## Every one of these answers routes to a person

None of the four failure answers is a terminus. Each names a way to reach a human —
because every one of them can be the visible symptom of an organisational mistake:
a letter sent to the wrong address, a deadline nobody told the candidate about, an
offer withdrawn without a call, a decline recorded against the wrong person. The
candidate cannot distinguish those from their own error, so the page must not make
them try. Where the situation is ambiguous and the consequence is adverse, route to
a human rather than closing the door —
[uncertainty resolves toward the candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate).

## When not to use this

- **Recruiter-facing views** are authenticated and may (and should) show the full
  state, including who accepted and when.
- **Genuine infrastructure failures** are a fifth answer and must not be dressed as
  any of these four. "The system is temporarily unavailable, your offer is
  unaffected, try again shortly" is the honest copy; showing a candidate an expiry
  page during an outage is a lie with consequences.
- **Where the deadline is not enforced at all**, the distinction is moot and the
  system has a larger problem.
