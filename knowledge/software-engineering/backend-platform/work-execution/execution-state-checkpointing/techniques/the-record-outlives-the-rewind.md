---
layer: technique
type: technique
subject: execution-state-checkpointing
technique: the-record-outlives-the-rewind
status: forged
laws: [record-precedes-effect, deletion-is-not-repair, silent-state-is-ungoverned]
shared_with: []
use_when: [a system can reset the environment it is running work in, deciding where durable memory may and may not live, the system offers more than one reset and nobody can say what each one cuts, an automated retry repeats the attempt that caused the rollback]
---

# The record outlives the rewind

A system that can roll its own execution environment back to an earlier capture
holds a recovery tool and a hazard in one lever. The hazard is specific: if the
record of what has already been attempted lives on the surface being reset,
then every rollback is an amnesia event. The next attempt starts from a clean
environment and an empty memory, repeats the step that caused the rollback,
rolls back again, and the loop is invisible from inside — each iteration looks
like a first attempt.

This is not a hypothetical about autonomous systems. It is the ordinary shape
of any retry whose scratch space and whose notes share a substrate, and the fix
is structural rather than disciplinary: **the audit trail of what was attempted
is written on a different axis from the state that gets reset, and the rewind
appends to that trail instead of truncating it.**

An agent's belief about what it has already tried governs what it does next
whether or not anything can read it, and it can be governed only once it is an
artifact something else can read
([silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)).
A trail on the resettable surface is that artifact with an expiry date.

## The artifact is a matrix, not a declaration

The instinct is to write a paragraph: "a capture contains the workspace
filesystem; everything else is external." That paragraph is answerable only
while the system has one reset button. Real systems acquire a second one almost
immediately — an environment rewind and a service restart, a cache clear and a
sign-out, a container recreate and a host rebuild — and each button cuts a
different set. A single declaration cannot say which, so readers guess, and
they guess in the direction of assuming their data is safe.

Publish instead a table:

- **Rows: every category of state the system holds.** Not every field — every
  category that a reader could plausibly ask about. Code and prompts;
  conversation or task history; artifacts the system produced; coordination
  records; secrets; the working filesystem; live connections; caches.
- **Columns: every reset operation the system offers**, one per button, named
  as the operator sees it. Add a column for where the state lives, and one for
  whether it is under version control or otherwise reproducible from a source
  of truth — that column is what turns the table from a description into a
  recovery plan.
- **Cells: survives or does not**, with the interesting cells annotated. The
  cell that reads "does not survive — that is the point" is the most valuable
  entry in the table, because it marks the one deliberately resettable layer.

Build it by walking the rows and asking each button's question separately.
Anyone who finds themselves writing the same answer down every column has
either found a genuinely durable row or has stopped thinking, and the second is
common enough to be worth a second pass.

## The operating rules fall out of the matrix

The table is not documentation for its own sake; it generates the system's
rules mechanically, and they are better rules than the ones written from
intuition:

- **Nothing durable may have its only home in a row that a reset cuts.** This
  is the whole point of the table and it is unanswerable without it. In
  particular the trail of what was attempted lives in a row that survives every
  button.
- **Where each kind of memory goes** is decided by which columns it must
  survive: facts about the user in the durable profile, behavioural changes in
  the version-controlled source, working state in the resettable layer.
- **The row that survives everything and is reproducible from nowhere is the
  one that cannot be casually copied or recreated** — usually secrets — and it
  gets its own handling rather than being lumped in with durable state.
- **A row with a coverage gap is marked as a gap**, in the table, rather than
  omitted from it. A component that does not yet write its lifecycle into the
  shared trail is a hole in the history, and a reader who cannot see the hole
  will read the trail's silence as evidence that nothing happened.

## The rewind is an entry in its own history

The trail is append-only, and the reset operations are events in it. Two
consequences, and the second is the one that gets skipped.

**Record before the effect**
([record-precedes-effect](../../../../_laws.md#record-precedes-effect)). The
capture writes its event when it is taken; the rewind writes its event as part
of the same unit of work that performs it, naming the capture it restored. The
naive order — reset, then note it — leaves a window in which the environment
has been replaced and nothing accounts for it, and that window is exactly where
a crash produces a system that cannot explain its own state.

**Never truncate.** A rollback that also rolls back the history is the single
defect this technique exists to prevent, and it arrives disguised as tidiness:
the events after the restore point describe a world that no longer exists, so
why keep them? Because they are the only record of the attempt that motivated
the rollback. Removing the entries that expose the failure is not part of
repairing the state
([deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair)).

The same trail takes entries from the surrounding host, not only from the work
itself: a restart, the start of a drain, a self-update finishing, a process
starting. Writing those into one history rather than into side channels is what
lets a reader answer "did I restart, or did I crash?" — a start with no
preceding shutdown entry implies a crash, and that inference is only available
if both kinds of entry live in the same ordered log.

## Testing a cell needs two signals

Every cell in the matrix is a claim, and the claims decay. A test that proves
one cell must carry **two independent signals**, because a reset that does
nothing at all passes the obvious single-signal test:

1. Mutate something that existed before the capture, then reset, and assert the
   old value is back.
2. Create something that did not exist before the capture, then reset, and
   assert it is gone.

The first alone is satisfied by a restore that never ran if the value was never
really changed; the second alone is satisfied by a reset that wipes everything.
Together they pin the boundary. The same pairing proves the surviving rows: an
entry written to the trail before the reset must still be readable after it.

## Decision rules

- Write the attempt trail on a substrate that no reset operation cuts, and
  verify that against the matrix rather than against memory.
- Publish a state-by-reset matrix with one column per reset button, plus where
  the state lives and whether it is reproducible from a source of truth.
- Derive the operating rules from the matrix instead of writing them
  independently.
- Mark coverage gaps in the matrix; a silent hole in the trail reads as an
  absence of events.
- Record capture and reset as events, in the unit of work that performs them,
  before the effect.
- Never truncate history at a restore point; a rollback appends.
- Put host lifecycle entries into the same ordered trail as the work's own, so
  a missing shutdown entry is readable as a crash.
- Test each interesting cell with a rolled-back mutation *and* a vanished
  creation.

## When not to use it

A system with exactly one reset, whose scope is obvious and whose state has one
home, does not need a matrix — a sentence will do, and a table with one column
is a sentence with lines around it. The trigger for building it is the second
reset operation, or the first time somebody asks "does that survive a restart?"
and two people on the team give different answers.

The matrix is also not a substitute for declaring what a capture contains. That
is a different question, answered on the capture's own side by its scope
declaration and its exclusion ledger; this table answers what survives which
operation, which only becomes a distinct question once more than one operation
exists.
