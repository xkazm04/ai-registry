# ElevenLabs as the `voice_generation` connector

What was learned mapping this recipe onto ElevenLabs specifically. Nothing here is part of
the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**The voice id, not the voice name, is the host.** A name in the library can be re-pointed
and a cloned voice can be regenerated, and the show changes character with no diff
anywhere. Pin the id at adoption, record it with the run, and treat a changed id as a
production decision that needs the same approval the format got.

**Generation settings are per request, so they are a consistency risk inside one file.**
Stability and similarity change delivery audibly. Two segments of the same episode
generated at different settings sound like two recording sessions, and no amount of
levelling afterwards fixes it because the difference is in the performance rather than the
gain. Fix the settings alongside the voice id and change them for a whole episode or not
at all.

**Ask for the uncompressed output and encode once at the end.** Requesting MP3 per segment
and concatenating the files leaves encoder padding at every join, which is both an audible
tick and a gap the recipe never asked for. Synthesize to PCM or WAV, trim, join, level,
then encode a single time into the delivery format.

**The connector offers surrounding text as a request hint, and it is worth using.** Passing
the previous and following lines with each segment lets the model carry intonation across
the cut, which is the difference between a briefing and a list of sentences. It costs
nothing at delivery and it is invisible in the output, so it has to be decided once rather
than remembered per run.

## What transfers to any speech connector

- Pin whatever identifies the voice, and record it with the run. Voices move.
- Generation settings belong to an episode, never to a segment.
- Synthesize uncompressed, join, level, encode once. Never concatenate compressed segments.
