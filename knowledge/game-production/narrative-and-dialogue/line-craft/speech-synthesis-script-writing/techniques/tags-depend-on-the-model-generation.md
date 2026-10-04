---
layer: technique
type: technique
subject: speech-synthesis-script-writing
technique: tags-depend-on-the-model-generation
status: forged
laws: [declaring-an-input-is-not-consuming-it, a-verdict-is-bound-to-its-content]
shared_with: []
use_when: [a writer wants to add a bracketed delivery or sound tag to a line, a tag is read aloud or has no effect, moving a script to a newer speech-model generation, briefing a generator to draft voiced lines]
---

# Tags depend on the model generation

The named concern: many speech engines accept direction inside the text — a bracketed delivery
word ("whispers", "laughs"), a bracketed sound, a pause of a stated length, a phonetic spelling,
a markup element for emphasis or rate — and some accept a separate style instruction beside the
text. Whether any of these does anything is a property of the model generation that renders the
line, not of the script. Within one engine family, the older generation may honour pause markup
of a stated length and take emotion only from narrative context written around the line, while
the newer one drops that markup and takes bracketed emotion and sound tags instead. A tag that
one generation performs, another reads aloud as words, another ignores, and another follows
only on some voices. The page cannot tell a consumed tag from an ignored one: both look like
direction ([declaring an input is not consuming it](../../../../_laws.md#declaring-an-input-is-not-consuming-it)).

## What a writer decides here

How a production compiles a neutral direction vocabulary into each engine's dialect is a
production concern and belongs to the subject that produces multi-speaker speech. The writer's
decision comes first: **whether a piece of direction should live in a tag at all, or in the
words.** The rule is to write the direction into the text whenever the text can carry it, and to
use a tag only for what words cannot do — a laugh, a sigh, a whisper where the line must be
whispered — and only after hearing that this generation performs that tag on this voice.

Three reasons make words the default. Words survive every generation; a tag survives one.
Words are performed by voices whose training never included the tag. And a line that depends on
a tag to sound right is a line that sounds wrong the day the tag stops working, without any
change to the script that would alert anyone.

## Tags have their own failure modes

A tag can be **spoken**: the voice says "whispers" in the middle of the line. It can be
**ignored**: the line renders as if it were absent, and the writer believes the direction is in
place. It can be **over-performed**: a laugh longer than the line, or an emotion tag that turns
the whole line into caricature. It can **leak** into the rest of the line. It can **fight the
voice**: a tag asking a soft voice to shout may be read aloud rather than performed, because a
tag works where the voice's source recordings contain that delivery; so a character who must
shout is cast with a voice that can, rather than tagged into it. It can **describe an action
instead of a sound**: a tag for standing, grinning or music is not a vocal delivery, and the
voice either speaks it or drops it. And it can be **muted by the settings**: the most stable
setting of a newer generation is described as less responsive to direction, so a stable
baseline and heavy tag use pull against each other. Each is heard only by listening.

Narrative context is a tag by another name. Where an older generation reads emotion from words
around the line ("she said, her voice trembling"), those words are spoken and must be cut from
the audio afterwards, which turns every such line into a splice. For game lines that are short,
captioned and re-rendered on revision, write the emotion into the line and leave the narrative
context out.

## Procedure

1. **Write the line without tags first** and listen to it. Most lines need none.
2. **Add a tag only for a vocal sound or a delivery the words cannot carry,** one per line,
   chosen from the range the voice was cast for.
3. **Confirm the tag on this generation and voice:** render the line with and without it and
   listen to both; if the difference is not audible, the tag is not doing anything and is
   removed.
4. **Check the render for the tag's word spoken aloud;** a spoken tag is a failed line.
5. **Record which tags were heard working,** on which generation and voice. The record is the
   writer's tag vocabulary for that generation; a tag absent from it is unconfirmed, and a tag
   of the other generation's dialect in a line is a defect the lint catches before rendering.
6. **On a change of generation, re-audition every tagged line.** An approval earned on the old
   generation speaks for the old render only
   ([a verdict is bound to its content](../../../../_laws.md#a-verdict-is-bound-to-its-content)).

## Decision rules

- When the words can carry the direction, write the words and drop the tag.
- When a tag is read aloud or has no audible effect, remove it and rewrite the line to carry the
  direction, rather than trying other tag spellings.
- When a newer generation offers an expressive tag vocabulary, adopt it line by line after
  hearing it, never by a global edit of the script.
- When a generator drafts the lines, its brief names the engine generation and the tags that
  generation has been heard to honour, so that it does not write the other dialect.
- When a style instruction field is available beside the text, keep it short, stable and
  neutral per voice, and let the text vary; a style instruction rewritten per line is a setting
  in disguise.

## When not to use it

A single throwaway read on one engine that will not change may use whatever tag works once heard.
A production whose engine reads direction only from a separate parameter has no in-text tags to
govern; the rule about preferring words still holds.

## Evidence status

The per-generation differences — pause markup on the older generation and not the newer, the
older generation's emotion from spoken narrative context, bracketed emotion and sound tags on
the newer, a tag read aloud when it does not suit the voice, the advice against non-vocal tags —
come from one speech vendor's documentation and blog as read by a game-dialogue research
dossier, rated high confidence there; this document did not re-read those pages. The claim that
the most stable setting is less responsive to direction comes from secondary guides the dossier
rates medium and asks to be checked in the vendor's interface. That one project's current
generation does not document the newer tags is the dossier's reading of the vendor pages, not a
test. Nothing here is a controlled study, and none of it has been tested in a played game yet.
