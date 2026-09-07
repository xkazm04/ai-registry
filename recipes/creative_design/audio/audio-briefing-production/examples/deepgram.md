# Deepgram as the `voice_generation` connector

What was learned mapping this recipe onto Deepgram specifically. Nothing here is part of
the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**This connector holds both halves of the verification, which is the reason to pick it.**
It synthesizes and it transcribes. The recipe's hardest check is proving that what was
spoken is what the script said, and here that check is a second call against the same
account: transcribe the finished track and compare it to the source script. A swallowed
final syllable, a segment that returned silence and a number read as digits rather than
words all show up in that comparison and in nothing else. Any adopter already using it for
transcription gets that check for free, and the draft this recipe came from was wrong to
call the transcription half unused.

**The comparison has to be tolerant in the right direction.** Transcription will not
return the script verbatim: punctuation differs, numbers and abbreviations are expanded or
contracted, and casing is its own decision. Compare on normalized words and treat a
missing run of words as the signal. An exact string match here produces a failure on every
run and gets switched off within a week, which leaves the recipe with no verification at
all.

**Pacing is entirely the joiner's job.** There is no request level hint that carries
intonation across a segment boundary, so the flow between turns comes from trimming and
gap length rather than from anything asked of the model. That makes the trim step more
load bearing here than on a connector that offers stitching hints, and it makes the gap
setting worth tuning by ear once rather than accepting a default.

## What transfers to any speech connector

- If the same account can transcribe, the runtime check upgrades into a content check.
- Compare normalized words, never raw strings. A check that always fails is a check that
  gets disabled.
- Where the connector offers no help with flow across a cut, the trim and gap settings are
  carrying the whole burden and deserve to be set deliberately.
