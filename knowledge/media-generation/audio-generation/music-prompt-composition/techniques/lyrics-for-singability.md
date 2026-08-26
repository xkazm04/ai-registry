---
layer: technique
type: technique
subject: music-prompt-composition
technique: lyrics-for-singability
status: forged
laws: [causality-over-sequence]
shared_with: []
use_when: [writing lyrics a vocal model will perform, sung lines come back smeared or with words dropped, fitting words to a section whose tempo and duration are fixed, deciding what belongs in the lyric field versus the style field]
---

# Lyrics for singability

Text handed to a vocal model is not read; it is **performed** — breathed
through, stretched over beats, pushed through a melody the model invents
around it. Lyrics written as prose fail as performance in predictable ways,
and every failure is audible: too many syllables for the bar and the line
smears; stresses that cannot land on beats and the phrasing fights the
groove; consonant clusters at tempo and the words turn to mush. The model
rarely refuses a bad lyric. It degrades, which is worse, because the
degradation is discovered by ear after the spend.

## Write for the mouth, not the page

- **Say the line aloud at the section's tempo.** This is the whole test in
  one sentence. If you cannot get the line out in the bars it must occupy,
  neither can the model. Fast sections want fewer syllables per line, open
  vowels, and consonants that release quickly; slow sections can afford
  density and sustained vowels the melody can lean on.
- **Put the stressed syllables where the beats will be.** A line's natural
  speech stresses become the sung accents. "toNIGHT we RUN" lands; a line
  whose stresses fall between beats gets audibly wrestled into place.
- **Rhyme is optional; shape is not.** Lines of roughly matched length and
  stress pattern within a section give the model a verse it can set
  strophically. A ragged stanza gets a ragged melody.
- **Repetition is structure, not laziness.** The chorus repeats because
  repetition is how a hook works; write the hook line once and repeat it
  verbatim rather than paraphrasing it — a paraphrased hook is two weak
  hooks.

## The lyric field carries words; the structure rides in tags

Section tags (the bracketed role labels a plan format provides) and inline
delivery directions (a whispered line, a shouted word, a held note) are
performance metadata, and they belong in the tags and braces the scheme
provides — not smuggled into the lyric text itself, where they will be sung.
The reciprocal rule also holds: style belongs in the style directives, and
a lyric line that says "guitar solo" is a request to hear someone sing the
words "guitar solo".

## A lyric is still a script

In a factual production, sung words carry claims exactly as spoken ones do,
and a lyric sequence is still a narrative: lines connected by "but" and
"therefore" hold; lines connected by "and then" list. The causality law
does not care about the melody. The one licensed exception is the hook —
a chorus earns its repetition by being the piece's thesis, restated, and a
thesis is not a sequence.

## Decision rules

- When a delivered vocal smears a line, cut syllables before re-briefing
  style, because density is the likeliest cause and the cheapest fix.
- When a word must be intelligible on first listen (a name, the thesis),
  give it a slow section, an open vowel, and space around it — do not bury
  the one load-bearing word in the fastest line.
- When the words matter more than the melody, consider whether the line
  should be spoken over the music instead — delivery direction for a
  narrator is the neighbouring craft, and mixing the two lanes is a
  spotting decision, not a lyric one.

## When not to use this

Instrumental briefs, obviously — but also texture vocals: when voice is
wanted as an instrument (wordless pads, distant chants), brief it as
instrumentation in the style field ("wordless female choir, far back")
rather than writing lyrics designed to be unintelligible. Words that must
not be heard should not exist in the lyric field at all.
