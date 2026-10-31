---
domain: media-generation
subject: music-prompt-composition
last_touched: 2026-08-26
touched_by: intake
dry_streak: 0
---

# music-prompt-composition

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-08-26 - `/intake`, forged as part of the new audio-generation category

Born with 5 techniques (`section-plan-as-the-brief`, `sonic-style-vocabulary`,
`lyrics-for-singability`, `duration-and-tempo-locking`,
`reference-track-anchoring`) and 2 applications - the dated 2026-08 vendor
landscape (process) and a consumer tree's live-rendered cue (node,
`verified_against: node@24`, duration measured to 32ms of brief). Source:
[[2026-08-26-composer-song-editor]].

Boundary decisions worth remembering: the subject owns the BRIEF side of
producing music. Spotting (where music goes) stays with `video-assembly`;
provider routing stays with `generative-provider-routing`, whose techniques
are modality-general - the music vendor landscape landed as an application
under THIS subject only because the app filename convention binds an
application to a technique of its own subject. Speech performance belongs to
`creator-voice-and-tone`.

## Open leads

- Section-edit briefing (revising one section of an existing piece) is
  deliberately absent here - the seam discipline lives in
  `review-iteration-loops/partial-regeneration-seams` and this subject will
  need its audio-specific half (key/tempo joins) only when a consumer
  actually revises cues. Return when the consumer tree grows its
  section-edit path.
- Stems and notation-source workflows (generate to symbolic, render whole)
  are unowned; the seam technique's "when not" points at them. A subject
  candidate if the field's stem-export APIs stabilize.

## Architecture review - 2026-10-31

Trigger: pending coverage (no prior decision). Intended benefit: a music brief whose
decisions are committed per section, so a note on one section is an edit rather than a
full re-render, and a picture-locked cue is accepted against a number. Failure if
ignored: prose briefs that come back fused and unrevisable, cues at the wrong length,
singers in underscore, temp-track soundalikes. Boundary: the brief side of producing
music; spotting, mixing/ducking, provider routing and spoken delivery stay with their
own subjects. All 8 documents read in full.

