---
layer: application
type: application
subject: streamer-in-charge-moderation
technique: arming-as-a-logged-grant
stack: typescript
status: forged
verified_on: 2026-11-03
verified_against: typescript@6
applied: simulation
ab_verdict: better
---

# TypeScript: arming consent at the contract, and an agent surface that cannot arm

Castle Control (origin/main at `0b1c6b7`, read 2026-11-03 from a git-archive export) is a
Tauri desktop app for a human Twitch streamer. Its Rust core logs an arm before the
rule's mode changes, as the subject's Rust ban-queue application records. This
application follows the two TypeScript layers that decide who can ask for an arm at all.
The first is the generated contract the desktop app calls through. The second is the
headless package, which exposes the core to an AI agent as MCP tools.

## Consent is a required field, not a convention

The contract refuses an arm without an acknowledgement. It also refuses one whose
reason is blank or whose time is not a timestamp, and it accepts a return to shadow
with no acknowledgement:
`packages/contract/src/gatehouse.test.ts:102 "arming requires explicit nonblank consent"`.
The desktop port fills the acknowledgement only for the armed direction
(`apps/desktop/src/gatehouse-core.ts:236 "...(mode === 'armed' ? { acknowledgement: { at: new Date().toISOString(), reason } } : {})"`),
and the core logs the consent before the mode changes
(`apps/desktop/src/gatehouse-core.ts:232 "the core logs that consent before it changes mode"`).

## The agent surface holds no grant

The headless package lets an agent start a rehearsal, run scenarios and read the
results. Every method that would arm a rule or decide about a viewer sits in a denylist
that the agent's tools cannot reach. That covers rule writes, mode changes, ban confirm
and dismiss, undo, petition, held-message release, chat delay, shield and lease end
(`packages/headless/src/tools.ts:57 "'gatehouse.rules.upsert', 'gatehouse.rules.setMode', 'gatehouse.ban.confirm', 'gatehouse.ban.dismiss',"`).
The denylist and the reviewed allowlist must together cover every RPC method exactly
once, so a new method fails a test until someone classifies it
(`packages/headless/src/tools.test.ts:30 "allowlist and ARMED partition every RPC method, so a new method needs a review"`).
A call to a denied name returns an unknown-tool error and never launches a core
(`packages/headless/src/mcp.test.ts:138 "armed and unknown tool names are isError and never launch or reach a core"`).
The core the agent does reach is a separate headless one with an isolated data root
(`packages/headless/README.md:5 "no armed method is reachable"`).

This is stricter than the technique requires. The agent cannot even write a shadow
rule, which acts on nobody. The decision rule the technique gained on 2026-11-03 sets
the bound one step looser: drafting and testing in shadow, yes; arming, confirming and
resolving, no.

## Deviations from the technique

- **The reason is canned.** The rehearsal's arm button sends a fixed sentence
  (`apps/desktop/src/rooms/moderator/core-bans.tsx:9 "Armed by the streamer in Dress rehearsal; generated SIMULATED chat only"`).
  The contract's nonblank check passes, but the log records a click rather than a
  judgement, which the technique's first step warns about. In a rehearsal over
  generated chat that costs little. On a live channel it would not hold.
- **Arming context is stated, not separated, on this surface.** The button is labelled
  "Arm in rehearsal", and the core holds rehearsal in a separate store. Nothing in the
  TypeScript layer refuses to carry a rehearsal arm into a live session. That guarantee
  lives in the core's relaunch, not here.

## The agent condition, simulated (2026-11-03)

The technique as forged did not say what an agent driving the tool may do. A: the
technique without the agent decision rule. B: with it. The cases come from two real
trees. Each case asks what each version flags and what repair it leads to.

1. **A prompt that says "arm it".** A fleet moderator lane (overlord's chat moderator,
   read at `9a8a94c`) ships an MCP write tool for its mode. Its setup guide turns on the
   write switch, and it offers "Arm the moderator." as an example prompt. A flags it
   through its rule against unattributed arming, and its smallest repair is to log the
   call with the operator's name. The agent keeps the power. B flags it, and its repair
   removes the mode write from the agent surface.
2. **An agent rewrites the rule list while armed.** The same lane hot-applies a list the
   agent writes on the very next message. A flags it through the edit-disarms rule.
   Under A's repair the edited rules land in shadow, and then the same agent re-arms
   them in the same turn. B closes that path.
3. **Castle Control's headless package.** Neither version flags it. A has nothing to say
   about it, and B is satisfied.

Result: B is better on 2 of 3 cases and ties on 1. The two cases where they differ are
cases where A's smallest repair leaves the agent able to grant itself power over text
nobody else read. Simulation only. No tree was edited, and overlord's lane is not in
this subject's map yet.
