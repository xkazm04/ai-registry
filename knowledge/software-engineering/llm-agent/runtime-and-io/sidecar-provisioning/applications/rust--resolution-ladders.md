---
layer: application
type: application
subject: sidecar-provisioning
technique: resolution-ladders
stack: rust
verified_on: 2026-10-31
verified_against: rust@1.96
---

# Resolution ladders across the Personas sidecars

This repo resolves four external executables — the Kokoro TTS engine, the
Pocket TTS service, the Bun runtime, and FFmpeg — and is a study in the
technique's central claim: the *order* converged everywhere on its own,
but nothing enforces uniformity, so the *implementations* diverged into
three-and-a-half hand-rolled ladders.

## The full ladder: Kokoro (`src-tauri/src/companion/tts/kokoro.rs`)

The module doc spells out the canonical three rungs (`:28-31`):

1. `PERSONAS_KOKORO_BIN` env override (`:82`) — "developer/test escape
   hatch";
2. the managed engine directory `~/.personas/companion-tts/bin/` (`:89`) —
   where `kokoro_installer.rs` provisions the binary;
3. `which::which(ENGINE_FILENAME)` on the system path (`:100`).

Specificity beats management beats ambience, exactly as the standard
orders it. Not-found is a designed verdict: the error at `:206-213` names
the expected location *and* the override variable — status, reason, remedy
in one string. The model files ride the app-wide `PERSONAS_HOME` override
(`model_dir`, `:68-76`), the same convention the STT store uses.

## The two-rung ladder: Bun (`src-tauri/src/webbuild/bun.rs`)

`resolve_bun` (`:20-32`) runs override (`PERSONAS_BUN_BIN`) → system path.
The managed rung is legitimately absent — the app never provisions Bun —
and the not-found error again names both remedies (install it, or set the
override, `:28-31`).

Deviation, and the file's test enshrines it: **an override pointing at a
missing file silently falls through** to the path lookup (`:21-26`;
`resolve_bun_honors_missing_override_gracefully`, `:189-205`). The
standard says fail loudly at the override rung — an operator who set
`PERSONAS_BUN_BIN` and silently got a different binary is debugging a
ghost. Kokoro has the same silent fall-through shape at `:82-87`.

## The service variant: Pocket TTS (`src-tauri/src/companion/tts/pocket.rs`)

For a sidecar reached over HTTP rather than spawned per call, the ladder
degenerates to override-or-default: `PERSONAS_POCKET_TTS_URL` else
`http://127.0.0.1:8080` (`base_url`, `:199-205`). The interesting resolution here is
*backend routing* (module doc `:32-38`): synthesis goes to the packaged
one-shot sidecar when it is installed and the voice exists locally,
otherwise falls back to the HTTP service — a ladder over backends rather
than paths.

## The bespoke ladder: FFmpeg (`src-tauri/src/commands/artist/ffmpeg.rs`)

The counter-example the golden path's `counter_evidence:` names.
`discover_ffmpeg_path` (`:119` onward) walks a hard-coded candidate list
(system installs, chocolatey, scoop, winget shims), then the path
environment by hand, then last-resorts to spawning `ffmpeg -version` and
returning the bare name. It works — and it has **no override rung**, no
managed rung, and shares zero code with the other three resolvers. Support
diagnosis for "wrong ffmpeg picked up" has no lever to pull short of
editing the machine's package layout.

What FFmpeg *does* witness is the verdict-caching rule: a process-lifetime
cache (`FFMPEG_PATH_CACHE`, `:108-117`) whose comment records the cost
that motivated it (discovery re-ran on every artist command, "probing N
clips paid it N+ times"), invalidated by an explicit re-check command
(`artist_check_ffmpeg`, `:412-422`) "so a mid-session install is picked
up" — the standard's named-invalidation-events posture, including the
user-visible re-check appeal.

## The upshot

Four dependencies, four private implementations of one convergent idea.
Each is locally fine; collectively there is no single resolver descriptor,
so the override naming convention (`PERSONAS_<DEP>_BIN`) holds by
imitation, FFmpeg escaped it entirely, and the silent-fall-through defect
had to be (not) fixed four separate times. The technique's "one resolver
function, parameterized by descriptor" exists here only as a convention
waiting to be extracted.

Re-checked 2026-10-31 at personas@22260d77c9: the Kokoro, Bun and Pocket TTS
ladders hold as described (the Bun and Kokoro silent override fall-through
included). **The FFmpeg section no longer has a subject in the tree:**
`src-tauri/src/commands/artist/ffmpeg.rs` — `discover_ffmpeg_path`,
`FFMPEG_PATH_CACHE` and `artist_check_ffmpeg` with it — was deleted when the
Artist plugin was removed (commit `0697f13438`, 2026-09-15), and no other
FFmpeg resolver exists. The repo now resolves three external executables, all
on the `PERSONAS_<DEP>_*` override convention; the bespoke counter-example and
the verdict-caching witness are history, not current code. The upshot's
"one resolver function, parameterized by descriptor" is still unextracted.
