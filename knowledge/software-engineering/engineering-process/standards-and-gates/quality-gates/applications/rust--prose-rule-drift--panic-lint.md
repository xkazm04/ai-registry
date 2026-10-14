---
layer: application
type: application
subject: quality-gates
technique: prose-rule-drift
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.90
applied: experiment
ab_verdict: unmeasurable
proof: structural-only
---

# A panic-free rule is mechanised for the code and prose for the crate

The version witness is `Cargo.toml:10 "rust-version"` in a clone of an
open-source Rust word processor pinned at commit `04f6f53`. Its written standard is
unusually strong: no panicking constructs in production code, input-derived
numbers treated as hostile, and a lint set denied at every production crate root.
The lint half is a real gate. What this tree shows is where the gate's reach ends.

## What the tree does

The rule is stated in the agent instructions
(`AGENTS.md:16 "new crates start with it"`) and mechanised as a crate-level deny
attribute on 18 of the 19 library and binary roots. The test exemption is
configuration, not annotation
(`clippy.toml:4 "allow-indexing-slicing-in-tests"` beside the unwrap, expect and
panic keys), so test code carries no attribute at all.

The one root without the attribute is the small crate that both the app and the
protocol bridge use to find the control-channel key file
(`crates/control-key/src/lib.rs:1 "The control channel's key file"` opens a file
with no lint header). It contains no unwrap or expect, so the property holds in
fact. It holds by nobody having added one, not by anything that would say so if
someone did. The layering checker does reject a new workspace crate that is not
in its table (`xtask/src/layers.rs:154 "Violation::Unregistered"`), so the
tooling already visits every crate and could assert the attribute in the same
pass; it does not.

A second, wider rule is prose only. The standard says input-derived numbers use
`get()` instead of indexing
(`AGENTS.md:13 "Input-derived numbers are hostile"`), and the lint config has a
test exemption wired for the indexing lint, but the indexing lint is enabled
nowhere in the tree. The exemption is configuration for a rule that is not on.

The clippy step in the one workflow that runs it selects two packages
(`.github/workflows/printing.yml:66 "cargo clippy -p wordcraft -p wordcraft-ui-egui"`);
the full gate is the contributor's local `cargo xtask ci`, which the standard
asks for before every commit.

## The experiment

Arm A: count the crate roots that carry a panic-deny set in the three Rust
workspaces of the fleet, by per-project `git grep` over `lib.rs` and `main.rs`
(with the tree's own known positive, 18 of 19, as the instrument's check).
Result for the fleet: tracklight 0 of 17 roots, pumper 0 of 44, personas 0 of 6.
The first two have no workspace lint table at all; personas has one, and records
the unwrap and expect rules as commented-out ratchet entries with measured
production counts (94 and 78) and the condition for enabling each. Arm B, the
clippy run that would price turning the set on, was not run: a workspace build is
heavy on these trees and the personas counts are the project's own earlier
measurement. Verdict `unmeasurable`; the instrument that would settle it is
`cargo clippy --workspace -- -W clippy::unwrap_used -W clippy::expect_used` in a
private target directory, per project.

The experiment shows a boundary the technique had not drawn: this tree denies at
zero and keeps the count at zero, while the fleet's one workspace that wrote the
rule down holds it as a ratchet with a number. Both are presence-gated policies
if something checks the lint table. Neither the tree nor the fleet checks it.

## What the realization cannot do

It cannot say whether a rule that is on in every root is also on in a new root,
because the only check is a human's reading of the standard. The tree is one
absent attribute from the failure; no crash has come from it because no unwrap
is there to find.
