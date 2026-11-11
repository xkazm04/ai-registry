---
layer: technique
type: technique
subject: rate-limiting
technique: unpublished-behaviour-limit
status: forged
laws: [gate-sees-target, limits-are-derived, failure-not-empty-success]
shared_with: []
applied: blind-ab
ab_verdict: better
use_when: [an agent or batch job writes to a hosted service it does not own, several workers share one account on a third-party platform, a run creates issues comments messages or other objects other people will see, a refusal arrives while the published quota still shows headroom, deciding what an egress limiter does when it cannot count, choosing between pacing a batch of creates and merging them]
---

# Unpublished behaviour limit

An egress limiter models someone else's number ([limiter-topology](./limiter-topology.md),
[key-design](./key-design.md)). This technique is about the number nobody
publishes. A hosted service meters a client on at least two layers. The
**published quota** has headers, a quota endpoint and a documented reset. The
**behaviour layer** is abuse detection: it judges the *shape* of what one
identity does - bursts of writes, concurrent writers on one account, volume of
content other people will see - and it advertises nothing. Its headers report
the published layer's headroom while it refuses you.

An automated writer meets the second layer first. A person cannot create
thirty objects in twelve seconds; an agent does it without trying. A run that
paces carefully against the published number can still trip the behaviour
layer, because it is pacing on the wrong axis.

## Headroom on the published quota is not a verdict on the behaviour layer

[gate-sees-target](../../../../_laws.md#gate-sees-target): the quota endpoint
sees the published layer and nothing else. A refusal that arrives while that
endpoint shows headroom (forbidden, temporarily blocked, a "secondary" or
"abuse" wording) comes from the behaviour layer. Classify it as its own
outcome, apart from credential failure and from quota exhaustion
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
Filed as an auth error, it makes the run re-authenticate and keep going. Filed
as quota, it makes the run wait for a reset that never comes.

## Budget by the axis the behaviour layer judges

Split outbound calls into three classes, each with its own budget:

| class | examples | what the behaviour layer judges | budget shape |
| --- | --- | --- | --- |
| reads and polls | list, status, fetch | rate and concurrency | pace; one poll per interval, not a tight loop |
| mutations | merge, delete, update | concurrency and burst per account | a cap on concurrent writers per **account**, summed across workers |
| visible creation | issues, comments, messages, posts, review requests | count and burst per identity, and how much it looks like spam | a **count cap per run**, then a rate |

The concurrency cap belongs to the account, not to the worker. Six workers
that are each polite are one impolite account.

## Merge before you pace

For visible creation, pacing does not fix the problem. Twenty-eight issues
spread over ten minutes are still twenty-eight issues, and the behaviour layer
judges the count as well as the gap. First reduce the number: merge related
findings into one artifact with entries (a tracking item with a checklist, one
comment with a list). Above the per-run cap, the run writes the remainder to a
local reviewed list, and a person decides whether they become separate public
objects. One public object per finding is a product decision; an agent does not
make it by default.

## A behaviour refusal stops its class; it is not retried

Retrying a behaviour refusal sends more of the behaviour that was judged. On
the first one, the run stops that class of call for the rest of the run,
records what it did not do, and reports it. Reads may continue at their normal
pace. Backoff loops are the right tool for published limits
([retry-backoff](../../retry-backoff/retry-backoff.md)) and the wrong one here:
the sanction can outlast the run (minutes of blocking, up to action against the
account), and each attempt makes it worse.

## Fail closed for visible creation

[limiter-topology](./limiter-topology.md) lets an unavailable egress limiter
fail open, with the provider as backstop. That holds when the provider's answer
is a refusal. It does not hold when the answer is a sanction on the identity.
If the run cannot count its visible creation (lost state, a new worker that
does not know what its siblings did), it creates nothing and queues the items.
Reads and mutations keep the fail-open posture.

## The numbers are observed, and say so

The behaviour layer's thresholds are undocumented, change without notice, and
differ by class. Every cap is an observation with its source
([limits-are-derived](../../../../_laws.md#limits-are-derived)): "N concurrent
writers tripped it on a dated run, M held on another". Never present one as a
derivation. Raise a cap that held on purpose and record the result; never
loosen it quietly because one run went well. When a later trip contradicts the
record, the trip wins.

## Tells

- A forbidden response while the quota endpoint reads full.
- A concurrency cap written per worker, with no account-wide sum.
- A filing loop with a sleep between calls and no bound on the count.
- One public object per finding, created by default.
- A behaviour refusal handled by the same backoff loop as a 429.
- A cap with no date and no record of the run that set it.
