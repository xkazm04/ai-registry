---
layer: technique
type: technique
subject: mcp-tools
technique: catalog-projection-modes
status: forged
laws: [limits-are-derived, gate-sees-target, one-authority-per-vocabulary]
shared_with: []
use_when: [a host refuses the request because too many tools are listed, one server's catalog crowds out every other installed server, deciding whether to fold operations behind a routing tool]
---

# Catalog projection modes

[tool-schema-design](./tool-schema-design.md) says one tool, one operation, and
it is right — in a world where the only cost of another tool is a little more
prompt space and a little more selection ambiguity. That is a *quality*
argument, and quality arguments lose to hard limits. This technique is the
case the rule was written without: **the catalog budget is not yours.** One
widely deployed editor host rejects any request that carries more than 128
tool definitions, counted across every installed server *combined*. A
publisher exposing a hundred-odd capabilities is therefore not merely
noisy — it is unusable the moment its user installs a second popular server,
and there is nothing the publisher can do host-side. Progressive discovery,
which [client-integration](./client-integration.md) correctly assigns to the
host, is unavailable to a publisher whose hosts do not perform it.

So the publisher's own catalog size becomes a derived limit
([limits-are-derived](../../../../_laws.md#limits-are-derived)): the number of
tools this server may publish is the smallest host ceiling it must run under,
minus a share reserved for the other servers a realistic user has installed.
Write that derivation down beside the number, because the day the ceiling
moves, everything downstream of it should move with an argument rather than
with a feeling.

## One tree, several projections

The response is not a smaller catalog. It is **the same command tree published
at several resolutions**, with the resolution chosen by an operator flag at
startup — never per request, because a catalog whose shape varies by caller
cannot be cached, reasoned about, or reproduced in an incident. Four
projections cover the observed range:

- **one tool per operation** — the uncompressed truth, correct when the budget
  allows it;
- **one tool per service family** — the workable default: each family
  publishes one routing tool that dispatches to its own operations;
- **curated cross-cutting groups** — hand-picked workflow bundles that cross
  family lines, for the task-shaped surface a family split cannot express;
- **one tool for the entire server** — maximum compression, for a host with
  almost nothing left to spend.

The load-bearing property is that **nothing downstream of the projection knows
which one is running.** Handlers, schemas, authorization paths and audit lines
are identical across all four; the projection is a view over the one registry
that [server-composition](./server-composition.md) makes the single authority
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
A projection that forked the handler set would have produced four servers
sharing a name, each with its own bugs.

Treat catalog size as a shipped quality property, not an aesthetic one. The
strongest available evidence is that one such tree spent a **documented
breaking change** to reverse its default from roughly 128 individually listed
tools to 25 — a publisher accepting the full cost of breaking its consumers
purely to shrink its own listing does not think of this as tidying.

**A mode is a composition, not a single projection.** The four are named as
alternatives and are not mutually exclusive at runtime: the audited tree's
per-family mode publishes compressed family routers *and* a set of utility
operations at full resolution in the same process, and its curated mode is the
family projection running over a fabricated grouping tree. So the operator's
choice selects a *mix*, and the two consequences are worth planning for — the
published count is the sum of several projections rather than one, so a budget
computed from the compressed set alone will undershoot; and an operation may be
reachable at two altitudes at once, which is fine for dispatch and a real hazard
for any per-operation policy that assumes a single published path to it.

## Compression may not lie about blast radius

When N operations are folded behind one published tool, that tool publishes
**one** set of behavior annotations for all N. Fold a destructive operation in
under a read-only parent and the host's consent tier is now a false statement
about what the call can do — and the host has no way to discover this, because
the annotation is all it ever sees.

The rule: **a projection may merge two operations only when it can publish one
honest annotation set for both.** In practice that means equality on every
axis — read-only, destructive, idempotent, open-world — and a mismatch is
refused **at startup**, where the operator can fix it, not silently resolved at
listing time. This is
[gate-sees-target](../../../../_laws.md#gate-sees-target) at the consent layer:
the annotation the host sorts on must be true of the path actually reached, and
under compression the path reached is not the path named.

The tempting shortcut — worst-case the union, marking any merged tool
destructive if any member is — was tried and is wrong. It makes nearly every
merged tool destructive-and-non-idempotent, which collapses the tier system
into a single tier and destroys the very distinction compression was supposed
to preserve. A host that must confirm everything confirms nothing. Refusing
the merge preserves information; averaging it away does not.

## Policy is re-checked at the resolved operation

This is the sharpest consequence and the one most often missed. Under an
uncompressed catalog, filtering the listing *is* the gate: a tool the model
cannot see is a tool it cannot name. Under compression the listing no longer
names what is invoked — the operation arrives as an **argument** — so a gate
that filters only the listing gates nothing at all. The router will happily
accept an operation string for a capability the projection deliberately
withheld.

Therefore every policy that shapes the catalog is evaluated **twice**:

1. **at projection time**, deciding what appears in the listing — read-only
   mode, host-capability restrictions, per-caller entitlements;
2. **at dispatch**, against the *resolved* operation, before the handler runs,
   with the same policy and the same answer.

Consent prompts belong on the second evaluation too: the human must be shown
the operation actually about to run, not the routing tool's generic name. A
consent dialog naming the router is a dialog about a different program.

## The compressed catalog must stay self-teaching

Compression takes away the model's map. It can no longer read the operation
name in the listing, so it cannot compose a correct first call from the
listing alone. A routing tool that demands a valid operation name up front is
therefore a tool nobody can call correctly the first time.

So the routing schema requires exactly **one** field: free-prose intent. The
operation name is *optional*, and a call that names no operation does not
error — it returns that tool's sub-catalog, and the model calls again with
what it just learned. An ignorant first call is valid **by construction**, and
the server spends a round trip teaching instead of a turn failing.

This deliberately inverts [tool-schema-design](./tool-schema-design.md)'s
"constrain in the schema, not the prose", and the inversion is scoped to this
one field for a stated reason: an enum constrains a caller *that has seen the
catalog*. Compression is precisely the condition under which the caller has
not. Constrain everything the caller could have known; leave the door open on
the thing you took away from it. Everywhere else in a compressed server —
including inside the sub-catalog once returned — the original rule stands.

## The second authority, and its price

The curated-workflow projection is a hand-maintained mapping from group names
to operations. That is a parallel list, and
[server-composition](./server-composition.md) names parallel lists as the
anti-pattern that produces "the tool works but isn't listed". It is adopted
anyway, because the registry projection cannot satisfy an externally imposed
catalog size — the constraint is real and the law does not repeal it.

A second authority adopted knowingly must be **paid for**, with bidirectional
completeness assertions that run wherever the artifact runs:

- every mapped operation name resolves to a real operation in the registry;
- every operation in the registry is claimed by exactly one group;
- no group resolves to an empty set.

Observed underpayment, told as the cautionary half: those assertions existed,
but ran only in developer builds; in the shipped artifact they degraded to a
log line; they were additionally skipped under two commonly set flags; and a
group that lost *every one* of its operations was skipped silently in all
configurations. The net effect is a curated catalog that can quietly lose a
whole workflow in production and report nothing — the failure mode being a
capability that simply is not there, which reads to the user as the model
being unable to do something it could do last week. If the assertions do not
run in the artifact users install, the second authority is unpaid for and
will rot.

## When not to do any of this

**When the budget is yours, do not compress.** If the catalog fits — because
the host performs progressive discovery, because the deployment is a single
first-party server, because the surface is genuinely small — then
one-tool-one-operation is correct and every mechanism above is a pure tax:
an extra round trip on first use, a second policy evaluation to keep in sync,
an annotation-equality constraint on how operations may be grouped, and in the
curated mode a parallel list to maintain. The discriminator is exactly one
question: **is the ceiling imposed by someone you do not control?** If yes,
project. If no, the sprawl argument in the golden path is the only argument
you need, and it is satisfied by having fewer capabilities rather than by
hiding them.
