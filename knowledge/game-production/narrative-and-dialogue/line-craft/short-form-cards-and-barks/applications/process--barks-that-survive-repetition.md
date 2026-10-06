---
layer: application
type: application
subject: short-form-cards-and-barks
technique: barks-that-survive-repetition
stack: process
status: forged
verified_on: 2026-10-04
---

# Bark pools sized for a TV racing campaign — the Death Ride bark checklist

*Resolved 2026-10-04 against the `firetv-deathride` tree (branch `deathride/main`, tip
`6efb1dda`). Paths below are root-relative to that tree. Every cited line was re-opened and
re-read on that date.*

Death Ride's rivals, bosses, mechanic and announcer speak mid-race and between races, on a
television, over engine noise, across roughly thirty-five races. The barks are planned to be
voiced by a speech-synthesis model and captioned. Nothing is built or played yet; this is how
the game's research dossiers specify the pools, reconciled against the technique.

## The repetition budget the dossiers set

The game-narrative dossier names the failure in this game's own numbers —
`docs/narrative/research/R2-game-narrative-craft.md:64 "Writing three taunts per rival and hearing them eight times each over 35 races."`
— and borrows a game director's repeat horizon:
`docs/narrative/research/R2-game-narrative-craft.md:66 "20 or 30 times"`
(primary interview, https://geekdad.com/2019/10/narrative-and-early-access-supergiants-greg-kasavin-discusses-hades-development/).
Its bark rule is quoted first-hand from a game writer in trade press:
`docs/narrative/research/R2-game-narrative-craft.md:123 "each bark should convey one piece of information"`
(https://kotaku.com/why-video-game-characters-say-such-ridiculous-things-5921878), and its
proposal for this game sizes the bark for the screen:
`docs/narrative/research/R2-game-narrative-craft.md:255 "Barks carry one fact, sized for a TV"`
— five to eight words or a voice line under two seconds, with puns rationed to one rival
defined by bad jokes.

The dialogue dossier turns this into a pool system and a checklist:

- `docs/narrative/research/R3-dialogue-craft.md:135 "4 to 8 lines for common triggers, 2 to 3 for rare ones."`
- `docs/narrative/research/R3-dialogue-craft.md:137 "The memorable ones wear out first."`
- `docs/narrative/research/R3-dialogue-craft.md:138 "so repeats don't share a rhythm."`
- `docs/narrative/research/R3-dialogue-craft.md:142 "that the player hears as one line."`
- `docs/narrative/research/R3-dialogue-craft.md:370 "Doesn't sneer at the player for failing"`
- `docs/narrative/research/R3-dialogue-craft.md:371 "No phrase shared with another character or another pool"`
- `docs/narrative/research/R3-dialogue-craft.md:376 "Still makes sense if cut off halfway, or has a cut-off variant"`
- `docs/narrative/research/R3-dialogue-craft.md:374 "Fits the caption slot in two lines at TV distance"`

Its system sources are a dynamic-dialogue conference talk
(https://www.gdcvault.com/play/1015528/AI-driven-Dynamic-Dialog-through, with a practitioner's
summary at https://emshort.blog/2012/03/16/gdc-2012-talk-on-dynamic-dialogue/) and a bark-writing
newsletter (https://howtowriteagame.substack.com/p/how-to-write-video-game-barks). It rates
them itself:
`docs/narrative/research/R3-dialogue-craft.md:146 "for the pool sizes, which should be tuned in playtests."`

## Reconciliation against the technique

**Confirmed.** One standout per pool weighted rare; specificity wears out first; synonyms are
one line; frequency decides wear (R2:123 reports the writer saying so).

**Upward lessons taken into the technique.** Length variety inside a pool (R3:138); no phrase
shared across characters or pools (R3:371); the habit-as-character exception for puns (R2:255);
never sneering at failure (R3:370, and the low-confidence report that players modded out a
racing announcer's repetitive post-failure lines,
`docs/narrative/research/R2-game-narrative-craft.md:86 "players made a mod to mute the DJ's repetitive lines"`);
the cut-off rule (R3:376); and, for the voiced barks, the caption-matches-audio and
spelled-out-number rules:
`docs/narrative/research/R3-dialogue-craft.md:222 "The caption matches the audio"` and
`docs/narrative/research/R3-dialogue-craft.md:218 "Spell out numbers, currency and abbreviations"`
(the vendor guidance behind them: https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices).

**Deviation 1 — pool size without frequency.** R3:135 sizes pools by "common" and "rare"
triggers with no stated basis. The technique requires expected fires per session under a
stated session length; until Death Ride logs real trigger counts, "4 to 8" is a guess about
an unmeasured quantity, and the dossier itself says so (R3:146).

**Deviation 2 — two breath budgets that do not agree.** R3 sets
`docs/narrative/research/R3-dialogue-craft.md:215 "about 6 to 14 words"`
per voiced line, while R2:255 sets five to eight words mid-race. Not an error, but unlabelled:
the technique separates the mid-action budget from the between-rounds budget, and the Death
Ride brief should say which one each trigger uses.

**Not yet answerable.** Whether the pools survive repetition is a playtest question the
dossier's own revision protocol assigns to a human repeat count —
`docs/narrative/research/R3-dialogue-craft.md:404 "Count bark repeats and phrases shared between characters"`.
No Death Ride bark has been
voiced, captioned on a television, or heard thirty times.
