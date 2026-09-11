---
layer: technique
type: technique
subject: dependency-declaration
technique: logical-name-or-address
status: forged
laws: [one-authority-per-vocabulary, unknown-is-not-a-value]
shared_with: []
use_when: [choosing between a logical name and a direct path for a reference, two consumers need different versions of the same dependency, a reference must be redirectable in one place, deciding whether a mechanism needs a resolution layer at all]
---

# Logical name, or address

Every reference is written one of two ways. As an **address** — a path, a URL, a
fully-qualified location that needs no interpretation. Or as a **logical name** —
a token that means nothing until something resolves it.

The choice determines whether a resolution layer must exist at all, which makes
it the most consequential decision in the mechanism and one of the most casually
made. It is usually justified by one of two reasons that are both wrong.

## Two false explanations, worth killing first

**"Names are more ergonomic."** They are not, meaningfully. The difference
between a bare token and a short relative address is a few characters and a
convention; no author has ever been blocked by it. Ergonomics is a real
consideration in the mechanism's *cost* — see
[declaration-cost-floor](./declaration-cost-floor.md) — but it does not
discriminate between these two forms, and a mechanism justified on this ground has
been justified on nothing.

**"Names are stable, addresses change."** Also false, and more dangerous because
it sounds like an engineering argument. An address within a system the author
controls is exactly as stable as a name — stability is a property of what the
reference points into and who is allowed to move it, not of the notation. The
belief comes from experience with *remote* addresses, where the instability is
real and is caused by third-party control, which is a different property
altogether and the actual one.

Both explanations survive because they gesture at something true. Following them
leads to the wrong generalisations, though: the first suggests the choice is
cosmetic and can be made per call site, the second suggests every reference should
be a name.

## The real discriminator is purview

> An address means the same thing everywhere. A logical name resolves differently
> depending on who is asking, and **the composing application controls what it
> resolves to.**

That is the whole distinction. It is not about notation, it is about **who holds
authority over the binding** — the referrer, or the composer.

Everything that follows is a consequence:

- **Substitution.** A name can be redirected — one implementation swapped for
  another, a whole class of reference pointed elsewhere — from one place, without
  touching any referrer. An address cannot; substituting it means editing every
  site that wrote it.
- **Simultaneous divergent bindings.** Two consumers can resolve the same name to
  different things, which is what makes independent versioning possible within one
  process. Addresses cannot express this at all: the same address is the same
  thing, by definition.
- **Position independence.** A name is written the same way from anywhere, so
  moving the referrer does not rewrite its references. A relative address encodes
  the referrer's own position, which is why relocation churn is a reliable symptom
  of address-based referencing.
- **And the cost, which is the same property inverted:** a name is not
  self-sufficient. It requires the resolution layer to exist, to be correct, and to
  be present wherever the reference is used — including contexts nobody thought
  about when the layer was designed. An address needs nothing.

## Choosing

The question to ask is not "which is nicer" but **who should be allowed to decide
what this resolves to.**

Use a **logical name** when the composing application must retain the right to
substitute: third-party units it must be able to redirect, implementations it may
need to swap per environment, a dependency two consumers may legitimately need at
different versions.

Use an **address** when substitution is a hazard rather than a feature, and the
reference should mean exactly one thing: a unit's reference to its own internal
parts, an asset that belongs to the component beside it, anything where a
redirection would be an attack or an accident rather than a feature. An address
here is not a lesser choice, it is a *constraint being expressed* — this reference
is not yours to rebind.

The failure that motivates the whole distinction is one direction of getting it
wrong: **an address into somebody else's internals.** It resolves, so it works,
and it silently converts that unit's private layout into a contract it never
agreed to. The unit reorganises, the reference breaks, and no rule was broken by
the party who broke it. Where a unit exposes named entry points, referring past
them to a path inside is the mechanism's most common misuse and the cheapest to
detect: the reference contains internal structure the publisher never published.

## When the address encodes a version, the constraint lands on strangers

The choice above is written from the referrer's chair: *I* write an address, so
*I* accept that this reference is not mine to rebind. There is a case where a
publisher makes that choice on everyone else's behalf, and the technique's
reasoning has to be followed one step further to see it.

A publisher can encode a **contract version in the address itself** — a
versioned entry point, a dated submodule path, a reference whose spelling names
which revision of the interface the caller is asking for. The motive is sound
and is exactly the one above: the binding should not be redirectable, because a
silent substitution would change a contract the caller believes is fixed. Making
it an address expresses that constraint in the strongest available form.

The step that is easy to miss: **an address is written at every call site, and
not all of those call sites are yours.** A consumer that reaches the publisher
through a wrapper — an adapter, a framework integration, a convenience package —
does not write the inner reference. The wrapper does. So the constraint the
publisher intended for its direct callers propagates to a transitive consumer
who cannot satisfy it: pinning its own direct reference leaves the wrapper's
reference on whatever the wrapper chose, and the two resolve to different
revisions of the same interface inside one process. The symptom is not an error.
It is a program holding two bindings of one contract, each internally consistent,
reached by two paths through the dependency graph.

Note what has happened to purview. An address was chosen to concentrate
authority over the binding in the publisher, and it did — but authority over
*which address gets written* stayed distributed across every intermediary, and
those two are not the same thing. Encoding a version in the address transfers
the binding decision to whoever writes the reference, which for a transitive
consumer is a third party.

- **Publishing a versioned address obliges you to publish a second way to say
  it** — a runtime parameter, a header, a configuration value carrying the same
  selector — for callers who cannot write the reference. Without one, the only
  consumers who can pin are your direct ones.
- **Wrapping a publisher who versions by address makes you responsible for
  exposing that selector**, because you have just taken the decision away from
  your own consumers by standing between them and it.
- **Depending on such a publisher through a wrapper, audit the resolved graph
  rather than your own declaration.** Your manifest states what you asked for;
  only the resolved tree states how many revisions of that contract are actually
  present, and duplicates here are a contract split rather than a disk-space
  problem.

The general form is worth keeping separate from the versioning case that
exposes it: a constraint expressed by notation binds whoever writes the
notation. Where the writer and the party the constraint is meant to protect are
different, the notation is not carrying the constraint — it is only relocating
it.

## The hybrid: a name as a kind of address

The two forms are usually built as separate primitives with separate machinery,
and there is a third design worth naming because it dissolves the gap: **define
the logical name as a species of address** — same reference type, with a scheme
that marks it as requiring resolution and with resolution parameterised by who is
asking.

The payoff is structural. Once a name is an address, every part of the system that
already accepts addresses accepts names for free — asset references, stylesheet
references, configuration values, anything that takes a location. Where names and
addresses are separate primitives, each of those places needs teaching about names
individually, which is why systems built the separate way tend to support logical
names in exactly one context (the one the mechanism was built for) and nowhere
else. That single-context limitation is the same debt
[shortcut-is-not-the-substrate](./shortcut-is-not-the-substrate.md) describes,
arriving through the naming layer.

Two obligations come with the hybrid and are easy to miss. Resolution now depends
on *who is asking*, so a request that cannot say who it is has no answer, and the
honest response is to **refuse rather than to fall back to a global default**
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)) — a
default binding for an unidentified caller is how two consumers silently receive
the wrong one. And caching must key on the resolution, not on the name, or the
first asker's binding is served to everyone
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
