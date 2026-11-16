---
layer: application
type: application
subject: game-dialogue-voice-pipeline
technique: line-id-catalog-and-revision-diff
stack: cpp
status: forged
verified_on: 2026-11-16
verified_against: cpp@20
---

# A VR game's voice cue sheet: catalog-minted ids, a missing take as a state, no render revision

Read against the fleet's VR arena project (mage-arena) at commit `579737e`, opened read-only on
2026-11-16. The engine is Unreal (the import tool points at a 5.8 editor). No take exists yet:
audio production is deferred by an owner ruling, so this reads a catalog with every render
field empty. It is the fleet's first game tree with a real per-line voice catalog, and the
subject's first application outside node.

## What the tree does that the technique wants

- **Ids are minted by the catalog, independent of text.** One row per cue in
  `apps/vr/art/audio/voice/manifest.json` with `id`, `text`, `speaker`, `words`, `file`; the
  `_fields` note: "id: the cue id (also the strings.json _story.* marker, C2 section 10)".
  The script rule makes every line carry one, voiced or not: `docs/campaign/05-c2-slice-story-bible-and-script.md:466`
  "`cue` joins a line to the cue sheet in section 9. Every line has one, voiced or not".
  The loader refuses duplicates: `apps/vr/Game/Source/MageArenaVR/Session/VoiceLines.h:42`
  "Strict: version 1, a cues array, every row with an id, text and file, and no id twice."
- **The file is named from the id,** never the reverse: `<speaker>/<cue>.wav`, imported as
  `/Game/Audio/Voice/<id>` (`apps/vr/art/audio/voice/SOURCE.md`).
- **A missing take is a state.** `apps/vr/tools/import-voice.ps1:4` "A row with no WAV yet is
  counted as missing, not failed." At runtime a cue with no asset is skipped and the text
  carries the beat, under a test: `apps/vr/Game/Source/MageArenaVR/Tests/VoiceTests.cpp:231`
  "MageArena.Voice.MissingAssetNoStall". This is the bake technique's text-first stall rung
  made the default (the script: "Voice is additive").
- **Output identity by hash.** The import is idempotent by the source file's MD5
  (`import-voice.ps1:3`), one element of the technique's `render_rev`.

## Deviations (the standard stays)

- **No render recipe.** `generated`, `service` and `voiceId` are reserved and null on every row;
  model, settings and pronunciation rules have no field, so a model change could not be told
  from a re-render of the same recipe.
- **One revision.** Text is copied verbatim from the script with no script revision; an edit
  in the script document would not mark the take stale.
- **No diff** between two states of the sheet.
- **Timing is two numbers, neither a measured take.** Each line has a text dwell in seconds
  (`apps/vr/data/vr/story/slice.json:34` `"dwellS": 12`) and a word cap
  (`VoiceTests.cpp:139` "MageArena.Voice.TenWordsOrFewer"); a take longer than its dwell would
  not be caught. Single locale, so the per-locale half does not arise yet.

## Seam

Fill the three reserved fields as a `render_rev` (model, voice, settings, output hash) when the
ruling lifts, add a script revision beside `text`, and have the import compare a take's
measured length with the line's `dwellS`.
