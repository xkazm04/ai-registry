# Lessons - demo-film

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 0.1.0 - 2026-10-18 - ai-registry

- **A library voice pick is not a stable identity unless it is written down.** The clip hash includes the voice id, so a voice chosen from the account library on each run would invalidate every clip the day the library ranking shifts. narrate saves the pick to `audio/voice.json` and reads it back before asking the library again; pinning `voice.voiceId` in film.json is still the finished state.
- **A dry run must not need the key, and the spend guard must fire before the key is looked up.** The budget test proves both: `--budget 10` exits 4 with no `key:` line in the output, so the guard cannot be reached only after a credential was read.
- **The file is the duration, not the manifest.** Current clips are re-measured with ffprobe on every run; the test seeds a manifest with `ms: 7` beside one-second mp3s and expects ~1000.
- **Music length depends on narration.** A cue spans beat edges on the hold timeline, so its hash includes the computed length: re-narrating a line inside the cue's span regenerates the bed. Run music after narrate, not before.
