---
layer: application
type: application
subject: guest-language-introspection
technique: guest-settable-limits-and-switches
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.91
applied: code
ab_verdict: better
---

# Lowered fuel and memory caps in a WASM plugin host

A Rust data service (github `xkazm04/pumper`, crate `engine-wasm`, commit `2525e64`)
embeds untrusted plugins in wasmtime. A WASM guest has no debug global, so the guest-side
accessor half of the technique does not apply. The half that does is "test the handling
by lowering the limit, through the host's one validated door".

## What was found

The host sets a per-call CPU fuel budget and a linear-memory cap from its plugin config,
builds a fresh store per call, and meters both. Its tests covered the metering (fuel used
under a roomy budget, memory high-water) and classified an `unreachable` trap, but no test
drove the fuel-exhaustion path or the cap's refusal path. Both guards were configured,
reported, and never shown to stop anything.

## What was applied

Two tests, both setting the limit through the host's config struct (the same door
production uses, so there is no second validation path):

- A counted-loop module of a million iterations under a 20,000 fuel budget must fail with
  the trap class; a 100-iteration module must still pass under the same tight host; the
  million-iteration module must complete under a roomy host. The failure is therefore the
  limit's doing, takes microseconds, and does not depend on the platform stack.
- A module asking to grow 40 pages under a 1 MiB cap must return normally with memory
  unchanged (a refused grow is `-1`, not a trap), and the metered cap must read 1 MiB.

The restore obligation disappears by construction: each test builds its own host and
directory, and the store is per call.

## A/B

A (before): the guards were untested. Mutating the host to ignore the configured fuel
(`set_fuel(u64::MAX / 2)`) left the whole suite green. B (after): the same mutant fails
the runaway test; the real host passes 16 tests, `cargo fmt` and `clippy -D warnings`.
Not measured: wall-clock cost of a real runaway, and the memory cap against a plugin that
grows via a table rather than linear memory.
