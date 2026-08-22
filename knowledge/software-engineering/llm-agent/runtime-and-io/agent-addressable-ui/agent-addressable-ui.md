---
layer: golden-path
type: golden-path
subject: agent-addressable-ui
status: forged
use_when: [a person can see the defect but cannot name the file, wiring a coding agent into a running interface, deciding how development-only instrumentation stays out of the product, an element inspector resolves every click to the same shared primitive]
techniques:
  - build-time-source-stamping
  - framework-internals-independence
  - opt-in-instrumentation-gate
  - call-site-vs-implementation-resolution
  - agent-pasteable-reference-format
  - uninstrumented-degradation
---

# Agent-addressable UI

A person is looking straight at the defect. It is right there on the screen —
the spacing is wrong, the label is stale, the control sits where nobody would
look for it. They are talking to a coding agent that could fix it in seconds.
And between the two sits the most wasteful step in the loop: the person has to
translate a *place on the screen* into a *place in the source*, in prose, from
memory — and the agent has to translate it back by searching.

That translation is where the budget goes. "The button in the top right of the
settings panel" becomes a search, then four files opened, then a guess, and
sometimes an edit to the shared primitive instead of the one screen that was
wrong. The person, meanwhile, knew perfectly well *where* the problem was and
had no vocabulary to say it in. This subject is about closing that gap: making
the running interface **addressable**, so that any rendered pixel resolves to a
source location a machine can act on.

The thesis is that the translation was never necessary, because the answer was
in hand and got thrown away. Something compiled the expression that produced
those pixels, and at the moment it did, it knew the file and the line. Every
technique here follows from refusing to discard that: preserve the location on
the elements that survive into the rendered document, resolve it back on
demand, hand it to the agent in a shape the agent already reads — and gate the
whole arrangement so that the shipped product carries none of it.

> Addressability is not a search problem. It is a **discard** problem.

The alternatives are all reconstructions of the discarded fact, and each costs
more than preserving it would have. A vision model reading a screenshot infers
a component from its appearance: nondeterministic, priced per turn, and wrong
in the way that is hardest to catch — confidently naming a file that renders
something which merely *looks* the same. Searching for the visible text finds
the translation catalogue, not the call site, and finds nothing at all when the
text is composed at runtime. Matching on the accessibility tree yields a role
and a name, which is not a location. All three are archaeology performed on a
fact the build had exactly, for free, and dropped.

## This is not an element inspector

Inspectors have existed for as long as browsers have, and building one is not
this subject. An inspector answers a question for a *person who is about to
read the tree themselves*: what is this node, which styles apply, what is its
state. Its output is a live handle, examined in place, and it is excellent at
that.

Addressability answers a different question for a different consumer: what
**durable reference** do I hand a machine that is not looking at my screen and
never will. A live handle is worthless in a chat message. Computed styles are
worthless to an agent that wants a file. The two tools share a click target and
nothing else, and building the second while picturing the first produces the
recognizable failure: a beautiful panel full of runtime detail, from which the
person still cannot extract one line an agent can act on.

## Stamp what survives to the document

The build knows the location of every expression, but only some of those
expressions leave a trace in the rendered document. Components do not: a
component is a function, it disappears into whatever it returns, and there is
no node in the document that *is* it. Host elements — the primitive tags the
rendering framework hands to the platform — do survive, one node each, and they
are the only durable place a stamp can live.

So the transform stamps host elements and skips everything else, and the
classification is available at the language level rather than from any
framework's knowledge: an intrinsic tag name is one thing, a capitalized
identifier is another. The stamp itself is one attribute carrying one value —
a project-relative path and a line — because one attribute is one lookup and
one parse, where three parallel attributes are three chances to disagree. It
must be **layout-agnostic**: an attribute on the element that already exists,
never a wrapper node, never a class, never anything that participates in
selection or spacing. An instrumentation pass that changes the layout it is
supposed to help you fix is not instrumentation, it is a second bug.
[build-time-source-stamping](./techniques/build-time-source-stamping.md) holds
the transform's obligations: parse-only, idempotent, path taken from whatever
already knows the project root, and an explicit skip list for the modules where
stamping is meaningless or harmful.

## Depend on nothing private

There is a shortcut, and it is the first thing everyone tries. Rendering
frameworks keep debug bookkeeping on their internal nodes in development, and
that bookkeeping usually includes the source location; a handle from a rendered
node into the internal tree is usually reachable too. Walk it and you get
addressability with no build step at all.

