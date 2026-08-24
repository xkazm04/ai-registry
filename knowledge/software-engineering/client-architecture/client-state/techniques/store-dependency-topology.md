---
layer: technique
type: technique
subject: client-state
technique: store-dependency-topology
status: forged
laws: [one-authority-per-vocabulary, absent-guard-is-loud, unknown-is-not-a-value]
shared_with: []
use_when: [module-scoped singletons must initialize in an order nobody wrote down, undefined values at startup that only reproduce under production bundling, a deferred import appears in order to break a cycle]
---

# Store dependency topology

A store composed of slices has an internal dependency graph whether or not
anyone has drawn it. Every cross-slice call, every module-scope service one
slice reaches for, every "this must exist before that" assumption is an edge.
The graph is real; the only question is whether it is **legible** — whether it
exists somewhere a human and a check can read it, or only in the union of the
import statements, where the sole tool that can evaluate it is the bundler and
the only report it produces is an undefined value at startup.

[store-slicing](./store-slicing.md) is the prevention half of this problem: read
at need, call the other slice's operation, emit a domain event, and the cycle
never forms. This technique is the **remediation and enforcement** half, for
the graph that already exists and the codebase that cannot be re-architected
this quarter. Prevention keeps the graph acyclic by discipline; topology makes
acyclicity a checkable property of a written artifact, which is what discipline
degrades into once the codebase outgrows one author's memory.

## The symptom you are actually chasing

The diagnostic signature is specific enough to name: a value that is defined
everywhere the code reads it *later*, and undefined at the one moment startup
touches it — reproducing on some machines and not others, in the production
bundle and not the development server, after a reordered import and not before.
That is module-evaluation order, and it is not a property of your source. It is
a property of how the toolchain topologically walked the import graph, which
changes with chunking strategy, tree-shaking, code splitting, and the order a
lazily-loaded route happened to arrive in.

The naive reading is that there is no cycle because nothing *looks* circular —
no file visibly imports itself back. Cycles at this scale are never two files
long. They are five modules long, they run through a barrel that re-exports a
sibling, and the person who closed the loop added one import to a file they
believed was a leaf. The second naive reading is that the deferred import
fixed it. A deferred import does not remove an edge; it moves the edge from
evaluation time to call time and hides it from every tool that reads imports
statically. What it buys is real — see the accessor below — but it is a
mitigation applied at one call site, and applying it silently means the next
engineer inherits a graph with invisible edges.

## Declare the topology as data

