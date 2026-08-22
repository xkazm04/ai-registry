---
layer: technique
type: technique
subject: agent-addressable-ui
technique: build-time-source-stamping
status: forged
laws: [derivation-names-recomputation, one-authority-per-vocabulary]
shared_with: []
use_when: [deciding which rendered nodes carry a source location, an instrumentation pass changes the layout it was meant to diagnose, source references point at the wrong file after a build reruns]
---

# Build-time source stamping

The transform is the whole foundation: a build step that reads each module,
finds the expressions that will become elements in the rendered document, and
writes the source location of each one onto the element it produces. Everything
downstream — the walk, the reference, the overlay — is reading what this step
wrote. It is also the step with the most opportunities to be subtly wrong,
because it runs inside somebody else's compiler on every module in the project.

## Stamp host elements, and only host elements

A component leaves no node behind. It is a function that returns other
elements, and the rendered document contains its output, not the component
itself; an attribute written onto a component expression is not an attribute at
all, it is a prop, and it lands wherever that component happens to spread its
props — which may be nowhere, may be the wrong node, and may collide with a
prop of the same name. Host elements — the primitive tags the rendering
framework hands to the platform — produce exactly one node each, which is what
makes them the only durable stamping surface.

The classification is available without knowing anything about the framework:
in every markup dialect this technique meets, an intrinsic tag name and a
user-defined component are lexically distinguishable (conventionally, a
lowercase or dotted-namespace tag versus a capitalized identifier). Read the
element name off the parse tree and filter on it. Resist the temptation to
"stamp everything and sort it out later": the props you inject onto components
will reach production props-spreading code and cause warnings, and the extra
locations are the ones nobody wants anyway.

Some host elements should still be skipped. Anything whose children are parsed
under foreign rules, and anything the platform will reject an unknown attribute
on, is not worth the exception it will eventually throw. Keep the exclusion list
in the transform, next to the filter, not in the caller.

## One attribute, one vocabulary

Write **one** attribute whose value carries the project-relative path and the
line. Three parallel attributes — path, line, component name — are three chances
for the resolver to find two and miss the third, and three names that four
consumers must agree on. One attribute is one lookup, one parse and one name.

That name is a closed vocabulary with more consumers than it looks: the
transform writes it, the resolver queries it, the overlay probes for its
presence to detect an uninstrumented run, and any styling rule that must avoid
selecting on it needs to know it too. Derive all of them from one declaration
rather than repeating the literal
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary));
a stamp attribute renamed in the transform and not in the probe produces a tool
that reports "no instrumentation" on a fully instrumented build, which is the
most confusing failure this subject can produce.

Normalize the path before writing it: project-relative, forward slashes, no
machine-specific prefix. The reference is going to travel — into a chat message,
a commit body, an issue — and an absolute path from one developer's machine is
noise everywhere else.

Stamp precisely and emit coarsely: it costs nothing to include the column
alongside the line in the attribute, and a resolver that wants to disambiguate
two elements declared on one line will want it — but the *reference handed to a
person or an agent* drops it, because no editor jump and no agent widens from a
column, and the extra segment makes the reference look machine-generated in a
sentence. One value in the document, two renderings out of it.

## Parse-only, and never part of lowering

The transform's contract with the compiler it lives inside is: **parse, insert
an attribute, print, and touch nothing else.** It must not desugar the element,
must not rewrite it into the framework's runtime call form, must not decide how
children are handled. The moment the transform participates in lowering, it owns
a second implementation of a compiler frontend that has to track the real one
release by release, and it will silently diverge — first on a syntax the real
lowering handles and yours does not, then on a semantics difference that
produces a working build with wrong output.

Parse-only also keeps the cost honest. The transform's price is one extra parse
and print per module, which is affordable precisely because it is bounded and
because it never runs outside the gated variant.

Two obligations make parse-only real rather than aspirational. **Refuse the
project's own compiler configuration.** A transform that lets the toolchain
discover the repository's presets stops being a single pass the moment somebody
adds one, and then it *is* lowering — accidentally, invisibly, and in
competition with the real pipeline. Pass the syntax dialects the parser needs
explicitly and disable configuration discovery. **And thread the source map.**
The transform sits upstream of everything else, so if it consumes an incoming
map without emitting one, every tool downstream that reports a position —
debugger, error stack, coverage — starts pointing at rewritten text. An
instrumentation pass whose whole purpose is accurate locations must not destroy
the locations everyone else depends on.

## Idempotent, because a module gets transformed twice

Modules are re-read: a watch rebuild, a second plugin pass, a tool that runs the
transform chain over already-transformed output. A transform that appends a
stamp unconditionally either doubles the attribute — invalid, and the parse that
follows will keep whichever copy it likes — or silently keeps a stale first
value while the file has moved on.

The rule: **check for the stamp attribute before writing one, and leave an
existing stamp alone.** Skipping is right and overwriting is wrong, because the
only case where a stamp already exists and the location has changed is a rebuild
that will re-read the source anyway. Idempotence is one line of code and it is
the difference between a transform that is safe to compose and one that is not.

## The path comes from whoever already knows the root

A transform runs per module and does not reliably know where the project root
is. Computing it inside the transform means guessing from the working directory,
and the working directory is wrong under a monorepo, wrong under any runner that
relocates itself, and wrong under a build invoked from a subdirectory — which
yields stamps that are individually plausible and collectively unresolvable.

Whatever invoked the transform *does* know: the loader, plugin host, or compiler
integration resolved the module in the first place and holds both the absolute
path and the root. Take the relative path as an input to the transform, and make
it a required input rather than an optional one with a fallback — a fallback
here means a subset of stamps are quietly wrong, and a wrong stamp is worse than
no stamp because it costs the agent a full wasted edit before anyone notices.

## The skip list is part of the design

Some modules must not be stamped, and enumerating them is a design act rather
than an oversight:

- **generated or vendored code**, where the location is meaningless to a person
  and the file is regenerated anyway;
- **modules whose output never reaches the document** — anything rendering to a
  canvas, a document head, a serialized string, or an off-document surface;
- **modules the compiler treats specially**, where an extra parse pass is a
  correctness risk rather than a cost;
- **anything already stamped by an upstream tool**, which the idempotence rule
  handles but the skip list makes cheaper.

Keep it short, explicit and commented with *why* each entry is there. A skip
list without reasons becomes a superstition list, and the entry nobody
remembers adding is the one that makes a whole screen unaddressable.

## The stamp is derived, and it expires

A stamp is a derived value: it is the position an expression held in a file at
the moment of a build, and its recomputation is the build itself
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
It goes stale the instant somebody edits the file above that line without the
build catching up, and under a hot-reloading development server that window is
short but real. Say so where the reference is presented rather than pretending
to a precision the mechanism does not have — which is also the reason the
reference carries a text anchor: a line that has drifted by three is trivially
recoverable by a reader who has a phrase to look for.

## When not to use this

Interfaces that do not render into an inspectable element tree — an immediate-
mode canvas, a native surface, anything drawn rather than composed — have no
node to stamp, and the technique does not degrade into them gracefully; those
need a hit-test that reports a draw-call identity instead, which is a different
mechanism with a different owner. And a project small enough that every screen
lives in one file does not need a transform at all: the person can name the file
faster than the tool can be built.
