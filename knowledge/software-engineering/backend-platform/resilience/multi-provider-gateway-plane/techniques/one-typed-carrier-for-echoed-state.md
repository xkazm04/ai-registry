---
layer: technique
type: technique
subject: multi-provider-gateway-plane
technique: one-typed-carrier-for-echoed-state
status: forged
laws: [identity-survives-reuse, unknown-is-not-a-value, one-authority-per-vocabulary]
shared_with: []
use_when: [an upstream returns an opaque token the next request must carry back and the plane keeps no history, a field the plane adds to a response never comes back from the client, a client echoed a field the plane added and the next upstream rejected the request, deciding where to put state a typed client SDK will pass through untouched, a value smuggled into an identifier stopped fitting the identifier]
---

# One typed carrier for echoed state

A plane that fronts several upstreams routinely acquires state it must hand back
to an upstream on a later request and cannot hold itself: a signature over a
reasoning segment, an encrypted continuation payload, a per-part token proving a
segment was produced by that endpoint. The composing side of this problem — what
such state means, when it must be stripped, and what a strip may remove — is a
different subject's ground and is not restated here.

What belongs here is the constraint a **proxy** has and a composer does not:

> The plane keeps no transcript. The client's next request *is* the record.

A composer that owns a conversation stores the state at full fidelity and
withholds it per call. A plane in the middle stores nothing. Whatever it needs
back must be written into the response it hands the client, survive the client's
parsing, storage and re-serialization, and arrive intact on the next request.
That round trip is the whole design problem, and it has one non-obvious answer
and one non-obvious prohibition.

## The carrier must be a field the client is obliged to preserve

The instinct is to attach the state as a new field on the block it belongs to.
That fails, quietly, against the majority of clients: a typed client SDK parses
into fixed structures and **drops what its schema does not name**. The field is
written, the client's own model has no slot for it, and the next request arrives
without it. Nothing errors. The capability simply never works, and it fails most
reliably for the best-behaved clients.

So the carrier is chosen by a property that has nothing to do with the state's
meaning: **which field of this block will a stock client SDK certainly round-trip
untouched?** In practice that is a required, typed, opaque-by-contract scalar —
most often the block's own identifier, which every client must echo because the
protocol's own correlation depends on it
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)). State
encoded into it under an unambiguous prefix rides back for free, on the one
field no client is free to discard.

Two consequences follow immediately and are usually discovered late:

- **The carrier's constraints become the state's constraints.** An identifier
  with a length limit at some target format now bounds the encoded payload, and
  the plane must clamp on the way out. A carrier is a borrowed field, and the
  loan comes with the lender's rules.
- **Not every block has one.** Blocks that carry no identifier — plain text
  parts, typically — have no typed field to borrow, so the raw extra field is
  their *only* available carrier and must be used despite the drop rate. That
  asymmetry is real and should be written down rather than smoothed over: one
  block kind carries state reliably, another carries it best-effort, and the
  difference is a property of the protocol rather than a choice.

## Exactly one carrier, and this is where the intuition inverts

Having found that the raw field is unreliable and the identifier is reliable, the
tempting move is to emit **both** — belt and suspenders, the reliable carrier
plus the obvious one, on the theory that a redundant copy can only help.

It cannot. A second carrier is not redundancy; it is a **second rejection
surface**, and it fires on a path the plane never tests:

1. The plane emits the state twice: once in the identifier, once as a raw
   off-spec field.
2. Most clients drop the raw field, as established. But some faithfully echo
   *everything* they received back into the next request.
3. That request routes to an upstream — often a different one, since routing is
   the plane's whole purpose — whose schema **rejects unknown fields**.
4. The turn fails with a validation error naming a field the client never
   invented and the operator never configured.

The redundant carrier converts a reliability improvement into an outage that
occurs only for well-behaved clients, only after a re-route, and only on the
second turn. Emit one carrier.

### The discriminator: redundancy is safe subtractively and unsafe additively

The rule above sits next to an apparently opposite one, and planes that hold both
should hold them deliberately. **Stripping** a field defensively at two layers is
correct and cheap: the operation is idempotent, the second strip is a no-op when
the first worked, and the field set being stripped drifts as upstreams add
features — so belt-and-suspenders is exactly right there. **Carrying** a value
redundantly is the mirror image: the operation is not idempotent from the
client's side, because each additional copy is an independent thing that may be
echoed into an upstream that refuses it.

The one-line test: *if the extra copy comes back, what happens?* A duplicate
removal is nothing. A duplicate addition is a request nobody authored
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary):
the state has one authoritative spelling, and a second spelling is a second
authority).

## Strip on the way to an upstream that did not mint it

State minted by one upstream is meaningless or actively rejected at another, so
the plane strips the carrier when the target is not the minter. Two rules make
the strip correct rather than approximately correct:

- **Strip unconditionally where the state is not the target's**, rather than
  conditioning on a "did we switch?" signal. The switch guard looks equivalent
  and is not, because the plane's record of *who served last* can be destroyed by
  ordinary client behaviour — a client-side compaction that rewrites the opening
  of the conversation re-keys whatever session identity the plane derived, and
  the previous-served-endpoint fact is gone. Worse, that loss is **correlated
  with the event the guard exists for**: compaction and re-routing are both
  triggered by a long conversation, so the guard is most likely to be absent on
  exactly the turn it was supposed to fire. An absent provenance is not evidence
  of a match
  ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
- **Strip the raw field from every block when targeting an upstream that
  validates unknown keys**, including blocks whose identifier still carries the
  state. That is lossless where the identifier is the real carrier and is the
  only safe option where it is not.

## Decision rules

Pick the carrier by asking which field the client's tooling must return, not
which field the state belongs to semantically. Encode under a prefix that cannot
collide with a legitimate value. Clamp to the carrier's own limits at every emit
path, not at the mint site. Emit exactly one carrier per block, and where a block
kind has no typed field, say in the design note that its state is best-effort.
Strip on provenance, never on a switch flag, and treat unrecorded provenance as
a strip.

## When not to use it

- **When the plane can hold the state.** A plane that already persists
  conversations has a record and should use it; borrowing a client field to
  store what you could store yourself buys a round-trip failure mode for nothing.
- **When the contract has a sanctioned extension point.** A protocol with a
  declared "opaque, echo this back" field needs none of this — put the state
  there and stop. This technique is for protocols that have no such field, which
  is why the identifier ends up carrying it.
- **When the state is not required for correctness.** If losing it degrades the
  next turn rather than failing it, the raw field alone is a reasonable choice
  and the complexity is not earned.
