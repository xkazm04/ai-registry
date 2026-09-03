---
layer: application
type: application
subject: authorization
technique: failure-direction
stack: go
verified_on: 2026-08-22
---

# Failure direction in Open Policy Agent's own API authorizer

OPA is the general-purpose policy engine, so it is also its own consumer: the
same Rego evaluator that decides other systems' authorization decides who may
call OPA's REST API. Citations are against `open-policy-agent/opa` version
`1.20.0-dev` (`v1/version/version.go:13`), commit `551581f` (2026-08-21); the
pin lives in prose rather than in `verified_against`, whose contract is a stack
runtime version. Two altitudes are reconciled — the enforcement point
(`v1/server/authorizer/`) and the evaluator under it (`v1/topdown/`) — because
they fail in **opposite directions**, and that is the finding.

## The enforcement point is total, and every exit but two refuses

`Basic.ServeHTTP` (`v1/server/authorizer/authorizer.go:107-165`) is the whole
gate, and it is short enough to read as a truth table. Exactly two statements
reach the wrapped handler — `b.inner.ServeHTTP` at `:143` and `:149` — and both
sit behind an explicit boolean `true`. Every other path writes a response and
returns:

- **Unparseable request** (bad URL escape, unreadable or non-JSON body) → 400
  before any evaluation (`:110-114`, via `makeInput` `:169-227`).
- **Evaluation error** → `writer.ErrorAuto` (`:128-131`), whose every branch is
  4xx or 5xx and whose `default` is 500 (`v1/server/writer/writer.go:27-42`) —
  no arm can fall through to dispatch.
- **Undefined decision** — the policy is missing, or `allow` did not resolve →
  `len(rs) == 0` → 500 `"authorization policy missing or undefined"`
  (`:134-138`; message at `v1/server/types/types.go:176`). The technique's
  *absent versus corrupt* rule, honored precisely: an operator misconfiguration
  is a **distinct verdict** from a denial on the merits.
- **Object decision with no `allowed` key** → 500 `"document missing or
  undefined"` (`:159-162`, `types.go:178`) — a malformed decision is a defect,
  not a deny.
- **A `reason` that is not a string** → falls past `:152-158` to the terminal
  refusal; likewise any decision value that is neither `bool` nor
  `map[string]any`, because the type switch at `:140-163` has **no `default`
  arm that returns**. Control reaches `:164`: one uniform 401, `"request
  rejected by administrative policy"`.

The repo pins each of these as a case in one table
(`authorizer_test.go:190-199`). Denials carry no detail unless the policy author
supplied a `reason` — the near-miss oracle is closed by default.

**No stale-allow window.** The authorizer holds no prepared-query cache: it
calls `rego.New(...)` per request with `b.compiler()` (`:116-126`), a function
returning the *current* compiler. A revocation lands on the next request.

**Denials are counted, though not logged.** With metrics enabled the authz
handler is instrumented under its own label (`server.go:808-810`,
`PromHandlerAPIAuthz = "authz"` at `:94`), so merits-denials (401) and
degraded-state refusals (500) are separable series — the technique's "counted
separately", obtained free from HTTP status.

## The deviation: the evaluator downgrades errors to undefined

One level down, the direction inverts. When a built-in function fails,
`evalBuiltin` does not propagate the error — it records it and **sets `err` to
`nil`** (`v1/topdown/eval.go:2184-2191`, the assignment at `:2189`). The
expression is simply undefined, and evaluation continues as if the call had
merely not matched. Only if `strictBuiltinErrors` is set does the first
recorded error become the query's error (`v1/topdown/query.go:514-516`, and
the same block for partial evaluation at `:648-650`).

So the technique's **errored lookup** — "refuse, with an error distinguishable
from denied on the merits" — is by default not distinguishable. An `http.send`
to an entitlement service that times out yields undefined, which flows into
`default allow := false` and produces a *deny that looks exactly like a policy
deny*. Fail-closed direction: **preserved**. Legibility: **lost**. And for the
mirror-image shape — a rule that computes `deny` — the same downgrade produces
silence, which reads as allow. The direction is a property of the policy
author's polarity, not of the engine.

The remedy is opt-in on both surfaces: `--strict-builtin-errors` on `opa eval`
(`cmd/eval.go:354`) and a per-request `strict-builtin-errors` query parameter on
the data API (`server.go:1534`, `:1825`, applied at `:2669`) whose absence means
false (`getBoolParam`, `:2865-2873`). **OPA's own authorizer sets neither** —
the `rego.New` option list at `authorizer.go:116-126` omits
`StrictBuiltinErrors` entirely. The engine that ships the switch does not throw
it on its own gate. The standard stays; the deviation is the finding.
Per call, `http.send` offers a local alternative: `raise_error` defaults to
true (`v1/topdown/http.go:1488-1497`), and setting it false returns an object
carrying an `error` field the policy can branch on — making "corrupt" a
distinct *value* rather than an absence.

## The honesty horizon is named, never inherited

Inter-query caching of `http.send` results is off unless the call asks for it
(`useInterQueryCache`, `http.go:1453-1470`), and the aggressive form is guarded:
`force_cache: true` without `force_cache_duration_seconds` is a hard error
(`newForceCacheParams`, `:1472-1485`). A policy cannot acquire an unbounded
cached *allow* by omission; the revocation window is typed out as an integer.

The same absent-versus-undefined discipline recurs on the decision API: on an
empty result set the server picks between `MsgMissingError` and
`MsgFoundUndefinedError` by asking the compiler whether *any* rules exist at
that path (`server.go:1216-1226`) before returning 404 — "no such path" and
"the rules exist and did not fire for this input" reach the operator as
different sentences.

## Deviations of posture, honestly stated

`AuthorizationOff` is the zero value of the scheme enum (`server.go:78-79`), so
an OPA started without `--authorization=basic` runs **default-allow on its own
admin API**. The compensating control is the listener: the v1 default bind is
`localhost:8181` (`cmd/run.go:30,226`), and only `--v0-compatible` reverts to
`:8181` on all interfaces (`:389-391`). The public-interface warning fires
**only** on that v0 path (`v1/runtime/runtime.go:667-668`) — pass
`--addr 0.0.0.0:8181` explicitly under v1 and you get no warning and no gate.

## Reconciliation summary

Confirmed: a total enforcement function with exactly two allow exits behind an
explicit `true`; undefined-policy and malformed-decision resolved as distinct
5xx verdicts rather than as denials; one uniform 401 with no near-miss detail;
no decision cache between policy update and next request; cached remote lookups
requiring an explicit, bounded horizon; degraded-state refusals separable from
merits-denials on the metrics surface. Deviations: built-in errors silently
downgraded to undefined at the evaluator, the strict mode shipped but not
enabled on OPA's own gate; authorization off by default, with the
public-interface warning wired only to the legacy path. Not present by scope:
warn-only enforcement and denial audit records — the authorizer writes no
decision log line at all, leaving both to the deployment around it.
