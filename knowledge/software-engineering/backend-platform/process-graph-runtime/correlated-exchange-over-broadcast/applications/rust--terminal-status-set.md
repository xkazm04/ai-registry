---
layer: application
type: application
subject: correlated-exchange-over-broadcast
technique: terminal-status-set
stack: rust
status: forged
verified_on: 2026-10-22
verified_against: rust@1.96.1
applied: experiment
ab_verdict: better
---

# A synchronous wait whose unknown status means "keep waiting", pinned by its own test

The Personas desktop app answers agent-to-agent messages by starting a persona
execution and polling its stored row until the row ends. That poll is the
technique's wait: one identifier, a status string as the only end condition. The
loop is `run_persona_synchronous` in `src-tauri/src/engine/management_api.rs`,
the verdict function is `a2a_terminal_outcome` beside it, and the vocabulary is
the lifecycle enum in `src-tauri/core/src/lifecycle.rs`. The toolchain witness is
the pinned channel in `rust-toolchain.toml`.

## What the tree does, against the technique

- **The set is closed and enumerated.** Six states (queued, running, completed,
  failed, incomplete, cancelled), one legacy alias (`pending` reads as queued),
  and `is_terminal` is simply "not queued or running". All three of the technique's
  terminal states exist (completed, failed, cancelled), plus a fourth the technique
  would call a classification of aborted (`incomplete`: the process died).
- **Matching is exact.** The generated `FromStr` compares the raw string, so
  `Completed`, `COMPLETED` and a trailing space are all unrecognised.
- **One authority.** Rows are written through the enum, so the only way an
  unrecognised value reaches the poll is a legacy row, a newer build's state read
  by an older one, or a hand edit.

## Seam chosen to falsify

The technique's central rule: a status outside the set is the failure value,
never "not yet terminal". The tree states the opposite in a doc comment (`None`
while the row is active "or its status is unrecognised") and pins it with a test
named `a2a_poll_keeps_waiting_on_active_or_unknown_status`. A CAUGHT outcome
teaches that the tree has the defect the technique names, with a test written to
defend it; a clean tree would have been the stronger corroboration, and the seam
could have returned it.

The function is pure, so it was lifted verbatim into a scratch harness (the app
crate's test binary does not launch on this machine, and a full compile of the
crate was not spent on a one-line arm). The enum was replicated with the same
exact-match parse and alias. Arm B: an unparsed status returns a failure outcome
at once; everything that parses behaves as before.

| | Arm A (tree) | Arm B (technique) |
| --- | --- | --- |
| unrecognised statuses held until the 600 s deadline (8 tried: unknown word, three case or whitespace variants, a foreign spelling, a plausible future state, empty) | 8 of 8 | 0 of 8 |
| unrecognised statuses read as success | 0 of 8 | 0 of 8 |
| known statuses behaving as in arm A (4 terminal, 3 active including the alias) | 7 of 7 | 7 of 7 |

Target: unrecognised statuses that hold the caller to its deadline, 8 of 8 down
to 0 of 8. Floor: known statuses unchanged, 7 of 7 held; no unknown reads as
success in either arm. Verdict `better` on the replica. Under arm A the caller
learns a "timed out waiting for terminal status" error ten minutes late, which
points at latency when the defect is a spelling, exactly the diagnosis the
technique predicts.

## What the tree adds that the technique does not say

- **A future state is the real risk in arm B.** If a later build adds an active
  state the older reader does not know, arm B aborts a healthy run where arm A
  would have waited. The technique's asymmetry argument (loud and local beats a
  silent ten-minute hang) holds, but the closed-set rule has a versioning edge:
  the failure message should name the unrecognised value so the abort is
  explicable, which arm B does.
- **Cancelled and failed leave as one error.** Both become the same
  `AppError::Execution` carrying the row's error text, so a caller cannot tell the
  requester's own cancellation (never retried) from an executor failure
  (retryable). Of the technique's three-way classification only success survives
  the boundary.

## What it cannot show

- **Not the app binary.** The harness proves the verdict function and the parse,
  not the crate that hosts them; the existing unit test in that module would flip
  one assertion (`bogus` now terminal) and is the real gate for the change.
- **No timeout obligation is met.** When the 600 s deadline passes the loop
  returns an error and does nothing to the execution; the technique asks for a
  cancellation or an abandoned mark, and the row keeps running unobserved. Not
  measured here.
- Nothing was shipped to the project: the current behaviour is a stated decision
  with a test, so changing it is the owner's call, and the gate to run is the
  module's test filter on the app crate with the desktop feature.
