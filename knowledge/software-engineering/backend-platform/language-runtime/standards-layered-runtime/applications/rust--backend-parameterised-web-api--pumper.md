---
layer: application
type: application
subject: standards-layered-runtime
technique: backend-parameterised-web-api
stack: rust
status: forged
verified_on: 2026-10-22
verified_against: rust@2021
applied: simulation
ab_verdict: unmeasurable
---

# A fetch seam with a typed error enum on one side and a string on the other

`xkazm04/pumper` at `d58f0826ac71374609f4be85602654d83e59e8ad` (public). The
tree is not a web-standard runtime, so the technique's first half does not
apply as written: there is no standard whose silence the host fills. It has,
however, the technique's exact shape on both sides of one boundary, and the
two sides disagree about the error rule. The Rust edition and `wasmtime = "49"`
witness are `Cargo.toml:98`; the toolchain was not exercised (simulation).

## The seam, and the half that confirms the technique

`HttpClient` is a backend trait whose verbs are the host's (`fetch`,
`fetch_bytes`), declared at `crates/core/src/engine.rs:1229`. Its optional
method ships a default that **fails loudly naming the missing capability**
(`engine.rs:1241-1245`, "this engine does not support binary fetch_bytes"),
and a conformance battery asserts that a fetch which cannot succeed returns
`Err` and never an empty `Ok` (`crates/server/src/e2e/engine_conformance.rs:75-80`).
That is the shipped-default rule and its absent-guard law, enforced as a test.

## The half that contradicts it

The guest-facing side of the same fetch is a WASM host interface whose
signature is `fetch: func(request-json: string) -> result<string, string>`
(`crates/engine-wasm/wit/pumper-app.wit:28`). Its implementation converts the
backend's error at the boundary with `Err(e) => return Ok(Err(e.to_string()))`
(`crates/engine-wasm/src/app_host.rs:291`). The backend's error is a typed
enum that computes three classifications the technique says must survive the
boundary: whether the failure is terminal for the job
(`error.rs:932`, six variants), whether it originates in the runtime itself
(`is_router_failure`), and the server-stated wait an HTTP failure could not
honour (`Error::Http { retry_after }`, `error.rs:440-452`). None of them is
in the `Display` text. The tree's own doc on the router predicate argues that
one carrier is enough because "nothing has to survive a boundary"
(`error.rs:956-958`); the WASM interface is that boundary, and the guest
receives one string. The template guest's whole handling is to wrap it in
prose and return (`plugins-src/wasm-app-template/src/lib.rs:84-85`).

## Three real cases, two policies

Policy A is the tree as it is; B carries the backend's kind and retry hint to
the guest as fields (a tagged `err` payload, still a string on the wire).

1. **A budget refusal mid-crawl.** `BudgetExhausted` is deterministic and
   terminal; the doc beside it records the incident the predicate exists for
   (three attempts and ~30 s of backoff re-deriving one refusal,
   `error.rs:930`). Under A a guest that catches the `err` arm cannot tell
   it from a 503 without matching the prefix `budget:`, so a guest that retries
   locally repeats the incident inside the sandbox. Under B it stops.
2. **A 429 whose `Retry-After` exceeds the fetch budget.** The runtime's own
   fixture carries this exact failure with a 600 s wait
   (`crates/server/src/e2e/requeue_policy.rs:77-82`). Under A the number is
   dropped at the boundary; the guest sleeps or retries blind. Under B it
   arrives as a field.
3. **A replay miss under VCR.** Terminal and a fact about the cassette, not the
   upstream. Under A the guest sees `vcr replay miss: ...` prose and cannot
   distinguish it from a transient engine failure except by substring.

**Prediction:** under B a guest can branch on terminal-versus-retryable and
read the stated wait in all three cases; under A only by substring on message
prefixes, which the tree's own error doc names as the anti-pattern ("forced
them to re-derive it by matching substrings", `error.rs:488`).
**Falsifier:** a plugin that never branches on a fetch failure and returns it
to the host unchanged (the template does exactly this), in which case the host
classifies the outer failure and nothing is lost. Shipped plugins import
nothing beyond `host`, so whether any real guest would branch is the open
question, and it decides whether this is a defect or a latent one.

## What this realization cannot do

It measured nothing: no arm ran, no guest was driven through the err arm. The
verdict is `unmeasurable`; the instrument is an e2e case in
`crates/server/src/e2e/` that drives the WASM `fetch` with a stub context
failing each of the three errors and asserts what the err string lets a guest
recover. It also finds a boundary of the technique itself: a WIT interface is
the host's own ABI, so there is no standard to supply the error taxonomy. The
rule still holds (the taxonomy is whoever publishes the ABI), but the
technique's phrase "the standard's exception type" assumes a standard exists,
which is one tree's evidence and not yet an amendment.
