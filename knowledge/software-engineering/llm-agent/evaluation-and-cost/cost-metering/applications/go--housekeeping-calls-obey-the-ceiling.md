---
layer: application
type: application
subject: cost-metering
technique: housekeeping-calls-obey-the-ceiling
stack: go
status: forged
verified_on: 2026-10-31
verified_against: go@1.27
---

# Compaction under a budget in an agent runtime (docker-agent)

Read from a clone of `docker/docker-agent` at commit `f412343dc305`; stack
witnessed by `go.mod` (`go 1.27`). Nothing was run.

## What the tree does, on both compaction paths

The native path checks, then charges. The check uses the main loop's own
function: `pkg/runtime/native_compaction.go:107 "exceededFor(a.Name())"`. A
breach becomes a warning plus a sentinel, not an error event:
`pkg/runtime/native_compaction.go:108 "Compaction skipped:"` and
`pkg/runtime/native_compaction.go:109 "errCompactionBudgetExceeded"`. The spend
is recorded after the call, from the cost computed once for the message:
`pkg/runtime/native_compaction.go:128 "r.recordBudget(sess, a, &res.Usage, messageCost"`.

The caller maps the sentinel into its own outcome vocabulary, so a refusal is a
third result beside applied and failed:
`pkg/runtime/session_compaction.go:128 "errors.Is(err, errCompactionBudgetExceeded)"`
sets the skipped outcome.

The agent-based path nests a runtime with the parent's pot and treats the nested
stop signal as a control event, discarding its message:
`pkg/runtime/session_compaction.go:375 "Never let the child's synthetic stop message replace the conversation."`

The documentation adds the free case:
`docs/configuration/budget/index.md:84 "An exhausted budget skips LLM-based compaction"`,
while a hook-supplied summary can still be applied without spending tokens.

## What this realization cannot do

The check is at the call door only, so a call that starts under the ceiling and
crosses it still completes and is charged: the overshoot is one compaction
call. There is also no path for a session that is over its ceiling and over its
context window; the next turn resolves that by stopping at the boundary.
