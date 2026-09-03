---
subject: declared-process-graph
domain: software-engineering
last_touched: 2026-09-02
touched_by: intake
dry_streak: 0
---

# declared-process-graph

First touch: 2026-09-02, forged in the intake 2.0.0 handoff over a dataflow runtime
(source note `2026-09-02-dora-v2.md`, design record D8 plus the typed-port and
live-mutation halves). Category `backend-platform/process-graph-runtime`.
Single-stack (`rust`); a transplant pass is owed.

## State

6 techniques, 2 applications. Owns the descriptor for a graph of long-lived
processes joined by named, typed channels: per-kind field whitelist with a hint that
says *move*, composite expansion contract (checks that can only see the
pre-expansion form live in the expander), bounded expansion (a bounded read of
cap+1 bytes, never a stat; containment root threaded through recursion),
panic-proof numeric fields (probe at the runtime's own boundary; refuse saturating
casts as well as panics; values must round-trip exactly), typed-port compatibility
(bounded transitive search, structural superset), and additive live mutation
(typed reply per mutation, barrier verdict replayed, exhaustive purge on removal).

Boundaries drawn: `pipeline-dag` (steps with a fate; three of its checks are wrong
here - cycles are legal, an input-less node is a source, nothing has a terminal
status; its `rust--graph-validation.md` application already names this tree as the
counter-example), `subprocess-lifecycle` (answerable from the document alone is
mine; needs a live child is theirs), `repo-manifest-standard` (must-ignore-unknown
for arbitrary readers versus must-refuse-unknown for one runtime about to create
processes).

Deviation recorded: daemon-side spawning for a dynamically added node is still
pending in the source; the protocol half is built.

Proposed law from the forger (not added): *a check that cannot see its real target
declines rather than substitutes* - three sightings in one tree; possibly a
sharpening of `gate-sees-target`.
