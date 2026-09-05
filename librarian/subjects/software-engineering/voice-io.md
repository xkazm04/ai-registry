---
subject: voice-io
domain: software-engineering
last_touched: 2026-09-04
touched_by: intake
dry_streak: 0
---

# voice-io

First touch: [[2026-08-27-s1-mini-transcript-cleanup]] — run 28, an
operator-dispatched intake. Class: MATURE (the subject was forged 2026-08-18
and widened since; this run added its tenth technique).

## 2026-09-04 - /intake run (microsoft/VibeVoice @ 1541f59)

- **`authored-voice-identity` gains a fourth specification kind.** It opened "There are three specification kinds" - selected / described / cloned - and the source ships a voice that is none of them: the model's own conditioning state, computed once and distributed as an opaque artifact, with the processor entrypoint that would accept raw audio raising a not-implemented error. Named **materialized**.
- **The technique's central pairing inverts on it.** For described and cloned voices *the specification is durable and the timbre is volatile*, and the whole storage rule exists to keep the specification. Here the timbre is durable and there IS no specification, so "the specification inputs are the system of record" has no referent. It buys total reproducibility and a safety property - no code path from a sample to a voice, so cloning is *absent* rather than gated - and pays in portability that is gone rather than reduced.
- The source states the trade itself: the embedded format mitigates deepfake risk **and** meets a first-chunk latency budget. One artifact substitution, two unrelated constraints, one answer.
- **Applied `experiment` to a fleet voice service, verdict `not-better`, and it corrected the amendment twice.** (1) The consent paragraph was drafted claiming a materialized artifact's provenance evidence is gone; the project stores a **content hash of the source clip** in the consent receipt, stamps it forward onto every rebuild, and has a one-directional consent-laundering guard on export. Rewritten around that hash as the field that makes the chain checkable. (2) The A/B substituted a content hash for the project's metadata artifact fingerprint - correct on 6/6 delivery scenarios against 4/6 - and is still `not-better`, because the fingerprint sits inside the cache **key** and therefore runs before the cache **lookup**: **18.369 ms against 0.005 ms** on ~10 MB artifacts, a 3,700x tax on the exact path the cache exists to make instant. The rule the tree forced: **establish the artifact's identity when it is installed, not when it is used**, and make whatever installs it responsible for moving the cheap identity - because a metadata-preserving delivery installs new bytes under an unchanged fingerprint and the product then serves the previous voice with no error anywhere.
- Seam class recorded so the next run does not re-run it: a per-request cache key over a large identity artifact. Fixing that at the read side is the expensive answer to a problem the write side closes for nothing.

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

## 2026-08-31 - /intake breeze-tts2-local-voice ([[2026-08-31-breeze-tts2-local-voice]])

Eleventh technique, and two amendments. All three were found by holding the
subject's own **enumerations** in mind while reading the source, not by ranking
what the source emphasised - the source's three loudest claims were all catches.

- **NEW `authored-voice-identity`** (11th technique). `engine-abstraction`'s
  capability axes - streaming, timestamps, language coverage, partials, speed,
  execution location - all describe what an engine does with the *text*, and
  none can express what an engine accepts as a *voice*. Three specification
  kinds: selected, described, cloned. The inversion that carries the technique:
  for a selected voice the identifier is durable and the hazard is retirement
  (which is what the catalog integrity rule was built for); for an authored
  voice the **specification is durable and the timbre is volatile**, so the
  inputs are the system of record and every render is a cache. Plus the consent
  line - a described voice is authored from nothing, a cloned voice is a real
  person's likeness - which is one schema field and two different objects.
- **`tts-pipeline` amendment - a voice reference resolves to a recording
  chain.** Training audio's microphone, room and broadcast EQ are learned into
  the weights and none of (engine, id, rate, pitch) can express them. The sharp
  consequence: the defect is **constant across content**, so no content-based
  audition can see it, and it is audible only in comparison against the
  product's own audio. Cross-bundle: this falsified an enumeration in
  `media-generation/creator-voice-and-tone/spoken-delivery-direction`, whose
  audition rule lists four kinds of hard *passage*. Both sides amended; the
  boundary is stated in prose on each rather than linked.
