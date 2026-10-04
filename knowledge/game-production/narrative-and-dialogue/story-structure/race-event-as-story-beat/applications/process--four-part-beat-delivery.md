---
layer: application
type: application
subject: race-event-as-story-beat
technique: four-part-beat-delivery
stack: process
status: forged
verified_on: 2026-10-04
---

# Death Ride's beat card, slot by slot, against the four-part standard

Death Ride is an arcade combat racer for Fire TV whose 35-event campaign has been designed and
built but never played by anyone. This application reconciles the four-part beat technique, and
the twenty-second budget and fixed-beat rules it leans on, against the research dossier that
proposed the game's "beat card" (R2) and against the campaign data and plot design in the
`firetv-deathride` worktree at commit `6efb1dda`. Paths are relative to that worktree's root.

## The dossier's schema is the technique's shape

The dossier names four slots per race at
`docs/narrative/research/R2-game-narrative-craft.md:232 "every race carries exactly one story beat in four slots"`:
a card of `docs/narrative/research/R2-game-narrative-craft.md:234 "TV-legible lines"`, a rule
variant, `docs/narrative/research/R2-game-narrative-craft.md:236 "event-keyed barks"`, and a
post-race state of
`docs/narrative/research/R2-game-narrative-craft.md:237 "ledger line, shop scene change, announcer recap"`.
Confirmed: the technique's four parts are the same four, and the dossier is the reason this
subject names them as it does. The shape is the dossier's own proposal, not a pattern it found
in a shipped game.

Four of the technique's refinements were **upward lessons** from the dossier's patterns:

- bark content and size, from Richard Dansky
  ([Kotaku](https://kotaku.com/why-video-game-characters-say-such-ridiculous-things-5921878))
  at `docs/narrative/research/R2-game-narrative-craft.md:123 "each bark should convey one piece of information"`,
  sized for a television at
  `docs/narrative/research/R2-game-narrative-craft.md:255 "a portrait plus five to eight words, or a voice line under two seconds"`;
- bark timing, `docs/narrative/research/R2-game-narrative-craft.md:224 "time mid-race dialogue to race phases"`,
  which the dossier itself rates low;
- the delayed echo,
  `docs/narrative/research/R2-game-narrative-craft.md:173 "show its consequence one or more chapters later, in someone else's mouth"`,
  from Josh Sawyer on *Pentiment*
  ([TheGamer](https://www.thegamer.com/interview-obsidian-josh-sawyer-pentiment/));
- the retry card,
  `docs/narrative/research/R2-game-narrative-craft.md:183 "let the opening framing reflect the previous attempt"`,
  from *Slay the Spire* ([wiki](https://slaythespire.wiki.gg/wiki/Neow)) and *Into the Breach*
  ([Kotaku](https://kotaku.com/into-the-breach-tells-its-story-through-its-characters-1824159682)).

The loss-as-content rule was already in the draft and is **confirmed** by Greg Kasavin on
*Hades* ([Game Developer](https://www.gamedeveloper.com/design/how-supergiant-weaves-narrative-rewards-into-i-hades-i-cycle-of-perpetual-death))
at `docs/narrative/research/R2-game-narrative-craft.md:85 "the moment of death isn't about rage-quitting"`.
The rule that story sits on finishing is the dossier's proposal from his separate warning about
difficulty walls
([GDC Podcast](https://www.gamedeveloper.com/design/roguelikes-and-narrative-design-with-i-hades-i-creative-director-greg-kasavin)),
at `docs/narrative/research/R2-game-narrative-craft.md:280 "gates only money and rank"`.

## What the shipped tree realizes, slot by slot

**Card: realized.** Every event has a three-line card,
`deathride/core/src/main/resources/data/story-cards.csv:1 "id,title,backdropKey,line1,line2,line3"`,
and a card never blocks the race:
`docs/concepts/deathride/Q0-ash-circuit-plot.md:5 "Reading cards never gates input."`
That is the technique's skip-only-words rule, confirmed. A whitespace word count over the three
lines of all 36 cards (the 35 events plus a campaign-victory epilogue) gives 25 to 36 words
each. No card has been timed on the television, so the
twenty-second budget is plausibly met and **unmeasured**, which is not the same as met.

**Rule variant: mostly absent.** Covered in the sibling application on rule variants: about
thirty of the thirty-five events are unmodified lap races, so their card is a trailer in the
technique's vocabulary. Deviation.

**Barks: absent.** No tracked data file in the tree is named for barks, taunts or a salience
table, although the dossier proposes one. The mid-event slot is therefore empty for every event.
Deviation; the standard stays.

**Post-event state: realized for money, partly for story.** The ledger is designed as a
persisted, itemised record:
`docs/concepts/deathride/Q0-ash-circuit-plot.md:11 "The player sees payment, credited amount, diversion and interest separately."`
That is the evaporated-beat failure avoided for the debt thread. Whether rival standing, ally
attitude or a retry count persist and are read by a later card was not established by this
reading.

## A deviation between the dossier and the design

The dossier puts story on finishing, not winning (line 280 above). The design gates promotion
bosses on a win:
`docs/concepts/deathride/Q0-ash-circuit-plot.md:5 "a promotion boss requires victory"`.
The same line has a lost boss still pay, repair and offer a retry, so the economy does not stall;
whether the loss also yields story is the open question the technique asks. Recorded as a
deviation from the fixed-beat rule, not resolved here.

## The budget and the spine, as the dossier states them

The budget is the dossier's proposal,
`docs/narrative/research/R2-game-narrative-craft.md:312 "about 20 seconds of text before and after each race, so story stays near 10% of session time"`.
**Deviation in the source**: the ten-percent figure needs a session of six minutes or more per
event to follow from forty seconds of story, and the dossier states no session length, so the
technique keeps the twenty seconds as a bet and drops the ratio as a finding. The fixed spine is
`docs/narrative/research/R2-game-narrative-craft.md:308 "the hook (first race plus first ledger)"`
and the rest, with the guard
`docs/narrative/research/R2-game-narrative-craft.md:319 "Never let it pick the fixed beats."`,
confirmed and carried into the few-fixed technique.

## What this application does not show

Nothing here was observed in play. The slots are read from data files and a design document,
which is structural evidence; whether a player reads a card, hears a bark or remembers an
outcome is a rung this campaign has not reached.
