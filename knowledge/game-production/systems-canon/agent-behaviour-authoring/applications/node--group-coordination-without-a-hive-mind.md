---
layer: application
type: application
subject: agent-behaviour-authoring
technique: group-coordination-without-a-hive-mind
stack: node
status: forged
verified_on: 2026-09-02
---

# Attack-slot reservation, as specified by a Node-side prompt registry

How the PoF application — a Next.js 16 / Node tool that drives coding agents against an
Unreal Engine 5 project — specifies squad coordination. Citations are against commit
`9aa31407` and every line was re-opened on the date in the frontmatter. The interesting thing
about this realization is that the coordination system does not run in Node at all: Node holds
the *specification and the rubric*, and a coding agent emits the C++. That makes the two files
below the actual authoring surface, and it is why their precision matters more than usual.

## The specification

`src/lib/module-registry.ts:808`, checklist item `ai-5`, is the most complete statement of the
technique in the tree. Stripped to its claims:

- A squad manager (`UAISquadManager`, a world subsystem) tracks groups and assigns coarse roles
  — one engager, one or two flankers, the rest circling at range.
- Melee positioning is explicitly *not* the squad manager's job. It is a **"RESERVATION system
  owned by each target"** — the ring of slots belongs to the defender, not to the group.
- The ring is **sized to the silhouette**: "man-sized ~4 — front/back/flanks; large creatures
  8-16; whatever fits the silhouette".
- The lifecycle is **request → specific-slot offer → arrive-and-confirm within a timeout, or
  the slot is reclaimed**.
- Large attackers request **adjoining** slots, and when two free slots are not adjacent "the
  target asks a smaller holder to reseat" — a compaction move.
- **Mass-cancel** of every reservation "when the target dies, jumps far, teleports, or takes
  flight", with a stated fallback: "holders fall back to ranged attacks or retarget"; slots are
  re-offered on landing.
- Concurrent action is capped **below** the slot count — "e.g. 2 active swings" — so the rest
  hold position without acting.
- The stated purpose is to prevent "surround and stunlock" and enemies stacking inside each
  other.

The rubric half is `src/lib/evaluator/module-eval-prompts.ts:334`, a single quality criterion
that restates the same lifecycle almost verbatim, and `:333`, which states the underlying
principle in one line: *"Group AI should coordinate without tight coupling between agents."*

## What this confirmed, and what it taught the standard

Four of the technique's rules were confirmed here rather than transplanted into here, and two
of them were **upward lessons** that the draft did not contain:

**The registry belongs to the contested resource.** The draft placed the claim table at group
scope. This spec places it on the target, and the reason is visible in its own failure list:
retargeting, multiple groups converging, and the defender ceasing to exist are all trivial for
a target-owned ring and all special cases for a group-owned one. The golden path and the
technique were both amended.

**The offer must be confirmed by arrival.** A lease that expires on a timer handles an agent
that dies. It does not handle an agent that holds a slot it can never reach, which is the
common case on real geometry. The request/offer/confirm handshake in this spec is what closes
that hole, and the technique now carries it.

Two further details were already present in the draft but are sharper here: the mass-cancel
event class (a state change of the resource, invalidating every claim at once, distinct from
per-lease expiry) and the separation of *holding a slot* from *being permitted to swing*, which
is what converts a ring of attackers into a rhythm.

## Deviations recorded

**Coordination is specified; nothing measures it.** The four evaluation families at
`src/lib/evaluator/module-eval-prompts.ts:324-339` are structure, quality and performance
checks over source code. There is no criterion asking whether a reservation was ever actually
granted at runtime, whether the mass-cancel path ever fired, or whether the concurrent-swing
cap held under load. Everything above is checkable by reading C++ and none of it is checkable
by reading a fight, which places the whole subsystem on the structural rungs.

**The lease durations are unstated.** The spec says "within a timeout" and "cap simultaneous
attackers (e.g. 2 active swings)" without a confirmation timeout in seconds, a lease duration,
or a group size band the ring layout was authored for. The numbers that would let a grader
distinguish a working ring from a stalled one are the numbers absent.

**The debug surface is human-only.** `src/lib/module-registry.ts:809` specifies a Gameplay
Debugger category showing "squad role, attack token status" and console commands
`ai.debug.showsquad` drawing "role assignments + attack tokens". Excellent for a person
watching a running game; unreadable by the automated grader that is the actual consumer on this
line. There is no structured, seeded record of claim grants and denials, which is what the
subject's evidence technique asks for.

## The counter-example the tree supplies itself

The tree already knows what the fix looks like, one item further down. `src/lib/module-registry.ts:810`
closes with:

> Verify with an AFunctionalTest that places the player within range and asserts the player GAS
> Health drops — do NOT rely on a file-existence check, which is gameable.

That is the rung ladder stated in one sentence by a practitioner who had been burned: existence
is the bottom rung, it is *gameable*, and the verdict comes from an observer reading real state
after the fact. Applying the same instinct to the reservation system — a headless scenario that
asserts at most two attackers swing at once and that every slot returns to the pool when the
defender dies — is the shortest path from this spec's structural rungs to behavioural evidence,
and nothing in the tree currently does it.
