---
layer: application
type: application
subject: condition-tagged-line-tables
technique: line-table-schema
stack: kotlin
status: forged
verified_on: 2026-10-09
verified_against: kotlin@2.0.21
applied: experiment
ab_verdict: better
---

# Death Ride: a 518-row line table with no fact dictionary, linted

The companion `process` application reads the salience table Death Ride's research proposed.
This one reads the table the game shipped into code, and runs on it the checks the technique
says a schema makes possible. The tree is the `firetv` repository's `deathride/main` branch at
`10974fa3`, read on 2026-10-09. The version witness is the Kotlin plugin
(`deathride/gradle/libs.versions.toml:3 "kotlin ="`, 2.0.21). Nobody has played the campaign,
so no claim below concerns a line anyone has heard. Anchors are root-relative to that tree.

## What the tree has

- **One table, no dictionary.** The script is one CSV file of rows with this header:
  `deathride/narrative/lines.csv:1 "id,speaker,kind,event,trigger,conditions,text,voice_direction,tags,chars,duration_s,status"`.
  A test pins the runtime copy to it
  (`deathride/core/src/test/kotlin/dev/deathride/core/ScriptTest.kt:13 "resourceCopyMatchesTheNarrativeSource"`).
  Stable ids and a status column are present. There is no tier column, no weight, and no
  per-row cooldown or lifetime.
- **Conditions are free text.** A conditions cell is a semicolon-separated list. One regex
  parses each term into a key, an operator and a value
  (`deathride/core/src/main/kotlin/dev/deathride/core/Script.kt:47 "private val OPERATOR=Regex"`).
  A bare term is a flag. Nothing declares which keys exist, who writes them or how long they
  live.
- **Facts are written in one place.** The facts the conditions test are assembled in a single
  function, `careerFacts`, and topped up by race events
  (`deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:56 "fun careerFacts(p: Profile,round: Int=p.careerRound): ScriptFacts"`).

## Unknown fails, except under negation

The runtime holds the technique's core rule. A term over a key nobody wrote fails, and the
comment says why
(`deathride/core/src/main/kotlin/dev/deathride/core/Script.kt:16 "Unknown keys fail the term"`).

Negation is the exception. A `!=` term passes when the key is absent
(`deathride/core/src/main/kotlin/dev/deathride/core/Script.kt:42 "values==null || raw !in values"`),
and a test asserts it on purpose
(`deathride/core/src/test/kotlin/dev/deathride/core/ScriptTest.kt:83 "absent fact is not equal"`).
That is the hazard the technique names, written as the contract. It is harmless today only by
accident: the two rows that negate both test `result!=win`, and the results screen writes
`result` before it asks. The web lane found the same rule in an older shipped
response-rule engine. That engine reads a missing fact as an empty string, so a negation or an
upper-bound range passes on absence.

## The census: 130 of 496 usable rows can never play

**Instrument.** A census script parsed the CSV with the runtime's own quoting rules and
applied the runtime's own `usable` filter, which skips alternates and recorded-only rows
(`deathride/core/src/main/kotlin/dev/deathride/core/Script.kt:10 "val usable get()=status !in UNUSED_STATUS"`).
It then checked each row against two lists read by hand from the director:
  - every `(kind, trigger)` pair some call site queries;
  - every key, value and flag some code path writes.
It was asserted on a known positive and a known negative first.
  - Positive: `rook.weak.armour`, whose `weakness` key no Kotlin file names. It was flagged.
  - Negative: `rook.pre.retry1`, whose `retry` key `careerFacts` writes. It passed.

| Finding | Rows |
| --- | --- |
| Usable rows | 496 of 518 |
| On a trigger no call site queries | 108 |
| On a queried trigger, needing a fact nothing writes | 22 |
| **Never selectable** | **130 (26.2%)** |
| Passing only through a negated unknown | 0 |

**Unqueried triggers (108 rows).** The largest groups:
- shop idle chatter, 16;
- ledger receipts, 15;
- shop entry, 15;
- car purchase, 10;
- the finale's phase lines, 8;
- the ledger screen, 8.
Every shop-kind row outside the seizure scene is in this set. The career screen sets
`scene=shop` and `scene=hut` as facts, but it queries only the `pre` and `announcer` kinds
(`deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:96 "pre-race"`).

