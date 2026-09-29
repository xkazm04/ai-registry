---
layer: application
type: application
subject: pipeline-stage-modelling
technique: retired-stage-tombstones-and-migration
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
---

# Removing a column as one operation, ordered by which failure is survivable

`app/api/pipeline/stage-migration/route.ts` is the technique's removal door,
and its header comment argues both of the standard's mechanics from first
principles.

## One route, because it is one decision

`:12-17`: its own endpoint rather than a flag on the general config write,
"because the two halves are one decision: *remove this column, and send the
people on it to that one*. Splitting them across two calls would let a client
perform half — which is exactly the stranding this whole phase exists to
prevent."

## Moves first, axis second — the order is the argument

`:19-29` states the ordering rule and, unusually, the reason it cannot be
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

`:80-107`. `removed` is derived by diffing the current axis against the
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
the pipeline README's `retired` paragraph (`:168-173`) states the consequence the standard
demands: a dropped column is moved there rather than deleted, so historical
events and a stranded candidate's stage still resolve to a label; and the
board write path "accepts retired stages too: a candidate standing on one is
somewhere legitimate until a migration moves them, and rejecting the write
would lose the application."

`knownStageIds` (`pipeline-axis.ts:57-62`) is the concrete form — the set a
stored stage value is allowed to hold is live **plus** retired — and
`pipeline-entry-action.ts:337-342` validates a manual move against "THIS
WORKSPACE's board, not the shipped list", listing the acceptable ids in the
error.

## A board-shape move is its own event kind

the README's `stage_migrated` section (`:205-218`): `migratePipelineStages` writes a
`stage_migrated` event per moved candidate carrying from/to — "its own event
kind rather than `moved`: nobody chose to advance *this* candidate — the board
changed shape — and a recruiter reading the trail weeks later needs that
distinction."

Concluded candidates are excluded from the sweep, matching the board's own
listing and per-stage counts: "they are not on the board, so removing their
column strands nobody, and moving them would rewrite closed history." Pinned
by `app/_lib/db/pipeline-stage-migration.test.ts`.

## The validator that bounds what a removal may produce

`app/_lib/decision-config-schema.ts:505-542` is the well-formedness set, and
it is deliberately short: at least two stages (`:525`, "needs at least an
entry and a terminal stage"), exactly one each of `entry` and `terminal`
(`:527-530`), at most one `offer` (`:534`), the axis must open with entry
(`:541`) and end with terminal (`:542`). the README (`:162-166`)
states the governing principle in the standard's own terms: "the validator
enforces only what the rest of the product resolves through … Everything else
is open — any number of screening stages, interview rounds or `custom`
columns, in any order, under any name."

## Refuse with the count, at the write door

`:109-119` is the standard's step-two verbatim. The server "does not take the
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

## What the door grew after the first reading

Four guards now sit in front of the same two writes (`route.ts:48-131`); none
is in the technique's five steps, and each answers a failure the ordering
argument alone does not.

- **A source must be a column the new axis drops** (`:91-100`). A mapping
  whose `fromStage` the new axis keeps is refused with `source_kept`: it "would
  silently empty a live column (and answer `removed: []` while doing it)".
  Sources may be columns already retired that still hold stranded candidates,
  so the same door repairs an earlier bad removal.
- **The axis the client read is checked before anybody moves** (`:68-79`).
  `expectedUpdatedAt` is compared with the stored version and a mismatch
  answers `PIPELINE_AXIS_STALE` (409), because a mapping written against a
  board someone else has since reshaped may name ids that no longer exist. The
  token is re-asserted inside `setDecisionConfig` under the store's write lock
  (`:126-130`), so a concurrent save between the check and the write is caught
  by the second half of the pair rather than clobbered. That second refusal
  arrives after the moves, so it is the benign partial state the ordering
  argument describes and not a clean no; only the first check refuses before
  anybody moves. Between `:77` and `:130` every call is synchronous, so in one
  process nothing can interleave there and the pair matters across processes. The check is opt-in: the
  first-run wizard composes an axis from nothing and sends no token.
- **The refusal is data, not prose.** Every refusal is a code with fields
  (`PIPELINE_MIGRATION_REQUIRED` carries `unmapped: [{ stage, count }]`); the
  validator's English rides as `detail` and "must never be the thing the UI
  paints" (`:61-64`).
- **The write is a recruiter operation** (`:51-57`): `pipeline:write` is asked
  of the seat, because the operator check "proves a trusted session is present"
  and in open mode that is true for everyone. A viewer is refused with a code
  instead of moving candidates.

The rate limit (`:121`, 20 per 10 minutes) is placed after every cheap refusal,
so a malformed mapping costs no budget. And the failure message was corrected
against the ordering: `STAGE_MIGRATION_FAILED` used to read "Nothing was
saved", "the opposite of what this order guarantees", because a throw from
`setDecisionConfig` lands with the candidates already moved. It now says people
may have moved and points at the step editor. The ordering was right; the
sentence describing it to the operator was wrong until someone read them side
by side.

## Where it falls short

The validator refuses a stage id that is both live and retired
(`decision-config-schema.ts:549-551`, "`pipeline_entries.stage` would then
resolve to two different columns depending on which list was consulted"), which
closes the worst reading of re-adding a column: a new stage cannot silently
share a tombstone's id. What it does not do is mark the generation. Dropping the
tombstone from `retired` and re-creating the id is accepted, and the new stage
then inherits the old one's history, because identity is the id. That path
runs through the composer, which this reading did not open, so it is unverified
whether the composer offers it.
