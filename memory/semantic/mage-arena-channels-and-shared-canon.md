---
kind: semantic
confidence: 1.0
namespace: mage-arena
source: decision-record
---

# Mage Arena is one game shipped through several channels

Mage Arena (Roman-era elemental mages, an arena of duels, a camp of schools) is built as **one game design delivered
through separate channel builds**. Decided by the owner on 2026-10-02 so that a game-design problem solved in one
channel is never solved again in another.

## The channels (as of 2026-10-02)

| Channel | Repo | Engine / stack | Input | State |
|---|---|---|---|---|
| Desktop / TV build | `mage-arena` (+ its `-arena`, `-art`, `-core` worktrees) | TypeScript deterministic core, PixiJS client | mouse and keyboard first; TV remote later | combat kernel calibrated by headless simulation |
| VR | `mage-arena-vr` | Unreal Engine 5.8 | bare hands (sigils, palm ward, flick blink); keyboard plays recorded hand clips in October | scaffolded; desktop-first until 2026-10-31 |
| PC (future) | not started | - | - | a possibility, not a plan |

## The rules that make the channels share work

- **Combat data has one owner:** the desktop/TV build's data files and its simulator. Other channels consume a
  **pinned commit** of that data and send changes back as change requests; they never fork the numbers.
- **A mechanic is solved once.** When a channel proves a mechanic (a rule, a tuning, an onboarding beat, a readability
  fix), it records the solution and the evidence in [[mage-arena-mechanic-channel-matrix]], so the next channel starts
  from the answer.
- **Where knowledge lands:** lessons that hold for any game go to the `game-production` bundle as ordinary subjects
  (no product names in golden paths or techniques); how a specific channel realised them goes in that subject's
  `applications/mage-arena-<channel>--<technique>.md`; facts about this game itself stay in this `mage-arena`
  memory namespace.
- **Art is per channel.** The desktop/TV build chose its own look; the VR build builds in greybox first and picks from
  its own shortlist later. A shared art direction is not assumed.
