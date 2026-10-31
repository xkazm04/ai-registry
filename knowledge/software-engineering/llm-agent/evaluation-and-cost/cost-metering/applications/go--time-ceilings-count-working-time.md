---
layer: application
type: application
subject: cost-metering
technique: time-ceilings-count-working-time
stack: go
status: forged
verified_on: 2026-10-31
verified_against: go@1.27
---

# A working-time ceiling in an agent runtime (docker-agent)

Read from a clone of `docker/docker-agent` at commit `f412343dc305`; the stack
is the one `go.mod` witnesses (`go 1.27`). Nothing was run.

## What the tree does

The ceiling's clock is an accumulator of turn durations, not a start
timestamp. Each turn opens with `pkg/runtime/loop.go:817 "turnStart := r.now()"`,
commented as bounding "this turn's active time", and closes by recording
`pkg/runtime/loop.go:981 "r.now().Sub(turnStart)"` into every tracker the actor
reaches. The check compares the accumulator, never a clock:
`pkg/runtime/budget.go:216 "b.active >= b.maxTime"`. The user documentation states
the predicate and the reason: `docs/configuration/budget/index.md:103 "the sum of their turn durations"`.

The check runs between turns, and the documentation states the resulting bound:
`docs/configuration/budget/index.md:189 "it can overshoot by at most the turn already in flight"`.

Counters saturate rather than wrap:
`pkg/runtime/budget.go:102 "Saturate consumption counters so overflow cannot turn spend into credit."`

A crossing is terminal and reports the setting path to change
(`docs/configuration/budget/index.md:121 "a budget stop is **terminal**"`); the
documentation contrasts it with the iteration limit, which offers a continue
prompt. That is the boundary the technique records: a ceiling the person
running the agent declared in their own configuration is not overridden by a
dialog.

## What this realization cannot do

There is no hard wall: a model call or tool already started is never
interrupted, so a long tool call can overshoot a short `max_time` by its whole
duration. The only mitigation the tree offers is the instruction to leave
headroom. Nothing in the tree measures idle time, so the operator cannot see
the attendance figure that the working-time figure was chosen over.
