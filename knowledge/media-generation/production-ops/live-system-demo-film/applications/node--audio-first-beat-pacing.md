---
layer: application
type: application
subject: live-system-demo-film
technique: audio-first-beat-pacing
stack: node
status: forged
verified_on: 2026-09-16
verified_against: node@22
---

# Audio-first beat pacing in a script-and-harness demo build

A portable agent runtime produces a four-act demo film of its own three example
applications, driven end to end from a JSON script by a Playwright spec and
assembled with ffmpeg. Read at commit `c5ec8cae64022f8252f73d65844e4457c3f1adc6`;
`package.json:17` declares `"node": ">=22.5"`.

## The doctrine is stated in the production plan, not inferred from the code

`docs/demo.md:10` opens the production section with the rule in four words —
**"Audio first, video paced to the audio."** — and the same line states both
consequences the technique claims: `docs/demo.md:13-14` "The video is therefore
never faster than the voice, and a re-take after a script change is one command,
not an editing session."

The three-phase pipeline is drawn at `docs/demo.md:16-28`: `docs/demo.md:19`
"1. narrate   ElevenLabs text-to-speech, one mp3 per beat, durations measured",
`docs/demo.md:22-23` "2. record    the journey in recording mode: one beat at a
time, each beat held for / max(clip duration, page settle)", and
`docs/demo.md:26` "3. compose   ffmpeg lays the clips on the video at the beat
offsets the recorder logged".

## One module owns the clock

`examples/journey/src/script.ts:6-8` states the single-authority rule in the
file header: "This file is the only place that knows how long a beat lasts:
`take/audio/durations.json` when `narrate.mjs` has measured the real clips, and
the script's own words-per-second estimate when it has not."

The formula is two functions. `examples/journey/src/script.ts:127-132`:

```ts
export function clipMsOf(beat: Beat, script: Script, measured: Record<string, number>): number {
  const known = measured[beat.id];
  if (known !== undefined) return known;
  const words = beat.line.split(/\s+/).filter((word) => word.length > 0).length;
  return Math.round((words / script.words_per_second) * 1000);
}
```

and `examples/journey/src/script.ts:135-137`, whose doc comment at
`examples/journey/src/script.ts:134` is the formula verbatim — "`max(clip,
settle) + breath`, from the moment the beat's actions start":

```ts
export function holdMsOf(beat: Beat, script: Script, measured: Record<string, number>): number {
  return Math.max(clipMsOf(beat, script, measured), beat.settle_ms) + script.breath_ms;
}
```

The declared fallback rate and the breath are script data, not literals in a
function: `docs/demo.md:59-60` "Timings are estimates: narration at 2.5 words per
second, plus the page's settle time for the beat's action, plus a one-second
breath between beats."

## Timing from action start, in the beat loop

`examples/journey/tests/take.spec.ts:1473` takes the clock **before** the beat's
actions (`const startedAt = Date.now();`), the actions and any typing run at
`examples/journey/tests/take.spec.ts:1486-1491`, and the residual wait is
computed against that same origin at
`examples/journey/tests/take.spec.ts:1499-1500`:

```ts
const remaining = holdMs - (Date.now() - startedAt);
if (remaining > 0) await page.waitForTimeout(remaining);
```

The mark written for the assembler uses the same two instants —
`examples/journey/tests/take.spec.ts:1503-1504` `start_ms: startedAt - contextAt`
and `end_ms: Date.now() - contextAt` — so the offset the compose step reads is
the offset the hold was computed from. There is no second clock.

## Sub-consumers of the hold are budgeted from the remainder

This tree is where the standard's "the hold has consumers inside it" clause came
from. The on-screen typing of a spoken line is sized from what is left of the
clip at the moment typing starts, not from the clip —
`examples/journey/tests/take.spec.ts:1490`:

```ts
await strip.typeCommand(beat.line, Math.max(600, clipMs - (Date.now() - startedAt)));
```

and the overlay then takes a fraction of that budget with a floor,
`examples/journey/src/strip.ts:361` `[text, Math.max(400, Math.round(overMs * 0.8))]`.
The comment at `examples/journey/tests/take.spec.ts:1485` states the property
the arithmetic buys: "The typing then takes 80% of what is left of the clip, so
it still finishes inside the beat." The same idea is generalised at
`examples/journey/tests/take.spec.ts:255` — "How long this beat is held for, so a
beat with two pictures can give each of them a share."

## Measured, not estimated

`examples/journey/scripts/narrate.mjs:266-279` measures the rendered clip rather
than predicting it, shelling out to `ffprobe` for `format=duration` and rounding
to milliseconds; `examples/journey/scripts/narrate.mjs:277` refuses a
non-finite answer rather than defaulting ("throw new Error(`ffprobe gave no
duration for ${file}`)"). Measurement runs over every beat in scope on every
run, including the ones that were skipped —
`examples/journey/scripts/narrate.mjs:409` "Nothing to synthesize; measuring what
is on disk." — so a durations record is never stale relative to the audio beside
it.

Coverage of the durations record is reported rather than assumed, at
`examples/journey/scripts/narrate.mjs:489-491`:

```js
const missing = allBeats.filter((b) => durations[b.id] === undefined).map((b) => b.id);
if (missing.length > 0) console.log(`durations.json still missing: ${missing.join(', ')}`);
else console.log(`durations.json covers all ${allBeats.length} beats.`);
```

and the recorder prints the same fact at the head of the take,
`examples/journey/tests/take.spec.ts:1468`: "`${beats.length} beats,
${Object.keys(durations).length} measured clips`".

## Deviation: the estimate is stored where the measurements live

The dry mode at `examples/journey/scripts/narrate.mjs:341-374` prices and paces
the whole film without spending — which is the technique's own rehearsal
provision — but it writes its estimates into the *same* record the pacer reads
as measurements. `examples/journey/scripts/narrate.mjs:345-346` computes
`ms` from the words-per-second constant and assigns `durations[beat.id] = ms`,
and `examples/journey/scripts/narrate.mjs:356` persists that record to
`durations.json`. The only mark distinguishing the run is
`examples/journey/scripts/narrate.mjs:361` `dry: true`, written into the
*manifest*, a different file that `clipMsOf` never opens.

Consequence, against the standard's rules 2 and 3: after a dry run, every beat
is paced by an estimate that is indistinguishable from a measurement at the
point of use, and nothing in the recorder can refuse to deliver a cut on that
basis. The standard's requirement is that the unmeasured mark ride with the beat
into the record the pacer consumes; the repair here is to key the mark by beat
id in `durations.json` itself (or to have the dry path write only the manifest),
and to fail a delivery take on any estimated beat. The standard stands; this is
a gap in the tree.
