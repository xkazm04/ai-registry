---
layer: application
type: application
subject: error-handling
technique: crash-capture
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.80
applied: simulation
ab_verdict: better
proof: structural-only
---

# The crash fact lives beside the store, not in it

The technique's amendment says the decision to restart after a crash must
live outside the store the crash may have corrupted, so a crash caused by
the store cannot read its own restart policy from that store. The desktop
agent runtime does not auto-restart, so the amendment's central object has
no seam here yet; what the tree does have is the discriminator the decision
would be built on, and it put that discriminator where the amendment says.
The version witness is `src-tauri/Cargo.toml:115` (`rust-version = "1.80.0"`).

## What the tree does

The fact that separates "the operator quit" from "the process died" is a
marker file written on graceful exit and deleted on the next start
(`src-tauri/core/src/shutdown_marker.rs`). Its header argues the fail mode
the amendment argues: a marker that cannot be read is reported absent, so
the recovery sweep runs, because the other direction leaves stranded rows
nobody reconciles. Boot reads the marker's absence as the crash signal and
only then reconciles rows inside the database
(`src-tauri/src/boot/recovery.rs:52-58`): decision outside, work inside. A
quarantined store (`src-tauri/db/src/damage.rs`) stays readable but is never
trusted for policy, and the marker is unaffected by it because it is not in
the store.

## The simulation

Three cases walked under A (the fact in a settings row) and B (the fact in a
file, as built): a canonical-damage boot, where A cannot read the row exactly
when it matters and B reads the file; a graceful restart during an upgrade,
where both classify correctly; and a future auto-restart under the project's
accepted recovery direction, where A loops on a store-caused crash and B
does not. Predicted better on the first and third, equal on the second.
Falsified if the restart is decided by a supervisor process that never
opens the store, in which case the location of the fact is moot.

## What the realization cannot do

There is no restart policy to test, so this reading confirms the amendment's
premise and not its rule. When an auto-restart lands, the marker file is the
seam, and a policy written into the settings table instead would be the
exact failure the amendment names.
