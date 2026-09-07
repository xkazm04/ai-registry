---
layer: technique
type: technique
subject: dead-code
technique: unadopted-extension-point
status: forged
laws: [count-carries-predicate, failure-not-empty-success, deletion-is-not-repair]
shared_with: []
use_when: [an abstraction's methods have no call sites, deciding whether to wire or delete an unused hook, a protocol declares fewer members than its default implementation, a refactor plan says wire up the adapter, the behaviour an interface declares is written inline at every call site]
---

# The unadopted extension point: wire or delete

[quarantine-vs-delete](./quarantine-vs-delete.md) prices the three moves for a
candidate whose **deadness is uncertain**. This technique starts one step later,
where deadness is certain and the disposition is still open, because the
candidate is not an orphan — it is an **extension point nothing extended
through**. An adapter base class, a protocol, a plugin interface, a strategy
hierarchy: declared as the place a concern would vary, and then not used, while
the concern varied anyway, inline, at every site.

That population looks like ordinary dead code and behaves nothing like it. Its
deletion is not obviously right, because the abstraction may be the design the
codebase should have. And its adoption is not obviously right either, and the
instruction that sounds most reasonable — *wire up the extension point* — is the
one that does real damage.

## The measurement that opens the question

The finding is a count, and it carries its predicate or it is not a finding
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)). A
measured instance: a default adapter declaring **17 methods, 11 with zero call
sites anywhere**, beside 145 lines of hand-written provider dispatch in the
caller doing those same jobs. Nothing was red. The suite passed, the abstraction
was documented as the extension point, and the behaviour lived somewhere else
entirely.

Two details of the predicate decide whether the number is usable:

- **Call sites are counted against the receiver, not the name.** An unrelated
  class with a same-named method is not a call site for this one. Restricting an
  AST scan to the set of receiver expressions that denote the extension point is
  what stops the count from being quietly wrong in the safe direction.
- **The declaring module is excluded.** Inside it the names are definitions, and
  counting them as uses certifies the whole surface as live.

## The decisive column is the inline equivalent

For each dead member, find the code in the caller that does its job, and compare
that code's **shape** to the member's declared signature. Three outcomes, and
they are not on a spectrum:

**An inline equivalent exists and the signature fits it → wire.** This is the
only case where adoption is a refactor. The behaviour already exists, it is
already tested through its callers, and moving it behind the declared member
collapses N copies into one call. The strongest instances are the ones where the
member's *default* body has no consumers, because then aligning the default with
the inline copies is unobservable and the change is pure structure. Two examples
from the measured instance: a result-formatting member whose default branch was
inlined three times across three response paths, and a predicate whose inline
equivalent matched its signature exactly in two of them.

**An inline equivalent exists but its shape differs → delete the member.**
Wiring it is not a refactor; it is a behaviour change wearing one. The tells are
concrete and worth checking rather than judging: the inline code passes a value
through where the member wraps it, the member's parameter type cannot express
the object the inline site actually receives, or the member's default returns a
different value than the constant the inline path uses — so wiring it changes
that value for every caller that was not the motivating one. A member whose
adoption silently re-tunes a threshold for every provider except the one you
were thinking about is not an abstraction being adopted. It is a regression with
a design rationale.

**No inline equivalent exists anywhere → delete, and this is the important
case.** There is no behaviour to move. The member is speculative API: someone
declared where a variation would go and the variation never arrived. An engineer
or agent told to *wire up the extension point* will therefore **invent** an
implementation — and the invented code has a property that makes it worse than
the dead method it replaced: **no test could ever have failed against it**,
because there was never a behaviour it was supposed to reproduce. The suite goes
green over code nobody has a reference for
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success) —
a test that passes because the code is right and one that passes because there
is nothing it could contradict produce the same green).

In the measured instance, 6 of the 12 deletions were this class. A plan written
without this column had specified wiring all twelve.

## Where the population does not exist

The triage above is worth running only where there is something to triage, and
the census is cheap enough that the negative is the common result. A measured
counter-case: a provider abstraction with **14 methods, 0 with zero call sites**,
every one overridden between 1 and 68 times across three concrete adapters. There
was no unadopted surface, and the decision table would have had no rows.

The discriminator is a ratio, not a size: **this technique's population needs a
surface wider than its adopters.** An extension point declared speculatively — a
method per anticipated variation — accumulates members no adapter overrides,
which is the shape the census finds. An extension point grown from its adapters,
where each member exists because a concrete implementation needed it, has nothing
to find, and a run of the census over it is a ten-second confirmation rather than
a finding.

That distinction is also the cheapest available reading of an abstraction's
health, which is the argument for running the census before believing either
answer. Two structural facts separate the healthy case from the defective one
without any judgment: the count of members with zero overrides, and the count
with zero call sites. A surface where both are zero is adopted. A surface where
members have overrides but no callers — the measured defective case, with eleven
such — is one where providers took the trouble to specialize behaviour that
nothing invokes, which is the strongest single tell in the class.

## The protocol that declares less than the implementation

One structural check belongs beside the count, because it is free and it
falsifies the codebase's own claim about itself: **compare the protocol's member
list to the default implementation's.** A default implementation declaring 17
where the protocol declares 16 means one member is not part of the interface it
is described as implementing — so any consumer holding the protocol type cannot
reach it, and the extension point's contract is smaller than its documentation.
That member is dead by construction for every polymorphic caller, whatever the
call-site count says.

## Deleting the member deletes what only it reached

An extension point is often the last live reference into a module that exists to
serve it. Removing a member that returns a helper object can leave that helper's
entire module reachable from nothing — in the measured instance, a 387-line
module whose only production importer was one of the deleted members. That is
not a bonus deletion to fold into the same change: it is a second candidate with
its own blast radius, and it enters the ordinary
[deletion-protocols](./deletion-protocols.md) sequence as its own reviewable
unit. Note it at the deletion site, and let the next reachability run raise it.

## What gets recorded

The output of this technique is a decision table, one row per member, with the
default's return, the overrides, the call-site count, the inline equivalent's
location, the verdict, and the justification. Two properties make it worth
committing rather than consuming:

- **The justifications are the review.** "Zero call sites" argues for touching
  the member; it does not argue for which way. The column that carries the
  decision is the inline equivalent, and a row without it is a preference.
- **It is the seed for the ratchet that stops the recurrence.** The members
  staying dead for now become an enumerated, identity-keyed baseline rather than
  a count — the shape [counted-set-snapshot](../../../standards-and-gates/metric-gates/techniques/counted-set-snapshot.md)
  specifies — so that a *new* member with no consumer is a failure on the day it
  is added, while the known population is exempt. That exemption inherits every
  rule in [suppression-hygiene](./suppression-hygiene.md), and in particular the
  self-retiring form: an entry naming a member that has since acquired a call
  site must fail, or the list becomes a permanent blanket over the surface it
  was meant to shrink.

Deleting the eleven and leaving the extension point undefended is
[deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair) at the
class level: the corpses go and the mechanism that produced them stays.
