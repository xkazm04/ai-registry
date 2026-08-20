---
layer: application
type: application
subject: creator-voice-and-tone
technique: voice-profile-from-accepted-work
stack: process
status: forged
verified_on: 2026-08-19
---

# Process: the gravitone-gcloud voice-profile loop and schema

The gravitone-gcloud studio specifies profile learning as a documented process in
`knowledge/TONE.md:122-151` and realizes the profile object concretely in
`pipeline/runs/2026-08-11-why-bitcoin-price-does-not-rise/tone-profiles.json`. The
two together are a working reference for this technique before any UI exists.

## The documented loop (TONE.md §4)

Five numbered rules, each mapping directly to the technique's disciplines:

1. **Seed from 3–5 scripts the creator likes** — back catalogue or nominated
   exemplars — measured with the same corpus scripts used throughout the library
   (`corpus/metrics.py`), so profile numbers and corpus ranges share a counter.
2. **Store a profile per creator × format** — justified upstream by TONE.md §1's
   measurement of one presenter running materially different dials across two of
   their own formats.
3. **Update on acceptance, not on generation** — "a generated draft they rewrote is
   evidence about the model, not about them."
4. **Learn the delta** — "if they consistently cut hedges the tool inserted, that is
   a tone fact"; diffing accepted-vs-generated is named as the stronger teacher.
5. **Show the profile as numbers with their sources** — "Your rate: 212 wpm, from 6
   accepted scripts."

TONE.md:141-151 then designs against the three failure modes by name — drift to the
mean (guard: accept-only + periodic re-anchor against the seed set), learning
structure by accident (guard: engine usage stored as observation, never default),
and over-fitting to a hit (guard: weight by count, not performance, because the
studio "has no reliable performance signal at prototype stage").

## The profile schema in practice (tone-profiles.json)

The experiment's two profiles instantiate the schema the loop will fill:

- `dials` holds exactly the six legitimate numeric dials, each as
  `{target, note}` — the notes tie targets to measured corpus bounds ("at or just
  above the highest MEASURED (8.3)"), which is the sourced-numbers rule applied to
  declared profiles.
- `reference_world.permitted` / `.forbidden` and `signature_bookends.open` /
  `.close` carry the two non-numeric identity components as data; the bookend note
  ("Template slots. Never generated fresh. The close is NOT the reframe") encodes
  the slot discipline directly in the artifact.
- `deliberately_not_dials` (lines 99-104) lists hedging, numeric, and causal
  density with their owners — the dial/subject-property partition is present *in
  the schema*, not only in prose.
- `declared_persona_furniture.exposure_disclosure` records a profile × engine
  compatibility fact: the hard-zero-`I` profile carries `false` with a note that "a
  narrator with no 'I' cannot declare exposure" — a measurable honesty cost of a
  dial setting, caught at declaration time.

## The measurement caveat the process surfaced

TONE-TEST.md §3 (same run) found the loop's validation step has a scale hazard: the
corpus counter `numbers_per1k` matches digits only, while written render prose
spells numerals out — 4.3/1k vs 36.2/1k on the same text. A profile loop that
validates renders against caption-derived corpus baselines without unifying the
counter compares incommensurable units. The transferable rule: before the accept
loop's first update, prove the seed measurements and the render measurements share
one counter.
