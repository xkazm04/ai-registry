---
name: demo-film
description: Make a voice-first demo film or product video of a working app, compiled by Remotion from one film script - real app footage on one lane, motion graphics (a typed plate library plus 1-3 bespoke hero compositions) on another, ElevenLabs narration measured before anything is recorded, and cue-spotted ElevenLabs music beneath. Use when asked for a demo film, product video, launch or explainer video, motion graphics over app recordings, ElevenLabs narration for a screen recording, a Remotion cut of a live system, or an ad cut of an existing film. The cut is a command, not an editing session - narrate, music, capture (consumer adapter that asserts its claims and logs element rects), check, render at a balance (overlay, sandwich, led). Spend-guarded, key never printed. Invoke with /demo-film <film-dir> [narrate|music|check|render] [--balance b].
category: workflow
memory: project
version: 0.1.1
argument-hint: "<film-dir> [narrate|music|check|render] [--balance overlay|sandwich|led]"
---

# demo-film - voice first, recorder asserts, the cut is a command

A demo film of a live system is the one film whose picture is evidence. This skill is the kit
that makes that film a build artifact: one script (`film.json`) drives the narration, the music,
the capture and the Remotion cut, and every step is a command a person can re-run when the
product moves. The craft behind it lives in the registry knowledge corpus:
`knowledge/media-generation/production-ops/live-system-demo-film` (the method) and
`knowledge/media-generation/production-ops/video-assembly` (lanes, sync, loudness). Read the
first before a new film; read the second whenever a film has more than one lane, which with
this kit is always.

## Doctrine

1. **Voice first.** The narration is generated and *measured* (ffprobe, integer ms) before
   anything is recorded. Each beat holds for `max(clipMs, settleMs) + breathMs`; the capture
   paces itself to those holds and the cut is timed from them. A beat with no current clip
   is held on an estimate (15 characters per second) and is listed in `estimated` so nobody
   mistakes it for a measurement.
2. **The recorder asserts.** The capture adapter drives the real app beat by beat and checks
   what the film claims (an offer below the ceiling, a banner on screen). An assertion that
   fails is recorded and the take carries on; the run fails at the end, with the beat named.
   Figures a plate shows come from the run's `record`, never typed by hand.
3. **The cut is a command.** No editing session. Changing one line re-synthesises one clip,
   re-times the film and re-renders; nothing else is touched.
4. **More than one lane inherits video-assembly.** Picture, motion, voice, music, fx are
   lanes; sync is a measurement; loudness is delivered to a number (-14 LUFS, -1 dBTP);
   music ducks under voice. The render prints what it measured.
5. **Balance tiers.** Every moment carries a tier 1-3. One script, three renders:
   `overlay` (tier 1 only, ~15% motion over footage), `sandwich` (tiers 1-2, ~30%, footage
   framed in a device), `led` (all tiers, ~60%, motion leads and footage confirms). Render
   all three for a new film and let the operator pick by watching, not by argument.
6. **Library plus bespoke hero.** Plates, treatments and transitions come from the kit
   library (frame-pure, StyleLock-driven). A film may add 1-3 bespoke hero compositions in
   the consumer's `film/local/`; a fourth is a sign the library is missing a plate.
7. **Promise ledger.** A moment with a `claim` makes a capability promise; it must sit in,
   or immediately before, a beat with `capture` footage that backs it. `check` fails a claim
   with no footage behind it. Motion may dramatise; it may not assert alone.
8. **An ad cut is re-authorship, never a trim.** A 20-45 s ad is a new script written via
   `knowledge/media-generation/narrative-craft/ad-concept-development` (concept sentences
   under a template mechanism, operator locks one), then narrated and rendered like any
   film. Cutting the long film down produces a film with no idea in it.

## Consumer contract

Everything the kit reads or writes is typed in `tools/src/contract.ts` (Zod, erasable
TypeScript, imported directly by Node 24 and bundled unchanged by Remotion). Absent values
are omitted keys, never `null` or `0`; durations are integer milliseconds.

A consuming repo owns a film directory (conventionally `film/`):

