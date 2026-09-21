---
layer: application
type: application
subject: test-harness
technique: configuration-axes-cross-the-ladder
stack: rust
status: forged
verified_on: 2026-09-17
verified_against: rust@1.80
---

<!-- version witness: the project declares rust-version = "1.80.0" in its own manifest; the cell counts were taken with the toolchain that manifest pins -->

# Two correct jobs, one axis each, and a cell nothing runs

Read against the personas desktop application at commit `91b684dfb`, in a
detached worktree with a private `CARGO_TARGET_DIR`.

## The two jobs, both correct

`.github/workflows/ci.yml:225-247` declares `rust-tests` over three operating
systems (`windows-latest`, `macos-latest`, `ubuntu-24.04`) with `fail-fast:
false`, and the Linux pin carries eighteen lines explaining exactly why 24.04
and not 22.04. The tests it runs are

```
cargo test --workspace --manifest-path src-tauri/Cargo.toml --features desktop --no-fail-fast
```

(`ci.yml:346`), and the surrounding comment argues correctly that both
`--workspace` and `--features desktop` are required rather than optional.

`ci.yml:407-421` declares `rust-features` over three non-default feature
shapes — `desktop-full`, `desktop,scraper`, `desktop,test-automation` — on one
operating system, and its header states the axis decision in as many words:
"Runs on Linux only. The shapes are about cfg resolution, not about platform,
and the three-OS matrix already lives in rust-tests." That reasoning is sound.

## The cell the union does not contain

`rust-features` runs `cargo check --workspace ... --features <shape>`
(`ci.yml:459`), not `cargo test`. The job's own comment anticipates the gap —
"Widening to `--all-targets` would also cover feature-gated test code and is
the obvious next step once the wall-clock here is known" — so the feature axis
produces a compile verdict and zero test verdicts.

Nothing else closes it. Every `cargo test` in the repository pins the same
feature value: `ci.yml:346`, `ci.yml:582` (the bindings job), and the project's
own runner `scripts/build/run-rust-tests.mjs:193,195`
(`--features personas-core/desktop,personas-db/desktop,personas-engine/desktop`
and `--features desktop --lib`). Not one invocation enables `ml`, `p2p`,
`scraper` or `test-automation`.

The two axes therefore cover `{3 platforms} x {desktop}` for tests and
`{linux} x {4 shapes}` for compilation. `(windows, desktop-full)` is in neither.

## What sits in the uncovered region

`src-tauri` carries 256 `#[cfg(feature = "ml")]` sites and 105 for `p2p`.
Four of the `ml` sites gate a whole test module:

| file | gate | ml-gated tests |
| --- | --- | --- |
| `engine/src/chunker.rs:379` | `#[cfg(all(test, feature = "ml"))]` | 12 |
| `src/commands/infrastructure/twin.rs:2584` | same | 7 |
| `db/src/repos/core/memories.rs:3852` | same | 4 |
| `src/companion/brain/embeddings.rs:444` | same | 2 |

25 test functions. `twin.rs` is the one to read carefully: a second,
ungated `#[cfg(test)]` module opens at `:3121` and holds 10 more tests that
*do* run, so a file-level count over-reports the gated set — the gate's
boundary is the module, not the file.

## The two cells, run

Same crate, same filter, one axis moved:

| arm | command | result |
| --- | --- | --- |
| A — the cell CI reports | `cargo test -p personas-engine --features desktop chunker` | `running 0 tests` · `ok. 0 passed; 0 failed; 1340 filtered out` · exit 0 |
| B — the cell CI only `check`s | `cargo test -p personas-engine --features ml chunker` | `running 12 tests` · `ok. 12 passed; 0 failed; 1177 filtered out` · exit 0 |

Arm A is green with zero of the tests the filter names, and its exit code
cannot distinguish that from twelve passes. The twelve pass when they are
compiled, so the missing cell is not currently hiding a red — but no artifact
the pipeline produces could say so either way.

The crate's compiled test totals, measured with a filter that matches nothing
so that `filtered out` *is* the total:

| cell | compiled tests |
| --- | --- |
| `--features desktop` (what CI reports) | 1,340 |
| `--features ml` | 1,189 |
| `--features desktop,ml` | 1,352 |

