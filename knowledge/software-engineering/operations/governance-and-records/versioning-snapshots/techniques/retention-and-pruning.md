---
layer: technique
type: technique
subject: versioning-snapshots
technique: retention-and-pruning
status: forged
laws: [creation-names-reaper, deletion-is-not-repair]
shared_with: []
use_when: [deciding whether full snapshots are affordable, choosing which versions a janitor may evict, lineage walks dead-ending at pruned parents]
---

# Retention & pruning

Every version created is storage committed forever unless something
deletes it, so the versioning feature is not done until it names its
reaper ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)):
what survives, what gets pruned, on what schedule, by what code. A team
that skipped this decision has still made one — retain everything — and
that default is defensible for longer than intuition suggests, but it
must be *chosen*, with the arithmetic done, not inherited from nobody
having thought about it.

## Do the arithmetic before the engineering

Version storage cost is snapshot size × creation rate × entity count.
For most entity-versioning cases (configurations, prompts, documents of
ordinary size, versioned at human save-rates), that product is small —
full snapshots at every version are affordable for years, and the honest
conclusion of the arithmetic is "retain everything, revisit at 10× the
current volume". The exotic machinery — delta chains, content-addressed
storage, compression — buys real savings only when snapshots are large or
capture is automated and frequent; adopted before the arithmetic demands
it, it trades restore simplicity (read one row) for reconstruction
pipelines (replay a chain) with no benefit to pay for the risk. If
version storage hurts at human save-rates, suspect the capture frequency
or the snapshot scope before the storage engine.

## Pruning preserves the *shape* of history

When pruning is warranted, oldest-first is the wrong rule — it evicts
exactly the states with the most invested meaning. The policy that
matches how history is actually used is **thinning**: keep everything
recent at full density, then progressively sparser survivors going back.
Recency carries detail; antiquity carries milestones.

And some versions are exempt from automatic eviction categorically:

- **Pinned** — a user said "keep this"; the pin is a promise, and a
  janitor that breaks user promises poisons trust in the whole feature.
- **Lifecycle-significant** — the currently active version (obviously),
  every version that was *ever* promoted, and the incumbent a rollback
  might still return to. Pruning the rollback target converts the next
  regression from a pointer-swap into an incident.
- **Referenced** — versions that measurements, comparisons, audit
  records, or lineage edges still point at. Deleting a version that a
  stored verdict cites destroys the evidence while keeping the claim —
  a quiet cousin of
  [deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair). If
  the referencing records matter, the version they cite matters.

The exemptions imply the mechanics: pruning is a *query with guards*,
not an age cutoff — and the guard list is the retention policy's real
content.

**That holds for every reference that exists as a row, and there is one that
does not.** A pin is a row, a promotion is a state, a citation is a foreign
key: each exemption above names something the pruning query can join against.
A reader **in flight right now** — a report halfway through assembling, an
export streaming, an evaluation run walking the history — holds a version that
nothing in the store points at, so no guard can see it and the version prunes
out from under a read already in progress. The failure is invisible in exactly
the way the pinned cases are not: the query was correct, every guard passed,
and a consumer got a hole.

Two mechanisms close it, and the choice between them is not a preference.
Either the store keeps a **registry of live readers** with a low-water mark,
and the reaper never prunes above the oldest version any live reader holds —
the general answer, and the one that costs a distributed handshake; or the
system **bounds how long a reader may live** and never prunes a version
younger than that bound, which converts the obligation into a local one the
reaper can settle alone with a clock. The bound is available where readers are
short and uniform, and unavailable where long readers are legitimate — exports,
reporting, batch evaluation — because there the bound is either violated or so
large it retains everything. So the honest form of the sentence above is that
pruning is a query with guards **over durable references**, and a time bound is
the only instrument that reaches the transient ones. Size the bound to the
longest legitimate reader and make exceeding it an error the reader sees,
rather than a version the reaper takes.

