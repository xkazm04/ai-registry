---
domain: media-generation
subject: sound-effect-generation
last_touched: 2026-08-27
touched_by: librarian
dry_streak: 0
---

# sound-effect-generation

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-08-26 - `/intake`, forged as part of the new audio-generation category

Born with 4 techniques (`envelope-first-briefing`,
`trailer-punctuation-grammar`, `loop-seam-acceptance`,
`layered-element-assembly`), no applications yet - the consumer tree renders
music cues but has no effects pass, so nothing could be verified against a
real tree honestly. Source: [[2026-08-26-composer-song-editor]].

Boundary decisions: envelope-first vs the music subject's section plans (the
tell for misrouted briefs: an effect brief that wants a key is a stinger and
belongs to composition). Placing effects in a game world - budgets,
priority, occlusion - is `game-production/spatial-audio-scene-authoring`'s
job, stated on both sides in prose per the discriminator rule; that subject's
"silent placeholder" failure mode is the treaty line (the scene names what it
needs, it does not produce it).

### 2026-08-27 - `/librarian run`, the banked lead comes due PARTIALLY

Dispatched because it was the only subject of 335 with zero applications
[6 points]. The dispatch was re-scoped mid-flight once this note was read: the
zero was a *deliberate* decline with a return condition, not an oversight, so
the worker's question became "has the condition arrived?" rather than "bind the
techniques". Recorded because the counter is what surfaced the subject and the
counter alone would have produced the wrong work.

**Verdict: arrived partially.** The tree rendered its first effect on
2026-08-26 - `762aef7`, "sfx (2.000s briefed, 2.038s delivered)", the `hit`
preset, n=1, read by hand - but the seam's only caller is a playground bench.
No effects lane exists in the pipeline: `TrackId` remains `video | vo | music`
and `Cue` carries `bpm` by construction.

Landed 3 node applications (`envelope-first-briefing`,
`trailer-punctuation-grammar`, `loop-seam-acceptance`), each carrying
`verified_against: node@24`. `layered-element-assembly` **declined** - the
generator returns one file and the bench drops the previous take on the next
click; there is no take store, no element library, no mix. An invented binding
would have been worse than the zero.

Sharpest finding, a consumer defect rather than a corpus one: the adherence
doctrine is a docstring, not a default. The seam omits the adherence field from
the wire body when the caller sends nothing, so the vendor's fishing-tuned low
default stands for every caller but the one UI that seeds it explicitly. A
chokepoint that exists to enforce doctrine does not enforce it.

## Open leads

- **Met 2026-08-27, partially.** The banked "write a node application when the
  tree renders its first effect" is discharged for three techniques against a
  bench-driven seam.
- **New: when an effects lane enters the pipeline** - `TrackId` gains an sfx
  member, or an effect cue type exists that is not `Cue`, or the seam gains a
  caller outside the playground. Then rewrite
  `node--trailer-punctuation-grammar` (placement becomes real) and add the
  acceptance instrument to `node--loop-seam-acceptance`.
- **New, independent: when a looping effect is rendered live.** `loop` is wired
  through the whole seam and declared at generation, but the only witnessed
  render is the non-looping hit, so that application asserts plumbing only.
- **Still open, unmet:** `process--envelope-first-briefing` with a vendor
  parameter table needs a second vendor to price the comparison. The tree's own
  seam plan states there is no equivalent from its other provider, so this tree
  cannot supply the second column.
- **Unexercised:** four of five bench presets have never been rendered; the
  vocabulary's cutoff and tape-stop elements do not ship at all.
