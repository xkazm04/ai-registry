---
source: batch
kind: batch
url: "https://pika.art/blog/pika-h3-flex, https://elevenlabs.io/blog/cue-aligner, https://docs.fish.audio/features/text-to-speech/drama-3"
title: "Video and voice for productions, /shift batch of 3 web pages from 3 vendors"
author: "3 vendors: Pika; ElevenLabs; Fish Audio"
words: unknown (read through fetch summaries)
extracted: 36
accepted: 0
declined: 0
leads: 4
already_covered: 12
untriaged: 8
currency: 4
dispatched: 0
applied: 0
shipped: 0
run_id: shift-video-and-voice-for-productions
siblings: 1
fetches: 12
---

# Video and voice for productions, mined under /shift, 2026-11-11

Plan `plan-web-20261110`, cluster `video-and-voice-for-productions`, board run
`shift-video-and-voice-for-productions`. The question: what gravitone's casting and audio stages should use.
Two decisions sit under it: the dialogue route (ref-audio or dub, an open operator verdict on replica
`shift-replica-voice-refaudios`) and whether a voice engine sits beside ElevenLabs. Three vendor pages:
P = Pika's H3 Flex post, C = ElevenLabs' forced-alignment model post, F = Fish Audio's Drama 3 docs. Miners
spent 9 fetches (3 each), all returned as summaries rather than verbatim text. The lander spent 3: the H3
Flex model card's README, Fish's Drama 3 page and Fish's pricing page, read for verbatim quotes. No GPU, no
API call, no download, no install. gravitone was read only (HEAD `407f0aec`). Phase 7.7: gate=skipped.

**Expected yield, stated first:** three vendor release pages, so numbers and request shapes, and catches on
craft the corpus already owns. Nothing in `knowledge/` from the sources themselves. That held.

**Voices:** three vendors, one voice each, and they share no claim. The only overlap is that each leaves the
dialogue verdict where it is. So there is no within-batch convergence. The one cross-run convergence is
row C5, a third sighting of a banked lead.

**Admission:** the +3 bar governed 4 scored rows (P7 2/1/1, C5 2/2/1, C6 2/2/2, F9 1/0/1), and none clears
it. `auto=0/4/0 fp=0`: no miner accepted anything. Currency rows and leads ran under the corroboration table.

## What landed

Nothing in `knowledge/` beyond one currency line. That line is a dated note on the 2026-08-20 casting-ledger
application (`process--spoken-delivery-direction`): Fish's newest model has a different direction dialect
and bills per UTF-8 byte. Later-voice lines went on three earlier notes: the 2026-11-06 tiled-sampler note
(row 4, re-framed), the 2026-11-10 shot-fix note (lead A11, a new arm), and the 2026-09-02 on-device speech
runtime note (its word-timestamp lead, third sighting). Two rows were banked:

- `shift-replica-voice-refaudios-d1`: a held **CPU** row. It adds an aligned dub arm (D1) to the existing
  voice replica, using ffmpeg only.
- `shift-proof-h3-flex-fl2va-6step`: a held **GPU** row. It waits for the operator to approve a night
  download.

No project was touched.

## Source P: H3 Flex, the vendor's post and model card

A vendor release announcement, and the third look at this release. On 2026-11-06 a run read the repo (row 4,
lead), and on 2026-11-07 a run marked it `reconsider?`. The repo read is the higher tier.

