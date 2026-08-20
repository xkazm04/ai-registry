---
layer: technique
type: technique
subject: remediation-roadmaps
technique: sandbox-to-tracker-commit
status: forged
laws: [identity-survives-reuse, one-validation-door]
shared_with: []
use_when: [letting a reader reorder or deselect generated recommendations, turning a proposed plan into tracked work, a plan surface writes as the user clicks]
---

# Sandbox to tracker commit

The concern: a generated plan is a proposal, and the reader knows things the
generator does not — what is already in flight, what is blocked, what the
next release makes impossible. They must be able to reshape it. But
reshaping and committing have **opposite safety requirements**: exploration
should be free, instant, and reversible; commitment should be deliberate,
explicit, and idempotent. Building one surface that serves both by writing on
every interaction gets both wrong.

## Two phases, one boundary

**Phase one — the sandbox.** The reader reorders items, deselects, adjusts
assumptions, and sees the projected outcome recompute live. Nothing leaves
the artifact. Nothing is written anywhere durable except, at most, a local
draft of the reader's own arrangement. The reader can close the surface and
lose nothing they intended to keep, and — critically — can try an
arrangement they immediately reject without having created any trace in a
shared system.

**Phase two — the commit.** One explicit action turns the current
arrangement into tracked work items. It is a single transition, it names
exactly what it will create, and it is the *only* path from this surface into
the tracker
([one-validation-door](../../_laws.md#one-validation-door)). Every field the
tracker requires is validated here, once, rather than at each of the several
UI affordances that could plausibly have created an item.

Skipping phase one produces plans nobody believes, because the reader had no
chance to apply what they know. Skipping phase two produces trackers full of
items nobody chose, created by exploratory clicks — and a tracker that
accumulates unchosen items is abandoned within weeks.

## The live recomputation is a projection, not a promise

While the reader reorders and deselects, the surface shows the projected
composite for the current selection. Compute it by applying the selected set
to a copy of the inputs and re-running the real scoring function; debounce if
it is expensive. Never sum item claims — the sandbox is exactly where a
summing shortcut is most tempting and most visible when it fails, since the
reader can watch a total exceed the maximum possible score.

The invariant that makes the preview trustworthy is the **empty-selection
identity**: with nothing selected, the sandbox must reproduce the
assessment's own numbers exactly — the composite, every sub-rollup, and any
derived classification, byte for byte. It is the cheapest possible test and
it catches the defect that otherwise ruins the surface, which is a baseline
that silently disagrees with the report the reader just scrolled past. The
disagreement is rarely in the headline number; it hides in a secondary
rollup that took a different code path. A real case worth learning from: a
sub-axis rollup that charged an *absent* dimension as zero at full weight,
while the headline path correctly renormalized over present dimensions only.
With complete inputs the two agreed and every test passed; with one detector
failed, the sandbox's baseline drifted enough to flip a derived
classification. The fix is not a patch to the rollup but a rule: **every
projection path shares the same missing-input policy as the scorer**, and the
identity test runs over a deliberately incomplete fixture as well as a
complete one.

Reordering, by itself, must not change the projected total. If it does, the
model is order-dependent in a way the reader has not been told about, and
either the dependency is real (declare it, and show the sequencing effect
explicitly) or it is a bug in the recomputation.

## Identity is minted at commit, and commit is idempotent

The most expensive defect in this technique is duplicate work items. A reader
commits, the response is slow, they click again; or they return to the report
next week and commit a set that overlaps last week's. Both must be safe.

- **Mint a stable identity per committed item at commit time** and derive it
  from the recommendation's catalog id plus the assessment run — not from its
  row index, its title, or its position in the sandbox list, all of which
  change when the reader reorders
  ([identity-survives-reuse](../../_laws.md#identity-survives-reuse)).
- **Make the commit idempotent on that identity.** A repeat commit of the
  same item updates or no-ops; it does not create a second card. This is a
  server-side property, not a disabled button — the disabled button handles
  the double-click and nothing else.
- **Carry the linkage both ways.** The committed item knows which
  recommendation and which assessment run produced it; the roadmap row knows
  it has been committed and shows that state. Without the back-link, the next
  run cannot tell an already-tracked recommendation from a fresh one and will
  offer it again as though nothing happened.

## Per-item state, and partial failure

Each row moves through a small explicit state machine — proposed, selected,
committing, tracked, failed, dismissed — and the state lives per item, not
per page. This is what makes partial failure reportable: a commit of eight
items where two are rejected by the tracker must leave six tracked and two
visibly failed with their reasons, never a page-level error that leaves the
reader unable to tell what landed. A surface that reports success at the
batch level while writing at the item level will eventually claim a commit
that half happened.

Where rows update optimistically, the rollback must be **targeted**. Capture
the one row's prior state before the write and revert only that row on
failure — never restore a snapshot of the whole list. Snapshot rollback is
correct exactly once, when a single write is in flight; the moment two rows
are changing concurrently, one failure clobbers the sibling's optimistic or
already-confirmed change, and the reader watches a row they successfully
committed silently revert. Keep the list transforms as pure functions so this
invariant can be tested without a rendering environment; it is subtle enough
that it regresses whenever the component is refactored.

The same per-item state is what a later run reads to answer "what did they do
with this last time" — which feeds both the ranking (deprioritize what is
already tracked) and the framing rules (an item declined once does not
reappear identical and unacknowledged).

## Decision rules

- **Persist the sandbox arrangement locally, scoped to the reader and the
  run.** Losing a reorder to a refresh is a small betrayal that teaches
  readers not to invest effort in the surface. Local persistence is not a
  commit and must not be shown as one.
- **Show what commit will do before it does it.** The count, the destination,
  and any item that will be skipped as already tracked. Consent to a plan
  requires knowing its extent.
- **Keep the tracker's shape out of the sandbox.** The sandbox works in
  recommendations; translation into the executor's schema, conventions, and
  acknowledgement protocol is the handoff concern that begins where this one
  ends.

## When not to use it

- **When there is exactly one action and no ordering to choose.** A single
  accept control is the whole interaction; a sandbox around it is ceremony.
- **When the plan is advisory only, with no downstream tracker.** Without a
  commit destination, phase two has no meaning and the surface is a report —
  let it be one rather than adding a button that writes nowhere.
