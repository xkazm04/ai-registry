---
layer: application
type: application
subject: admission-queue
technique: priority-and-fairness
stack: next
verified_on: 2026-08-31
verified_against: next@15
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Next — per-key limits over a key the caller writes, with no floor underneath

How a Next.js application's server-side rate limiting stands against
[priority-and-fairness](../techniques/priority-and-fairness.md), and
specifically against its rule that **an unattested origin key is a fairness
scheduling key, never a capacity shard**.

## The seam

Two independent admission gates, both sharding capacity on a key the caller
supplies:

- A per-route limiter keyed on the **left-most** entry of the forwarded-for
  header — the hop the client itself wrote — falling back to a constant string
  when the header is absent.
- A public-API limiter keyed on an API key read from a header *or a query
  parameter*, where validation is a format regex unless an allow-list
  environment variable is configured.

Each key gets its own counter and window. Neither is attested. The gates guard
routes that spend real vendor money per call, including one commented in the
tree as an expensive operation, and one write path.

**There is no process-wide ceiling anywhere in the application.** No semaphore,
no spend meter, no concurrency cap in the platform config. The only
concurrency limiter in the tree is a within-request fan-out helper.

## The arms

The application's own limiter logic, transplanted verbatim into a harness, with
its own configured constants, driven by one interleaved trace of ten honest
callers and one attacker:

- **A** — as shipped: per-key capacity shard on the mintable key.
- **B** — the technique's repair: one global budget sized for the honest
  population, with the same key retained only for round-robin ordering.

## What the arms said

| policy | attacker keys | admitted/min | attacker share | honest total |
| --- | --- | --- | --- | --- |
| A | 1 | 110 | 9.1% | 100 |
| A | 1,000 | **10,100** | 99.0% | 100 |
| B | 1,000 | **100** | 99.0% | **1** |

Both halves of the rule reproduce. Occupancy under A is the per-key limit times
the number of keys, and the number of keys is free, so the bound is unbounded
in a quantity the attacker chooses — a 101× overshoot at a thousand keys.
Under B it is fixed at the global bound regardless. And the attacker's
**share** is 99.0% under both, which is the arithmetic the technique now
states: round-robin over a mintable key protects occupancy and protects nothing
about share.

**Verdict: better** — the rule predicted the occupancy blow-up, predicted the
share figure numerically, and named the missing global bound, and all three are
present here.

## The result that changed the technique

The most useful number in the experiment is the one nobody was looking for:
under the *correct* policy, honest throughput fell from 100/min to **1/min**.
The global bound protects the resource and does nothing for the honest caller —
it converts an unbounded occupancy loss into a total-but-bounded share loss,
and the broken policy had been serving honest callers out of capacity it should
never have admitted. A global bound is therefore necessary and not sufficient,
and only an attested key restores the honest caller's slice. That sentence is
now in the technique, and the seam is where it came from.

## The structural fact

Across the managed fleet, twenty-one server-side capacity-control key
derivations were enumerated. **Four are caller-mintable, and all four shard
capacity** — the forbidden case in every instance, with no exceptions in either
direction. Two applications of seven run per-key limits with no process-wide
ceiling at all.

Two independent trees had already reached the rule without it: one carries a
code comment recording that a caller-influenced prefix let an attacker mint a
fresh limiter bucket per prefix and bypass a per-tool cap, fixed by prefixing a
server-assigned identifier; another states the whole rule as a module header,
including both failure directions. That is corroboration rather than adoption,
and it is the better kind — the rule is reached independently where the key is
attested and violated everywhere it is not.

## What this realization cannot do

The harness measures admissions per minute against a synthetic trace, not cost.
It can show that a thousand keys buy a hundredfold overshoot in *admissions*
and cannot show what that overshoot costs, because the routes it guards call
metered vendors whose per-call price is not recorded on the request. Sizing the
global bound in currency rather than in requests needs a spend meter this tree
does not have.
