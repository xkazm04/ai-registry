---
layer: technique
type: technique
subject: character-voice-design
technique: design-to-read-parameter-lock
status: forged
laws: [unmeasured-is-not-pass, edit-do-not-regenerate]
shared_with: []
use_when: [saving a designed voice preview as a voice a production will use, choosing the stability or consistency setting a designed voice is read with, a voice sounds different in production than it did in its design preview]
---

# Design-to-read parameter lock

A design preview and a production read are two different renders. The preview is
the designer's model reading the design text once, under settings the designer
chose. A production read is a speech model reading a new line under a stability,
a seed and a format the production chose. The voice identity is shared; the
performance is not. Casting decides on production reads, then locks the
parameters that made them.

## The two stages

1. **Design.** The description, design text, seed and adherence setting produce
   previews. Each preview carries a temporary identifier.
2. **Save.** The chosen preview is saved as a stored voice. From this point the
   voice is an asset with a durable identifier, and the design inputs (the
   description, design text, seed, adherence and the designer generation)
   are recorded with it, because they are what a rebuild on another engine
   generation starts from.
3. **Read.** Audition lines are rendered with the stored voice under the
   shipping speech model and settings. The casting board plays these reads;
   the design preview is heard only as a labelled reference.

## Choose stability by a consistency test

Speech models that take direction expose a stability or consistency control that
trades expressiveness against repeatability: low settings follow tags and
emotion more freely and occasionally invent; high settings repeat themselves and
flatten tag-driven variation. The setting is chosen, not defaulted:

- Render the same two audition lines three to five times at each candidate
  setting with the seed left free, plus once at a fixed seed.
- Listen for drift (does the voice stay the same person), for invention (added
  or dropped words) and for whether the registers the brief needs still appear.
- The owner chooses. A steadier setting is not automatically better: a character
  whose charm is liveliness can deliberately ship a less steady setting, and
  that decision is recorded with its reason. What may not happen is a setting
  that nobody listened to
  ([unmeasured is not pass](../../../_laws.md#unmeasured-is-not-pass)).

## Lock the render key

Once chosen, the stored voice identifier, speech model, stability and related
settings, seed and output format are one record, defined in one place, and they
are the render key: a cache of rendered lines is keyed on all of them, and
changing any one is a re-casting event that is auditioned before it ships. A
fixed seed makes a repeated line sound the same every time, which is what a
listener expects of a character; it does not make two different lines consistent,
which is the stored voice's job.

After the lock, review notes on a line are answered by re-rendering that line
under the same key, never by redesigning the voice
([edit, do not regenerate](../../../_laws.md#edit-do-not-regenerate)). A new
design is a new casting round, with its own board.

## Decision rules

- **When production reads sound unlike the preview**, re-audition under the
  shipping parameters; do not tune the description to match a preview nobody
  will ship.
- **When the speech model changes generation**, the lock is broken by
  definition, and the voice goes back through the acceptance pass the
  multi-speaker production subject defines for stored voices.
- **When tags seem ignored**, lower stability before adding more tags.

## When not to use it

A throwaway prototype voice heard once does not need a lock. Anything a user will
hear twice does.
