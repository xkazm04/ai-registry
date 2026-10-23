---
subject: multi-speaker-speech-production
domain: media-generation
last_touched: 2026-10-21
dry_streak: 0
---

# multi-speaker-speech-production

First note. The subject was forged on 2026-09-30 by `/intake` (elevenlabs-v4)
and widened on 2026-10-14 with the multi-voice call section and a dated field
read. It had never been swept. A Curator dispatch ranked it on "never swept by
the librarian".

## State

5 techniques, 4 applications (3 `node` against unregistered kiro siblings
hyper, studio-story and v; 1 `process` field read of one vendor's documents).
No new technique this pass; the changes are one refuted statement and three
added conditions.

## 2026-10-21 - deepen (msp-deepen-1021)

Landed in 2d634e14. Three lanes: counter-evidence (web), a volatile-facts
re-read of the vendor documents from raw page markdown, and a blind
training-data lane. The consumer trees were checked as a fourth instrument.

- **Per-turn segments address the output, not the re-render.** Refuted the
  field read's "no per-turn timing is documented": the multi-voice endpoint
  has a with-timestamps variant whose `voice_segments` carry a
  `dialogue_input_index`, "Line of the dialogue (script) that this segment is
  a part of" (raw page, both web lanes). The golden path and the line-addressed
  technique now say the segments give a grouped call's lines an address for
  review, subtitles and timeline, and that a turn spliced at a segment boundary
  is a seam inside one performance, so it passes only on the ten-take check and
  the seam audit. The blind lane reached the same place independently (treat a
  dialogue render as one take, recover line positions by alignment).
- **Continuity references expire.** The stitching guide, read raw: "Request
  stitching is not available for the `eleven_v3` model" and "The request IDs
  should be no older than two hours." The line-addressed and chunk techniques
  now say a later revision cannot condition on its neighbours' requests and
  falls back to text, which does not expire, and that the key records which
  input a re-render got. The blind lane flagged the same tension (context makes
  a chunk depend on its neighbours).
- **Clone binding, sharpened.** The previous generation was "not fully
  optimized" for professional clones, not unsupported; the field read and the
  technique had been stricter than the vendor. Moving a clone to the newest
  generation is an owner-started fine-tune, and the vendor itself says a v4
  clone "may sound quite different from its Eleven v3 version", which is the
  technique's premise in the vendor's words. New per-generation clone controls
  join the render key.
- **Pin the dictionary version; read phonetic support per mechanism.** An
  unnamed version takes the latest. The dictionary guide lists phoneme rules on
  three models and says the rest skip them silently, while the best-practices
  page scopes inline phoneme tags to one. The pages do not reconcile; the
  technique now reads each mechanism separately.
- **Applications re-checked.** 15 of 15 anchors held under
  `check-anchors --strict`; the three consumer HEADs are the commits the
  applications cite. `verified_on` moved to 2026-10-21 on all four.
- **Verified untouched:** cut at turns and never mid-sentence, neutral
  direction compiled per generation, the break tag gone on the two newest
  generations, the 10-voice and 2,000-character limits of the multi-voice call,
  best-effort seed, the 3-locator dictionary cap. The blind lane converged on
  all five techniques; no source refuted a rule.

## Impact

- shadowrunr (kiro/overlord): 1 context joins (`voice-sidecar`), state
  unknown, 0 judged pairs, so 0 stale verdicts and no `/conform --stale`
  queue. The sidecar is a runtime, per-sentence local engine; none of this
  pass's conditions reaches it.
- gravitone-gcloud: 1 context joins (`landing-cosmos-scenes`), state unknown,
  0 judged. The join is on generic words ("engine", "scene", "production");
  probably a false join.
- Maps for overlord, gravitone-gcloud and systedo-case regenerated and
  committed locally on their active branches, not pushed (each carries sibling
  commits ahead of origin).

## Open leads

- **The seam a segment splice makes.** Whether a single-turn render spliced
  at a returned segment boundary passes a seam audit is unmeasured. Return:
  the first project that renders a scene in one multi-voice call, with a paid
  render arm and the operator's key.
- **Speed sent to a generation without it.** story's route passes `speed` to
  the newest generation, whose page says the speed slider is not available.
  Whether the API ignores it, rejects it or honors it was not measured. Return:
  the next touch of that route, or any render arm on the newest generation.
- **Second-vendor dialect.** The counter-evidence lane reported, through a
  summarizer only, that another vendor's multi-voice speech takes at most two
  prebuilt voices, keeps style out of the spoken text, and uses angle brackets
  for inline tags. That would confirm the dialect technique's "separate
  parameter" case. Not re-fetched raw, so not landed. Return: a raw read of
  that vendor's speech-generation page.
- **Consent trigger.** Secondary sources on the 2025 interactive-media union
  agreement put the consent trigger on a new project, not on a model retrain.
  The primary PDF returned 403. Return before the binding technique cites any
  agreement.
- **Loudness and room tone across takes.** The blind lane ranked these the most
  missed. The seam audit names level and room tone but sets no target. A
  loudness target is a delivery standard and may belong to the acceptance or
  assembly subject. Return: a sourced pass on loudness targets for spoken
  deliverables.
