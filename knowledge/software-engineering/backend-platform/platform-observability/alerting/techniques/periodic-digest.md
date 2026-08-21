---
layer: technique
type: technique
subject: alerting
technique: periodic-digest
status: forged
laws:
  - failure-not-empty-success
shared_with: []
use_when: [designing a scheduled summary push, deciding whether an alert class may wait for the batch, a recurring report is being ignored]
---

# The periodic digest

Most of this subject is about the *event* channel: a condition became true,
and someone should know now. A digest is the other channel — a scheduled
push that summarizes a period to an audience that is not on call. It exists
because the event channel deliberately cannot carry everything: a slow
drift, a budget trend, a "we are three weeks from the target" is real news
and terrible paging material, and the alternative to a digest is the
expectation that a human remembers to open a dashboard, which is the habit
alerting exists to end.

A digest is still a claim on attention, so it obeys the same economics as a
fire — with a different currency. A single ignorable interruption costs
seconds; a *recurring* ignorable push costs the channel permanently, because
the reader's response to a predictable arrival is a filter rule, and a
filter rule applies to next quarter's important edition too.

## Notify on news, not on schedule

The default a scheduler suggests — send every period, unconditionally — is
the design that kills digests. A summary that says "no change this week"
every week teaches its reader, in about four editions, that the message can
be triaged without opening it. That training is not reversible, and it is
indiscriminate: the edition that finally carries a real slide arrives into
an inbox rule.

So the cadence is **adaptive**, gated on content: the period is summarized,
and the push happens only if the summary contains something a reader would
have wanted to be told. The gate is a small, explicit, and **pure**
predicate over the period's already-computed aggregates — a state change, a
threshold breach, a movement beyond the noise band, an approaching limit —
written as one function so that "why did we not send this week?" has an
answer with a line number. Three properties keep it honest:

- **Every clause names a reader reaction.** A clause that cannot be read as
  "a reasonable person would want to know this" is a clause that resurrects
  the unconditional send in disguise.
- **Movement clauses use the measured band, not any movement.** A period
  delta smaller than the instrument's own run-to-run spread is not news; the
  band, and how to measure one, belong to
  [noise-band-and-hysteresis](../../../../engineering-assessment/measurement-method/measurement-honesty/techniques/noise-band-and-hysteresis.md).
  The alerting-side rule is only this: the digest gate and the event
  thresholds read the *same* band constant, or the two channels disagree
  about what happened this week.
- **Some clauses are unconditional-by-nature.** A depleting quota, an
  expiring credential, a deadline inside the next period — anything where
  the reader's cost of not knowing is high and the fix has lead time —
  passes the gate on its own, because silence about it is the expensive
  outcome.

The alternative to an adaptive cadence is a stored per-reader preference
plus a last-sent timestamp — strictly more machinery, and it answers a
different question ("how often do you want to hear from us") than the gate
does ("was there anything to say"). Prefer the gate; add the preference only
when readers actually differ.

**Skipping is not silence.** A period that produced no push must still be
distinguishable, afterward, from a period where the scheduled run never
executed or died halfway
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)). The
run records its own outcome per recipient — sent, skipped-no-signal,
skipped-no-channel, failed, not-reached-before-deadline — so "quiet quarter"
and "the batch has been broken since the deploy" are never the same
observation.

## Which classes may ride the batch

The doctrine is a latency question, and it is decided **per alert class, in
writing, next to the batch**:

> A class may ride the periodic batch when the reader's best response to it
> is a *conversation*, and must fire same-day when the best response is an
> *action*.

A drifting goal, a spend trend, a slow-moving standing — all conversations;
they lose nothing by arriving Monday. A newly disclosed critical
vulnerability, a gate flipping from pass to fail, a credential that stopped
working — all actions, and delivering them in a weekly summary is *worse
than not delivering them at all*, because a stale action item trains the
reader that this class is routine, which is exactly the wrong lesson about
the one class that is not.

The doctrine cuts both ways, and the second direction is the one teams get
wrong. A class that belongs in the batch should not get its own schedule
merely because it is new: the batch run already resolves every recipient's
channel, already holds the at-most-once discipline below, already runs under
a deadline with bounded concurrency. A second schedule duplicates all of
that in order to say the same things later. Add the class to the existing
run; write down why it is allowed to wait.

Same-day classes still need their own suppression key rather than sharing
the general one, or a specific, rarely-fired class gets starved by whatever
generic push consumed the claim first — see
[dedup-and-cooldown](./dedup-and-cooldown.md).

## At-most-once per window, claimed before the send

Scheduled runs are retried, re-fired, and overlapped by the platforms that
run them, and a digest delivered twice is worse than most single-alert
duplicates: it is the same long message, visibly identical, to an audience
that already suspects the channel of being automated noise.

The naive guard — read "already sent?", send, then record the send — is
check-then-act, and it fails in two ordinary ways: two overlapping runs both
read "not sent" and both send, and a crash between the send and the record
makes the next run send again. Collapse it into **one conditional write
whose success is the permission to send**: insert a marker for (action,
recipient, window) only if none exists, and let the affected-row count elect
the winner. Losers do nothing.

Three rules make that claim safe:

- **Fail closed.** If the claim cannot be established — the store is
  unavailable, the recipient will not resolve, the write errors — do not
  send. A missed edition self-heals next window; a send without a durable
  claim reintroduces the duplicate the claim exists to prevent.
- **Release on failure.** The claim is taken *before* the guarded side
  effect and undone if that side effect fails, so a dead channel does not
  leave the window falsely marked done. Best-effort release: a lost release
  costs one edition, never a duplicate.
- **Reuse the existing durable record if it already has the right shape.**
  An append-only audit or event log keyed by actor, action and time is
  already the at-most-once substrate, and a marker row in it needs no new
  column, no migration, and no second thing to reconcile. The audit trail
  answering "was the Monday summary sent?" and the idempotency key are the
  same question asked twice.

## Decision rules

- The signal gate is pure and takes the period's aggregates as arguments —
  it must be testable without a scheduler, a clock, or a channel.
- The window boundaries the digest reports come from the same period helper
  the linked detail surface uses; a summary whose "this week" differs by a
  day from the page it links to loses the reader's trust in both.
- The batch runs under a soft deadline below the platform's hard ceiling,
  and reports the recipients it never reached as an explicit count — a
  truncated run must be visible, not inferred from complaints.
- Per-recipient failures are contained: one unreachable channel does not
  abort the remaining recipients' editions.
- A digest never carries a same-day class as a courtesy copy. If a reader
  needs it in both places, that is a routing decision with its own record,
  not a quiet addition to the summary.
