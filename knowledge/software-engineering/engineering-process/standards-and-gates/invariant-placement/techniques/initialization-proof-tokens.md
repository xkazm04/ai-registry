---
layer: technique
type: technique
subject: invariant-placement
technique: initialization-proof-tokens
status: forged
laws: [absent-guard-is-loud, unknown-is-not-a-value]
shared_with: []
use_when: [a subsystem must be brought up before anything may use it, deciding between a proof value and a null check for a dependency, a degraded path nobody remembers to write, a readiness fact that can lapse while the program runs]
---

# Initialization proof tokens

A subsystem is brought up: a device is enumerated, a schema is migrated, a
credential is exchanged, a source of data is confirmed present. Everything
downstream depends on that having happened, and the usual encoding of the
dependency is a convention — call the initializer first — backed at best by a
flag somebody remembers to consult.

The placement move: **make successful initialization a value that only the
initializer can produce, and make every operation that depends on it require
that value.** The initializer returns the proof; consumers accept it. A caller
who never initialized cannot construct the argument, so the call cannot be
written. The value carries no data and costs nothing at run time; its entire
job is to be unobtainable by any other route.

What this buys, precisely: **the degraded path stops being a branch someone
remembers and becomes a branch the checker forces.** A caller holding no proof
has to do something visible — refuse, degrade, or ask — and that decision
appears in the source rather than in the set of things nobody thought about. It
is the structural answer to
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud): the guard
does not need to be switched on, because its absence is not expressible.

## The shape

- **Minting is exclusive.** One construction path, inside the initializer, not
  reachable from outside the module. A proof anyone can conjure proves nothing,
  and the failure is quiet — the encoding still reads as a guarantee.
- **The proof is per capability, not per system.** A bring-up that confirms
  four independent sources produces four proofs, and each operation requires
  the one it actually needs. A single "everything is ready" value forces the
  whole system into an all-or-nothing readiness that no real deployment has,
  and it is the version people abandon after the first partial outage.
- **Failure to initialize returns no proof, and says why.** The absence of the
  proof is the honest state; the reason travels beside it as a typed value, not
  as prose, because a caller that must choose a degraded path needs to know
  whether the source is missing, misconfigured, or merely not yet up. Folding
  those into one absence renders three different situations as one
  ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)), and
  the classification is exactly what
  [error handling](../../../../backend-platform/resilience/error-handling/error-handling.md)
  says must survive the boundary.
- **The proof does not travel further than the fact.** Storing it in a
  long-lived registry so that any code can retrieve it converts a
  proof-of-having-initialized into a global flag with extra ceremony, and
  reintroduces every problem it was placed to remove.

## Why this lands here and not with optional dependencies

The nearest neighbour is the
[guarded singleton accessor](../../../../backend-platform/resilience/optional-dependency-degradation/techniques/guarded-singleton-accessor.md),
and the two are frequently confused because both concern "is this thing
usable." They answer different questions and the boundary is worth stating,
because putting this technique there would be a real mistake.

That technique owns **configuration presence for an optional dependency**: the
thing may legitimately be absent in this deployment, the question is asked
lazily at the moment of first use, and its answer is a client or a typed
refusal. Its whole subject matter is degradation — what the product does when a
feature's backing service was never configured.

This technique owns **placement of a readiness fact that is not optional**. The
device must be enumerated; the migration must have run; the handshake must have
completed. There is no degraded product on the other side of "no" — there is a
system that must not proceed. And the mechanism is not an accessor at all: it
is an argument in every dependent signature, which reaches call sites that no
accessor is involved in. A team can hold this placement while having no optional
dependencies whatsoever.

The two compose, and the composition is the useful case: the accessor's
successful construction is exactly the event that mints a proof, and the
proof then carries the fact into signatures the accessor never sees. What must
not happen is either subject restating the other — the accessor's rules about
memoising success, catching the specific condition and never returning a
silent stub are that technique's, and are not repeated here.

## When not to use it

**When the source can fail after initialization.** This is the inversion, and
it is the one the enthusiastic literature never states. A proof token asserts
*this was true at the moment it was minted*. If the underlying fact can lapse —
a connection drops, a device is hot-unplugged, a lease expires, a peer
restarts — the token goes on being a perfectly valid value asserting a fact
that stopped being true, and every downstream signature goes on treating it as
proof. That is **worse than a null check**, and the reason is not that it fails;
it is that it fails while looking like proof, so the runtime check that would
have caught it was deleted on its authority and the review that would have
noticed reads a guarantee.

The rule: **the token may carry only facts with the lifetime of the token.**
Concretely, before placing one, answer *can this stop being true while the
program runs?* If yes, the placement is not available; keep the check at the
point of use and let the token carry, at most, the weaker and still useful fact
that initialization was *attempted and succeeded once* — labelled as that, not
as availability. A liveness fact has a clock, and facts with clocks do not rise.

**When the initializer is the only caller.** A proof threaded through one call
is ceremony; assert the precondition.

## Decision rules

- Mint the proof in one place the rest of the program cannot reach.
- One proof per independently-failing capability; never one for the system.
- Absence of the proof carries a typed reason, not a bare nothing.
- Ask *can this fact lapse?* before placing the token. If it can, do not place
  it — a token asserting an expired fact is worse than the check it replaced.
- Never store the proof somewhere any code can fetch it; that is a global flag
  wearing a costume.
- Where the dependency is genuinely optional and the product degrades, the
  accessor discipline governs and this placement is the wrong instrument.
