---
layer: application
type: application
subject: knowledge-registry
technique: propose-then-adopt
stack: rust
status: forged
verified_on: 2026-10-31
verified_against: rust@1.96
proof: ab-paired
applied: code
ab_verdict: better
---

# The dispatcher that writes an automated contributor's stopping point

The tree is the public `xkazm04/personas` desktop app at `7fd2ba3d5f`
(origin `master`). Its toolchain is pinned to `1.96.1` by `rust-toolchain.toml`,
which is the witness for `verified_against`. Personas runs a scheduler that
dispatches unattended workers into this registry and into the fleet's projects.
Each worker is spawned with a brief, and the brief is the "instruction the tool
follows" that the technique says must state where the contributor stops.

## Where the decision is made

Two doors compose that brief. The in-app door is Rust:
`src-tauri/src/commands/curator/dispatch.rs`, function `authorization_line()`,
called from `compose()` and `compose_method()`. The out-of-app loop door is a
Python script beside the curator skill. Both write a dated "standing
authorization" paragraph that overrides the skills' own "never push" line. The
code comment states the reason in the technique's own terms: a worker that
cannot tell which instruction wins "will pick the safe one and park its branch".

The structural fact is that this tree already does the technique's first half.
The grant names who gave it and when, says which line it overrides, and lists
its limits: no hook bypass, no force-push of a default branch, no discarding
uncommitted work, no touching the app's own worktrees, no secret-alert
dismissal. A test, `the_authorization_is_dated_named_bounded_and_says_what_it_overrides`,
requires every one of those to travel with the grant.

## What was missing

The grant said "commit, merge and push", and nothing bounded the push. The
technique stops an automated contributor at the commit because pushing is the
first act that leaves the machine. Moving that stop past the push is a declared
choice the owner is entitled to make, and this owner made it. But a push
publishes every commit between the remote branch and the pushed ref. A pathspec
confines what one commit takes, and nothing like it confines a push. In a
fleet where several sessions commit to one local branch, an unbounded "you may
push" publishes other sessions' unreviewed work under the dispatched run's
name. That is the "damage what it did not come for" failure, reached through
the push instead of the commit.

The Python door had already been given the range rule: list
`origin/<branch>..<ref>` first, push only a range that holds nothing but this
run's commits, and otherwise cut a worktree from the remote branch or leave the
commits local and say so. That edit was uncommitted work in the primary
checkout. The Rust door, which is the one the app's own tick dispatches
through, did not have it. One instruction had two doors, and they disagreed on
the one clause that bounds an outward-facing act.

## A and B

- **A:** `authorization_line()` as shipped.
- **B:** the same function with the range paragraph added in the Python door's
  wording, plus a test, `the_authorization_names_where_a_push_stops`, that
  requires four clauses: the pathspec/push sentence, the range command, the
  worktree way out, and the leave-it-local way out.
- **Target:** push-stopping clauses present in the Rust grant. A 0/4 (the new
  test FAILED), B 4/4.
- **Floor:** the curator tests. A 7/7 dispatch tests ok. B 64/64
  `commands::curator` tests ok. rustfmt clean.
- **Instrument:** `node scripts/build/run-rust-tests.mjs -- commands::curator`.
  On this Windows machine a bare `cargo test` builds the library test binary
  and then dies at load with `0xc0000139`. The script embeds the missing
  comctl32 v6 manifest after linking.

Verdict `better`. It shipped as personas commit `1a6919a648`, with the
project's ledger row as `1754c230aa`, on branch `intake/apply-pta-1031`.

## Why it is on a branch, though the run was allowed to push

The run carried the same standing grant it was editing. Under that grant it
could have pushed. Under the technique it should not: the change edits the
instruction that every later dispatched run follows. That is an *instruction*,
not data, and the technique's read-side rule says instructions are adopted by
someone on the consuming side, not merged by the run that follows them. A
dispatched worker that merges a change to its own grant has removed the
decision, and it does so even when the change narrows the grant. So the commit
sits on a branch for the owner to merge.

## What this realization cannot do

- A string test checks that the clause is in the prompt. It cannot check that a
  worker obeys it. This dispatched run followed the clause from the Python
  door's copy, which is one observation, not a measurement.
- The two doors remain two copies of one paragraph. Nothing fails when they
  drift apart, and they had already drifted once. A parity test, the Rust test
  reading the Python source and asserting the same clauses, becomes possible
  once the Python edit is committed. Until then it would fail on `HEAD`.
