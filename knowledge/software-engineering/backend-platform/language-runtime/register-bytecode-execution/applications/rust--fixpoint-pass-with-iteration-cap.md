---
layer: application
type: application
subject: register-bytecode-execution
technique: fixpoint-pass-with-iteration-cap
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.91
---

# A per-pass fixpoint with a cap of ten, and statistics that derive what they should count

Boa's AST optimiser (`core/engine/src/optimizer/`, `boa_engine` 0.22.0, commit
`665f03924a54e5162be227e7e909612e36f6e35a`) runs constant folding, strength reduction
and dead-code elimination as visitor passes over the parsed tree before compilation. The
version witness is `Cargo.toml:30` (`rust-version = "1.91.0"`). The optimiser is small
enough to read in one sitting and it realises the technique's loop and cap exactly, and
its statistics are the technique's counter-example.

## The loop sits around one pass on one node

`run_constant_folding_pass` at `optimizer/mod.rs:105-124` is the fixpoint: a `for _ in
0..Self::MAX_PASS_ITERATIONS` around a postorder `Walker` over one expression, breaking
when `walker.changed()` is false. `run_strength_reduction_pass` at `mod.rs:131-146` is
the same shape. `MAX_PASS_ITERATIONS` is 10 (`mod.rs:126-128`), with the comment "This
prevents infinite loops if a pass has a bug that keeps producing changes", which is the
technique's reason for the cap in the tree's own words.

There is no outer loop over the whole pipeline. `run_all` at `mod.rs:148-162` runs
folding then reduction once each per expression, and the `VisitorMut` impl at
`mod.rs:183-215` recurses into a statement's children first and applies dead-code
elimination to the statement afterwards, so a branch whose condition folds is seen by
elimination after folding has finished with it. The ordering is the proof the technique
asks for, and it is present as a comment ("First, recurse into children so constant
folding and strength reduction run on nested expressions. Then apply dead code
elimination") rather than as a test; a future pass that enables a parent the walk has
already left would need the outer loop, and nothing in the tree would notice.

## Deviation: mutating and checking are derived, and the cap is silent

`OptimizerStatistics` at `mod.rs:47-58` keeps, per pass, a `run_count` (invocations of
the fixpoint) and a `pass_count` (iterations inside it). The `Display` impl at
`mod.rs:60-84` prints constant folding as "{pass_count} pass(es) ({mutating} mutating,
{checking} checking)" where mutating is `pass_count.saturating_sub(run_count)` and
checking is `run_count`. The derivation assumes every invocation ends with exactly one
non-mutating iteration. An invocation that hits the cap ends with a mutating tenth
iteration and no checking one, so the printed split is off by one in each direction in
the one case the statistics should flag, and nothing prints that the cap was hit at all;
the loop at `mod.rs:110-123` breaks on `!walker.changed()` and falls off the end of the
`for` identically. Strength reduction prints no split (`mod.rs:74-77`), and dead-code
elimination counts eliminations only (`mod.rs:57`, `mod.rs:207-211`). The technique's
standard is two counted counters per pass and an explicit cap-hit line; the tree derives
one and reports the other nowhere, and the standard stays.

## Confirmed: the eliminating pass refuses hoisted declarations

`optimizer/pass/dead_code_elimination.rs:10-56` is a `ContainsHoistedDeclarationsVisitor`
that sets `found` and breaks on the first `var` declaration, function declaration,
generator declaration, async function declaration or async generator declaration.
`try_eliminate_if` at `dead_code_elimination.rs:76-98` folds only a literal boolean
condition, and before replacing the statement with the live arm it walks the arm being
discarded and returns `PassAction::Keep` if the walk found anything; `try_eliminate_while`
and `try_eliminate_for` (`dead_code_elimination.rs:100-128`) apply the same walk to a
loop body under a literal-false condition. The visitor is the generic tree visitor and
descends into nested function bodies, so it over-refuses in the nested case, which is
the safe side of the sibling technique's trade.

## Where the switch and the counters are seen

`OptimizerOptions` at `mod.rs:17-34` is a bitflag set with `STATISTICS` alongside the
three passes, and `apply` at `mod.rs:165-177` prints the statistics to standard output
when the flag is set. The guest-facing switches for the same options are the
introspection subject's concern and are not cited here.
