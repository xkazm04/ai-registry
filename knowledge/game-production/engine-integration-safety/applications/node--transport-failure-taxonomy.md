---
layer: application
type: application
subject: engine-integration-safety
technique: transport-failure-taxonomy
stack: node
status: forged
---

# A four-kind failure taxonomy in the PoF bridge client

`src/lib/bridge/run-python.ts` is a Node client for an HTTP route exposed by an Unreal
editor plugin, which dispatches `module.function(args)` onto the editor's game thread. Its
whole error design is the technique, and its header comment states the reason:

> Failures report WHAT HAPPENED: a bridge that answered with a broken body is never
> reported as "unreachable", and a call that outlived its deadline is never reported as
> either — because that would send a developer to restart an editor that is already
> running and hide a real plugin bug.

## The closed set

`RunPythonFailureKind` (`run-python.ts:54`):

```ts
export type RunPythonFailureKind = 'unreachable' | 'timeout' | 'aborted' | 'malformed-body';
```

with the documented meanings: `unreachable` — no response at all; `timeout` — "the bridge
took the connection but did not answer within the bound"; `aborted` — the caller's own
signal cancelled; `malformed-body` — "the bridge answered, but the body was not the JSON
envelope."

The fifth member of the taxonomy is encoded as an **absence**: "An error with NO `kind`
came from the bridge itself — the editor ran the call and Python raised. That distinction
is the difference between 'fix the plugin / the script' and 'start the editor'." The
envelope is a discriminated union (`RunPythonOk | RunPythonErr` on `ok`), so callers branch
without try/catch.

## Preserving the distinctions at the boundary

The technique's rule that reads must sit outside the send's catch block is implemented
literally (`run-python.ts:158` onward): "The body read and JSON parse sit OUTSIDE the
fetch's catch, so 'the editor answered with garbage' stays distinguishable from 'the editor
is not running' and from 'the editor never answered'."

`transportFailure` (line 172) is the classifier, and its **order** is the technique's rule
about distinguishing your own deadline from the caller's cancel: it checks
`deadline.timedOut()` first — a flag set by the client's own timer in `resolveDeadline`
(line 114) — then `opts.signal?.aborted`, and only then falls through to `unreachable`.
Both surface as the same `AbortError` at the fetch layer; without the flag every user
cancellation would be logged as an editor timeout.

`malformedReply` (line 94) carries the bounded echo the technique asks for:
`RESPONSE_SNIPPET_CHARS = 200`, applied to both the parse reason and the received body, so
a broken plugin cannot flood a log with its own output.

## The second axis, made explicit one layer down

`src/lib/pof-bridge/proxy.ts` proxies other bridge routes and adds the *reached* bit as a
separate field alongside the kind (`proxy.ts:31,39`):

```ts
export type PofProxyFailureKind = 'unreachable' | 'timeout' | 'http-error' | 'malformed-body';
```

with the routing rule stated at line 23: "only `unreachable` and `timeout` mean 'go look at
the editor'; `http-error` and `malformed-body` mean the plugin answered and the fault is in
the plugin." `reachable: false` is set only for the first two — the technique's orthogonal
axis, derived once here instead of by every consumer.

`http-error` is the protocol-rejection kind the run-python client folds into its malformed
path; the proxy separates it because it forwards an upstream status. Both are
never-retry kinds, and neither is reported as unreachable.

## Where the taxonomy stays intact

The distinctions survive because no layer flattens them: the proxy preserves upstream
status and kind rather than collapsing to a generic 502, and the drain runner's bridge
executor keeps a non-terminal plugin payload as a *deferred* gate rather than inventing a
verdict (`docs/catalog/L3-L4-RUNNER.md:117` — a plugin `not_found` settles nothing,
"planned, not registered in UE"). A taxonomy destroyed at any hop is destroyed for
everyone above it.
