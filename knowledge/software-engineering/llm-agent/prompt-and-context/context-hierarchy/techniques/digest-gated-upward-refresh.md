---
layer: technique
type: technique
subject: context-hierarchy
technique: digest-gated-upward-refresh
status: forged
laws: [derivation-names-recomputation, unknown-is-not-a-value, silent-state-is-ungoverned]
shared_with: []
use_when: [a child summary was regenerated and the question is whether its ancestors must be, every leaf edit regenerates every ancestor, a wide node's summary lags and nobody can say by how much, a write into the tree returns complete while the summaries above it are still stale]
---

# Digest-gated upward refresh

Every tier above the leaf is compiled from the tiers below it, and content changes.
[lane-reconciliation](../../agent-memory/techniques/lane-reconciliation.md) states the
doctrine for any compiled lane: the recompilation trigger is *accumulated input*, not
the clock; the clock serves only as a floor and a staleness release; and a read during
a recompile gets a stated thing. This technique does not restate that. It supplies what
the doctrine leaves open for a summary tree — **what counts as accumulated input at
each level**, and what a level does when the count is reached.

## Unconditional bubbling, and why it is the wrong first draft

The first implementation of any summary tree refreshes the parent after every
successful child regeneration, and its parent after that, to the root. It is simple,
it is eventually consistent, and it has an admitted cost that shows up as a bill: one
leaf edit at depth six regenerates six overviews, and a hot directory edited a hundred
times a day regenerates its ancestors a hundred times, mostly to bodies that come out
byte-identical to what they replaced. The tree is not wrong under this policy. It is
expensive in proportion to depth times edit rate, which is the product that grows
fastest in exactly the trees worth building this for.

The fix is not a schedule. A schedule replaces "too often" with "current as of a date
nobody recorded", which the doctrine already forbids. The fix is to ask, at each level,
whether the parent's *input* changed.

## What a parent consumes is what the gate hashes

[per-node-summary-tiers](./per-node-summary-tiers.md) fixed the inputs: a parent's
overview is generated from its children's **abstract bodies** — not their overviews,
not their metadata. That makes the gate precise. When a child's tiers are regenerated:

1. Read the child's old abstract body before generation; take the new one after.
2. Normalise both — line endings, surrounding whitespace — and hash the normalised
   text. Front matter, freshness counters, provenance, generator identity and storage
   timestamps are all outside the hash, because none of them is consumed by the parent.
3. If the digests are equal, the parent's input did not change. Do not mark the
   parent, do not enqueue it; propagation ends at this level.
4. If they differ, report one direct-child change to the parent.
5. If the old abstract does not exist or cannot be parsed, **treat the child as
   changed.** An unreadable baseline is not an unchanged one; rendering "we could not
   compare" as "nothing changed" is the exact laundering
   [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) names, and it
   fails in the direction that leaves the tree stale.

Whether the child's *overview* changed decides only the child's own write-back and
re-vectorisation. It never decides whether the ancestors run, because no ancestor reads
it.

Direct file changes are simpler and deliberately less precise: a file added, deleted or
modified under a node is one change to that node, without comparing old and new file
summaries first. Comparing would move the summarisation work forward into the
scheduling decision, which is the cost the policy exists to avoid. The asymmetry is
intentional — the digest gate is cheap where the baseline already exists and is
skipped where producing one would cost a model call.

## Small nodes refresh now; wide nodes accumulate to a ratio

A change that passed the gate reaches a parent, and the parent's answer depends on its
width. The boundary is the same number the summariser uses as its reading limit:

- A parent with **at most** that many children reads all of them anyway, so a refresh
  costs one bounded generation and there is nothing to batch. Refresh now.
- A parent with **more** children than the limit is summarised from a sample, one
  changed child among a hundred and sixty-one rarely changes the sample's story, and
  refreshing on every change would regenerate the widest nodes most often. Increment
  the node's pending-change count; refresh when the pending count divided by the last
  recorded total crosses a stated ratio — a tenth is a defensible first value.

Three rules about that count, each chosen for cheapness and each an admitted
approximation:

- It counts **events, not unique children**. A hot child changed ten times counts ten.
  This over-estimates conservatively — it can trigger a refresh early, never late — and
  it saves the tree from persisting a changed-child set with its own truncation and
  identity problems.
- Additions, deletions and modifications are equal. Weighting them is a second
  version's question, once real pending distributions have been observed.
- The denominator is the total recorded at the **last successful generation**, not the
  live child count. Additions and deletions make them disagree briefly; the next
  refresh re-lists the node and corrects both.

The whole decision is a pure function of six inputs — did the abstract change, is
there a baseline, the recorded total, the pending count before, the change count now,
and the two thresholds — returning one of three actions. Keep it pure and keep it in
one place; the callers that record file changes, the caller that finishes a child
regeneration, and the administrative refresh all consult the same function, and a
policy spread across them is a policy minus the caller added next quarter.

## The three outputs, and who is allowed to bypass them

The function returns **no-op**, **mark pending**, or **refresh now**, in that order of
precedence, and the ordering matters:

| condition | action | reason |
| --- | --- | --- |
| the child's abstract digest is unchanged | no-op | the parent's input did not change |
| the parent has no valid baseline | refresh now | there is nothing to be stale relative to |
| first import, or an explicit refresh of this node | refresh now | the caller's intent is not silently deferred |
| the parent's recorded total is within the reading limit | refresh now | a small node refreshes in one bounded call |
| a wide parent's ratio is below the threshold | mark pending | update the counter, enqueue nothing |
| a wide parent's ratio reaches the threshold | refresh now | one bounded aggregation of the whole node |

The bypass row is narrower than it looks. An explicit refresh bypasses the threshold
**for the node it was requested on**, not for every ancestor reached afterwards; the
ancestors go through the gate like any other propagation. Without that restriction an
explicit refresh of one leaf directory becomes an unconditional bubble to the root,
and the policy has an escape hatch that every impatient caller learns.

Marking and deciding happen under one lease on the parent's summary files: read the
pending count, add the current change count, write it back, decide on the written
value, release, and only then enqueue. Concurrent children reporting at once then add
rather than overwrite, and the counter the decision used is the counter that was
stored. A refresh that starts captures the pending count at its start and consumes
only that; changes arriving during generation stay pending for the next one.

## A threshold refresh regenerates the node, not the last change

When a wide node crosses its ratio, the queued task cannot be "apply the last change"
— the deferred changes were counted, not recorded, so only the last one has an
address. The task is a **bounded full aggregation of the node from its current
state**: re-list the direct children, take the sample per
[stable-sampling-for-wide-nodes](./stable-sampling-for-wide-nodes.md), read or generate
summaries for the sampled inputs only, generate the overview, extract the abstract,
write the new total, sampled and unsampled counts, and consume the pending count that
was observed at the start. "Full" means the decision restarts from the node's current
listing; it does not mean every child's content is read. If the regenerated abstract
hashes equal to the old one, propagation stops here and the grandparent is not touched.

## What a write is told

A file write into the tree used to return one status; now the file's own indexing and
its ancestors' summaries can be in different states, and collapsing them is
[silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned) at the API
boundary. When the policy marked a parent pending and enqueued nothing, the response
says the summary work was **deferred** and names the node it was deferred at. It does
not say complete, because the summaries are not, and it does not say queued, because
nothing was. The file's own vectorisation status is reported separately — deferring
the parent's overview must never cost a changed file its own index entry.

The pending count is also *readable*: it lives in the parent's summary metadata, so a
consumer reading an overview can see that it is known to lag and by how many
direct-child changes. The counter is not audit data — it over-counts hot children by
design — but it converts "this summary might be stale" from a suspicion into a number.

## The admitted failure on both sides

Both policies fail, and a first version should say which failure it chose. Unconditional
bubbling fails by cost: amplification up hot, deep paths. The ratio gate fails by
staleness: a node with three changed children of a hundred and sixty-one never
reaches a tenth and stays pending indefinitely, refreshed only by an explicit request,
a re-import, or some unrelated child's change tipping the ratio. A first version can
choose the second failure and decline to bolt on a maximum-staleness clock, a periodic
sweep, or a dirty-node registry — provided it says so, and provided the decision to add
the clock later is gated on an observed pending distribution rather than on a guess.
That is the doctrine's "clock as a floor and a release" applied honestly: the floor is
owed, but not before anyone has measured how far below it the tree actually sits.

Every tier this technique refreshes is a stored derivation, and per
[derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)
the refresh path is named and invokable — the explicit refresh in the bypass row is
that path, and a tree without it has a stale summary with no arbiter.

## When not to use it

A tree that is rebuilt whole on every deploy — a documentation site, a corpus imported
nightly from a system of record — has one trigger, the rebuild, and gains nothing from
per-level gating; the doctrine's "accumulated input" is the whole import.

A tree whose interior nodes are all narrow — never more children than the summariser
reads — needs the digest gate and not the ratio gate; every parent falls in the
refresh-now row, and the threshold configuration is a knob that never fires. Ship the
gate, skip the ratio, and revisit when the first wide node appears.
