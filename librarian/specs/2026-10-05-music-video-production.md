# XL spec - `music-video-production`

- **Run:** `intake-1005-bkdr` (intake of a practitioner tutorial video plus an operator dispatch:
  *"research and forge path of music clips making for existing audio tracks"*).
- **Source that surfaced the gap:** `youtube:BKDrtzJktO0`, a creator walking through the workflow they used
  for one generated music video (class: practitioner build-walkthrough, tour-dominant, with a vendor demo
  half). It **originates** the subject and authorizes nothing in it. Every technique is corroborated from
  primaries fetched by the drafter, from the connected tree named below, or from training-data convergence
  with the boundary stated. The source's own operating half (what happened to them, not what the tool does)
  is anchored in the source note `librarian/sources/2026-10-05-music-video-suno-seedance.md`.
- **Status:** EXECUTED 2026-10-05 (one forge worker). Technique 3 (`performer-stem-conditioning`) WITHDRAWN 2026-10-07 after the render proof (n=1, no seed control; operator: stem on the full clip, tie on both close-ups) - banked as `librarian/handoffs/2026-10-07-performer-stem-conditioning-draft.md`. Overrides accepted: stack `next` for the gravitone application (Web Audio offline render); seek-stable-composition-authoring cited for frame-index determinism only; technique 5 cites generated-shot-sourcing for the scouting counter-case; technique 3 narrowed to shots with a readable mouth (the primary says accompaniment drives head, expression and eyes). Director addition: the delivery section gained the peak-capped linear gain rule from a paired experiment in gravitone.

## Why XL

The operator asked for a path, and the corpus has none. `research-map` on "music video", "lip sync to
existing track", "vocal stem isolation", "performance video" and "shot list from song structure" returned
only neighbours that point the other way or own one stage:

- `trailer-structure/cue-first-assembly` and `live-system-demo-film/audio-first-beat-pacing` both state
  *audio first, picture fitted to it*. Neither has a performer whose mouth must match a voice, and in both the
  audio is still a choice (a cue is selected; a narration is generated). Here the track is **given, locked
  and somebody else's finished work**: it is never re-cut, re-timed or regenerated.
- `video-assembly/music-spotting-against-picture` runs the inverse direction: music placed against a locked
  picture.
- `music-prompt-composition` makes the track. Out of scope: the track exists.
- Zero documents in `knowledge/` mention lip sync for a generated performer; zero mention "eye trace".

Four design candidates from the source plus the operator's dispatch share this one home (the XL trigger
fires mechanically): per-performer stem conditioning, segmenting a song longer than a generator's clip
cap, model-cut multi-angle clips versus editor-cut coverage, and fast-cut legibility. A subject exists by
construction.

## Placement (verified against the authority)

`knowledge/media-generation/taxonomy.json` (`layout: "nested"`). Category `production-ops` holds 5 subjects
(`live-system-demo-film, platform-format-adaptation, production-pipeline-phasing, review-iteration-loops,
video-assembly`); `MAX_CHILD_DIRS` is 10. Origin/main also holds 5 there.

- Resulting path: `knowledge/media-generation/production-ops/music-video-production/`.
- Append the slug to `production-ops.subjects` in `taxonomy.json`. Append, do not reorder.
- Copy link depth to `_laws.md` from `live-system-demo-film` (same category, same depth), do not compute it.
- `live-system-demo-film` is the structural precedent: one film genre, owned end to end as a subject, whose
  techniques cite the general subjects rather than restating them. Follow that shape.

## Proposed techniques (each must carry a decision rule)

1. `track-map-before-treatment` - the locked track is analysed once into a map on the master clock, and
   that map is the brief every later stage reads: section boundaries (intro, verse, pre-chorus, chorus,
   bridge, outro), a bar and beat grid, an energy curve, and a **vocal activity map per voice** (lead,
   backing, ad-lib, none) over time. Rule: every shot is addressed as (section, bar, beat) resolved to master
   time, never as seconds read off a waveform by eye. Tempo is candidates with octave siblings, never one
   number (primary: beat-tracking literature on octave errors; the consumer tree below already does this).
   Section boundaries are a separate analysis from onsets (primary: structural segmentation by novelty /
   self-similarity in the music-information-retrieval literature). State that the vocal activity map is
   the input technique 3 consumes.
2. `form-follows-what-the-track-gives` - the treatment is chosen from a ladder of forms, cheapest first:
   visualizer (one image plus audio-reactive motion), lyric video, performance, narrative, concept, and the
   hybrid where verses carry story and choruses return to performance. Rule: the form is decided by two
   facts, not taste: what the track gives (vocal-forward or instrumental, lyrics that tell a story or
   repeat a hook, length) and what the pipeline can keep in sync (no reliable lip sync means no
   performance form, whatever the brief wants). Primary: music-video scholarship on the
   performance/narrative/concept split and on editing that follows song sections. State the boundary with
   `narrative-engine-selection` (that one picks a story engine for any video; this one decides whether
   the video has a story at all, and how much screen time the performance takes per section).
