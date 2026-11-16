---
layer: application
type: application
subject: game-dialogue-voice-pipeline
technique: line-id-catalog-and-revision-diff
stack: process
status: forged
verified_on: 2026-11-16
---

# Process: a middleware's audio table keys lines by file name and builds one bank per locale

Read on 2026-11-16 from the FMOD Studio 2.03 manual, "Dialogue and Localization"
(https://d1s9dnlmdewoh1.cloudfront.net/2.03/studio/dialogue-and-localization.html, the CDN copy
of fmod.com/docs, which returned an empty page to the fetcher).

## What the manual states

- **Key by file name.** "By default, the key for an audio file is the filename of that audio
  file, minus the filename extension." A `keys.txt` in the source directory overrides it, one
  key and file name per line.
- **One bank per locale.** "FMOD Studio automatically produces one version of the built bank
  for each locale", suffixed with the locale code.
- **Exclusion is silent.** "Audio files not listed in a source directory's keys.txt file are
  not included in the built bank." The page states no fallback for a key that one locale lacks.

## What it means for the catalog

The middleware's default makes the file name the identity, the case the technique forbids,
unless the files are named from the catalog id or the key file is generated from the catalog.
And a locale folder missing a take builds a bank without it and says nothing, so the catalog's
missing-take count has to be per locale; the build is not the check. Both landed as decision
rules in the technique.