**12 tests exist in this crate that the reported cell never compiles** (1,352 −
1,340), which is exactly the `chunker` module and agrees with arm B's count
independently. And 1,189 < 1,352 means the cells are **not nested**: `desktop`
holds 163 tests `ml` does not. Switching the reported cell to the richer
feature set would trade one blind region for another; only the union is the
suite.

## Why the existing population checks return clean

The repository already carries the instruments that catch the neighbouring
classes, and each one is correct and blind here.

- `scripts/census/run-census.mjs:21` records the earlier incident of this
  family — "`ci.yml` ran `cargo test` without `--workspace` so a whole crate's
  suite never ran" — which is the *membership list* failure, fixed. The feature
  cell is a different axis and the fix does not reach it.
- `scripts/build/run-rust-tests.mjs:187` names the same class again and points
  at the compile failure. The gated modules do not fail to compile; they are
  removed before compilation.
- `scripts/check-binding-orphans.mjs` and `scripts/binding-missing-allowlist.txt`
  reconcile exported bindings against their declarations — a reconciliation over
  one axis, performed inside the `desktop` cell.

A selection floor cannot fire, because nothing was deselected. A discovery
reconciliation balances, because the file is discovered and does report. A
build-graph inventory is clean, because `personas-engine` is a gated workspace
member. The only instrument that sees it reads `Cargo.toml`'s feature table and
compares it against the feature values the jobs actually pass to `cargo test`.

## The negative control, and what the floor could see

One `ml`-gated test was deliberately broken (`chunker.rs:387`, the expected
chunk content changed), and both cells re-run:

| gate | result with the break in the tree |
| --- | --- |
| `cargo test -p personas-engine --features desktop` | 1,337 passed, 3 failed — and the three are `responsibility::tests::operator_doors_create_validate_and_merge_validate`, `serving_overrides::tests::every_registered_site_still_exists`, `serving_overrides::tests::every_override_shaped_site_is_registered_or_explained`, **none of them the broken test** |
| `cargo clippy -p personas-engine --features desktop -- -D warnings` | exit 0, green |
| `cargo test -p personas-engine --features ml chunker` | 11 passed, **1 failed**, exit 101 — `chunker.rs:387` |

The three `desktop` failures are pre-existing at unmodified HEAD, verified by
reverting the break and re-running them (`operator_doors` 0 passed / 1 failed;
`serving_overrides::tests` 6 passed / 2 failed), with the `ml` cell clean at
12 passed. So the floor was red throughout, for three reasons that have nothing
to do with the axis, and its failure list never contained the injected break.
**A red floor is not evidence the axis is covered**, and that is the more
uncomfortable half of the control: had the floor been green, the absence would
at least have been legible as an absence.

## The repair the project can afford

Not the full product. The axis has four declared values and the platform axis
three; twelve test cells at this crate's build cost is not the proposal. The
cheap form is one added test cell on the axis that carries tests nobody runs —
`cargo test --workspace --features desktop-full` on Linux only — plus a check
that enumerates `Cargo.toml`'s features against the feature values any
`cargo test` invocation passes, and names the difference. The first buys the 25
tests; the second is what keeps the answer true after the next feature lands.

The second half shipped as `scripts/check-test-feature-cells.mjs`
(`backlog/c34`, `120b04bc0`), wired into `check` and `check:fast` as
`check:test-cells`, with its baseline seeded at today's 25 on the same
two-sided convention as `check-command-feature-coverage.mjs` — a rise fails and
so does a silent drop. The added test cell itself was deliberately not shipped:
`rust-features`'s own comment defers it on wall-clock grounds, and that is the
owner's call to price.

Two defects in the instrument, both found by its own self-test and both of one
shape — **the scanner reading a description of an invocation as an
invocation**, always failing toward clean:

- It read its own doc comment, which quotes `--features ml` as the worked
  example of the uncovered cell, and reported the gap closed.
- With that excluded, it then read the self-test's own
  `cargo test --all-features` parser fixture, which widened the enabled set to
  every declared feature and emptied the finding in one line.

Both are excluded by name with the reason at the exclusion site, and the
self-test now asserts that the committed baseline still records a non-empty
finding. It had also missed `run-rust-tests.mjs:193`'s argv-array form
(`'--features', 'personas-core/desktop,…'`) because the separator class
admitted neither quotes nor commas — a miss in the safe direction, and still a
miss.

`check-gate-negative-controls.mjs` reports the new gate `ok` and holds at its
pre-existing 23-against-21 failure, unchanged by the commit.
