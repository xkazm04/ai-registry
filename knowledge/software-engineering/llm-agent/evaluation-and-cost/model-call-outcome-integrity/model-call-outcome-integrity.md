---
layer: golden-path
type: golden-path
subject: model-call-outcome-integrity
status: forged
use_when: [deciding what a finished model call is allowed to claim about itself, a model looks weak and the harness has not been ruled out, choosing where the single call seam sits and what may bypass it, a benchmark and production disagree about which configuration was measured, spend must be recorded for a call that failed, a caller needs to know which engine actually answered and why]
techniques:
  - unattempted-is-not-failed
  - spend-precedes-the-error
  - elimination-reasons-are-a-closed-vocabulary
  - declared-call-site-identity
  - credential-posture-at-the-call-door
  - enforcement-demotion-on-translation-loss
  - one-deadline-across-attempts
  - the-measurement-runs-the-served-configuration
---

# Model-call outcome integrity

A **model call seam** is the one place an application hands work to a language model
and takes an answer back. This subject is about a single question that seam must be
able to answer honestly once a call has finished: **was the model allowed to answer?**

That question sounds trivial and is not. A seam reports an outcome — an answer, or a
failure — and everything downstream treats that report as a fact about the *model*:
quality dashboards, model-selection decisions, cost attribution, the choice of which
vendor to renew. But most of what can go wrong at a call seam is imposed by the
**caller**: a completion ceiling, a wall-clock deadline, a schema the vendor could not
express, a credential that routed the work somewhere unintended, a request window the
caller never knew existed. When the seam cannot distinguish those from the model's own
performance, every number built on top of it is measuring the caller and attributing it
to the vendor.

The failure is not rare and it is not obvious. It looks like a working system producing
confident numbers. That is what makes it worth a subject: the defect's signature is
**plausibility**, so it survives review, ships, and then decides budgets.

## The claim this subject defends

> An outcome may describe the model only to the extent the model was given the chance to
> produce it. Everything else the seam must attribute to itself.

Three consequences follow, and they are the whole subject.

**A limit reached is not a quality observed.** A truncated completion, an expired
deadline, a closed connection and a refused request are facts about the environment. A
seam that renders them as an empty answer, a malformed answer or a low score has not
merely lost information — it has manufactured evidence against the model. Reporting the
limit *by name*, with the value that bound it and the knob that would raise it, converts
an accusation into a work item.

**A non-answer is not an answer, and it is not free.** A call that returns nothing may
still have consumed the budget, and a call that failed may still have been billed. Spend
accounting and failure detection are usually built by different people at different
times, and the seam is where they must not trade off: the ledger is written before the
error is raised, or the cheapest way to defeat a budget is to fail.

**A degrade the caller cannot see is a lie the caller will repeat.** Seams fall back —
to another model, another provider, a deterministic stand-in. Each fallback is
defensible; a fallback the caller cannot observe is not, because the caller will publish
the result as though the intended engine produced it. What the seam substituted, and
why, travels with the answer or the substitution should not happen.

## Where this subject starts and stops

It begins when a call has been dispatched and ends when its outcome has been reported.
Five neighbours own the surrounding machinery, and this subject cites them rather than
restating them.

**Choosing what to call** — which model, which provider, which effort level, what the
fallback order is, and what happens when a candidate is unavailable — belongs to the
routing subject. This subject inherits that decision and only insists the *result* of it
be visible in the outcome.

**What a call cost** — price tables, ledgers, budget ceilings, spend attribution and
their reconciliation — belongs to the metering subject. This subject contributes exactly
one rule to it, about ordering: the ledger write happens before the error propagates.

**What a stored event looks like** — the fields an ingest schema must carry, which of
them the server owns, how usage is normalized across vendors — belongs to the telemetry
subject. This subject is about what the seam must *know* in order to fill those fields
truthfully.

**How a benchmark is run** — matrices, sampling, cost ceilings, comparability across
months — belongs to the benchmark-operations subject. This subject contributes the
precondition that makes such a run mean anything: the measured configuration and the
served configuration are the same one.

**Putting one process in front of upstreams for callers you do not control** is a
gateway, a different problem with a different threat model. Here the caller is you, the
seam is in your own process, and the reason it exists is attribution rather than
routing.

## What a seam must be able to say

An outcome carries an answer or it carries a reason, and the reason is drawn from a
closed set the seam owns. The minimum vocabulary separates four things that naive seams
collapse into one:

| the seam observed | what it means | who owns it |
| --- | --- | --- |
| the model answered | an answer exists and may be judged | the model |
| the model answered wrongly | the answer exists and failed a check | the model |
| the model was cut off | a ceiling, deadline or window ended the attempt | the caller |
| the model was never reached | no candidate was eligible, or none accepted the work | the caller |

Only the first two are evidence about a model. The third and fourth are evidence about
configuration, and a seam that cannot tell them apart will eventually publish the fourth
as the second — which reads as a damning result and is a bug report about the seam.

Two properties make the distinction reliable rather than aspirational. The seam must be
**the only way to make a call**, because a bypass reintroduces every collapse this
subject exists to prevent, and the strongest form of "only" is one the compiler
enforces. And the seam must **declare which call site it is acting for**, because
without an identity the outcome cannot be aggregated, compared over time, or noticed
when it stops appearing.

## What this subject does not require

It does not require a particular transport, a particular vendor set, or a single
provider abstraction: a seam that speaks to exactly one model can satisfy every rule
here, and several that speak to seven do not. It does not require streaming, caching, or
a prompt registry — those are ordinary engineering choices with their own trade-offs. It
does not require the seam to *prevent* degradation, only to report it.

And it does not require the seam to be sophisticated. The cheapest conforming
implementation reads one field from the response before doing anything else with it,
writes one identifier onto the outcome, and orders two lines of code so the ledger
precedes the raise. Most of the value is in those three moves.
