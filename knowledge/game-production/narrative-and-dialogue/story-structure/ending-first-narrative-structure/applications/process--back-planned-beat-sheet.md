---
layer: application
type: application
subject: ending-first-narrative-structure
technique: back-planned-beat-sheet
stack: process
status: forged
verified_on: 2026-10-09
---

# Death Ride's campaign, planned backwards from its finale

This realises the back-planned beat sheet for Death Ride, an unplayed top-down vehicular
combat racer for Fire TV with five regions, roughly thirty-five races, three-line story
cards, a ledger of debt to the league boss Marrow, a car seizure, regional bosses who turn
into allies, and a finale fought to the death in a rig the young Mechanic builds. The
material is three of the four research dossiers written for its narrative lead on
2026-10-04, in the `firetv-deathride` tree under `docs/narrative/research/`; every anchor is
root-relative to that tree (`firetv-deathride`). This application read the dossiers alone. A
sheet was in fact written the same day, in the head writer's story bible and in the script
that carries the ledger as tags. The `kotlin--back-planned-beat-sheet` companion reads both,
as the game ships them (corrected 2026-10-09). What follows is the sheet's content as the dossiers already supply it, the
checks they pass and fail, and what nobody has tested — which is all of it, in play.

## The bottom row: a finale that grades the campaign

The game-narrative dossier (R2) supplies the direction of planning:
`docs/narrative/research/R2-game-narrative-craft.md:38 "design every earlier beat as preparation for that event, and let the preparation be measured"`,
against the naive form `docs/narrative/research/R2-game-narrative-craft.md:39 "The finale is simply the hardest race."`
The evidence is Brian Kindregan on Mass Effect 2's suicide mission (TheGamer,
https://www.thegamer.com/mass-effect-2-suicide-mission-characters-choices-archetypes/),
rated High. Its Death Ride form is `docs/narrative/research/R2-game-narrative-craft.md:303 "The finale grades the campaign"`:
which allies appear and how the rig performs depend on earlier choices.

The wasteland dossier (R4) cites the same source and adds the step that became this
technique's acquisition-and-trust rule:
`docs/narrative/research/R4-wasteland-and-rivalry-craft.md:68 "decide what the ending needs from each ally, then give each an acquisition beat and a trust beat proving they can supply it"`.
Its finale option gives each ally a named job so that
`docs/narrative/research/R4-wasteland-and-rivalry-craft.md:143 "the finale becomes the sum of the campaign"`.
This was an upward lesson: the draft treated payoffs as information only, and the dossiers
showed that in a game the finale's needs are payoffs too.

## Plants walked backwards from the bottom row

**The killing blow.** R1 plants the finale's decisive mechanic at the start:
`docs/narrative/research/R1-prestige-series-craft.md:307 "Plant the killing blow in region 1"`
— a track feature, a league rule, or the mine the Mechanic was too nervous to arm in a
tutorial. That is a mechanic plant, the strongest channel the technique names.

**The rig.** R2 plants the Mechanic's secret project with shop-screen oddities from region 1
— `docs/narrative/research/R2-game-narrative-craft.md:298 "Players should half-notice."` — and
pays it off in play rather than in words:
`docs/narrative/research/R2-game-narrative-craft.md:300 "Reveal through a test run, not a speech."`
The test run is also the trust beat for the finale's main capability.

