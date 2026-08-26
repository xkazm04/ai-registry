---
layer: golden-path
type: golden-path
subject: music-prompt-composition
status: forged
use_when: [briefing a music generator on a piece, structuring a song as sections with durations and styles, writing lyrics a vocal model must perform, producing music that must hit picture events, deciding what a reference track may carry into a brief]
techniques:
  - section-plan-as-the-brief
  - sonic-style-vocabulary
  - lyrics-for-singability
  - duration-and-tempo-locking
  - reference-track-anchoring
---

# Music prompt composition

Music is the modality where "describe what you want" fails most expensively,
because a piece of music is not one thing — it is a **sequence of committed
decisions over time**: this section, this long, in this style, then that one.
A prose wish ("epic orchestral trailer music, dark, builds to a climax")
delegates every one of those decisions to the model, and the model's answers
arrive fused into one take that can only be accepted or rejected whole. The
craft of this subject is the opposite posture: **the brief is a structured
plan** — an ordered list of sections, each carrying its own duration, its own
style directives, and its own lyric or instrumental content — so that every
decision the plan commits is one the model no longer makes, and every
decision it makes is one a later edit can target by name.

That is not just specification hygiene; it is what makes revision possible
at all. A piece generated from a plan has addressable sections, and a note
on the chorus becomes an edit to the chorus — the whole
edit-over-regeneration discipline of this bundle presupposes that the
artifact has parts. A piece generated from prose is one part. The plan is
where the parts come from.

## The opening section is the anchor, and it is load-bearing

In every sectioned generation scheme, the opening section does double duty:
it is the first thing heard, and it is the frame everything after is
generated in — its style directives set the genre, tempo world, and tonal
palette that later sections inherit and vary. Write it with double care, and
treat any later note against it as what it is: a global restyle, not a local
edit. The brief-side consequence is an ordering discipline — decide the
piece's identity in the opening section's directives, and let later
sections' directives say only what *changes* there (lift, thin out, halve
the tempo feel), not restate an identity they would be powerless to
overrule anyway.

## Style is layered vocabulary, stated in both directions

"Cinematic" is not a style; it is an evasion with good posture. A style
directive that survives contact with a generator is **layered**: genre and
era, mood and energy, instrumentation, and production character, each named
in words the training distribution actually carries
([sonic-style-vocabulary](./techniques/sonic-style-vocabulary.md)). And it
is stated in both directions — what to include and what to exclude —
because the model's default drift is toward the center of its distribution,
and the exclude list is the only fence on the side you cannot see. The most
common failure of an underscore brief is one word long: forgetting
"instrumental", and receiving a singer.

## Words that will be sung are a performance script

Lyrics handed to a vocal model are not text; they are a score the model must
breathe through. Syllable load must fit the tempo, stresses must be able to
land on beats, and dense consonant clusters become audible mush at speed
([lyrics-for-singability](./techniques/lyrics-for-singability.md)). Section
tags and inline delivery directions ride with the words. The test is to say
the line aloud at the section's tempo — if you cannot, the model cannot
either, and it will smear rather than refuse.

## Music against picture inverts the freedoms

A standalone piece owns its own clock; a cue against picture does not. When
music must hit a cut, land a turn, or duck under a voice, the brief inherits
hard constraints from the cue list upstream: duration to the second, entries
placed on structural beats, tempo chosen so the bar math lands where the
picture needs it ([duration-and-tempo-locking](./techniques/duration-and-tempo-locking.md)).
The spotting decision — where music enters, exits, and why — is a different
subject's job (the assembly craft owns the cue list); this subject owns
turning one cue's row into a brief a generator can execute exactly.

## References carry style, never melody

Starting from a reference track is the highest-bandwidth style directive
there is, and the most hazardous line in the brief
([reference-track-anchoring](./techniques/reference-track-anchoring.md)).
A reference may carry palette, energy, and production character. It may not
carry melody, and a commercial reference drags rights exposure into the
output. The disciplined use is anchoring on your **own** accepted work — the
project's previously approved cues — which is how a multi-cue production
keeps one musical identity without re-describing it from scratch each time.

## Where this subject ends

One question sorts audio work that lands nearby: are you **producing** sound
to a creative brief, **placing** it against picture or in a space,
**plumbing** it through a product, or **judging a person** by it? This
subject owns producing music — the brief side. Deciding where music goes in
a cut is the assembly craft's spotting discipline; sound effects are briefed
envelope-first under their own subject; a performed *spoken* voice belongs
to the narrative craft's delivery direction; and voice as a product I/O
channel or as interview evidence are other domains' standards entirely,
with rules that would be wrong here.
