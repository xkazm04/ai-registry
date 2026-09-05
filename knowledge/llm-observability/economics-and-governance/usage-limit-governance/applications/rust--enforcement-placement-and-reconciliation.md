---
layer: application
type: application
subject: usage-limit-governance
technique: enforcement-placement-and-reconciliation
stack: rust
status: forged
verified_on: 2026-09-05
verified_against: rust@1.96
---

# Rust: the client-side seat in LightTrack's SDK pre-spend admission

LightTrack (read at commit `828dfb4`, 2026-09-05; workspace toolchain
pinned to 1.96.1 by `rust-toolchain.toml`) has no inline gateway. Every
server cap is record-side, and the SDK documentation says so in the
technique's own terms: "Every cap the server has is **record-side**: it
refuses to *record* a call that already cost money. By the time a 429
arrives, the provider has been paid. The SDKs close that gap locally"
(clients/README.md:119-120). The closing mechanism — landed 2026-09-02 as
"pre-spend admission — all three SDKs can refuse a call before it costs
money" — is the client-side seat: the Rust client at
`clients/rust/src/admission.rs` (with `limits.rs` for the parsing half),
mirrored in the TypeScript and Python clients under a shared contract.

## What the seat decides from

The server publishes proximity on every ingest response — `usage_ratio`,
`shed_fraction`, `Retry-After`, and the binding rule's id and scope, as
body fields on `POST /v1/events` and as `X-LightTrack-*` headers on the
batch door, the OTLP door and the 429 (limits.rs:13-17). `LimitView`
(limits.rs:31-) parses it with the absence rule the bundle's laws demand:
"A project with no limits reports no ratio at all; a client that read the
absence as `0.0` would believe it had infinite headroom. An unparseable
`Retry-After` is likewise unknown, not 'retry immediately'"
(limits.rs:9-11). `AdmissionCache::observe` (admission.rs:147-175) folds
each view into one entry per binding scope — the project-wide view under
`""`, a use-case view under `name=<use-case>` — and arms the wait only from
a 429: "A 503 carries `Retry-After` too, but it means the *ingest endpoint*
is saturated — pausing the app's LLM calls over that would be the
observability tool causing the outage it exists to observe. And a 2xx is
the server saying the refusal is over" (admission.rs:150-154).

## The verdict, and the three rules that keep the seat honest

`AdmissionCache::admit` (admission.rs:186-235) is pure — "no I/O, and no
clock beyond `now_ms`" — and answers in this order: an unexpired advertised
wait refuses with `retry_after` (honoured even past the TTL, because "the
server told us when to come back, and that instruction does not go stale,
it expires", admission.rs:193-194); a view older than the TTL admits and
flags itself `stale`; `usage_ratio >= 1.0` refuses with `at_cap`; and a
positive `shed_fraction` runs the lottery — `lighttrack_core::shed_ticket(
rule, id) < f` — "not a port of the server's: it *is* the server's"
(admission.rs:20-21, 224-230). The technique's three conditions for this
seat are each a written rule in the module header (admission.rs:1-22):

- **Pure, off the request path.** "A decision that could block on a
  network call would put LightTrack on the critical path of every LLM call
  in the host app — precisely the cost `docs/ARCHITECTURE.md` §4 deferred
  the inline gateway to avoid."
- **Fails open.** `DEFAULT_ADMISSION_TTL_MS = 30_000` (admission.rs:29);
  "No observation, or an observation older than the TTL, admits. A
  telemetry client that stops an app's LLM calls because it is itself
  confused is worse than one that records nothing." A stale verdict
  triggers one background status refresh; "the decision never waits on it"
  (README.md:149-152).
- **Scoped.** "A cap on the `summarize` use-case must stop `summarize` and
  nothing else" — `admit(name, ...)` reads the use-case's own view when the
  server has named one and the project-wide view otherwise, because
  "applying the worst rule in the project to every call is how a scoped
  budget turns into a project-wide outage" (admission.rs:181-185).

Enforcement is opt-in: `Enforce::Off` is the default ("adding an
observability SDK must not change what an app does", admission.rs:40-42),
and an unrecognised `LIGHTTRACK_ENFORCE` value parses to `Off` because "a
typo in an env var must not silently start blocking a production app's
traffic" (admission.rs:46-48). `Block` returns a typed `BudgetExceeded` so
the host app can tell "the budget said no" from a provider outage
(admission.rs:232-238); `Warn` reports to stderr and lets the call proceed.

## What the seat does with a blocked call

"A blocked call is not spend. It is never recorded as cost" — but the
client may leave "a zero-usage event tagged `lt_blocked_locally` instead,
so your rollups show a throttled week rather than a quiet one"
(README.md:153-156): the marker the technique asks for so refusal does not
read as silence.

## Where the seat's worst case sits

The technique says every pre-provider seat prevents approximately; here
the approximation is the TTL. A client's view is at most 30 seconds old,
so the worst-case overshoot is whatever the app spends in 30 seconds after
the server's position changed — plus the bootstrap gap, since a client
that has never reached the server admits everything. The reconcile step is
the record-side cap itself: the calls that slipped through the stale view
are ingested, charged to the window, and turned away one call later. What
the tree does not do is state that bound in numbers anywhere an operator
reads — the README names the 30-second staleness but not the spend it
implies — which is the technique's "state your mode and worst case"
obligation, half met.

The verdicts are fixed across the three SDKs by
`clients/contract/fixtures/limits.json` and a `pre_spend_admission_verdicts`
contract test in each client (clients/rust/tests/contract.rs:261), which is
what makes "the SDK and the server agree which events shed" a checked
claim rather than a hope.
