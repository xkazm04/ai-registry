---
layer: technique
type: technique
subject: learning-curve-and-teaching-design
technique: introduce-practise-test-spacing
status: forged
laws: [structural-proof-is-never-sufficient]
shared_with: []
use_when: [placing where a mechanic is first shown and where it is required, a mechanic is shown once and never again, players fail a section they were never given a chance to rehearse]
---

# Introduce, practise, test spacing

The named concern: for each atom, place the beat that shows it, the beats that rehearse it,
the beat that requires it, and the beat that combines it with something else — and hold the
distances between those beats to stated bounds, because the distances are the teaching, not
the beats.

## The four beats and what each must satisfy

**Introduce.** One atom, alone, where failing costs nothing and the correct action is very
nearly the only one available. Two constraints do most of the work: isolation, and
survivability. An atom introduced beside another is two experiments in one trial — neither
the player nor the telemetry can attribute the outcome. An atom introduced where failure
ends the run teaches avoidance, which is a lesson, and not the one intended.

**Practise.** Repetition where failure is still cheap, enough of it that execution stops
being deliberate. Practice is the beat that gets cut when a schedule slips, and cutting it
is invisible at review time because the introduce beat and the test beat are both still
there.

**Test.** The atom is load-bearing: the section cannot be completed without it, and failure
costs something real. Until an atom has a test, the player has been told about it. The test
is the first beat that produces evidence rather than exposure
([structural-proof-is-never-sufficient](../../../_laws.md#structural-proof-is-never-sufficient)).

**Combine.** The atom with an atom already tested. A combination is a **new atom** and needs
its own introduce and practise beats; treating it as a harder repetition of either parent is
the most common way a smooth ramp turns into a wall with no number changing anywhere.

## Procedure

1. **Order the atoms** by their prerequisite graph, then lay their beats along the content
   the player will traverse.
2. **Give every atom four positions**, allowing practice to repeat. An atom with three
   positions is a candidate finding; an atom with two is a finding.
3. **State the spacing bounds per beat pair**, in whatever unit the schedule is measured in
   — encounters, rooms, minutes of play. There is a floor between introduce and test (a test
   adjacent to the introduction is an exam) and a ceiling between any demand and the
   previous one (past the decay interval the atom is cold).
4. **Check isolation at every introduce beat**: exactly one atom is new there.
5. **Promote every combination to its own entry** and repeat the whole procedure for it.
6. **Re-run the layout whenever content moves.** The beats are positions in a sequence, so
   inserting or cutting a region invalidates spacing that was correct the day before. This
   check is cheap and must be automatic, because nobody re-runs it by hand.

## Decision rules

- **When an atom is introduced and never tested, cut the atom or add the test.** Do not
  ship the middle. The player will infer the mechanic is optional, and they will be right,
  and it will then read as a balance problem for the rest of the project.
- **When a section is failing players who understand it, look for the missing practice
  beat before touching any number.** Under-rehearsed and under-powered produce the same
  complaint and have opposite fixes; a difficulty lever applied to an under-rehearsed
  section makes the eventual test meaningless without making the section teach anything.
- **When two atoms must be introduced close together, separate them by a beat that demands
  only the first.** If the schedule genuinely cannot afford the separation, merge them into
  one atom and teach the merged thing — an honest merge is better than an unattributable
  double introduction.
- **When the gap since an atom's last demand exceeds its decay interval, treat the next
  demand as a test with no practice** and insert a rehearsal, or accept that this is a
  second first-time teach and pay for it deliberately.
- **When a combination arrives before both parents have been tested, move it, not the
  parents.** Moving a parent earlier disturbs everything downstream of it; moving the
  combination later disturbs one thing.
- **When an introduce beat can only be left by succeeding, add the failure exit.** A beat
  with a success path and no failure path traps exactly the player it was written for, and
  a stalled player is a worse outcome than an unlearned atom. Let them through with the atom
  recorded as untaught — a truthful state the corridor check can act on downstream — and
  never by granting the taught flag on the way past, which converts a stall into a silent
  lie about what the player knows.
- **When a beat cannot be sited because the content does not exist yet, record the beat as
  unsited.** An unsited beat is a scheduling debt with a location; a beat quietly assumed to
  exist somewhere is how the introduce-and-never-test shape gets into a plan that looked
  complete.

## When not to use this

- **Sandbox and toy-first designs** whose whole proposition is that the player sets their
  own order. There, isolation at introduction still applies but the test beat may legitimately
  be optional — replace "must be required" with "must be rewarded", and expect the corridor
  floor rather than the ceiling to be the live risk.
- **Atoms the audience arrives holding.** A genre convention the target audience has used for
  twenty years needs an introduce beat only as a confirmation that this game honours the
  convention. Spending a full four-beat schedule on it is the over-generous teaching budget
  in miniature.
- **Short-form content** whose entire length is under the spacing floor. A ten-minute
  experience cannot space beats; it should carry fewer atoms rather than compressed ones.
- **As a difficulty tool.** The spacing decides whether the player *can* learn; it does not
  decide how hard the tested version should be, who chooses that, or what may adjust while
  the fight runs. Those are separate decisions with a separate owner.
