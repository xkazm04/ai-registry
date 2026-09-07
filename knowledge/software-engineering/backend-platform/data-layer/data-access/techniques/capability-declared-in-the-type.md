---
layer: technique
type: technique
subject: data-access
technique: capability-declared-in-the-type
status: forged
laws: [one-authority-per-vocabulary, absent-guard-is-loud, verdict-survives-boundary]
shared_with: []
use_when: [more implementations sit behind one store interface than a reader can hold in their head, deciding whether a missing operation is a construction error or a runtime refusal, an optional store operation fails with an attribute lookup deep inside a query, a contributed backend claims a capability it does not have]
---

# Capability declared in the type

One interface, many implementations, and not all of them can do everything
the interface names. The question is not *whether* to allow partial
implementations — a store family of any size will have them — but **where the
gap is declared and when it is enforced**. Two mechanisms are available, they
are not interchangeable, and picking one for everything is the mistake.

The governing rule: **a capability gap fails at the earliest moment it can be
known, and that moment differs per capability.** Some gaps are knowable when
the implementation is written and must not survive into a running system.
Others are only knowable when a caller asks, because absence there is legal
and has a degraded path — forcing those into a construction error forbids
partial implementations worth having.

## The ladder: three tiers, chosen by knowability

**Tier 1 — required member.** The operation is one the interface cannot
function without: open, read by key, persist. Declare it as a required member
so an implementation that omits it **cannot be constructed at all**. The gap
surfaces at first construction, names the implementation, and never reaches a
request. Instantiability *is* the capability guarantee — the strongest form
available and the default; its price is foreclosing partial implementations,
which is the point.

**Tier 2 — declared capability, read before dispatch.** Absence is legal and
has a degraded path the layer above can take: a strict read that falls back
to a non-destructive one, an index the planner can skip. Declare the
capability as **data on the type** — a value the router reads before
dispatching, not a call it makes and catches. Declared capabilities are
enumerable, which is what makes them testable, reportable and diffable; one
discoverable only by calling is one nobody can inventory.

**Tier 3 — inherited refusal.** Absence is legal, has no degraded path, and
the call site is rare enough that routing around it earns nothing. Give the
interface a default that **refuses**, naming implementation and capability.
Never a default that returns empty, never one that quietly does nothing:
those are the two spellings that turn a missing feature into wrong data.

The tiers are a ladder, not a menu. Move an operation up when its absence
starts breaking callers; move it down only when a legitimate implementation
cannot provide it *and* the layer above genuinely has another road. Choosing
one tier for everything fails in both directions. **All-required** turns the
members an implementation cannot provide into stubs, and a stub is worse than
an absence — it returns empty, or raises from mid-query, the latest possible
moment and the least diagnosable. **All-declared** defers every gap to
request time, so a structurally required omission is found by a user as a
lookup failure with no name for its class — when the fact needed to refuse it
existed the day the implementation was written.

## The default is the whole hazard

A capability defaulting to *supported* makes every implementation that never
heard of it claim it, including every one written before it existed. That is
an optional guard, and an optional guard is an absent guard
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)). The
default is the conservative pole, always: an implementation that can do the
thing says so explicitly, and silence means no. A consequence that looks like
a style question and is not: **polarity is chosen for the default, not for
readability.** *Supports X* defaulting to false and *needs X* defaulting to
true are each conservative for their own meaning; a flag set named for how it
reads will contain one whose safe default is the awkward one, and that is the
one that ships permissive.

## Declaration is not reflection, and an unread declaration is not a check

Asking the object what members it happens to have answers a different
question: a member can be present and inherited from the refusing default, or
present and raise. Shape is a fact about the type, capability a claim about
behaviour, and the two are only correlated — the same error the transaction
layer makes inferring "we are inside a boundary" from a handle's method list
([transactions-and-units-of-work](./transactions-and-units-of-work.md)).

### The precondition that rule rests on, and where it inverts

That objection is exact, and it is exact *because of the sentence's middle
clause*: a member can be **inherited** from the refusing default. Where
inheritance and default implementations exist — a base class, an interface
with defaults, a trait with provided methods — presence is supplied by the
type system and says nothing about this implementation. Take those away and
the argument goes with them. When the interface is a plain record of optional
function fields, with no prototype to inherit from and no default to fall
back on, a member exists *only because this implementation's author wrote
it*. Presence is then not correlated with capability; it **is** the
declaration, carried in the one place that cannot drift from the code because
it is the code.

