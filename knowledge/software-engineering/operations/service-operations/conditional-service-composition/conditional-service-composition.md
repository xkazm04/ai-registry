---
layer: golden-path
type: golden-path
subject: conditional-service-composition
status: forged
use_when: [deciding which fragments of a service topology take part in a particular run, an integration between two services belongs to neither service's own description, a topology behaves differently on two machines with the same request, a startup selects an accelerator path the host does not actually have, the list of overlays that apply to a combination has outgrown anyone's ability to maintain it]
techniques:
  - conjunction-activated-fragments
  - specificity-ordered-layering
  - intent-and-environment-in-one-namespace
---

# Conditional service composition

Before a multi-service topology starts, something has to answer a question that
has nothing to do with running services: **which descriptions of this topology
take part in this run, and in what order do they land?** Not which containers
are healthy, not which processes come up first, not what a value resolves to —
which *documents* are in the pile at all. That question is answered once, before
anything starts, against a set of tokens assembled partly from what the operator
asked for and partly from what the host was found to have. Everything after it —
merging, launching, ordering, probing — operates on the artifact this stage
produced, and inherits every mistake it made.

The naive answer is that there is no such stage. A topology is one document, or
one document plus a handful of overlays named on the command line, and the person
starting it knows which. That answer survives exactly as long as the services are
independent. It breaks on the first **integration** — the piece of description
that exists only because service A and service B are both running: the network
alias one needs to reach the other, the credential one injects into the other's
environment, the volume they share. That fragment belongs to neither service.
Put it in A's description and A cannot start without B. Put it in B's and the
mirror. Put it in a third document and somebody has to remember to include it,
which means the topology now has a correctness condition that lives in a human's
head.

The scale at which this stops being a style question is easy to state. With *n*
services, the pairwise integration surface is on the order of *n²*, and it is
not hypothetical padding: a topology of a few hundred service descriptions can
carry several times that many integration fragments, because the interesting
part of a service mesh is the wiring and not the nodes. At that size no ordered
list of "which overlays apply to which combinations" can be maintained by hand,
and no reviewer can check one. The composition layer must be able to answer the
question **without anyone having enumerated the answers**.

This subject holds three commitments, and they share one stance: **participation
is declared by the participant, and the assembler knows nothing.**

- A fragment states its own condition for taking part, in a form the assembler
  can evaluate against a set — so adding an integration is adding one document
  and editing nothing.
- The order fragments land in is a **function of their identifiers**, computed
  and published, because a discovered set has no author-declared order and the
  merge is order-dependent.
- The set the conditions are evaluated against holds two kinds of token —
  things the operator **requested** and things the host was **observed** to have
  — and every operation that quantifies over that set says which kinds it ranges
  over.

## The pipeline, and which stage each technique owns

Five stages, in order, all of them before the first process starts:

1. **Resolve the active set.** Take the handles the operator named, expand any
   group or wildcard among them, and union the result with the capability tokens
   produced by probing the host. The output is a flat set of tokens.
   [intent-and-environment-in-one-namespace](./techniques/intent-and-environment-in-one-namespace.md)
   owns this stage: what may be in the set, what each kind means, and which
   operations may range over which kinds.
2. **Select the participating fragments.** Enumerate every available fragment,
   read the condition each declares, and keep the ones the active set satisfies.
   [conjunction-activated-fragments](./techniques/conjunction-activated-fragments.md)
   owns this stage: the conjunction rule, why the condition lives in the
   fragment's own identifier, and how a fragment that can never activate is
   detected — which nothing else in the design can do.
3. **Order them.** Sort the selected fragments by a total order derived from
   their identifiers.
   [specificity-ordered-layering](./techniques/specificity-ordered-layering.md)
   owns this stage: the ordering function, the determinism guarantee, and the
   obligations a derived order takes on in exchange for not being a list.
4. **Merge.** Hand the ordered fragments to whatever performs the merge, with
   later winning over earlier. This subject does not own the merge.
5. **Emit the resolved artifact and hand it to the engine.**

Stage five is short but not trivial, and it is worth stating here rather than
inventing a technique for it. The composition layer's output should be **a value
the engine could have been handed by a human**: a single, standalone topology
description with no residual references to the fragments it came from. Two
properties follow, one good and one that must be said out loud.

