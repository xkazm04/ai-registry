---
layer: application
type: application
subject: invariant-placement
technique: paired-sites-localize-the-fault
stack: rust
verified_against: rust@1.96.1
verified_on: 2026-09-17
applied: code
ab_verdict: better
proof: ab-paired
---

# The precondition that refused a legal input, and the snapshot only the release build rejects (Rust)

How the technique lands in a public Rust evaluation service (`xkazm04/lighttrack`,
branch cut from `a6c814e`, 2026-09-17). The stack witness is the repository's own
pinned toolchain (`rust-toolchain.toml`, `channel = "1.96.1"`), which every blocking
gate runs through — the version this run happened to have installed is not the ruler.

The seam is a keyset paging cursor shared by every storage backend
(`crates/store/src/codec.rs`). `encode_event_cursor(ts, id)` writes `hex(ts|id)` and
`decode_event_cursor` reads it back with `split_once('|')`. The invariant that makes
the pair exact was written down only in the doc comment above the encoder: "Both
components are `|`-free by construction (fixed-width RFC3339 ts, UUID id), so decoding
is exact." Nothing enforced it, and the comment is **wider than the decoder's actual
requirement** — which is the whole of this application.

Four arms were run in a private worktree, each through the project's own gates with a
private `CARGO_TARGET_DIR`. Two probes, chosen to pull in opposite directions:

- **probe 1** — a separator in the *timestamp*. A real defect: `split_once` truncates
  the timestamp at the separator and moves the remainder into the id, so a paged read
  resumes at the wrong position and nothing reports an error.
- **probe 2** — a separator in the *id*. **Legal.** The decoder splits once, at the
  first separator, so only the leading component has to be separator-free; a composite
  trailing component round-trips exactly.

## The four arms

| arm | what it is | probe 1 (illegal) | probe 2 (legal) | `cargo check --release` |
|---|---|---|---|---|
| **A** | seam as-is, no checks | **FAILED at the reader** | ok | green |
| **B1** | the rule applied literally, snapshot build-gated | *not reached* | *not reached* | **RED** |
| **B2** | the rule applied literally, snapshot ungated | **FAILED at the writer** | **FAILED — legal input refused** | green |
| **B3** | write side derived from the decoder | **FAILED at the writer** | **ok** | green |

The failure text is the finding, so it is quoted rather than summarised.

**Arm A**, probe 1, at the test's own `assert_eq!` — `codec.rs:215:9`:

```
assertion `left == right` failed: cursor did not round-trip exactly
  left: Some(("2026", "09-17T00:00:00.000000000Z|11111111-1111-1111-1111-111111111111"))
 right: Some(("2026|09-17T00:00:00.000000000Z", "11111111-1111-1111-1111-111111111111"))
```

Detection, with no attribution. The reader is handed two tuples and has to work
backwards to a producer it cannot see.

**Arm B2**, probe 1, at the encoder — `codec.rs:83:5`:

```
cursor component contains the separator: ts="2026|09-17T00:00:00.000000000Z" id="1111…"
```

Same defect, named at the site that produced it. That gap is what the pair buys.

**Arm B2**, probe 2, at the same line — `codec.rs:83:5`:

```
cursor component contains the separator: ts="2026-09-17T00:00:00.000000000Z"
                                         id="tenant-a|11111111-1111-1111-1111-111111111111"
```

This input round-trips exactly. The precondition was written from the doc comment
— both components separator-free, positive and negative space, before the write,
exactly as the density-and-pairing advice prescribes — and the comment is not what the
consumer requires. A refused legal input is not a caught defect; it is a new one, in
the more expensive direction, because it fires on traffic that was fine.

**Arm B3**, probe 1, at the encoder — `codec.rs:86:5`:

```
the leading cursor component contains the separator: ts="2026|09-17T00:00:00.000000000Z"
```

The write side derived from the consumer rather than from the prose: one component,
named. It keeps the localization and drops the false refusal.

## Why A and B2 each pass exactly one half

The two probes are the opposite-direction pair, and neither arm satisfies both:

- **Arm A** passes probe 2 (it refuses nothing, so it cannot refuse wrongly) and
  localizes nothing on probe 1.
- **Arm B2** passes probe 1 with attribution and **fails probe 2** (it refuses
  everything the comment forbids, whether or not the consumer cares).

Stated singly, either obligation is satisfiable by a null change in one direction and
by a sledgehammer in the other: "the illegal construction is refused" is met by a
precondition that refuses everything interesting, and "the legal construction is
accepted" is met by having no precondition at all. Only **B3** holds both, and the
discriminator between B2 and B3 is not care or review effort — it is **where the
precondition was derived from**. B2's came from a sentence; B3's came from
`split_once`.

## The snapshot that only the release build rejects

Arm B1 is the same rule as B2 with one difference: the read side's before-value
binding carries `#[cfg(debug_assertions)]`. That is the natural thing to write — the
binding exists for the assertion and for nothing else, so it looks like something to
keep out of the build that does not run assertions.

