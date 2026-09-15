---
layer: application
type: application
subject: media-playback
technique: self-conditioned-supply
status: forged
stack: go
verified_on: 2026-09-15
verified_against: go@1.26
applied: simulation
ab_verdict: unmeasurable
proof: structural-only
---

# A motion planner's streaming server (motion-bricks.cpp, Go demo)

*Verified against `localai-org/motion-bricks.cpp` at `2727a456`. The stack version is
the `go 1.26` directive in `demo/go.mod`; the native library beside it is C++23
(`CMakeLists.txt:7`).*

The repository is a GGML/C++ port of NVIDIA's MotionBricks, a real-time latent motion
planner, plus a Go server that streams the planned motion to a browser. The planner is
self-conditioned in the strict sense: every replan reads the previous four actual frames,
derives root and heading velocity from them, and exposes the valid predicted prefix
"and retains it as the next context" (`docs/IMPLEMENTATION.md:464-474`). The released
model emits 30 FPS motion in 24-64 frame segments, and the server replans at most every
16 frames (`demo/stream.go`, `nextPlan = job.at + min(16, frames-4)`). All three rules of
the technique are implemented in this tree, each with a test named after its failure.

## The reserved seam

A plan is dispatched from `timeline.context(at)` at a future frame `at`, and the server
records `reservedAt = job.at` when the job is accepted by the worker (`demo/stream.go:676-678`).
`referenceTimeline.replace` refuses any result whose seam is not ahead of playback:
`"late plan: seam already committed to playback"` (`demo/stream_motion.go:87-88`). The
streaming design note states the invariant in one line: "Planning runs ahead of playback;
normal replanning cannot replace the past" (`docs/STREAMING.md:12-15`).

## Late but current is waited for; stale is discarded

Two tests run in sequence on each result (`demo/stream.go:574-588`). A result whose
`epoch` or `revision` no longer matches (the command changed) is dropped and a replan is
marked due, however punctual it was. A current result that misses its seam is the case
the server refuses to discard: while a plan is outstanding, the loop holds **both** the
reference clock and the physics clock one frame before `reservedAt`, flags the pose stream
`Planning`, and accepts the same plan when it lands (`demo/stream.go:696-712`). The comment
names the defect it replaced: "never discard the plan repeatedly until the reference runs
out." `docs/STREAMING.md:17-21` records the user-facing half ("Waiting for motion planner").
`TestStreamIdleScheduling` deliberately exceeds the lookahead and fails if the playhead
crosses the reserved seam or if the late plan is not accepted
(`demo/stream_protocol_test.go:199-218`).

The clock being held is one the server owns: a 50 Hz integer tick that also steps an
optional physics simulation. Under severe lag the loop runs at most four catch-up ticks
and "slows simulation ... never increases the physics timestep or skips physical steps"
(`docs/STREAMING.md:23-28`). The viewer's clock is not owned, and there the policy is the
other one: the browser buffers about 150 ms, interpolates, and on missing frames holds
and rebuffers, "not extrapolation" (`docs/STREAMING.md:40-45`).

## No input is a stationary command, and a settled rest stops the planner

Upstream's planner answers a zero movement vector with "a small forward-direction
fallback". The server translates the absence before it reaches the model: no direction
becomes the `idle` style with an explicit zero speed (`demo/stream.go:649-658`). Once the
stationary plan has played, `holdAtEnd` stops replanning and the pose stream reports
`Holding` while the clock keeps running (`demo/stream.go:591`, `:753`). The design note
gives the reason as feedback, not cost: the policy "avoids repeatedly feeding the native
planner's small forward fallback back into idle" (`docs/STREAMING.md:33-38`). The same test
fails on "settled idle replanned without input", on "idle failed to hold with clock
running", and on "idle speed leaked into walking" when input resumes.

## The replayable unit is the planning event

The parity suite does not compare clips. It replays 14 captured planning events "with
their recorded public context, command/style/seed, expected unblended motion, placed
targets, and FK results" at the same boundaries, compares integer decisions exactly and
floats with boundary-specific tolerances, and adds session checks for replan timing,
root and joint velocity continuity, and the idle case settling to "a numerically constant
frame" (`docs/IMPLEMENTATION.md:60-62`, `:660-667`). The eight-frame crossfade at each seam
is labelled a deployment smoothing policy, "separate from inference parity"
(`demo/stream_motion.go:90-91`), so the parity claim never covers it.

## Applied in the fleet: simulation, unmeasurable

The fleet has no live self-conditioned producer, so the apply step was a simulation over
three recorded cases from managed trees (the record is in the game project's
`.ai/applied.jsonl`). Case 1: a melee combo built by concatenating three separately
generated motion clips, re-anchoring only root position, whose retarget exploded while
each clip retargeted clean. The splice rule predicts a seam defect, and that project's own
notes already concluded a single continuous take removes the concatenation step. Case 2:
a conversational voice service that discards a speculative reply when the caller resumes.
The clock-ownership test predicts discard is correct there, and the tree agrees. Case 3:
a vision critic that scored held rest frames around a montage as "static holds". The
held-frame rule predicts that a gate reading only pixels cannot separate a requested rest
from a freeze. Verdict `unmeasurable`: the instrument that would measure case 1 is a local
install of an autoregressive motion model that can switch instructions inside one take,
plus a seam-continuity probe (joint velocity at each seam against the within-clip p95).
Neither is on the machine today.

## What this realization cannot do

It is batch-one and serializes planning through a single worker, so the waiting policy
has never been tested against several sessions contending for one planner. The hold is
reached only when a plan is outstanding. A planner that fails outright is a separate
`fail()` path, and the tree has no retry budget per seam. The lookahead itself is not
derived from measured cold plan time: the port defers "exact interactive latency, memory,
and browser buffer targets" until they are measured (`docs/IMPLEMENTATION.md:851-852`).
