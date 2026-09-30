---
source: web:elevenlabs.io/v4
kind: web
url: https://elevenlabs.io/v4
title: Eleven v4 and Eleven v4 Turbo text-to-speech models
author: ElevenLabs (vendor)
words: 2261
extracted: 9
accepted: 3
declined: 0
leads: 3
already_covered: 2
untriaged: 1
dispatched: 2
applied: 8
shipped: 5
run_id: in-el-0930
siblings: 0
fetches: 2
rescan_when: a fleet tree moves off the pinned generation, or a listening-board measurement of identity stability or first-speech latency exists; or 8 weeks elapse (2026-11-25)
---

# A model id that moved under fifteen trees, and two subjects the corpus had no room for

**Class:** vendor release announcement, with the operator's ask extending it to a fleet impact pass. Expected
yield: currency and leads, with the fleet seam hunt as the second source. Its numbers (100 ms inference, 150 ms
first speech, a comparison table against two other vendors) are the vendor's own and unmeasured here.

**Fetches (2 of 3):** the vendor's model overview and its changelog. Both came back through a summarising
reader, so ids were quoted, not paraphrased; the changelog fixes the release at 2026-09-28 with `eleven_v4` and
`eleven_v4_turbo`, SDK `@elevenlabs/elevenlabs-js` 2.70.0 and `@elevenlabs/react` 1.15.2+.

## Candidates

| # | Candidate | Shape | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- |
| 1 | Fleet trees pin four older generations (v3, multilingual v2, turbo v2.5, flash v2.5) | currency + apply | real gap | 2/0/1 | accepted - five one-line bumps |
| 2 | Direction tags are an engine dialect; the break tag is disabled in v4 | technique | real gap | 3/1/2 | accepted - forged in `multi-speaker-speech-production` |
| 3 | A cloned voice is an artifact of a model generation; pre-v4 clones need retraining | technique | real gap | 3/1/2 | accepted - `voice-asset-model-generation-binding` + `re-cast-gate` |
| 4 | Identity stable across regenerations (line-level re-render) | claim | thin | - | lead: vendor claim, n=0; written as a check, not a fact |
| 5 | ~150 ms first speech vs two other vendors | claim | thin | - | lead: return when measured on this fleet's own path |
| 6 | 90+ languages, 10,000 characters per generation | dated fact | partial | 1/0/1 | landed inside chunk-boundary-continuity as "read the cap from the model list" |
| 7 | Consent verified for every clone | claim | likely catch | - | already covered by authored-voice-identity boundary; one paragraph in the new subject |
| 8 | Pronunciation dictionary and IPA | claim | likely catch | - | already covered (speech-ready-text) - lexicon-as-dictionary kept as its own technique only for the revision trigger |
| 9 | Pricing and free-tier credits | dated fact | thin | - | untriaged: marketing, no shelf-stable content |

**Routing count:** the release page is not a design-deep source, but the fleet seam hunt plus the corpus map
produced five game-production candidates sharing one home (no subject owns spoken dialogue) and five
media-generation candidates sharing another, so the XL trigger fired twice. Both were forged in-session.

## Landed

- `media-generation/audio-generation/multi-speaker-speech-production` - 5 techniques, 3 applications (studio-story,
  v, hyper trees, read at their committed heads; anchors 15/15 held).
- `game-production/asset-production/motion-and-audio/game-dialogue-voice-pipeline` - 5 techniques, 3 applications
  against the game-production fleet tree (anchors 26/26 held). The fleet has **no voice consumer**: speech is a
  declared kind that the provider registry refuses. The subject says so in its opening.
- Specs: `librarian/specs/2026-09-30-multi-speaker-speech-production.md`,
  `librarian/specs/2026-09-30-game-dialogue-voice-pipeline.md` (both EXECUTED).
- Overrides the workers argued and the director kept: the latency figure is ~100 ms inference and excludes
  application and network time (spec said 150 ms); the line id is the node id plus a variant marker; a pinned old
  model id needs a retirement clock and fails loudly; timing is budgeted in seconds per locale, not words.

## Scope correction (operator, 2026-09-30): most of these trees are not registered

The impact scan below listed sibling directories instead of resolving `projects.json`. Of the trees named in
this note, only athena-everywhere, pof, kp, gravitone, personas and pumper are registered. hyper, story,
studio-story, v, vaai, firetv, moderator, athena-portable and saber-arpg are **not**: the registry has no
connection to them, no map, no applied ledger and no authorization to change them. The five model-id commits in
hyper, story, studio-story, v and firetv are kept at the operator's word, but they are out-of-registry history.
Future intakes and operations resolve impact through `loadFleet()` only and do not build on them. The three
applications that cite these trees stand as read, and are a candidate for rewriting against a registered tree.

## Fleet impact (coverage ships on the recommendation; never pushed)

Fifteen trees mention the vendor; nine call it. Model ids found: `eleven_v3` (hyper, story),
`eleven_multilingual_v2` (v, vaai, studio-story, athena-portable), `eleven_turbo_v2_5` (firetv),
`eleven_flash_v2_5` (athena-everywhere, moderator), sound-effects model `eleven_text_to_sound_v2` (gravitone,
story, pof), music endpoints (gravitone, story), agents SDK (kp).

Committed locally on each tree's active branch, one line each, pathspec: hyper, story, studio-story (to v4),
v (to v4), firetv (turbo v2.5 to v4 turbo). **Proof status: `structural-only`.** No SSML in use in any of the five
(the one markup v4 disables), the ids are the vendor's own, voice settings kept. No behavioural arm ran: no key in
this shell and the corpus rule is that the pair is graded by ear.

**Not changed, and why**
- athena-everywhere and moderator (flash v2.5): the documented latency of the flash model is lower than v4 Turbo's,
  their forces are latency and price, and a swap needs a first-speech measurement first. Different forces.
- vaai (dirty tree on a sync branch, a retired route directory) and athena-portable (dirty, an example script that
  reads its model from an environment variable): left alone.
- SDK pins: `v` and `vaai` declare `^2.2.0`, which already admits 2.70.0; the lockfile decides. kp declares
  `@elevenlabs/react ^1.15.2`. Not bumped: a lockfile change belongs to the owner's install step.
- Music and sound-effects consumers: the changelog shows `music_v2_5` and a finetune endpoint; whether the fleet's
  music routes pin an older generation was not read this run.

**Owed before these commits are trusted**
- Voices created before v4 need retraining on v4 (vendor FAQ). hyper, story, studio-story and v all render
  existing voice ids; a retrained voice list is the return condition, and it is exactly the finding technique 3
  now says.
- v caches renders keyed on text and voice only, so a model bump leaves old-generation lines cached beside
  new-generation lines. Recorded in the application; not fixed.

## Directions not proposed

None. The fleet has no game voice consumer; a direction would be a feature request, not a force the scope names.
Candidate for the next fleet map: pof, when a speech kind is admitted.

## Leads (return conditions)

- Identity stability across regenerations: when a listening-board measurement (ten renders of one line) exists.
- First-speech latency table: when measured on the fleet's own path with network time included.
- Music generation generation (`music_v2_5`, finetunes): when a fleet music route is read for its pinned model.

## Untriaged (nobody verified these)

- Pricing and free-tier credit numbers (dated, marketing surface).
