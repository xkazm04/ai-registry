---
layer: golden-path
type: golden-path
subject: rate-limiting
status: forged
techniques:
  - algorithm-selection
  - refusal-contract
  - key-design
  - untrusted-key-derivation
  - unattributable-client-bucketing
  - limiter-topology
  - storm-hygiene
  - limit-observability
  - limit-derivation
---

# Rate limiting

Every system exposes doors through which outside actors — users, integrations,
schedulers, other machines — can cause work, and none of those actors is obliged
to be reasonable. Rate limiting is the discipline of **bounding how much work a
key may cause per unit time**: not whether the work is valid (validation's job),
not whether capacity exists right now (admission's job), but whether *this actor*
has already caused *enough* in *this window*. The limiter is the part of the
system that says a calibrated, attributable, time-boxed **no**.

The boundaries matter because three neighboring subjects also say no, and
confusing their refusals produces machinery that enforces none of them well. An
[admission queue](../../work-execution/admission-queue/admission-queue.md) refuses by **capacity** —
"not now, too much in flight" — a statement about the system's instantaneous
load, healed by other work finishing. A rate limit refuses by **time window** —
"not again until" — a statement about one key's recent history, healed only by
the clock. [Cost metering](../../../llm-agent/evaluation-and-cost/cost-metering/cost-metering.md) refuses by
**budget** — money over a billing period, a calendar-scale ledger, not a
per-second regulator. The three compose naturally (a request may pass the rate
limit, then the budget gate, then wait in admission), but each has its own clock,
its own key, and its own refusal contract. What the refused caller *does next*
is the fourth neighbor's territory:
[retry-backoff](../retry-backoff/retry-backoff.md) owns the consuming side of
every refusal this subject emits. One more impostor deserves naming: **"one at
a time" is not a rate limit.** Mutual exclusion — refusing because the same
operation is already in flight — is an exclusivity guard, healed by completion,
not by the clock. Systems that reuse the rate-limit vocabulary for exclusivity
refusals teach their consumers that "you are throttled" and "you double-clicked"
are the same condition, and every automated reaction built on that vocabulary
is then right for one population and nonsense for the other.

## The core stance: the limit is a contract, and the refusal states it

The naive limiter is a counter and a boolean: too many, reject, maybe log. It
fails not at counting but at *communicating*. A rejection that says only "slow
down" without "until when" does not reduce load — it converts one request into a
guessing game of retries, each of which the limiter must also process. The
callers this subject regulates are mostly machines, and machines do exactly what
the refusal tells them; a refusal that tells them nothing gets nothing.

> **A rate limit is a published contract between the system and each key. The
> refusal is where the contract is stated: which limit, over what window, and
> when the next request will succeed.**

The consequences of that stance form the spine of this subject:

1. **Algorithm choice is a precision/memory trade, and burst semantics are the
   real difference.** Fixed windows, sliding windows, and token buckets all
   enforce "N per period" on average; where they differ is what happens when an
   idle key suddenly sends everything at once, and how much state buys how much
   precision at the boundaries (see algorithm-selection). Pick by the burst
   behavior the resource can survive, not by algorithm fashion.
2. **The refusal is structured, machine-readable, and honest.** It carries the
   key, the limit, the window, and a computed retry-after — a promise derived
   from the limiter's actual state, not a constant someone liked (see
   refusal-contract). The caller-side contract — classify as rate-limited,
   honor the stated time — is retry-backoff's half of the same handshake.
3. **Key design decides fairness and cardinality.** Whatever the key is —
   tenant, credential, endpoint, a tuple — that is the unit that competes for
   the resource, and every actor sharing a key shares a fate. And any key
   derived from world-controlled input is an unbounded set: **an unbounded
   per-key state map is a memory leak with a policy name** (see key-design).
   Upstream of that choice sits a harder one: on an unauthenticated door every
   field that identifies the caller was written by the caller, so the key is
   *derived* through an ordered ladder of sources, each admitted by a checkable
   fact about the deployment rather than by the field's name — a forwarding
   field trusted by name is a lever the attacker pulls to mint a fresh bucket
   per request, which switches the limiter off for exactly the caller it exists
   to stop (see untrusted-key-derivation). And when the ladder runs out, the
   intuitive answer — one shared bucket for everyone unattributable — is a
   denial of service you build yourself, because ordinary traffic arrives
   unattributable in bulk and exhausts a single allowance; the answer is to
   spread those callers across coarse buckets under an aggregate ceiling, and
   to label the spreading value entropy rather than identity at the place it is
   produced (see unattributable-client-bucketing).
4. **One resource, one limiter.** Two independent limiters each enforcing N on
   the same resource through different doors enforce neither's number — the
   resource sees up to the sum. All doors that cause the work share the
   instance, and the doors are enumerable (see limiter-topology).
5. **The limiter's own noise is bounded.** The limiter meets its heaviest
   traffic at the exact moment it is refusing, and a limiter that logs every
   rejection during a storm is a second storm — the defense becoming a
   participant in the attack (see storm-hygiene).
6. **A limit nobody can observe is a limit nobody can operate.** Usage
   snapshots, near-limit warnings before the first refusal, and refusal counts
   that name their limit are what let an operator raise a limit before an
   incident instead of during one (see limit-observability).
7. **The number is derived, not chosen.** A limit is the output of arithmetic
   over two independent measurements: what one admitted request causes to be
   spent in every system it touches — including the ones you do not own — which
   sets the ceiling, and the cadence legitimate traffic actually produces, which
   sets the floor (see limit-derivation). The arithmetic is written beside the
   number, so the next person recomputes rather than re-guesses. The two errors
   are not symmetric: a number set too high is invisible until the bill or the
   outage, while a number set too low is visible immediately, to your most
   engaged caller, as your system appearing broken. And a limit whose purpose is
   friction rather than protection is not derived from cost at all — it is
   chosen from the plan, and it says so, because a friction limit dressed in
   cost arithmetic invites a reviewer to harden it at an expense its purpose
   never justified.

## The limiter owns the policy

A corollary of the contract stance that decides an API shape: **the limit's
key, number, and window are the limiter's state, not the caller's arguments.**
A limiter whose check takes the budget as a per-call parameter has externalized
its own policy — nothing can then answer "what is this key's limit?", so the
refusal cannot publish the rule, the dashboard must guess the limit from the
key's spelling (and will be wrong for some key family), and two callers can
pass two different budgets for one key with no arbiter. Policy registered with
the limiter once — per key pattern, per door — is what makes the refusal
contract and the observability surface derivable from the same authority
instead of reconstructed, differently, at every consumer.

## Refusal is a verdict, not a failure

The single most common integration bug downstream of a limiter is treating its
refusal as an error like any other. It is not: nothing is broken, nothing needs
alerting per-occurrence, and the correct response is *scheduled patience*, not
diagnosis. The refusal therefore must be spelled differently from failure at
every layer — a distinct outcome in the limiter's return type, a distinct signal
on the wire, a distinct series in the metrics. A limiter whose "no" is
indistinguishable from a crash teaches its callers to retry crashes and to page
humans about weather.

The same discipline applies in the other direction: a limiter that cannot run —
its state store unreachable, its clock unreadable — has *not* refused anything,
and must not report refusals it never evaluated. Whether it then fails open
(admit unmetered) or fails closed (refuse all) is a policy choice made per
resource, on purpose, in advance: fail open in front of resources that degrade
gracefully, fail closed in front of resources where overload is unrecoverable.
The unacceptable option is the accidental one.

## Two postures: shield and citizen

Every limiter faces one of two directions, and the direction changes what
"correct" means:

- **Ingress (the shield):** protecting this system's own resources from outside
  demand. The limit is ours; we are the authority; the number is whatever the
  resource can sustain. Precision matters at the boundary because we publish the
  contract.
- **Egress (the citizen):** pacing this system's own outbound calls to someone
  else's limit. Here the limiter is a *local model of a remote authority*, and
  the model will drift — the provider changes tiers, other clients share the
  quota. An egress limiter is therefore always advisory-plus-corrective: it
  paces optimistically, and treats the provider's actual refusals as
  corrections to the model, never as surprises to escalate.

Both postures use the same algorithms and the same hygiene; they differ in who
owns the number and what a refusal teaches.

## What "done" looks like for this subject

A rate-limiting layer meets the bar when: every limited resource has exactly one
limiter and its doors are enumerable; every limit is a stated contract — key,
number, window — rather than a constant buried in a condition, with the
arithmetic that produced the number recorded beside it and overridable without a
release, since its inputs are other people's configuration; every refusal
carries a computed retry-after and is spelled as a verdict, distinct from
failure; every key on an unauthenticated door comes from a ladder whose every
rung names what makes it trustworthy, and the callers that ladder cannot
attribute are spread rather than pooled into one shared allowance; per-key
state is bounded with a named reaper, so hostile cardinality
costs memory the design already budgeted; a rejection storm produces one
summarizing log line per key per episode, not one line per rejection; and an
operator can see, for any key, how close it is to its limit *before* the first
refusal — because the cheapest rate-limit incident is the one the dashboard
made unnecessary.
