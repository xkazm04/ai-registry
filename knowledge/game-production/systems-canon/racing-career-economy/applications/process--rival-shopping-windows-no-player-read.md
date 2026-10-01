---
layer: application
type: application
subject: racing-career-economy
technique: rival-shopping-windows-no-player-read
stack: process
status: forged
verified_on: 2026-10-01
---

# Rival garages on a fixed schedule: three documents, one transitive question

Source trees: `C:\Users\kazda\kiro\firetv-deathride` (tip `9793226`) for the progression and campaign
design, and the content tree `C:\Users\kazda\kiro\firetv-deathride-content` for the rival-garage design.
**Status of every claim here: design intent.** The progression document is a plan; the rival-garage design
is untracked and uncommitted in the content tree; no rival shopping window exists as running code that
this application read. Nothing in it was played by a person. Numbers are targets or simulation outputs of
a proxy driver.

## Stage one: opponents stay stock

The first campaign design chose the no-economy answer. `docs/concepts/deathride/W7-campaign.md:17` "Opponents remain stock;" says
"Opponents remain stock; player upgrades are visible advantages, not secretly matched with power boosts."
and `docs/concepts/deathride/W7-campaign.md:19` "No catch-up, hidden speed," lists what is refused: "No catch-up, hidden speed, extra HP, damage scaling or omniscient
through-wall shooting." Rivals are profiles on the same AI; difficulty settings change decisions and
reaction time, with "a declared minimum reaction interval of at least 100 ms", which the document itself
labels "design caps, not a claim to measured human reaction distribution". That is the honest weak form of
the technique, and it was shipped before the stronger one was designed.

## Stage two: the progression plan names the rule

`docs/concepts/DEATH-RIDE-PROGRESSION.md:73` "dips to 0.85-0.9 at each act boss" states the target curve: the ratio "starts at **0.85-0.9**",
rises toward 0.95-1.0, "dips to 0.85-0.9 at each act boss" and ends "~1.05 at the final". The next line is the
rule this technique is named for: "The ratio is **not** a rubber band: the field does not read the player's
performance. It is a fixed schedule" (`docs/concepts/DEATH-RIDE-PROGRESSION.md:74` "the field does not read the player"). The races-to-afford table follows at `docs/concepts/DEATH-RIDE-PROGRESSION.md:75` "Targets to check by simulation, not to assume" (first upgrade
2-3 races, each following tier 7-9, bankruptcy under 3% for a reasonable player: "no dead end").

The document describes the rivals as having wealth "that grows at a declared rate" and buying "through the
same shop", and then adds: "a rival who wins buys better and a rival who is wrecked is set back" (`docs/concepts/DEATH-RIDE-PROGRESSION.md:74` "a rival who wins buys better").
That last clause is the transitive read the technique warns about: a rival's wins come from races the
player runs, so the schedule is only fixed if something bounds it. The plan does not say what.

## Stage three: the rival-garage design supplies the bound

`docs/concepts/deathride/C4-ash-circuit.md:5` "named driver shopping windows" (content tree, untracked, design only) is the version that
answers it: "Rival purchases happen in named driver shopping windows and stay under a fixed event PR
target; neither the target nor the grant reads player PR, wins or skill. Actual rival finishing position,
damage and kills settle through Economy, so wins fund earlier purchases and wreck repairs set them back."
The ceiling and the grant are the fixed part; the settlement through the economy is the part that can move.
It is the first of the three shapes in the technique, a ceiling plus a grant, and nothing in the document
yet proves the realised field is blind to the player. The same paragraph adds grudges that "alter
passing/fire decisions only, never physics/HP/damage", which is the in-race read the technique files under
difficulty design rather than under the schedule.

The design also commits to the check the technique asks for, in the right spirit: the report "must publish
actual field PR, purchased player PR, their ratio and actual income/next-afford prices, not relabel targets
as measurements" (`docs/concepts/deathride/C4-ash-circuit.md:7` "not relabel targets as measurements").

## What this taught the draft

- **The audit is transitive.** Neither the plan nor the design says the rival wallet reads the player, and
  both let the player's results reach it. This became the technique's section on the read that hides in
  the settlement, with a ceiling-and-grant, a player-free simulation and no wallet as the three accepted forms.
- **A rating ratio is silent about lethality.** The combat-and-economy design found the lead car wrecked
  before lap one in 39 of 40 initial runs and 10 of 40 on the next coefficient, and fixed it with shared
  damage multipliers of 0.10-0.16 shared by every entrant
  (`docs/concepts/deathride/C3-combat-economy.md:19` "Final campaign damage multipliers", content tree;
  the policy is stated at `docs/concepts/deathride/C3-combat-economy.md:5` "difficulty changes skill only"). The sample is a Club-decision AI proxy,
  and `docs/concepts/deathride/C3-combat-economy.md:19` "this is not a human fairness sample". This became the technique's separate gate for
  early elimination.
- **Deviation recorded against the standard.** The standard says the field's inputs are the stage and the
  catalogue only. The design lets rival results, which depend on the player's presence, move wealth under the
  ceiling. Until a test compares realised fields across two very different player careers, the design meets
  the weaker form, not the stronger one. The standard stays where it is.
- **Anchors that did not hold.** None failed on re-reading; one nearby W5 line carried a mojibake character
  where a plus-or-minus sign was meant, and was not quoted.