**Marrow's endgame.** R1 applies the density rule
(`docs/narrative/research/R1-prestige-series-craft.md:86 "every earlier scene between them should hold a hint you only see on a rewatch"`,
Kirkman on Invincible via AV Club, https://www.avclub.com/how-robert-kirkman-made-the-invincible-finale-an-emotio-1846782231)
to Marrow:
`docs/narrative/research/R1-prestige-series-craft.md:347 "Every earlier card with Marrow should hold one detail that only reads properly after the seizure."`
with the double reading stated exactly as the technique wants it:
`docs/narrative/research/R1-prestige-series-craft.md:353 "Seen the first time, he is generous. In hindsight he is foreclosing."`

**The seizure is a dread payoff, not a twist.** R4 plants it on another character first, so
`docs/narrative/research/R4-wasteland-and-rivalry-craft.md:131 "so the Crown seizure later is a promise kept, not a twist"`,
and R2's risk list sets the matching playtest goal:
`docs/narrative/research/R2-game-narrative-craft.md:320 "prediction plus dread is the goal"`.
This was an upward lesson: the draft treated every major payoff as a surprise, and the
seizure showed that a payoff column needs a surprise-or-dread kind.

**The Mechanic's loyalty is a fair suspicion.** R4 proposes to
`docs/narrative/research/R4-wasteland-and-rivalry-craft.md:141 "plant two clues that could read as betrayal (absences, vanishing parts)"`
and then reveal that the Mechanic refused Marrow's offer, which keeps the found family intact
on replay. The dossier's own warning is why the betrayal technique now carries that inverse
shape: the naive alternative is
`docs/narrative/research/R4-wasteland-and-rivalry-craft.md:79 "a friend is secretly a traitor, poisoning every relationship retroactively"`.

## The reveal column, and the cut

R1 budgets the reveals —
`docs/narrative/research/R1-prestige-series-craft.md:209 "budget one major reveal per unit (episode, region) and cut any thread that cannot be paid off in the available time"`
— and for Death Ride sets
`docs/narrative/research/R1-prestige-series-craft.md:331 "With five regions, allow five major reveals and no more."`
A sixth thread that appears in writing is told to
`docs/narrative/research/R1-prestige-series-craft.md:339 "cut it or fold it into one of the five"`.

The cautionary case behind the cut is Arcane's second and final season:
`docs/narrative/research/R1-prestige-series-craft.md:213 "Arcane season 2 is the cautionary case."`
Christian Linke concedes `docs/narrative/research/R1-prestige-series-craft.md:213 "It would have been great to have more time"`,
and a secondary summary reports the finale's
`docs/narrative/research/R1-prestige-series-craft.md:213 "early cut ran over an hour and action was trimmed to fit"`,
rated `docs/narrative/research/R1-prestige-series-craft.md:217 "Medium for the detail of the hour-long early cut (secondary summary)."`
(Inverse, https://www.inverse.com/gaming/arcane-showrunner-christian-linke-interview-on-disappointing-fans;
GameRant, https://gamerant.com/arcane-season-2-christian-linke-pacing-rushed/). Read against
R1's own fixed-ending evidence for the same series, this was the most important upward
lesson of the reconciliation: the ending was locked from the start and the season still
overstuffed, so the lock and the cut are separate disciplines. R1's cross-cutting note
supplied the cut order:
`docs/narrative/research/R1-prestige-series-craft.md:248 "The human scale beats the conceptual scale."`

## Fixed beats and the run-time picker

R2 sets the pinned set small, because the campaign's short lines are chosen at run time by a
salience table: `docs/narrative/research/R2-game-narrative-craft.md:164 "Pin only a few beats to fixed slots and let everything else float"`,
and for Death Ride lists them as
`docs/narrative/research/R2-game-narrative-craft.md:308 "the hook (first race plus first ledger), each boss turn, the first ally call-in, the seizure, the rig reveal, the finale"`,
with the guard `docs/narrative/research/R2-game-narrative-craft.md:318 "Never let it pick the fixed beats."`
(Emily Short on salience, https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/;
Kasavin on Hades, https://www.gamedeveloper.com/design/how-supergiant-weaves-narrative-rewards-into-i-hades-i-cycle-of-perpetual-death).

## Theme in the plan's order

R1 makes region 1 a prologue in a different tone, so that
`docs/narrative/research/R1-prestige-series-craft.md:262 "Regions 2 to 5 take apart what it built, so the structure itself says how a debt grows."`
R4 keeps the region order because it is the league's supply chain:
`docs/narrative/research/R4-wasteland-and-rivalry-craft.md:151 "The player follows the money upstream to its owner"`.
Both are confirmed instances of theme carried by structure, and the second became the
technique's form-as-argument example.

## Deviations against the sheet's checks

**No major-versus-minor test.** R1's five reveals include "Marrow's grievance" and "a boss's
hidden debt"; the dossier gives no criterion for whether these recontextualise anything,
and the reveal column cannot be checked until each is restated as what it re-reads.

**No placement rule for skipped content.** None of the plants above says it must sit on
every route to its payoff or travel in a second channel. The Marrow details live only in
cards, which a player can skip; the killing-blow plant is a mechanic and survives skipping;
the rig oddities are shop lines and may not. The sheet's critical-path check would flag the
first and third.

**Unsourced generalisation.** R1 asserts
`docs/narrative/research/R1-prestige-series-craft.md:209 "Overstuffing is the most commonly reported failure"`
of a final season with no source for "most commonly"; the technique uses the case, not the
ranking.

**Timing unreconciled.** R1 places "the cost of the seizure" as region 5's reveal; R2 lands
the seizure itself at about 75 to 80 percent of the campaign. The sheet must decide whether
region 5's reveal is the seizure's cost or something else, or the bottom rows will carry two
majors.

## What this does not prove

The sheet will prove the campaign is paid for on paper. Whether the plants
register at TV distance, whether players predict the seizure and dread it, and whether the
finale feels like the sum of the campaign are playtest questions, and Death Ride has no
players yet.