There is a **third mechanism**, and it is the one available precisely where the
time bound is not. Do not track *which* version each reader holds — track only
**whether any reader is in flight at all**, and defer the entire prune pass
while that count is non-zero. One counter, no per-version handshake, no bound
on how long a reader may live, so it never asks a legitimate long reader to be
short. It is strictly coarser than the registry: it gives up the ability to
prune anything during a long read, and buys the whole obligation for an atomic
increment. Where reads are bursty and pruning is not urgent, that trade is the
cheap one, and a janitor that skips a pass costs nothing.

Two clauses come with any live-reader mechanism, whether it is the registry or
the activity gate, and both are the difference between a repair and a new bug:

- **It owes a harm bound and a deferral count.** A reader that never ends pins
  the low-water mark forever, and a gate that always sees traffic defers
  forever. Both convert a data-loss bug into a silent no-maintenance bug, which
  is quieter and therefore worse. Give the pass a bound past which it runs
  anyway and says so, and count the deferrals — otherwise "the reaper never
  runs" becomes folklore instead of a number, and the disk fills while every
  guard reports healthy.
- **Where the reader registers decides which readers exist.** Registering at
  the transport's response boundary is the natural place and it is blind to the
  two readers that most need covering: a **streaming body**, whose store access
  happens entirely after the response head is sent, and a **cursor walk across
  requests**, which is one logical read that is absent from the process between
  its pages. The discriminator is whether the reader holds a connection while
  it reads, and neither of those does. **Register at the store touch, not at
  the response.**

This gap stays hidden under the default this technique otherwise recommends.
Where the arithmetic says retain everything, both obligations are satisfied for
free and no one meets the reader problem. It opens when version creation moves
from human save-rates to machine rates, which is the point at which pruning
starts running often enough to overlap a read.

## Lineage survives the pruned node

Thinning creates holes in parent chains: v6's parent v5 is pruned, and a
naive walk up the lineage now dead-ends. Decide the repair at
design time: either **splice** (the pruned node's children re-parent to
its parent, with a "via pruned v5" annotation preserving honesty) or
**tombstone** (a minimal row survives — identity, lineage edges,
label — while the heavy snapshot content is dropped). Tombstoning is
usually the better trade: identity and history are tiny; it is the
*content* that costs, and keeping the skeleton means numbers stay
gap-explained, lineage stays walkable, and cited ids keep resolving even
after their content is gone.

## The deletion contract: does history outlive its subject?

One retention question is asked once, at schema time, and is unanswerable
later: when the *entity* is deleted, what happens to its versions? Two
defensible contracts — **cascade** (the history is meaningless without
its subject and dies with it; right for working history, wrong wherever
audit obligations attach) or **survive** (the history outlives the
entity, and then it needs an owner of its own: a registered sweep for
orphans, a retention clock, an access path that does not route through
the dead parent). The indefensible contract is the unstated one: version
rows with neither a cascade nor a named orphan-reaper are an orphan farm
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)) — they
accumulate exactly as fast as entities are deleted, and no query ever
shows them again.

## Pruning is a lifecycle event, not a disappearance

Versions vanishing without trace read as data loss to the user who
remembers saving them. The retention policy is stated where versions are
shown ("keeping the last N, dailies beyond"), pruning is logged, and —
the checkpoint-scale rule holds at durable scale too — anything a user
explicitly kept is deleted only by a user action with the version's name
on it.

## Prohibitions

1. No versioning feature without a declared retention policy — even if
   the declaration is "retain everything, revisit at threshold X".
2. No storage sophistication (deltas, chains, dedup) before the
   arithmetic shows full snapshots failing.
3. No automatic eviction of pinned, promoted-ever, active, or
   rollback-target versions.
4. No pruning of a version still cited by measurements, audits, or
   lineage — or prune to a tombstone that keeps the citations
   resolvable.
5. No silent pruning — the policy is visible, and its actions are
   logged.
6. No version store without a declared deletion contract — cascade with
   the subject, or survive it with a named orphan-reaper.
