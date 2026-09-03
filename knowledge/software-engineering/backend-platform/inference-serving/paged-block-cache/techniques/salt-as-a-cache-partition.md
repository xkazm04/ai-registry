---
layer: technique
type: technique
subject: paged-block-cache
technique: salt-as-a-cache-partition
status: forged
laws: [absent-guard-is-loud, identity-survives-reuse]
shared_with: []
use_when: [a shared cache spans more than one tenant or trust boundary, deciding whether cache reuse leaks information, choosing the granularity of a cache partition, a privacy control is being shipped as an optional switch]
stage: multi-service
---

# Salt as a cache partition

A cache hit is faster than a miss. That is the point, and it is also a
disclosure. In a prefix cache the disclosure is unusually precise, because a
chained key means a hit says *exactly* "this specific sequence of elements, from
the very beginning, was computed recently" — not "something similar was seen".
A caller who can submit inputs and time its own responses therefore has an
oracle over other callers' inputs.

This is measured, not hypothetical. Published work on shared prefix caching
reports discrimination at **ROC AUC 0.99 from a prefix of only eight elements**
— an attacker distinguishing "someone else recently submitted content beginning
this way" from "nobody did", almost perfectly, with a very short probe
(CVE-2025-46570). Treat cross-tenant prefix sharing as an information channel
by default, and require an argument for leaving it open rather than an argument
for closing it.

## Why the obvious mitigations are bad

- **Disable reuse.** Correct and ruinous: it forfeits the entire optimization
  for every caller, including the overwhelming majority who share a trust
  boundary with each other.
- **A pool per tenant.** Reintroduces exactly the fragmentation and starvation
  that a unified allocator exists to prevent
  ([one-page-size-bought-with-padding](./one-page-size-bought-with-padding.md)),
  and the pool count now grows with the customer list.
- **Blocklist the probing pattern.** There is no pattern. The attack is ordinary
  requests, correctly formed, timed.

## The fix is one extra input to one hash

Because identity is chained, **mixing an optional caller-supplied salt into the
first block's key partitions the entire cache.** Every later key descends from
`key(0)`, so a single extra input at the root propagates to every block of every
length. Two callers with different salts cannot collide on any key, at any
depth, ever. Two callers with the same salt share everything, exactly as before.

The properties that make this the right shape:

- **Zero cost when unused.** No salt means the root constant, which is the
  existing behaviour, byte for byte. Nothing about the unsalted path changes.
- **One mix, whole-chain effect.** The partition is not enforced by a check on
  every lookup that someone can forget; it is a property of the keys themselves.
  There is no path that bypasses it, because there is no path that does not go
  through the key.
- **The caller names the boundary.** The cache does not have to model tenancy,
  sessions, or organizations. It accepts an opaque label and honours it. The
  system that already knows who the principal is supplies it.

This is [identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)
carrying a second obligation: the identity now encodes not only *what was
computed* but *who is allowed to find it*, and both survive together or neither
does.

## Granularity is the knob, and it costs hit rate

The salt is not a switch. Its **grain** determines both the strength of the
boundary and the size of the bill, and the source of this practice states the
trade plainly: salting reduces hit rate. There is no configuration in which it
does not.

| Grain | Isolates | Retains sharing | Typical fit |
| --- | --- | --- | --- |
| none | nothing | everything | one trust domain, all callers mutually trusting |
| per tenant / organization | across customers | within a customer's own traffic | the common multi-customer deployment |
| per user | across users of one tenant | one user's repeated work | shared inputs are per-user (documents, histories) |
| per session or conversation | almost everything | a single continuing interaction | high-sensitivity work, resumed sessions |
| per request | everything | nothing — the cache is off | never, as a policy; only as an escape hatch |

**Salt at exactly the grain of the boundary you actually have, and no finer.**
The most common mistake is to reach for per-user because it sounds safer, in a
deployment whose only real boundary is per-tenant — which discards the intra-
tenant sharing that was most of the hit rate, to defend against an adversary
who does not exist in that deployment. The second most common is to salt per
tenant while allowing untrusted end users to submit inputs directly within one
tenant, which defends a boundary that is not where the adversary is.

Two properties the salt value itself must have:

- **It is a secret, not a label.** This is the correction most designs need, and
  the name works against it — "salt" suggests a public per-entry differentiator,
  and here it is not one. An adversary who can guess or obtain another
  partition's salt can craft probes inside that partition and the oracle is
  fully restored. So it is a long random value — 256 bits is the stated floor,
  around 43 characters in a compact encoding — minted once per partition and
  stored. It is emphatically **not** a tenant name, an account identifier, an
  organization slug, or anything else derivable by someone who knows who the
  victim is. A predictable partition label is a partition that exists on paper.
- **Stable across the partition's lifetime.** A salt that rotates on every
  process restart silently converts the cache into a per-restart cache, and the
  symptom is a hit rate that quietly halves with no configuration change to
  point at.

## An optional privacy control is an absent one

The most important thing about this feature is the thing that will be gotten
wrong. Shipped as a per-request option, it protects the examples and not the
fleet: deployments converge on the default, and the default is unsalted. That
is [absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) precisely —
a guard that must be switched on has already made its most consequential
decision silently.

So the obligation on the *operator's* side, which the mechanism cannot discharge
for itself:

- **Attach the salt where the principal is already known** — the authenticating
  edge, the request-admission layer — rather than asking every client to send
  one. A caller that must remember a privacy parameter is a caller that will
  not.
- **Make unsalted a stated choice.** A deployment serving a single trust domain
  is entirely right to run unsalted; it should be able to say so, once, visibly,
  rather than arriving there by omission.
- **Measure the cost you accepted.** Hit rate before and after, at the chosen
  grain. Without it, a later performance investigation will find the salt,
  remove it, and observe an improvement.

## Do not conflate the partition with the collision defence

A chained key has a second unpredictability knob — the root value the whole
chain descends from — and it is tempting to treat the two as one control. They
defend different attacks and neither substitutes for the other. Randomizing the
root defeats an adversary who searches *offline* for a colliding block to plant
at a key the victim will look up; it is required only when the digest is not
collision-resistant, and it costs cross-process cache sharing. The salt defeats
an adversary who *times* requests to learn what others submitted; it is required
whenever partitions are mutually distrusting, and it costs hit rate within the
boundary it draws. A system that randomizes the root and calls the tenant
problem solved has closed the wrong door — and has also, silently, lost the
ability to share a cache between its own processes.

## What the salt does not fix

Partitioning the key space closes the *hit-timing* channel between partitions.
It does not close every channel a shared pool has: contention for pages, the
eviction pressure one partition exerts on another, and aggregate throughput
effects remain observable across partitions, because the memory is still shared.
Those are quantitatively weaker signals and they are not zero. State the residual
rather than describing the salt as isolation.

## When not to use this

- **A single trust domain.** One tenant, one team, one internal workload —
  every caller may already see every other caller's inputs by other means.
  Salting here buys nothing and costs hit rate.
- **Where inputs are public by construction.** A cache over content that is
  already published leaks nothing by admitting it was computed.
- **As a substitute for authorization.** The salt controls what can be *shared*,
  not what can be *fetched*. It is not an access-control mechanism and must not
  be described as one — the derived state itself is still reached through
  whatever the ordinary permission path is.
