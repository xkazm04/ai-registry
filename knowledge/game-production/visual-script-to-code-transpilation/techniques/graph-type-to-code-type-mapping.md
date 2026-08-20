---
layer: technique
type: technique
subject: visual-script-to-code-transpilation
technique: graph-type-to-code-type-mapping
status: forged
laws: [structural-proof-is-never-sufficient, refuse-rather-than-destroy]
shared_with: []
use_when: [building the type table for a graph-to-code port, a ported system compiles but mutates shared state, deciding what to do with a graph type the language has no equivalent for]
---

# Graph type to code type mapping

The type map is the smallest artifact in a transpiler and the one that decides
whether the port is a semantic port or a costume change. It is a table from each type
the graph can put on a pin to the declaration the emitter writes — and its value is
concentrated entirely in the entries where that relationship is **not** one-to-one.

A map built by walking the graph's easy types (integer, float, boolean, string) and
adding a fallback for everything else is worse than no map, because it looks
complete. The hard entries are the product.

## The four kinds of non-obvious entry

**1. No direct equivalent.** A graph type the language does not have — an editor-only
handle, a soft asset reference, a wildcard or generic pin whose concrete type is
decided at wiring time. There are exactly three legal outcomes: map it to a
purpose-built wrapper the codebase owns, map it to a language primitive *and record
the semantic gap in the entry*, or refuse. Never fall back to a generic opaque
pointer to keep the table full.

**2. Lifetime differs.** The graph's object reference is a managed handle: when the
object dies, the reference reads as invalid and the graph's nodes tolerate that. The
default code emission — a raw pointer — keeps a dead address. The map entry must
name the language's weak or validity-checked idiom and the emitter must pair every
use with the corresponding guard. Getting this wrong produces a crash weeks later in
someone else's system, and it is invisible to the compiler.

**3. Copy versus alias.** The graph passes containers and structures by value; the
language passes them by reference or pointer. A map entry that omits this produces
code where a "local" list is the caller's list. Every container and structure entry
carries an explicit copy/alias decision. When in doubt, copy: it matches the graph's
semantics and it is the cheaper mistake.

**4. Precision and width.** Graph numerics coerce silently across widths and
precisions. The map states the emitted width per graph type and the emitter writes
the conversion explicitly, so that a widening or narrowing appears in the source
rather than in the compiler's inference.

## Procedure

1. **Enumerate from the graph side, not the language side.** The domain of the map is
   every type the authoring tool can place on a pin. Building from the language side
   guarantees the exotic graph types are the ones missing.
2. **Make the map total, with an explicit unmapped value.** Every graph type maps to
   a code type *or* to a first-class `unmapped` result carrying the type's name. There
   is no third branch and no default case. An unmapped result is data the pipeline can
   report; a guess is data nobody can find later.
3. **Annotate the non-obvious entries with the reason.** One line per entry: *why*
   this mapping is not the obvious one. This is the only documentation that survives
   a maintainer who was not there, and it is what stops the next person "simplifying"
   the wrapper away.
4. **Carry the annotations, not just the type.** In a reflection-driven engine, a
   member's visibility, persistence and replication live in annotations beside the
   type. The map's output is a *declaration fragment* — type plus required annotations
   — not a bare type name. A property emitted with the right type and no annotations
   is invisible to every editor and every save.
5. **Decide container element handling separately.** A container of a mapped type is
   not automatically mapped: an array of managed handles has different rules from an
   array of numbers. Compose the element decision with the container decision
   explicitly.
6. **Test the map against the graph's own type list, not against a sample.** The
   coverage question is "which graph types have no entry", answerable statically. A
   sample of real graphs tells you which types are *common*, which is a different and
   less useful question.

## Decision rules

- When a graph type has no language equivalent **and** no owned wrapper exists, refuse
  the node and report the type by name. Do not emit an opaque handle to keep the
  build green — that converts a visible gap into an invisible one.
- When the graph's semantics and the language's default disagree (copy vs alias,
  managed vs raw), **follow the graph** and make the language carry the cost. The
  graph is the specification; the port exists to preserve its behaviour, not the
  language's conventions.
- When two graph types map to the same code type, check whether they were
  distinguishable in the graph. If they were, the map has erased a distinction and the
  round-trip diff will never see it again — split the target or record the loss.
- When a mapping requires a runtime conversion, emit it explicitly even if the
  compiler would have inserted the same one. Explicit conversions are diffable;
  implicit ones are not.
- When you are tempted to invent a plausible-looking target type name to fill an
  entry, stop. A name that does not exist in the target language is strictly worse
  than an unmapped result: the unmapped result is a report, the invented name is a
  build failure whose origin is the map nobody suspects.
- Not every pin carries a value. A graph's execution pins are control flow wearing the
  same notation as data; mapping them to a value type at all is a category error, and
  an entry that does so will silently pollute derived signatures.

## When not to use this

Do not build a full map for a one-off port of a single small graph that a human will
read line by line afterwards — the map's value is amortised over volume and over
maintenance. Do not build one at all if the target is not a static language: where the
target's type discipline is looser than the graph's, the problem inverts and becomes
one of *inserting* checks the graph assumed rather than mapping types it declared.

And do not treat a complete map as evidence of a correct port. Every entry can be
right and the output still wrong, because the map says nothing about control flow,
event resolution, or frame-spanning work. It removes one class of silent divergence.
There are others.
