---
layer: technique
type: technique
subject: difficulty-design-and-adaptation
technique: tier-changes-decisions-not-specs-test
status: forged
laws: [declaring-an-input-is-not-consuming-it, law-and-check-share-one-source, structural-proof-is-never-sufficient]
shared_with: []
use_when: [shipping difficulty tiers for opponents that share the player's rules, a tier is described as smarter rather than stronger, auditing a game for hidden catch-up or opponent bonuses, proving that a difficulty tier changes behaviour and nothing else]
---

# Tier-changes-decisions-not-specs test

The named concern: a difficulty tier is verified by a two-sided test. One side asserts that
the tier changes the opposition's **decisions** in a controlled situation. The other side
asserts that it changes none of the opposition's **specifications**. Both halves are needed:
the first alone cannot tell skill from a hidden bonus, and the second alone passes an
identity tier that changes nothing.

It sits under the skill-versus-power distinction as its enforcement. That technique says a
tier should add behaviour rather than coefficients. This one makes the sentence executable
and adds the clause its prose usually omits: the coefficients are required to be equal.

## The decision side

For each behaviour the tier table says differs, build the **minimal controlled situation**
in which that behaviour is the only thing that can differ, then run the decision once per
tier and assert the outcome.

- A tier that adds a hazard-laying behaviour: place the agent where laying one is
  advantageous and assert that the lowest tier does not and the next tier does.
- A tier that adds repair seeking: damage the agent, place a repair a short distance away,
  and assert the lower tiers ignore it while the top tier heads for it. Then make the repair
  unavailable, in the same test, and assert the top tier stops. A behaviour that does not
  respond to its own trigger being removed is a constant.
- A tier that adds a lead-time or a reaction delay: present a stimulus and assert the time
  until response differs in the declared direction by at least the declared steps.

Each assertion names its tier and its reason, so a failure reads as a sentence about a
tier rather than a boolean.

**Every field in the tier table must be consumed by something.** A column the tier data
declares and no decision reads is a promise nobody keeps. The test therefore walks the
table: for each field that differs between adjacent tiers, one controlled situation exists
that turns on it. A field with no situation is either dead data or an untested tier, and
the audit says which.

## The specification side

Assert, for every tier, that the opposition's physical specification, hit points and
ammunition are **identical** to the baseline, and that damage output is the same. Compare
the whole record where possible rather than a chosen subset, because a subset assertion is
exactly the shape a hidden advantage slips past. Prefer value equality against the single
authoritative catalog over comparing tiers with each other, so that all tiers cannot drift
together unnoticed. Beware the assertion that can only fail on nonsense, such as a health
value being at most its maximum: it bounds the quantity without pinning it.

Four exclusions belong in the same suite, each a recognised way a "smart" tier cheats while
keeping the sheet identical:

1. **No catch-up.** The opposition's speed does not respond to the player's position. The
   test is behavioural: place the player far ahead and far behind and assert that the
   opposition's achieved state is the same in both runs.
2. **No hidden speed.** The achieved top speed never exceeds the specification's cap, at any
   tier.
3. **No omniscient perception.** The agent's sensing obeys the same occlusion as the
   player's; a through-obstacle shot is a failing case.
4. **A fixed rival schedule.** The identity, order and loadout of opponents are tier
   independent. A tier that quietly changes who the rivals are has changed the contest
   without changing a spec, and the spec test passes.

State, per exclusion, whether it is asserted by a run or only written as a design rule. A
rule that nothing checks is an authored claim, and a suite that covers one exclusion does
not cover the other three.

## Bound the skill

A declared floor on reaction time is part of the contract: a tier whose response delay can
drop below a human-plausible minimum is a different game. Assert the floor in the same
suite and record where it came from. A floor chosen as a design cap is honest; a floor
presented as a measured human distribution, when nobody measured one, is not.

## Procedure

1. **Write the tier table first**, one column per behavioural difference, one row per tier.
2. **For each column, write the controlled situation** and the expected decision per tier.
3. **Assert spec equality against the catalog** for every tier, the whole record.
4. **Assert the four exclusions**, each behaviourally, or mark each as authored only.
5. **Make the test read the tier table**, not a copy of it, so the check and the law share
   one source and a retuned tier is checked against its new values.
6. **Calibrate both directions.** Show the test failing when a tier is given a hidden bonus
   and when a declared behaviour is removed. A guard that has never been seen to fail is not
   known to be able to.

## Decision rules

- When the decision side passes and the spec side fails, the tier is a power tier with a
  behaviour costume. Remove the coefficient or relabel the tier.
- When the spec side passes and the decision side fails, the tier is a rename. Add the
  behaviour or merge the tier.
- When the situations are contrived to the point that the behaviour never occurs in
  ordinary play, pair this with a skill-swap test; this one proves a decision exists, not
  that it matters to the result.
- When a tier needs a spec change to be playable, that is a design change to the whole
  game, made openly across all tiers, not a tier setting.

## When not to use this

- **For games whose genre mandates scaled numbers.** Where progression is numbers, the spec
  side is the wrong clause; replace it with a declared coefficient list and keep the
  decision side.
- **As evidence of fairness or feel.** The assertions run on a scripted situation in a
  simulation. They show the tiers differ as declared, not that a person perceives them as
  different or fair.
