---
layer: application
type: application
subject: game-dialogue-voice-pipeline
technique: bake-versus-runtime-speech
stack: process
status: forged
refresh_by: 2027-05-16
verified_on: 2026-11-16
---

# Process: a storefront's disclosure splits by when the content is generated

Read on 2026-11-16 from the Steamworks content survey documentation,
https://partner.steamgames.com/doc/gettingstarted/contentsurvey . The AI section carries no
date of its own; press coverage places the framework in January 2024 and a later wording
change narrowing it to content players consume.

## What the page states

- **Pre-Generated:** "Any kind of content that ships with your game and is consumed by
  players", made with AI help during development; sound is in the listed scope ("artwork,
  sound, narrative, localization, etc.").
- **Live-Generated:** "Any kind of content created with the help of AI tools while the game is
  running", and for it "you'll need to tell us what kind of guardrails you're putting on your
  AI".
- **Out of scope:** "Efficiency gains through the use of these tools is not the focus of this
  section."

## What it means for the line class

The technique's three classes map onto the form without remainder: baked-authored and
baked-pool lines are pre-generated content when a speech model rendered them; runtime lines
are live-generated, and the stall rule's filler reads are pre-generated. The runtime class
therefore carries a written guardrail description (what text may reach the voice, how it is
constrained), which is the "accepted only statistically, by sampling and by constraints on
what the text may be" clause of the technique made into a document a reviewer reads. A
catalog whose class column is complete can answer the form; one that classed the whole game
as "runtime" answers it wrongly in both directions.

Voice is not named on the page; it falls under sound.
