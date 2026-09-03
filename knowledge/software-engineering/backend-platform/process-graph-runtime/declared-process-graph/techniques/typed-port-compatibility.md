---
layer: technique
type: technique
subject: declared-process-graph
technique: typed-port-compatibility
status: forged
laws:
  - absent-guard-is-loud
  - unknown-is-not-a-value
shared_with: []
use_when: [annotating channel types on a graph that was written untyped, deciding whether a producer and consumer disagree, resolving a schema for a channel whose type is parameterized]
---

# Typed port compatibility

Port type annotations are the one part of a topology document that must be
adoptable **halfway**. A graph is written untyped, works, grows, and only then
starts acquiring annotations — one node at a time, by whoever is touching that
node. A type system that demands the whole graph before it says anything useful
will never be turned on; one that shouts at every unannotated boundary will be
turned off within a week. The design target is precise: catch a real mismatch in
the annotated fraction, and be silent everywhere the evidence does not support a
verdict.

## The compatibility rules, in the order they are applied

**Unannotated is dynamic, and dynamic pairs with everything.** A port with no
declared type carries whatever its producer sends. Two dynamic ports are
compatible; a dynamic port and an annotated one are compatible. This is not
leniency, it is honesty: nothing in the document says otherwise, and inventing a
type from the first observed message would make the verdict depend on run
history.

**A mismatch requires two annotations that disagree.** The only configuration
that yields an error is a producer and a consumer that both declare, where the
declarations cannot be reconciled by the rules below. Everything else is at most
a warning.

**Strict mode warns exactly where annotated meets unannotated.** That boundary is
the real finding — it is where the annotated region ends, and it is the only
place an author can act on. Warning about a fully unannotated edge tells them
something they already know; warning about a fully annotated compatible edge is
noise. Strictness is opt-in, and because an optional guard is an absent guard
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)), the
document records that the graph was checked without it — a run that skipped
strict mode says so in its output, so nobody reads a clean report as a strong
one.

**A parameterized name matches an unparameterized one.** When a type name carries
parameters — an element type, a frame of reference, a unit — a side that names
the type without parameters is stating the family and declining to state the
parameters. That is a weaker claim, not a conflicting one, and it is compatible.
This rule is what lets a generic node be written once and wired into many
graphs.

**Disagreement on a shared parameter is the only parameter-level mismatch.**
Compare only the parameters both sides actually name. A parameter one side
declares and the other omits is unconstrained by the omitting side. Two sides
that name the same parameter with different values is a genuine, actionable
error, and it is the finding this whole rule set exists to produce.

**Transitive conversions resolve by bounded search.** Declared conversions
between types form a graph, and a producer type reaching a consumer type through
a chain of them is compatible. The search is bounded to a small fixed depth —
three is a defensible default — and never run to a fixpoint. The reason is the
same one that bounds document expansion: the conversion set is author-supplied,
so an unbounded search over it is unbounded work driven by input. The bound also
buys comprehensibility; a compatibility that only holds through a seven-step
chain is a compatibility no reader of the document will predict, and a type
system whose verdicts cannot be predicted is worse than none.

**One type is the universal sink.** A gradual system needs a name that everything
widens into — an opaque payload type — so a node that deliberately handles raw
bytes can be annotated honestly without forcing every producer upstream of it to
be annotated first. Without the sink, the only way to describe "I take whatever
comes" is to leave the port unannotated, which is a different and weaker claim,
and the strict-mode warning then fires on a port whose author knew exactly what
they meant.

**Structurally, a superset is compatible; a missing or retyped field is not.**
When both sides describe a record, a producer that supplies every field the
consumer names, at the type the consumer names, is compatible even if it supplies
more. A field the consumer needs and the producer does not have is a mismatch. A
field present on both sides at different types is a mismatch — and it is the one
that matters most, because it is the case that would otherwise parse and produce
wrong values rather than failing.

## Resolution yields a whole schema or no schema

A checker resolves each port's schema from the annotation, from a registry, from
a conversion chain, or from the producer. Sometimes it cannot: the name is
unknown, the parameters are unresolved, a referenced definition is missing.

The rule is absolute: **an unresolvable schema yields no schema, never a partial
one.** The temptation is real — the checker knows three of the five fields, and
returning what it has feels more useful than returning nothing. It is not. Every
consumer downstream reads a schema as a complete description; a partial schema is
an unknown wearing the clothes of a definite value
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)), and it
produces the worst available outcome — a confident mismatch report against fields
that were never in evidence, or a confident pass over a field the checker never
saw. Absent is a state consumers can branch on. Partial is a state they cannot
detect.

**"Annotated" and "resolved" are two different sets, and the diagnostics key on
different ones.** A port whose declared type name does not resolve — a typo, a
type the registry has not been told about — is still an *annotated* port. It
contributes nothing to compatibility checking, because there is no type to check
against; but it must not be counted as unannotated either, or the strict-mode
report says "upstream has no type annotation" about a port that visibly carries
one, and the author goes looking for a missing declaration instead of the
misspelling that is already reported two lines above. Keep both sets — every
annotated port, and every port whose annotation resolved — and write to both
through a single call, so no code path can add to one and forget the other. The
strict warning reads the first; the compatibility check reads the second.

The same discipline applies whenever the type check runs **before** a
normalization pass the rest of the pipeline depends on. A port that a consumer
addresses in short form now and in expanded form later must be registered under
both spellings by a check that runs in between, because a lookup that misses is
indistinguishable from an unannotated upstream: the checker silently drops
genuine mismatches *and* emits a false missing-annotation warning, from the same
missing key.

## Decision rules

- Report a mismatch with both declarations printed as written, the edge named,
  and the specific point of disagreement — the parameter, the field, the missing
  conversion. A verdict of "incompatible types" between two long structural
  descriptions is unreadable exactly when it is correct.
- Never let a type verdict change what is delivered. Types decide whether the
  document is accepted; they do not select a codec, coerce a payload, or reorder
  a field. A type system with a runtime effect stops being optional the moment
  the first graph depends on the effect.
- When a conversion is declared, declare its direction. Compatibility is not
  symmetric — a widening is safe one way and lossy the other — and a conversion
  set treated as undirected produces compatibility verdicts that silently permit
  the lossy direction.
- When the type registry is unavailable, the verdict is "not checked", reported
  as such. It is not "compatible"; a checker that cannot run and a checker that
  found nothing must produce different output.
- When a graph mixes annotated and unannotated regions long-term, that is a
  legitimate steady state. Do not add a rule that forces annotation to spread;
  the gradient is the feature.

## When not to use this

A graph whose payloads are already self-describing at run time — every message
carrying its own schema, and the receiver validating on arrival — gets less from
static port types, and the static layer should stay advisory there. It still
catches the wiring mistake before any process exists, which the runtime check
cannot; it should not be promoted to a hard gate on top of a runtime guarantee
that already holds.

Do not use this to police a node's internal contract with its own configuration,
or to type a pass-through region the runtime does not interpret. The rules here
govern what travels on a channel between two declared ports, and nothing else.
