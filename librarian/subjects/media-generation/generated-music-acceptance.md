---
domain: media-generation
subject: generated-music-acceptance
last_touched: 2026-08-26
touched_by: intake
dry_streak: 0
---

# generated-music-acceptance

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-08-26 - `/intake`, forged as part of the new audio-generation category

Born with 5 techniques (`brief-conformance-listen`,
`loudness-and-peak-acceptance`, `generated-audio-defect-taxonomy`,
`structure-verification-against-plan`, `rights-and-provenance-record`) and 1
application (the dated 2026-08 rights landscape, `refresh_by` 2026-11-26 -
plan-tier commercial grants, the non-retroactivity trap, registration
doctrine). Source: [[2026-08-26-composer-song-editor]].

Boundary: modality-general grading craft (trial matrices, grader
disagreement, regrade-without-regenerate) stays with
`generated-output-grading` in the visual category and transfers whole; this
subject adds only what is audio-specific - the measured gates (LUFS, dBTP,
structure offsets), the defect names, the rights record. The GP says so
explicitly to keep a later run from duplicating the grading subject here.

First live corroboration same-day: a vendor delivered 192 kbps where 128 was
requested (duration on spec to 32ms) - the measure-don't-trust doctrine
demonstrated by the vendor unprompted, recorded in the consumer-tree
application under the composition subject.

## Open leads

- No scripted acceptance pass exists yet anywhere in the fleet (duration /
  boundary / loudness in one run). The consumer tree is the natural home;
  when it lands, this subject gets its node application.
- The rights application's refresh clock (2026-11-26) is the category's
  first currency obligation - vendor terms move faster than craft.

## Architecture review - 2026-10-31

First architecture review, against `36c297c8d`. All seven documents read in
full. The measured gates check out against their primary sources: EBU R 128
and Spotify's loudness guidance confirm the targets and the -1 dBTP ceiling,
but Spotify ties the -2 dBTP allowance to a master louder than -14 LUFS, which
the technique does not say. Suno's help centre confirms the non-retroactivity
trap, with the qualifier "by default". The Copyright Office's January 2025
report says prompts alone do not make the user an author, so listing the
authored plan as the human contribution overstates the doctrine. The
application's Udio line is contradicted by October 2025 reporting that Udio
disabled downloads after its Universal settlement; Udio's own terms could not
be read this run. The three synced-effect defect classes are a deliberate
cross-subject import from sound-effect-generation, not drift.

