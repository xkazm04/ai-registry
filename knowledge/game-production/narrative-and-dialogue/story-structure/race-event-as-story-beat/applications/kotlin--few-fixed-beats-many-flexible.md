---
layer: application
type: application
subject: race-event-as-story-beat
technique: few-fixed-beats-many-flexible
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
---

# Death Ride's spine: sixteen hand-placed beats in a linear campaign

Death Ride is an arcade combat racer for Fire TV with a 35-event campaign. This application
reads how its story bible pins beats, and how its code orders the events, at the `firetv`
repository's `deathride/main` branch, `d9990777`, read 2026-10-09 and re-resolved 2026-10-10.
The version witness is `deathride/gradle/libs.versions.toml:3 "2.0.21"`. Nobody has played the
campaign.

## The spine is sixteen beats, and the campaign is linear

The bible names its fixed beats in one line,
`docs/narrative/STORY-BIBLE-V2.md:51 "Hand-placed beats (never chosen by salience)"`. The list
covers the prologue and the first ledger, a refusal in each of four acts, four boss turns, the
announcer's correction, the rig reveal, the lien, the seizure, the finale and the ending. That
is sixteen. The same line hands everything else to most-specific-match selection, which is the
technique's split. The selector's tie-break puts the writers' marked pick first,
`deathride/core/src/main/kotlin/dev/deathride/core/Script.kt:101 "{-it.terms.size}"`.
Hand-placed beats are held in place by scoping their rows to one event.

The technique's decision rule says a spine past six beats is becoming linear. Here the
campaign is linear outright: one counter advances through the events in order,
`deathride/core/src/main/kotlin/dev/deathride/core/Career.kt:112 "p.careerRound++"`. **Confirmed,
in the strong form:** a spine of sixteen came with no freedom of order. The flexibility the
technique asks for lives only in the lines, barks and shop chatter chosen by state, never in
which event comes next. The check the technique owes free beats, re-reading a tier in its least
likely order, has nothing to run on.

## Story advances on finishing, except at five gates

Thirty events advance on completing a lap. Five need a result: the four boss gates need first
place,
`deathride/core/src/main/kotlin/dev/deathride/core/Career.kt:102 "if(events[p.careerRound].boss && position!=1)"`,
and the finale needs the player to be the last car running. The technique's fallback for a
design that insists on a win is that the loss is still told on the way to the retry. That is
realized at the gates. The gates have their own loss lines,
`deathride/core/src/main/resources/data/lines.csv:318 "Gate's mine. Truck goes home empty."`.
The finale's retry has its own lines,
`deathride/core/src/main/resources/data/lines.csv:513 "Again. The terms have not changed."`.
The boss's pre-race line changes across the first retries. That fade, and the repetition that
follows it, are in the four-part application. **Confirmed.**

## What this application does not show

Whether the five win gates stall players, which is the technique's reason to prefer finishing.
The campaign has no play data.