```text
film/
  film.json            FilmScript: title, voice, breathMs, maxMs, music.cues (<= 3), style, beats
  style.json           optional: the StyleLock, when kept out of film.json
  local/index.tsx      the consumer's bespoke heroes, imported by the kit as @film/local
  audio/               written by narrate and music (manifest.json, <beatId>.mp3, music-<cue>.mp3)
  take/take.json       written by the consumer's capture adapter (Take)
```

- `audio/manifest.json` (AudioManifest): `clips[beatId] = {file, ms, hash}`,
  `music[cueId] = {file, ms, hash}`, `estimated: beatId[]`. `file` is relative to the film
  directory (`audio/open.mp3`).
- `take/take.json` (Take): the recording, its size and fps, `offsetUncertaintyMs`, and per
  beat `startMs`, `endMs`, `rects[selector]` in video pixels, `clicks`, optional `record`
  and `error`. Beat ids are FilmBeat ids.
- The capture adapter is the consumer's code (it knows the app). It reads `film.json` and
  the manifest for holds, drives each `capture.beat`, logs the rects of `capture.targets`,
  and writes `take/take.json`. A beat without `capture` is a pure motion beat.

## Commands

Install the kit's own dependencies once (they never enter the consumer's package.json):

```bash
cd <skill-dir> && npm ci
```

Then, from anywhere, with `<film-dir>` the consumer's film directory:

```bash
node <skill-dir>/tools/narrate.mjs <film-dir> --dry         # plan: estimates, chars it would spend
node <skill-dir>/tools/narrate.mjs <film-dir>               # synthesise stale clips, measure all
node <skill-dir>/tools/music.mjs <film-dir> --dry           # plan cue lengths from the holds
node <skill-dir>/tools/music.mjs <film-dir>                 # generate stale cues
<consumer capture command>                                  # writes <film-dir>/take/take.json
node <skill-dir>/tools/check.mjs <film-dir> --balance sandwich
node <skill-dir>/tools/render.mjs <film-dir> --balance sandwich --out film-sandwich.mp4
```

### narrate

`node tools/narrate.mjs <film-dir> [--dry] [--only id,id] [--force] [--budget 8000] [--yes]`

- `POST https://api.elevenlabs.io/v1/text-to-speech/{voiceId}?output_format=mp3_44100_128`
  with `model_id` = `voice.model` and `voice_settings` from `voice.settings`
  (`similarity` is sent as `similarity_boost`). One retry on network error, 429 or 5xx;
  concurrency 3.
- Voice id: `voice.voiceId` in film.json, else `ELEVENLABS_VOICE_ID`, else the pick a prior
  run saved in `audio/voice.json`, else a pick from the account library (warm, confident
  English narrator), which is then saved to `audio/voice.json` so the voice stays put.
  Pin `voice.voiceId` in film.json once the operator likes the voice.
- Staleness: a clip is current only while
  `sha256(clipHashInput(line, voice, voiceId))` matches its manifest hash and the file
  exists. Any change to the line, voice id, model or a setting makes it stale; stale clips
  are re-synthesised, never reused. `--force` re-synthesises the beats in scope anyway;
  `--only` limits synthesis to the named beats (the manifest still describes every beat).
- Current clips are re-measured with ffprobe on every run; the file is the truth.
- `--dry`: no network. Writes the manifest with current clips kept and the rest listed in
  `estimated`, and prints the characters it would spend and the held total.
- Prints beat, ms, measured|estimated and hold per beat, and the film length (sum of holds)
  against `maxMs`, warning when over.
- Exit codes: 1 usage or invalid film.json, 2 no key, 3 voice library, 4 over budget,
  5 a clip failed (the manifest still records the clips that succeeded).

### music

`node tools/music.mjs <film-dir> [--dry] [--force] [--yes] [--budget-ms 120000]`

- One instrumental clip per `music.cues[]` (max 3, enforced by the contract and the tool).
- Cue length: the span between its `from` and `to` edges on the hold timeline (holds from
  the manifest, estimates where a beat has no clip) plus a 2000 ms tail for the fade,
  clamped to the API's 3000..600000 ms. Run it after narrate; a narration change that moves
  an edge makes the cue stale.
