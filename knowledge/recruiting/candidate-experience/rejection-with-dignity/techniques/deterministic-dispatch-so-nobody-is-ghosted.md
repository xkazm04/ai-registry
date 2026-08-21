---
layer: technique
type: technique
subject: rejection-with-dignity
technique: deterministic-dispatch-so-nobody-is-ghosted
status: forged
laws: [no-adverse-outcome-is-solely-automated, a-candidates-process-never-stalls-on-your-constraints, every-decision-names-its-actor]
shared_with: []
use_when: [building a decline dispatch pass, deciding whether rejection copy may be generated per candidate, auditing why candidates were never told]
---

# Deterministic dispatch so nobody is ghosted

Ghosting is not a character flaw of recruiters, it is a structural property of
the workflow. Every other step in hiring has a counterparty who complains when
it stalls: the hiring manager wants the shortlist, the candidate chases the
interview, the finance team chases the offer. The decline has none. It is the
only step whose omission nobody notices except the person it was owed to, and
so it is the step that silently never happens.

The fix is therefore structural too. **A terminal decision is a state that owes
a message**, and a repeatable pass is responsible for discharging that
obligation for everyone in it — not for whoever the recruiter remembers.

## The sweep

Run a pass over candidates in a terminal state with no decline message on
record, and produce the message. Properties that make it trustworthy:

- **Deterministic.** The same record yields the same letter. Variant copy is
  fixed and reviewed once; the only per-candidate content is facts read out of
  the record. This is what forecloses the per-candidate generation that invents
  reasons — determinism is not an efficiency choice here, it is the
  truthfulness mechanism.
- **Batch, and idempotent.** A rerun after a crash must not double-send. The
  obligation is discharged by a recorded dispatch, and the sweep's query is
  defined by that record rather than by a flag someone sets by hand.
- **Complete by construction.** The pass finds its own work. A queue that
  someone must remember to enqueue into reproduces the original problem in a
  new place.
- **Bounded in age.** A decline owed for weeks is functionally a ghosting even
  if it eventually arrives. The sweep runs on a cadence tied to how fast the
  pipeline moves, and the age of the oldest outstanding obligation is the
  metric that says whether it is working.
- **Gated on a durable marker, not a one-shot flag.** "Was this message already
  sent?" must be answered by the existence of a recorded dispatch, written as
  the last step of sending. A transient "already handled" flag set before the
  send means a crashed attempt is remembered as a success and the message is
  dropped forever. For adverse and acknowledgement comms, choose at-least-once
  over at-most-once deliberately: a rare duplicate is a mild embarrassment, a
  silent permanent drop is the failure the whole technique exists to prevent.

## Every reject surface, not the main one

The obligation belongs to the **state transition**, not to the screen that
triggered it. In practice ghosting enters through the newest and fastest path:
a bulk command, a keyboard shortcut, an internal endpoint that skips the guard
the public one has, an intake gate that declines a lead before a candidate
record exists at all. Each was written by someone who assumed notification
happened downstream.

Two consequences. Enumerate the reject surfaces and assert that each dispatches
— ideally by routing them all through one dispatcher rather than by discipline.
And treat the pre-record case as in scope: a lead knocked out at intake has an
address in hand and no record to hang a message on, and is otherwise the person
most certain to hear nothing, ever.

## A person rejects; the pass only prepares

The sweep prepares; it does not decide. Per
[no-adverse-outcome-is-solely-automated](../../../_laws.md#no-adverse-outcome-is-solely-automated),
a named human previews and approves the **exact set** — approval bound to the
cohort actually reviewed and re-derived at commit, refused if the set drifted
between review and send. Each dispatched message records who approved it, so
the audit surface can answer who is answerable
([every-decision-names-its-actor](../../../_laws.md#every-decision-names-its-actor)).
An unattended run queues for approval; it does not send.

Reversibility completes the contract: the decision stays reversible, the sealed
reason can be read back on a reconsider path, and a candidate who asks gets the
recorded reason rather than a reconstruction.

## Audit detail per message

Every dispatched decline records at least: the approving actor, the stage
variant used, **whether a reason was explained or deliberately omitted**, and
**whether the protected-attribute filter fired**. Those last two are what turn
the standard into something provable. Without them, "we never state protected
characteristics" and "we do not invent reasons" are claims about intent; with
them, they are measurable rates a reviewer can query, and a sudden change in
either is a live signal that copy or upstream reason capture has drifted.

## Degradation: the candidate's closure is not metered

When the optional generation step is unavailable — model outage, quota,
rate limit — the deterministic letter still goes, without its feedback section,
with the record noting that no reason was explained. Per
[a-candidate's-process-never-stalls-on-your-constraints](../../../_laws.md#a-candidates-process-never-stalls-on-your-constraints),
your infrastructure state is yours: a person waiting to hear does not wait on
your quota, and a decline held back until enrichment succeeds is a ghosting
caused by an optional feature.

The inverse failure is equally real: never freeze a degraded, partially
generated letter as though it were the authoritative one. Send the honest
deterministic version.

## Isolation inside the batch

A bulk decline must fail per candidate, never per batch. One send that throws
must not abort the run — which would leave the remainder silently untold — and
must not vanish into a log line either. The failure is recorded against **that
candidate** as an outstanding obligation with an explicit instruction that a
human follow up, and the run's summary reports how many failed alongside how
many sent. A batch that reports success while three people were never contacted
is worse than one that reports the three, because it removes the only chance to
catch them.

## The seam with delivery

This technique owns the obligation and the content; it does not own transport.
Whether a message was queued, sent, bounced, retried or dead-lettered — and how
an operator distinguishes *sent* from *believed sent* — belongs to the sibling
subject on candidate communication integrity. The one place they meet: an
unconfirmed delivery leaves the obligation **outstanding**, not discharged.
Marking the sweep complete on handoff to a transport is how a system gets a
clean dashboard and a ghosted candidate at the same time.

## Decision rules

- Never generate decline prose per candidate at send time; select fixed copy
  and fill recorded facts.
- Never gate the message on an optional enrichment succeeding.
- Never mark an obligation discharged before delivery is confirmed.
- When a set drifts between preview and commit, refuse and re-present — do not
  send the superset or the stale set.
- Track the oldest outstanding decline obligation as a first-class operational
  metric; it is the only number that detects ghosting directly.

## When not to use this

- **Finalist and offer-stage declines**, which are owed a human conversation
  first; the sweep must exclude them or it will beat the recruiter to the news.
- **Candidates in an active dispute, appeal or accommodation process**, whose
  communication follows that process.
- **Where consent or contact permissions have been withdrawn** — the obligation
  is then discharged by recording the state, not by sending.
