---
layer: application
type: application
subject: measurement-honesty
technique: the-baseline-is-the-untouched-path
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.91
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# A saving booked against the arm the tool asked for

The tree is rtk, an open-source command proxy that compresses the output of a
coding agent's shell commands and reports the tokens it saved, read at commit
`f53e6033` on its default branch; every manifest declares
`rust-version = "1.91"`, and the binary measured here was built from that
commit with rustc 1.97.1, its tracking database pointed at a scratch path.

## The control arm is the proxy's own invocation

For the commands whose output it parses as structured data, the proxy adds the
tool's machine-readable flag and reads that: the test runner's
`src/cmds/go/go_cmd.rs:56 "if !skip_json {"` and the linter's
`src/cmds/python/ruff_cmd.rs:79 "--output-format=json"`. The tracked "raw"
is the output of the command it ran, so the structured form is the control
arm. Measured on one five-test suite with a failure and one small lint run:

| Command | Plain | Injected | Emitted | Booked |
| --- | --- | --- | --- | --- |
| test runner | 73 B | 3,024 B | 224 B | 95.1% saved |
| linter | 3,349 B default, 1,133 B concise | 13,782 B | 1,313 B | 90.5% saved |

Against the request the agent issued, the test runner's output tripled and the
lint output was larger than the tool's own concise form. Both bookings are
correct arithmetic over the wrong denominator. The tree contains the honest
form of the measurement once, for a command where it runs the plain form
separately to have a baseline,
`src/cmds/git/git_cmd.rs:2332 "let mut raw_cmd = git_cmd_c_locale(global_args);"`,
which prices the remedy: one extra run where the plain form is cheap.

## Both arms through one estimator

Both arms are counted with one estimate,
`text/src/lib.rs:84 "(len as f64 / 4.0).ceil() as usize"`, and the user guide
draws the conclusion the technique says does not follow in general,
`docs/guide/analytics/gain.md:115 "so the percentage is reliable"`. The tree's
own paired filter tests make the check possible: 84 pairs of an original and
the expected filtered output, each counted by the estimate and by a real
subword tokenizer.

| Measure | Estimate | Tokenizer |
| --- | --- | --- |
| mean saving | 50.6% | 51.2% |
| per-pair error | 29.7 points under to 16.6 over | - |
| tokens per estimated token, original side | - | 1.17 |

The guide is right about the aggregate on this workload and wrong per item,
and the per-item uses are the ones the tree makes: the never-worse guard
compares the two arms per call, and per-filter verdicts rank filters by their
savings. The sign of the error followed what a filter removed - download lines
overstated, status lines understated - so a per-filter bar on the estimate
favours one kind of filter. The proxy daemon in the same repository already
counts with a real tokenizer for its own transform decisions,
`proxy/src/tokenizer.rs:1 "Token counting via a real BPE tokenizer"`, so the
instrument is in the tree; the command proxy does not use it.

## One cap, one view

The headline excludes rows whose raw output exceeds what the host would have
ingested, `src/core/tracking.rs:363 "Rows above it claim savings against bytes the agent"`,
applied at `src/core/tracking.rs:1196 "if input > HEADLINE_INPUT_CAP_TOKENS {"`.
That is this technique's rule applied to one boundary - the agent never read
bytes the host truncated - and it is applied to the headline only; the
per-command table, the graph and the telemetry total sum the same rows
uncapped, which is
[co-published-numbers-must-reconcile](../techniques/co-published-numbers-must-reconcile.md)
rather than this technique.

## What this realization cannot do

It cannot report a saving against a path it never observed, and for the
injected-format commands it observes only its own. The fix is not a better
estimator; it is a different denominator.
