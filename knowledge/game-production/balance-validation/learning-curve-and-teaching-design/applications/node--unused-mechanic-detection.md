---
layer: application
type: application
subject: learning-curve-and-teaching-design
technique: unused-mechanic-detection
stack: node
status: forged
verified_on: 2026-09-02
---

# An unused-ability alert that cannot see the teaching cause

Read against the PoF repository at commit `9aa31407` — a headless combat simulation and
evaluation stack that resolves configured encounters many times and emits balance alerts.
Its unused-ability detector is a clean instance of the reflex this technique inverts, and
the tree is worth citing because the mistake is visible in one message string.

## The detector

`src/lib/combat/simulation-engine.ts:944-956` walks the per-ability heatmap accumulated
during the trial batch and raises one alert per low-usage ability:

```
  // Abilities never used
  for (const [name, avgUses] of Object.entries(summary.abilityHeatmap)) {
    if (avgUses < 0.1) {
      alerts.push({
        severity: 'warning',
        type: 'ability-unused',
        message: `"${name}" is used <0.1 times per fight — ability may be too expensive, low damage, or on too long a cooldown`,
```

The counter behind it is `abilityUsage`, incremented at
`src/lib/combat/simulation-engine.ts:353` and returned as `abilitiesUsed` at line 466.

Two things are right about this. The threshold is expressed per fight rather than per
session, which is close to an opportunity denominator; and the alert is a warning that names
the ability, so it routes to a person rather than to a score.

## Deviation 1: the cause list contains no teaching cause

The message enumerates three candidate causes — "too expensive, low damage, or on too long a
cooldown" — and all three are balance levers. The fourth candidate, *the player was never
taught it*, is absent, and a designer reading this alert is steered directly into the buff
that the technique's first decision rule forbids: buffing a mechanic nobody was taught makes
the few who already know it stronger and changes nothing for everyone else.

The standard does not move here. The minimum change is to the message and the routing, not
to the detector: hold the alert as *unclassified* until a teaching state is attached, and
name all four candidate causes when it is reported.

## Deviation 2: the instrument is structurally blind to the teaching cause

This is the more interesting failure, and it is not fixable inside this file. The heatmap is
produced by simulated fights, and the simulated actor selects abilities from its configured
kit. It is competent at every mechanic by construction. In that population, "never taught"
cannot occur, so an ability that a real population would never learn is indistinguishable
from an ability a competent player evaluates and declines.

That is the harness form of expert amnesia, and it means a low reading from this detector
supports exactly one of the four states the technique classifies into — *taught and
rejected* — and supports it only for a player who was taught. The static sweep the technique
asks for (an ability present in the content whose atom has no introduction site and no test
site) needs no simulation at all and would catch the other three, but the tree has no atom
inventory to run it against; the tutorial pipeline that would hold one is described in the
companion application for this subject.

## What the tree already knows about the corridor

The evaluation prompts are further along than the simulator. In
`src/lib/evaluator/module-eval-prompts.ts`, the progression module's quality criteria carry
both walls explicitly at line 256 — "Progression should keep the player inside a flow
CHANNEL, not on a flow line: below it the player is bored, above it frustrated, and both
exit the game" — and line 255 states the four-term difficulty decomposition, including that
player skill "cannot be set, only estimated". Line 182 in the same file requires that a
harder enemy tier add "at least one new decision for the player, not just a longer fight".

Those three lines are the corridor and the ladder in prose, addressed to a review model. The
deviation is what they are drawn *against*: challenge and progression pacing, never a taught
set. Nothing in `module-eval-prompts.ts` asks where a mechanic is introduced, whether it is
ever required, or whether a demanded competence was granted upstream — so a module can pass
the flow-channel criterion while demanding an atom the game never teaches, and no pass in the
evaluation ladder is positioned to notice.