3. `performer-stem-conditioning` - **RENDER-BOUND; held for the director's render verdict.** Every sung
   shot is conditioned on the isolated stem of the voice that performer sings, sliced from the master clock,
   never on the full mix; the mix is restored in post and the generator's own audio is discarded. The
   source's failure case: a performer mouthing the ad-libs and an instrumental intro because the
   conditioning audio carried them. Rule: the conditioning track holds exactly the voice the face on screen
   owns, for exactly the interval the shot covers; silence in that stem is the instruction to keep the
   mouth closed. Corroborate from the audio-driven portrait and singing-animation literature (whether
   published systems separate vocals before driving a face, and what they report on accompaniment). Include
   the real-production analogue the drafter can corroborate: playback on set, and sped-up playback for
   slow-motion lip sync, whose generative equivalent is that a conditioning slice for a slowed shot must be
   time-stretched by the same factor. **Write this technique in its own file and list it in the golden
   path; the director will remove it and bank it as a lead if the render verdict does not support it.**
4. `segment-on-the-master-clock` - a song is longer than any generator's clip cap, so it is generated in
   segments. Rule: cut segments at phrase boundaries from the track map with handles before and after,
   every segment carries its master-clock offset as data, and reassembly places by offset, never by eye.
   Name the drift arithmetic (a clip's frame count at the generator's frame rate against the slice's sample
   count) and the check that catches it. State the boundary with `video-assembly/drift-correction` (which
   owns rate mismatch in general) and `multi-speaker-speech-production/chunk-boundary-continuity` (speech,
   where the cut chooses the content; here the content is fixed and only the cut moves).
5. `coverage-across-the-phrase` - live music-video production shoots each setup across the whole song
   against playback and the editor cuts across setups; every take is in sync with every other because all
   ran against one clock. Rule: generate each phrase from several setups with the same conditioning slice so
   any cut point is already in sync, and let the cut points come from the track map, not from the generator.
   The source's proudest segment - one generation asked for fifteen hard-cut angles, a cut every second -
   is the counter-case to write up: the model places its own cuts, they are on its clock and not the
   track's bars, and the result is a **scouting pass** (find the angle you like, then generate it as
   coverage), not final coverage. Keep the generator-instruction half of this small and flag it
   render-unverified in your report; the editorial half (who owns the cut points) is the rule.
6. `cut-rate-follows-the-section` - cut frequency is set per section from the map (energy and tempo), on
   bars and downbeats rather than on every onset, and fast cutting stays legible only when the subject holds
   one screen position across cuts so the eye does not search after each cut (primary: the editing
   literature on eye trace). Rule: before a section is cut faster than about one cut per bar, check that
   the subject's screen position is stable across the section's shots; where it is not, slow the cut or
   re-frame. State the boundary with `cinematic-language` (which owns what each angle means; this owns how
   fast angles may follow each other to this track).

Fold into the golden path, not into techniques: the master track is delivered bit-identical (no
re-normalization, no generator audio in the deliverable); the sync-rights precondition for a track the
producer does not own (one paragraph, cite `generated-music-acceptance/rights-and-provenance-record` by
name, do not restate it); the ordering of the whole path (map, form, cast and sets, segment plan, coverage,
cut, deliver).

## Boundaries this subject must state and must NOT absorb

- `character-identity-continuity` owns casting a recurring performer (sheets, references, identity
  rulers). The source's face, outfit, sheet workflow is that subject's material, not this one's.
- `cinematic-language` owns angle and movement vocabulary. The source's angle list is a catch there.
- `video-assembly/generated-shot-sourcing` owns where a shot comes from (sets invented by the video model
  versus image-generated plates). Cite it.
- `platform-format-adaptation` owns derived shorts (the source's thirty-second promo cut).
- `music-prompt-composition` and `generated-music-acceptance` own making and accepting a track. This subject
  starts after the track is final.
- `video-assembly/seek-stable-composition-authoring` owns deterministic audio-reactive rendering; the
  visualizer rung of technique 2 cites it.

## Tree to reconcile read-only (never edit)

The fleet project with a music-video discipline: `gravitone` (resolve through `loadFleet()` in
`scripts/lib/projects.mjs`; never construct the path). Read `lib/audioEnvelope.ts` (baked envelope:
bands, flux, onsets, tempo candidates), `app/_phases/research/useMusicVideoSource.ts`,
`app/_phases/frames/music-video/compositor.ts` and `useMusicVideoComposition.ts`,
`app/_phases/cut/music-video/useMusicVideoExport.ts`. It sits on the visualizer rung. You may write ONE
application, `node--track-map-before-treatment.md` or with a `--gravitone` suffix if that filename exists,
recording what its envelope carries and what it does not (section boundaries, vocal activity), with
`file:line "quote"` anchors that `node scripts/check-anchors.mjs <doc> --root <gravitone path>` will
resolve. Set `verified_on: 2026-10-05` only for anchors you resolved. Do not write `applied:` or
`ab_verdict:` - the director owns Phase 7.5.

## Primaries (the drafter's web budget, about 8 fetches)

Prefer primary documents over commentary: a structural-segmentation paper (novelty or self-similarity);
a beat-tracking paper or survey that reports octave errors; one or two audio-driven portrait or singing
animation papers (look for whether they separate vocals and what accompaniment does to sync); a
music-video scholarship source on form and editing to song structure; a source on eye trace in editing;
a practitioner or production source on playback and sped-up playback for slow-motion lip sync. A vendor
document for a reference-conditioned video model's audio-reference limits may be cited in an application
only, never in a technique.

## Open questions the drafter decides, not discovers

- Whether 4 and 5 are one technique. (Default: two. One is about the clock, the other about who owns the
  cut points.)
- Whether 6 belongs in `video-assembly`. (Default: here, because its rate is read from the track map.)
- The slug. (Default `music-video-production`. Override with an argument if the opening sentence of the
  golden path reads better under another.)
