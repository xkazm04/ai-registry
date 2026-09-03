---
layer: technique
type: technique
subject: retry-backoff
technique: jittered-revocation-with-irrevocable-terminal
status: forged
laws:
  - deletion-is-not-repair
  - failure-not-empty-success
  - count-carries-predicate
shared_with: []
use_when: [a server must revoke credentials it issued and the remote that holds them is down, a revocation loop retries forever or deletes what it cannot revoke, a leadership change aborts in-flight cleanup and the log fills with errors, one backend's outage starves every other backend's revocations]
stage: multi-service
---

# Jittered revocation with an irrevocable terminal

The issuer of a leased credential owes a second act: when the lease ends, the
credential must stop working *at the remote that honours it*. Expiry is local
and cheap; revocation is a call against something the issuer does not control,
and it fails in every way the golden path's four classes describe. The retry
discipline is therefore the ordinary one — but with two twists the ordinary
loop gets wrong. First, the work is not a request somebody is waiting on; it is
the server's own liability, and nobody notices when it is quietly mishandled.
Second, the failure to complete it has a security meaning: a credential the
issuer believes dead is alive in the world. The naive loop mishandles both by
retrying forever (the liability never surfaces) or by giving up and deleting
the lease (the liability is forgotten). This technique is the shape that does
neither.

## The ladder: exponential, jittered by proportion, bounded by count

Revocation retries ride an exponential ladder with a hard attempt cap. The
delay for attempt *n* is the ladder's `base × 2^n`, then randomised by a
**proportional jitter of plus or minus half the delay** — a draw from
`[0.5 × d, 1.5 × d]`. This is wider than the cosmetic wobble backoff-design
dismisses and narrower than full jitter, and the choice is deliberate for this
work: revocations against one remote fail together (the remote is down), so the
herd is real and needs a real spread, but each retry also carries the *lease's*
own deadline history, and a floor of half the delay keeps a lease that has
already failed five times from drawing a near-zero delay and rejoining the
front of the storm. Where the herd is the only concern, full jitter is still
the stronger default; where every item also carries an escalation history
worth respecting, a proportional band around the rung is the honest compromise.

The cap on attempts is the design's third number, and it ships with the ladder
or the ladder is unbounded retry wearing a schedule. Six attempts on a doubling
ladder from a base of ten seconds is a little over ten minutes; that is long
enough for a restart or a network partition to clear and short enough that a
genuinely unreachable remote is declared such within the same incident, while
an operator is still looking.

The cap is not the only way in. The golden path's reclassification rule applies
here with unusual force: when a revocation attempt returns evidence of
permanence — the backend reports the operation unsupported, the path unknown,
the request malformed — the lease moves to the terminal state on that attempt,
mid-ladder, without spending the remaining rungs. Retrying an unsupported
operation five more times is not caution; it is five more log lines between the
operator and the fact that a backend no longer knows how to revoke what it
issued. The classification is the backend adapter's, made against the typed
error it still holds, and the loop consumes only the class.

## The terminal state is irrevocable, and irrevocable is a fact, not a failure

When the attempts run out, the lease transitions to an explicit **irrevocable**
state. The name is chosen against two easier ones. It is not *failed*: the
issuer's action did not fail, the remote's reachability did, and the credential
may or may not be live — that is precisely what nobody knows. It is not
*expired*: an expired lease is one whose credential is presumed dead, and this
one is presumed nothing. Irrevocable states what remains true: **the issuer has
stopped trying and the world may still hold the credential.** The state is
written as data, spelled apart from every other ending
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)),
and it satisfies three obligations:

- **It is counted**, and the count carries its predicate
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)):
  "leases irrevocable after N attempts, by source", never a bare integer. A
  count of irrevocable leases per source is the cleanest available signal
  that a remote has been unreachable long enough to matter, and it is the one
  number an operator's dashboard should carry from this loop.
- **It is listable**, by source, with the lease's identity and the last
  failure it saw, so the operator can go to the remote and revoke by hand — or
  confirm the remote is gone and the credential with it.
- **It is manually resolvable**: an operator verb that either retries the
  revocation once more (the remote is back) or marks the lease resolved
  because the credential was dealt with out of band. Resolution is a verdict
  a human gives, recorded with who gave it.

The failure mode the state exists to prevent is the one deletion produces.
Deleting a lease the issuer could not revoke removes the only record that a
credential of unknown liveness exists, at the exact site where that knowledge
existed ([deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair)).
It looks like cleanup; it is amnesia. The opposite error — retrying forever —
is subtler and equally wrong: the lease sits in the schedule for months, every
attempt logs an error, the log becomes the noise floor, and when the remote
finally answers the credential it revokes has long since been rotated by
someone who never learned the issuer had lost track of it. Between deleting
and haunting there is exactly one honest state, and it has to be named.