**Unwritten facts (22 rows).** These are keys minted in a cell that no system writes:
- `weakness`, 8 rows (a boss naming the stat the player's car lacks);
- `prev-payout`, 3;
- `first-win`, 2;
- `after-offer`, 2;
- `optional`, 2;
- `rare`, 2;
- `player-car-weight`, `on-straight`, `wrecked-streak`, `started-last` and `contract`.

This is the technique's "undeclared fact" check, and its argument made concrete. A writer
could invent a name in a cell, nothing refused it, and the row was written, given a voice
direction and sized for the caption box.

**Why the project's suite is silent.** Its script tests ask whether rows exist for things the
code raises. The census asks the reverse: whether the code raises and writes what the rows
need.
  - The bark test checks 8 of the 13 wired bark triggers for six rivals, and only against one
    fixed snapshot of rival-identity facts
    (`deathride/core/src/test/kotlin/dev/deathride/core/ScriptTest.kt:129 "val triggers=listOf("`).
  - The caption-fit test measures every usable row, reachable or not.
So the suite and the census disagree on 130 rows, and only the census can see them.

**Verdict: `better`, at the `experiment` rung.** The schema's checks found what the shipped
checks could not, on the project's own table. The counts come from one tree at one sha. The
two lists were read from code by hand, so a call site added outside the director would move
them.

## Fallbacks: silence by absence

There are 91 combinations of the seven bark speakers and the 13 wired bark triggers. 28 have no
row at all, so the event is answered by nothing, and the code does not report it
(`deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:188 "if(options.isEmpty())return false"`).
The rival rows mostly carry a rival-or-ally identity condition, which acts as a fallback
because one of the two is always written. That holds, though, only while the identity fact
stays complete.

## Specificity as count, in the field

The ranking is the technique's base rule plus a writer's mark. A `key-pick` status sorts first,
then the most conditions, then the least shown, then the id
(`deathride/core/src/main/kotlin/dev/deathride/core/Script.kt:101 "compareBy<ScriptLine>({if(it.status=="key-pick")0 else 1},{-it.terms.size},{shown[it.id]?:0},{it.id})"`).
Two effects follow, and both are the subject's warnings, live.

- **A consequence ties with an identity.** A rival the player has wrecked carries both
  `rook=rival` and `rook=grudge`, and the plain taunt and the grudge line test one term each
  (`deathride/narrative/lines.csv:402 "bark.rook.hit,rook,taunt,any,hit-by-player,rook=rival"`;
  `deathride/narrative/lines.csv:413 "bark.rook.grudge.hit,rook,bark,any,hit-by-player,rook=grudge"`).
  So the grudge does not pre-empt the generic line. The two alternate by shown count. A tier
  would settle it. Separately, the grudge lines read as if spoken by an ally ("We share a cause"),
  while the grudge is set for any rival the player wrecks and cleared when that driver joins.
  Whether they read right to a rival who never joined is a writer's call that no criterion
  records.
- **Specificity outranks freshness.** The shown count only breaks ties, so a more specific row
  wins every time it is eligible, however often it has played. In the act Mica heads, from its second race,
  her grid greeting is the one-time-sounding "Tell me your name when you've a mind to" on
  every race and every retry
  (`deathride/narrative/lines.csv:458 "bark.mica.noname,mica,bark,any,grid,mica=rival;race>=2"`).
  The plainer row beneath it never returns. The subject's exhaustion rule was written for this
  case: a heard specific line yields to an unheard general one.

## Lifetimes nobody declared

The retry count that 15 rows test (`retry>=1`) lives in the director object, which lives as
long as the app does
(`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:37 "private val script=ScriptDirector()"`;
`deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:21 "private var retryRound=-1"`).
The same holds for the shown counts that rotate variants
(`deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:19 "private val shown=HashMap<String,Int>()"`).
The save file persists grudges and no retry count.

So a player on a fourth attempt at a boss who quits for the night is greeted the next evening
as if it were the first attempt. The retry is counted in races, a clock the repeat-avoidance
rule allowed to reset; its meaning spans the relaunch. A lifetime column in a fact dictionary
would have forced the question when the key was introduced.
