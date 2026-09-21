---
layer: application
type: application
subject: model-routing
technique: cache-continuity
stack: claude-code
verified_on: 2026-09-08
verified_against: claude-code@2.1.263
applied: experiment
ab_verdict: better
proof: ab-paired
---

# An effort flip on a resumed session re-writes the system layer, measured (Claude Code)

Run 2026-09-08 against Claude Code 2.1.263 (the version `claude --version`
printed on the machine that ran it), headless, in a scratch directory that is
not a repository, isolated from every fleet checkout. The question was the
one the technique's new section asks per provider: **where does this harness
key the reasoning effort** — in the cached prefix, below it, or nowhere?

## The two arms

Each arm is one fresh two-turn session. Turn 1 is identical across arms
(`--effort low`, a one-word reply). Turn 2 resumes the session with
`--resume <id>`; the only variable is whether the effort is held or raised.

| Arm | Turn 2 effort | cache_read | cache_creation | cost (USD) |
| --- | --- | ---: | ---: | ---: |
| A — held | `low` | 33,353 | 59 | 0.0070 |
| B — flipped | `high` | 23,997 | 9,415 | 0.0425 |

Turn 1 of arm A wrote 9,356 tokens and read 23,997. The flipped turn wrote
9,415 and read 23,997 — the same split. **The effort setting lives in the
system layer of this harness's prefix**: a flip invalidates that layer and
everything below it, and leaves the 24K above it (the tool roster and the
layers ahead of it) warm. The turn cost 6.1× the held arm's. That is the
technique's first shape, confirmed to the token.

The seam was chosen to falsify. The technique's decision rules say "price
the toggle" for effort as for model; the source that occasioned this run
relays a vendor saying an effort change "preserves the original prompt
prefix". If that had held here, the technique's rule would have needed the
inversion for this harness too. It did not hold: the vendor's claim is a
fact about *its* API's in-band configuration item, not about effort.

## The structural fact, in a consuming tree

The desktop companion whose routing table
[`rust--cache-continuity`](rust--cache-continuity.md) describes has **two
resume doors, and only one of them is pinned.** The companion's own
conversation is resumed with the model flag re-applied on every turn, as
that application says. The fleet lane is different: a fleet-plan row carries
`model` and `effort` and renders them into the spawn argv
(`approval_exec_fleet.rs`, `FleetPlanRow::args`), but the session registry
keeps only the conversation id and the working directory
(`fleet/commands.rs`, `resume_target`), and `fleet_wake_session` spawns a
bare `--resume <id> <continuation>` with no flags. A row spawned at
`--effort high` on a non-default model is woken at the CLI's defaults.

By this experiment, every such wake is an unrequested flip: a ~9.4K-token
rewrite of the system layer, and — the larger cost — a session that
silently runs at a different effort, and possibly a different model, from
the one its plan chose. The prior application's sentence "nothing on the
resume path can change it" was true of the door it read and not of the
second one. Filed in the project as a sized task: persist the two flags on
the registry row at spawn and replay them at wake.

## What this realization cannot say

One step of effort, one trivial turn, one session per arm. The rewritten
segment is fixed-size (the system layer), so on a long session the
*proportional* penalty shrinks while the silent effort change does not.
Nothing here measures whether the flipped effort changed output quality;
the technique does not need it to.
