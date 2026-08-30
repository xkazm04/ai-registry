---
layer: application
type: application
subject: production-trace-scoring
technique: drift-classified-rescoring
stack: rust
status: forged
refresh_by: 2026-11-20
verified_on: 2026-08-30
verified_against: rust@1.97
---

# Rust: drift-classified re-scoring in LightTrack's `score-traces` loop

LightTrack's auto-scoring daemon (`crates/runner/src/score_traces.rs`)
realizes the full pipeline — settle window, stable-hash sample, coverage
receipt, drift classification — in one small Rust surface. This application
walks the drift half; the queue half is in the sibling application.

## The receipt: `TraceCoverage` stamped on the verdict

`crates/core/src/trace.rs:102-118` defines the receipt stored inside
`ScoreDetail::coverage` (`crates/core/src/score.rs:99-104`, stamped by the
API on `POST /v1/traces/:id/score`, never composed by the client):

- `spans` — the trace's **true** span count at judging time
  (`spans_total`), so a read clipped by the span cap still records the real
  number and never manufactures phantom drift;
- `root_event_id` + `digest` — the judged exchange's identity and an
  FNV-1a fingerprint over root id + input + output. The doc comment at
  `trace.rs:96-101` states the scoping decision exactly as the technique
  does: the digest covers the root exchange, not every span, "so it changes
  exactly when the judged text changes", and it survives the truncation cap
  because the detail read keeps the oldest spans — "a truncated trace must
  never be mistaken for a changed one";
- `truncated` — provenance only, "never a drift signal" (`trace.rs:114-117`).

The fingerprint hash choice is argued in the source in cost terms
(`trace.rs:160-161`): FNV-1a because it is "stable across processes and
releases — a digest that changed with the toolchain would re-score every
trace once, which costs real money."

## The classification: `TraceDrift` with three states

`trace.rs:121-146` is the none/grown/changed enum verbatim, with the spend
asymmetry in the doc comments: Grown = "re-judging would re-send
byte-identical text, so it does not justify spending on a fresh judge
call"; Changed = "the only drift that earns a re-score." The `drift()`
comparison honors the absence rule: an empty stored digest "can only be
compared on size — never claim a content change we cannot see"
(`trace.rs:138-141`).

## The spend gate: only `"changed"` reopens a scored trace

The scorer side (`score_traces.rs:231-265`) turns the classification into
the purchase decision. `trace_already_scored` treats a verdict as covering
unless `verdict_superseded` — and that predicate is a single line keyed to
one wire word: `stale.reason == "changed"` (`score_traces.rs:263-265`).
The function's doc comment (231-247) is a compressed statement of the
technique: "'Material' is deliberately narrow, because re-scoring spends
real money on an unbudgeted judge... A 'grown' trace... would re-send an
identical prompt for an identical verdict, so it is surfaced to the
operator on read and left alone here. A verdict with no coverage recorded
... reports no staleness and therefore still covers: the pre-existing skip
behaviour, never a retroactive spend."

Correction is append-only: the stale verdict stays; the fresh one is
posted; and because "one covering verdict is enough," a corrected trace
(stale + fresh) reads as covered and is not re-scored again — pinned by the
test at `score_traces.rs:384-413`, which asserts all four cases: changed
reopens, grown does not, receipt-less verdicts still cover, corrected
traces stay closed.

## The settle window it backstops

The same file's header (`score_traces.rs:9-19`) states the pairing with
settle-window-completion: completion is approximated ("traces carry no
explicit end marker") by a `--settle-secs` quiet window, default 120s, and
"the settle window is a heuristic, not a guarantee, so a second line of
defence sits behind it" — the coverage receipt plus this drift gate. The
cutoff computation is `score_traces.rs:112-114`: settled = newest event
older than now minus the window, applied as an `until=` filter on the
trace listing, a pure query property with no stored completion flag.

## Transferable observations

- The entire spend policy is two pure functions (`should_score`,
  `trace_already_scored`) taking everything as parameters — which is why
  the file can unit-test spend discipline without a store or a judge.
- Every "why" in the technique appears as a doc comment adjacent to the
  code enforcing it, in money terms. When the policy is about not paying
  twice, writing the price into the comment is what stops a future
  refactor from "simplifying" grown into a re-score.
