---
layer: application
type: application
subject: subtext-and-voice-differentiation
technique: voice-bible-per-speaker
stack: process
status: forged
verified_on: 2026-10-10
---

# A voice bible for a debt-racing campaign cast, voiced by a model

This application reads the voice bible discipline against the dialogue research dossier
written for Death Ride, a top-down vehicular combat racer for a television set-top device,
whose campaign is a debt owed to a league boss. The dossier is
`docs/narrative/research/R3-dialogue-craft.md` in the tree at
`firetv-deathride` (written 2026-10-04; paths below are relative to that
root). It is research, not field experience: no player has played the campaign, no line in it
has been heard by a player, and nothing below is a result observed in play. The cast it
serves is a league boss (Marrow) who owns the player's debt, five region bosses who change
sides after defeat, a young Mechanic who runs the parts store, and an Announcer, speaking in
three-line cards, one-breath barks and short exchanges, some lines synthesised to speech.

## What the dossier confirms

The template is the technique's entry almost row for row. It carries a hidden-thing row and a
hard refusal row, `docs/narrative/research/R3-dialogue-craft.md:349 "NEVER SAYS: <3-5 hard rules>"`,
grounded in the pattern statement `docs/narrative/research/R3-dialogue-craft.md:71 "A voice is defined by what it never says"`.
Rhythm is stated checkably rather than as mood — the Marrow sample reads
`docs/narrative/research/R3-dialogue-craft.md:359 "Rhythm is 5 to 10 words in complete sentences, no contractions"`
— and address is its own field, `docs/narrative/research/R3-dialogue-craft.md:347 "address for player"`.
The proposed refusal entries are concrete enough to filter on:
`docs/narrative/research/R3-dialogue-craft.md:76 "never raises his voice, never makes a direct threat"`
for Marrow, and `docs/narrative/research/R3-dialogue-craft.md:77 "never swears and never lies about a part"`
for the Mechanic. The dossier marks them honestly as unaccepted:
`docs/narrative/research/R3-dialogue-craft.md:80 "The entries are design proposals."`

Consumption is stated as a rule, not a hope:
`docs/narrative/research/R3-dialogue-craft.md:272 "Include the voice bible every time."`,
and a person signs the bible off
`docs/narrative/research/R3-dialogue-craft.md:307 "before generation starts"`, with anchor
lines held by a person,
`docs/narrative/research/R3-dialogue-craft.md:308 "These are written or chosen by a human, and the rest is calibrated to them."`
The blind attribution test is wired into the revision protocol with a different model as the
reader, `docs/narrative/research/R3-dialogue-craft.md:398 "A different model guesses each speaker from the bible set."`,
and the rubric's top voice score is
`docs/narrative/research/R3-dialogue-craft.md:327 "Recognisable with the name covered"`.
The machine-authorship premise is the dossier's too:
`docs/narrative/research/R3-dialogue-craft.md:60 "One model voicing six characters gives all six the same fingerprint"`.

## Upward lessons taken into the technique

Four rows were added to the entry from the template. The status move,
`docs/narrative/research/R3-dialogue-craft.md:343 "STATUS MOVE: <interrupts / waits / flatters / defers>"`;
the pressure row, `docs/narrative/research/R3-dialogue-craft.md:351 "UNDER PRESSURE: <quieter / louder / more formal / more fragmented>"`,
which answers the failure the dossier names at
`docs/narrative/research/R3-dialogue-craft.md:73 "Under pressure, everyone ends up voicing the emotional summary."`;
the arc row's second half, `docs/narrative/research/R3-dialogue-craft.md:352 "what never changes"`;
and the rule that reference lines are human-written,
`docs/narrative/research/R3-dialogue-craft.md:353 "REFERENCE LINES: <5+ human-written lines for this project, varied triggers>"`,
together with `docs/narrative/research/R3-dialogue-craft.md:272 "Never paste lines from existing works."`

The largest lesson corrected the draft's routing of the off-voice pair. The dossier, citing a
model vendor's prompting guide, says
`docs/narrative/research/R3-dialogue-craft.md:274 "Phrase instructions positively and give the reason"`
and `docs/narrative/research/R3-dialogue-craft.md:274 "Apply the blacklist after generation, as a filter, not as the main instruction."`
The technique now sends positive rows and on-voice references to the generator and keeps
off-voice pairs and never-use lists for the reviewer and the post-generation filter.

## Where the dossier falls short of the standard

**Every break is a defect.** The dossier's rule is that a voice
`docs/narrative/research/R3-dialogue-craft.md:71 "breaking it counts as a defect"`. The
standard keeps one declared, scheduled break per refusal as a planned peak — a boss saying the
word he never says, at his turn — because a rule with no exception forbids the most valuable
beat a refusal buys. Death Ride's region bosses each turn once; each turn is the natural place
for that break, and the bible should name it.

**No register per listener.** Address is defined toward the player only. Marrow speaking to
the Mechanic, whose own debt he also holds, and to a region boss he is losing are different
registers, and the template has no row for them.

**No single-source or check-source rule.** The bible is pasted into every prompt, but nothing
states that the filter's banned words and length ceilings are read from the entry rather than
typed into the filter separately, which is where the two drift.

## Evidence honesty

The dossier's own note is that much of its craft evidence is second-hand:
`docs/narrative/research/R3-dialogue-craft.md:444 "18 to 26 and 30 are interviews, notes or summaries"`.
The "never says" practice rests on a reported quote from the Cowboy Bebop series composer
Keiko Nobumoto (SlashFilm, https://www.slashfilm.com/988164/long-before-cowboy-bebop-shinichiro-watanabe-had-already-created-spike/);
the positive-instruction and few-example guidance on Anthropic's prompting best-practices page
(https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices);
the shared-fingerprint claim on the Antislop study (https://arxiv.org/html/2510.15061v2), which
measured prose; and the judge-a-model's-lines caution on
`docs/narrative/research/R3-dialogue-craft.md:237 "A model can draft and revise, but a human must judge."`,
from Chakrabarty, Laban and Wu (https://arxiv.org/html/2409.14509). None of the entries has
been generated against, attributed blind or heard by a player.

## The Death Ride use

Before any campaign line is generated: one entry each for Marrow, the Mechanic, the Announcer
and the five region bosses, signed off by the owner with the refusal rows accepted or
rejected; the same entry carried verbatim into every generation call for that speaker and the
speakers they address; the attribution test run on each batch by a model of a different family
from the drafter; and each boss's scheduled refusal break named in the entry against the card
on which they turn.
