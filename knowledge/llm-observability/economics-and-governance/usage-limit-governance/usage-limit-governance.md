---
layer: golden-path
type: golden-path
subject: usage-limit-governance
status: forged
use_when: [designing spend or usage caps over metered LLM traffic, building admission control on an ingest or gateway API, deciding how a cap behaves near and past its threshold, capping one customer or credential without touching other traffic]
techniques:
  - metric-window-threshold-action-model
  - graduated-throttle-with-deterministic-shed
  - dimension-scoped-caps
  - cost-evidence-and-imputation
  - incremental-window-accounting
  - concurrent-admission-integrity
  - enforcement-placement-and-reconciliation
---

# Usage limit governance

An LLM observability platform receives a stream of priced events from traffic
it did not emit, and at some point an operator asks it to do more than watch:
"cap this model at five dollars a day", "give the staging credential a tiny
budget while production keeps its real one", "stop this customer before their
experiment becomes our invoice". Usage limit governance is the discipline of
turning that sentence into an enforceable mechanism: **admission control over
metered traffic — scoped, graduated, measurable, non-flapping caps, and the
accounting substrate that makes them enforceable.**

The boundary with the builder's side of the seam matters. An agent framework
that stops its *own* run at a spend ceiling is budget discipline inside one
program — the builder caps traffic they emit, on a clock they own, with full
power to not make the next call. This subject is the operator's side: policy
written *about someone else's traffic*, delivered as admission control on the
API that receives the evidence of that traffic. That position carries an
honest structural limit which must be stated, not papered over: **rejecting an
event at ingest cannot prevent the provider spend it describes — the call
already happened; only its recording is refused.** The refusal is still real
governance — well-behaved clients treat 429 as back-pressure and slow the
traffic itself, and the breach alert reaches a human — but only an inline
gateway or proxy, sitting *before* the provider call, converts the cap from
back-pressure into prevention — and even that seat prevents approximately,
because a call's true token and cost spend is only known after the response
it was supposed to gate (see enforcement-placement-and-reconciliation). A
product that lets its documentation imply prevention it does not perform
has already failed the governance test.

## The core stance: a cap is only as real as its accounting

The naive cap is a threshold and an `if`: sum the window, compare, reject.
Every hard problem in this subject is a way that sentence quietly stops being
true. The sum reads unpriced rows as zero, so the newest model spends for
free. The window is re-aggregated on every event, so admission cost grows
with window size until someone "optimizes" the check away. Two concurrent
requests both read pre-burst usage and both pass. The threshold flips a
client from fully accepted to fully rejected between two consecutive events,
and its retries flap the boundary. A cap on one model silently counts — or
worse, rejects — another model's traffic. Each failure is invisible at
configuration time and expensive at incident time, which is why the stance
must be structural:

> **A limit is a policy joined to an accounting substrate. The policy names
> what is measured, over what window, at what threshold, with what
> consequence; the substrate guarantees that the measurement is complete,
> cheap enough to run on every admission, and correct under concurrency. A
> cap whose substrate fails any of those three is theater.**

The consequences form the spine of the subject:

1. **Policy is a four-part model, and the parts are orthogonal.** A rule is
   metric × window × threshold × action, validated at write time (a
   non-finite or non-positive threshold is a rule that breaches on any usage
   — reject it at creation, not at the first false alarm). Actions form
   three genuinely distinct tiers — observe-only, graduated, hard stop — and
   the observe-only tier never rejects anything in any state (see
   metric-window-threshold-action-model).
2. **Enforcement near the threshold is graduated and deterministic.** A
   throttling cap sheds a proportionally growing share of traffic before the
   wall, so clients feel back-pressure early; and the shed decision is a
   deterministic function of (rule, event), never a random draw, so the same
   event always gets the same verdict and rising pressure only ever adds to
   the shed set. Determinism is what makes the ramp non-flapping and
   testable (see graduated-throttle-with-deterministic-shed).
3. **Caps are scoped to dimensions, and non-matching rules are inert.** A
   rule may bind to a provider, model, use-case, credential, or customer; a
   scoped rule only counts and only rejects traffic matching its scope, and
   an event that does not carry a dimension is never charged against a cap
   on it (see dimension-scoped-caps).
4. **A cost cap carries its evidence, and an unmeasurable cap refuses.**
   Unpriced traffic is charged by imputation from the window's own priced
   traffic, the imputed share is disclosed beside the total, and a window
   with no priced evidence at all makes an enforcing cap refuse — a cap
   that cannot be measured is not a cap, and zero-because-unmeasured must
   never read as headroom (see cost-evidence-and-imputation).
