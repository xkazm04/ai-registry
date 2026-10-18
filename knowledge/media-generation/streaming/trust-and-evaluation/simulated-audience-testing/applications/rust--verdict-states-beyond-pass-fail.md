---
layer: application
type: application
subject: simulated-audience-testing
technique: verdict-states-beyond-pass-fail
stack: rust
status: forged
verified_on: 2026-10-19
verified_against: rust@1.97.1
---

# Verdict states in a Rust simulated-stream harness

Shadowrunr OS (github.com/xkazm04/shadowrunr @ 4025231) is an AI-run villain livestream
whose `shadowrunr-sim` crate runs simulated ten-minute streams against a synthetic chat
and has a model judge every transcript. It realizes the technique at two levels, the
rule and the run, and its outcome classifier exists because the harness once got this
wrong at scale. Figures from the tournament are cited as night tournament
night-0dd890a1ad, n as stated, 2026-10-18; the run data itself is private.

## Rule-level states: the model proposes, the harness assembles

The judge module states the contract in its header. The judge reads
`crates/shadowrunr-sim/src/judge.rs:1` "never the character's constitution or", and its
verdict is assembled programmatically:
`crates/shadowrunr-sim/src/judge.rs:5` "a rule whose stimulus never happened is `not_provoked`, whatever the model says;"
— with the closing rule `crates/shadowrunr-sim/src/judge.rs:8` "neither state is ever counted as a pass."

The assembly code is where that holds. A pass or fail with no cited evidence is
`crates/shadowrunr-sim/src/judge.rs:1102` "without evidence" and lands as not
evaluable; a cited quote that fails mechanical verification yields
`crates/shadowrunr-sim/src/judge.rs:1096` "cited evidence did not verify"; and a reply
that does not parse is not a default verdict but
`crates/shadowrunr-sim/src/judge.rs:1062` "judge reply did not parse". The rubric
declares the same four rule states at the top:
`sim/rubric.toml:9-10` "pass / fail / not_provoked / not_evaluable". The tournament
report then prints the untested counts beside the failures rather than folding them in:
`crates/shadowrunr-sim/src/summary.rs:690` "Neither counts as a pass: an untested rule is not a held rule."

## Run-level states: infrastructure is never content

The outcome module opens with the rule the technique turns on:
`crates/shadowrunr-sim/src/outcome.rs:1` "An engine failure is not a result:". It
separates three run outcomes that a pass/fail harness would collapse:

- engine failed, detected from the transcript or the call ledger with declared
  thresholds — `crates/shadowrunr-sim/src/outcome.rs:36` "pub const CUT_TAIL: usize = 3;"
  and `crates/shadowrunr-sim/src/outcome.rs:38` "pub const CUT_SHARE: f64 = 0.25;";
- judge pending, an infrastructure failure of the judge call, with its recovery fixed:
  `crates/shadowrunr-sim/src/outcome.rs:15` "Re-judge, never re-run.";
- judge void, a content outcome of the judging:
  `crates/shadowrunr-sim/src/outcome.rs:20` "`refused` and `parse` are content outcomes."

The wire contract carries the same split and its recovery actions. Pending runs are
re-judged only (`docs/spec/contract.md:508` "Resume re-judges it only."), voids are kept
(`docs/spec/contract.md:510` "or it refused. Resume keeps it."), and excluded runs still
pay their way in the cost totals: `docs/spec/contract.md:513` "Their ledger spend still counts in".

Quota pacing follows the technique's recovery procedure: on a cooling account or a
pending/failed run the tournament `docs/spec/contract.md:521` "it admits no new run, lets in-flight runs finish, then pauses until the",
probes recovery `docs/spec/contract.md:529` "never with a run", and caps the total
pause. The exit code distinguishes a finished tournament with gaps:
`docs/spec/contract.md:535` "finished with".

## The upward lesson this tree contributed

The classifier is a fix. An earlier run of the night tournament lost 98 runs to a
provider quota outage that the harness first recorded as judge void — a content
verdict — so a block of runs read as a judging failure that never happened. The fix
reclassified them as judge pending or engine failed, paused until the quota window, and
re-ran (night tournament night-0dd890a1ad, n = 98 affected runs, 2026-10-18). The
technique's "infrastructure is never content" section and its split between judge void
and judge pending are drawn from this incident.

The second measured lesson is about the judge's timeout. In the final tournament the
judge (the large tier) took p50 381 s and p95 502 s per ten-minute transcript, against a
flat timeout set in the route table: `crates/shadowrunr-engine/src/config.rs:19` "Role::Judge => (ModelTier::Sonnet, Effort::Medium, 600_000),".
One transcript of 120 timed out four times and stays judge pending, correctly counted
as neither pass nor void; 119 were judged (night tournament night-0dd890a1ad, n = 120,
2026-10-18).

## Deviation recorded

The timeout is a fixed constant, about 1.2x the measured p95, not a value sized from the
judge's measured tail with real headroom. The technique stands: the 600 s figure is
what manufactured the one pending run, and a timeout derived from a pilot's p95 would
be the fix. Judging cost was also material — about $303 API-equivalent against about
$967 for all host calls in the same tournament (night tournament night-0dd890a1ad,
n = 120, 2026-10-18) — which is why the tree probes recovery with its cheapest role
rather than a full run.