- **`on-device-vs-cloud` amendment - six axes to seven, adding `rights`.** The
  corpus had licensing only as a cause of engine *retirement*, i.e. the axis
  arriving too late. Rights is a gate rather than a trade-off, no probe can
  establish it, and it **inverts the matrix's central asymmetry**: residency is
  the axis on-device wins by construction, rights is the axis on-device can lose
  by construction, because a hosted engine's terms were accepted at signup and
  open weights on your own disk come with a license nobody was forced to read.

### What the connected tree said back (3 apply rows, 1:1 with landings)

- It **confirmed** the authored-voice storage rule without being designed to:
  its cloned voices are stored as reference wavs with no engine-side id.
- It **refuted** the technique's transcript bullet at its premise - the engine is
  zero-shot, so self-containment is an engine property and not a rule. The
  technique was corrected in the same run.
- It supplied a better fact than the source did: a **non-commercially-licensed**
  engine recorded as a module doc comment, where the surface that writes
  publishable files refuses it only via `if engine != <engine>` - the right
  outcome from an unrelated rule, which the obvious next feature deletes. The
  engine type's `impl` block is literally empty, so every capability question in
  that tree is answered by naming the engine.

### Open leads from this run

- **A third placement position between local process and vendor cloud**: the
  operator's own hardware, off this machine, over a private network overlay. The
  matrix is a binary and this is neither. Return when a second source describes
  it or a fleet project runs an engine off-box.
- **Direction prompts may split into a reliable continuous channel (prosody,
  pace) and an unreliable discrete one (cough, laugh, throat-clear).** One
  source's ear is not evidence. Return on a second source or a fleet engine
  exposing both.

### Untriaged, with anchors

- Speaker identity and language as separable inputs (a four-second reference in
  one language generating another); possibly `localization`'s concern too.
- A voice quality leaderboard split into open-weights and closed brackets.
  Currency-shaped; no `verified_on` was moved on its account.


## 2026-09-02 - [[2026-09-02-sherpa-onnx]] (intake, vendor repository)

Twelfth technique: `decode-time-vocabulary-biasing` - the stage between
segmentation and transcription where the product's known vocabulary reaches the
engine instead of only the matcher. Two mechanisms with opposite failure physics
(score-boost cannot invent text; prompt biasing can), the level gate that must
run before a prompted decoder sees silence, and the engine's no-speech verdict
arriving as a token in the text channel. `stt-pipeline` amended twice: the
silence threshold is not one number (content-conditioned rules plus a hard cap
that applies to explicit endpointing too; VAD hysteresis and the lowered bar on
a long segment), and the engine's empty is not always empty on the wire.
Applied 3/3 to one connected tree: one `not-better` experiment (the technique's
own precondition unmet - a small distinct grammar), one shipped code change
(blank-audio marker stripped so the typed no-speech path finally fires), one
simulation (no hold cap against a two-minute engine timeout). Leads: word-
timestamp accuracy as its own measurement, diarization, enhancement.


## 2026-09-02 - intake (Handy, practitioner build-walkthrough in repo form) - second run today

- **New technique `transcript-handoff-receipts`** (13th). The stt-pipeline stage table
  ends at "awaiting disposition" and no technique owned delivery into a foreign
  application. Owns: typing vs pasting through the shared clipboard, why a timed
  restore is a race (the chord is only enqueued), restore on the OS read receipt with
  four rules (post-chord receipts only; ownership unchanged; quiet period after the
  last receipt; bounded wait whose failure is "lingers", never "stale content lands"),
  what the restore must preserve (an image when no text; clear when empty), and the
  one-variable rule when introducing the mechanism. Golden path gained the section
  "The transcript leaves through a channel the product does not own".
- **Unapplied** - no fleet project injects text into a foreign application. Return:
  when one grows the seam.
- **Lead, not landed** (source note #4): activation-edge rules for stt-pipeline's
  endpointing section - external triggers never debounced, busy-window presses
  remembered with parity, one machine for push-to-talk / toggle / hold-or-toggle.
  Real gap; unapplied by construction today.
- Untriaged and flagged for `decode-time-vocabulary-biasing`: the source runs a
  guarded post-decode fuzzy correction as the fallback for engines that accept no
  decode prompt (25% length ratio, punctuation boundary, no phonetic boost on
  numerics, ASCII only) - a discriminator candidate for that technique's "won for one"
  argument, not a contradiction.