<!-- architecture-review:v1 -->
```json
{
  "subject": "media-generation/generated-music-acceptance",
  "date": "2026-10-31",
  "baseline": "36c297c8d",
  "digest": "sha256-b2:3f9de82f80a6905a",
  "disposition": "clarify",
  "coverage": "All 7 documents (golden path, 5 techniques, 1 application) read in full. Primary sources opened for loudness (EBU R 128, Spotify), Suno plan rights, ElevenLabs Music Terms and US Copyright Office registration doctrine. Udio's terms page returned no readable text; its status rests on news reporting. The jurisdictional-guidance claim and the vendor attestation behind the three synced-effect defect classes were not re-sourced. No runtime or private consumer tree was involved, and no verification date was refreshed.",
  "counterexamples": [
    "A master at -16 LUFS with a -1.2 dBTP peak meets Spotify's guidance without the extra -2 dBTP headroom, because Spotify asks for -2 dBTP only when the master is louder than -14 LUFS.",
    "A composition plan detailed enough to fix every section is still, in the Copyright Office's terms, a prompt: 'prompts alone do not provide sufficient human control', so the plan alone does not carry a registration claim; human-written lyrics, selection and arrangement, and edits can.",
    "A paid Udio subscription after October 2025 does not yield a deliverable file at all if downloads are disabled, so 'paid plans grant commercial use' cannot clear an asset for a production timeline.",
    "A paid ElevenLabs tier clears a web trailer and still excludes film, TV and radio, so 'cleared for commercial use' without a destination is not a clearance."
  ],
  "sources": [
    {
      "url": "https://tech.ebu.ch/docs/r/r128.pdf",
      "result": "Confirms 'Programme Loudness Level shall be normalised to a Target Level of -23.0 LUFS', 'True Peak Level of a programme shall not exceed -1 dBTP', and that 'Maximum True Peak Levels may be lower for different distribution systems and data reduction rates'. Supports the broadcast target and the ceiling."
    },
    {
      "url": "https://support.spotify.com/artists/article/loudness-normalization",
      "result": "'Target the loudness level of your master at -14dB integrated LUFS'; 'Keep it below -1dB TP (True Peak) max'; 'If your master is louder than -14dB integrated LUFS, keep True Peak below -2dB'. Supports -14 and -1 dBTP; the -2 dBTP condition is loudness above target, which the technique omits."
    },
    {
      "url": "https://help.suno.com/en/articles/2425729",
      "result": "Subscribing does not give retroactive commercial licensing for free-plan songs by default; 'Songs made with Suno's free plan can only be used for non-commercial purposes'; Suno may grant retroactive rights for specific songs. Supports the non-retroactivity trap, with a 'by default' qualifier the application lacks."
    },
    {
      "url": "https://elevenlabs.io/music-terms",
      "result": "Last updated 09 October 2026. Free through Business tiers: 'All online and offline commercial use permitted, except film, TV, radio, and Studio Games'; free tier downloads 'Not permitted'. Supports the application's 'tier-dependent, resolve per project' line and the technique's per-destination clearance rule."
    },
    {
      "url": "https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf",
      "result": "January 2025: 'prompts alone do not provide sufficient human control to make users of an AI system the authors of the output'; outputs can be copyrightable 'where AI is used as a tool, and where a human has been able to determine the expressive elements they contain'. Supports the registration paragraph but refutes counting the plan/prompt itself as the human contribution."
    },
    {
      "url": "https://www.bostonglobe.com/2025/10/30/business/universal-music-ai-song-udio/",
      "result": "AP report: Udio 'immediately stopped allowing people to download songs created via AI'; songs to be 'controlled within a walled garden'. Contradicts the application's Udio posture as of 2026-08. Udio's own terms page (udio.com/terms-of-service) returned no readable text."
    }
  ],
  "documents": {
    "generated-music-acceptance.md": {
      "disposition": "keep",
      "reason": "Three non-substituting gates, measure-what-was-numbered, named defects routing remedies and rights-at-acceptance are coherent with every technique. The non-retroactivity claim ('routinely') is confirmed by Suno's terms. Boundary with generated-output-grading and the composition subject is stated."
    },
    "techniques/brief-conformance-listen.md": {
      "disposition": "keep",
      "reason": "Brief-derived checklist with a three-state verdict, listening conditions and routed fails. Methodological, no unstable claim."
    },
    "techniques/loudness-and-peak-acceptance.md": {
      "disposition": "clarify",
      "reason": "Targets and the -1 dBTP ceiling are confirmed by EBU R 128 and Spotify. The -2 dBTP allowance is given only for lossy transcoding; Spotify ties it to a master louder than -14 LUFS. State both conditions."
    },
    "techniques/generated-audio-defect-taxonomy.md": {
      "disposition": "keep",
      "reason": "Remedy routing and the recurrence rule are sound. The three synced-effect classes mirror sound-effect-generation's picture-as-timing-brief and are deliberately carried as generated-audio classes; their vendor attestation was not re-opened."
    },
    "techniques/structure-verification-against-plan.md": {
      "disposition": "keep",
      "reason": "Deterministic-before-ear ordering and the plan-only checkability argument are internally consistent; no unstable claim."
    },
    "techniques/rights-and-provenance-record.md": {
      "disposition": "clarify",
      "reason": "Record fields and gate are sound and the per-destination rule is confirmed by ElevenLabs' tier table. 'The authored plan, lyric, and edit history are the human contribution' overstates the Copyright Office's January 2025 report: a plan is a prompt, and prompts alone do not make authorship. Narrow to human-written lyrics, selection and arrangement, and edits, with the plan as evidence of intent."
    },
    "applications/process--rights-and-provenance-record.md": {
      "disposition": "reverify",
      "reason": "Suno confirmed, but add 'by default' (Suno may grant retroactive rights for specific songs). The registration paragraph needs the same narrowing as the technique. The Udio line is contradicted by October 2025 reporting that downloads were disabled under the Universal settlement; Udio's terms could not be read. The 2026 jurisdictional-guidance claim names no source. refresh_by 2026-11-26 stands."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the clarify items the earlier 2026-10-31 record named, against
`36c297c8d` plus this run's edits: the -2 dBTP condition in the loudness
technique, and the prompts-alone narrowing of registration doctrine in the
rights technique and its application, where Suno's rule also gained its "by
default" qualifier. The Udio and jurisdictional lines were not changed, so the
application stays `reverify`, which is now the overall disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "media-generation/generated-music-acceptance",
  "date": "2026-10-31",
  "baseline": "36c297c8d",
  "digest": "sha256-b2:71dbfbd0c0e87b6d",
  "disposition": "reverify",
  "coverage": "All 7 documents decided. The two technique clarify items and the two confirmable application corrections named by the earlier 2026-10-31 record were applied from primary sources opened this run and the edited passages re-read. Other documents are byte-unchanged and keep their dispositions. Udio's terms, the jurisdictional-guidance claim and the synced-effect vendor attestation remain unsourced; no verification date was refreshed.",
  "counterexamples": [
    "A master at -16 LUFS with a -1.2 dBTP peak meets Spotify's guidance without the extra -2 dBTP headroom, because Spotify asks for -2 dBTP only when the master is louder than -14 LUFS.",
    "A composition plan detailed enough to fix every section is still, in the Copyright Office's terms, a prompt: 'prompts alone do not provide sufficient human control', so the plan alone does not carry a registration claim; human-written lyrics, selection and arrangement, and edits can.",
    "A paid Udio subscription after October 2025 does not yield a deliverable file at all if downloads are disabled, so 'paid plans grant commercial use' cannot clear an asset for a production timeline.",
    "A paid ElevenLabs tier clears a web trailer and still excludes film, TV and radio, so 'cleared for commercial use' without a destination is not a clearance."
  ],
  "sources": [
    {
      "url": "https://tech.ebu.ch/docs/r/r128.pdf",
      "result": "Confirms 'Programme Loudness Level shall be normalised to a Target Level of -23.0 LUFS', 'True Peak Level of a programme shall not exceed -1 dBTP', and that 'Maximum True Peak Levels may be lower for different distribution systems and data reduction rates'. Supports the broadcast target and the ceiling."
    },
    {
      "url": "https://support.spotify.com/artists/article/loudness-normalization",
      "result": "'Target the loudness level of your master at -14dB integrated LUFS'; 'Keep it below -1dB TP (True Peak) max'; 'If your master is louder than -14dB integrated LUFS, keep True Peak below -2dB'. Supports -14 and -1 dBTP; the -2 dBTP condition is loudness above target, which the technique omits."
    },
    {
      "url": "https://help.suno.com/en/articles/2425729",
      "result": "Subscribing does not give retroactive commercial licensing for free-plan songs by default; 'Songs made with Suno's free plan can only be used for non-commercial purposes'; Suno may grant retroactive rights for specific songs. Supports the non-retroactivity trap, with a 'by default' qualifier the application lacks."
    },
    {
      "url": "https://elevenlabs.io/music-terms",
      "result": "Last updated 09 October 2026. Free through Business tiers: 'All online and offline commercial use permitted, except film, TV, radio, and Studio Games'; free tier downloads 'Not permitted'. Supports the application's 'tier-dependent, resolve per project' line and the technique's per-destination clearance rule."
    },
    {
      "url": "https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf",
      "result": "January 2025: 'prompts alone do not provide sufficient human control to make users of an AI system the authors of the output'; outputs can be copyrightable 'where AI is used as a tool, and where a human has been able to determine the expressive elements they contain'. Supports the registration paragraph but refutes counting the plan/prompt itself as the human contribution."
    },
    {
      "url": "https://www.bostonglobe.com/2025/10/30/business/universal-music-ai-song-udio/",
      "result": "AP report: Udio 'immediately stopped allowing people to download songs created via AI'; songs to be 'controlled within a walled garden'. Contradicts the application's Udio posture as of 2026-08. Udio's own terms page (udio.com/terms-of-service) returned no readable text."
    }
  ],
  "documents": {
    "generated-music-acceptance.md": {
      "disposition": "keep",
      "reason": "Three non-substituting gates, measure-what-was-numbered, named defects routing remedies and rights-at-acceptance are coherent with every technique. The non-retroactivity claim ('routinely') is confirmed by Suno's terms. Boundary with generated-output-grading and the composition subject is stated."
    },
    "techniques/brief-conformance-listen.md": {
      "disposition": "keep",
      "reason": "Brief-derived checklist with a three-state verdict, listening conditions and routed fails. Methodological, no unstable claim."
    },
    "techniques/loudness-and-peak-acceptance.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the -2 dBTP allowance now also covers a master running louder than the platform's normalization target, per Spotify's guidance, alongside lossy transcoding."
    },
    "techniques/generated-audio-defect-taxonomy.md": {
      "disposition": "keep",
      "reason": "Remedy routing and the recurrence rule are sound. The three synced-effect classes mirror sound-effect-generation's picture-as-timing-brief and are deliberately carried as generated-audio classes; their vendor attestation was not re-opened."
    },
    "techniques/structure-verification-against-plan.md": {
      "disposition": "keep",
      "reason": "Deterministic-before-ear ordering and the plan-only checkability argument are internally consistent; no unstable claim."
    },
    "techniques/rights-and-provenance-record.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the registration sentence now says prompts alone, a plan included, do not make the user an author (Copyright Office, January 2025), and names the lyric, selection and arrangement, and edit history as the human contribution, with the plan as evidence of intent."
    },
    "applications/process--rights-and-provenance-record.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: Suno's non-retroactivity now reads 'by default (Suno may grant it for specific songs)'; the registration paragraph now cites the January 2025 prompts-alone conclusion and treats the plan as evidence of intent. Still owed: the Udio line is contradicted by October 2025 reporting that downloads were disabled under the Universal settlement, and Udio's own terms could not be read; the 2026 jurisdictional-guidance claim names no source. verified_on left at 2026-08-26 because not every citation was re-checked; refresh_by 2026-11-26 stands."
    }
  }
}
```

