---
layer: application
type: application
subject: race-event-as-story-beat
technique: rule-variants-carry-story
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
applied: simulation
ab_verdict: unmeasurable
---

# The deletion test re-run on Death Ride's code, and which scenes the race acts on

The companion `process` application ran the deletion test over Death Ride's campaign data at
an older commit. It found about thirty of thirty-five events to be unmodified lap races whose
beat lives only on the card. This application re-reads the campaign in code at the `firetv`
repository's `deathride/main` branch, `d9990777`, read 2026-10-09 and re-resolved 2026-10-10.
The version witness is `deathride/gradle/libs.versions.toml:3 "2.0.21"`. Nobody has played the
campaign.

## The deletion test, unchanged

The event table still has 34 lap races and one elimination. The beat table's contract column
still reads 30 optional, 3 delivery, 1 clean and 1 grudge, and only a content test reads it,
`deathride/core/src/test/kotlin/dev/deathride/core/CampaignContentTest.kt:20 "val beats=Content.table("`.
No escort, hunted or carried-damage rule exists in the core module. **Deviation unchanged:**
the ordinary event carries its beat on the card and in the scenes, not in its rules.

The game knows three objectives, and the career screen shows the one in force,
`deathride/core/src/main/kotlin/dev/deathride/core/Career.kt:139 "fun objective(round: Int)=when {"`:

- the ordinary event,
  `deathride/core/src/main/kotlin/dev/deathride/core/Career.kt:142 "Complete a lap or make progress before a wreck."`;
- the four boss gates,
  `deathride/core/src/main/kotlin/dev/deathride/core/Career.kt:141 "Win the boss race in first place to recruit"`,
  followed by the boss's name;
- the elimination finale.

The gate is enforced,
`deathride/core/src/main/kotlin/dev/deathride/core/Career.kt:102 "if(events[p.careerRound].boss && position!=1)"`.
The same first-place variant serves four gates, each with a different proposition: a gate held
for nine years, a crew's shift, a record, a pass. That is the one-idea technique's rule that a
variant is vocabulary and may recur while the proposition may not. **Confirmed.**

## The new clause: does the race act on the scene?

The golden path and this technique now say that a short scene before the grid is not the
cutscene failure when the event's objective reads what the scene set up, such as finishing
ahead of the rival it named. A field that merely contains that rival does not count. The old
wording counted a harder field or a named opponent as difficulty, never story, and treated
every watched scene between events as story that competes with the race.

Both were run over the 17 events whose pre-race scene is scoped to them, in a mirror of the
selector:

- **The four boss gates** (`scrap-7`, `foundry-7`, `salt-7`, `switchback-7`). The boss speaks
  before the grid, and the objective names the boss and requires finishing ahead of them,
  because first place is ahead of everyone. Under the new clause the race acts on the scene:
  **pass**. The objective is shown on the career screen only. The race display shows position
  and laps,
  `deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:868 ",40f,695f);title("`, so
  the clause's display requirement flags all four. The old wording's disclosure rule flags the
  same gap.
- **The thirteen other events.** Five are the pressure events, where the act's boss or a
  former one speaks before the grid. Three carry the courier. One carries the league owner's
  offer, and four carry only the announcer. Their objective is to complete a lap. Nothing depends on where the named rival
  finishes, so the scene's setup is read by nothing: **fail** under both wordings. Each needs
  an objective that names the rival, or its scene moves to the hub.

The two wordings differ only on the four boss gates, and only in classification: the new one
calls their scenes carried and the old one calls them competing. Neither can show which reading
a player has, because nobody has played the gates. **Verdict: unmeasurable, at the simulation
rung.** The new clause changes no fix the campaign owes; the thirteen fail either way. Its
return condition is a played boss gate with and without its pre-race scene.

## What this application does not show

That any objective change reads as story to a player, or that a rival named in an objective is
remembered better than one named only on a card. Both are play evidence.
