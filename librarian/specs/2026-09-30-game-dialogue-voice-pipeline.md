# XL spec - `game-dialogue-voice-pipeline`

- **Run:** `in-el-0930` (intake of a speech-model release announcement, 2026-09-28 release, plus the vendor's
  model and changelog documents fetched in-run).
- **Source that surfaced the gap:** vendor release page (class: vendor release announcement). It
  **originates** the subject and authorizes nothing in it. The release opens two capabilities a game can use
  that were not reachable before: a low-latency variant (median first speech ~150 ms per the vendor's own,
  unverified comparison) for runtime NPC speech, and expressive multi-speaker rendering across 90+ languages
  for baked lines. The subject is written from the *decisions* those open, corroborated from primaries and
  training-data convergence, with the vendor's latency table treated as a lead until measured.
- **Status:** PROPOSED

## Why XL

Game-production has `spatial-audio-scene-authoring`, `adaptive-music-authoring`, `branching-narrative-graph-
validation` (whose `node-text-budget-and-localization-surface` counts text, not voice) and
`agent-behaviour-authoring`. `research-map` on "game npc dialogue voice" returned voice-io and brand-voice,
i.e. **no game-production subject owns spoken dialogue**. Five design candidates share this home.

## Placement (verified against the authority)

`knowledge/game-production/taxonomy.json` is the authority. Category `motion-and-audio` (under
`asset-production`) holds 3 subjects (`adaptive-music-authoring, motion-quality-gating,
spatial-audio-scene-authoring`), under `MAX_CHILD_DIRS` 10.

- Resulting path: `knowledge/game-production/asset-production/motion-and-audio/game-dialogue-voice-pipeline/`.
- Append the slug to that category's `subjects` array. Append, do not reorder.
- Verify link depth against a sibling subject in the same category, do not compute it.

## Proposed techniques (each must carry a decision rule)

1. `bake-versus-runtime-speech` - each spoken line has a class. Authored story beats are baked and accepted
   offline; reactive barks and unbounded conversation are generated at runtime under a latency budget.
   Rule: decide per line class from three questions - can the text exist before play, does a wrong read
   break a story beat, does the line repeat - and record the class in the catalog. Runtime speech inherits
   the budget from `voice-io`'s real-time-synthesis-budget by name in prose (different bundle: no link) and
   adds the game-specific stall: what plays when the stream is late (a pre-baked filler read, not silence).
2. `line-id-catalog-and-revision-diff` - every line has a stable id, a speaker, a script revision and a
   render revision. Rule: a script change is diffed by id and re-records exactly the changed lines; a
   render-model change is a catalog-wide re-render event handled by `re-cast-gate`, not a silent overwrite.
3. `localized-voice-timing-budget` - translated speech is longer or shorter than the source, and a line is
   attached to a fixed-length animation, a lip-sync clip or a cutscene beat. Rule: the budget is a duration
   per line, declared in the catalog; a locale render outside it is re-worded before it is re-rendered or
   sped up. Cite `delivery-rate-budgeting` in prose as the media-side twin (different bundle: no link).
4. `cast-ledger-with-consent` - the game's voices are a ledger: role, voice asset, model generation it was
   made under, and the recorded consent of the person it was cloned from. Rule: no line renders against a
   voice with no ledger row; a voice made under an older model generation is flagged for re-cast, not
   assumed. State that clone consent is a precondition, not a feature.
5. `re-cast-gate` - a speech-model upgrade is not a version bump. Rule: render the same twelve reference
   lines under old and new model, blind triage on a listening board, and accept per voice; voices that fail
   stay pinned to the old model id, which the catalog records per line. Corroborate the *fact* that older
   voice clones need retraining on the newest model and that one previous generation did not support the
   professional clone type, from the vendor's FAQ and model list.

## Boundaries this subject must state and must NOT absorb

- `spatial-audio-scene-authoring` owns where a sound sits in space and how it is occluded; this owns what is
  said and how it is produced. Spatialization of a rendered line is theirs.
- `branching-narrative-graph-validation` owns the graph and its text budget; the line-id here must be the
  node id they already validate, not a second identifier.
- `generative-provider-auditing` owns whether a provider's declared capability is real; technique 5 uses the
  same audit stance for the model-upgrade claim.
- Do not restate render acceptance; point at the listening board in prose (different bundle: no link).

## Trees to reconcile read-only (never edit)

The game-production fleet project's audio-generation provider (sound effects only today; state that the
subject has no voice consumer in the fleet and say what would be a seam if it grew one). Any content
catalog it keeps with per-item ids is the shape to compare technique 2 against.

## Primaries (~6 fetches)

The vendor's model list and FAQ for the newest speech models, its streaming / realtime documentation, its
dubbing documentation for localized timing, its pronunciation-dictionary documentation. Prefer vendor
documents; a game-audio middleware document is admissible for the bake-versus-runtime rule.

## Open questions the drafter decides, not discovers

- Whether technique 5 belongs to this subject or is better as an amendment to `generative-provider-auditing`.
  (Default: here, since its trigger is a production catalog re-render.)
- Whether the fleet has no VO consumer means every application is a `simulation`-grade reading. (Default: yes,
  and the subject says so in its opening paragraph; applications only where a tree was opened.)