Irrevocable is terminal *for the ladder*, and that qualifier is precise. A
remote that was unreachable for twelve minutes is often reachable next week,
and a set of irrevocable leases that nobody re-tries is a set that only grows.
The honest addition is a **slow sweep over the terminal set** — a single job on
a cadence measured in days, walking every irrevocable lease older than a grace
period past its expiry and issuing one revocation each — which is a different
mechanism from the ladder in every way that matters: it runs once per cadence
for the whole set rather than per item on an escalating schedule, it re-enters
the ordinary worker pool as one job so it cannot storm, it moves a lease out of
the state only on success, and its failures re-mark nothing because the lease
is already where it belongs. The sweep is the terminal set's probe, in exactly
the sense a breaker's half-open state is a probe: deliberate, bounded, and
never mistaken for the retry it is not. What the sweep must not become is a
second ladder — a per-item timer that fires daily forever is the haunting
again, one day slower.

## Losing leadership is not an error

On a replicated issuer, revocation is leader work: one node owns the schedule,
walks it, and issues the calls. A leadership change in the middle of a ladder
is an ordinary event, and the loop must treat it as one. The rule is that
**the state change that revoked leadership is the same state change that
restarts the loop on the new leader**, so an attempt aborted by loss of
leadership needs no error, no retry, and no terminal state of its own — the
new leader rebuilds the schedule from persisted leases and the ladder resumes
there. The old leader's in-flight attempt exits silently, because whatever it
was about to record is now the other node's to record.

Two consequences. The abort check is cheap and comes *before* the remote
call, not after — a call whose result the node is no longer allowed to record
is a call not worth making. And the attempt count's survival across the change
is a stated choice: persisted with the lease, the ladder resumes at rung *n* on
the new leader; held in memory, it resumes at rung zero, and a cluster that
fails over often will retry a dead remote from the top of the ladder every
time. The seam with the subject that owns *why* a replica leads or follows is
named here and not crossed: this technique assumes a single leader and a
persisted lease store, and says what the loop does when the leader changes.

## One queue per source, and a fair share of the workers

Revocation work arrives in storms, and the storms are keyed by the remote: a
database that goes away takes every lease issued against it into the retry
schedule in the same minute. If the schedule is one queue drained by one pool,
that source's thousands of retries occupy every worker and the revocations
against every healthy remote wait behind them — an outage in one backend
becomes a revocation outage in all of them. The structure that prevents it is
**a queue per source** (per mount, per backend instance — whatever unit fails
as one) with **a per-queue worker cap** so no single queue can hold more than
its share of the pool. The cap's derivation — from pool size and queue count,
with headroom — belongs to the rate-limiting subject's fairshare rule; this
technique states only that the cap exists, that it is per source, and that
queue creation follows source creation so a new mount is never starved by
arriving late. Draining is round-robin across queues, so a source with one
lease and a source with ten thousand both make progress every pass.

## Decision rules

- **When a revocation fails, retry on the jittered ladder; when the attempt
  cap is reached, transition to irrevocable — never delete, never keep
  retrying.** Because deletion forgets a live credential and infinite retry
  hides one, and only an explicit state lets a human close the gap.
- **When the state that granted leadership changes mid-attempt, exit
  silently.** Because the same change restarts the loop elsewhere; an error
  here is a lie about the remote and a page about nothing.
- **When an attempt returns a permanent class, transition on that attempt.**
  Because the remaining rungs cannot change an unsupported operation into a
  supported one, and the ladder is a schedule, not a commitment.
- **When the loop reaches a lease already irrevocable, skip it.** The
  automatic ladder is over; only the manual verb or the slow sweep touches the
  lease again, and neither re-enters it into the ladder. A renewal request
  against an irrevocable lease is refused with the state named in the reason,
  because a lease the issuer cannot revoke is not one it may extend.
- **Key the retry queue by the source that fails together, and cap each
  queue's workers.** Because one remote's storm must cost that remote's
  revocations time, and nobody else's.
- **Report irrevocable counts per source, with the attempt cap in the
  predicate.** A single global number hides which remote is unreachable and
  turns the loop's best signal into a mood.

## When not to use it

A credential that self-revokes at expiry — a short-lived certificate, a token
whose validity the remote checks against the issuer — does not need this loop;
its terminal state is *expired* and there is nothing to retry. The irrevocable
state earns its place only where the remote holds a credential that outlives
the lease unless told otherwise.
