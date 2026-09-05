---
layer: application
type: application
subject: test-input-generation
technique: inside-out-invariants
stack: rust
verified_on: 2026-09-04
verified_against: rust@1.93.1
applied: experiment
ab_verdict: better
proof: structural-only
---

# 1,101 assertions that vanish in release: the two-regime split in a reverse proxy

Sōzu is a hot-reconfigurable HTTP/1.x + HTTP/2 reverse proxy in Rust
(`github.com/sozu-proxy/sozu`, read at commit `cd023104`, 2026-08-28). The
version witness is the `rust-toolchain` file at the repo root, which pins
`1.93.1`; the workspace is edition 2024 across five members.

It is worth reading here because it sits on the exact trust boundary the
technique's severity ladder does not name. Every byte the datapath handles was
chosen by someone else, and the project says so as a design premise: "a silent
correctness bug is a dropped connection, a truncated response, or a security
hole" (`doc/testing.md`). So it needed both halves of the argument — dense
internal invariant checking *and* a guarantee that no hostile input can reach
one — and the way it gets both is the split this technique now carries.

## What the tree actually does

**The invariant checking is real and it is dense.** `lib/src/` carries 1,101
`debug_assert` sites across 44 of its 61 source files, and fourteen types
implement a private `check_invariants()` full sweep run as a post-condition at
the end of every public mutating entry point — `backends.rs:908`,
`pool.rs:142` and `:262`, `router/pattern_trie.rs:721`, `server.rs:604`,
`protocol/mux/h2.rs:4928`, `protocol/udp/manager.rs:686`, among others. The
UDP core is the reference: `flow.rs` carries 12 assertions and `manager.rs`
45, and the sweep re-validates the *entire* structure after every mutation
rather than the field that changed. Its seven invariants are the technique's
"write the cross-component relationships down" done literally — table→slab
consistency, table injectivity, count-equals-population, phase↔backend
coherence asserted in both directions, timer coherence, and a cap/counter
pair. Both directions of every relationship, which is the half the technique
says teams overwhelmingly skip.

**And none of it survives into production.** The workhorse is `debug_assert!`,
not `assert!`, deliberately: live in every test, e2e, fuzz and developer
build, compiled out of the shipped binary. The doctrine states the boundary in
one line — "Never `assert!`/panic on network-controlled input on the release
path" — and routes hostile bytes to a `SessionResult`, an H2
`GOAWAY`/`RST_STREAM`, or a default HTTP answer, plus a metric and a
contextual log.

The obligation the amendment names is visible in the code as a convention with
a worked example: in `UdpFlow::set_phase` the legality *check* is
`#[cfg(debug_assertions)]` while the assignment beside it is unconditional, so
the release binary and the tested binary execute the same state transition and
differ only in whether the illegal one is announced. Gate the assertion, never
the assignment.

## The structural fact: how far the rule actually holds

The interesting number is not the assertion count, it is the residue. Counting
`unwrap`/`expect`/`panic!`/`unreachable!` that appear *before* any
`#[cfg(test)]` boundary across `lib/src/protocol/`, `lib/src/router/` and
`lib/src/socket.rs` gives **36 sites**, against 660 in those files in total —
the rest is test code. The largest single concentration is
`router/pattern_trie.rs` at 16, a data structure whose inputs are the
configuration the control plane already validated, not the wire.

So the rule holds, and it holds at a level of discipline that a prose rule
does not usually reach. **What it does not have is a machine.** `lib/tests/`
contains exactly one file — `log_layout.rs` — and it guards the *logging*
convention. There is no clippy lint configuration in any `Cargo.toml`, no
crate-level `#![deny]`, and no CI step that greps for a panic on the datapath.
The repo's own doctrine states the meta-rule ("When you find yourself writing
a comment that says 'always do X here', consider whether a regression guard
can enforce X instead") and then spends its one guard on log formatting while
its load-bearing security convention is maintained by review.

That asymmetry is not hypocrisy and it is worth stating precisely, because it
is the honest boundary of `prose-rule-drift`'s account. Both conventions are
artifact-shaped — both are readable from the tree — so that technique's
explanation (rules about *actions* go unmechanised) does not predict this
case. The difference is **syntactic locality**. "Every log call site has a
context macro within 24 lines" is decidable by a fixed-window scan, and the guard is 60
lines. "This `unwrap` is not reachable from network-controlled input" is a
reachability property over the call graph, and no cheap scanner decides it.
The guarded convention was selected by what a scanner could see, which is
uncorrelated with what the drift would cost.

## What this realization cannot do

It cannot tell you the rule is still true tomorrow. The 36 residual sites were
each a judgment, none is annotated as one, and nothing distinguishes a site
that was reasoned about from a site that was never noticed — so the count is a
measurement of today's tree and not a property the tree defends. A reader
copying this should copy the two-regime split, which is structural, and should
*not* copy the assumption that review alone keeps the release path clean at
this density.
