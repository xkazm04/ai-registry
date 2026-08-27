---
subject: voice-io
domain: software-engineering
last_touched: 2026-08-27
dry_streak: 0
---

# voice-io

First touch: [[2026-08-27-s1-mini-transcript-cleanup]] — run 28, an
operator-dispatched intake. Class: MATURE (the subject was forged 2026-08-18
and widened since; this run added its tenth technique).

## State

10 techniques, 5 applications (node, react ×3, rust). Golden path ~250 lines.
Two independent pipelines by design — capture→transcription and
text→synthesis→playback — and the subject's own framing insists they are not
mirror images.

## What run 28 changed

- **`transcript-normalization` (NEW technique).** Closed the subject's missing
  stage. The pipeline had capture→transcript (`stt-pipeline`),
  transcript→command (`spoken-intent-parsing`) and display-text→speech
  (`speech-ready-text`), and nothing owned transcript→**written text a person
  reads**. The subject was already carrying one half of a symmetry it had
  named explicitly, which is what made the gap findable.
- **`stt-pipeline` amended** with "A stage further down gets a different
  empty" — the technique's own empty-is-a-claim rule inverts one stage later.
  Gained `verdict-survives-boundary` in its `laws:`.
- **`react--transcript-normalization` (NEW application)** — a negative from an
  opened tree.

## The finding shape worth reusing here

This subject rewards **walking its stated pipeline and asking what owns each
transition**. Both of run 28's landings came from that, not from a claim the
source made. The subject is thorough from stage two onward in both directions,
and its golden path enumerates its own stages — which is exactly the condition
under which a missing stage one hides in plain sight.

The second reusable move: the subject's two pipelines are described as *not*
mirror images, and the doctrine is correct — but the **doors** on each side do
mirror, and only one had been built. Where a subject explicitly denies a
symmetry, check whether it denied too much.

## Boundary notes

- `spoken-intent-parsing` and `transcript-normalization` both normalize
  transcripts and must not be confused: the first normalizes **to discard** (a
  match key, lossy by right), the second **to keep** (the output is the
  artifact). Stated in both files. A future run proposing "transcript
  normalization" against either one should read this line first.
- The subject's audio boundary question (plumbing / producing / placing /
  judging) sorts this subject against `media-generation/audio-generation`,
  `game-production/spatial-audio-scene-authoring` and
  `recruiting/voice-interview-fidelity`. Run 28 confirmed the last one is a
  genuine opposite: `transcript-normalization` says clean the transcript for a
  reader, and the recruiting bundle's fidelity techniques say a transcript
  used to characterize a person keeps its disfluencies because they are data.
  Not a contradiction — the discriminator is whether the transcript is the
  user's artifact or evidence about the user. Stated as a `when not to apply`
  clause on this side; the other bundle holds the opposite rule.

## Cross-bundle convergence to watch

`transcript-normalization`'s typed-destination section is the **third
independent sighting** of the shape `media-generation/_laws.md` carries as
`typed-input-owns-its-channel`, and the **first outside that bundle**. Cross-bundle
links are forbidden so it landed as uncited prose. Return condition for
proposing it into `software-engineering/_laws.md`: a second sighting *within*
this bundle. One is not a law.

## Open leads (banked, with return conditions)

- **A normalizer seam gated on capture language, built before a normalizer is
  chosen.** Cheap now (capture already resolves the language; the stage is
  optional by construction), but no consumer benefits yet. Return when a
  dictation destination appears whose output a person reads. See
  [[2026-08-27-s1-mini-transcript-cleanup]].

## Untriaged from run 28

Register as a user-facing setting (a `voice-ux-integration` question); whether
a normalizer sidecar inherits the per-call model-reload constraint the node
`portable-provider-package` application already records for synthesis; whether
ASR engines' own punctuation modes overlap the cheap half of the new stage.
Nobody verified these — they are not declines.
