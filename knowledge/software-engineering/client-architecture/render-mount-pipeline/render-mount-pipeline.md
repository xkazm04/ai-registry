---
layer: golden-path
type: golden-path
subject: render-mount-pipeline
status: forged
use_when: [code rather than the platform decides which elements exist on screen, building or reviewing a virtualized list, a canvas renderer or a native UI runtime, two features disagree about whether an off-screen element must stay mounted, scrolling pays per element instead of per change, the frame thread blocks on a layout another thread already started]
techniques:
  - blueprint-then-mount
  - mount-references-across-features
  - edge-sorted-incremental-mount
  - recycle-by-content-type
  - mount-binders-versus-attach-binders
  - preempt-and-continue-shared-computation
---

# Render and mount pipeline

Most interfaces never meet this subject, because the platform answers its
question for them: the document runtime or the toolkit decides which elements
exist, lays them out, and keeps them alive. This subject applies the moment
**code, not the platform, decides which elements exist** — a virtualized list or
grid, a canvas or terminal renderer, an editor's display list, a native UI
runtime that owns its own host objects. From that moment the product owns a
pipeline the platform used to hide: an immutable description of what should be
shown, a layout that resolves it into positions, a mount pass that turns
positions into host objects, and the machinery that decides, frame by frame,
which of those objects deserve to exist. Every rule below is about keeping
those stages separate, because every defect in the class comes from one stage
reaching into another.

## What this subject owns, and what it does not

It owns the path from description to mounted host object: what the layout
phase emits, when a node earns a host object of its own, who may keep an
element mounted, how mount work is bounded per scroll step and per frame, how
host objects are reused, how an update rebinds retained content, and what a
frame-bound thread does when the layout it needs is already running somewhere
else. It does not own what a surface shows, the data a view fetches, or where
state lives; those belong to the surface subjects, to the fetch cache and to
client state.

The neighbours each own a slice and each stops short in its own words. The
table's [performance](../../ui-surfaces/data-display/table/techniques/performance.md)
ladder windows **rows** with an overscan margin and names what windowing takes
away; it treats the row as the smallest mountable thing and has no model for
several features voting on one element. This subject is what sits under that
ladder's last rung when the product builds the windowing itself, and it goes
below the row. The canvas's
[render-budget](../../ui-surfaces/data-display/canvas-graph/techniques/render-budget.md)
culls to the visible world rectangle and spreads a heavy first frame across
frames in waves; that is a policy for one surface, and it feeds a mount layer
this subject describes. The rule a reader uses: if the question is *which
elements should a surface show and in what order*, it is the surface's; if it is
*how a decided element becomes, stays, or stops being a host object*, it is
this path's.

The chat transcript's
[immutable-model-cached-layout](../../ui-surfaces/shell-and-navigation/chat-transcript/techniques/immutable-model-cached-layout.md)
freezes the model and keeps a per-view layout cache, and its own boundary says
that under a layout-managed toolkit the platform's reconciliation should be the
cache. When the product *is* the toolkit, that reconciliation is this subject.
The accessibility technique
[hidden-but-mounted-inertness](../../ui-surfaces/feedback-and-style/accessibility/techniques/hidden-but-mounted-inertness.md)
says how a mounted-but-unseen subtree is made inert; this path says who decided
it stays mounted, and every feature here that holds an off-screen element
mounted inherits that technique's obligation. Fetch-ahead by viewport
proximity is
[prefetch-and-defer](../client-fetch-cache/techniques/prefetch-and-defer.md):
it warms data, while premounting here warms host objects, and a design that
does both schedules them on the same idle signal without confusing the two.

Deduplication has two owners already.
[single-flight-primitives](../../backend-platform/work-execution/concurrency-guards/techniques/single-flight-primitives.md)
enumerates five honest things a second caller can get, and
[in-flight-dedup](../client-fetch-cache/techniques/in-flight-dedup.md) is the
join policy specialised to client reads. Neither list has a waiter that cannot
afford to wait. A frame thread that joins a layout started elsewhere cannot
block and cannot refuse; it needs a sixth policy — interrupt the running work,
take its partial result, finish it locally — and that policy is only possible
where the work is a pure function over immutable input that can be resumed
from a checkpoint. Both preconditions are produced by this pipeline, which is
why the policy lives here and not beside the other five.

## The pipeline has four stages and one direction

**Describe.** An immutable tree of components, each a bundle of inputs and a
pure function that turns them into more tree. Immutability is not style: it is
what lets the next stage run on any thread.

**Lay out.** Resolve the description, measure it, and collect the result into a
flat, ordered list of **render units** — each with a stable identity, resolved
bounds, the content type it will need, and the binders that will fill it — then
throw the intermediate tree away. Containers that only arrange their children
vanish here. A node becomes a host object of its own only when it declares a
capability that only a host object can provide, and the rule that decides this
is [blueprint-then-mount](./techniques/blueprint-then-mount.md).

**Mount.** Walk the blueprint against the current visible region and place units
into host objects: acquire content from a pool or create it, bind it, apply
bounds. Mount never measures and never walks the discarded layout tree. Because
the blueprint knows every position before anything exists, mount can work at the
granularity of a single leaf — which is what makes the next two stages possible.

**Retain and reuse.** Decide continuously which units stay mounted, rebind what
changed on each new blueprint, and return released content to a pool keyed by
what the content is.