Targeted Udio correction, 2026-10-31: the application's paid-plan commercial-use line was
contradicted by Udio's own announcement and terms and is now rewritten from them. The
jurisdictional-guidance claim keeps the application, and so the subject, at `reverify`.

<!-- architecture-review:v1 -->
```json
{
  "subject": "media-generation/generated-music-acceptance",
  "date": "2026-10-31",
  "baseline": "96dec842b",
  "digest": "sha256-b2:ba4ae482ee6e9290",
  "disposition": "reverify",
  "coverage": "All 7 documents decided. Targeted correction: the application's Udio line was rewritten from Udio's own announcement and its live Terms of Service (both opened this run) and the edited passage re-read. Other documents are byte-unchanged and carry their prior dispositions. The jurisdictional-guidance claim and the synced-effect vendor attestation remain unsourced; no verification date was refreshed.",
  "counterexamples": [
    "A master at -16 LUFS with a -1.2 dBTP peak meets Spotify's guidance without the extra -2 dBTP headroom, because Spotify asks for -2 dBTP only when the master is louder than -14 LUFS.",
    "A composition plan detailed enough to fix every section is still, in the Copyright Office's terms, a prompt: 'prompts alone do not provide sufficient human control', so the plan alone does not carry a registration claim; human-written lyrics, selection and arrangement, and edits can.",
    "A paid Udio subscription after October 2025 does not yield a deliverable file at all if downloads are disabled, so 'paid plans grant commercial use' cannot clear an asset for a production timeline.",
    "A paid ElevenLabs tier clears a web trailer and still excludes film, TV and radio, so 'cleared for commercial use' without a destination is not a clearance."
  ],
  "sources": [
    {
      "url": "https://tech.ebu.ch/docs/r/r128.pdf",
      "result": "Confirms 'Programme Loudness Level shall be normalised to a Target Level of -23.0 LUFS', 'True Peak Level of a programme shall not exceed -1 dBTP', and that 'Maximum True Peak Levels may be lower for different distribution systems and data reduction rates'. Supports the broadcast target and the ceiling."
    },
    {
      "url": "https://support.spotify.com/artists/article/loudness-normalization",
      "result": "'Target the loudness level of your master at -14dB integrated LUFS'; 'Keep it below -1dB TP (True Peak) max'; 'If your master is louder than -14dB integrated LUFS, keep True Peak below -2dB'. Supports -14 and -1 dBTP; the -2 dBTP condition is loudness above target, which the technique omits."
    },
    {
      "url": "https://help.suno.com/en/articles/2425729",
      "result": "Subscribing does not give retroactive commercial licensing for free-plan songs by default; 'Songs made with Suno's free plan can only be used for non-commercial purposes'; Suno may grant retroactive rights for specific songs. Supports the non-retroactivity trap, with a 'by default' qualifier the application lacks."
    },
    {
      "url": "https://elevenlabs.io/music-terms",
      "result": "Last updated 09 October 2026. Free through Business tiers: 'All online and offline commercial use permitted, except film, TV, radio, and Studio Games'; free tier downloads 'Not permitted'. Supports the application's 'tier-dependent, resolve per project' line and the technique's per-destination clearance rule."
    },
    {
      "url": "https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf",
      "result": "January 2025: 'prompts alone do not provide sufficient human control to make users of an AI system the authors of the output'; outputs can be copyrightable 'where AI is used as a tool, and where a human has been able to determine the expressive elements they contain'. Supports the registration paragraph but refutes counting the plan/prompt itself as the human contribution."
    },
    {
      "url": "https://www.bostonglobe.com/2025/10/30/business/universal-music-ai-song-udio/",
      "result": "AP report: Udio 'immediately stopped allowing people to download songs created via AI'; songs to be 'controlled within a walled garden'. Contradicts the application's Udio posture as of 2026-08. Udio's own terms page (udio.com/terms-of-service) returned no readable text."
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
    "generated-music-acceptance.md": {
      "disposition": "keep",
      "reason": "Three non-substituting gates, measure-what-was-numbered, named defects routing remedies and rights-at-acceptance are coherent with every technique. The non-retroactivity claim ('routinely') is confirmed by Suno's terms. Boundary with generated-output-grading and the composition subject is stated."
    },
    "techniques/brief-conformance-listen.md": {
      "disposition": "keep",
      "reason": "Brief-derived checklist with a three-state verdict, listening conditions and routed fails. Methodological, no unstable claim."
    },
    "techniques/loudness-and-peak-acceptance.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the -2 dBTP allowance now also covers a master running louder than the platform's normalization target, per Spotify's guidance, alongside lossy transcoding."
    },
    "techniques/generated-audio-defect-taxonomy.md": {
      "disposition": "keep",
      "reason": "Remedy routing and the recurrence rule are sound. The three synced-effect classes mirror sound-effect-generation's picture-as-timing-brief and are deliberately carried as generated-audio classes; their vendor attestation was not re-opened."
    },
    "techniques/structure-verification-against-plan.md": {
      "disposition": "keep",
      "reason": "Deterministic-before-ear ordering and the plan-only checkability argument are internally consistent; no unstable claim."
    },
    "techniques/rights-and-provenance-record.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the registration sentence now says prompts alone, a plan included, do not make the user an author (Copyright Office, January 2025), and names the lyric, selection and arrangement, and edit history as the human contribution, with the plan as evidence of intent."
    },
    "applications/process--rights-and-provenance-record.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: the Udio line now reads, as of 2026-10-31, no commercial grant on any tier and no downloads, quoting Udio's 2025-10-29 announcement and its Terms (rev. 2025-11-12), with the 2026 licensed relaunch noted as not launched. Still owed: the 2026 jurisdictional-guidance claim names no source. verified_on left at 2026-08-26 because not every citation was re-checked; refresh_by 2026-11-26 stands."
    }
  }
}
```
