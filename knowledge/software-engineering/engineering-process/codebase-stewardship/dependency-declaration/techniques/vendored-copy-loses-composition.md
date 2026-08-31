---
layer: technique
type: technique
subject: dependency-declaration
technique: vendored-copy-loses-composition
status: forged
laws: [identity-survives-reuse, one-authority-per-vocabulary]
shared_with: []
use_when: [shipping a unit as a self-contained artifact so consumers need no setup, two bundled units carry private copies of the same shared thing, deciding whether to inline a dependency or declare it, a consumer reports the same code loaded twice]
---

# A vendored copy loses composition

There is one escape from every problem this subject describes: ship the unit as a
**self-contained artifact** with its requirements already folded in. The consumer
declares nothing, resolves nothing, and needs no mechanism at all. For a consumer
with no declaration mechanism — or a deliberately hard isolation boundary — this
is the right answer and sometimes the only one.

It is a purchase, though, and the thing being sold is easy to miss because it is
not visible in the consumer's own project. **Folding the requirements in does not
avoid composition; it performs it once, privately, at packaging time, and
destroys the information that would let anyone redo it.**

## What is actually lost: shared identity

Two self-contained units that both use the same third thing now carry two copies
of it. That is the obvious half. The half that matters is that **nothing
downstream can merge them**, ever, because the copies are no longer recognisable
as the same thing — the shared identity was erased when each artifact was built
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)). A
consumer's assembly step, however sophisticated, cannot deduplicate two artifacts
whose common ancestry is no longer expressed anywhere.

The cost has three shapes, and only the first is usually anticipated:

- **Size**, paid once per artifact per shared requirement. This is the one people
  price, and it is the least serious.
- **Duplicated state.** When the shared thing holds state — a registry, a cache, a
  connection pool, a counter, anything with module-level identity — two copies are
  two independent states. Registrations made against one are invisible to the
  other. Systems that assume a single instance fail in ways that look like
  logic bugs rather than like packaging bugs, and they fail intermittently
  depending on which copy a call path reached
  ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
- **Divergent versions of one contract.** Two copies at different versions, both
  live, exchanging values that satisfy neither's expectations completely. The
  failure surfaces far from the packaging decision that caused it.

The second is the one that turns a size question into a correctness question, and
it is the reason "it is only a few extra kilobytes" is not a sufficient analysis.

## Why authors do it anyway, and why that reason is real

The reason is not laziness and should not be treated as such. A unit's author
faces consumers with incompatible mechanisms — some with a full pipeline, some
with none — and **declaring requirements normally penalises the consumers who have
no mechanism**, while shipping self-contained penalises the ones who do. There is
frequently no single artifact that serves both well, so the author picks the
audience they can least afford to lose, which is usually the one with no setup.

That is a mechanism failure being paid for by a packaging decision. It is worth
recording that way — as evidence about the ecosystem's declaration cost floor
(see [declaration-cost-floor](./declaration-cost-floor.md)) rather than as a
criticism of the author. **Widespread self-contained shipping is a symptom, and
what it measures is that declaring requirements normally does not reliably work.**

## When the trade pays

Self-contained shipping is right when at least one holds:

- **The consumer has no mechanism at all**, and the alternative is not being
  usable. This is the honest common case.
- **Isolation is the point.** A sandbox, a plugin that must not share state with
  its host, a component that must be immune to whatever else is present. Here the
  duplicated state is the feature, and the technique is being used deliberately
  rather than as an escape.
- **The requirement is small, stateless and stable** — a pure helper with no
  identity worth preserving. Duplicating it costs bytes and nothing else, which is
  the case where the size-only analysis is actually correct.

It is wrong as a **default** for a unit whose consumers do have a mechanism, and
wrong in particular for anything stateful, anything large, and anything likely to
be depended on by several units in one tree — which is to say, exactly the popular
shared things where the duplication compounds fastest.

## The better shape where it is available

Where the audience genuinely splits, the resolution is not to pick one artifact
but to stop conflating two decisions that are separable: **publish declared
requirements as the primary form, and a self-contained artifact as a clearly
labelled convenience.** The label is the load-bearing part — it says which
requirements were folded in and at what versions, so a consumer who *does* have a
mechanism can see what they would be duplicating and choose the other artifact
instead.

An unlabelled self-contained artifact is the genuinely bad case, and it is common:
the consumer cannot tell what is inside it, cannot predict what it will duplicate,
and discovers the answer only when two copies of something stateful start
disagreeing. Publishing the fold list costs nothing at build time and converts an
invisible hazard into a decision somebody can make.
