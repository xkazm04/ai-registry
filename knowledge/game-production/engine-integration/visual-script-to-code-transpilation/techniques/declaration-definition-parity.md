---
layer: technique
type: technique
subject: visual-script-to-code-transpilation
technique: declaration-definition-parity
status: forged
laws: [law-and-check-share-one-source, compiling-is-not-wiring]
shared_with: []
use_when: [emitting code in a language that separates declaration from definition, a generated member fails to link or fails to appear in an editor, reviewing a generator that writes two files per class]
---

# Declaration definition parity

In a language that separates a member's declaration from its definition, every emitted
member exists twice, and the two statements must agree in three respects: signature,
qualifiers, and annotations. A generator that emits one side without the other
produces a link error at best. At worst — for a member whose registration lives in the
annotation — it produces something that compiles, links, runs, and is invisible to
every system that was supposed to see it.

The rule: **emit both sides from one model of the member, and check parity as a build
step rather than trusting the emitter.**

## Why one model, not two templates

The tempting implementation is two templates: one that writes declarations, one that
writes definitions, each walking the same member list. It works until someone changes
a parameter default, a constness qualifier, or an annotation in one template. Then the
two drift, and the drift is undetectable from either side — each file is internally
consistent and individually plausible.

The correct shape is a single in-memory record per member (name, return type, ordered
parameters with defaults, qualifiers, annotations, owning class, and whether it
overrides) which both renderers consume. The declaration renderer and the definition
renderer are two projections of that record. A change to the record propagates to both
by construction; a change to a renderer cannot desynchronise them. This is the same
principle that keeps a written rule and the check that enforces it on one source.

## The three axes of agreement

**Signature.** Name, return type, parameter types in order, and parameter count. In
languages with overloading, an emitted definition whose parameters differ from the
declaration is not an error — it is a *new overload*, defined but never declared, and
the declared one goes undefined. That is the link error, and it is the friendly case.

**Qualifiers.** Constness, staticness, virtuality, override markers, and whichever of
them the language permits on only one side. This asymmetry is a common generator bug:
a qualifier that must appear on the declaration and must *not* appear on the
definition, or the reverse. Encode that rule once, in the renderers, from the record.

**Annotations.** The reflection metadata that makes a member visible to editors,
saveable, replicable, or callable from the graph. These usually attach to the
declaration only — which means the definition side cannot betray their absence, and
nothing in the build will. A member emitted without its annotations is the
compiling-is-not-wiring failure: it exists and is unreachable by everything that
mattered.

## Procedure

1. **Build the member record set before rendering anything.** No renderer may invent a
   member.
2. **Render both sides in one pass over the set**, so a member cannot be present in one
   pass's output and absent from the other's.
3. **Re-parse the emitted output and assert parity.** Read back both artifacts, extract
   the members, and assert set equality plus per-member signature and annotation
   agreement. Checking the model against itself proves nothing; the check must read
   what was actually written.
4. **Report a parity failure as a failure of the port**, not a warning. A member on one
   side only is not a partial success.
5. **Include inherited-override members in the check.** An override declared but not
   defined is the same defect wearing a base class.
6. **Treat a member present in the definition but absent from the declaration as the
   more dangerous direction** — it is the one that survives more toolchains.

The canonical incident has a shape worth memorising: a header pass that declared three
event overrides while the source pass, written separately, only ever defined two. The
build was fine until link time, and the link error named a symbol nobody had typed. The
fix was not a better check — it was making both passes walk the *same resolved list*,
after which a declaration without a definition is structurally impossible rather than
merely detected.

## Decision rules

- When an emitted identifier feeds two places — a macro and a directory, a symbol and a
  registration — derive both from one sanitising function, and warn when the sanitiser
  changed the input. A silently corrected name produces artifacts that only agree with
  each other by luck.
- When a language permits a qualifier on both sides but requires them to match, emit it
  on both from the record; never let one renderer "know" it can omit it.
- When an annotation's placement is ambiguous, put it where the reflection tooling reads
  it and record that choice in the renderer, not in each member.
- When the generator supports partial emission — regenerating one class into an
  existing pair of artifacts — the parity check runs over the whole artifact, not the
  regenerated fragment. Partial emission is exactly how one side gets stale.
- When a member is emitted only to satisfy the graph's internal wiring and is not part
  of the class's interface, it still needs both sides. There is no "internal enough"
  exemption; the linker does not have that concept.

## When not to use this

Irrelevant for a target language with a single point of definition — most modern
targets. The residual lesson still transplants: wherever a generator writes the same
fact into two artifacts, it must write both from one record and verify by reading back
what it wrote, not by re-consulting the record it wrote from.
