---
layer: application
type: application
subject: difficulty-design-and-adaptation
technique: tier-changes-decisions-not-specs-test
stack: process
status: forged
verified_on: 2026-10-01
---

# Three rival tiers that differ by decision, a test that proves it, and two checks still on paper

A combat-racing game for a television and phone-controller setup (source tree
`firetv-deathride`, working copy read on 2026-10-01) gives its AI rivals three campaign
tiers. Everything here is **simulated or authored**: the tests drive scripted cars in a
fixed-step simulation. Nobody has felt the tiers, and the design notes say so
(`docs/concepts/deathride/W7-campaign.md:56` "Owner enjoyment, perceived rival identity, physical-phone comfort and human win rates remain **not measured**").

## What is implemented: the two-sided tier test

The tier table is a data file, and its columns are the decisions
(`deathride/core/src/main/resources/data/ai-skills.csv:5` `Rookie,18,0.70,4,1.0,0,0,0`;
`:6` `Club,12,0.60,2,0.5,1,1,0`; `:7` `Pro,8,0.52,0,0.15,1,1,1`). Reaction steps fall
18, 12, 8; mines are off for the lowest tier and on for the next; repair seeking is on
only for the top. No column is a health, damage or speed number.

One unit test carries both halves of the technique
(`deathride/core/src/test/kotlin/dev/deathride/core/CareerTest.kt:38` `fun tiersChangeDecisionsWithoutChangingPower`):

- **Decision side, mines.** In a placed situation the lowest tier lays none and the next
  tier does (`:46` `assertEquals(0.0,c.aiInput.mine)`; `:47` `assertEquals(1.0,c.aiInput.mine)`),
  and a named rival's own style then overrides it (`:48` `"Rook's profile never drops mines"`).
- **Decision side, repair seeking, with the removal clause.** The car is damaged with a
  repair pickup 15 m ahead: the middle tier ignores it, the top tier targets it, and once
  the pickup is on cooldown the top tier stops
  (`:51` `assertEquals(-1,c.aiPickupTarget)`; `:52` `assertTrue(c.aiPickupTarget>=0)`;
  `:53` `pickup.cooldownSeconds=1.0;world.combat.seekRepair(c,0.0);assertEquals(-1,c.aiPickupTarget)`).
  This is the "a behaviour that stops when its trigger goes away" check the technique asks
  for, and it is present.
- **Specification side.** The same car's spec and mine ammunition are unchanged after the
  tier swaps (`:54` `assertEquals(spec,c.spec)`), and for every tier the five rivals
  carry the catalog spec and full health
  (`:55` `assertEquals(CarCatalog.all[Career.rivals[i-1].carIndex].spec(),w.cars[i].spec)`).
  Comparison is against the single catalog, not tier against tier, which is the form the
  technique prefers.

The design note states the contract the test enforces: "Behavioral tests must demonstrate
the tier-specific choices in controlled situations, identical physical specs/HP/ammo across
difficulty" (`docs/concepts/deathride/W7-campaign.md:21`).

## Where the realization falls short of the standard

**The specification side is narrower than the contract.** The line that reads as an HP
check, `:54` `assertTrue(hp<=CombatRules["maxHp"])`, takes `hp` before the damage call
and bounds it by the maximum; it cannot fail on a hidden health bonus. Health equality
across tiers is carried only by the per-tier loop at `:55`, which compares rival health to
the maximum. Damage output is not asserted in this test at all.

**Three exclusions are authored, not asserted.** The campaign note lists them as one
sentence: "No catch-up, hidden speed, extra HP, damage scaling or omniscient through-wall
shooting" (`docs/concepts/deathride/W7-campaign.md:19`). The test above covers extra HP
for rivals; no test in the file places the player ahead and behind to check catch-up,
checks achieved speed against the cap, or checks through-wall fire, and the rival
schedule being tier independent is not asserted either: `Career.prepareRivals(w,tier)`
(`:55`) takes the tier as an argument, and the test checks only each rival's spec and
health, not their identity or order across tiers. Under the technique's
own rule these are design rules until a run says otherwise.

**The reaction floor is a cap, and says so.** "a declared minimum reaction interval of at
least 100 ms for campaign perception. These are design caps, not a claim to measured human
reaction distribution" (`docs/concepts/deathride/W7-campaign.md:19` "design caps, not a claim to measured human reaction distribution"). That is the honest form of the bound. No test cited here
checks the table's smallest reaction step count (8) against it, so the floor is stated,
not enforced.

**An anchor that did not hold.** The progression note names the skill-swap tiers
*Champion* and *Rookie*, but the shipped skill table has only Rookie, Club and Pro
(`deathride/core/src/main/resources/data/ai-skills.csv:7` `Pro,8,0.52,0,0.15,1,1,1`) plus three legacy rows; a swap test written from the note would
have to say which table rows stand for "Champion".

## The two checks that exist only as intent

The progression design states four invariants for the simulation to prove, two of which
are the other techniques of this subject:

- **Skill swap.** "the same light car driven by the AI at *Champion* skill ... beats a
  *Rookie*-skill heavy of the same tier on technical tracks; the same heavy at Rookie skill
  beats a Rookie-skill light on a straight-heavy track. If skill moves the result by less
  than a declared margin, the skill axes are broken, not the cars"
  (`docs/concepts/DEATH-RIDE-PROGRESSION.md:44-45`).
- **Equal-skill straight loss.** "with all AIs at equal skill, the light car's top-speed
  deficit must show up as time lost on a long-straight track (declared minimum), and must
  not be made up by free acceleration advantages alone"
  (`docs/concepts/DEATH-RIDE-PROGRESSION.md:46`).

**Both are design intent. As of this verification neither has been run**: no test in the
core test directory mentions them, the declared margin and the declared minimum are not
yet numbers in the data, and the section's own heading, "proven by simulation, not
asserted" (`:41`), describes a requirement, not a result. The tier-decision test above is
the only one of the three that exists.

## What the nearest measurement does and does not show

The pacing sweep runs a fixed reference driver against each rival tier: win rates of
72.68, 37.08 and 30.53 percent (`docs/concepts/deathride/W7-campaign.md:40`
"Rookie **72.68%**, Club **37.08%**, Pro **30.53%**"). It is monotonic, and it is the
one-rung measurement the skill-swap technique warns about: it shows rival tiers change
outcomes for one driver, with a gap of about six and a half points between the top two
tiers, and says nothing about whether a tier-for-tier swap of the driver is ordered.

**An upward lesson from the same note: seed coverage decides the headline.** Once explicit
skills removed the old per-car variation, "The initial eight-seed cells therefore repeated
outcomes", and the first report gave "57.93/49.14/35.05% win rates" before a seeded line
offset widened the coverage (`docs/concepts/deathride/W7-campaign.md:47` "Preliminary reports are preserved"). The fix is checked by asserting a
distinct final physical hash per cell (`deathride/core/src/test/kotlin/dev/deathride/core/CareerTest.kt:80`
`assertTrue(hashes[tier][course][band].add(w.stateHash()),"Seed cell must contain distinct physical outcomes")`).
A tier test built on repeated outcomes would have passed or failed on the repeats, which
is why the technique asks for that assertion before any rate is read.
