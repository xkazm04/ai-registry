---
layer: technique
type: technique
subject: admission-queue
technique: admission-vocabulary
status: forged
laws: [one-authority-per-vocabulary, failure-not-empty-success, verdict-survives-boundary]
shared_with: []
use_when: [naming the verdicts a queue's gate may return, deciding whether refusal throws or returns, refusal reasons drifting into two spellings]
---

# Admission vocabulary

The admission decision is the queue's entire external contract, and it is a
**closed vocabulary**: every request that reaches the gate receives exactly
one of three verdicts, each verdict carries its own payload, and each
obligates the caller differently. Get this vocabulary right and every other
technique in the subject has a place to report its outcome; get it wrong —
collapse two verdicts, return a bare boolean, throw on refusal — and the
queue's most important behaviors become indistinguishable from its bugs.

## The three verdicts

**Admitted.** Capacity existed and is now held for this request; execution
begins. The payload is the run's identity — the handle the caller will use
to observe, cancel, and correlate. The caller's obligation: stop waiting on
the *queue* and start observing the *execution*; those are different
components with different telemetry, and the handoff point is exactly here.

**Queued.** The request will run later, and the verdict says *behind what*:
a position, a depth, or an honest wait estimate. "You are waiting" without
"behind N" is not actionable — the caller cannot decide whether to keep
waiting, cancel, or escalate. The payload is position plus the entry's
identity (so the wait can be cancelled or queried later). The caller's
obligation: treat this as a promise held by the queue — do **not**
resubmit, because resubmission of a queued request is how callers convert
one unit of demand into N.

**Refused.** The request will never run *from this submission*, and the
verdict says *why*, from a closed reason taxonomy. The payload is the
reason; the caller's obligation is reason-dependent, which is the whole
argument for reasons-as-data.

## Refusal reasons are data, not prose

The reason taxonomy is small, closed, and machine-readable, because each
reason routes to a different caller reaction:

| Reason | Meaning | Correct caller reaction |
| --- | --- | --- |
| **queue-full** | depth bound reached; shed policy refused this arrival | back off and retry later; reduce submission rate |
| **over-quota** | this tenant/class exceeded its budget | reduce demand or wait for the budget window; retrying sooner is self-harm |
| **resource-pressure** | the host gate is closed | retry after a delay; the condition is environmental and will clear |
| **draining** | the system is shutting down; no new promises | resubmit to the next incarnation, or fail over |
| **invalid** | the request could never run (malformed, unauthorized) | do not retry; fix the request |

Free-text reasons fail twice: callers cannot branch on them, and two
emitting sites drift into two spellings of the same condition
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)
— the taxonomy has one definition, and every gate that refuses draws from
it). The retryable/non-retryable split above is the load-bearing bit: a
caller that retries `invalid` loops forever, and a caller that abandons on
`resource-pressure` gives up on work that thirty seconds of patience would
have completed. Classification for retry is retry-backoff's subject; the
queue's duty is to emit reasons precise enough to classify.

## Refusal is a result, not an exception

Shed, quota, and pressure refusals are the queue *working as designed* —
they are the system's healthy immune response to overload. Modeling them as
thrown errors mingles them with genuine faults (the queue's own storage
failed, the gate crashed) in every log, every alert, and every caller's
error path
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success),
applied in reverse: designed refusal must also be spelled differently from
malfunction). The verdict is a **return value** with three arms; exceptions
are reserved for the queue itself breaking. A practical test: if the
on-call engineer would page on it, it may be an exception; if the caller
should branch on it, it is a verdict.

## One gate, one vocabulary

Admission is frequently a *composition* of gates — depth check, quota
check, host-pressure check, drain check — and the composition must still
emit one verdict from the one vocabulary. Two failure shapes to refuse:

- **Per-gate vocabularies.** Each check inventing its own result type
  forces every caller to normalize N vocabularies into one, and each caller
  normalizes differently. The gates report *into* the shared verdict; the
  reason field says which gate spoke.
- **Vocabulary bypass.** A second entry point that admits work without
  passing the gate — a debug path, an internal caller, a migration script —
  is not an exception to the vocabulary; it is a writer that skipped the
  door. The set of paths that can start work must be enumerable, and all of
  them speak the verdict.
- **Vocabulary erasure in transit.** The vocabulary must survive every
  boundary between the gate and whoever acts on the verdict. The failure is
  a wrapper above the gate that catches the refusal and re-throws something
  else — a generic error, or the last *underlying* failure it happens to be
  holding — so the caller, and every dashboard built on caller-visible
  errors, cannot tell "refused by policy" from "the dependency broke". A
  taxonomy computed perfectly two frames below an erasing boundary is a
  deviation, not compliance; the test is what the *outermost* consumer can
  branch on, not what the gate knew. The erased verdict's mirror image is
  the caller that re-derives the reason by matching message text — the tell,
  in either direction, that the verdict died in transit as data and
  survived only as prose.

## Two arms is correct where there is no waiting room

The three verdicts are a property of a gate that *has* somewhere to put a
waiting request. Where the design deliberately has none
([zero-depth-admission](./zero-depth-admission.md)), the vocabulary has two
arms, and that is not the collapse this technique warns about.

The distinction is between an arm that is **unreachable by construction** and
one that is **erased in transit**. A zero-depth gate never returns `queued`
because "later" is not a promise it can make — there is no position to report
and no line to hold a place in, so the verdict does not exist to be
collapsed. That is a smaller vocabulary, honestly drawn. The failure this
technique names is different: a gate that *does* hold work and reports it as
admitted, or refuses and reports it as queued. Those erase a distinction the
caller needed and the system had.

So the test is not "how many arms" but **whether every state the gate can
actually be in has a name the caller can branch on.** Two questions settle it:

- Can a request be accepted and not yet running? If no, `queued` is
  unreachable and its absence is correct. If yes — even briefly, even in a
  buffer somebody else owns — the state exists and needs its name.
- Is the two-armed result *typed*, or is it a boolean? A gate with two
  outcomes still owes a reason on the refusing arm, from the same closed
  taxonomy, for the same reasons. The moment it degrades to `true`/`false` it
  has lost the reason taxonomy, and the collapse this technique warns about
  has happened after all — not by dropping an arm, but by dropping the payload
  from the arm that remained.

The second question is where zero-depth designs actually fail. Dropping
`queued` is free; dropping the reason is the same outage as before, and it is
tempting precisely because a two-outcome function looks like it wants to
return a boolean.

## The verdict is atomic, and it comes first

Two sequencing rules keep the vocabulary honest at the mechanics level:

- **Check-and-take is one operation.** The verdict "admitted" *is* the
  acquisition of capacity — a gate that first asks "is there room?" and
  then, separately, takes the room has opened a window in which N
  simultaneous arrivals all see room for one. The admission call returns
  the verdict and, when the verdict is admitted, has already claimed the
  seat; there is no legal state between.
- **The verdict precedes the durable record.** Writing "started" into
  persistent storage *before* asking the gate creates a record that
  survives refusal — a run that every later reader believes is in flight
  and that nothing will ever finish. The honest order is verdict first,
  record second, and the record spells the verdict's own vocabulary: a
  queued entry is durably *queued*, not optimistically *running*.

## The verdict is also the record

Whatever the queue tells the caller, it tells its own telemetry: every
verdict is countable by outcome and reason, because "how often do we
refuse, and why" is the first question of capacity planning and the first
sign of an approaching incident. A queue that refuses silently — returns
refusals to callers but keeps no aggregate — has the data and discards it
at the moment of maximum value.
