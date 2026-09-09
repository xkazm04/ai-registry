---
layer: technique
type: technique
subject: tenant-scoped-agent-runtime
technique: stamp-ownership-before-the-router
status: forged
stage: multi-service
laws: [identity-survives-reuse, unknown-is-not-a-value]
shared_with: []
use_when: [ingress handling runs before the event carries a tenant stamp, two tenants serving the same conversation collide on one lane, batching or a busy guard is keyed on something that is not the tenant, deciding the resolution order for an event with no owner]
---

# Stamp ownership before the router

Some ingress work batches events or checks busy lanes before the main router
runs. Establish trusted ownership before that first tenant-sensitive operation.
For a connector dedicated to one tenant, bind its owner during configuration
before registering live callbacks, and preserve it across reconnects.

A multiplexed connector cannot always know the tenant at configuration time.
Authenticate and route each event early enough, or keep pre-routing work free
of tenant data and keyed by an appropriate transport identity.

## Resolve trust before specificity

Possible sources are an authenticated upstream event stamp, the configured
connector owner and an already-authorized task scope. Define which may assert
or override ownership. A field supplied by an untrusted event does not outrank
the connector simply because it is more specific. Validate served-set membership
and reject conflicting identities unless an explicit routing policy permits them.

Treat a missing identity as unresolved under
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value), not an implicit
default tenant. Reject or quarantine with a bounded diagnostic and a delivery
policy; when possible, negative acknowledgement preserves recovery rather than
silently dropping work. Never redirect it to a convenient default.

At configuration time, require the attributes real adapters need. Compatibility
with incomplete test doubles is not a reason to tolerate missing production
ownership. Normalize and validate identities before constructing keys.

## One namespace for every lane structure

Key session lookup, batching, active-turn tracking, busy guards, cooldowns,
mode flags and status with the necessary tenant/connector/conversation dimensions.
Use a tuple or unambiguous encoding from one builder; delimiter concatenation
can collide when identifiers contain that delimiter. Ownership remains stable
across connection reuse under
[identity-survives-reuse](../../../../_laws.md#identity-survives-reuse).

A platform user ID may collide across bot identities, but do not assume every
provider defines conversation identity the same way. Test the actual transport
contract and namespace every structure consistently.

Legacy single-tenant keys may require a compatibility mapping or migration.
An absent/default stamp is not universally preferable to an explicit default
tenant ID. Distinguish deliberate legacy encoding from genuinely unknown ownership
and prevent the two from sharing a namespace.

## Checks

Deliver events for two connectors from the same platform user concurrently,
reconnect both, forge an event stamp, provide conflicting trusted stamps and
route to an unserved tenant. Test delimiter-containing IDs and legacy keys.
No path may merge lanes or access tenant state before identity is established.

When every event already arrives with trustworthy routing, an additional
configuration owner may be redundant. Keep the validation and collision tests.