Write the graph down as a literal mapping from each node's name to the names it
depends on, in one module, and treat that module as the
[one authority](../../../_laws.md#one-authority-per-vocabulary) on the
vocabulary of node names. Three properties make the manifest worth its
maintenance, and a manifest missing any of them is decoration:

- **Every name on a dependency list is a declared node.** A manifest that
  tolerates a dangling edge validates nothing — it will happily accept a
  renamed store and report a clean graph over a lie.
- **Nothing derives the manifest and the manifest derives nothing twice.** The
  moment the initialization order is *also* hand-written somewhere, or a second
  document narrates the same graph in prose, the copies begin to drift and the
  drift is discovered by the person extending the vocabulary, who finds one of
  them.
- **It covers the whole graph, not the interesting part of it.** A manifest
  listing the six stores that gave trouble, in a system of twenty-five, cannot
  answer the question it exists for, because the next cycle will run through one
  of the nineteen.

The manifest immediately answers questions nothing else in the codebase can:
what breaks if this node is deleted, what must be constructed before that node
can be tested, which nodes are leaves and therefore safe to touch.

## Derive the order; a count is not a topological sort

Initialization order is a **derivation** of the manifest, computed at the point
of use, never a second list maintained beside it. Kahn's algorithm or a
depth-first post-order both produce it in a dozen lines.

The failure worth naming, because it survives review and ships: sorting nodes
by the *number* of dependencies they declare and calling the result a
topological order. On a small graph it agrees with one — leaves have zero,
dependents have more — and it keeps agreeing right up until a node with two
dependencies must be constructed after a node with three. Nothing fails at that
point; the order is simply wrong, in a way that reproduces as the original
symptom, from the code written to cure it. An order that is not a topological
sort is worse than no derived order at all, because it is trusted. If the
derivation is not the actual algorithm, do not name it one.

## The check runs unasked, or it does not run

Cycle detection over a declared graph is a depth-first walk with a recursion
set — fifteen lines, and the least interesting part of this technique. The
whole difficulty is arranging for it to *execute*.

An [optional guard is an absent guard](../../../_laws.md#absent-guard-is-loud).
A validator exported as a function that a test suite may call protects the
codebases whose test suite calls it. Worse, and commoner: a manifest module
that nothing in the application imports. Its load-time assertion is then
perfectly written and never runs, the graph it validates is never read by the
bundler, and the file survives as documentation that reviewers mistake for
enforcement — a green result from a check that read nothing. Put the assertion
on a path the application already evaluates: the module that composes the store
is the natural home, because it is on every startup path by construction.

"Loudly" also has to mean something. A console warning among console warnings
is not a signal. In development a detected cycle should **throw** — a cyclic
singleton graph is not a degraded state the application can proceed from, and
the failure is cheapest at the earliest possible frame. In production the same
check reports rather than throws, because taking down a running application
over a graph property that is already baked into the bundle helps nobody.

## Make the graph inspectable

A function that emits the manifest in a graph-description format costs ten
lines and converts arguments about coupling into a picture two people can point
at. This sounds cosmetic and is not: the reason cross-store coupling is argued
about rather than fixed is that nobody can see it, and the reason nobody can
see it is that reading it means reading every import in the tree. Emit the
graph, and "does this new dependency make it worse" becomes a question with an
answer.

## Surviving partial initialization

A correct order does not close every window. A user can act before the graph
has settled, a code-split chunk can arrive after the surface that needs it, a
development reload can re-evaluate one module against a world the others have
already built. For the edges that must be deferred, the accessor is the
disciplined form of the deferred import: a getter that resolves its target at
**call** time, caches the resolution on first success, bounds its retries, and
records permanent failure rather than retrying forever.

The rules that make it more than a deferred import with extra steps:

- **Resolve at call time, and cache only success.** An accessor that resolves
  eagerly has re-created the edge it was introduced to defer. An accessor that
  caches a failure has converted a startup race into a permanent outage.
- **A bounded retry must not block.** Retrying is legitimate; spinning a
  synchronous wait loop between attempts is not — it converts an initialization
  race into a frozen frame, on the one thread the interface is drawn from, at
  the one moment the user is watching. If the caller cannot yield, the accessor
  answers "not ready" and the caller re-asks on the next tick.
- **"Not ready" and "permanently failed" are different answers.** Collapsing
  both into one absent value is
  [unknown rendered as a definite value](../../../_laws.md#unknown-is-not-a-value):
  every call site then treats a genuine misconfiguration as a transient blip,
  retries an operation that will never succeed, and writes its own log line
  because the accessor's told it nothing it could branch on. Return a
  discriminated answer, and let the caller decide whether to defer or surface.
- **The failure latch names what clears it.** A latch with no reset poisons the
  accessor for the life of the process and forces every test to inherit the
  previous case's verdict — the same reset-hatch obligation
  [singleton-lifecycle](./singleton-lifecycle.md) places on any module-scoped
  service.

Every accessor is an admission that the graph has an edge the order could not
resolve. Two or three of them in a large application are the cost of doing
business; a dozen means the manifest is describing an architecture that wants
restructuring, and the accessors are holding it together.

## When not to reach for this

Below roughly a half-dozen interdependent singletons, the import graph *is* the
manifest and a person can hold it in their head; a declared topology at that
size is ceremony that will drift out of date before it is ever consulted. Three
signals say the threshold has been crossed: somebody has already introduced a
deferred import to break a cycle, the same undefined-at-startup defect has been
fixed twice, or the number of cross-references exceeds what one reviewer can
enumerate from memory.

And the manifest is not a substitute for fixing the cycle. A declared cycle is
still a cycle — the graph does not become acyclic because it is now written
down, and the accessor does not make a two-way dependency correct, only
survivable. The manifest's job is to make it impossible to create one by
accident and impossible to argue about one that exists; the restructuring that
removes it is still [store-slicing](./store-slicing.md)'s work.
