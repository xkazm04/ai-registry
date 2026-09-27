---
layer: application
type: application
subject: agent-run-budgeting
technique: termination-cause-record
stack: process
status: forged
verified_on: 2026-09-27
applied: code
ab_verdict: better
---

# Process: a closed judge seat that graded a right answer wrong

A benchmark of memory designs (the personas memory-year harness) drives every model call -
the consumer that answers probes, the judge that grades them, and the writers some designs
use to consolidate - through one wrapper around `claude -p --output-format json`. The
wrapper had one failure path for everything: if the envelope said `is_error`, sleep 5, 10,
15 and 20 seconds between four attempts, then raise a generic error with the last message.

## What the CLI actually sends when the seat refuses

Two shapes, both from the runner's issue tracker and both read verbatim on 2026-09-27:

- A per-model rate limit on a logged-in subscription session (CLI 2.1.49):
  `"subtype": "success"`, `"is_error": true`, `"result": "API Error: Rate limit reached"`,
  `"stop_reason": "stop_sequence"`, `duration_api_ms: 0`, zero tokens, **exit 0**.
- A five-hour session limit on a later version: the same success-subtype-with-error
  envelope, now carrying `"api_error_status": 429`, and in stream mode a
  `rate_limit_event` with `"status": "rejected"`, a `resetsAt` instant and
  `"rateLimitType": "five_hour"`.

The runner's own SDK documentation now says to check the terminal reason before the
subtype, because an API failure is reported with subtype `success`.

## The A/B

Six planted cases, the same envelopes through both versions of the wrapper and the judge,
with the CLI and `sleep` replaced so no model ran and no time passed:

| Case | A (origin) | B |
| --- | --- | --- |
| session limit, status forwarded | 4 calls, 50 s slept, generic error | 1 call, `SeatLimit` |
| per-model limit, no status | 4 calls, 50 s slept, generic error | 1 call, `SeatLimit` (text fallback) |
| provider overloaded (529) | 4 calls, 50 s, generic error | unchanged - capacity keeps the backoff |
| server error (500) | 4 calls, 50 s, generic error | unchanged |
| a successful reply quoting "rate limit" | accepted | accepted - text is read only from errored envelopes |
| **judge extraction on a closed seat** | **`wrong-old`, note "judge-degraded: extraction failed, raw reply judged"** | stops; nothing stored |

The last row is the finding. The judge's extraction step swallowed errors on purpose - "the
judge failed, not the design" - and fell back to judging the raw reply. The planted reply,
"Django, changed from Axum in April", is correct (the gold is Django), and the raw-text
reading scored it **wrong-old** because it names the superseded value. The verdict went to
`answers.partial.jsonl`, and `--resume` counts every stored probe as done. So a judge seat
closing mid-run would not have stopped anything: it would have spent 50 seconds per probe
turning the rest of the run into degraded verdicts, some of them wrong, all of them charged
to the design under test and none of them redone on resume.

## What changed

- `failure_cause()` reads `api_error_status` (429 allowance, 529 capacity) and the cap
  subtypes first, the error text second, and never the text of a successful reply.
- An allowance refusal raises `SeatLimit` on the first call. The judge, and the two
  writer designs whose catchers record model failures as "data about the design", let it
  through, so the run stops and resume redoes the probe after the reset. The refusal
  message still carries the CLI's "resets 3:40pm" text, which the harness's window
  supervisor parses.
- A model-free check plants the six envelopes and exits non-zero on any misclassification.
  The judge's existing calibration check produced byte-identical output before and after.

## Verdict and its limits

**Better**, measured as behaviour on planted envelopes of known shape, n = 6. Not measured:
a live seat exhaustion. No stored run in the harness's output directory carries a refusal
(its error logs hold only dependency warnings), so the defect cannot be shown to have
corrupted a published ladder - only that the next exhaustion during a judged run would
have. The version without `api_error_status` depends on the text fallback, whose
vocabulary is the one gap left.