```
cargo check -p lighttrack-store --lib
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.83s

cargo check --release -p lighttrack-store --lib
error[E0425]: cannot find value `raw_len` in this scope
   --> crates\store\src\codec.rs:108:9
    |
108 |         raw_len,
    |         ^^^^^^^ not found in this scope
error: could not compile `lighttrack-store` (lib) due to 1 previous error
```

`debug_assert_eq!` compiles its arguments in **every** profile and gates only their
execution. So the gated snapshot leaves the assertion reading a name that no longer
exists, and the crate stops compiling in the optimized profile alone. The debug lane
is the one profile where the binding is present, so **the lane that runs the suite is
structurally unable to see this class.** B3 leaves the binding unconditional and
carries a comment saying why; it is dead code in release and the optimizer drops it,
so it costs nothing to declare.

This is not one project's accident. The same failure is recorded in the reverse-proxy
tree this corpus reads elsewhere, in a commit whose own message states the mechanism:
`debug_assert!` "compiles its arguments in EVERY profile — it gates only runtime
execution, not compilation", four bindings gone in release, surfacing in `cargo bench`
and the `--release` image build, and "`cargo test` (debug) could not catch it". Two
unrelated codebases, the same shape, the same invisible lane.

## Gate existence: nothing blocking compiles the profile that ships

The measurement that makes the section above actionable rather than anecdotal. Across
the two Rust repositories in this fleet, **no blocking job compiles the optimized
profile**:

- This repository's blocking rung is debug throughout — `cargo test --workspace`,
  the per-backend conformance jobs, `cargo clippy --workspace --all-targets -D
  warnings`, `cargo fmt --check` (`.github/workflows/ci.yml`). `--release` appears in
  exactly two places, neither of them blocking: `soak.yml:78` (`cargo test --release
  -p lighttrack-store --test soak`, a scheduled soak) and `release.yml:57` (`cargo
  build --release --target …`, tag-triggered).
- The second Rust repository in the same fleet is the same shape: every blocking job
  is a debug `cargo test`, `cargo clippy` or `cargo check` (including a whole
  feature-matrix job that is deliberately `cargo check` rather than a build); the
  optimized compile happens only inside a bundler invocation in an installer-test
  workflow, off the blocking rung.

So in both repositories the class arm B1 exhibits is invisible before merge, and its
first reader is whoever builds a benchmark, an image or a tag. The remedy is one line
on the rung that already exists — an optimized-profile `cargo check` beside the debug
one — and the useful finding for any tree adopting paired assertions is to look for
that line *before* adding the assertions, because its absence is what turns a
compile-time mistake into a release-time one.

## The negative control against the floor

A floor nothing can fail is not a floor, and the top two invariant altitudes fail in a
direction no existing test sees, so the write-side precondition ships with an explicit
negative artifact rather than with trust:

```rust
#[test]
#[should_panic(expected = "the leading cursor component contains the separator")]
fn separator_in_the_timestamp_is_refused_at_the_writer() { … }
```

Deleting the precondition from the encoder and re-running the module turned that test,
by name, red:

```
test codec::tests::separator_in_the_timestamp_is_refused_at_the_writer - should panic ... FAILED
note: test did not panic as expected at crates\store\src\codec.rs:235:8
test result: FAILED. 9 passed; 1 failed
```

One named test, and only that test. Every other assertion in the module stayed green,
which is the point: removing a precondition makes strictly more programs valid, so
without this artifact the deletion would have been silent. The `should_panic` string
also pins the *attribution* and not merely the refusal — a guard rewritten to fail
with an unlocalized message fails this test too.

## Gates on the landed arm

Arm B3 was committed on its own branch and run through the project's own commands,
with a private `CARGO_TARGET_DIR` and `TMP` so a sibling build could not contaminate
the result:

| gate | result |
|---|---|
| `cargo fmt -p lighttrack-store` | clean, exit 0 |
| `cargo test -p lighttrack-store --lib codec::` | **10 passed / 0 failed**, exit 0 |
| `cargo clippy -p lighttrack-store --lib -- -D warnings` | clean, exit 0 |
| `cargo check --release -p lighttrack-store --lib` | clean, exit 0 |

The release check is listed because this technique is the reason it belongs there, and
because the pre-change baseline was green in debug before any arm ran. Exit codes were
read directly from each command, never from a status sampled after a pipe.

The commit was subsequently rebased onto this repository's moved `main` (`3c49cae`,
after a sibling change to the same crate tree), so **the commit id recorded in the
ledger is the rebased one and not the id this run produced**; the arms, the probes and
the gate results above are properties of the diff, which the rebase did not touch.

## What this realization does not establish

It does not show that the pair catches more defects than the single external
round-trip test — on this seam it caught the same one. What it measured is
**attribution**: the same defect reported at the producer instead of as a mismatched
tuple at the consumer. A reader copying this should copy the derivation order (read
side from the consumer, write side from what the read side needs) and the two
opposite-direction tests, and should not copy any expectation of a detection gain.

It also says nothing about assertion *density*. The density question was measured
separately on this fleet and on the reverse-proxy tree and did not survive; a paired
site is one named relationship asserted twice, which is a placement claim, and it is
not made stronger by being counted.