The good one is that the composition layer never becomes a second implementation
of the engine's semantics. It decides *which documents*; the engine decides *what
the keys mean when they collide*. A composition layer that starts reimplementing
per-key merge rules so it can be clever about one field has taken on a
compatibility burden it will lose, silently, at the next engine release — and it
has created a second authority on a question the engine already answers
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)).
The escape hatch is the same property viewed from the other side: because the
output is an ordinary topology description, a team that abandons the composition
layer keeps a working artifact, and a team debugging one can diff the resolved
artifact against the fragments and see exactly what happened.

The one that must be said out loud is that **flattening changes the artifact's
security class**. Fragments carry references — an environment value that was a
lookup, a credential that was a mount — and a resolved artifact inlines them.
The result is a file that looks like configuration and is in fact a materialized
secret. This subject does not own that; a secrets discipline does. But the
composition layer is where the materialization happens, so this is where it must
be noticed: the emitted artifact is not a build product to be committed, cached,
or attached to a bug report by default, and the layer that emits it says so at
the point of emission rather than trusting the reader to infer it.

## Where this subject ends

The neighbourhood is crowded and every neighbour answers a different question
with overlapping words, so the boundaries are worth drawing precisely.

[declarative-resource-lifecycle](../../control-plane-operations/declarative-resource-lifecycle/declarative-resource-lifecycle.md)
and the rest of its subcategory own **reconciliation of running resources
against a desired state** — the record several independent writers share, the
loop that reads it, the marker that stops it vanishing. Every one of those
mechanisms presupposes that a desired state exists. This subject is the
*construction of the desired state*, and it finishes before the first thing that
subject describes begins. The rule for a reader: if the question is *what should
the world be made to look like, and how do we keep converging on it*, read
there; if the question is *which documents get to have an opinion about what the
world should look like, and in what order*, read here. A design that lets the
convergence loop reach back and change which fragments participate has made the
running system the author of its own desired state, which is the composition
equivalent of a program editing its own source between statements.

[settings](../../governance-and-records/settings/settings.md) owns **values and
their precedence across sources**: the key registry, the typed accessor, the
default with a fail direction, and — the technique this subject argues with most
directly —
[cross-source-precedence-chain](../../governance-and-records/settings/techniques/cross-source-precedence-chain.md).
The division is clean once stated: **this subject decides which documents are in
the merge; that subject decides what a key resolves to within it.** Both stages
are order-sensitive and both are called precedence in casual speech, which is
exactly why the split has to be written down. The seam is stage four above:
selection and ordering are here, the per-key outcome is there.

That technique's rule is that the order must be "declared, named, and singular",
written once as an ordered list of named sources. A reader arriving from it will
think this subject breaks that rule, and it is worth being precise about what it
actually does. It does not break it; it changes the **representation of the
declaration** from an enumeration to a function. A total order over identifiers,
written once in the assembler, is still singular and still named — what it is
not is *listable in advance*, because the population it orders is discovered.
The discriminator a reader needs:

> **Declare the order as a list when a human can hold the list. Derive it from
> the identifiers when the population is combinatorial — and then publish the
> derivation and make the resolved order dumpable, because those are what the
> list was buying.**

The neighbouring
[author-declared-include-graph](../../governance-and-records/settings/techniques/author-declared-include-graph.md)
covers a third shape, and naming all three is the fastest way to place this
subject. There, the participants are declared **by the author, inside the
artifact** — a document names its parents, the resolver walks the graph, the
order is the order the author wrote. Its two-shape framing (the platform
declares the sources, or the author declares them) is complete for configuration
that a person assembles. This subject is the case where **nobody declares the
set**: each candidate declares only the condition under which it would take
part, and the set is whatever satisfies the condition. That is why a resolver
built for either of the other two shapes gets this one wrong — it goes looking
for the declaration, and there isn't one.

[overlay-merge-absence-semantics](../../../integration/acquisition-and-ingest/import-normalization/techniques/overlay-merge-absence-semantics.md)
shares the word *overlay* and owns the opposite half of it: what an overlay's
**silence about a key** means once the merge is already running. Participation
versus absence semantics — this subject decides whether a document is in the
merge; that one decides what it means when a document that is in the merge says
nothing about a field. A reader arriving from there for the first question will
find nothing, and vice versa.

