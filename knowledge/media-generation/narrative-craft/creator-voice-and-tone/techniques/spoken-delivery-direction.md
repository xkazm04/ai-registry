---
layer: technique
type: technique
subject: creator-voice-and-tone
technique: spoken-delivery-direction
status: forged
laws: [edit-do-not-regenerate, unmeasured-is-not-pass]
shared_with: []
use_when: [casting a synthetic narrator for a script, marking pacing or emphasis for a speech render, adapting a written script into its spoken form, patching a narration after review notes, choosing a voice engine's direction interface]
---

# Spoken delivery direction

Everything else in this subject treats voice as a property of *text*. The moment a
script is narrated by a synthesized voice, a second voice layer appears that no
written dial reaches: **delivery** — pacing, pauses, emphasis, breath, warmth, and
the casting decision of which voice speaks at all. A written profile renders the
same words whether they are read silently or performed; delivery decides how they
land in the ear, and it has its own craft, its own direction interfaces, and its own
failure modes. The one-line discipline: **cast deliberately, adapt the text to its
spoken form, mark delivery explicitly, and verify the render by listening-time
measurement — never by word count.**

## Casting is a profile decision, not a default

A synthetic narrator is chosen, and the choice carries as much identity as every
numeric dial combined — it is the spoken analogue of the reference world: declared,
not learned, and the first thing an audience recognizes.

- **Audition on hard passages, not a greeting.** Every stock voice sounds fine on
  "welcome back to the channel". Build a fixed audition script from the format's
  hardest material — a dense numeric passage, a hedged claim, a rhetorical
  question, one joke — and cast the voice that survives all four. A voice cast on
  an easy line fails on the first contested figure.
- **The audition script cannot catch a defect that is constant across scripts.**
  All four hard passages test what the voice *says*. A synthesized voice also
  carries what it was *recorded through* — the microphone, the room, and any
  broadcast processing present in the training audio, learned into the weights
  as part of the timbre and not removable afterward. Every passage returns it
  identically, so it presents as the voice's character until the take is cut
  against the channel's existing audio. So the audition has a second half with a
  different shape: play the candidate **beside** a finished piece and beside the
  other candidates, and listen for whether it sounds recorded in the same place.
  A voice that passes all four passages and cannot sit in the bed is a failed
  cast, and it is the failure a per-passage audition is structurally unable to
  report. The plumbing-side consequences — catalog integrity, compare surfaces,
  fallback that is audible before it is visible — belong to the voice-I/O
  channel and are owned there, not here.
- **Cast per creator × format**, exactly as the written profile is stored. A
  procedural walkthrough and a commentary piece want different deliveries even from
  the same identity; a single cast voice across formats reproduces the merged-profile
  error in audio.
- **Consistency outranks single-line beauty.** For long-form narration the binding
  quality is that minute 40 sounds like minute 1 — same timbre, same energy, no
  drift, no invented or skipped words. A voice that renders one gorgeous sentence
  but wanders over a chapter is a worse cast than a plainer voice that holds.
- **A cloned voice is a licensed likeness.** Cloning from a real person's audio —
  including the creator's own — enters the profile only with documented consent,
  and the clone's reference audio is chosen like accepted work: from performances
  the owner endorses, not from whatever recording was nearest.

## The script is not the read: spoken-form adaptation

Written register and spoken register diverge, and a voice engine performs the text
it is given, defects included:

- **Figures expand.** A compact written figure is one token on the page and many
  syllables aloud; a numerate script's listening time is much longer than its word
  count predicts, and its written form ("1.2T") may be read wrongly or
  inconsistently. Spell figures as they should be spoken, in the script itself.
- **Homographs and proper nouns need a pronunciation ledger.** Words whose reading
  depends on sense, project names, tickers, and units get one recorded ruling each,
  applied on every render — pronunciation is a per-series contract, not a per-render
  roll of the dice.
- **Sentences shorten.** Prose that reads well silently often carries subordinate
  clauses a listener cannot hold; the spoken adaptation splits them. This is a
  register transform, not an edit to meaning — the beat chain and its connectors are
  untouched by it.

## Direction interfaces come in three classes — and do not port

Every voice engine exposes delivery control through one of three interface classes,
and direction written for one class is dead weight in another:

1. **Deterministic markup** — structured tags for pause length, emphasis, rate,
   and phoneme spelling. Precise, verbose, and honored literally where supported.
2. **Inline performance cues** — bracketed stage directions and punctuation
   embedded in the text, interpreted probabilistically by the model. Expressive and
   compact, but a cue is a request, not a guarantee — the render must be checked.
3. **Style instruction plus reference audio** — a natural-language description of
   the wanted delivery, optionally anchored by an audio exemplar, applied to the
   whole render.

The consequences mirror prompt-dialect craft elsewhere in this bundle: **direction
is written in the cast engine's dialect and does not survive an engine swap**;
re-casting the narrator re-opens every delivery decision. And because inline cues
live *inside the prose*, the tone layer's mechanical checks must account for them —
delivery markup is part of the tone render, stripped before any word count or
structural invariance comparison, and never itself spoken aloud (a cue read out
loud is the render failing, and it happens).

## Direct the pauses and the emphasis; do not trust punctuation

A human narrator decides where to breathe; a synthetic one guesses from
punctuation, and the guess is the flattest part of most renders.

- **Mark the pause hierarchy explicitly** at the points that carry the argument: a
  beat before a structural turn, a breath after a question, a full stop of silence
  before the reframe. These are the spoken form of the schedule, and they cost real
  seconds — pause direction adds listening time with zero words, so it is budgeted
  with the bookends and digressions, not discovered at render time.
- **One emphasis per sentence, on the contrast that matters.** Emphasis marking is
  strong spice; a script where every third word is stressed has no stress at all.
  The words that earn it are the contrastive ones — the figure that surprised, the
  "not" that reverses an expectation.

## Verify by listening, patch by splicing

- **Measure the render, not the script.** Rate, duration, and pause placement are
  properties of the audio; a word-count arithmetic check on the text systematically
  under-predicts spoken length (figures expand, pauses add time). The timing gate
  runs on rendered duration, and a dial nobody measured on the render reports as
  unmeasured, never as fine.
- **Renders are non-deterministic; regeneration voids review.** A full re-render to
  fix one flubbed sentence replaces forty approved minutes with forty unreviewed
  ones. Answer notes with the smallest patch: re-render the affected sentences with
  identical direction and splice — and listen across both joins, because prosody
  mismatch at a splice point is the tell that betrays the edit.

## When not to use it

Skip the machinery when a human narrator reads the script — direct the human, and
let the written profile do its normal work. Skip the casting apparatus for
throwaway internal drafts where any voice will do. And do not use delivery
direction to compensate for a script defect: a passage that only works with heroic
pause-and-emphasis rescue is a writing problem, and the fix belongs in the prose,
upstream of the voice.
