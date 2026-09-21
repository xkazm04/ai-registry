---
subject: render-mount-pipeline
domain: software-engineering
last_touched: 2026-09-14
dry_streak: 0
---

# render-mount-pipeline

First touch: [[2026-09-14-litho]] — an intake against a first-party declarative UI
runtime (a system repository, design-deep). Class: NEW (forged 2026-09-14 in the same
session that mined it, six techniques, seven applications).

## State

The subject exists because the corpus had UI *surfaces* and no engine under them. Ten
design decisions came out of one tree; four had no subject modelling their forces and
seven shared one home-if-new, so both routing clauses fired on the same cluster and the
forge was mechanical rather than a judgment call.

Its stated job: **code, not the platform, decides which elements exist.** That is the
line that keeps it out of the surface subjects — a virtualizer, a canvas renderer, a
terminal renderer or a native runtime is in scope; a list the document runtime mounts
for you is not.

Six techniques:

- `blueprint-then-mount` — layout emits an immutable flat list of units with resolved
  bounds and no host objects; containers vanish; a node is promoted to a host object
  only when it declares a host-only capability, through **one** predicate.
- `mount-references-across-features` — mountedness is a reference count; each feature
  acquires and releases its own claim and can see nobody else's.
- `edge-sorted-incremental-mount` — leaf granularity, two edge-sorted cursors, work
  proportional to what crossed; premount in frame gaps and what it costs.
- `recycle-by-content-type` — pools keyed by leaf content type, scoped to the owning
  context's life.
- `mount-binders-versus-attach-binders` — two binding lifetimes, per-binder
  should-update, undo that receives what the bind produced.
- `preempt-and-continue-shared-computation` — a deadline-bound waiter interrupts the
  shared computation and continues it from the partial result.

## Boundaries drawn at forge time

Against `table/performance` (rows, not leaves), `canvas-graph/render-budget` (per-surface
culling and first-frame waves), `chat-transcript/immutable-model-cached-layout` (whose
own boundary defers to "the platform's own reconciliation" — this subject is what sits
under that sentence when the product IS the platform), `accessibility/hidden-but-mounted-inertness`
(how hidden content is made inert, not who decides mountedness), and
`concurrency-guards/single-flight-primitives`.

**The single-flight boundary is the live one.** That technique enumerates five
second-caller policies; the sixth — a waiter that cannot afford to wait takes the work
over and finishes it — is stated here in prose and was deliberately NOT written into
that file: the edit would rewrite a standing sentence, so the run banked it untriaged
(G3/R2/C1) rather than auto-accept it. A later run with a second sighting should make
that amendment.

## 2026-09-14 — /intake `litho` (run `intake-litho`)

Applied the same day into personas: the trace waterfall's virtualized rows had exactly
the defect `mount-references-across-features` predicts — the window was the only feature
with an opinion, so a focused span toggle was unmounted under the user and focus fell to
the document body. Fix shipped (`d0709a8f2`) as a second claim on the row, keyed by span
id. The seam was chosen to falsify: the product's other virtualized list runs its
keyboard cursor on one global listener, where the technique would have bought nothing.

Two upward lessons came from fleet code rather than the source: a virtualized list that
gives up sticky headers above its threshold, and the observation that skipping paint for
off-screen content still pays element creation.

Open at close: five techniques have no fleet row (no fleet project owns a renderer,
a blueprint pass or a content pool), and two deviations recorded in the source
applications — a second copy of the promotion predicate, and content-listener stripping
behind a default-off flag.