Two siblings in this category take what this subject deliberately does not hold.
[health-checks](../health-checks/health-checks.md) owns whether the composed
services actually work once they are up;
[node-boot-and-declarative-bootstrap](../node-boot-and-declarative-bootstrap/node-boot-and-declarative-bootstrap.md)
owns what a single node does with the configuration it was handed, in what order
it acquires its dependencies, and which of them a reload may change. Both begin
at the moment this subject's artifact is handed over. Startup ordering, readiness
and restart policy are theirs; none of them is a composition decision, and a
composition layer that starts scheduling is two subjects wearing one name.

## The failure modes of the naive reading

Three, and each is silent, which is what makes the subject worth having.

**The unreachable fragment.** A fragment whose condition can never be satisfied
— because it names a handle that was renamed, or a capability token that no
probe ever emits — is simply never selected. Nothing errors. Nothing is missing
from the resolved artifact in a way anyone can see, because *never activated* and
*correctly inactive* produce the identical observation: absence. This is
[failure-not-empty-success](../../../_laws.md#failure-not-empty-success) with the
failure hidden inside a design that is working exactly as specified, and it is
detected only by an enumeration pass that asserts, over the whole fragment
population, that every declared condition is satisfiable by *some* legal active
set. That pass is not optional garnish. It is the only instrument the design
admits.

**The order that is not an order.** When the fragment set is discovered by
enumerating a directory rather than declared, the enumeration order is a property
of the host, and hosts disagree — on case sensitivity, on locale collation, on
whether the listing is sorted at all. A merge is order-dependent by definition,
so an undefined enumeration order is a defect that reproduces per machine and not
per input: the same request, the same fragments, two different results, and no
diff between the two runs to look at. It is the purest form of the bug that
cannot be reproduced by the person who has to fix it.

**The observation treated as a request.** When the active set holds both what
was asked for and what was found, the two look identical — they are tokens in one
namespace, which is the point, because it lets one conjunction rule serve both.
The failure arrives with the first operation that quantifies over the namespace.
"Start everything" must mean every service the operator could have named; if it
also expands over capability tokens, the run has just asserted that this host has
every accelerator it knows the name of, and the fragments conditioned on those
capabilities activate against hardware that is not there. An unobserved
capability has been rendered as a definite yes
([unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value)). Requests
are expandable; observations are not, and a namespace that cannot tell them
apart cannot enforce the difference.

## What "done" looks like for this subject

A composition layer meets the bar when: every fragment states its own
participation condition in a form the assembler evaluates without knowing what
any fragment is for, so that adding an integration is adding one document and
editing nothing; an enumeration pass proves every fragment's condition is
reachable and fails the build on one that is not, because absence is otherwise
indistinguishable from correctness; the merge order is a documented total
function of the identifiers, stable across hosts, with a first-class command that
prints the resolved order and the fragments it selected for a given request; the
active set distinguishes requested handles from observed capabilities by declared
kind, and every wildcard, group and "all" operation states which kinds it ranges
over; a probe that could not run yields *unknown* rather than *absent*; and the
resolved artifact is a standalone topology description the engine could have been
handed directly, emitted with a stated warning that it now contains, inlined,
everything the fragments only referenced.

## The techniques

- [conjunction-activated-fragments](./techniques/conjunction-activated-fragments.md)
  — participation declared in the fragment's own identifier, the conjunction
  rule over the active set, why the assembler must stay ignorant, and the
  enumeration pass that makes an unreachable fragment visible.
- [specificity-ordered-layering](./techniques/specificity-ordered-layering.md)
  — the total order derived from identifier structure, the determinism guarantee
  a discovered set requires, and the two obligations a derived order takes on in
  place of a declared list.
- [intent-and-environment-in-one-namespace](./techniques/intent-and-environment-in-one-namespace.md)
  — requests and observations sharing one token space, the declared kind that
  keeps them apart, and the rule that every quantifier over the space names the
  kinds it ranges over.
