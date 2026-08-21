---
layer: application
type: application
subject: pipeline-stage-modelling
technique: retired-stage-tombstones-and-migration
stack: node
status: forged
verified_on: 2026-08-20
---

# Removing a column as one operation, ordered by which failure is survivable

`app/api/pipeline/stage-migration/route.ts` is the technique's removal door,
and its header comment argues both of the standard's mechanics from first
principles.

## One route, because it is one decision

`:10-15`: its own endpoint rather than a flag on the general config write,
"because the two halves are one decision: *remove this column, and send the
people on it to that one*. Splitting them across two calls would let a client
perform half — which is exactly the stranding this whole phase exists to
prevent."

## Moves first, axis second — the order is the argument

`:17-27` states the ordering rule and, unusually, the reason it cannot be
solved by a transaction: the axis config and the pipeline rows sit behind
separate connections, "so a single transaction cannot span them, and the
order decides what a failure between them looks like":

- moves-then-axis (what it does): "a failed axis write leaves candidates
  already moved to a column that still exists. Odd-looking, fully
  recoverable, nobody lost."
- axis-then-moves: "a failed move leaves candidates on a column the board no
  longer draws. That is the failure mode we are here to eliminate."

The moves themselves are atomic with their audit events — one `IMMEDIATE`
transaction in `migratePipelineStages` — "so the partial state above is the
only one reachable, and it is benign." This is the standard's rule in its
strongest form: where two writes cannot be made atomic, order them so the
reachable partial state is the harmless one, and write down why.

## The destination must exist on the NEW axis

`:41-60`. `removed` is derived by diffing the current axis against the
submitted one rather than trusted from the client, and every entry of the
`migrate` mapping is checked against `nextIds` — the ids of the axis being
written — with the comment stating the trap: "Mapping onto another column
this same edit removes would move candidates from one hole into another."
The refusal is specific (`migrate["X"] targets "Y", which the new pipeline
does not contain.`), not a generic invalid-body error.

## Tombstones

`app/_lib/pipeline-axis.ts:15-21` types the axis as `{ stages, retired }`,
with retired documented as "NOT rendered, but still resolvable, so history and
a stranded candidate can be named rather than shown a raw id."
`docs/features/pipeline/README.md:132-137` states the consequence the standard
demands: a dropped column is moved there rather than deleted, so historical
events and a stranded candidate's stage still resolve to a label; and the
board write path "accepts retired stages too: a candidate standing on one is
somewhere legitimate until a migration moves them, and rejecting the write
would lose the application."

`knownStageIds` (`pipeline-axis.ts:52-58`) is the concrete form — the set a
stored stage value is allowed to hold is live **plus** retired — and
`pipeline-entry-action.ts:177-181` validates a manual move against "THIS
WORKSPACE's board, not the shipped list", listing the acceptable ids in the
error.

## A board-shape move is its own event kind

`docs/features/pipeline/README.md:159-167`: `migratePipelineStages` writes a
`stage_migrated` event per moved candidate carrying from/to — "its own event
kind rather than `moved`: nobody chose to advance *this* candidate — the board
changed shape — and a recruiter reading the trail weeks later needs that
distinction."

Concluded candidates are excluded from the sweep, matching the board's own
listing and per-stage counts: "they are not on the board, so removing their
column strands nobody, and moving them would rewrite closed history." Pinned
by `app/_lib/db/pipeline-stage-migration.test.ts`.

## The validator that bounds what a removal may produce

`app/_lib/decision-config-schema.ts:459-478` is the well-formedness set, and
it is deliberately short: at least two stages (`:461`, "needs at least an
entry and a terminal stage"), exactly one each of `entry` and `terminal`
(`:465`), at most one `offer` (`:470`), the axis must open with entry
(`:477`) and end with terminal (`:478`). `docs/features/pipeline/README.md:125-129`
states the governing principle in the standard's own terms: "the validator
enforces only what the rest of the product resolves through … Everything else
is open — any number of screening stages, interview rounds or `custom`
columns, in any order, under any name."

## Refuse with the count, at the write door

`:62-78` is the standard's step-two verbatim. The server "does not take the
client's word for who is stranded: it recomputes occupancy here. A removal
with occupants and no mapping is refused — the client's Save button is a
courtesy, this is the guarantee." The 409 names each unmapped stage **with its
occupant count** (`unmapped: [{ stage, count }]`), which is the difference
between an actionable refusal and a wall. Occupancy comes from
`countPipelineByStage`, the same count the board renders, so the refusal and
the board cannot disagree — and because that count already excludes concluded
candidates, a column holding only closed-out rows removes without ceremony.

The recomputation is also the re-check the standard asks for at commit: the
count is taken in the same request that applies the change, not carried from
whatever the composer saw when the operator opened it.

## Where it falls short

There is no re-add distinction: a workspace that retires a column and
creates a new one with the same id would have the new stage inherit the
retired one's history, because identity is the id and nothing marks the
generation.
