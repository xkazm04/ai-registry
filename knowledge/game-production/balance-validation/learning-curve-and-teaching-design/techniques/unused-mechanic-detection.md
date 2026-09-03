---
layer: technique
type: technique
subject: learning-curve-and-teaching-design
technique: unused-mechanic-detection
status: forged
laws: [compiling-is-not-wiring, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a shipped mechanic has almost no users, deciding whether to buff something or teach it, auditing generated content for demands and abilities nobody taught]
---

# Unused mechanic detection

The named concern: find the mechanics the game contains but the player never learned, and
separate them from the mechanics the player learned and rejected — because the two look
identical in a usage chart and have opposite fixes.

## Two families of signal, and the cheap family needs no players

**Static signals**, computable from the atom inventory and the content, before anyone plays:

- An atom with an introduction site and **no test site**. The strongest single predictor of
  a mechanic nobody uses.
- An atom with **no introduction site** at all, while content demands it.
- A **mechanic present in the content that appears in no atom** — granted, reachable,
  functional, and in nobody's teaching plan.
- A **demand ordered before its prerequisite**, which makes the atom unlearnable for anyone
  taking the intended route.

**Behavioural signals**, from play:

- **Usage rate at the floor** across the population, measured against opportunities rather
  than against sessions.
- **First use far downstream of the introduction site** — the population found it, but not
  where it was taught, which usually means it was taught somewhere the player was not
  attending.
- **Competence never reached**, from the time-to-competence measurement.
- **Use concentrated in the experienced fraction** of the population. When the only players
  using it are those who arrived knowing the genre, the game did not teach it; the genre did.

The static family is the one to build first. It costs a graph query, it runs before content
exists, and it catches the defect at the point where fixing it is a scheduling edit rather
than a live-game change.

## Procedure

1. **Sweep the inventory statically** for the four signals above, on every content change.
2. **Instrument opportunity, not only use.** A usage figure with no denominator cannot
   distinguish *nobody used it* from *the situation never arose*, and the second is a content
   problem, not a teaching one.
3. **Classify each low-usage mechanic** into one of four states: never taught (a static
   signal fires), taught and never demanded (no test site), taught and rejected (competence
   reached, usage still low), or never afforded (few opportunities).
4. **Route by state.** Never taught and never demanded go to the schedule. Taught and
   rejected goes to balance or to feel. Never afforded goes to content placement.
5. **Render the unclassifiable as unclassified.** A mechanic with no opportunity
   instrumentation has no state, and it must not be filed as *fine*
   ([unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass)).

## Decision rules

- **When a mechanic is unused, treat it as a teaching defect until a competence measurement
  proves otherwise.** This is the inversion that saves the most wasted work. The reflex is to
  buff, and buffing something nobody was taught makes the few who already know it stronger,
  changes nothing for the rest, and manufactures a balance problem on top of the teaching one.
- **When a mechanic is granted, registered and reachable but untaught, it is not done.** The
  player is the last hop of the wiring
  ([compiling-is-not-wiring](../../../_laws.md#compiling-is-not-wiring)), and a pipeline that
  stops checking at reachability has verified everything except whether the feature exists for
  anyone.
- **When usage is low and competence is high, believe the players.** They learned it and
  chose something else. That is a real verdict about the design, and it is the one case where
  the number should go to a tuning pass rather than to the schedule.
- **When a mechanic is used exclusively by experienced players, do not read the usage as
  validation.** It is evidence that the mechanic is good and that the game does not teach it;
  those two facts are commonly reported as one good fact.
- **When a static signal and a behavioural signal disagree, trust the static one about the
  cause.** Telemetry names the symptom and cannot name the cause; the inventory knows whether
  there was ever a test site.
- **When a generated batch is audited, run the sweep across the batch rather than per item.**
  The characteristic generated failure is not one item missing a teaching beat — it is a whole
  batch that assumed a competence the schedule never granted, and per-item review passes each
  one while the batch is broken.
- **When the fix is a schedule change late in production, prefer adding a test site to
  adding an introduction.** A test can be placed in existing content; an introduction wants a
  safe, isolated situation that usually has to be built.

## When not to use this

- **On mechanics that are meant to be rare.** A tool for one situation, an emergency option,
  a build-defining choice most players will not make: low usage is the design working. Set an
  expected usage band per mechanic first, and detect deviation from the band rather than
  distance from zero.
- **Immediately after release.** Early usage is dominated by the order things are unlocked
  and by the loudest guidance. Give the population time to reach the atom's schedule position
  before reading its usage.
- **As a reason to cut.** The signals identify a mechanic nobody learned; cutting it and
  teaching it are both valid responses, and the choice is a design decision this technique
  does not make. Cutting on a usage number alone deletes features whose only defect was a
  missing beat.
- **On competitive or economy-facing mechanics without a balance review alongside.** There,
  usage is shaped by an incentive structure as much as by teaching, and attributing the whole
  signal to teaching will produce a confident wrong answer.
