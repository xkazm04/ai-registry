---
layer: application
type: application
subject: live-system-demo-film
technique: recording-that-asserts-its-claims
stack: node
status: forged
verified_on: 2026-09-27
verified_against: node@24
refresh_by: 2026-12-28
---

# The take that is also the test suite

The same portable agent runtime records its demo film by running a Playwright
spec, `examples/journey/tests/take.spec.ts`, against the same three example
applications, the same tool gate and the same ledger that its ordinary
end-to-end suite exercises. Read at commit
`c5ec8cae64022f8252f73d65844e4457c3f1adc6`; `package.json:17` declares
`"node": ">=22.5"`. Re-read 2026-09-27 at
`c48c9b0c93c96db16073ba333dd3ca91816407d1`, with the demo paths unchanged
between the two and the example typechecking clean under node 24.14. The
capture section below is a claim about one pinned Playwright release, which is
why this application carries a vendor clock of its own.

## The doctrine is in the file header

`examples/journey/tests/take.spec.ts:11-12` states the technique's premise in
one sentence: "It is also a test, and deliberately: a recording that shows a
gate being honoured while the gate was not honoured is worse than no recording."
The sameness of the machinery is explicit at
`examples/journey/tests/take.spec.ts:4-6` — "the same journey
`tests/journey.spec.ts` asserts, through the same bridge, the same gate, the same
approvals, the same ledger, the same brain and the same connector fakes — run at
the pace of the narration instead of as fast as the apps answer."

The failure policy is declared in the same header,
`examples/journey/tests/take.spec.ts:15-17`: "A beat that throws is *recorded* in
`take/take.json` as `error` and the take carries on, because losing twenty
minutes of video to one moved field is the one outcome a recorder must not have;
the test then fails at the end if any beat errored."

## Assertions land on rendered text

`examples/journey/tests/take.spec.ts:236-238` states the rule as the reason the
helper returns a string at all: "The card's rendered text comes back so the take
can assert on *what the audience sees* rather than on the arguments it passed: a
card that printed the wrong count would then be a red beat, which is the only
way a recording can be trusted about a number." The assertion itself is
`examples/journey/tests/take.spec.ts:250`:

```ts
expect(shown, `the card prints the count ${label} actually listed`).toContain(String(own.length));
```

followed at `examples/journey/tests/take.spec.ts:251` by a per-name check that
each gated capability is printed on the card by name. The expected count is
derived on the spot from the surface the beat just listed
(`examples/journey/tests/take.spec.ts:241-243`), so the card is compared against
the system rather than against a constant.

## Record-and-carry-on, implemented

