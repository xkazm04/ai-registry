---
layer: application
type: application
subject: debt-and-loss-stakes-staging
technique: ledger-after-every-event
stack: process
status: forged
verified_on: 2026-10-09
---

# The nightly debt ledger in a vehicular combat racer's campaign design

This application reads the ledger technique against one design that has not been played: the
Death Ride campaign, an arcade vehicular combat racer for a television, whose story is a debt
to a league owner, Marrow, that ends in the seizure of the player's car and a fight to the
death. Every anchor below is root-relative to the `firetv-deathride` worktree (branch
`deathride/main`, tip `6efb1dd` as read on 2026-10-04). The research dossiers under
`docs/narrative/research/` were read from the working tree that day and may be uncommitted;
the canon is `docs/concepts/deathride/Q0-ash-circuit-plot.md`. Nothing here was observed in
play. The realization is a process, not code: a design document, a numbers file the document
names as the authority, and the screen flow they imply. Re-resolved on 2026-10-09 at
`10974fa3`: every anchor below holds there, and the dossiers are committed. The ledger the game
shipped is read in the companion `kotlin` application, which found the shared source held as a
load-time reconciliation and the balance at zero for most of the campaign.

## What the design does

The canon makes one file the authority for every debt number:
`docs/concepts/deathride/Q0-ash-circuit-plot.md:9 "is the sole authority for the new numbers"`.
That is the shared-source rule of the technique held at the design stage: the story's figures
and the settlement's figures cannot differ because there is one place they live.

The ledger lines are separated by cause rather than netted:
`docs/concepts/deathride/Q0-ash-circuit-plot.md:11 "The player sees payment, credited amount, diversion and interest separately"`.
This is the condition that lets the story work at all, because the creditor's crime is a line
item — a quarter of each payment diverted to his own fleet — and a netted figure would hide it.
The canon also keeps the history the technique asks for:
`docs/concepts/deathride/Q0-ash-circuit-plot.md:11 "The ledger retains lifetime totals and the last receipt"`.

The floor is stated in the creditor's book, not only in the economy:
`docs/concepts/deathride/Q0-ash-circuit-plot.md:9 "No entry fee or debt threshold blocks racing"`,
with interest charged only on a first visit,
`docs/concepts/deathride/Q0-ash-circuit-plot.md:9 "retries, practice and real-world time add none"`.
The leash never tightens on the retry, which is the leash-has-a-floor rule.

## Where the dossiers confirm the technique

The ritual-moment ledger is the dossier's pattern P20, stated as a rule
(`docs/narrative/research/R2-game-narrative-craft.md:193 "show it as a short ledger at a fixed, repeated moment"`),
grounded in a shipped game whose day ends in a household budget
(`docs/narrative/research/R2-game-narrative-craft.md:195 "Papers, Please ends each day rationing"`)
and rated `docs/narrative/research/R2-game-narrative-craft.md:196 "High"`. The dossier's design
proposal makes the ledger the villain's voice between confrontations:
`docs/narrative/research/R2-game-narrative-craft.md:273 "Marrow appears only as a signature under the ledger"`.
A second dossier gives the same screen its register,
`docs/narrative/research/R4-wasteland-and-rivalry-craft.md:29 "let him speak only of obligation and fairness, never of force"`,
and proposes one creditor line per receipt type:
`docs/narrative/research/R4-wasteland-and-rivalry-craft.md:127 "Marrow speaks only fairness"`.
The third reads the flow of the purse as class shown without speeches:
`docs/narrative/research/R1-prestige-series-craft.md:343 "show a fraction of the purse going to the player and the rest climbing to Marrow's ledger"`.

The dossier's warning about a creditor's own unit of account is the shared-source rule applied
to currency: `docs/narrative/research/R4-wasteland-and-rivalry-craft.md:129 "Marks are never spendable, so there is no second currency"`.

## Upward lessons the dossiers gave the technique

Three claims entered the technique from this reading. The player's choices must visibly move
the ledger, or it is a weather report — R2's rule says "make the player's in-play choices
visibly move it" (`docs/narrative/research/R2-game-narrative-craft.md:193 "make the player's in-play choices visibly move it"`).
The keeper is a character whose register is obligation, from R4's reading of a primary text on
debt (`docs/narrative/research/R4-wasteland-and-rivalry-craft.md:29 "makes it seem that it's the victim who's doing something wrong"`).
And the balance components are kept as separate lines so that the creditor's hand can be
caught — the canon's diversion line taught that the separation is not bookkeeping hygiene but
the mechanism of a plot.

## Deviations from the standard

The dossier's proposed ledger is five numbers — purse, league cut, interest, repairs, net debt
(`docs/narrative/research/R2-game-narrative-craft.md:273 "show three to five lines: purse, league cut, interest, repairs, net debt"`).
It has change and balance lines and no threat line: nothing on it names what is at risk next or
who holds it, so as proposed it would report the past and stake nothing. The debt band partly
covers this and is the place to add one. Repairs on that list belong to the economy's receipt
rather than to the story's ledger; carrying them there dilutes the stake line. The canon does not
yet say where the ledger and the receipt sit relative to each other on the post-race screen.

## Sources the dossiers cite for this technique

The budget-ledger game: https://www.gamedeveloper.com/design/road-to-the-igf-lucas-pope-s-i-papers-please-i-
(`docs/narrative/research/R2-game-narrative-craft.md:355 "Lucas Pope's Papers, Please"`). Debt as
control: https://libcom.org/article/debt-first-5000-years-david-graeber
(`docs/narrative/research/R4-wasteland-and-rivalry-craft.md:199 "Graeber, *Debt* excerpt"`).
Company scrip, and the historian who disputes how general the gouging was:
https://en.wikipedia.org/wiki/Company_scrip and
https://www.cambridge.org/core/journals/journal-of-economic-history/article/abs/did-coal-miners-owe-their-souls-to-the-company-store-theory-and-evidence-from-the-early-1900s/F576B08F8DB66BDFBBA7D4E346B97873
(`docs/narrative/research/R4-wasteland-and-rivalry-craft.md:32 "Economic historians dispute how universal the gouging was"`).

## What this does not show

That a player reads the ledger, notices the diversion, or feels the debt. The design states the
lines and their authority; no one has played the campaign, and the dossier's own risk list puts
the receipt screen under test rather than under assumption
(`docs/narrative/research/R4-wasteland-and-rivalry-craft.md:129 "Risk: confusion; test the receipt screen"`).
