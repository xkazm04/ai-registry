---
layer: technique
type: technique
subject: deferred-finalization
technique: correction-window-is-the-grace-period
status: forged
laws: [limits-are-derived, count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [choosing how long to wait before issuing a computed record, a customer reports a bill that missed their usage, tuning a grace period that was picked by feel]
---

# Size the window from the lateness of the inputs

The delay between a period ending and its record being issued has one job:
**absorb inputs that arrive after the period they belong to.** Its correct
length is therefore a property of the input pipeline, not of the scheduler,
and it is derivable
([limits-are-derived](../../../../_laws.md#limits-are-derived)) from a
distribution anyone can measure.

Almost every system in this shape ships the window as a constant somebody
picked — a day, three days, a week — and never revisits it. That constant is
usually defensible when it is chosen and rarely still defensible two years
later, because the thing it was implicitly measuring (how late our data
arrives) moved when the ingestion path, the client libraries, or the customer
mix changed.

## The measurement

For each input, two timestamps already exist or should: **when the event
happened** and **when it reached the system.** Their difference is the input's
lateness. The distribution of that difference, over a representative period,
is the whole basis of the decision.

Read it at a percentile, not at a mean or a maximum. The mean is dominated by
the bulk of inputs that arrive in seconds and tells you nothing about the
tail you are trying to cover; the maximum is set by a single outage and would
have you waiting a fortnight. A high percentile — the level at which the
residual restatement rate is acceptable to the business — is the honest read,
and stating *which* percentile beside the number is what makes the setting
reviewable later
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

Write the derivation next to the setting: this window covers the Nth
percentile of observed input lateness, measured over this range, as of this
date. A number with its derivation attached gets re-derived when someone
questions it; a bare number gets doubled by whoever is in the incident
channel.

## Both directions cost money

The window is a trade, and naming both sides is what turns it from a
technical default into a decision somebody can own.

**Too short** — inputs land after the record is issued. Each one becomes a
supersession or a compensating document: customer-visible, support-generating,
and disproportionately expensive relative to the amount involved. A late
input worth a few units of currency can cost an hour of two people's time.

**Too long** — every payment is delayed by exactly the window. That is
working capital, and at scale it is the largest single number in this
technique. It also degrades the customer experience in a way that is easy to
miss: a bill that arrives long after the period it covers is harder to
verify, which raises disputes rather than lowering them.

The decision rule that resolves most cases: **set the window at the
percentile where the marginal restatement cost stops exceeding the marginal
carrying cost of waiting another day**, then check the two hard bounds below.

## Two hard bounds

- **The window must be materially shorter than the payment terms.** If the
  counterparty has thirty days to pay from issue and the window is seven, the
  cash cycle is thirty-seven days and everyone downstream should know it. A
  window that approaches the payment terms means the organization is
  financing its own ingestion latency.
- **The window must be longer than the worst *routine* recovery time of the
  ingestion path.** If a normal retry backlog after a provider incident takes
  two days to drain, a one-day window guarantees a restatement wave every time
  a provider has a bad afternoon. This bound is about routine recovery, not
  about the catastrophic outage — that one is what supersession is for.

## The window belongs to the payer, not to the system

Different counterparties have different pipelines: one submits from a
well-instrumented service, another batches overnight, a third sends from
devices that are offline for days. A single global window is sized for the
worst of them and therefore delays everyone else's cash, or is sized for the
median and restates the stragglers every cycle.

So the setting is **per-payer, with a global default** — configured on the
account or organization, not compiled in. Two supporting rules:

- The default is the derived number above; per-payer overrides are the
  exception and each one should have a stated reason, or the overrides become
  a folk taxonomy nobody can audit.
- The window in force is **recorded on the artifact itself**, alongside the
  date it is expected to be finalized. Two things fall out of that one stored
  pair. Six months later, the question "why did this one wait five days" has
  an answer that does not depend on the current configuration, which has since
  changed. And when the setting *is* changed while artifacts are open, the
  system can shift each open artifact's expected date **by the difference**
  between the stored window and the new one — an arithmetic adjustment rather
  than a recomputation of dates from settings that have moved. Without the
  stored value, a settings change either leaves in-flight artifacts on the old
  schedule with no record of why, or re-derives their dates from a world that
  no longer resembles the one they were created in.

## The instrument: count what arrived too late

A window with no feedback signal is a guess that has been running for years.
The signal is one counter: **inputs that arrived after their period's record
was finalized**, labelled by payer and by how late they were.

That counter is the tuning loop. Rising counts for one payer mean their
pipeline changed and their override needs revisiting; rising counts across
the board mean the ingestion path degraded and the global default is now
wrong; a persistent zero for a payer whose window is long means the window is
costing cash for nothing.

The instrument itself must be assertable, because the most likely reading is
zero and the two zeros mean opposite things
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)):
*no late inputs arrived* and *nothing is counting late inputs* are
indistinguishable on a dashboard. Prove the counter works — feed a deliberate
late input through a test path and see it register — before treating a clean
reading as evidence the window is generous.

## The schedule that closes the window

The window is enforced by a scheduled job that picks up everything whose
period ended more than the window ago and finalizes it. Four properties are
not optional:

- **Idempotent per artifact.** The job will run twice; the second run finds
  the artifact final and skips it.
- **Catch-up, not calendar-driven.** The job selects by *eligibility* — the
  window has elapsed and the artifact is still provisional — never by "things
  that became eligible since my last run". After a day of downtime the
  eligibility query naturally sweeps up the backlog; a delta-based selection
  silently leaves that day's records provisional forever.
- **Bounded per run, and repeated.** Period ends cluster — the first of the
  month is not like the fourteenth — so the job takes a bounded batch and
  runs often enough that the peak drains, rather than attempting an unbounded
  sweep that times out on the busiest day of the cycle and leaves partial
  results.
- **A run that finalizes nothing is reported as such**, distinguishably from
  a run that did not happen. This is the same instrument problem as the
  counter, at the level of the job.

## The far side of the window is a designed destination

Closing the window means late inputs have no path into the record. That is
the pattern working, not a gap — but it makes the destination for those
inputs a design decision that must be made once, explicitly, rather than
falling out of whichever code path meets them:

1. **Carry to the next period** as an adjustment that names the period it
   came from. Cheapest, and correct for a continuing relationship.
2. **Issue a compensating document immediately.** Correct when the
   relationship is ending, when the amount is large, or when the period
   matters to the counterparty's own accounts.
3. **Discard against a stated threshold, and count what was discarded.** A
   legitimate choice when the amount is smaller than the cost of handling it
   — but only when the threshold is written down and the discarded total is
   reported, because "we drop small amounts" and "we lose revenue we cannot
   quantify" are the same code with different bookkeeping.

Whichever is chosen, the late input is **never** absorbed by reopening the
closed record. That restates a period the counterparty has already
reconciled, and it teaches everyone downstream that issued records are not
stable — a far more expensive lesson than any single correction.

## When not to use this

- **When inputs cannot arrive late by construction** — the system itself
  generates every input synchronously with the act it measures. A window
  there delays cash to absorb an event that cannot occur.
- **When the record must be issued immediately** as part of the transaction
  it describes. The trade is inverted: correction is by compensating document
  from the start, and this whole technique is not the right tool.
- **When the correct answer is a shorter period, not a longer window.**
  Teams sometimes stretch the window to cover an unreliable pipeline. If the
  window is approaching the length of the period itself, the problem is the
  ingestion path and the fix belongs there.