Source checks against the vendor's current docs confirmed the process application's
schema facts (30 chunks, 3 s to 10 min total, 3 to 120 s per chunk, max 50 styles per
list, and the anchor sentence verbatim: "The first chunk is the most important: its
styles set the overall tone and genre for the whole song.") but refuted its worked
example's JSON shape: the v2 `CompositionPlan` is `{ "chunks": [...] }` with
`text`/`duration_ms`/`positive_styles`/`negative_styles`/`context_adherence`; the
`positive_global_styles` + `sections` shape belongs to the v1 `MusicPrompt`, whose
sections use `section_name`/`positive_local_styles`/`lines`. The example mixed the two.
Udio's own announcement (2025-10-29) says "Starting today, downloads from the platform
will be unavailable", which predates the application's 2026-08 "commercial rights on
paid plans" row; its status in 2026-08 was not established by a primary source.
Arithmetic: 92 BPM does not land 26 s on a bar line (10 bars = 26.09 s; the exact
tempo is 92.3), and a 32 ms overshoot is not "well under a frame at any picture rate"
(a 30 fps frame is 33.3 ms, a 60 fps frame 16.7 ms).

<!-- architecture-review:v1 -->
```json
{
  "subject": "media-generation/music-prompt-composition",
  "date": "2026-10-31",
  "baseline": "28985a4fd",
  "digest": "sha256-b2:2d8975c2a51e5157",
  "disposition": "clarify",
  "coverage": "All 8 documents read in full (golden path, 5 techniques, 2 applications). Vendor schema facts checked against the vendor's API reference and composition-plan guide; one rights claim checked against the vendor's own announcement. The consumer application's live render was not re-run.",
  "counterexamples": [
    "A plan with both edges locked and a fixed tempo is producible when the bar math fits both (120 BPM puts a 26 s hit and a 38 s hard out both on bar lines), so 'both edges locked is unproducible' holds only when it does not fit.",
    "In the vendor's v1 MusicPrompt schema no statement makes the first section the anchor; the anchor rule is documented for v2 chunks only, so 'every sectioned scheme' is wider than the evidence.",
    "A section plan of one (a 6 s stinger) carries no revision advantage over a prose prompt, as the technique's own 'when not' already concedes.",
    "A 32 ms overshoot is two frames at 60 fps; frame-accurate timelines at high rates still need a trim."
  ],
  "sources": [
    {
      "url": "https://elevenlabs.io/docs/api-reference/music/compose",
      "result": "v2/v2.5 CompositionPlan is `chunks` (text, duration_ms 3000-120000, positive_styles, negative_styles, context_adherence default high, conditioning_ref); v1 MusicPrompt is positive_global_styles/negative_global_styles/sections. 'The styles for the first chunk are the most important as they set the overall tone and genre.' Refutes the worked example's mixed shape."
    },
    {
      "url": "https://elevenlabs.io/docs/eleven-api/guides/how-to/music/composition-plans.md",
      "result": "'an ordered list of up to 30 chunks'; 'Total duration must be between 3 seconds and 10 minutes, with each chunk between 3 and 120 seconds'; styles 'max 50'; square-bracket section names and curly-brace inline cues; chunks may reference a stored song. Supports the application's schema bullets."
    },
    {
      "url": "https://elevenlabs.io/docs/overview/capabilities/music",
      "result": "Music v2.5 is now the most advanced model; MP3 44.1kHz 128-192kbps plus WAV. Consistent with the dated 2026-08 snapshot; no edit needed."
    },
    {
      "url": "https://www.udio.com/blog/a-new-era",
      "result": "'Starting today, downloads from the platform will be unavailable.' (2025-10-29). Undercuts the 2026-08 table row 'commercial rights on paid plans'; 2026-08 status not established."
    },
    {
      "source": "Internal arithmetic",
      "result": "240/B bar math re-derived: technique's 24 s table and node application's 96 BPM/10 s are correct; process application's 92 BPM for 26 s is 87 ms off; node application's frame claim false above 30 fps."
    }
  ],
  "documents": {
    "music-prompt-composition.md": {
      "disposition": "clarify",
      "reason": "'In every sectioned generation scheme' the opening section anchors: the vendor documents this for v2 chunks only; narrow the quantifier. Otherwise sound: plan-as-brief, layered two-sided style, singability, picture-locked clock, own-work references, clear boundary."
    },
    "techniques/section-plan-as-the-brief.md": {
      "disposition": "keep",
      "reason": "Shape (per-section duration in ms, include/exclude lists, dozens-of-sections caps, seconds-to-minutes totals) matches the vendor schema; numbers correctly delegated to the application."
    },
    "techniques/sonic-style-vocabulary.md": {
      "disposition": "keep",
      "reason": "Axis table and exclude-list fence are coherent and consistent with the vendor's include/exclude style lists; restatement law correctly applied."
    },
    "techniques/lyrics-for-singability.md": {
      "disposition": "keep",
      "reason": "Tags-and-braces separation matches the vendor's square-bracket section names and curly-brace inline cues; craft rules are stable."
    },
    "techniques/duration-and-tempo-locking.md": {
      "disposition": "clarify",
      "reason": "Bar math verified (24 s at 80/90/100/110/120 BPM all whole bars). First decision rule says both edges locked is 'unproducible at exact duration', contradicting the body's own qualifier (plus a fixed tempo) and the subject's worked examples; align the rule with the body."
    },
    "techniques/reference-track-anchoring.md": {
      "disposition": "keep",
      "reason": "Style-not-melody and own-accepted-work anchoring are sound; consistent with the vendor rejecting copyrighted content in styles."
    },
    "applications/process--section-plan-as-the-brief.md": {
      "disposition": "clarify",
      "reason": "Schema bullets confirmed verbatim. Worked-example JSON mixes v1 (positive_global_styles, sections) and v2 (text, positive_styles, context_adherence) shapes; rewrite as v2 chunks with the global identity in the first chunk. Tempo note's '92 BPM ... 10 bars' is ~92.3 BPM exactly. Udio row ('commercial rights on paid plans') is undercut by the vendor's 2025-10-29 download shutdown: reverify owed at the refresh_by date with a current primary source."
    },
    "applications/node--duration-and-tempo-locking.md": {
      "disposition": "clarify",
      "reason": "'well under a frame at any picture rate' is false for a 32 ms overshoot (33.3 ms at 30 fps, 16.7 ms at 60 fps); narrow to 24-30 fps. Live render not re-run; verified_on left unchanged."
    }
  }
}
```

Applied the four clarify items above in the subjects' own voice; the record below is
against the edited bytes. The one item left open is the Udio rights row (reverify).

<!-- architecture-review:v1 -->
```json
{
  "subject": "media-generation/music-prompt-composition",
  "date": "2026-10-31",
  "baseline": "28985a4fd",
  "digest": "sha256-b2:def7ffe869c1935c",
  "disposition": "reverify",
  "coverage": "All 8 documents read in full (golden path, 5 techniques, 2 applications). Vendor schema facts checked against the vendor's API reference and composition-plan guide; one rights claim checked against the vendor's own announcement. The consumer application's live render was not re-run. Second record after applying four clarify edits; the Udio row remains open.",
  "counterexamples": [
    "A plan with both edges locked and a fixed tempo is producible when the bar math fits both (120 BPM puts a 26 s hit and a 38 s hard out both on bar lines), so 'both edges locked is unproducible' holds only when it does not fit.",
    "In the vendor's v1 MusicPrompt schema no statement makes the first section the anchor; the anchor rule is documented for v2 chunks only, so 'every sectioned scheme' is wider than the evidence.",
    "A section plan of one (a 6 s stinger) carries no revision advantage over a prose prompt, as the technique's own 'when not' already concedes.",
    "A 32 ms overshoot is two frames at 60 fps; frame-accurate timelines at high rates still need a trim."
  ],
  "sources": [
    {
      "url": "https://elevenlabs.io/docs/api-reference/music/compose",
      "result": "v2/v2.5 CompositionPlan is `chunks` (text, duration_ms 3000-120000, positive_styles, negative_styles, context_adherence default high, conditioning_ref); v1 MusicPrompt is positive_global_styles/negative_global_styles/sections. 'The styles for the first chunk are the most important as they set the overall tone and genre.' Refutes the worked example's mixed shape."
    },
    {
      "url": "https://elevenlabs.io/docs/eleven-api/guides/how-to/music/composition-plans.md",
      "result": "'an ordered list of up to 30 chunks'; 'Total duration must be between 3 seconds and 10 minutes, with each chunk between 3 and 120 seconds'; styles 'max 50'; square-bracket section names and curly-brace inline cues; chunks may reference a stored song. Supports the application's schema bullets."
    },
    {
      "url": "https://elevenlabs.io/docs/overview/capabilities/music",
      "result": "Music v2.5 is now the most advanced model; MP3 44.1kHz 128-192kbps plus WAV. Consistent with the dated 2026-08 snapshot; no edit needed."
    },
    {
      "url": "https://www.udio.com/blog/a-new-era",
      "result": "'Starting today, downloads from the platform will be unavailable.' (2025-10-29). Undercuts the 2026-08 table row 'commercial rights on paid plans'; 2026-08 status not established."
    },
    {
      "source": "Internal arithmetic",
      "result": "240/B bar math re-derived: technique's 24 s table and node application's 96 BPM/10 s are correct; process application's 92 BPM for 26 s is 87 ms off; node application's frame claim false above 30 fps."
    }
  ],
  "documents": {
    "music-prompt-composition.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'In every sectioned generation scheme' narrowed to 'In sectioned generation schemes' (anchor rule is documented for the vendor's v2 chunks only)."
    },
    "techniques/section-plan-as-the-brief.md": {
      "disposition": "keep",
      "reason": "Shape (per-section duration in ms, include/exclude lists, dozens-of-sections caps, seconds-to-minutes totals) matches the vendor schema; numbers correctly delegated to the application."
    },
    "techniques/sonic-style-vocabulary.md": {
      "disposition": "keep",
      "reason": "Axis table and exclude-list fence are coherent and consistent with the vendor's include/exclude style lists; restatement law correctly applied."
    },
    "techniques/lyrics-for-singability.md": {
      "disposition": "keep",
      "reason": "Tags-and-braces separation matches the vendor's square-bracket section names and curly-brace inline cues; craft rules are stable."
    },
    "techniques/duration-and-tempo-locking.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: first decision rule now says both edges locked plus a fixed tempo over-determines the cue unless the bar math fits both, matching the body and the subject's worked examples."
    },
    "techniques/reference-track-anchoring.md": {
      "disposition": "keep",
      "reason": "Style-not-melody and own-accepted-work anchoring are sound; consistent with the vendor rejecting copyrighted content in styles."
    },
    "applications/process--section-plan-as-the-brief.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: worked example rewritten as a v2 `chunks` plan with the global identity folded into the first chunk's styles, plus one sentence naming the v1 shape it had mixed in; tempo note corrected to 120 BPM exact / ~92.3 BPM (92 BPM lands ~90 ms late). Still owed: the Udio row's 'commercial rights on paid plans' is undercut by Udio's 2025-10-29 'downloads from the platform will be unavailable'; its 2026-08 status needs a current primary source (due at refresh_by 2026-11-26). verified_on unchanged: the Suno/Lyria/Stable Audio/MiniMax rows and the Composer ship date were not re-checked."
    },
    "applications/node--duration-and-tempo-locking.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'well under a frame at any picture rate' -> 'under a frame at 24-30 fps (about two frames at 60)'. Live render not re-run; verified_on unchanged."
    }
  }
}
```

Targeted Udio correction, 2026-10-31: the row the prior record left open is rewritten from
Udio's own announcement and terms, which closes the subject at `keep`.

<!-- architecture-review:v1 -->
```json
{
  "subject": "media-generation/music-prompt-composition",
  "date": "2026-10-31",
  "baseline": "96dec842b",
  "digest": "sha256-b2:ad93535d80fe1214",
  "disposition": "keep",
  "coverage": "All 8 documents decided. Targeted correction: the process application's Udio row was rewritten from Udio's own announcement and live Terms of Service (both opened this run) and re-read; that was the one item the prior record left open. Other documents are byte-unchanged and carry their prior dispositions. The other vendor rows and the consumer application's live render were not re-checked; verified_on unchanged.",
  "counterexamples": [
    "A plan with both edges locked and a fixed tempo is producible when the bar math fits both (120 BPM puts a 26 s hit and a 38 s hard out both on bar lines), so 'both edges locked is unproducible' holds only when it does not fit.",
    "In the vendor's v1 MusicPrompt schema no statement makes the first section the anchor; the anchor rule is documented for v2 chunks only, so 'every sectioned scheme' is wider than the evidence.",
    "A section plan of one (a 6 s stinger) carries no revision advantage over a prose prompt, as the technique's own 'when not' already concedes.",
    "A 32 ms overshoot is two frames at 60 fps; frame-accurate timelines at high rates still need a trim.",
    "A paid Udio subscription in 2026 yields no downloadable file and only personal, non-commercial use, so Udio cannot source a delivered cue on any plan until a licensed relaunch says otherwise."
  ],
  "sources": [
    {
      "url": "https://elevenlabs.io/docs/api-reference/music/compose",
      "result": "v2/v2.5 CompositionPlan is `chunks` (text, duration_ms 3000-120000, positive_styles, negative_styles, context_adherence default high, conditioning_ref); v1 MusicPrompt is positive_global_styles/negative_global_styles/sections. 'The styles for the first chunk are the most important as they set the overall tone and genre.' Refutes the worked example's mixed shape."
    },
    {
      "url": "https://elevenlabs.io/docs/eleven-api/guides/how-to/music/composition-plans.md",
      "result": "'an ordered list of up to 30 chunks'; 'Total duration must be between 3 seconds and 10 minutes, with each chunk between 3 and 120 seconds'; styles 'max 50'; square-bracket section names and curly-brace inline cues; chunks may reference a stored song. Supports the application's schema bullets."
    },
    {
      "url": "https://elevenlabs.io/docs/overview/capabilities/music",
      "result": "Music v2.5 is now the most advanced model; MP3 44.1kHz 128-192kbps plus WAV. Consistent with the dated 2026-08 snapshot; no edit needed."
    },
    {
      "source": "Internal arithmetic",
      "result": "240/B bar math re-derived: technique's 24 s table and node application's 96 BPM/10 s are correct; process application's 92 BPM for 26 s is 87 ms off; node application's frame claim false above 30 fps."
    },
    {
      "url": "https://www.udio.com/blog/a-new-era",
      "result": "2025-10-29: 'Starting today, downloads from the platform will be unavailable.' Udio's blog index (https://www.udio.com/blog) lists nothing after 'Udio with Warner Music Group' (2025-11-19), which describes 'Udio's reimagined platform' as forthcoming: no licensed relaunch announced as of 2026-10-31."
    },
    {
      "url": "https://www.udio.com/terms-of-service",
      "result": "Last Revised on November 12, 2025, live 2026-10-31: 'you may use Output solely for your personal and non-commercial purposes, provided that you may not download any copies of your Output from the App for any purpose'; a paid subscription only waives the attribution notice for Output made during it. Refutes any paid-plan commercial grant."
    }
  ],
  "documents": {
    "music-prompt-composition.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'In every sectioned generation scheme' narrowed to 'In sectioned generation schemes' (anchor rule is documented for the vendor's v2 chunks only)."
    },
    "techniques/section-plan-as-the-brief.md": {
      "disposition": "keep",
      "reason": "Shape (per-section duration in ms, include/exclude lists, dozens-of-sections caps, seconds-to-minutes totals) matches the vendor schema; numbers correctly delegated to the application."
    },
    "techniques/sonic-style-vocabulary.md": {
      "disposition": "keep",
      "reason": "Axis table and exclude-list fence are coherent and consistent with the vendor's include/exclude style lists; restatement law correctly applied."
    },
    "techniques/lyrics-for-singability.md": {
      "disposition": "keep",
      "reason": "Tags-and-braces separation matches the vendor's square-bracket section names and curly-brace inline cues; craft rules are stable."
    },
    "techniques/duration-and-tempo-locking.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: first decision rule now says both edges locked plus a fixed tempo over-determines the cue unless the bar math fits both, matching the body and the subject's worked examples."
    },
    "techniques/reference-track-anchoring.md": {
      "disposition": "keep",
      "reason": "Style-not-melody and own-accepted-work anchoring are sound; consistent with the vendor rejecting copyrighted content in styles."
    },
    "applications/process--section-plan-as-the-brief.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the Udio row now reads, as of 2026-10-31, downloads off since 2025-10-29 and personal non-commercial use only on every tier (Terms rev. 2025-11-12), licensed relaunch announced for 2026 and not launched; its sourcing role is now 'none for a delivered cue'. The earlier v2 chunks rewrite and tempo correction stand. verified_on unchanged: the Suno/Lyria/Stable Audio/MiniMax rows and the Composer ship date were not re-checked (due at refresh_by 2026-11-26)."
    },
    "applications/node--duration-and-tempo-locking.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'well under a frame at any picture rate' -> 'under a frame at 24-30 fps (about two frames at 60)'. Live render not re-run; verified_on unchanged."
    }
  }
}
```
