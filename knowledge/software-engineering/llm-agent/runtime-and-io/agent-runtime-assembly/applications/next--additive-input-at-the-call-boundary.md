---
layer: application
type: application
subject: agent-runtime-assembly
technique: additive-input-at-the-call-boundary
stack: next
verified_on: 2026-11-16
verified_against: next@16
applied: simulation
ab_verdict: unmeasurable
---

# A harness with two control verbs and no way to say anything

Re-read 2026-09-04 at the tree's commit `0152dd0a`: the start-time
direction option, the two-verb control tool, and the pause-after-iteration
event and calls all resolve where they were cited; the tree's `package.json`
pins `next` at 16.3.3, which is the witness for the major above. Re-read
2026-11-16 at `ccbe02aea`: still two verbs, still `next` 16.3.3, and one
claim corrected below — the hand-edit channel needs a process restart
between the pause and the resume.

A game-production autonomous build harness driven through a tool server:
plan, execute, verify, checkpoint, looping over a list of areas until a
target pass rate holds. It runs for hours, and it is exactly the shape this
technique is about — except that the loop has no input door at all.

The steering levers are set **at start**: the creative direction is a
config field read when the run is constructed and passed once into the
orchestrator. Mid-run, the operator has two verbs, pause and resume. There
is no third verb that carries a message.

## The accidental injection path

The interesting part is that a path exists and nobody designed it. Pause is
honoured *after the current iteration*; resume with a state path
rehydrates the run from files on disk rather than from the lost in-memory
orchestrator — deliberately, so a server restart does not orphan a build.
Those two facts compose into an unsupported channel: pause, stop the server,
hand-edit the config snapshot the rehydrate reads, restart, resume with the
state path. The direction changes and the run keeps its identity and its
history.

**The restart is part of the channel** (corrected 2026-11-16; the first read
said "pause, hand-edit, resume"). The snapshot (`harness-config.json`) is read
only by the rehydrate, and the rehydrate runs only when no orchestrator is in
memory (`src/app/api/harness/route.ts:435-458`, the same at `0152dd0a`). A
paused orchestrator that is still in memory resumes on the config it closed
over at start (`resume()` in `src/lib/harness/orchestrator.ts:1612`), so an
edit made without a restart is silently ignored — and the snapshot is
re-written from that in-memory config the next time an orchestrator is
built (`:792-794`). Each run of the channel therefore costs a server restart,
and an operator who edits without restarting sees no error and no change.

That is the technique's own outcome reached by the worst available means.
It has no record of the input, no ordering guarantee against the pause it
races, and no way for the run's history to show that a person intervened or
when. It works, and nothing about it is legible afterwards.

## Three cases, walked both ways

| Case from this tree | With the technique | As it stands |
| --- | --- | --- |
| The direction is wrong three areas in | The message is appended at the next iteration boundary, recorded, and the plan and history survive | Pause, restart the server, edit a file, resume — or stop and start over, which discards the plan |
| A constraint occurs to the operator while the harness is inside a long engine build | Injection is additive and safe precisely here; the message waits for the boundary and nothing is cancelled | Pause is honoured only after the current iteration, so nothing can be said for the length of the build |
| The server dies with an intervention just made | The accepted input is durable before the request that carries it, so recovery replays it | An edit on disk survives; anything held in the orchestrator does not, and there is no record either way |

## Why the verdict is unmeasurable, and what would settle it

The simulation predicts the technique is better here, and the prediction is
cheap to state and impossible to support from this tree: a first-class
boundary injection beats hand-editing a config under a race, and it is not
close. But "better" for this application would be a claim about operator
outcomes, and nothing in the tree counts them.

**The instrument that would make it measurable already half exists.** The
harness emits lifecycle events, including a paused event, and each run
writes durable metadata. Counting, per run, whether a pause was followed by
a resume of the same run or by a fresh start — and how many areas were
replanned when it was a fresh start — would produce the number this
technique moves: work discarded per intervention. Until something counts
that, adopting the technique here is a design argument, and this
application says so rather than dressing the argument as a result.

## The structural fact

The harness resumes by rehydrating from files rather than from memory after
a restart, and that decision was made for crash safety. It is also,
unintentionally, the only reason mid-run steering is possible at all — and
only across a restart, because an in-process resume never reads the file. A tree that had chosen
in-memory resume would have had no channel whatsoever — and the absence
would have been invisible, because pause and resume would both still work.