`examples/journey/tests/take.spec.ts:1476-1497` wraps every beat's actions in a
`try`/`catch` whose handler records rather than rethrows —
`examples/journey/tests/take.spec.ts:1495` `error = (caught as Error).message;`
— and the comment at `examples/journey/tests/take.spec.ts:1493-1494` gives the
reason ("A beat that breaks must not cost the recording... The test fails at the
end, with every failed beat named"). The hold and the mark still run for a
broken beat (`examples/journey/tests/take.spec.ts:1499-1507`), so the timing of
every later beat is undisturbed and the error travels into `take.json` beside
its offsets at `examples/journey/tests/take.spec.ts:1506`.

The end-of-run gate is `examples/journey/tests/take.spec.ts:1544-1548`:

```ts
const broken = marks.filter((mark) => mark.error !== undefined);
expect(
  broken.map((mark) => `${mark.id}: ${mark.error ?? ""}`).join("\n"),
  `${broken.length} of ${marks.length} beats errored (the take was still recorded)`,
).toBe("");
```

Comparing the joined list against the empty string is what makes the failure
name every broken beat at once rather than only the first.

## Expected figures are derived from the script

This tree is where the standard's "derive the expected figures from the script"
rule came from. `examples/journey/tests/take.spec.ts:1514-1517`:

```ts
// How many declines the film has is the script's call (cut A declines twice, cut B once); what
// is not negotiable is that every decline the script stages is ledgered as the user's decision.
const staged = beats.filter((b) => /declin/i.test(b.screen ?? "")).length;
expect(denied.length, "every staged decline is ledgered user_denied").toBe(Math.max(1, staged));
```

The invariant is fixed; its arity is read out of the script, which is what lets
two different scripts (a forty-two-beat long take and a two-minute cut, per
`examples/journey/tests/take.spec.ts:19-23`) share one assertion set. The
remaining end-of-run assertions follow the same shape: every gated execution
names a granted approval (`examples/journey/tests/take.spec.ts:1520-1523`),
every connector write names an allow-listed target
(`examples/journey/tests/take.spec.ts:1526-1532`), and every remembered fact
cites a ledger row that actually exists
(`examples/journey/tests/take.spec.ts:1536-1539`).

## The take's mechanics

**One context, one page, one capture.**
`examples/journey/tests/take.spec.ts:296-302` gives the reason in the comment —
"recordVideo writes a video per page, and a second tab would be a second video
the compose step has no offsets for" — and the video is deliberately not behind
an environment flag the way the ordinary journey's is.

**A pre-roll that warms the system.**
`examples/journey/tests/take.spec.ts:307-314` walks all three applications once
before beat one, with the justification the standard now carries:
`examples/journey/tests/take.spec.ts:307-310` "A first navigation to a cold route
costs seconds, and a beat that spends its hold compiling is a beat whose picture
arrives after its line. The pre-roll is on the video; every beat carries its own
measured offset, so the compose step lays the audio after it rather than over
it."

**Ordering inside a beat, for a mechanical reason.**
`examples/journey/tests/take.spec.ts:1481-1485` explains why a speaking beat
performs its action before it types: "a typing animation still running in the old
document when the new one loads is an evaluate against a destroyed execution
context." The implementation is
`examples/journey/tests/take.spec.ts:1486-1491`.

**Uncertainty stated where it is created.**
`examples/journey/tests/take.spec.ts:100-104` declares that the capture's start
frame is not observable and that every offset is therefore a difference of wall
clocks, "stated in the file rather than left for the compose step to discover";
the number is written into the offsets record at
`examples/journey/tests/take.spec.ts:335` as `video_offset_uncertainty_ms`.

**One unambiguous output.** `examples/journey/tests/take.spec.ts:321-326` saves
the capture under the name the assembler expects and then deletes the tool's own
hashed copy, because — `examples/journey/tests/take.spec.ts:323-324` — "the
hashed original beside it would be a second nine-megabyte file with no offsets
and nothing to say which of the two the compose step should use."

## Deviation: claim coverage is not reported

Every assertion in this take is genuine and lands on rendered text or on the
record, but nothing computes **how many of the film's spoken claims are
asserted**. The end-of-run block checks a fixed set of runtime invariants
(`examples/journey/tests/take.spec.ts:1512-1539`) and individual beats assert
their own cards, yet a beat whose line states a behaviour that no assertion
covers passes silently and is indistinguishable, in `take.json`, from a beat
whose claim was checked. The standard requires that an unasserted behavioural
claim be reported as unmeasured and counted; the tree has the per-beat record
(`examples/journey/tests/take.spec.ts:1501-1507`) to carry such a flag and does
not yet use it. The standard stands.

## The capture tool's ceiling, as of Playwright 1.63.0

`examples/journey/package.json:17` pins `@playwright/test` at `1.63.0`, and what
that release's `recordVideo` does was read from the installed package rather
than from its documentation page.

**The size is set, so the default downscale is avoided.** The option's own
declaration (`playwright-core/types/types.d.ts:25993-25995`, on
`BrowserContextOptions`) reads "If not specified the size will be equal to
`viewport` scaled down to fit into 800x800." The take passes the viewport
dimensions as the video size (`examples/journey/tests/take.spec.ts:300-301`,
1440 x 900 from `examples/journey/tests/take.spec.ts:97-98`), so the capture is
not silently shrunk to 800 x 500.

**The bitrate is not the take's to set.** The encoder arguments are fixed in
the release (`playwright-core/lib/coreBundle.js:37095`): `-c:v vp8 -qmin 0
-qmax 50 -crf 8 -deadline realtime -speed 8 -b:v 1M`. The option exposes a
directory and a size and nothing else, so a 1440 x 900 picture of dense text is
encoded at one megabit per second before the compose step ever sees it, and
the compose step's `libx264` re-encode
(`examples/journey/scripts/compose.mjs:211-215`) cannot restore what the first
encode discarded. For a film whose picture is text the audience must read, that
is the quality ceiling of the whole pipeline, and it is set by the tool.

**The start frame is the page's creation, not the first beat.** The recorder
stamps `this._creationTimeMs = Date.now()` (`coreBundle.js:37087`) and times
every frame from it (`coreBundle.js:37133`), exposing the instant only as
`creation_time` metadata in the file (`coreBundle.js:37096`). That is the
mechanism behind the uncertainty the take writes down as
`video_offset_uncertainty_ms`: the spec's wall clock and the recorder's clock
start at different instants, and nothing in the API reports the gap.

**The same release ships a capture that closes both gaps.** `page.screencast`
(`types.d.ts:18621`, "Interface for capturing screencast frames from a page.")
accepts a `quality` (`types.d.ts:18658`) and an `onFrame` callback that
receives each frame with a `timestamp` (`types.d.ts:18652`). Frames the take
receives itself can be encoded at a bitrate the film chooses, and a timestamp
per frame turns the declared offset uncertainty into a measured offset. The
technique does not require either; it requires that the uncertainty be stated,
and the tree states it. This is the dated upgrade path, and the reason for the
clock on this document.

## Soft assertions would not replace the carry-on policy

The take is a Playwright test, so the runner's soft assertions - which record a
failure and let the test continue - are available to it, and it uses none
(`expect.soft` has no occurrence in `examples/journey/tests/take.spec.ts`).
That is correct rather than an oversight. The technique separates assertion
failures from driving failures, and a soft assertion only covers the first: a
control that cannot be found makes the *action* throw, and it is the per-beat
`try`/`catch` at `examples/journey/tests/take.spec.ts:1476-1497` that keeps a
moved control from ending the take. The hand-rolled policy is the one that
covers both kinds.