| # | Candidate | Outcome | Prior art and reason |
| --- | --- | --- | --- |
| P1 | A post-trained H3: two LoRA adapters (FL2VA, Ref2VA), six steps instead of 50 | Already covered | 2026-11-06 row 4 |
| P2 | Same licence as base H3; the adapters are "Model Derivatives" | Currency, ledger only | The card, read verbatim by the lander: "distributed under the MiniMax H3 Community License Agreement". The 11-06 territory flag applies unchanged. The operator has already acknowledged the H3 licence |
| P3 | Six evaluations on FL2VA as well as Ref2VA | Lead, re-framed (below) | The 11-06 return condition ("if four-step quality falls short") compared Flex with the Ref2VA 4-step turbo. gravitone's hero and rough route is FL2VA with the **8-step** fl2v turbo at 1280x704, about 20 min a clip according to its graph header. That route was never covered |
| P4 | Generic six-step sampling does not reproduce the adapter | Untriaged, scored as P7 | 11-06 quoted the repo on it |
| P5 | ComfyUI render "not verified" (11-06) against "templates provided" (miner's summary) | **Currency, settled verbatim** | The card's README today: "use the R2V workflow, FL2VA workflow or T2V workflow" and "Comfy-format BF16 LoRA weights are included in comfy/loras/". The "not verified" sentence is gone. What remains is "Exact reproduction with the released package is not guaranteed". So the wiring risk on P3's trial is lower than 11-06 recorded. No LoRA file is named on the card |
| P6 | Ref2VA reference limits: up to 9 images, 3 videos, 3 audio clips; 2-15 s per clip | Already covered | Stock Ref2VA already takes `ref_audios`. The 2 s floor is stated for Flex and is unknown for stock. The replica's line is 4.88 s. Limits as summarised, not read verbatim |
| P7 | (strip of P4) a few-step adapter's schedule is its contract, not a step count | Untriaged, 2/1/1 | No subject owns it. Vendor doc plus convergence. Untested here |
| P8 | Hosted "reference-guided editing" keeps performance and timing | Lead, an arm for A11 (below) | Hosted claim only; the open card names no edit mode |
| P9 | 15 s clips, 24 fps, 5-15 s requests rounded up (5 s = 124 frames) | Already covered | 124 frames is gravitone's `H3_FRAMES` |
| P10 | "Seven seconds of transformer computation" for 15 s | Nothing | A hosted benchmark on accelerated serving, and its own footnote undercuts it |
| P11 | Hosted-only upsampler and five audio stems | Untriaged | Real, but no fleet decision rests on it |
| P12 | A leaderboard rank at launch | Nothing | A launch snapshot |

**P3 re-framed, banked as `shift-proof-h3-flex-fl2va-6step`:** Flex FL2VA at 6 steps against stock FL2VA
8-step turbo, on one kept hero beat with the same first and last frames, prompt and seed, at 1280x704 and 124
frames. There is also a second seed of the stock arm as the floor. First and last frames pin the scene,
so a whole-clip floor is meaningful. Wall time is read from `/history`. **It does not run until the operator
approves a night download of the Comfy FL2VA LoRA.** Its `notBefore` is a placeholder, and the operator moves
it to the approved night. Only `comfy/loras/` is fetched, never the base bundle. The six-step sigma knots come
from the vendor's FL2VA workflow and never from a generic scheduler. `render.use`: gravitone Production
`hero` and `rough` takes. If Flex holds the look at 6 steps, every clip on the most expensive route gets
cheaper. Licence: the same H3 licence, already acknowledged.

**P8 as an arm for A11:** recorded on the 2026-11-10 shot-fix note. The stock Ref2VA node exposes a group
named `ref_video_audios`. That is a group name read from `/object_info` and nothing more. Whether a video
reference carries timing or only appearance is what the arm would find out. No row is banked: A11's
return condition has not fired.

## Source C: forced-alignment model post

A vendor release announcement with a benchmark table. Every accuracy number in it is the vendor's own. The
corpus is ahead on craft: `speech-timing-timeline` ranks forced alignment as the fallback timing source, and
`drift-correction` owns the sync thresholds. Two discrepancies were kept as found: the post says the
benchmark covers 29 languages and also "more than 90"; the capability page says 3 GB per file and the API
reference says 1 GB. Both are as summarised.

**The seam, read by the lander.** gravitone's dub route lays line i at take i's opening + 0.2 s
(`productionCutActs.ts` `lineStarts`). Nothing reads where speech begins inside the voice file, or where a
mouth moves in the take. The replica's arm C muxes the cast WAV over arm B's picture from t=0, and B's mouth
speaks to B's own soundtrack, with different timing. **So the dub arm C is an unaligned dub. It does not
stand for the dub route at its best.**

| # | Candidate | Outcome | Prior art and reason |
| --- | --- | --- | --- |
| C1 | A character-level aligner over audio plus known text, as a hosted call | Currency, ledger only | A vendor gravitone already holds a key for. Billed at the speech-to-text rate; the rate was not read. Field names as summarised, not quoted |
| C2 | Mean timing error 179 ms on full recordings, 57 ms on noisy English | Dated fact, feeds C5 | Vendor benchmark |
| C3 | Songs: 92.7 % of words within 0.3 s | Feeds C5 | A 0.3 s window is a caption tolerance |
| C4 | Long files in one pass; chunk seams accumulate error | Already covered | `segment-on-the-master-clock`, `drift-correction` |
| C5 | (strip of C2+C3) choose an aligner's tolerance from its consumer: captions tolerate ~300 ms, lip-sync needs ~45 ms early / ~125 ms late | Untriaged, 2/2/1 | **Third sighting** of the 2026-09-02 lead (word-timestamp accuracy is its own measurement). Recorded on that note |
| C6 | (from the seam) when the generator speaks the line, its soundtrack is a guide track: align the cast voice to it | Untriaged, 2/2/2 | A new technique in `video-assembly` if arm D measures inside threshold. The open question is whether the mouth follows the generator's own sound closely enough to be a guide |
| C7 | A low-resource language fix shipped in 24 h | Nothing | Vendor ops |
| C8 | One hour aligned in ~0.5 s | Nothing | Hosted throughput |
| C9 | A word-level benchmark cannot certify character-level output | Untriaged | `unmeasured-is-not-pass` already carries it |
| C10 | Diarized text is not supported | Already covered | gravitone's dub route has one role, one line and one file |

**Arm D, banked as `shift-replica-voice-refaudios-d1` (CPU, ffmpeg, no GPU, no API).** The free variant
needs no aligner. It finds the first-speech onset of B's soundtrack and of the cast WAV from the energy
envelope (`silencedetect`), delays the WAV by the difference, and muxes it over B's picture as C was made.
Its output joins the existing replica page beside A and C, so the operator's one verdict sees an aligned
dub. Kill: if B's mouth does not follow B's own sound, there is no guide track and D is moot. `render.use`:
the dialogue-route decision. **The word-by-word variant (D2, a per-word warp onto the guide's word grid) is
not banked as runnable.** It needs either the vendor's paid alignment call (three calls of about 5 s each,
the operator's spend, plus a spend class nothing wires today) or a local aligner install whose ARM64 Windows
availability is unverified. The operator chooses between them.

**Seam proposal for gravitone (read only, not changed):** start each line at its first speech, not its
first sample. Measure each voice file's leading silence and lay it at `mark - leadingSilence`. Measure:
the spread of first-speech times across a cut's lines, which today equals the spread of the files' leading
silences and afterwards is zero. It is a small, pure change testable in `lineStarts`. Whether the route
stays dub is the open verdict, so it waits for an `/intake apply` row in gravitone after that verdict.

## Source F: Fish Audio Drama 3 docs

The vendor's reference documentation, the primary that its class says to fetch. The page makes no
numeric quality claim. The corpus owned every craft point.

| # | Candidate | Outcome | Prior art and reason |
| --- | --- | --- | --- |
| F1 | Model chosen by a `model` header. Verbatim: "If the `model` header is missing or misspelled, the request doesn't fail: it falls back to `s2.1-pro`." | Already covered | `never-the-account-default`: a live vendor-side fallthrough |
| F2 | A bracketed direction before the words it covers, and seven paired span tags | Already covered, currency line | `inline-direction-dialect`. The dialect changed from the 2026-08-20 ledger row; see the currency note there |
| F3 | Multi-speaker in one call, with speaker-turn tags | Already covered | `multi-speaker-speech-production`, `line-addressed-re-render` |
| F4 | Phoneme tags and a pronunciation dictionary of up to 3 entries | Already covered | `world-lexicon-as-pronunciation-dictionary`. As summarised |
| F5 | Zero-shot reference audio; msgpack body | Already covered | `cast-ledger-with-consent`. gravitone's casting door sends no reference audio by design |
| F6 | Sampling defaults; no seed parameter listed | Already covered | `line-addressed-re-render` (a seed is best effort). As summarised |
| F7 | Price per million UTF-8 bytes | Currency | Verbatim: "TTS pricing is based on the size of input text, measured in millions of UTF-8 bytes"; `drama-3` list price $50.00 per M UTF-8 bytes. No like-for-like comparison with the wired engine is possible, because gravitone's table carries no rate for `eleven_v3` |
| F8 | "S1 is deprecated and will be retired on December 31, 2026." | Already covered | `re-cast-gate` names model retirement as a trigger. gravitone has no Fish wiring |
| F9 | (strip of F7) byte-billed speech charges non-Latin lines more than a per-character table predicts | Untriaged, 1/0/1 | No subject owns byte-unit billing. gravitone's kernel pricing rows are per character, a seam that matters only if the engine is wired |
| F10 | `language` drives normalization and word-timestamp alignment, but no timestamped response is documented | Lead | Return when a Fish page documents a timestamped response and a second engine is wired |
| F11 | The model "may switch language on its own" in mixed-language text | Untriaged | A vendor's hedge against itself, banked with its anchor; no subject owns mixed-language lines in this map |
| F12 | Output formats; default mp3 at 44.1 kHz | Nothing | Matches gravitone's ElevenLabs output |
| F13 | Licence, commercial use, ownership of output, clone consent | **Gap** | Absent from all three pages, confirmed on the two the lander re-read. **Any production use waits on reading Fish's terms** |
| F14 | Three stock library voices | Nothing | Not extracted |

**A second engine is an E1 direction, the operator's, and only proposed here.** The instrument for it is a
blind listening pair on one line the operator already kept on `eleven_v3`. Arm B is the same text on
`drama-3`, with the same neutral direction compiled to its dialect, a library voice for the same role brief,
never a clone, and engine and direction hidden. Two questions: is the written direction audibly performed,
and which would you cast? A second pair drops the tag to check that it does anything. **Held, not banked:**
it needs an account, a key and spend, all the operator's, and the F13 terms read first. Return when the
operator asks for a second engine, or when `eleven_v3` fails a direction on a kept line twice. The seams it
would touch in gravitone (a direction compiler keyed on one model, a per-character pricing unit, a header
with a silent fallback, msgpack for inline references) are listed in the miner's report and are not code
to write now.

## Leads

- **P3, H3 Flex FL2VA 6-step against 8-step turbo.** Banked as a held GPU row behind the operator's download
  approval. It replaces the 11-06 return condition for gravitone's FL2VA route.
- **P8, a no-download arm for A11.** Recorded on the shot-fix note; A11's return condition is unchanged.
- **C6, the guide-track alignment.** Return when arm D's residuals exist. If D lands inside threshold on most
  words, write it in `video-assembly` with the residual table. If it fails, the failure is an amendment to
  `unreferenced-channels-resample`.
- **F10, Fish word timestamps.** As in the table.

## For the cluster question

**Dialogue route:** none of the three sources settles it, and the verdict stays the operator's watch. What
changes is the comparison: an aligned dub (D1) now joins A and C on the same page, so a dub verdict is no
longer a verdict on an unaligned dub. **Voice engine:** ElevenLabs stays. A second engine is an operator
direction, it is blocked on Fish's terms, and its instrument is specified above. **H3 route:** unchanged
until the Flex trial runs.

## Not landed

No bundle changed beyond the currency line. Three vendor voices on their own products authorize nothing
higher, and every scored row sits below +3. Nothing higher was earned: the one convergence (C5) is three
sightings of a measurement protocol, and two of them are vendors measuring themselves.
