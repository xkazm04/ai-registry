---
layer: technique
type: technique
subject: pipeline-stage-modelling
technique: retired-stage-tombstones-and-migration
status: forged
laws: [a-candidates-process-never-stalls-on-your-constraints, say-only-what-the-record-holds, every-decision-names-its-actor]
shared_with: []
use_when: [removing or merging a pipeline stage, changing a board that already holds candidates, keeping historical hiring records readable after a board edit]
---

# Retired-stage tombstones and migration

Adding a stage is safe. Renaming is free. **Removing** is a migration, and it
is the only board edit that can strand a person. The discipline has two
halves: move the occupants *before* rewriting the axis, and keep the removed
stage resolvable *forever* for everything that already refers to it.

## Half one: nobody gets stranded silently

The removal flow, in order, with the refusal points:

1. **Count the occupants.** Every candidate currently in the stage, including
   ones filtered out of the default board view — archived, on hold, flagged.
   A count taken from the visible board undercounts and the invisible
   remainder is exactly who gets stranded.
2. **Refuse the removal while the count is non-zero**, and say the count.
   "This stage holds 7 candidates" is actionable; a generic "cannot delete"
   is not.
3. **Offer the move, do not perform it.** Where those candidates belong is a
   hiring judgment: some of the people in a discontinued *Take-home* column
   are ready for interview and some should never have been there. Present the
   destination choice; let a human make it, per candidate or in reviewed
   batches. An automatic sweep into the nearest stage is a set of decisions
   nobody made, attributed to nobody.
4. **Re-check at commit.** The board and its occupants may have moved while
   the human was choosing. A removal that validated against a stale count
   deletes a stage someone just used.
5. **Only then rewrite the axis**, and only as a retirement, never an
   erasure.

Three mechanics that decide whether the flow actually holds:

- **The shape change and the moves are ONE operation.** "Remove this column,
  and send the people on it to that one" is a single decision, and splitting
  it across two calls lets a client perform half — which is precisely the
  stranding the whole discipline exists to prevent.
- **Move the candidates first, rewrite the axis second.** The two writes may
  not be able to share a transaction, so the order chooses which partial
  failure you get. Moves-then-axis fails to candidates sitting on a column
  that still exists: odd-looking, fully recoverable, nobody lost.
  Axis-then-moves fails to candidates standing on a column the board no
  longer draws — the exact outcome being eliminated. When you cannot make two
  writes atomic, order them so the reachable partial state is the benign one.
- **A migration destination must exist on the NEW axis.** Mapping the
  occupants of one removed column onto another column the same edit removes
  moves people from one hole into another, and validates cleanly against the
  board that is about to stop existing.

The reason for the refusal rather than a warning is the failure it prevents:
a candidate whose stage no longer exists is not visible on any board, does
not appear in any stage-scoped query, ages in no view, and is discovered
weeks later — a stall caused purely by a configuration edit
([a candidate's process never stalls on your constraints](../../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)).

## Half two: the tombstone

A stage that has ever held a candidate or been named in a record is never
hard-deleted. It is **retired**: removed from the live axis, excluded from
board rendering, move menus and current-state metrics, and kept fully
resolvable by identity, with its label, its role and its last position
preserved.

What the tombstone is for:

- **History renders correctly.** An audit trail saying a candidate moved from
  one stage to another must still name both stages a year later, in the words
  the record actually holds
  ([say only what the record holds](../../../_laws.md#say-only-what-the-record-holds)).
  A trail that renders a removed stage as a blank, an identifier or
  "unknown" has destroyed evidence about a decision — and hiring decisions
  are exactly the ones that get asked about long after the board changed.
- **Historical metrics stay computable.** Conversion through a stage that
  existed last quarter is a real question about a real quarter. The
  tombstone's preserved role and position let the old cohort be resolved on
  the axis it actually traversed, which is the same discipline as scoring a
  verdict under the rubric that produced it rather than under today's.
- **Stale references resolve rather than error.** A link, a saved filter or
  an integration naming a retired stage gets a real answer — "this stage was
  retired" — instead of a not-found, which is the input the recovery
  technique needs.
- **Re-adding is honest.** A team that removes a stage and adds one with the
  same name has created a *new* stage. It does not inherit the retired one's
  history, and merging them silently would attribute old passages to a
  boundary that did not exist.

## A board-shape move is its own kind of event

A migration move is recorded, but **not as an ordinary stage change**. Nobody
decided to advance this candidate; the board changed shape underneath them.
Give it its own event kind, carrying both the origin and destination stage, so
a recruiter reading the trail weeks later can tell "we moved them along"
from "their column was deleted". Filed as an ordinary move, a mass migration
reads as a burst of hiring decisions nobody made — and it will be read that
way by the person auditing how a candidate was treated
([every consequential decision names its actor](../../../_laws.md#every-decision-names-its-actor)).

Candidates whose process has already concluded are excluded from the
migration entirely. They are not on the board, so removing their column
strands nobody, and moving them would rewrite closed history.

## Merging and splitting

Merging two stages is a removal plus a migration and should be run as one:
occupants of the absorbed stage are placed by a human, the absorbed stage is
retired, and historical rows keep pointing at the retired identity rather
than being rewritten to the survivor. **Never rewrite history rows to the new
shape.** A candidate who passed through a stage that no longer exists passed
through it; restating their path in today's vocabulary is a fabricated
record, and it silently changes every historical dwell and conversion figure.

Splitting one stage into two is additive for the future and inert for the
past. The old stage keeps its identity; the new one starts empty. Resist the
urge to retroactively distribute past occupants between the two — there is no
evidence about which side they would have been on.

## Decision rules

- When a stage has occupants, refuse the removal and name the count.
- When a stage has history but no occupants, retire it rather than deleting
  it, and confirm — the team should know history is preserved, or they will
  ask why the column is still in last quarter's report.
- When a stage has neither occupants nor history — created by mistake five
  minutes ago — a hard delete is fine and is the only case where it is.
- When the destination for migrating occupants is obvious to the system but
  consequential for the candidate, still ask. Suggest a default by role and
  position; require the human to accept it.
- When a retired stage's role would change the gate or an invariant, it does
  not: retired stages are outside the live axis for every forward-looking
  computation, and inside it for every historical one.
- When someone asks to purge a retired stage for tidiness, refuse unless the
  underlying records are themselves being purged under a retention policy.
  The tombstone's cost is one row; its absence costs an audit answer.

## When not to use this

Do not run the full ceremony for a board that has never been used. A team
setting up their pipeline for the first time will add and remove columns
freely, and a system that demands migration decisions for empty stages
teaches them to fear the editor. The presence of occupants or history is the
trigger; absent both, get out of the way.

Do not use tombstones as a substitute for a retention policy. A retired stage
keeps a *stage* resolvable; it says nothing about how long candidate records
themselves may be kept, which is the consent-and-retention discipline's call
and overrides tidiness in the other direction.
