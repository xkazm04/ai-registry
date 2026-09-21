---
layer: application
type: application
subject: status-vocabulary
technique: number-formatting
stack: rust
status: forged
verified_on: 2026-09-09
verified_against: rust@1.85
---

# A placeholder that grew a unit, and the test that had to assert two branches

`AlexsJones/llmfit` at `1e7bdb3ecf43071597ffd2eb2305dfac35e22a40` prints a
fixed-width benchmark table to a terminal — one row per run, columns for
throughput, time-to-first-token, total latency and token count. The version
witness is the maintainer's stated minimum in `AGENTS.md:16` (*"Minimum
supported Rust version: whatever edition 2024 requires (1.85+)"*), corroborated
by `edition 2024` on every crate (`Cargo.toml:5`); there is no `rust-version`
field and no toolchain file.

Time-to-first-token is optional — `ttft_ms: Option<f64>` — and the original row
formatter handled that correctly, then lost it one character later
(`llmfit-core/src/bench.rs`, before commit `1e7bdb3e`):

```rust
println!(
    "  {:>3}  {:>6.1}   {:>5}ms  {:>5.0}ms  {:>5}",
    i + 1,
    run.tps,
    run.ttft_ms
        .map(|t| format!("{:.0}", t))
        .unwrap_or_else(|| "n/a".to_string()),
    run.total_ms,
    run.output_tokens
);
```

The absent case is handled inside the mapping, which is what the technique asks
for, and the value that comes out of it is correct: `"n/a"`. The unit is not in
the branch — it is the literal `ms` in the format string, one position after the
`{:>5}` slot, because the unit was understood as a property of the column. Every
row in that column is milliseconds. Except the rows that are not a measurement
at all, and for those the output is **`n/ams`**.

## What the defect is and is not

Nothing was rounded wrong and no false quantity was asserted, so the failure is
not the usual one this subject guards against. It is narrower and it is a
vocabulary failure: the token meaning *no measurement* is `n/a` in a column
without a unit and `n/ams` in this one. A reader scanning for absence has to
know the column's unit to recognise the placeholder, which is the property a
closed vocabulary exists to remove.

The fix (`#1001`, "normalize latency formatting") moves the unit inside the
branch that has a quantity and pads the composite rather than the number:

```rust
fn format_run_row(index: usize, run: &BenchRun) -> String {
    let ttft = run
        .ttft_ms
        .map(|value| format!("{value:.0} ms"))
        .unwrap_or_else(|| "n/a".to_string());
    format!(
        "  {index:>3}  {tps:>6.1}   {ttft:>5}  {latency:>5.0} ms  {tokens:>5}",
        tps = run.tps,
        latency = run.total_ms,
        tokens = run.output_tokens,
    )
}
```

`ms` now appears only where a number does. The same commit separates the latency
column's unit from its value for the second half of the same cause: at
`{:>5.0}ms` a run of `222367.0` overflows the five-wide slot and renders
`222367ms` with the unit hard against the digits, so padding the number and
appending the unit puts the unit at a position that depends on the magnitude.
One correction fixes both.

## The structural fact: the extraction is what made it testable

The row was previously formatted inside a `println!` in a loop, which is why it
had no test — there was no value to assert, only a side effect on stdout. The
fix extracts `format_run_row` returning a `String`, and the test that arrives
with it is the technique's enforcement note verbatim
(`llmfit-core/src/bench.rs`, test module):

```rust
#[test]
fn formats_missing_and_present_latency_units_consistently() {
    // ...
    assert_eq!(format_run_row(1, &missing), "    1     1.3     n/a  222367 ms    300");
    assert_eq!(format_run_row(2, &present), "    2     1.5   41 ms  206647 ms    300");
}
```

Both branches are asserted in one test, and the test's name is the invariant
rather than the function. That is the shape the defect requires: each branch is
correct alone — `41 ms` is right and `n/a` is right — and the property that
broke is only visible in the relation between them. A test written for the
present case, which is the case an author reaches for first, passes for as long
as the sentinel is wrong. The chosen fixture values are the tell that this was
found in use rather than by review: `222_367.0` ms and `1.3` tokens per second
are a real slow run on real hardware, not a round number somebody invented.

## What this realization does not do

The primitive here is one function serving one table, not a program-wide
formatting authority. There is no locale resolution — the output is a
developer-facing monospace report where `.` is the decimal separator by
assumption — and no gate prevents the next column from appending its own unit
outside its own branch. The tree fixed the instance and did not build the
authority, so it is evidence for the rule and not for the enforcement half of
the technique. What it does supply is the failure mode in its cheapest form:
the absent case was handled correctly and still rendered wrong, because
correctness inside the branch does not survive concatenation outside it.
