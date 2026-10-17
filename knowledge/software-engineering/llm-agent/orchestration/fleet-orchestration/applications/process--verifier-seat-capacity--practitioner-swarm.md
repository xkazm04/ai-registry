---
layer: application
type: application
subject: fleet-orchestration
technique: verifier-seat-capacity
stack: process
verified_on: 2026-10-14
---

# A task policy that forbade self-closing, and the week its verifier seat stood empty

The source is one practitioner's agent-swarm project
(`github.com/Dicklesworthstone/frankengit` at `142adb9098d5`), read as a clone on
2026-10-14 with a second project for comparison
(`github.com/Dicklesworthstone/franken_engine` at `815ddcf8e16b`). Anchors are relative
to a directory holding both clones under those names. The trees are licensed MIT with a
rider; everything is restated and nothing beyond the anchors is reproduced.

## The door

The project's task tracker reads a declarative policy. Only one role may close work
(`frankengit/.beads/policy.yaml:2 "Only the batch-verify orchestrator closes work"`), a
producer that moved its own item to in-progress may not close it
(`frankengit/.beads/policy.yaml:7 "forbid_self_close_after_in_progress"`), and a debt
counter caps work awaiting verification (`frankengit/.beads/policy.yaml:38 "verification_debt:"`).
Implementers write code and tests but do not run the full verification
(`frankengit/AGENTS.md:331 "Agents do NOT run"`), and a pass must name the revision it
was observed at (`frankengit/AGENTS.md:340 "MUST name the commit SHA it was observed"`).
This is the door the technique says had not been observed enforcing a debt bound.

## What happened at it

The project's own revision-bound audit found the seat vacant and the cap doing the
opposite of its purpose:
(`frankengit/docs/REALITY_CHECK_AND_BRIDGE_PLAN.md:10 "a verification loop with nobody in it"`);
the debt had reached its hard limit, so the tracker refused every new claim
(`frankengit/docs/REALITY_CHECK_AND_BRIDGE_PLAN.md:12 "so the tracker refuses new claims"`),
and only the absent verifier could unblock it. When a verifier was appointed, its
first pass over twenty-eight submitted items closed eleven and sent seventeen to rework
(the audit's heading says ten closed; its list names eleven, which the total requires),
and its own authored items then had no second reader
(`frankengit/docs/REALITY_CHECK_AND_BRIDGE_PLAN.md:734 "No bead IcyIbis authored has been independently verified."`).

## The comparison tree

The second project states the same rule
(`franken_engine/AGENTS.md:223 "No self-certification: work is closed by an independent verifier"`)
but its policy file gates one label only, and, by a worker's last-commenter proxy over
its task export, about a third of its closures were by the assignee. A rule stated in
the instructions and absent from the door is the degenerate case the technique names.

## What this realization cannot show

The audit is the project's own; no outside reader re-ran its counts. The debt figures
and the rework split come from the audit document, not from replaying the tracker. The
assignee-closure share is a worker's proxy (last commenter as closer) and was not
re-run by the run's director.