So the discriminating question is not *declared or reflected*. It is:

> **Is the gap a whole operation, or an option on an operation that is always
> present?**

A whole operation's absence is directly observable, and in a
no-inheritance interface it is observable *exactly*. An option is not: a
required list-keys operation is present in every implementation, and whether
it honours a depth bound is a fact about its behaviour that no amount of
looking at the object can reach. That residue is what a declared-data channel
is for, and it is usually small — a handful of behavioural flags beside a
dozen presence-checked operations, rather than a parallel declaration for
everything.

Two costs come with taking the presence road, and both were observed in a
storage-adapter library with thirty-two adapters that takes it:

- **The residue is where the rot concentrates.** Because the flags channel
  carries only the few facts presence cannot express, it is small enough to
  be forgotten. In that tree two of thirty-two adapters declared any flag at
  all, and of the two flags the interface defines, one was declared by no
  adapter and read by no code — a declared capability nothing evaluates,
  which is the failure the next paragraph names, arriving through the
  *narrow* channel precisely because the narrow channel looks like a detail.
- **Presence has no room for a refusal.** Reflection gives the router two
  states, present and absent, and the absent branch has to do something. The
  ladder's Tier 3 answer is to refuse by name; a library that instead lets
  the absent branch return normally has spelled *unsupported* and *done* the
  same way, and no channel remains to tell them apart. Presence as the
  declaration is sound; presence as the excuse for a silent fallback is the
  same wrong data the tier ladder exists to prevent, and the two travel
  together because the reflection check makes the silent branch so cheap to
  write.

The default rule above survives intact under either channel, and matters more
under presence: silence must still mean no. It does, natively — an absent
member is absent — which is the one place this road is safer than a declared
flag that a new implementation forgets to set.

The failure one step out is very common in selection tables: a registry that
names, per implementation, the members it is *required* to have — and never
reads that list. A declared requirement nothing evaluates is documentation
wearing a check's uniform; it accrues entries, drifts from the interface, and
gets cited in review as though it gated something. Either the selection point
evaluates it at construction, or it is deleted.

Capability names are a **closed vocabulary with one authoritative
definition** on the interface
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
An implementation does not invent its own spelling: the router matches on the
name, and a second spelling matches nothing — silently, because "not
declared" and "declared under another name" are the same absence.

## The refusal is a verdict, not an error

What reaches a caller who asked for something unsupported is a **typed
outcome naming the capability and the implementation** — not the underlying
lookup failure, not a generic internal error
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).
*This backend cannot do that* routes to a configuration change, *something
threw* routes to a bug hunt; erasing the first into the second teaches
operators the store family is flaky.

## Admission at construction, and proving the declarations true

The selection point — a configured name resolved to an implementation — holds
every fact needed to refuse early: which implementation was named, whether
its required members are present, whether its environment prerequisites hold,
which optional capabilities it declares. Do all of it there, at startup,
naming the implementation. A gap caught at startup costs a restart; the same
gap at query time costs a user's request and a trace pointing at the wrong
layer. Then one conformance suite, written against the interface and
parameterised over implementations, asserts three things: every
implementation constructs; every capability declared **supported**
round-trips; and every capability declared **unsupported** produces the typed
refusal rather than an empty success. The third is the assertion always
missing, and the one that catches a declaration drifted from its
implementation — a flag still saying yes after the operation was removed, the
exact state the mechanism exists to prevent.

## Boundary

[cross-driver-invariant-parity](./cross-driver-invariant-parity.md) owns the
question that comes *after* this one: given two implementations that both
claim an operation, do they mean the same thing by it. Its artifact is a
prose list of invariants above both drivers and its stated force is two
engines — and prose is enforced by whoever remembers to read it, so past the
count one reader holds in their head, nobody does. This technique replaces
it: the claim moves out of prose and into the type, where construction checks
it. Declaration says which operations an implementation claims; parity is
what is owed for every one of them.

## When not to reach for this

With one implementation there is no capability axis; a missing operation is
just an unfinished one. With two that both do everything, the declarations
are noise that will rot untested. The technique starts paying when
implementations outnumber the people who can keep their differences in mind,
and becomes mandatory when they arrive from contributors who do not own the
interface — because then the interface's only way to say *you must* is to
make the omission unconstructable. One thing a declaration is **not**: a
fidelity grade. It answers *will this call be honoured*, a yes-or-no a router
branches on; how well an implementation preserves meaning is a different
artifact for a different consumer, and folding the two produces a value
nobody can branch on.
