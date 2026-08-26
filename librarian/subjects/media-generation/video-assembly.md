---
subject: video-assembly
domain: media-generation
last_touched: 2026-08-27
dry_streak: 0
---

# video-assembly

First note: [[2026-08-26-joyai-echo]] - /intake run 23. Subject predates the notes (forged 2026-08-19).

## State

6 techniques, 2 applications (process, react). The subject's posture is that a timeline is a document of record and a generated clip is a candidate held to the same bar as delivered footage. Two techniques took amendments in one run and they are related: both are places where the subject's rules assumed a *separated* pipeline.

## 2026-08-26 - /intake run 23 ([[2026-08-26-joyai-echo]])

- `generated-shot-sourcing` - **adjacency anchoring does not scale to a chain.** The technique called head-and-tail anchoring "the strongest structural defense against mid-clip identity drift"; that superlative is true per seam and false per sequence, because each link's reference is a generation rather than the original, so error compounds while every seam still passes inspection. Landed `pin the origin, roll the recent` with the two bounds a validator in the source asserts (pinned portion strictly smaller than the bank; rolling portion at least one full step wide).
- Strongest evidence of the run: the source implements that policy **twice, independently, at two altitudes** - a shot-level memory bank with its first slots pinned, and a per-layer attention cache with a persistent sink in a bounded window. Different mechanisms reaching one policy is the best available argument that the policy is about long horizons and not about either implementation.
- The consequence worth carrying: **pinning promotes early shots into permanent evidence.** Only accepted material is ever pinned, and the opening of a long chain becomes the most expensive review in the run - which contradicts the technique's own closing advice to generate rough and provisional while the picture is fluid. Written as the stated exception it is, not silently.
- `music-spotting-against-picture` - **when the soundtrack is not separable, spotting moves upstream.** A model emitting picture, dialogue, effects and score as one waveform removes every lever that works by adjusting levels. The music decision survives; its binding moment moves to brief time, addressed in shots rather than timecode, with ducking expressed as an instruction (weaker than an automated duck - verify on the returned clip).
- That amendment also breaks a neighbour's enumeration: `generated-shot-sourcing`'s keep / demote / strip options for baked audio all presuppose separability. Recorded on both sides with a pointer rather than duplicating the material.

## Open leads (banked, with return conditions)

- **Paired memory anchors on the modality that can be empty.** The source selects its audio memory window by maximum spectral energy and then picks the video frame from *that window's* time range - audio chooses the moment, video follows, because a frame is representative anywhere while a voice only exists where there is energy. Real, narrow, one implementation. Return when a second system selects cross-modal memory slots on an informativeness proxy rather than on position.
- Neither amendment has an application. Return when a connected tree runs a chain long enough for compounding drift to be measurable - the measurement is a comparison against the *origin*, not against the neighbour, and that is precisely the review nobody runs.
- Untriaged from the same source: a memory slot that records *why* its selection degraded (falls back to center selection on exception and writes the reason into the slot's metadata). Provenance-of-degradation; small, but the shape fits this subject's document-of-record posture.

## 2026-08-27 - /intake run 24 ([[2026-08-27-video-workflow-batch]])

- NEW technique `motion-plate-library`: the layout-reel/animatic split of traditional animation restored as a sourcing channel - appearance-free motion plates (flat, low-detail, cheapest tier) banked by motion class and restyled at use with the project's references. The plate is the asset, the bound render the disposable; live footage normalizes into a plate too. Sits beside generated-shot-sourcing, which keeps frame-exact continuity cases.
- Two amendments on `generated-shot-sourcing`: **extensions are briefed from the output, not the brief** (the accepted clip is the authority on what happened; the prompt-writer analyzes actual frames before writing the continuation; the clip wins conflicts with intent - 2 sources) and **the anchor imports its maker's texture** (an image-model start frame carries its smoothed finish into the whole clip; mint anchors from the motion model itself - still-subject clip, or a cuts-every-second brief that harvests an angle library; references over anchors when staging must stay free - the rung decision now carries texture provenance and staging freedom as costs, not just control as a benefit).
- The conditioning ladder is becoming this subject's spine: three of the last four findings here attach to it. If a fifth arrives, consider promoting the ladder plus its riders into the golden path body rather than accreting sections.
