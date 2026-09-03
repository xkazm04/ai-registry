---
layer: technique
type: technique
subject: multi-provider-gateway-plane
technique: caller-scoped-normalization-strictness
status: forged
laws: [failure-not-empty-success, unknown-is-not-a-value, absent-guard-is-loud]
shared_with: []
use_when: [a stock client library throws on a termination reason your gateway passed through, an application chose this gateway for a capability normalization erases, deciding whether strict compatibility is the default or the opt-in, a normalized response quietly reported a truncated answer as complete]
---

# Caller-scoped normalization strictness

A plane that publishes one request and response shape over several upstreams
must decide what happens to everything the published shape has no word for: a
termination reason outside the published enumeration, a structured block the
contract does not describe, a field one upstream sends and the others do not.
There are two answers, both correct, for two different callers — and the plane
cannot tell which caller it has. The technique is making the choice **the
caller's, per request**, and making the two modes differ by addition rather than
by meaning.

## Two populations, opposite requirements

The first population uses a stock client library built against the published
contract. It parses into fixed types and branches on closed enumerations, so a
value outside them is not "extra information" — it is a crash or, worse, a
mis-branch. For that caller, **lossy is correct**: the unmappable value must be
collapsed into something the enumeration contains before it ever reaches them.

The second population came to this plane *because* of what one upstream can do
that the published contract cannot express — its structured reasoning blocks, its
citations, its native tool semantics, its own termination vocabulary. For that
caller, the collapse deletes the reason they are here. They chose a gateway over
a direct integration for the routing, the policy and the credential handling, and
being charged the loss of the capability as the price is what sends them back to
the direct integration.

No single schema serves both. A deployment-level switch does not help: one
installation commonly serves both populations, and forcing the choice at deploy
time means one of them is served wrongly by configuration. So the switch is a
**request-scoped policy key**, inherited down the routing structure like any
other — which means an operator can also set it for a branch of traffic, and a
caller can still override it for one call.

## Additive, never divergent

The rule that keeps two modes from becoming two schemas: **the strict response is
a subset of the un-strict one.** Native material rides alongside the normalized
fields under its own keys; it never replaces them and never changes the meaning
of a shared key.

That constraint is what makes everything downstream survivable. A caller that
ignores the extra keys sees exactly the strict response, so upgrading a client is
not a migration. Telemetry, pricing and cache logic read the shared keys and get
one answer regardless of the switch. And a test suite can assert the subset
relation directly, which is the cheapest possible guard against the two modes
drifting into two contracts maintained by two authors.

The forbidden shape is the mirror of it: making a shared key mean one thing under
strict and another under un-strict — a termination field that is a normalized
enumeration in one mode and a passthrough string in the other, say. Every
consumer of that key now needs the switch's value to interpret it, and most will
not have it. If a field cannot be normalized in a way that is *always* true, it
needs two keys, not one key with two personalities.

## What a collapse may do, and what it may never do

The switch may cause a **loss**. It may never cause a **lie**, and the boundary
between them is sharper than it looks:

- **Allowed: collapse an unmappable enumeration member to the nearest published
  member with the same operational meaning.** A member that means "the model
  stopped on its own" and one that means "the model stopped on its own after
  emitting a native block" are the same instruction to a caller who cannot see
  the block.
- **Allowed: drop a structured block the published contract has no place for**,
  provided the block was decorative — content the caller cannot act on and did
  not ask for.
- **Forbidden: collapsing an abnormal termination into a normal one.** A response
  cut off at an output limit, refused by the upstream, or ended by a filter is
  not a completed answer, and reporting it as one is failure spelled as empty
  success ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success))
  with the normalizer doing the spelling. Every published contract has *some*
  member for an abnormal end; map into it, and where it genuinely has none, the
  honest answer is an error rather than a clean stop.
- **Forbidden: substituting a value for an absent one.** A counter the upstream
  did not send is absent, not zero
  ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). Strict
  mode's job is to fit the published shape, not to fill it.
- **Forbidden: silently deleting something the request asked for.** When a
  caller explicitly requested a capability whose result strict mode will erase,
  the conflict exists at request time and should be answered there — refuse, or
  warn, or serve un-strict for that call by policy. Discovering it as an empty
  field is the worst of the three, because the caller's evidence that the feature
  is broken is indistinguishable from the model declining to use it.

Whatever the switch does to the caller's copy, the **raw upstream value survives
to telemetry** — the native termination reason, the upstream's own identifier for
what it served, the block it sent. A caller's display preference is not a reason
for the operator to lose the only evidence that the mapping table is still
correct.

## The default is the real decision

Most traffic never sets the switch, so the default is what the fleet actually
runs, and it is chosen once by whoever writes it and inherited by everyone
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)). Both
defaults are defensible and they fail in opposite directions: defaulting to
strict means the capability-seeking caller silently gets a degraded answer until
someone reads the documentation; defaulting to un-strict means the stock-library
caller gets a value its parser refuses, loudly, on the first call.

Prefer the failure that is loud. A caller that crashes on an unexpected member
files a report on day one and sets the switch; a caller whose citations quietly
vanished discovers it in a customer's complaint. Where the caller population is
predominantly stock libraries and cannot be reached, the opposite default is
right — but then the un-strict mode must be documented at the same level of
prominence as the endpoint itself, and the plane should count how often it is
used, because a switch nobody sets is a feature nobody has.

## Streaming carries the same switch

Everything above applies chunk by chunk, and the switch also decides whether the
plane injects its own extra channels into a stream — check results, annotations,
native block deltas. The constraint is the additive one again, applied to a
sequence: a strict stream must be the un-strict stream minus the extra frames,
so a reader that ignores unknown frame types sees the strict stream by
construction. The framing mechanics themselves are
[per-provider-stream-framing](./per-provider-stream-framing.md).

## Where this stops

This is normalization **for proxying**, where the normalized payload is the
product being delivered. It is deliberately the opposite stance from
normalization for *accounting*, which lives in another domain of this corpus and
therefore carries no link from here: there, one canonical internal event model is
the design centre and a caller-selectable schema would produce two sets of books.
The discriminator is which side of the wire the payload is on. A record must be
canonical; a product must serve the person who asked for it.

## When not to use it

- **When there is one consumer population.** A plane whose callers are all first
  party, all on one client, needs one schema and a decision — not a switch that
  doubles the response surface forever.
- **When the published contract is your own.** The lowest-common-denominator
  problem comes from mimicking somebody else's shape. A contract you author can
  simply include the union, versioned, and the strictness question dissolves.
- **When the loss cannot be made additive.** If the extra material has nowhere to
  ride — a wire format with no room for unknown keys, a binary envelope with a
  fixed schema — a per-request switch produces two genuinely different responses
  under one contract. Version the contract instead, and let callers choose a
  version rather than a mode.
