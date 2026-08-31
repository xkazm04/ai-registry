---
layer: technique
type: technique
subject: client-fetch-cache
technique: portable-read-definitions
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
use_when: [deciding where a shared read's key and fetcher should live, a prefetch warms an entry the reading surface never hits, the same question is declared at more than one call site, a read must also run from a route loader or a server render or an event handler, a shared read wrapper keeps growing a parameter per new option]
---

# Portable read definitions

A read is three things that must agree: the **key** that identifies it, the
**fetcher** that satisfies it, and the **default policies** it is believed
under. [cache-key-discipline](./cache-key-discipline.md) governs what goes
into the first. This technique governs a question that is asked earlier and
almost never out loud: **where does the triple live, and what shape is it?**

The default answer is invisible, which is why it survives. A read is written
where it is first consumed — inside the component-scoped primitive that
subscribes to it — because that is where the need appeared. Nothing about
that is obviously wrong, and it stays not-obviously-wrong until the second
consumer arrives.

## The consumer set is larger than the primitive's reach

A mature client reads the same question from more places than the subscribing
primitive can run:

- the surface that subscribes and re-renders;
- the surface that suspends on it instead;
- a combinator running several reads at once;
- an **imperative prefetch** fired from an intent gesture
  ([prefetch-and-defer](./prefetch-and-defer.md));
- a **route-level load** that must resolve before a view is entered;
- a **server-side render** that fetches and hands the client a warm cache;
- seeding, invalidating, and cancelling from an event handler.

Only the first three are inside the primitive's reach. The rest run in
contexts where a component-scoped primitive is not merely discouraged but
**cannot be called at all**. This is the whole problem, and it is structural
rather than stylistic: a definition bound to the primitive is *unreachable*
from over half the places that need it.

What happens next is forced. The prefetch site cannot import the definition,
so it re-types it: the key expression, the fetcher, a lifetime. So does the
loader. So does the server render. One question now has several
hand-maintained declarations, which is the exact shape
[one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)
names — the copies drift when someone extends one and finds only the one.

And they drift in a direction the reader cannot see. A re-declared key that
disagrees is [fragmentation](./cache-key-discipline.md): the prefetch warms
one entry and the surface reads another, so the prefetch does nothing and its
cost is pure waste. A re-declared key that *agrees* while the fetcher
disagrees is worse — two producers writing different shapes into one entry,
and whichever ran last is what the surface parses.

**This is how a well-intentioned prefetch becomes the side-channel that warms
nothing.** [prefetch-and-defer](./prefetch-and-defer.md) requires a prefetch
to be "a plain read through the normal path — same key builder, same cache."
That rule is correct and it is not enforceable by discipline, because the
normal path is behind a primitive the prefetch site cannot call. A rule whose
compliance requires re-typing the thing it says to share will be violated by
careful people.

## The definition is a plain value

**Bind the triple in a plain function that returns a plain object, and let
every consumer take it from there.** The function is not part of the
framework's reactive machinery and does not touch it; at runtime it is close
to the identity function, and it is meant to be. Its entire job is to be the
single authority for one question, callable from anywhere — a component, a
loader, an event handler, a server render, a test.

The payoff is that consumption becomes a choice made at the call site rather
than a property baked into the definition. The same value is subscribed to by
one consumer, suspended on by another, prefetched imperatively by a third,
and resolved during a route transition by a fourth. Switching a surface from
subscribing to suspending stops being a rewrite of its data layer and becomes
a different call around the same value.

## Only what is invariant across consumers goes in

This is the discriminating rule, and it maps cleanly onto the golden path's
four policies:

- **Key — invariant, by construction.** Consumers that need different keys
  are not consumers of one definition; they are two questions. This is the
  same boundary [plural-policy-claims](./plural-policy-claims.md) draws.
- **Fetcher — invariant.** Two fetchers behind one key is the poisoning
  defect above. If two consumers genuinely need different retrieval, the key
  is under-specified.
- **Believability — varies legitimately, and belongs at the call site.** A
  screen where background freshness barely matters may honestly want a longer
  stale window than a screen where it matters a lot. The definition carries a
  *default*; the consumer layers its own on top, and competing claims on the
  shared entry resolve by
  [plural-policy-claims](./plural-policy-claims.md)'s existential rule.
- **Admission and eviction — neither.** Those are properties of the cache,
  not of one question ([admission-hypothesis](./admission-hypothesis.md)).

So: **identity and retrieval are invariant and belong in the definition;
believability and presentation are per-consumer and belong at the call site.**

## Do not make the definition configurable

The pressure to accept an options bag arrives immediately — one screen wants
a different stale window, another wants failures to escalate — and it should
be refused. A definition that forwards options must grow a parameter for
every option its consumers might ever want, which means it is edited every
time the underlying read layer gains a capability it merely needs to pass
through. Composition at the call site absorbs all of them for free: spread
the definition, then write the per-consumer options beside it.

There is a second cost, and it is the one that turns a style preference into
a rule. Read layers that deliver type safety by **inferring** types at the
call site do so from the concrete arguments they are handed. A wrapper that
forwards a generic options bag must name that layer's type parameters in its
own signature, and any it does not name fall back to their declared
defaults — which are deliberately wide. The result is a wrapper that
compiles, forwards correctly at runtime, and silently widens the very types
the layer existed to infer. Pinning one parameter appears to fix it and does
not: options whose types are *derived* from the others (a projection, a
transform) still resolve against the defaults and fail. **The wrapper cannot
be made both general and correctly typed without re-declaring the entire
generic surface**, which is the cost the layer was adopted to avoid.

A definition that is a plain value has none of this. It names concrete types
because it is written against a concrete question, and inference at the call
site works because the call site is calling the read layer directly.

## Where this sits

Three techniques touch one question from different sides, and the order
matters. [cache-key-discipline](./cache-key-discipline.md) is upstream: it
decides what the key contains. This technique is next: it decides where the
key and its fetcher are *written*, and therefore whether one question has one
declaration or several. [plural-policy-claims](./plural-policy-claims.md) is
downstream: it resolves genuinely competing claims once several consumers
share an entry.

The relationship worth stating is between the last two. `plural-policy-claims`
reads divergent options on a key as *claims* — deliberate, from consumers with
different needs, resolved by a stated quantifier. That reading is right when
the definition is shared. When it is not, most divergence is not a claim at
all: it is drift between hand-maintained copies, and no resolution rule can
recover an intent that was never formed. Share the definition first, and what
remains for a quantifier to resolve is the divergence somebody meant.

## Checks

- One question has exactly one site that binds its key to its fetcher; a
  reviewer can find it without searching for the key's other spellings.
- The definition is callable outside the framework's reactive primitive, and
  at least one non-component consumer (prefetch, loader, or server render)
  actually calls it.
- A prefetch and the surface it warms resolve to the same key by
  construction, not by two call sites agreeing.
- The definition takes no pass-through options bag; per-consumer options are
  written at the call site.
- Divergent lifetimes on one key are traceable to a consumer that chose one,
  not to a copy that was edited alone.
