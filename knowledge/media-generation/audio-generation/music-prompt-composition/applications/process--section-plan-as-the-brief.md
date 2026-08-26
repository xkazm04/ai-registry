---
layer: application
type: application
subject: music-prompt-composition
technique: section-plan-as-the-brief
status: forged
stack: process
verified_on: 2026-08-26
refresh_by: 2026-11-26
---

# A worked section plan — the music-generation landscape, August 2026

The technique says: brief music as an ordered plan of sections, each with
duration, bidirectional styles, and content. This application is the dated
snapshot of the vendor schemes that plan is written against, in the
vendor-fact-ledger form the image and video landscapes use. It will go
stale; the dates are the point.

## The reference realization of the section plan

ElevenLabs' Music v2 "composition plan" (docs resolved 2026-08-26) is the
most literal implementation of the technique's shape on the market:

- an ordered list of up to **30 chunks**; total song length **3 seconds to
  10 minutes**;
- per chunk: `text` (section name in square brackets — `[Verse 1]` — plus
  lyric lines and inline directions in braces), `duration_ms` (**3,000 to
  120,000 ms**), `positive_styles` and `negative_styles` (max 50 each), and
  `context_adherence` (`low` / `medium` / `high`) controlling how closely
  the chunk follows its surroundings;
- the vendor's own doc states the anchor rule verbatim: "the first chunk is
  the most important: its styles set the overall tone and genre for the
  whole song";
- chunks can **reference audio from a stored song** to keep existing
  sections unchanged — the kept-by-reference half of the seam discipline.

On top of the API sits Composer (shipped 2026-08-25), the interactive form
of the same plan: section-by-section editing, per-section regeneration,
side-by-side takes of one section. Output is MP3 44.1kHz 128–192kbps on
standard tiers, higher-fidelity exports on upper tiers; vocals in English,
Spanish, German, Japanese; commercial use is tier-dependent — see the
rights record application under the acceptance subject.

## The landscape around it (2026-08)

| Vendor / model | Plan support | Sourcing role | Notes |
|---|---|---|---|
| ElevenLabs Music v2 | native composition plan | picture-locked cues, revisable pieces | the schema above; proper API; ~4min+ single takes |
| Suno v5 | prompt + section tags, no public API | vocal-led full songs | consensus vocal-quality leader; reachable only via third-party aggregators (create/extend/cover/persona/remaster ops, stems and MIDI export there); ~60–120s latency |
| Google Lyria 3 | prompt-level | fast instrumental beds | roughly 2–4× faster generation than Suno-class; API via cloud platform |
| Udio | prompt-level, no public API | vocal songs | commercial rights on paid plans |
| Stable Audio / MiniMax | prompt + duration | SFX-adjacent, short-form, open-weight options | proper APIs; quality trails the leaders on vocals |

Sourcing consequence for a cue pipeline: as of 2026-08 only the
plan-native vendor offers section-addressable *revision* over an API — the
capability the edit-over-regeneration discipline needs. Vocal-led hero
pieces may still justify the aggregator route to the quality leader;
underscore and picture-locked cues do not.

## Worked example — a 38-second trailer cue as a plan

A spotting row: "cue enters at the turn (0:13), 38s, build then release,
hard out on the door." As a plan:

```json
{
  "positive_global_styles": ["dark orchestral", "modern trailer production", "instrumental"],
  "negative_global_styles": ["vocals", "fade-out ending", "four-on-the-floor"],
  "sections": [
    { "text": "[Build] {low strings enter, rising figure, taiko joins}",
      "duration_ms": 26000,
      "positive_styles": ["slow build", "low brass", "taiko"],
      "negative_styles": ["full percussion", "melodic lead"],
      "context_adherence": "high" },
    { "text": "[Release] {full hit on downbeat one, then sparse afterglow}",
      "duration_ms": 12000,
      "positive_styles": ["percussive hits", "sparse", "hard ending on the beat"],
      "negative_styles": ["fade-out"],
      "context_adherence": "high" }
  ]
}
```

Tempo note: the hit is wanted 26s in; at 110 BPM a bar is ~2.18s, so 26s
is not whole bars — 120 BPM (2.0s bars, 13 bars) or 92 BPM (~2.6s, 10
bars) both land it. The plan's duration carries the decision; the tempo
word goes in the build section's styles.