It is the wrong foundation, and it fails on a schedule. That bookkeeping is
private, unversioned surface: it is removed between majors with no deprecation
window, and when a major release dropped the debug-source field the entire
ecosystem of click-to-source tooling broke in the same week. It is absent for
components rendered on the server, absent under any renderer but the one you
tested, and stripped from any build that is not the framework's own development
build. Worst of all, its failure is silent — the walk returns nothing, the tool
shows nothing, and nothing is exactly what an uninstrumented run also shows
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)).

The golden path rests on two primitives that are stable by construction: an
attribute in the document, and traversal of the ancestor chain. Neither knows
the framework's name; both are specified by somebody with a compatibility
obligation. The acceptance test is blunt — point the resolver at an interface
built with a different framework, or with none, and it should still work.
[framework-internals-independence](./techniques/framework-internals-independence.md)
argues the general form of this: when a private debug surface is the only
source of a fact you need, **produce the fact yourself at build time rather
than read it from someone's internals**. Producing costs one transform, once;
reading costs a rewrite per major, forever.

## The gate is what makes it permanent

Instrumentation that costs the product anything gets renegotiated every
quarter, and eventually loses. The target is not *small*; the target is
**zero** — a normal development run and every production build must not merely
skip the work, they must never load the toolchain that does it. Zero is
qualitatively different from small: it needs no budget, no measurement and no
defending in review, which is what lets the capability live in the repository
permanently instead of being removed the first time someone audits bundle size.

