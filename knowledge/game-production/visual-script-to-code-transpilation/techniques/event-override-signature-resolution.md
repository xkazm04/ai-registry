---
layer: technique
type: technique
subject: visual-script-to-code-transpilation
technique: event-override-signature-resolution
status: forged
laws: [compiling-is-not-wiring, structural-proof-is-never-sufficient]
shared_with: []
use_when: [mapping a graph event node onto an engine callback, a ported system builds and its logic never runs, the same event node appears on objects of different kinds]
---

# Event override signature resolution

A visual scripting graph presents a **uniform event vocabulary over a non-uniform
API**. The node reads the same on every object: begin, tick, overlap, destroyed. The
engine underneath does not agree — the callback that corresponds to "begin" has a
different name on an actor than on a component, and "tick" takes different parameters
depending on which base class you are standing on. The graph hides that on purpose,
because designers should not care. A transpiler that inherits the same convenience
produces methods that compile, override nothing, and are never called.

The rule is one sentence: **resolve the event against the owning object's type, never
against the node's label.**

## Why the failure is silent

An override in most engine languages is an ordinary member function that happens to
match a base declaration. Miss the name, miss a parameter, miss a qualifier — the
compiler is content. It has been handed a valid new method, not an invalid override.
The base class's version continues to run, the emitted body never executes, and the
symptom is "the ported system does nothing", discovered by whoever plays it. This is
the compiling-is-not-wiring failure in its purest form: an artifact that builds, loads
and is never reachable.

Structural evidence cannot close this. The method exists, the file compiles, the class
registers. Nothing below the behavioural rung distinguishes a correct override from a
method with a typo in its name.

## Procedure

1. **Determine the owner type first.** The graph's owning object — actor, component,
   controller, user-interface widget, data-only object — is the key. Nothing about
   resolution can begin before it is known, and a graph exported without its owner is
   not transpilable.
2. **Resolve against a signature table keyed by (event, owner kind).** The table's
   value is the full signature: exact callback name, ordered parameter types, return
   type, and any qualifiers the language requires on an override. Not the name alone —
   the name alone is the half that the compiler will not check for you.
3. **Walk the owner's ancestry, not just its immediate type.** A specialised component
   inherits its base's callbacks. Resolution looks up the chain and stops at the first
   type that declares the event; if two ancestors declare differently-shaped versions,
   that ambiguity is a reportable defect, not a coin flip.
4. **Distinguish overrides from bindings.** Some graph events correspond to a virtual
   method you override; others correspond to a delegate or multicast event you must
   *subscribe to* at construction. Emitting an override for the second kind produces a
   method nobody calls. The table records which mechanism applies, and the emitter
   generates the subscription — and, where the language requires it, the
   unsubscription — for the binding kind.
5. **Emit the base call where the base does work.** Many engine callbacks require the
   parent implementation to run. The table records whether the base call is required
   and where in the body it belongs; omitting it produces a class that initialises
   half-way.
6. **Normalise the node label before lookup.** Graph tooling commonly decorates the
   designer-facing name of an engine event with a fixed prefix or suffix that the
   code-side callback does not carry. Strip the convention in one place, at the front
   of resolution, so every downstream comparison sees one canonical name.
7. **Resolve the enablement site too, not only the method.** Several engine callbacks
   only run if a per-object flag is set, and the field holding that flag is *also*
   named differently by owner kind. Resolving the method correctly and setting the
   wrong enablement field yields, at best, a build failure and, at worst, an override
   that exists and never fires. The table's row covers the method, its parameters,
   its base call, and whatever must be switched on for it to be invoked.
8. **Deduplicate resolved overrides, loudly.** Two differently-labelled nodes can
   resolve to one callback. The second one cannot be emitted — but the fact that its
   logic was not emitted must appear in the residue, bound to that node. Silent
   dedupe is how a whole branch of designer intent disappears.
9. **Fail closed on an unresolved event.** An event node whose owner kind has no entry
   is an unsupported node, reported by name and owner. It is not an ordinary method
   with a guessed signature.

## Decision rules

- When the same event label resolves differently for two owner kinds, the table is
  correct and the graph's uniformity is the illusion. Never collapse the entries to
  reduce the table's size.
- When a signature is uncertain, prefer refusing the node to emitting a probable
  override. A refused node appears in the unported residue and gets a human; a wrong
  override appears nowhere.
- When the engine offers both an override and a binding for the same event, prefer the
  override for behaviour that belongs to the object and the binding for behaviour that
  reacts to another object — and record the choice, because the diff cannot infer it.
- When the owner kind is a data-only or editor-only object, most event vocabulary does
  not apply at all; resolving anything there is a sign the graph was exported with the
  wrong owner.
- The owner's type constrains more than signatures. Engines commonly derive naming
  conventions — class-name prefixes, module-scoped export markers — from the ancestry,
  and reject a generated class that breaks them before any code is compiled. Validate
  those against the resolved parent and report a mismatch as an error at emit time,
  where it is one line to fix, rather than as a build-tool rejection later.

## Verification

The only check that has teeth is one the compiler can be made to perform: emit the
language's explicit override marker on every resolved override, so a name or signature
mismatch becomes a compile error rather than a new method. Where the language offers
no such marker, add a build-time reflection check that asserts each emitted override
actually shadows a base declaration. Either way, the goal is to convert a behavioural
failure into a structural one — the one direction in which structural evidence is
worth something.

## When not to use this

If the target has no inheritance-based callback model — an entity-component-system
where behaviour is registered rather than overridden — this technique's shape does not
apply; the equivalent problem is registration, and the equivalent failure is a system
that is never scheduled. The underlying rule survives the change of model: resolve
against what owns the behaviour, and make the wiring checkable at build time.
