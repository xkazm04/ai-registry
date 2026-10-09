---
layer: application
type: application
subject: race-event-as-story-beat
technique: four-part-beat-delivery
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
applied: simulation
ab_verdict: better
---

# Death Ride's four slots as the game now ships them

The companion `process` application read the beat-card proposal in Death Ride's research
dossier and found the bark slot empty. Since then the head writer's 518-line script was wired
into the game. This application reads what the code does with it. The tree is the `firetv`
repository's `deathride/main` branch at `d9990777` (the checkout the `process` applications
call `firetv-deathride`), read 2026-10-09 and re-resolved 2026-10-10. The version witness is
`deathride/gradle/libs.versions.toml:3 "2.0.21"`. Anchors are root-relative. Nobody has played
the campaign. Counts come from `lines.csv`, 518 rows, and from a scratch mirror of the
selector run outside the tree.

## Barks: state and phase trigger them, the clock only gates them

The technique's timing rule is realized. Triggers are state edges and race phase. The last lap
is one of them,
`deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:167 "if(world.raceLaps>1 && player.lap.laps==world.raceLaps-1"`.
The race clock never starts a line. It only holds one back: a minimum gap and a cap of
fourteen per race,
`deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:182 "raceClock-lastBark<minGap || barkCount>=14"`,
and a per-speaker cooldown of 25 seconds,
`deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:184 "+25.0>raceClock)return false"`.
**Confirmed**, and the cooldown in the technique's procedure is there too.

Twenty-one in-race trigger kinds are written and thirteen are raised. The eight never raised
include the player-low-hp and own-mine-hit kinds. Two parts of the slot deviate:

- **Size.** Of 91 usable rival barks on raised triggers, the median is 6 words, but 24 exceed
  the dossier's eight. The longest is
  `deathride/core/src/main/resources/data/lines.csv:465 "He slept in my hut every winter for ten years."`.
  A caption stays on screen between three and eight seconds,
  `deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:49 "(line.durationSeconds+1.5).coerceIn(3.0,8.0)"`.
  That is text to be read at speed, which the technique says is lost.
- **Binding to the beat.** 90 of the 91 are scoped to `any` event. They are keyed to the
  character, so a bark can say who is beside the player but cannot confirm *this* event's idea.
  With 30 of 35 events carrying no rule variant (see the rule-variants application), there is
  rarely an idea for a bark to confirm.

## Post-event state: written whether or not anything is read

Skipping skips only words. The director is observational,
`deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:12 "never writes to either"`,
and settlement runs before any line. A wreck is recorded as a grudge,
`deathride/core/src/main/kotlin/dev/deathride/core/AshCircuit.kt:140 "if(r.playerWrecked)p.grudges[r.index]=1"`,
and nine bark rows read it later. That is the delayed echo realized. In all, 97 reachable lines
read persisted state: ally and rival standing, debt paid, the levy, the seizure.
**Confirmed.**

Two parts deviate:

- **Loss outcome.** The announcer's finish call branches on won, lost and wrecked,
  `deathride/core/src/main/resources/data/lines.csv:151 "Twelve Hundred is off the road."`.
  Character reactions to a loss exist only at the four boss gates,
  `deathride/core/src/main/resources/data/lines.csv:318 "Truck goes home empty."`.
  A non-boss loss gets the announcer and nothing else. One loss line states a cause that no
  condition checks,
  `deathride/core/src/main/resources/data/lines.csv:319 "Your brakes faded on the last lap"`.
- **Retry count.** It lives in memory only,
  `deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:21 "private var retryRound=-1"`,
  so a restart of the app resets the story's count of attempts.

24 lines can never be chosen because their condition keys are never set, `first-win` among
them.

## The retry card, run through the new cap

The technique now says a retry's acknowledgment changes for two or three attempts and then goes
terse or silent. A line that repeats on every attempt after that is the one players mute, and
a count stated in words goes wrong. The old wording asked only that the third try open
differently from the first. Both were run over the four boss gates, attempts one to six,
using a mirror of `Script.scene` and the career facts. The positive control is that the mirror
selects all three of Rook's retry rows in order.

- **Rook's gate (`scrap-7`).** Rook changes three times:
  `deathride/core/src/main/resources/data/lines.csv:305 "Back again, fresh tag?"`,
  `deathride/core/src/main/resources/data/lines.csv:306 "Third go."` and
  `deathride/core/src/main/resources/data/lines.csv:307 "You keep coming back. I used to do that."`.
  From the fourth attempt on, the whole scene repeats verbatim: that line, the Mechanic's tip
  `deathride/core/src/main/resources/data/lines.csv:304 "He brakes later than late."` and the
  book line
  `deathride/core/src/main/resources/data/lines.csv:134 "From the book: tow crews are asked to stand by the Tag Board."`.
  Then comes the grid call
  `deathride/core/src/main/resources/data/lines.csv:115 "The Yards are listening."`. That is
  49 words on every attempt.
- **Ox's, Vex's and Mica's gates.** The boss changes twice, then
  `deathride/core/src/main/resources/data/lines.csv:328 "You're on the pour now, driver."`
  and its counterparts repeat from the fourth attempt. The book line never changes at all,
  `deathride/core/src/main/resources/data/lines.csv:136 "From the book: the belt resumes at the next shift"`.
- **The stated count.** Rook's third-attempt line says "third" on exactly the third attempt, which is
  correct. The announcer's grid row for three or more retries opens
  `deathride/core/src/main/resources/data/lines.csv:128 "Third try."`, and whichever way it
  counts, attempts or retries, it is wrong from the fifth attempt. It never reaches a player. The race-start pick takes one line, most
  specific first, then by file order, and the act lines above it always win. The row is shadowed
  by selection, not culled by the count rule.

The old wording passes all four gates. The new cap flags all four for a scene that repeats
verbatim from the fourth attempt. **Verdict: better, at the simulation rung.** The new wording
catches a player-visible repetition the old one certified. It does not show that players mute
these lines; nobody has played them. The retry announcer rows are a separate finding: written,
reachable by condition, and never selected.

## What this application does not show

It does not show a card or bark read on a television, a bark heard at speed, or a player's
memory of an outcome. Those are play evidence, which this campaign has not reached.