- Endpoint (verified against the ElevenLabs API reference on 2026-10-18):
  `POST https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128` with
  `{prompt, music_length_ms, model_id, force_instrumental: true}`. `model_id` defaults to
  `music_v2_5` (the reference lists `music_v1`, `music_v2`, `music_v2_5`); override with
  `ELEVENLABS_MUSIC_MODEL`.
- Hash: `sha256(prompt|lengthMs|model)`. Writes `audio/music-<cueId>.mp3` and
  `manifest.music[cueId]`.
- `--dry` sends nothing and reports each cue's from, to and length.
- Exit 4 when the music to generate exceeds `--budget-ms` (default 120000) without `--yes`.

## Render

Implemented by the kit's Remotion package (`tools/remotion/`, Remotion 4.0.530 pinned exactly).

- `node tools/check.mjs <film-dir> --balance <b>` - the gate before a render: seek lint
  (every component frame-pure: output a function of `useCurrentFrame()` and props only - no
  state, effects, CSS animation, `Math.random`, `Date.now` or timers on the render path),
  a collision check of moments placed in the same frames and region, and the promise
  ledger (every `claim` backed by footage). Non-zero exit on any finding.
- `node tools/render.mjs <film-dir> --balance <b> [--out f.mp4]` - reads film.json, the
  audio manifest and the take, keeps moments with `tier <= MAX_TIER[balance]`, times the
  composition from the holds (`calculateMetadata`), and renders 1920x1080, 30 fps,
  h264/AAC. Lanes: picture (take footage, ZoomToRect / DeviceFrame treatments), motion
  (plates, `@film/local` heroes), voice, music (ducked -9 dB under voice), fx. Loudness is
  normalised to -14 LUFS / -1 dBTP and printed; the output is ffprobed and black-frame
  checked. A lint error fails the render.

## Spend guard and keys

- Narration spend is characters: over `--budget` (default 8000) the tool prints the total
  and exits 4 unless `--yes`. Music spend is milliseconds of music, guarded by
  `--budget-ms`. Report the spend to the operator after every real run.
- The key is never printed. Resolution order: `ELEVENLABS_API_KEY` in the environment ->
  `.env` files from the film directory's parent up to the git root (nearest first) -> the
  file named by `ELEVENLABS_ENV_FILE` (from the environment, relative to the working
  directory, or from one of those `.env` files, relative to that file). The tools log only
  where the key came from.
- Keep the consumer's `.env` gitignored. A pointer such as
  `ELEVENLABS_ENV_FILE=../other-repo/.env.local` keeps one key for many repos.

## Gates

A film is done when, for the chosen balance:

1. `narrate` reports zero `estimated` beats and the film length is within `maxMs`.
2. The capture finished with no failed assertion and `take/take.json` has rects for every
   `capture.targets` selector.
3. `check` is green (seek lint, collisions, promise ledger).
4. `render` produced 1920x1080 30 fps h264/AAC at -14 LUFS (+/- 1), no black frames.
5. A person watched it. A balance pick is the operator's, made by viewing all three.

## Project overlay

Per-repo state lives in the consuming repo, never in this skill:

- The film directory (default `film/` at the repo root; pass another path as `<film-dir>`).
- The capture adapter and its command (no default: the consumer writes it against
  `Take`). Name it in `film/README.md`.
- Bespoke heroes in `<film-dir>/local/index.tsx` (default: none; the library only).
- `.env` with `ELEVENLABS_API_KEY` or an `ELEVENLABS_ENV_FILE` pointer, optional
  `ELEVENLABS_VOICE_ID` and `ELEVENLABS_MUSIC_MODEL` (defaults: library pick, `music_v2_5`).
- Generated `audio/` and `take/` may be committed or ignored; the manifest hash makes either
  safe, because a stale clip is detected from film.json alone.

## Tests

`npm test` (`node --test "tests/test_*.mjs"`; Node 24 does not expand a bare directory
argument) from the skill directory runs offline with no key (ffmpeg and ffprobe
on PATH): the contract helpers, narrate's dry run, staleness of exactly the edited line,
the budget exit, key resolution and music cue planning.
