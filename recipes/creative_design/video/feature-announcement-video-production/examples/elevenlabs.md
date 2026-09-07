# ElevenLabs as the `voice_generation` connector for a short announcement

What was learned mapping this recipe onto ElevenLabs specifically. Nothing here is part of
the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**The captions come from the script, not from a transcription of the output.** The approved
script is the authoritative text and the synthesis is downstream of it, so generating
captions by transcribing the audio adds a second place for the words to be wrong. Time the
approved lines against the returned audio instead, and use any mismatch as a signal that the
synthesis dropped or mangled something rather than as a caption to ship.

**The audio's exact length is the render's timeline.** A composition cut to a voiceover
breaks the moment the voiceover is re-synthesized, because a regenerated take is not the same
number of milliseconds. That is the mechanism behind this recipe's insistence on scoping
rework: a voiceover rejection is genuinely cheap, but only if the composition step re-reads
the audio length rather than holding timings from the previous take.

**Rate limits are the normal failure and a retry loop is the wrong answer.** A run that hits
the ceiling has usually asked for more speech than the account is provisioned for, and the
honest responses are a shorter script or a wait, not repeated attempts that burn the budget
without producing anything. The recipe's word budget makes this a design decision rather than
a runtime surprise.

**A short announcement is where synthesis is hardest to hide.** Seventy five words leaves no
room for a flat delivery to average out. Where the adopter cares, a single voice held across
every announcement is worth more than a better one chosen per video, because consistency is
what reads as a brand and variation reads as a mistake.

## What transfers to any speech connector

- Caption from the authoritative script, and use the audio only to time and verify it.
- Any timeline derived from a take has to be re-derived when the take changes.
- Rate limits are a scope problem before they are a retry problem.
