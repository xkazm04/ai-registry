---
layer: application
type: application
subject: test-harness
technique: a-test-helper-is-a-fork-of-the-driver
stack: process
status: forged
verified_on: 2026-11-06
counterpart: external
applied: experiment
ab_verdict: unmeasurable
proof: ab-paired
---

# Process: two trees and one connected project where the helper forked from the driver

Two independent trees were read at a pinned commit, and one connected project at its head. Nothing in any of them
was built or run. Licences limit what is here: `leodearden/reify` is AGPL-3.0 and `melgarafael/lina-space` declares
no licence, so their design is in our words, line references say where it was read, and no code is reproduced.

## The trees

**reify at `8d65e1b0`.** A language compiler. Its planning document states the helper ladder is unfaithful to the
shipped check command on four axes, at `docs/prds/v0_6/spec-conformance-suite.md:49`. Re-read here at the symbols:
the bare compile entry passes an empty prelude and its doc comment reserves it for bootstrapping
(`crates/reify-compiler/src/lib.rs:336-338`), and the fake checker defaults to satisfied
(`crates/reify-test-support/src/mocks.rs:66-71`). The fourth axis and the document's count of affected files are the
document's own and were not checked. The parity gate that would close it is a plan and is absent at this commit.

**lina-space at `9b4d57c8`.** A desktop terminal canvas. Its decision record names the blocker: the app did not use the
host type that held the atomic approval door (`docs/adr/0024-atomicidade-do-write-de-aprovacao-no-app.md:9`), and it keeps
that coexistence as a standing decision (`docs/adr/0024-atomicidade-do-write-de-aprovacao-no-app.md:36`). A separate
repro records an identifier format that only the real binary exposed
(`crates/lina-bootstrap/tests/repro_conf3_history_n_prefix.rs:1-13`), and one test plan states a zero-mock house rule
(`crates/lina-core/tests/f3_4_alvos_diferenciais.md:48`). Two authors, neither aware of the other.

## The seam, chosen to falsify

A connected desktop project's database fixture was picked because it looks like the counterexample. It is built from
the shipped migration chain and seeds, once, then copied per test: the expensive part is faithful. A caught outcome
would say a faithful chain does not make a faithful fixture. A clean outcome would have shrunk this technique to
helpers that skip the setup outright.

The result was caught, and by the project's own words. A comment in its database crate lists what the fixture omits:
the write-ahead journal, the change-capture customizer, and a boot-time index reconciliation that had no test until
someone noticed. Beyond those, the pool holds 2 connections against 12. About 1,700 call lines in 301 files go through
this fixture, by a text count. Its name does not say what it leaves out.

## The experiment

Own schema and two connections through the runtime's SQLite binding, no busy wait, no product code.

| Arm | Journal | Write with a reader's transaction open | Reader in its transaction | No reader open |
| --- | --- | --- | --- | --- |
| A, as the fixture | delete | refused, database is locked | 3 rows | committed |
| B, as the boot path | wal | committed | 3 rows, then 4 after it ended | committed |

Target: whether one locking question gets one answer across the two setups. It did not. Floor: the no-reader case, which
agreed.

## Verdict

`unmeasurable` for the project. The arms prove the two modes answer differently. Whether any of its tests depends on the
difference was not read, and this run may not run its suite. The instrument that would decide it is the comparison in
step 3 of the technique: the settings and schema reached by the boot path against those reached by the fixture. That is
a proposal for the project and nothing was changed there.

## What this realization cannot do

It cannot price the remedy. No tree here has run a helper-against-binary parity gate, so its cost and yield are unknown.
