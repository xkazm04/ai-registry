---
layer: application
type: application
subject: race-event-as-story-beat
technique: rule-variants-carry-story
stack: process
status: forged
verified_on: 2026-10-10
---

# The deletion test run over Death Ride's 35-event campaign

Death Ride is an arcade combat racer for Fire TV with a 35-event story campaign, the Ash
Circuit, about a driver whose garage is held as debt collateral by the league owner Marrow.
Nobody has played it yet. This application runs the rule-variants technique over two things in
that tree, pinned at commit `6efb1dda` of the `firetv-deathride` worktree: the narrative
research dossier that proposed a rule-variant library (R2), with its violence-framing companion
(R4), and the campaign data the game actually ships. Paths below are relative to that
worktree's root. The research is secondary material; the data files are the realization.

## What the dossier proposes, and where it agrees with the technique

The dossier states the core rule in its own words at
`docs/narrative/research/R2-game-narrative-craft.md:22 "deliver it through a change in what the controls do, not through a cutscene"`,
citing Josef Fares on *Brothers: A Tale of Two Sons*
([Game Informer](https://gameinformer.com/b/features/archive/2013/09/27/afterwords-brothers-a-tale-of-two-sons.aspx))
and Walt Williams on *Spec Ops: The Line*
([GDC Vault](https://www.gdcvault.com/play/1017980/We-Are-Not-Heroes-Contextualizing/)), both
rated high at `docs/narrative/research/R2-game-narrative-craft.md:27 "Confidence.** High"`.
The racing precedent, *Forza Horizon 4*'s story chains, is weaker:
`docs/narrative/research/R2-game-narrative-craft.md:35 "Medium for Forza (search summary; the page did not load)"`
([Windows Central](https://www.windowscentral.com/forza-horizon-4-features-narrative-based-gameplay-crazy-taxi-stories)).
Confirmed: the technique's central claim and the dossier's are the same claim.

The dossier's starter library opens at
`docs/narrative/research/R2-game-narrative-craft.md:241 "A rule-variant library: each variant is a sentence of story"`
and lists six:

- `docs/narrative/research/R2-game-narrative-craft.md:242 "the purse is split live at checkpoints"` (garnish race)
- `docs/narrative/research/R2-game-narrative-craft.md:243 "league enforcers enter mid-race and target only the player"` (collector run)
- `docs/narrative/research/R2-game-narrative-craft.md:244 "ignores the field and hunts the player"` (grudge heat)
- `docs/narrative/research/R2-game-narrative-craft.md:245 "finish in an exact position"` (debt of honour)
- `docs/narrative/research/R2-game-narrative-craft.md:246 "It can't be lost"` (shakedown test)
- `docs/narrative/research/R2-game-narrative-craft.md:247 "escorts a slow vehicle whose damage meter is the stake"` (carry race)

Three of these matched the draft's generic library: grudge heat is pursuit with the named
rival as hunter, debt of honour is the reversed objective, and the carry race is escort. The
other three were **upward lessons** that the technique now carries as *hunted*,
*draining stake* and *cannot-lose trial*: the draft had no variant in which the stake drains
while the player drives, none in which the player is the quarry rather than the hunter, and no
safe variant whose job is to give a character room and teach a verb before the finale needs
it.

A fourth upward lesson is the dossier's placement rule,
`docs/narrative/research/R2-game-narrative-craft.md:239 "If a beat can't be expressed as a rule variant, it belongs in the shop, not on the track."`
The draft had only the deletion test; the technique now says where a failing beat goes.

The violence framing comes from R4:
`docs/narrative/research/R4-wasteland-and-rivalry-craft.md:103 "what you hit decides how the act reads"`,
from the censored releases of *Carmageddon*
([Wikipedia](https://en.wikipedia.org/wiki/Carmageddon)) and the media-satire framing of
*Death Race 2000* ([Wikipedia](https://en.wikipedia.org/wiki/Death_Race_2000)). R4 rates the
facts high and the generalisation its own. Confirmed, and folded into the technique as the
target-decides-meaning section.

## A deviation inside the dossier

The dossier asks that each variant be introduced, developed once, twisted once and then retired
(`docs/narrative/research/R2-game-narrative-craft.md:241 "Introduce each one, develop it once, twist it once, then retire it or save it for the finale"`),
which applies the four-step level shape across several events, while its own source pattern
applies it inside one event
(`docs/narrative/research/R2-game-narrative-craft.md:30 "give each event one new idea. Introduce it, develop it, twist it, then drop it"`).
The technique keeps the two scales apart: the four steps happen inside one event; a later
appearance of a variant is legitimate only as a callback with a changed proposition. The
"save it for the finale" clause is kept, as the finale exception in the one-idea technique.

## The deletion test, run on the shipped data

The game's event table gives every event a race type, and the committed file has 34 events of
type `LAPS` and one elimination, the finale:
`deathride/core/src/main/resources/data/campaign.csv:36 "crown-7,Marrow on his road,crown,crown-7-a,crown-7,1,1,0,ELIMINATION,4,finale"`.
The beat table carries a `contract` column
(`deathride/core/src/main/resources/data/campaign-beats.csv:1 "event,hub,scene,mechanic,contract,beat"`)
that is the nearest thing the tree has to a rule variant; 30 of its 35 rows read `optional`,
three `delivery`, one `clean` and one `grudge`. The delivery rows are escorts in the technique's
sense, for example
`deathride/core/src/main/resources/data/campaign-beats.csv:5 "scrap-4,The Yards,build-up,shop,delivery,Relay needs a sealed gearbox carried through the sluice"`,
and the design keeps every such contract off the critical path:
`docs/concepts/deathride/Q0-ash-circuit-plot.md:19 "A contract never gates a licence or the plot"`.

Read against the technique, this is the main **deviation**: roughly thirty of the thirty-five
beats live only on their three-line card and fail the deletion test, because removing the card
leaves an unmodified lap race. The campaign does carry story in its rules at the edges, in the
seizure, the rig's mine verb and the elimination finale, and in its post-event ledger; it does
not yet carry it in the ordinary event. The standard stays: the fix is to assign each beat one
variant from the library, or to move the beat into the hub, which the dossier's own placement
rule already says.

The disclosure rule is **confirmed** by the design, in stronger words than the draft had:
`docs/concepts/deathride/Q0-ash-circuit-plot.md:17 "No invisible boost."`
That sentence is why the technique now binds help as well as handicap.

## Re-resolved

Every anchor above was re-resolved on 2026-10-10 against `d9990777`, a descendant of
`6efb1dda`, and all held. The counts were taken again: 34 lap races and one elimination, and
the contract column at 30 optional, 3 delivery, 1 clean and 1 grudge. The only change to the
event table is one course swap. The kotlin application on this technique reads the same
campaign in code. It finds the contract column read only by a content test, and the objective
the four boss gates add.

## What this application does not show

It does not show that any variant plays well, that players notice the difference, or that the
dossier's six fit this game's physics; no event using them has been built or driven. The counts
above are a reading of committed data files, which is structural evidence one rung below play.
