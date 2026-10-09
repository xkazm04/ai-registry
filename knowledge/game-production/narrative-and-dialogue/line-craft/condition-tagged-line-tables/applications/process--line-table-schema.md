---
layer: application
type: application
subject: condition-tagged-line-tables
technique: line-table-schema
stack: process
status: forged
verified_on: 2026-10-09
---

# Death Ride's proposed salience table, read against the schema

This application reconciles the line-table schema against one concrete design proposal: the
"salience table for all short-form text" in the narrative research for Death Ride, an arcade
combat racer for a television-class device, in the `firetv-deathride` tree at
`firetv-deathride`. The proposal lives in a research dossier, not in code —
a search of the tree for its column names finds them only in that dossier — so everything below
is a reading of a design on paper. Nobody has played the game, and nothing here is evidence that
any row works in play.

Re-read on 2026-10-09 at `10974fa3`: every anchor below still holds. The search result above no
longer does. The game now ships a 518-row line table and a runtime that queries it, and the
[kotlin application](kotlin--line-table-schema.md) reads that table against this schema. This page
stays a reading of the proposal.

Anchors are root-relative to that tree.

## What the dossier proposes

The proposal is one data file of rows:

- docs/narrative/research/R2-game-narrative-craft.md:249 "A salience table for all short-form text" — one data file whose rows carry speaker, trigger, conditions, weight, a once flag and a cooldown counted in races
- `docs/narrative/research/R2-game-narrative-craft.md:250 "Triggers: grid, overtaken_by, wrecked_by, mine_hit, last_lap, finish_pos, retry."`
- `docs/narrative/research/R2-game-narrative-craft.md:251 "Conditions: region, debt band, last result against this rival, ally status, retry count."`
- `docs/narrative/research/R2-game-narrative-craft.md:253 "A new special case is one row, with no code change."`

It cites a studio engineer's conference talk on a shipped reactive-dialogue system for the
underlying rule (`docs/narrative/research/R2-game-narrative-craft.md:49 "cascading from special to general cases"`;
source: Elan Ruskin, GDC 2012, "AI-driven Dynamic Dialog through Fuzzy Pattern Matching",
https://www.gdcvault.com/play/1015528/AI-driven-Dynamic-Dialog-through ) and Emily Short's
essay naming salience-based narrative and its risk
(https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/ ).

## Confirmed

**Lines as data, special cases as rows.** The proposal's central claim — a new special case is
one row and no code — is exactly the property the schema exists to protect, and it is the
property the cited talk is about. The talk page confirms the framing as of today: writers get
"special cases, running gags" without programmers changing code.

**Events as a declared list.** The trigger list at line 250 is a closed vocabulary of events,
which is what the schema's event column requires. `retry` being an event of its own is the
right call; the losing technique depends on it.

**Fallbacks.** Line 249 ends "broad defaults always exist", which is the mandatory fallback row.

**Follow-up events.** The dialogue dossier records the overheard-reply pattern —
`docs/narrative/research/R3-dialogue-craft.md:154 "one character's line can trigger another's reply"` —
which the schema carries as the follow-up column.

**The phrase ledger.** The dialogue dossier's revision protocol keeps a ledger of key phrases:
`docs/narrative/research/R3-dialogue-craft.md:403 "Record the line, speaker, trigger, flags and key phrases so later slots don't reuse them."`
That is the key-phrases column; it was an upward lesson for the schema, which lacked it.

## Deviations — the proposal falls short of the schema

**No fact dictionary.** `conditions[]` is free text in the proposal. Nothing declares that "debt
band" is an enumeration of four values (they are named elsewhere, at
`docs/narrative/research/R2-game-narrative-craft.md:273 "The debt band (comfortable, tight, delinquent, called)"`),
who writes it, or whether it survives a save. Without that, a writer's `debt=late` and a
system's `delinquent` never match and nothing reports it.

**No stable line id.** Rows are keyed by speaker and trigger; individual lines have no identity.
Recency memory, once-only flags in the save, voice recordings and the phrase ledger all need one.

**Weight without tier.** The proposal has `weight` but no tier above criterion count, so a
story-critical rival row and a decorative region row compete on count alone.

**No writes, no max age.** Rows do not write facts back when they play, so callbacks such as
"that's twice now" have no fact to read, and cause rows like `wrecked_by` carry no freshness
limit, so a queued taunt can play half a lap late.

**`once_flag` without a scope, `cooldown_races` as the only clock.** Once per race, per session
or per campaign are different rules; a mid-race bark needs a seconds clock that a races clock
cannot express.

## Death Ride use

When the table is built, it should be built as two files — a fact dictionary owned by the race,
ledger and rivalry systems, and a line table owned by the writers — with the row fields of the
technique, linted on save. The conditions named at line 251 become the first dictionary entries,
each with type, domain, owner and lifetime. The announcer's drifting stance
(`docs/narrative/research/R2-game-narrative-craft.md:271 "That costs one condition column."`) is
a good first test of the dictionary: one declared fact, read by many rows, and listed by the
unread-fact census the day nothing reads it.
