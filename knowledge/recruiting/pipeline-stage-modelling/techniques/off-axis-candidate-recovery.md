---
layer: technique
type: technique
subject: pipeline-stage-modelling
technique: off-axis-candidate-recovery
status: forged
laws: [a-candidates-process-never-stalls-on-your-constraints, absence-of-evidence-is-not-evidence, say-only-what-the-record-holds]
shared_with: []
use_when: [a link or filter names a stage this board does not have, a candidate sits in a stage that is retired or unresolvable, importing candidates from another team's pipeline]
---

# Off-axis candidate recovery

An editable axis guarantees that something will eventually reference a stage
this board does not have: a link mailed last month, a saved filter, an
imported candidate carrying another team's stage, a bookmark from before a
merge, a record whose stage was retired. The reference is not corrupt — it
was correct when it was written. What matters is what happens next.

**Never silently succeed, never silently fail.** Show the reference, say
plainly that it is not on this board, and offer the way back. The failure
mode this prevents is a person disappearing from their own recruiter's view
because of a configuration edit
([a candidate's process never stalls on your constraints](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)).

## The two shapes of off-axis

They need different handling and are frequently confused.

**A stale reference** — a link, filter or query naming a stage. Nobody is
stuck; a view is wrong. Handle at render: show the board, show an explicit
notice that the requested stage is not on this axis, and offer a one-click
way out. Do not redirect to a "nearest" stage as though the request had been
honoured — a recruiter who followed a link to a screening view and lands
silently on interviews will read the wrong candidates as the right ones.

Two refinements that are easy to get backwards:

- **Keep the filter applied.** The instinct is to drop a filter that cannot
  be honoured, which renders the board *unfiltered* — indistinguishable from
  "this filter matched everything" and far more misleading than an empty
  result. Hold the filter, say it does not name a column here, and let the
  candidates still standing on the dropped column surface as themselves,
  which is what the stale link was pointing at.
- **Wait until you can actually know.** "Not on this board" is a definite
  claim and requires the resolved axis in hand. Rendering the notice before
  the axis arrives makes it flash and retract on every load, which teaches
  people to ignore it. Unknown-yet and off-board are different states, and
  only the second gets a notice.

**An off-axis occupant** — a candidate whose current stage is retired,
belongs to another team's axis, or does not resolve. A person *is* stuck.
Handle at query time: they must appear, marked as needing placement, in
whatever view their recruiter actually looks at. The bug is always the same —
a board query that joins on live stages drops them, so the interface is
internally consistent and one person is invisible.

## The recovery affordance

What "offer the way back" means concretely:

- **Name what was asked for**, in the words of the record. If the reference
  carries a retired stage's preserved label, use it: "this board has no stage
  called X" is legible; "invalid stage" teaches nothing
  ([say only what the record holds](../../_laws.md#say-only-what-the-record-holds)).
  If only an identifier survives, say that an unrecognised stage was
  requested — do not invent a name for it.
- **Show the live axis** so the person can choose. The recovery is a choice,
  not a redirect.
- **Suggest, do not act.** A suggested destination by role and position is
  helpful; performing the move is a hiring decision with no actor.
- **Group stranded occupants by the column they were stranded on.** One
  heading per removed column reads as "this is what deleting that column
  did", which is the actual story, and it gives the recovery a natural batch
  unit: one "move all of these to…" control per group.
- **Keep them reachable, not just visible.** If the surface offers
  keyboard or next/previous navigation through candidates, the stranded ones
  must be in that sequence. A card you can see but cannot step to reads as
  broken and gets treated as decoration.
- **Offer no control where none would work.** On a read-only view, name the
  problem and stop. A recovery control that does nothing is worse than its
  absence.
- **Keep the rest of the surface working.** An unresolvable stage
  invalidates one filter, not the board. A page that refuses to render
  because one parameter is stale strands everyone on it to protect nobody.

## Imports and cross-team moves

A candidate arriving from another team's pipeline carries a stage that
belongs to a different axis. The correct translation is **by role, and
explicitly**:

1. Resolve the source stage's role.
2. Map to a stage of the same role on the destination axis; where there are
   several, the earliest of that role, because advancing someone further than
   their evidence supports is the expensive direction of the error.
3. Where no stage of that role exists on the destination board, derive the
   landing position rather than defaulting to entry: an already-assessed
   candidate belongs at the last stage before the screening gate, falling
   back to entry only when the axis offers nothing else. Filing a screened
   person into the inbox re-runs a judgment already made and costs them
   another wait. Do not guess by position either; column three on one board
   is not column three on another.
4. Record that a translation happened, with both stage identities. Later,
   "why is this candidate at interview" must be answerable, and the honest
   answer may be "because an import mapped them there".

Translating by label is the same bug as everywhere else, wearing a
cross-boundary costume: two teams using the same word for different steps
will import each other's candidates into the wrong part of the process.

## Decision rules

- When a requested stage is absent, render the notice and the axis. Never a
  blank state, never a silent fallback to the first column.
- When a candidate's stage is unresolvable, surface them as needing
  placement. Unresolvable is a distinct state, not an empty one, and it is
  never treated as "at entry"
  ([absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence)).
- When a candidate is off-axis, exclude them from stage-scoped rates —
  including their unresolvable stage in a denominator distributes a
  configuration error across a metric — but include them in every count of
  people in flight, because they are.
- When a stale reference could be resolved by a tombstone, resolve it: the
  retired stage's preserved label is what makes the notice useful.
- When an off-axis candidate is placed, it is an ordinary move with an actor
  and a record — not a repair, not a background fix.
- When off-axis occupants appear in numbers, that is an axis-edit incident,
  not a per-candidate problem. Surface the aggregate to whoever edits the
  board.

## When not to use this

Do not use recovery machinery to paper over an axis that is being edited
carelessly. If a team routinely produces off-axis occupants, the migration
discipline is not being enforced at the removal door and that is where the
fix belongs; recovery is the safety net, not the process.

Do not extend the "show it anyway" principle to references the viewer has no
right to see. A stage from another team's board is off-axis *and* out of
scope: the honest response names the reference as not on this board and stops
there, without confirming or describing anything about the other team's
pipeline.