The direction is the invariant. Layout never touches a host object; mount never
computes a position; a feature that wants something mounted says so to the
mount layer and never creates the host object itself. The naive design — lay
out the host tree directly — binds layout to the one thread allowed to touch
host objects, instantiates everything before any position is known, and so
forfeits leaf-granular mounting and recycling in the same stroke.

## Mountedness is a vote, and the count is the ballot box

Several features have legitimate opinions about whether an element exists. The
visibility window wants off-screen elements gone; a running transition needs its
leaving element to stay until the animation ends; focus retention needs the
focused control to survive being scrolled away; a gesture in flight needs its
target. A single boolean owned by any one of them silently breaks the others,
and the breakage looks like a transition that pops or focus that vanishes. The
structure that holds is a **reference count per render unit**, where each
feature acquires and releases only its own references and an element is mounted
exactly while its count is positive:
[mount-references-across-features](./techniques/mount-references-across-features.md).

A web virtualizer that lets the caller return the set of indices to render,
instead of taking the visible range as given, is the userland form of the same
ballot: the visible range is one feature's references, a pinned header or the
focused row is another's, and the hook returns the union. Where that hook is not
used, teams rediscover its absence as "sticky headers work below the
virtualization threshold and stop above it", or as "scroll the focused row into
view cannot reach a row that was never mounted".

## Work proportional to change, not to size

A scroll step changes which elements cross the edges of the visible region, and
nothing else. A mount pass that tests every unit against the new rectangle pays
for the whole tree on every frame of a fling. Sorting units by their leading and
trailing edges once per blueprint, and moving two cursors across only the edges
that crossed, makes the step cost the number of crossings:
[edge-sorted-incremental-mount](./techniques/edge-sorted-incremental-mount.md),
which also owns idle premounting and the memory it spends.

A platform hint that skips layout and paint for off-screen content is not this.
It still creates every element and still reconciles every element on every
update; the work it saves is paint, and the work that grows with history is
creation. The measurement that separates the two is element count against list
length at a fixed viewport — flat means something is mounting incrementally, a
slope means something is only painting incrementally.

## Reuse by what the content is

Once positions are known before instantiation, a pool no longer has to be keyed
by the composite item a list declared. Text content recycles into any other
text; an image surface into any other image surface. A screen with many item
kinds stops allocating on the first appearance of each kind, and allocation
moves out of the frame where it collides with binding and measuring. The pool's
scope, bound, discard path and the stripping that must precede a release are
[recycle-by-content-type](./techniques/recycle-by-content-type.md).

## An update rebinds what moved, on two clocks

A new blueprint whose unit is identical to the mounted one, with equivalent
layout data, runs nothing but a bounds update. Otherwise each binder answers
whether its own inputs changed, and only those unbind and rebind. Binders live on
two clocks: content binding survives the host being detached from the window,
listeners and live subscriptions do not. Collapsing the two clocks either leaks
listeners on detached hosts or re-pays content binding on every attach:
[mount-binders-versus-attach-binders](./techniques/mount-binders-versus-attach-binders.md).

## The frame thread never waits on work it did not start

Layout is requested from more than one place — a background thread when data
arrives, the frame thread when a host is measured — and equivalent requests
should share one computation. The waiters are not equal. A background waiter can
block; an asynchronous one should not wait at all; the frame thread has a
deadline measured in milliseconds and must never block on work running
elsewhere. The resolution — interrupt, hand over a partial result, continue on
the frame thread, and make every other waiter pin or skip accordingly — is
[preempt-and-continue-shared-computation](./techniques/preempt-and-continue-shared-computation.md).

## Failure modes of the naive reading

- **Every node a host object.** Memory, traversal depth and invalidation scope
  all grow with the author's nesting habits instead of with what the interface
  actually needs.
- **Flattening without promotion.** The flat tree ships and a click handler,
  focus stop or accessibility node silently stops existing, because the node that
  carried it was merged into its parent.
- **A mounted flag with one owner.** The feature that owns it wins every
  disagreement, and the others fail intermittently.
- **Per-frame full passes.** Scrolling costs tree size on every frame and the
  profile blames binding, which is merely where the time lands.
- **Pools keyed by item kind.** Heterogeneous screens allocate on every new kind,
  in the frame, and the pool holds content no other kind can use.
- **A frame thread that joins by blocking.** One slow background layout becomes a
  dropped frame on every surface that asked for the same tree.

## The techniques

- [blueprint-then-mount](./techniques/blueprint-then-mount.md) — layout as a pure
  function emitting a flat list of render units; containers vanish; promotion to
  a host object derived from declared host-only capabilities.
- [mount-references-across-features](./techniques/mount-references-across-features.md)
  — reference counts per unit, per-feature ownership, loud misuse, release on
  removal, and the acquire rule for the visibility window.
- [edge-sorted-incremental-mount](./techniques/edge-sorted-incremental-mount.md) —
  two edge-sorted indices and two cursors, cross-axis reinitialisation, nested
  hosts, exclusion, and idle premount with its memory trade.
- [recycle-by-content-type](./techniques/recycle-by-content-type.md) — pool key,
  scope, bound, discard hook, stripping before release, and preallocation.
- [mount-binders-versus-attach-binders](./techniques/mount-binders-versus-attach-binders.md)
  — two bind clocks, per-binder should-update, update order, and fixed binders.
- [preempt-and-continue-shared-computation](./techniques/preempt-and-continue-shared-computation.md)
  — the sixth second-caller policy: one shared layout, three waiter classes, and
  named reasons for every missing result.
