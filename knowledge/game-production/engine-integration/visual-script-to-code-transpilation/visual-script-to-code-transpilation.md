---
layer: golden-path
type: golden-path
subject: visual-script-to-code-transpilation
status: forged
use_when: [porting a designer-authored visual script into engineering-owned code, deciding whether generated code matches the graph it came from, explaining engine or graph vocabulary across a designer/engineer seam, auditing a transpiler that produces code which compiles but misbehaves]
techniques:
  - graph-type-to-code-type-mapping
  - event-override-signature-resolution
  - declaration-definition-parity
  - structural-round-trip-diff
  - plain-language-jargon-layer
---

# Visual script to code transpilation

A visual scripting graph is not a friendlier syntax for the same program. It is a
different execution model wearing a different notation: its own value semantics, its
own object lifetime rules, its own idea of when a piece of work returns, and its own
uniform vocabulary laid over a decidedly non-uniform engine API. Transpiling a graph
into the engine's native language is therefore a **semantic port**, not a
translation — and every failure worth naming in this subject is one where the ported
code compiles cleanly and behaves differently.

That sentence is the whole discipline. A transpiler whose success criterion is "the
output builds" will ship silent behavioural divergence at a rate proportional to how
much of the graph it handled. The correct success criterion is a fidelity claim with
a named rung, and the rungs above "it builds" have to be constructed deliberately.

## What does not survive the crossing

Enumerate this list before writing a single emitter. Each item is a place where a
faithful-looking transformation quietly changes the program.

**Value and reference semantics.** Graphs typically hand containers and structures
around by value, copying at every pin. The target language hands the same shapes
around by reference or by pointer unless told otherwise. Emit the obvious mapping and
a graph that appended to its own private copy becomes code that mutates a shared one.
Every container and every structure in the type map needs an explicit decision about
copy versus alias, and the decision belongs in the map, not in the emitter's habits.

**Object lifetime.** A graph's reference to an object is usually a managed handle
whose destruction is visible to the runtime — it becomes null, and the graph tolerates
null. The naive code emission is a raw pointer that keeps pointing at freed memory.
The graph's tolerance of a dead reference is a *feature of its execution model*; the
port must reproduce it with the language's weak-handle or validity-check idiom, not
assume the object is alive because the graph never checked.

**Where work returns.** Graphs contain nodes that span frames — delays, timelines,
async loads, animation waits — and present them with the same shape as an instant
call. In code these become state machines, callbacks, timer handles or coroutines.
Any emitter that renders a frame-spanning node as an ordinary call has changed the
program's control flow into something that merely resembles it.

**Execution order and re-evaluation.** Graphs distinguish nodes wired into the
execution flow from nodes that are pure data. A pure node feeding three consumers may
be evaluated three times, at three different moments, with three different results if
its inputs are time-dependent. Emitting it once into a local variable is usually
*more* correct and always *different*. Decide the policy, write it down, and make the
diff aware of it — otherwise every comparison reports noise.

**Implicit coercion.** Graphs coerce silently between numeric widths, between a
single-precision and double-precision vector, between an object and its interface.
The code emitter must make each coercion explicit or the compiler picks one, and the
one it picks is not always the one the graph picked.

**The reflection layer.** The graph runs on top of a reflected metadata layer:
properties are visible to editors, saved with the object, replicated to clients, and
bound to the graph precisely because they carry annotations. Code that declares the
same property without the annotations compiles, links, runs — and is invisible to
everything the annotations were for. This is the purest form of the compiling-is-not-
wiring failure in this subject.

**Error tolerance.** A graph node with an invalid target usually logs and continues.
The equivalent call in code dereferences and crashes. Faithful porting means
reproducing the tolerance, not inheriting the language's default.

Nothing on that list is exotic. All of it is invisible to a compiler.

## The pipeline, and where each stage can lie

Four stages, each with a distinct failure signature.

1. **Export and parse.** The graph is read out of the authoring tool into a
   serialized form and parsed into a semantic tree: nodes, typed pins, execution
   edges, data edges, owning object. Failure here is *silent truncation* — a node kind
   the parser does not recognise is skipped, and the rest of the pipeline proceeds on
   a graph that is missing a branch. An unrecognised node must terminate the parse or
   land in the tree as an explicit unknown; it may never be dropped.
2. **Resolve.** Types are mapped, events are resolved against the owning object's
   type, references are bound to real members. This is where the semantic port
   actually happens and where most of the craft lives.
