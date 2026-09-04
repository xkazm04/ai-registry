---
layer: application
type: application
subject: test-input-generation
technique: stage-ordered-fuzz-targets
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.96
applied: simulation
ab_verdict: better
proof: structural-only
---

# Three targets in the tree that has them, and one harness in the tree that met the masking

The origin of the technique is `boa-dev/boa` at
`665f03924a54e5162be227e7e909612e36f6e35a`, a JavaScript engine in Rust
(`Cargo.toml:30` pins `rust-version = "1.91.0"`). The fleet project this
document applies it to is a scraping and research service whose
`rust-toolchain.toml:6` pins `channel = "1.96.1"`, the witness for the stack
version above; it runs operator-supplied WebAssembly plugins through a
three-stage trigger pipeline and tests that pipeline end to end.

## The origin: one target per stage, with the middle one justified in writing

`tests/fuzz/README.md` describes three grammar-aware, coverage-guided targets.
The parser target (`:20-36`) generates a syntax tree, prints it, parses it
*discarding errors* because generated trees need not be parseable, prints and
parses again, and asserts the second parse succeeds and equals the first - the
normalise-then-round-trip oracle the neighbouring technique now carries. The
bytecompiler target (`:38-41`) exists, in the document's own words, because its
assertion failures "may block the discovery of crash cases in the VM fuzzer" -
the masking-by-stage justification written beside the target. The VM target
(`:43-56`) generates a tree, converts it to source "to remove invalid inputs"
(the upstream stages as normaliser), executes under a finite instruction
budget, and states the time rule: "if a program takes more than a second or so
to execute, it likely indicates an issue in the VM". The budget is
`1 << 16` instructions behind a feature gate
(`tests/fuzz/fuzz_targets/vm-implied.rs:14`), and the limit error it raises is
the same uncatchable class the engine uses for every runtime ceiling.

## The fleet project: the masking, already met once

The project has no fuzz targets. What it has is the masking the technique
describes, encountered and named in its own source: `crates/server/src/triggers.rs:302-306`
records that "a configured predicate whose module was never built takes the
same fail-open path as a predicate that passed, so a gate nobody deployed is
indistinguishable from a gate that said yes" - a failure in the first stage
that was invisible from the end of the pipeline until a dedicated report
(`missing_hook_plugins`, `:309-319`) surfaced it at error level. That is the
technique's first decision rule, paid for once: the shallow stage's failures
must be drained and named, or the deep stage's verdicts are not evidence.

## The simulation

Three cases from the only harness that drives the real plugin host
(`crates/server/src/e2e/trigger_plugins.rs`), walked under A (one end-to-end
harness, as today) and B (a predicate target and a transform target, triaged in
pipeline order, the plugin stage under its fuel budget):

1. `every_sandbox_failure_mode_fails_open_not_closed` (`:340`). Under A a
   predicate trap fires the hop open and the transform stage runs on an input
   the predicate never judged; a transform defect on that input is masked by
   the predicate's failure. Under B the predicate target drains its crash set
   first and the transform target is fed only inputs the predicate accepted, so
   the transform defect is reachable.
2. `non_json_transform_output_is_recorded_as_malformed` (`:604`). Under A the
   malformed-output path is reached only through a full hop. Under B it is the
   transform target's own oracle - output must parse as JSON - and every
   generated envelope exercises it.
3. `a_missing_plugin_is_recorded_once_not_once_per_event` (`:673`). The tree's
   own fix for stage masking, which B generalises: the unrunnable stage is
   reported, never passed open silently.

Predicted outcome: B finds transform-stage defects on inputs the predicate stage
rejects or traps on, which A cannot reach; A finds only what survives the
predicate. **What would falsify it:** if no transform defect exists behind a
predicate failure in the e2e corpus, the extra target finds nothing, and the
measurement is to run the transform target alone over the inputs the predicate
stage trapped on and count distinct failures. The verdict `better` is a
prediction from three real cases, not a measurement, and the next step is the
harness itself - two targets over the inline-`wat` fixtures the suite already
holds, roughly two files and a hundred and fifty lines, gated by the existing
e2e run.

## What the realisation cannot do

The fleet project's plugins are opaque binaries, so a per-stage target can
generate envelopes and verdict shapes but not plugin behaviour; the plugin
stage's oracle stays crash-and-budget, exactly as the technique says the deepest
stage's usually does. The origin's targets find terminations and lost
information, not wrong answers: none of the three carries a model oracle, and
the document says so.