Zero is bought with a **double gate**. The transform is registered into the
build only when a flag is set, so under a normal run the build graph never
contains it and its module is never even required; and the transform re-checks
the same flag itself and no-ops. The redundancy is not superstition. A build
registration is configuration, and configuration is copied, merged, inherited,
and evaluated in contexts its author never enumerated — a production build that
reuses the development config object, a test runner that imports it, a
downstream tool that extends it. The second gate is the one that holds when the
first is bypassed by a path nobody classified, and it observes the actual
invocation rather than the configuration's intent
([gate-sees-target](../../../_laws.md#gate-sees-target)). The overlay is a
third artifact under a third gate, because it is application code where the
transform is build code. The gates, the flag's ownership, and the rule that a
runtime switch inside the shipped bundle is not a gate at all are
[opt-in-instrumentation-gate](./techniques/opt-in-instrumentation-gate.md).

## The innermost answer is the wrong answer

Here is the non-obvious part, and the one every adopter rediscovers
expensively. The element under the cursor is stamped, and the stamp is
technically correct, and handing it over is nearly useless. The innermost
element is almost always inside a shared primitive — the design-system button,
the layout box, the icon wrapper. Its source is a file nobody wants to edit,
and editing it changes two hundred screens.

What the person wants is the **call site**: the nearest enclosing element whose
source belongs to the product rather than to the shared layer. That is
recoverable by walking the ancestor chain outward from the target, collecting
every stamped ancestor, and classifying each one's path as library-internal or
product — matching on path *segments*, never as a substring of the whole path,
because a substring match fires on any directory whose name happens to contain
the token. The innermost non-library ancestor is the default answer. When every
ancestor is library-internal the resolver must say so rather than pretend the
innermost one was the call site, and when nothing is stamped at all that is a
different state again.

Two rules keep this honest. **Both answers stay reachable** — the default is
the call site, a modifier yields the innermost — because perhaps one time in
ten the defect really is in the primitive, and a tool that hides that answer
sends the person back to guessing. And **the chain itself is the richest
output**: the full stamped ancestry, outermost to innermost, is the render path
and is worth more to an agent than either single location, at the cost of being
longer. The classification list, the walk, the fallbacks and the modifier
contract are
[call-site-vs-implementation-resolution](./techniques/call-site-vs-implementation-resolution.md).

## The clipboard is the transport

The whole apparatus terminates in a person pressing a key and pasting into a
conversation, so the format of what lands in the clipboard is a first-class
design decision and not a detail. The consumer is a coding agent reading a chat
message: give it a project-relative path and a line in the conventional shape,
unwrapped by prose it would have to strip, plus a short trimmed anchor of the
element's visible text so it can confirm it landed on the right thing after the
file drifted. A line, not a range — ranges are wrong more often, and an agent
widens on its own. Nothing the person did not intend to disclose: the visible
text is already on screen, but attribute values and component state are not,
and they do not belong in a reference that is about to enter a model's context
and possibly a shared thread.

Behind the format sits a degradation ladder, because writing to the clipboard
is the least reliable operation in the loop: the asynchronous write is
permission-gated, requires a secure context and a focused document, and rejects
in several perfectly ordinary situations. So: attempt the modern write, fall
back to the legacy synchronous command against an off-screen field, and at the
bottom rung *show the text already selected and ask the person to copy it*. Every
rung reports which rung it used, because a copy that fails quietly is the one
failure that poisons the whole loop — the person pastes whatever was in the
clipboard before, and the agent confidently edits an unrelated file. The format
and the ladder are
[agent-pasteable-reference-format](./techniques/agent-pasteable-reference-format.md).

## Absence has to be loud

The overlay and the stamping are two artifacts behind two different gates, so
the reachable-but-wrong combination is guaranteed: overlay present, stamps
absent. That is what a normal development run looks like. The naive behaviour —
arm, highlight nothing, copy an empty reference — is worse than not shipping the
overlay at all, because it teaches the operator that the feature is broken and
they stop reaching for it.

The rule is that the overlay **detects the absence, names the cause, and prints
the exact command to relaunch with**. A diagnosis without a treatment ("source
mapping is unavailable") sends the operator to documentation they will not find;
the flag and the command, verbatim and copyable, are the message. The partial
case needs its own answer too: when a module was skipped or an element came from
a library that your transform never saw, stamps exist elsewhere, so an "it is
all off" banner would be a lie — the honest response is per-resolution, naming
that this element has no source and offering the nearest stamped ancestor
instead. And the overlay never takes the interface hostage: the arm is explicit,
it times out on its own, ordinary interaction keeps working while it is armed,
and every exit path disarms it
([creation-names-reaper](../../../_laws.md#creation-names-reaper)). The three
states and their obligations are
[uninstrumented-degradation](./techniques/uninstrumented-degradation.md).

## Where this subject stops

Three neighbours sit close enough to be confused with this one, and the seams
are worth stating precisely. **Embedded preview** is a host product driving
*somebody else's* application across a frame boundary: two programs, a message
protocol with correlation identity, an origin to validate, a server whose
lifecycle someone must own — and its injected instrumentation looks like this
subject's stamping without being it, because that agent is code inserted into a
guest the host does not control, probed over a bridge, reporting to the host
product. Here there is no guest, no frame and no protocol; an application
instruments *itself*, the consumer is the person at the keyboard and the coding
agent they are talking to, and the entire transport is the system clipboard. The
rule for picking: if the thing being addressed runs behind someone else's server
and you reach it through a frame, that is
[embedded-preview](../../../integration/embedded-preview/embedded-preview.md);
if it is your own application talking to your own operator, it is this one.
**Build economics** owns the general design of a development-only build shape —
which variant is the default, what it cannot see, what it costs — through
[dev-variant-design](../../../engineering-process/build-and-release/build-economics/techniques/dev-variant-design.md);
this subject takes that as given and owns the other half, what such a variant
is *for* here and the specific double gate that keeps its price at zero. And
[machine-paced-delivery](../../../engineering-process/continuous-integration/machine-paced-delivery/machine-paced-delivery.md)
makes the build's **output** agent-readable — the verdict of a run, shaped for a
machine that has no context. This subject makes the **running interface**
agent-addressable. One is about what came out of the pipeline; the other is
about what is on the screen.

## The techniques

- [build-time-source-stamping](./techniques/build-time-source-stamping.md) — a
  parse-only transform, host elements only, one attribute, idempotent, the path
  supplied by whatever already resolved the module.
- [framework-internals-independence](./techniques/framework-internals-independence.md)
  — why private debug bookkeeping is the wrong foundation, and what to rest on
  instead.
- [opt-in-instrumentation-gate](./techniques/opt-in-instrumentation-gate.md) —
  the double gate that makes a normal run and every production build pay
  literally nothing.
- [call-site-vs-implementation-resolution](./techniques/call-site-vs-implementation-resolution.md)
  — the ancestor walk, path-segment classification, and keeping both answers
  reachable.
- [agent-pasteable-reference-format](./techniques/agent-pasteable-reference-format.md)
  — the shape a coding agent already parses, and the clipboard ladder beneath
  it.
- [uninstrumented-degradation](./techniques/uninstrumented-degradation.md) —
  detecting the absence of stamping, naming the relaunch command, and the
  partially-stamped case.
