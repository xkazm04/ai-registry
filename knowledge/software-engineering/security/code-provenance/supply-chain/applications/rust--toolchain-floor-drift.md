---
layer: application
type: application
subject: supply-chain
technique: toolchain-floor-drift
stack: rust
verified_on: 2026-08-31
verified_against: rust@1.80.0
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A declared floor of 1.80 over a graph that requires 1.88 (Rust, Tauri desktop)

This tree makes two compatibility claims and observes exactly one of them,
which makes it a natural two-arm comparison with no change required to
produce it.

## The claims

- **`rust-version = "1.80.0"`** in the crate manifest — a declared minimum
  toolchain, published, and the kind of claim consumers and packagers read.
- **`engines: { node: ">=20.0.0" }`** in the package manifest — the same shape
  of claim for the other toolchain.

## The two arms

The measurable is the **gap between the declared floor and the effective floor**
— the maximum declared minimum across the resolved dependency graph. Both arms
read the same tree and the same committed resolution.

- **Arm A — the pipeline as it stands.** Eleven jobs across six workflow files
  select the toolchain with `dtolnay/rust-toolchain@stable`. No job pins 1.80.
  There is no `rust-toolchain.toml` in the tree. The arm's answer to "is the
  floor still true?" is **green**, produced without ever building at the floor.
- **Arm B — the technique's instrument.** Resolve the graph as committed and
  take the maximum of every package's declared minimum:
  `cargo metadata --format-version 1 --offline`, then the max over
  `packages[].rust_version`.

Same tree, same instant, two instruments, and they disagree.

| | arm A (build on stable) | arm B (resolve the graph) |
| --- | --- | --- |
| declared floor | 1.80.0 | 1.80.0 |
| effective floor | not observed | **1.88.0** |
| packages above the claim | not observed | **60 of 518** that declare one |
| verdict | claim green | claim **false**, by eight minor versions |

The package setting the floor is a transitive date-and-time library at a
**patch-level** version, together with its two companion crates — precisely the
mechanism the technique names, where a point release raises a declared minimum
and the change appears in no manifest the team reviews. The graph resolves 767
packages; 518 declare a minimum at all.

Eight minor versions is roughly two years of releases, which is the same order
as the window the technique cites from a hundred-package survey. That is one
tree agreeing with one survey, not a confirmation of the constant.

## The structural fact: the two floors are enforced asymmetrically

The finding this tree could not have been built to prove is the contrast
*inside* it. Both claims are declared in the same repository by the same team
with the same intent. One of them is observed by the pipeline and one is not:

- the runtime floor is declared at 20 and there is a job that runs at 20, so
  the claim and the check agree;
- the compiler floor is declared at 1.80 and **every** job that touches it runs
  at whatever stable resolves to today.

Nobody designed that asymmetry, and it is not carelessness about one ecosystem
versus the other — it falls out of how each toolchain is selected in a workflow.
Naming a runtime version is the ordinary way to write the job; naming a compiler
version is an extra argument to an action whose default reads as obviously
correct. The default is the whole defect
([gate-sees-target](../../../../_laws.md#gate-sees-target)): the pipeline observes
a toolchain nobody made a promise about, and reports on one nobody built.

## Verdict and what follows

`better`. The technique named a measurable, the instrument was one command, and
it found a live false claim that the existing pipeline is structurally unable
to detect. The claim has presumably been false for some months; nothing in the
tree could have said so.

The repair is small and is the technique's step 1: one job pinned to 1.80.0
performing a resolved (not locked) check, so the claim either holds or fails
loudly. The team then makes the real decision the technique's second half
frames — raise the declared floor to 1.88 and be honest, or hold 1.80 and pay
to hold it — with the cost visible rather than inferred.

## What this realization cannot do

Arm B reads *declared* minimums, which is a lower bound on the truth: a package
that declares 1.80 may still fail to compile on it, so the real effective floor
can only be higher than 1.88, never lower. Confirming it exactly requires a
build at the floor, which is the repair itself and was not run here — no arm of
this comparison compiled anything. The measurement also reflects the committed
resolution; a fresh consumer resolving today could land higher still. And the
gap is a fact about this tree on this date, not a rate: nothing here says how
fast the floor drifted, because no historical resolutions were measured.
