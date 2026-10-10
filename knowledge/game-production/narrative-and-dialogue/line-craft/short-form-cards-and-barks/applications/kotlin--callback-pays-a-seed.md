---
layer: application
type: application
subject: short-form-cards-and-barks
technique: callback-pays-a-seed
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
applied: experiment
ab_verdict: better
---

# Death Ride: a seed ledger that pairs on paper and not in play

This application audits a real seed-and-callback ledger twice. The first audit reads the table
as written, and the second reads only what the running game can reach. The tree is the
`firetv` repository's `deathride/main` branch at `d9990777`, read on 2026-10-10. The version
witness is `deathride/gradle/libs.versions.toml:3 "2.0.21"`. Nothing has been played. Anchors
are root-relative to that tree.

## The ledger the writers kept

Death Ride's whole script is one table, and each row carries a free-text tags column
(`deathride/narrative/lines.csv:1 "id,speaker,kind,event,trigger,conditions,text,voice_direction,tags,chars,duration_s,status"`).
The writers mark seeds `plant:<id>` and payments `payoff:<id>`. The prologue card plants the
announcer's habit of rounding a figure
(`deathride/narrative/lines.csv:4 "The Voice reads the figure and rounds it. Twelve Hundred."`).
A shop line plants a spare part with no use yet
(`deathride/narrative/lines.csv:256 "This? It's a spare bearing. For something. I'll know what when I see it."`),
and a later shop line pays it
(`deathride/narrative/lines.csv:283 "The drum turns on my bearing. The spare. I knew I'd know when I saw it."`).
That pair is the technique's ideal: a specific, unexplained detail, paid by a change of meaning,
in bare words. The table holds 61 seed tags over 19 seed ids and 27 payment tags over 13 ids.

## What the running game reads

Two consumers read the table. Story cards come through one lookup
(`deathride/core/src/main/kotlin/dev/deathride/core/AshCircuit.kt:17 "val script=Script.cardLines(row.getValue("`),
and every other line goes through the script director. The director asks for a fixed set of
triggers: pre-race, race-start, finish, boss-turn, the duel set, payout, seizure and the race
barks. For example, the career screen asks only for `pre-race`
(`deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:96 "facts,shown,limit=3))"`).
Twenty triggers in the table are asked for by neither consumer: `shop-idle`, `shop-enter`,
`ledger-receipt`, `car-bought`, `ledger-open`, `phase`, `repair`, `duel-pit`, `ally-joined`,
`hut` and ten single-row triggers. Together they hold 101 of the 496 usable rows. Another 24
rows sit on wired triggers but need a fact the director never sets. A condition on an unknown
fact fails by design
(`deathride/core/src/main/kotlin/dev/deathride/core/Script.kt:16 "Unknown keys fail the term"`).

The game also keeps no record of which seeds a player has seen. The director builds its facts
fresh for every request
(`deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:57 "val event=Career.events[round];val f=ScriptFacts()"`),
and the only said-memory runs along one scene's chain
(`deathride/core/src/main/kotlin/dev/deathride/core/Script.kt:114 "val follow=facts.copy().said(tail.id)"`).
The campaign is linear and every event shows its card, so a seed on a card is seen by every
player. A seed anywhere else has no guard.

## The experiment

- **Arm A, the table audit.** Pair `plant:` and `payoff:` by id, both directions, which is the
  technique's audit as it was written.
- **Arm B, the reachability audit.** Run the same pairing over the rows the runtime can show:
  a wired trigger, and every condition on a fact the director sets.
- **Setup.** Both arms ran as one script over the table at `d9990777`. The trigger and fact
  lists were read from the two consumers above.

| Verdict | Arm A (table) | Arm B (reachable) |
| --- | --- | --- |
| Paired | 9 | 3 (pardon, rook-saw-frame, tull) |
| Callback with no seed | 4 | 3 |
| Seed with no callback | 10 | 8 |
| Neither end shown | 0 | 9 |

**Two orphans that Arm A passed.**
- The `bearing` seed lives only in the unwired shop line. Its payment tag sits on the
  fourth-act card, which every player sees
  (`deathride/narrative/lines.csv:98 "Relay's sealed gearbox, seal still on. Rook's tyres. Ox's plate."`).
- The mechanic's finale line pays a seed planted only by a `shop-idle` row
  (`deathride/narrative/lines.csv:258 "I tried arming a test mine. I couldn't. I said sorry to it. To the mine."`).
  The paying line plays at the start of the final duel
  (`deathride/narrative/lines.csv:485 "Don't double back over your own. They don't know whose side they're on."`).
  It still reads as a line about mines, which is the standalone fallback the technique asks
  for, so the orphan costs the joke rather than the sense.

**One orphan that is a spelling.** The ending card and Rook's turn carry `payoff:keys`
(`deathride/narrative/lines.csv:110 "Your key comes home with Marrow's clamp cut through."`).
The seed is tagged with the bare word `key` on 35 rows, with no `plant:` prefix. Both arms call
it an orphan, and both are wrong in the same way. An audit can only tell an unpaid seed from a
renamed payment when the seed and its payments share one id.

**Seeds left open in play.** Eight seeds are shown and never paid where a player can see it.
Two of them are paid only in rows no code fires. The gearbox's payment is a `duel-pit` line,
and the bench's is a `phase` line. Some others are probably paid under another name. The
rounding and car-over-driver seeds read as paid by the announcer's correction scene, which is
tagged `voice-turn` and `payoff:tull` instead. The table cannot say which.

## Reconciliation against the technique

**Confirmed.** The ledger exists and the two-direction audit finds real defects. The seed and
payment pairs that do reach play are well made.

**Upward lesson: audit reachability, not declarations.** A seed or a callback in a table that
the runtime never shows counts as nothing. Arm A reported nine pairs, and three survive in play.
It passed both real orphans. The technique now audits the rows the runtime can reach, under the
facts the runtime sets. It also asks for one id per seed, shared by its payments, because the
`key`/`keys` split defeats either audit.

**Deviation: no seen-fact.** The technique guards a callback on the seed having been seen. Death
Ride records no such fact. A linear card sequence makes the guard unnecessary for card seeds. It
is needed as soon as the shop lines are wired, because eight of the 19 seeds live only in shop
rows.

**Verdict.** Better. Arm B finds two orphan callbacks on the main path that Arm A passed. Six of
Arm A's nine pairs lose at least one end in play. The cost is that Arm B
needs the runtime's trigger and fact lists, and those drift as the game is wired. Re-run it
whenever a trigger gains code.
