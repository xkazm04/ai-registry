---
layer: application
type: application
subject: untrusted-extension-host
technique: per-callback-failure-policy
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.80
applied: simulation
ab_verdict: better
proof: structural-only
---

# Uniform by signature where nothing can veto

The desktop agent runtime's extension surface is split in two by return
type: observers report and return nothing, interceptors change one declared
mutation point and return a typed decision. The version witness is
`src-tauri/Cargo.toml:115` (`rust-version = "1.80.0"`). The surface is
in-tree and compiled; nothing here is a dynamic plugin.

The technique's rule is per-registration failure policy. Its amendment,
landed the same day this tree was read, says a uniform non-fatal policy is
right for a surface where no callback can veto, and that the host then owes
two things: a dead extension's closures are abandoned rather than run again,
and a re-entrancy mute is handed to the extension.

## Where the tree lands on each

- **Uniform non-fatal for observers, by construction.** Every observer call
  is wrapped in a panic guard and a panic is logged as non-fatal with the
  reason in the log line: observers cannot withhold a decision
  (`src-tauri/src/engine/runner/hooks/mod.rs:326-350`). The policy is not a
  declaration each observer makes; it follows from a return type of unit.
  This is the amendment's case exactly.
- **Per-registration where a veto exists.** An interceptor's refusal is a
  returned decision, never an error, so a policy denial and a contributor
  bug cannot arrive as one signal. The technique's main rule holds on the
  half that can veto, and the amendment's revert clause - the uniform policy
  ends the moment one point can veto - is the line the tree drew.
- **The mute is not owed yet.** Observers take a borrowed event and cannot
  reach an emit site, so no re-entrancy mute exists and none is needed. The
  interceptor side has a related discipline: the continuation a frame calls
  is single-use, and a second call is a contract violation naming the frame.

## What the realization cannot do

The day an observer can be supplied from outside the tree, or can call back
into the runner, the mute becomes owed and nothing here provides it. That is
the return condition recorded against this reading. The panic guard also
catches panics only; an observer that blocks holds the emit loop, and the
timeout half of the technique has no realization on this surface.
