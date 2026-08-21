---
layer: technique
type: technique
subject: pipeline-authoring
technique: step-identity-stability
status: forged
stage: team
laws: [identity-survives-reuse, count-carries-predicate]
shared_with: []
use_when: [adding dependency edges between steps, a retried step ran twice, asking whether a lane got slower]
---

# Step identity stability

Every unit of work in a plan carries an identifier that is chosen deliberately, derived from
what the unit *is*, and stable from one run to the next. The delivery system will invent one
if you do not — from the display name, from the position in the list, from a hash of the
command — and every invented identifier breaks under an operation the plan will actually
undergo.

## What depends on it

Three mechanisms, and each of them fails silently rather than loudly, which is why this gets
skipped.

**Ordering.** Dependency edges reference other units by identifier. An edge that resolves by
position is correct until somebody inserts a unit above it, at which point the edge points at
different work and the plan still runs — in the wrong order, producing a defect that looks
like a race condition.

**Idempotency under retry.** A step that submits work can be retried. If the submitted units
carry stable identity, the delivery system can recognize the second submission as a duplicate
and refuse it. If they do not, the run executes everything twice, and the visible symptom is
a slow build rather than a duplicated deployment.

**Comparability across runs.** "Has this lane got slower since the spring", "how often does
this check fail", "which lane is the tail on every build" — every one of those is a query over
a unit's history, and a unit has history only if it has been the same entity throughout. Per
[count-carries-predicate](../../../../_laws.md#count-carries-predicate), a duration or a
failure rate attributed to a unit is meaningless unless the unit it is attributed to is stably
identified; otherwise the number is an average over a set nobody can name.

## Minting the identifier

Per [identity-survives-reuse](../../../../_laws.md#identity-survives-reuse), identity is minted
once, from properties intrinsic to the unit:

- **Derive it from the unit's role**, not its content and not its place. A lane that lints one
  deliverable is named for the deliverable and the check. Renaming the display label must not
  change it; reordering the plan must not change it.
- **Never derive it from position.** Index-based identity is the canonical failure and it is
  invisible in review, because the plan looks fine.
- **Never derive it from the command text.** Hashing the command makes identity change every
  time someone adds a flag, which silently resets the unit's whole history at the moment
  somebody was about to look at it.
- **Never derive it from a timestamp or a run number.** That guarantees uniqueness and
  destroys the only property that mattered.
- **Keep it stable across a rename.** When a deliverable is renamed, decide explicitly: either
  the identifier follows the rename (and the history breaks, knowingly, once) or it does not
  (and the identifier is now a legacy name that a comment must explain). Both are defensible.
  Doing it accidentally is not.

## When identity legitimately varies

Some units exist per-dimension: one per deliverable, one per platform, one per matrix cell.
These have *composite* identity, not unstable identity.

- Compose the identifier from the dimension values in a fixed order: role plus dimension plus
  dimension. The composition rule is written down once and used everywhere.
- The dimension values come from a declared source — a manifest, a discovered set of
  deliverables — and that source is itself stable. A matrix built from a directory listing
  acquires a new identifier the day someone adds a directory, which is correct; it must not
  acquire new identifiers for *existing* cells, which is what happens when the listing order
  leaks into the identifier.
- A cell that disappears has its history end, not transfer. Reusing a retired identifier for
  different work is the one case where stable identity is actively harmful — the history now
  describes two different things and nothing marks the seam.

## Collisions

Two units with one identifier is a defect, not a warning. Detect it in the generator, where
the whole plan is in hand, and fail there — a collision detected by the delivery system
arrives as a rejection with no context, and a collision not detected at all arrives as one
unit silently displacing another. This is the same one-door argument the plan's schema check
makes: the generator is the only place that sees every unit at once.

## Decision rules

- Every unit carries an explicit identifier; none is left to be inferred.
- Identity derives from role and declared dimensions, never from position, command text,
  timestamp, or run number.
- Composite identity uses one written composition rule, applied everywhere.
- The generator detects collisions and fails on them.
- A rename either carries identity or breaks it, deliberately and with a note; never by
  accident.
- A retired identifier is never reused for different work.