5. **The window is maintained incrementally, on the server's clock.** Per-
   admission work is proportional to what changed since the last check, not
   to the window's population; eviction keys on the server's receipt time so
   a backdated event cannot fall out of the window it just consumed; and the
   cache is proven equal to the full-scan reference by property tests, not
   by inspection (see incremental-window-accounting).
6. **Admission is a critical section per accounting key.** Check-then-act
   over shared totals races by construction; the fix is an exclusive section
   scoped to the accounting key, chosen over optimistic isolation because a
   burst must cost latency, not enforcement or a retry storm — and a batch
   must count its own accepted items toward its later ones, so packing
   events into one request cannot slip a cap (see
   concurrent-admission-integrity).
7. **Where enforcement sits is a design decision with a reconcile loop.**
   Record-side, inline, and provider-side seats buy different guarantees;
   an inline cap on token or cost metrics is estimate-then-reconcile by
   construction, its overshoot debited against the window rather than
   forgiven; and where the provider offers its own spend ceiling, the
   platform's cap layers above that backstop instead of replacing it (see
   enforcement-placement-and-reconciliation).

## The refusal is part of the accounting

A cap that rejects an event and then forgets it has blinded itself at the
exact moment it became interesting. The rejected event must not be *stored* —
recording it would corrupt the very usage totals the cap evaluates against,
and would defeat the rejection — but it must be *counted*: a rejection ledger
keyed the same way as the rules (scope included, so a scoped cap and a
project-wide cap keep separate tallies) with counts, an estimated missed
cost, and first/last timestamps. If the ledger is best-effort and process-
local, the status surface says so; an honest "rolling view, resets on
restart" beats an implied audit log that isn't one.

The refusal itself is a contract, and its retry hint is derived, never
constant: a graduated shed asks for a short pause that grows with pressure
(nothing is over budget yet; the same traffic may pass moments later), while
a hard stop asks for a wait scaled to the window, because nothing frees
capacity until usage ages out — and under a rolling window it ages out
continuously, so the hint is deliberately much shorter than the window
itself. Conflating the two hints teaches clients to wait minutes for
transient back-pressure or to hammer a wall that will not move. When several
rules reject at once, the hard stop's longer wait outranks the shed's.

Proximity is published on *accepted* responses too. A well-behaved client
can only slow down before the wall if the wall's approach is visible — the
current shed fraction (or usage ratio) returned with every admission is the
cheapest cooperative-governance channel the platform has.

## What the cap must never throttle

The platform's own quality apparatus — judges, benchmark runs, the scoring
path — is exempt from every cap by construction, not by configuration. A
governance layer that meters its measuring instrument alongside the traffic
it measures will blind itself precisely when traffic spikes, which is
precisely when measurement matters. Monitored traffic trips limits; the
instrument never does.

## One evaluator, every surface

The ingest path that enforces, the read-only status endpoint an operator
polls, and the alerting path that pages all answer the same question — what
does this cap currently say? — and they must answer it through the same
evaluation code over the same usage snapshot shape. Two implementations of
"is this breached" will disagree exactly once, in production, in the gap
between what the dashboard showed and what the API did. The status surface
additionally answers the pre-breach question — how much has each value of a
dimension spent so far — because an operator setting a per-customer cap
needs the distribution before any rule exists, not after the first 429.

## What "done" looks like

A usage-governance layer meets the bar when: every rule is validated at
write time and expressible as metric × window × threshold × action plus an
optional scope; observe-only rules never reject in any state, including the
unmeasurable one; enforcement ramps deterministically before a throttled
cap's wall and never flaps; a scoped cap cannot count or reject traffic
outside its scope, and untagged traffic is never charged to a dimension it
does not carry; unpriced spend is imputed and disclosed, and an enforcing
cap with no priceable evidence refuses rather than reading as headroom;
admission cost does not grow with window size; a concurrent burst — or a
packed batch — cannot race past a threshold; rejections are counted without
being stored, with their honesty bounds documented; and the documentation
states plainly that ingest-time rejection governs recording and applies
back-pressure but cannot un-spend the provider call — with the inline
gateway named as the upgrade path for callers who need prevention, its
enforcement mode and worst-case overshoot stated, and the provider's own
spend ceiling set as the backstop wherever one exists.
