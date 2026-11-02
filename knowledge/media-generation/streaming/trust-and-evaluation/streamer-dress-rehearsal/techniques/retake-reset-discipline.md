---
layer: technique
type: technique
subject: streamer-dress-rehearsal
technique: retake-reset-discipline
status: forged
laws: []
shared_with: []
use_when: [running a rehearsal more than once, designing a rehearsal's stop and reset controls, preparing repeatable takes of a stream tool for recording or review]
---

# Retake reset discipline

A rehearsal is rarely run once. The streamer changes a rule and runs it again, rehearses
a second segment, or records several takes for a review or a showcase. Every take after
the first starts from whatever the previous take left behind, and tools for live work are
built to persist exactly what a retake needs gone: rules armed with consent, draws filled
and sealed, attempts consumed so they cannot be re-rolled, sources added to the scene,
visual tuning, moderation records. A second take that finds a sealed draw cannot fill it;
a scene that already holds the plate gets a second copy; an armed rule fires from the
first second instead of being armed on camera. Each is the tool behaving correctly, and
the take is ruined anyway.

## Stop is not reset

The craft separates two controls and names them honestly. **Stop** ends the simulated
traffic: crowd, scenarios, previews, the generated-chat consumer — cancelled and joined so
nothing keeps writing. **Reset** returns every persisted thing the rehearsal created to
the state the rehearsal started from. A tool that offers only stop must say on the button
and in the rehearsal summary that stop preserves configuration, draws and sources,
because a streamer reads "stop" on a rehearsal as "the take is over and I can start
again", and it is not.

The protective properties of the live tool must not be weakened to make retakes work. A
sealed draw stays frozen and a consumed attempt stays consumed; the reset does not
"unseal", it discards the rehearsal's world and starts a fresh one. That is why the robust
form of reset is **a fresh store per take**: the rehearsal store is created at the start
of a take and discarded at the end, so nothing the live safety rules forbid ever has to
be undone, only thrown away.

## Broadcast sources are reset by identity

The rehearsal also leaves things in the streamer's broadcasting software. Those are
removed by the identity the tool recorded when it created them, never by name pattern, and
each removal is verified by reading the scene back, so a reset cannot delete something the
streamer made and cannot report a removal that did not happen. A record of owned sources
that is persisted after each verified removal lets an interrupted reset resume safely.

## Procedure

1. Inventory everything a rehearsal take persists: in the tool's stores, in the
   broadcasting software, on disk next to them.
2. Give the rehearsal a take boundary: a fresh store at take start, discarded or archived
   at take end, under the rehearsal root, never the live one.
3. Make stop cancel and join every generating task and clear transient previews, and say
   in the interface what it leaves in place.
4. Make reset remove the tool's own broadcast sources by recorded identity, verify each
   absence, and report the removed count.
5. Before a take that will be recorded, check the starting state against the take's
   expectations — no sealed draw, no armed rule, an empty rehearsal scene — and refuse to
   start the take if it differs.
6. When a reset is impossible in the current build, write the manual procedure down
   (which store to move aside, which sources to clear) and run it as a checklist rather
   than from memory.

## Decision rules

- **When a retake would need a safety rule relaxed, discard the state instead.** Unsealing
  a draw for convenience in rehearsal is how the code path for unsealing reaches live.
- **When the starting state of a take is not the expected state, do not start the take.**
  A take that begins in an unknown state produces footage nobody can explain.
- **When a feature reuses existing rehearsal state on purpose** — topping up an accepting
  draw rather than creating another — make that reuse visible, so the streamer knows a
  second fill joined the first.

## When not to use it

A single exploratory rehearsal the streamer runs once and discards needs only a clean
store at entry. The discipline pays from the second take onward, and above all for takes
that are recorded.