3. **Emit.** The tree becomes source text — both the declaration side and the
   definition side, in agreement, with annotations preserved.
4. **Verify.** The emitted code is compared back against the graph structurally, and
   the residue is reported in the graph's own vocabulary.

Stage four is the one teams cut, and cutting it converts every defect in stages one
through three into a defect discovered by a player.

**Leave the residue where it happened.** A node the emitter cannot port should produce
two things: a marked stub at its exact position in the emitted control flow, naming the
node kind and what it referenced, and a warning record bound to that node's identifier.
The stub gives the human the context to finish the work; the identifier lets the report
be rendered back in graph vocabulary. A transpiler that drops unportable nodes silently
and reports a clean run has produced a program with holes in the middle of its logic.

## The fidelity ladder

State the claim at the rung it was proven at, never above.

- **Parsed** — the graph was read without unknown nodes. Says nothing about output.
- **Compiles** — the emitted code builds. Says nothing about behaviour.
- **Declared and defined** — every emitted member exists on both sides of the
  language's declaration/definition split with agreeing signatures and agreeing
  annotations. This rung is where "silently unregistered member" is caught.
- **Structurally equivalent** — every node in the graph has a counterpart in the code
  and vice versa, matched semantically rather than textually.
- **Behaviourally equivalent** — the ported system was exercised at runtime and
  produced the same observable outcomes.

The rung that matters commercially is the last one, and no amount of the ones below
it implies it. A transpiler that reports "success" without naming a rung is reporting
the first two and letting the reader assume the last.

## Two hard limits, stated up front

**Some things cannot be authored from code at all.** Every engine has constructs that
exist only as editor-side data — certain asset bindings, certain designer-facing
configuration, certain node kinds with no code-callable equivalent. A transpiler's
correct behaviour on encountering one is a refusal that names the construct, not a
plausible-looking approximation. The broader catalogue of such traps is its own
concern (an engine-pitfall corpus); what belongs here is the rule that the transpiler
must know its own coverage boundary and report crossing it as an unsupported result
rather than an emitted guess. A refusal is a result. A wrong emission is not.

**Both sides cannot be authoritative.** Once code is generated, the graph and the
code are two implementations of one behaviour. Leaving both editable and both live is
the classic way to get a divergence nobody can date. Pick the authority explicitly —
usually the code, once ported, with the graph retained as documentation — and make
the diff a drift *detector* rather than a merge tool. The related, and different,
problem of generating engine code from a written specification rather than from a
graph shares this pipeline and this ladder but has no source graph to diff against;
its verification burden falls entirely on review.

## The transpiler serves two audiences at once

The graph's author is usually a designer who does not know the engine's code-side
terms. The code's owner is usually an engineer who does not know the graph's node
vocabulary. A tool sitting on that seam has a second deliverable besides the code: an
explanation layer, in both directions, that is part of the product rather than a
documentation afterthought. The rule that makes such a layer useful is that an entry
explains the **consequence** — what changes about the world because this flag is set —
never the expansion of the term. A glossary that unfolds an acronym has told a reader
who already knew, and told nobody else anything.

The same vocabulary is consumed downstream by whatever reviews the ported subsystem;
a structured multi-pass review of an engine subsystem is a separate doctrine, and the
seam between them is exactly this shared vocabulary. Keep one definition of each term
and let both sides read it.

## Failure modes of the naive reading

**Diffing the text.** Ordering, formatting, generated names and comment placement all
differ freely between an emitted file and a hand-written one, so a line-oriented diff
reports a hundred percent difference on two files that are the same program. The
comparison has to run over the semantic tree, and its output vocabulary has to be
"this node has no counterpart", not "line 40 differs" — because the first sentence is
actionable by the person who owns the graph and the second is not.

**Believing the easy half.** Three variants of one mistake: resolving an event by the
node's label rather than the owner's type; treating the type map as one-to-one and
hiding the hard entries behind a fallback; emitting one side of a language's
declaration/definition split. Each produces something that builds. Each produces,
respectively, a method that never runs, a program with different value semantics, and
a member nothing has registered.

**Reporting coverage as correctness.** "Ninety percent of nodes transpiled" is a
statement about the transpiler, not about the output. The ten percent is where the
divergence lives, and the number that matters is how many of the ninety were verified
above the compile rung.

A finished transpiler's output is therefore not "code that builds". It is a claim
about equivalence, at a stated rung, with the unported residue listed by name.
