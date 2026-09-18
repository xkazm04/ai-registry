---
layer: application
type: application
subject: live-system-demo-film
technique: recording-that-asserts-its-claims
stack: node
status: forged
verified_on: 2026-09-16
verified_against: node@22
---

# The take that is also the test suite

The same portable agent runtime records its demo film by running a Playwright
spec, `examples/journey/tests/take.spec.ts`, against the same three example
applications, the same tool gate and the same ledger that its ordinary
end-to-end suite exercises. Read at commit
`c5ec8cae64022f8252f73d65844e4457c3f1adc6`; `package.json:17` declares
`"node": ">=22.5"`.

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
