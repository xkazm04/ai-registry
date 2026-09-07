---
layer: technique
type: technique
subject: conditional-service-composition
technique: conjunction-activated-fragments
status: forged
laws: [failure-not-empty-success, one-authority-per-vocabulary]
shared_with: []
use_when: [an integration between two services belongs to neither service's own description, the list of which overlays apply to which service combinations has outgrown a reviewer, adding a service means editing every other service's description, a topology fragment appears to be ignored and nothing errors]
stage: multi-service
---

# Conjunction-activated fragments

A fragment of a service topology takes part in a run **if and only if every
handle it names is in the active set**. That is the whole rule. The fragment
carries its own participation condition, the assembler evaluates the condition
by set membership, and no component anywhere holds a mapping from combinations
to fragments.

The rule exists because of one structural fact: an integration between two
services is described by material that belongs to neither of them. The alias by
which one reaches the other, the credential one injects into the other's
environment, the shared volume, the routing entry — none of it is a property of
either service, and all of it must exist exactly when both are running. Three
places to put it, and two of them are wrong before you finish typing. In the
first service's description, it makes that service undeployable alone. In the
second, the mirror. In a central manifest that maps combinations to overlays, it
is correct and unmaintainable: the manifest grows as the product of the service
count, every new service is an edit to every existing row that mentions it, and
nobody reviewing a diff to that file can tell whether it is complete.

The fourth place is the fragment itself. Give the fragment an identifier that
*is* its condition — a composite of the handles it requires — and the assembler
needs only one operation: for each available fragment, is the set of handles
named in its identifier a subset of the active set? Adding an integration
becomes adding one document and touching nothing. Deleting a service deletes
its fragments and, by construction, every integration that mentioned it stops
activating, with no dangling row to clean up.

## Why conjunction, and only conjunction

The condition is an AND over the named handles, and the temptation to extend it
should be resisted for a reason worth stating rather than asserted as taste.

Conjunction over a set is the only predicate that keeps the assembler ignorant.
It is evaluable by subset test, it is order-free, it is closed under nothing —
there is no expression tree to parse, no operator precedence to document, no
short-circuit semantics to get wrong. More importantly it is **decidable in
reverse**: given a fragment's condition you can name, exactly, the minimal
active set that would activate it, which is what makes the reachability check in
the last section possible at all. Add disjunction and negation and you have a
small boolean language; the reverse question becomes satisfiability, the
diagnostic "why did this fragment not activate" stops having a one-line answer,
and every reader of a fragment identifier now has to know the language.

Where a genuine disjunction exists — this material applies with either of two
alternative backends — write two fragments. The duplication is real and it is
cheap, and the alternative is a language. If the duplication becomes large
enough to hurt, that is a signal that the two alternatives should share a handle
rather than that the condition needs an operator: introduce a handle meaning
*some backend of this class is active*, activate it from either, and the
conjunction rule is intact.

## The identifier is the condition, and that is a vocabulary

Because the handles appear in the identifier, the identifier is not a name — it
is a machine-read expression, and the set of legal handles is a closed
vocabulary with one authority
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
Two consequences follow that a naming convention would not have.

**A handle that does not exist must not silently mean "condition unsatisfiable."**
A fragment naming a handle that no service declares and no probe emits is, under
the plain rule, simply never selected — which is exactly the failure the next
section is about. The vocabulary is what lets the assembler tell a handle it has
never heard of from one that is merely inactive today.

**The separator must be reserved.** The identifier is parsed into a handle set,
so whatever character separates the handles cannot appear inside one. State that
constraint where handles are declared and enforce it there, not at parse time in
the assembler — a handle containing the separator produces a fragment whose
condition names two handles that do not exist, and it activates for nobody, in
silence.

## The assembler knows nothing, and that is the property being bought

It is worth being explicit about what this design refuses, because the refusal
is the whole value. There is no resolver that knows about integrations. There is
no registry of which fragments exist. There is no code path that says "if both
of these are running, also include that." The assembler enumerates a population,
tests a subset relation, and returns a list. Every piece of knowledge about what
goes with what lives in the fragments, in a form a reader can see by looking at
one file's name.

That is what makes the surface scale. The count of things a human maintains is
the count of fragments, and each is independently reviewable; the count of
things the assembler maintains is zero. A central manifest inverts both numbers:
the assembler's knowledge grows with the product of the service count, and the
individually-reviewable unit disappears, because a row in a combination table is
meaningless without the rest of the table.

## The unreachable fragment, and the only instrument that finds it

Here is the failure this technique must own, because nothing else in the design
can. **A fragment whose condition can never be satisfied is invisible.** It sits
in the tree, it is enumerated on every run, it is tested against every active
set, and it is never selected — because it names a handle that was renamed two
releases ago, or a capability token that no probe emits on any supported host,
or a handle whose declaration was deleted with the service it belonged to.

There is no observation that distinguishes it from a fragment that is correctly
inactive today. Both contribute nothing. Both produce no error, no warning, and
no gap in the resolved artifact that a reader could notice, because the resolved
artifact contains what activated and says nothing about what did not. This is
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
arriving in its most deniable form: the empty contribution is *correct*
behaviour for the same code path under a different input, so there is no bug to
find by reading the code.

The instrument is an **enumeration pass over the whole fragment population,
asserting that every fragment's condition is satisfiable by some legal active
set.** It runs in the build, not at composition time, and it is a gate rather
than a report. Concretely, for each fragment: parse its identifier into a handle
set; assert every member is a declared handle or a capability token some probe
can emit; and assert the resulting active set is one an operator could actually
request — a fragment requiring two handles that are declared mutually exclusive
is unreachable even though every handle in it exists.

Two rules keep the pass honest. It must **fail the build**, not warn: a warning
in a build log about a document that does nothing is the definition of a message
nobody reads. And it must be **derived from the same handle vocabulary the
assembler uses**, not from a second list maintained beside it, or the pass will
certify exactly the fragments the assembler cannot see. Assert the instrument
before trusting its silence: the pass should have a known-unreachable fixture in
the test suite, because a reachability check that passes because it enumerated
nothing is the same lie one level up.

## Decision rules

- One fragment, one condition, expressed as the set of handles in its
  identifier. The condition is a conjunction; there is no operator vocabulary.
- A genuine alternative is two fragments, or a shared handle activated from
  either alternative. It is never a disjunction operator.
- Handles are a closed, singly-authoritative vocabulary. The separator is
  reserved and enforced where handles are declared.
- The assembler holds no mapping from combinations to fragments and no knowledge
  of what any fragment is for. If it acquires one, the design has silently
  reverted to a central manifest.
- Every run's fragment population passes a reachability gate that fails the
  build on a fragment no legal active set can satisfy.

## When not to use this

- **A small, stable topology.** Below roughly a dozen services with a handful of
  integrations, a human can hold the list, and an explicit set of overlays named
  where the topology is defined is clearer and directly reviewable. This
  technique starts paying when the integration surface exceeds the service
  surface — when the wiring, not the nodes, is the thing that is hard to keep
  right.
- **Conditions that depend on values rather than membership.** If whether a
  fragment participates depends on *what* a setting says rather than on *which*
  handles are active, this is a policy decision and belongs in a policy
  evaluation with an audit trail — calling it composition hides the fact that
  the outcome cannot be predicted from the request alone.
- **Anything after the topology is running.** Participation is decided once,
  before start. A fragment that should come and go while services are up is a
  reconfiguration, and reconfiguration of a live system is a reconciliation
  problem with a completely different set of guarantees.
