---
layer: application
type: application
subject: game-dialogue-voice-pipeline
technique: localized-voice-timing-budget
stack: process
status: forged
verified_on: 2026-11-16
---

# Process: sync classes measured against the source file

Two accounts of game audio localization, seventeen years apart, opened on 2026-11-16. Both
grade lines by how tightly a locale take must match, and both measure against the
source-language file rather than against the animation.

## A localization producer's kit (2007)

"Surviving Audio Localization", Game Developer, 14 February 2007,
https://www.gamedeveloper.com/audio/surviving-audio-localization :

- Voice Over: "a no constraint and usually applies to AI barks and one liners whose dependency
  on image is poor".
- Time Constraint: "Localized files can be -/+10% longer or shorter than U.S.'s."
- Strict Time Constraint: "Length of U.S. and localized files match (exactly)."
- Sound Synch: "an overzealous STC that mirrors silences in its corresponding U.S. file".
- Lip Synch: "High resolution cinematics call for lip synch but not for all lines".
- The kit's script carries the time-constraint class as a filterable column beside character,
  context and text, and "The naming convention must be identical for all languages."

## A translator's account (2024)

"Translating a game while keeping the dubbing in mind", 22 April 2024,
https://whateverthewindbrings.bearblog.dev/translating-a-game-while-keeping-the-dubbing-in-mind/ :
tiers by how close the face is; sound sync for close-ups including mid-sentence pauses; a
percentage band ("-/+ 15%", some cases up to 30%) where the face is visible but not close;
no limit for barks; lip sync prioritising the closed-lip sounds (p, m, b). Translators often
work "without having access to the scenes themselves", sometimes before the source voice
exists, so "everything is done blindly".

## What changed in the technique

The class column and the reference (the take the attachment was built to) were added; the
tolerance is left to the project because the two sources disagree on it (10 against 15 to 30
percent), which is the expected spread of a house convention, not a measurement. The blind
brief confirms the technique's step 2: a ceiling has to be written into the brief.
