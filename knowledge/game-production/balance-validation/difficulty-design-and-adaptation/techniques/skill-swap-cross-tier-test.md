---
layer: technique
type: technique
subject: difficulty-design-and-adaptation
technique: skill-swap-cross-tier-test
status: forged
laws: [structural-proof-is-never-sufficient, an-instrument-proves-it-had-input, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [a game claims skill beats equipment or class, adding opponent skill tiers to a contest with asymmetric competitors, a tier ladder exists in data but nobody has shown it changes who wins, deciding whether a weak result means broken skill axes or broken competitors]
---

# Skill-swap cross-tier test

The named concern: turn the sentence "skill matters more than the stat sheet" into an
executable check. Hold the competitor fixed, move only the skill tier of whoever drives it,
and require the contest result to move across a rival that the stat sheet says should win.
This is the test that distinguishes a difficulty ladder that exists in data from one that
exists in play.

The technique on skill versus power scaling says what a tier ought to change. This one is
its instrument: a pass or fail on whether the changes it listed reach the scoreboard.

## The shape of the test

A skill-swap is a four-cell design, not a single comparison. Take two competitors of
different archetypes at the same power tier, one built to win where the course rewards
precision and one built to win where it rewards raw output. Cross each with a high and a
low skill tier. The invariants are claims about which cells beat which:

1. **The precision archetype at high skill beats the output archetype at low skill, on the
   course type that rewards precision.** This is the headline: the weaker-on-paper
   competitor wins because it is played better.
2. **The output archetype at low skill still beats the precision archetype at low skill, on
   the course type that rewards output.** This is the control. It proves the archetypes are
   genuinely different and that the first result is not simply "the precision car is
   better".
3. **The same competitor, swapped from low skill to high, gains by at least a declared
   margin on the course type that rewards skill.** This is the cleanest statement and the
   one a failing run should be reported against.

Without the control the headline is uninterpretable. A suite that only asserts the first
invariant passes just as happily when one archetype quietly dominates everywhere, which is
the opposite of the claim.

## Declare the margin before running

The margin is the whole instrument. "Skill moves the result" is unfalsifiable until it is
a number with a unit and a basis: a win-rate gap over a stated count of seeded contests, or
a finish-time gap in seconds, on a named course type, at a named tier. Write the margin down
before the first run, with the reason it was chosen. A margin chosen after seeing the
result is a description of the result.

Declare the **direction of failure** too. If skill moves the result by less than the margin,
the finding is that the skill axes are broken, not that the competitors need retuning. That
sentence matters because the reflex is the other one: when a skilled low-power competitor
loses, a team raises its power until it wins, and has quietly converted a skill game into a
stat game with a skill-shaped label. The test exists to make that reflex a visible
decision rather than a silent patch. The same logic is why racing designers who reject
catch-up mechanics, which keep opponents near the player by speeding or slowing them,
still need a skill-ladder check: with the catch-up lever removed, the only thing left to
separate tiers is how well they drive, and nothing else will tell you whether they do.

## Procedure

1. **Name the two archetypes and the two course types** and justify each pairing from the
   design intent, not from yesterday's results.
2. **Fix everything except the skill tier**: same power tier, same loadout, same course,
   same seed set across the compared cells. Skill is the only varied term.
3. **Drive the sample from identity-derived seeds** and prove the seeds did something. If
   the skill tier removes a source of variation the seed used to supply, the cells may
   collapse onto a handful of repeated outcomes. Assert that each cell holds distinct final
   states; a cell of eight identical outcomes is a cell of one, and it also changes the
   headline rate: a small sample that repeats itself can move a win rate by tens of points
   when the coverage widens.
4. **Report the rate with its sample size**, and refuse to call a difference smaller than
   the run's resolution. At a few thousand contests a one-point gap is noise.
5. **Run it per tier, not once.** A ladder with six tiers has five adjacent boundaries;
   test each, because the interesting failure is a boundary that does nothing.
6. **Report counterexamples as findings.** A cell where the swap fails is the output of the
   test, not a reason to rerun it.

## What the published failures look like

Practitioners who validated difficulty tiers by pitting the tiers against each other have
reported a sobering pattern: tiers that differ in real code (reaction interval, evasion,
weapon choice, engagement range) can land within a few points of an even split when
matched, so the labels are statistically close to interchangeable. Three causes recur.

**The changed behaviour is off the critical path.** A tier that differs in an option the
contest rarely exercises has no effect on results however visible it is in a replay. Check
which decision the winning cell actually turned on.

**The sample is narrower than the claimed population.** Few seeds, or seeds that stop
mattering once skill is explicit, produce cells that agree with themselves and nothing
else. The remedy is more distinct initial conditions, not more repetitions of the same
ones.

**The test measures one rung.** A win rate against a fixed reference driver answers "does
the tier change outcomes for this driver". It does not answer whether the tiers are
*ordered*: whether each beats the one below it. A reference-driver sweep can show
monotonic rates whose adjacent gap is a few points; that is compressed, not ordered by a
margin. Ordering needs the swap, in both directions.

## Decision rules

- When the headline cell passes and the control fails, one archetype dominates; the finding
  belongs to class balance, not to difficulty, and the skill claim is untested.
- When both pass, the skill axes are carrying outcomes. Record the margin achieved, not
  just the pass, so a later tuning pass can see how much headroom it consumed.
- When neither passes, change the skill axes before touching any power value. Skill
  levers that cannot move a result are the defect.
- When the margin passes only on a course type tuned for it, say so: the claim is scoped to
  that course type, and the other types carry no skill claim.
- When only an adjacent pair of tiers is indistinguishable, merge or redesign one of them;
  a tier nobody can feel is a menu entry.
- When the swap has been specified but not run, label it **intent**, never a result. A
  documented invariant with a declared margin is a plan; the instrument has not yet proved
  it had input.

## When not to use this

- **For a contest with no archetype asymmetry.** With identical competitors a swap shows
  only that skill moves results, which a single-sided test already shows.
- **As a human-felt claim.** The drivers are scripted; a passing swap shows the scripted
  skill axes move simulated outcomes. Whether a person perceives or enjoys the ladder is a
  separate, unrun measurement and must be reported as such.
- **To replace the tier-change test.** A swap can pass through a skill axis that is
  illegible to the player. Pair it with the check that tiers change decisions the player
  can see.
