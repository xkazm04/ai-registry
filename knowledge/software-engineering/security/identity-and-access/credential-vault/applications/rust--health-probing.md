---
layer: application
type: application
subject: credential-vault
technique: health-probing
stack: rust
status: forged
verified_on: 2026-09-23
verified_against: rust@1.96
applied: experiment
ab_verdict: not-better
---

# A four-state probe that got the verdict and attempt split right in storage, and still files every non-2xx as a failure

*Verified against the project tree at `f05c1759f`. The toolchain is pinned by
`rust-toolchain.toml` to 1.96.1. The manifest floor is `rust-version = "1.80.0"`.*

This desktop vault's probe engine is `src-tauri/src/engine/healthcheck.rs`.
The tree carried a boolean `{success, message}` for most of its life.
On 2026-09-17 and 2026-09-18 three commits walked the probe result
through the hops this technique names: `afa6c42cb` (store), `1c4d15f98`
(the hook's catch clause), `9469b22f9` (the renderer). The walk was
worth doing, and the tree shows what is left over when it is done hop by
hop.

## The vocabulary, and the split between verdict and attempt

`HealthProbeState` (`:20-43`) has four members: `Verified`, `Unverifiable`
(the connector exposes no probe at all), `Failed` and `Unreachable`. That is
the technique's three states, with unknown split into cannot-probe-ever and
cannot-probe-now, and both halves are documented at the enum. `is_verdict`
(`:58-62`) makes the split a predicate: everything except `Unreachable` is a
judgement about the credential.

`persist_healthcheck_outcome` (`:661-696`) is the single writer the IPC
command, the post-create verify and the daily sweep share. It keeps the
verdict and the attempt apart in storage. A verdict appends to the history
ring, overwrites the last-success fields and stamps the typed state
(`:692-695`). An `Unreachable` outcome writes none of those. It records
`healthcheck_last_unreachable_at` and `_message` (`:677-690`), so the last
real verdict stands and the attempt is still recorded. `persist_probe_state`
(`:647-659`) refuses a non-verdict for the same reason. On the transport
side, only connect and timeout errors become `Unreachable` (`:1221-1229`).
Any other send error stays a failure.

## Where it falls short of the technique

- **Every non-success status is a verdict.** The HTTP probe returns
  `HealthcheckResult::probed(false, "Service returned HTTP N")` for any
  non-2xx (`:1198-1209`), so it persists as `Failed`. That includes a 429, a
  503 during an outage, and a 403 that some providers use for an exhausted
  rate limit. The technique's table puts every one of those in unknown. The
  offline laptop can no longer paint the vault red, but a provider outage
  can, and the fix commits did not touch this path because the fix was
  aimed at the catch clause.
- **The attempt is written and never read.** No TypeScript file reads
  `healthcheck_last_unreachable_*`, and nothing in the Rust tree outside the
  writer does either (grep at `f05c1759f`, zero hits). The storage keeps the
  two facts, but every surface renders only the verdict, which amounts to
  keeping the last green silently one layer up.
- **The compatibility boolean carries the gate's policy.** `success` is
  kept "for back-compat" and documented as `state != Failed` (`:70-72`).
  But `unreachable()` sets it false (`:93-99`) and `unverifiable()` sets it
  true "for gating purposes" (`:101-109`), so the comment and the
  constructors disagree about what the field means. According to
  `9469b22f9`'s message, the credential form's result display keyed on this
  boolean, drew a green check for unverifiable and a red cross for
  unreachable, and was fixed there. The sweep summary counts on the typed
  state and says why (`:698-723`). It also folds `Unreachable` into the
  `unverifiable` bucket (`:708-716`), so the summary's count merges
  cannot-probe-now with cannot-probe-ever, which the technique keeps apart.
- **The kind of a failure crosses as prose.** The result has no rejection
  kind field. The catalog's translator gets one back from the message:
  `extractHttpStatus` lifts `HTTP (\d{3})` out of the text with a regular
  expression (`src/features/vault/sub_catalog/components/design/CredentialDesignHelpers.ts:255-258`)
  and switches on it, and other branches match phrases the backend wrote
  (`:308`, `:313`). This is the decay the verdict-survives-boundary law
  describes, and the backend's wording is now part of the frontend's
  contract.

## What this cannot prove

- The status-code finding is structural. No probe of a rate-limited or
  unavailable provider was run or observed, so this page records how the
  code files those answers and not how often they happen.
- The TypeScript binding for the result is hand-maintained
  (`src/lib/bindings/HealthcheckResult.ts`, serde-only on the Rust side).
  Before `afa6c42cb` it was missing `unreachable` even though the backend
  had emitted it for some time. The four-member union matches the enum at
  this commit, but nothing enforces that.

## Applied 2026-09-23 - two experiments, read-only against the tree

**Verdict and attempt: `not-better`, and the technique gained an ordering clause.**
Write sets extracted from source: 0 of 3 verdict writers clear the attempt fields (the
engine's single writer, the gateway sweep, the renderer's post-probe patch), and the
attempt fields have no reader outside their writer. Over 120 outcome sequences of length
1-4, the tree hides the attempt in all 40 that end unreachable. The rule as first landed,
paired with a reader that only checks whether an attempt is present, fixes those 40 but
shows a stale "could not check" in 50 of the 80 that end in a verdict. A reader that
compares the two times, or a verdict that clears the attempt, gets 0 and 0. The clear is
one line here: the metadata patch already deletes a key sent as null. Not hunted: the
gateway sweep persists through its own path with no unreachable branch, so a connection
error there is still filed as a failed verdict. This is a model over extracted write sets,
not an executed run.

**Which answers are verdicts: `better`.** The shipped catalog carries 115 probe recipes
over 113 connectors. The probe reads the status line only, with no headers or body, so 0
recipes read a rate-limit header. One recipe declares an expected status that the parser
never reads. Over 9 answer shapes documented by 3 providers, the status-line classifier
gets 2 right and the typed-signal partition gets 5. Revoked keys are answered 401 by two
providers and 200 by the third, so none is quota-shaped or 5xx, and the per-provider
override the partition feared is not needed here. The floor, real rejections kept as
failures, is 2 of 4 in both arms: one provider answers a revoked token with HTTP 200 and
an error body, which both arms draw green. The status line fails in the success direction
too, and quota signals carried in a body are missed by a header-only reader. The evidence
is provider documentation, not recorded answers.
