---
layer: technique
type: technique
subject: generative-provider-routing
technique: non-silent-elimination
status: forged
laws: [refusal-is-a-state, unmeasured-is-not-pass]
shared_with: []
use_when: [an asset arrived from an unexpected vendor, a whole chain came up empty and the error must explain why, a request field would be silently ignored by a vendor]
---

# Non-silent elimination

A routing chain earns its keep on the requests it does *not* serve as planned
— and those are exactly the requests where the naive implementation goes
quiet. The technique is one invariant, held everywhere: **every vendor that
drops out of the chain leaves a record of who and why, and that record
reaches the caller.** A fallback that cannot be audited afterwards is
indistinguishable from a bug; a chain that fails without naming its
eliminations hands the operator a guessing game at the worst possible moment.

## The four eliminations

A candidate leaves the chain in exactly four ways, and each gets a distinct
recorded reason, because each demands a different fix:

1. **Unsupported** — the vendor does not have the capability at all. As a
   trailing entry this is recorded and stepped over; as the *first* entry it
   throws immediately, because a plan whose primary cannot do the job is a
   bug in the table, not a runtime condition to route around. Fix: edit the
   plan.
2. **Constraint** — the vendor cannot honour a field of *this* request. The
   canonical case: a request carries reference images for style conditioning,
   and one vendor's API accepts them and silently ignores them. Whether a
   vendor *reads* a field is a routing fact, declared on the adapter and
   tested by the router before the call — never left for the adapter to drop
   on the floor. The failure this prevents has no error anywhere: an on-time,
   on-budget image that is simply not in the locked style. An unconditioned
   image in the wrong style is not a cheaper success; it is a failure that
   looks like one, and per
   [unmeasured-is-not-pass](../../../_laws.md#unmeasured-is-not-pass) a call
   that ignored half its request must not present as a pass. Fix: route to a
   vendor that honours the field, or drop the field on purpose, visibly.
3. **No credential** — the vendor is planned but not keyed in this
   deployment. Skip it, at any position, but record it: an unconfigured
   primary is *why* the caller is billed for the fallback, and it is the
   headline message when the fallback is unkeyed too. Fix: configure the key,
   or trim the plan for this environment.
4. **Called and failed** — refusal, rate limit, timeout, vendor error. The
   reroutable kinds walk on
   ([refusal-is-a-state](../../../_laws.md#refusal-is-a-state)); the rest throw.
   Either way the attempt is recorded with its kind. Fix: per kind.

## Where the trail must land

One record, three destinations — and all three, not any one:

- **On the result**, when a later vendor served. The eliminations settle into
  the asset's provenance as "re-routed from", most-preferred first. This is
  the load-bearing copy: an asset outlives the process and the logs that made
  it, and "why is this plate from the second-choice vendor?" must stay
  answerable from the asset alone. Its *presence* is the signal — the
  ordinary single-hop call carries no such field, so the field appearing is
  itself the re-route notice.
- **In the error**, when nothing served. The message names the most specific
  cause held: the first error describes the vendor the plan *meant* to use,
  which is the honest headline — but a request-level constraint outranks it.
  "No credential for the primary" does not explain why the primary was the
  only candidate; "this request needs reference support; the only vendors
  that have it could not serve it" does. Compose both.
- **In the operational log**, either way — one settle line per request with
  capability, environment, steer, trail, duration, and cost. The log is for
  rates and trends (how often is the primary skipped? which eliminations
  dominate?); it is the copy that feeds plan revisions.

## Decision rules

- Record the elimination at the moment of the decision, in the loop that
  made it — not reconstructed afterwards from logs. Reconstruction drifts.
- Keep elimination reasons closed-vocabulary (the four kinds plus the error
  kinds), so the trail is aggregatable; put the human-language specifics in
  the message, not the kind.
- The constraint's description travels in plain language ("needs reference
  images"), because when it empties the chain it is the only thing that
  explains why configured, capable vendors were never called.
- A billed fallback is acceptable; an undiscoverable one is not. The chain
  may spend money on the second choice — what it may never do is leave
  anyone unable to find out that it did.

## When not to use this

There is no scale at which silent elimination is fine — but there is a scale
at which the *mechanism* shrinks. A single-vendor pipeline has only two
eliminations (no key, failed), and its "trail" is simply an error that names
them. What this technique forbids even there is the catch-all: an empty
result or a generic "generation failed" that collapses four different fixes
into one unactionable message.
