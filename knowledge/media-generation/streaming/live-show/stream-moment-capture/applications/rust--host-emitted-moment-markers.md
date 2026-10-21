---
layer: application
type: application
subject: stream-moment-capture
technique: host-emitted-moment-markers
stack: rust
status: forged
verified_on: 2026-10-21
verified_against: rust@1.97.1
---

# The mark-moment op in a generated villain host's segment runtime

How Shadowrunr OS, an AI-run villain livestream (github.com/xkazm04/shadowrunr @ b1740fc,
a Rust workspace plus a React operator console and stage), lets its generated host mark a
clip-worthy moment as a typed stage action, and how its clip factory then weighs the mark.
First read at 4025231 on 2026-10-19, when the marker was the only part of moment capture
the tree had built; the clip factory landed the same afternoon (1c0f8d1), and every
citation below was re-opened on 2026-10-21. The scorer, the window and the gate have their
own applications beside this one.

## The marker is an action in the output grammar, not a phrase in speech

The core thread's reply grammar separates spoken lines from actions. Its module doc names
the action form, crates/shadowrunr-brain/src/grammar.rs:5 "OP: {json}            an action matching the contract's",
allowed only when the tag is in the current segment's list. The prompt builder shows the
host one example per allowed op, crates/shadowrunr-brain/src/compose.rs:720 "filter_map(|tag| op_example(tag))",
and the marker's example is a label and nothing else,
crates/shadowrunr-brain/src/grammar.rs:181 "mark_moment". The parser test proves a mark is
split out of the surrounding speech rather than spoken,
crates/shadowrunr-brain/src/grammar.rs:200 "Bow, minions.". A free-text "clip that!" would
have been a line; this is a structured action, which is what the technique asks for. The
contract type is the minimal shape the technique describes, with no duration and no
in-point: crates/shadowrunr-types/src/event.rs:47 "MarkMoment {".

## Validated like any stage action, and stamped on the show's clock

Each segment's state table lists the ops the host may emit there, and the marker is on
the list, crates/shadowrunr-segments/data/segments/seg-01.toml:16 "mark_moment". The
runtime refuses ops after sign-off,
crates/shadowrunr-segments/src/runtime.rs:1456 "if self.signed_off {", checks the
segment's list, crates/shadowrunr-segments/src/runtime.rs:1459 "if !self.table.allows_op(op_tag(op)) {",
and then validates the marker's own payload,
crates/shadowrunr-segments/src/runtime.rs:1657 "Op::MarkMoment { label } => {", rejecting
an empty label, crates/shadowrunr-segments/src/runtime.rs:1659 "invalid_moment". A test
pins the post-sign-off rejection of a late mark,
crates/shadowrunr-segments/tests/runtime.rs:659 "&[Op::MarkMoment {". A rejected op is not
dropped: it becomes an output-stage moderation event carrying the rule and the op's tag,
crates/shadowrunr-segments/src/runtime.rs:1438 "rejected:{}".

## Bounded where it is weighed, not where it is emitted

The rate bound the technique asks for exists, in the clip factory rather than the runtime.
Its module doc says why, crates/shadowrunr-clips/src/signals.rs:7 "the scorer therefore admits a marker only within caps":
a label of at most crates/shadowrunr-clips/src/signals.rs:27 "pub const MAX_LABEL_CHARS: usize = 80;",
one per crates/shadowrunr-clips/src/signals.rs:29 "pub const MARK_COOLDOWN_MS: i64 = 30_000;"
per kind and segment, and at most
crates/shadowrunr-clips/src/signals.rs:31 "pub const MARKS_PER_SEGMENT: usize = 6;". A
capped mark is kept with its reason rather than dropped, which keeps a host that marks
every line visible as such. Three structural beats join the host's own mark as marker
kinds, a hex reveal, a sealed verdict and a foil roast, each with a lower worth than the
host's mark, crates/shadowrunr-clips/src/signals.rs:48 "MarkerKind::MarkMoment => 1.0,":
the technique's vocabulary of moment kinds, taken from the show's beats rather than from
the host.

A mark made within fifteen seconds of a chat line asking for a clip is flagged,
crates/shadowrunr-clips/src/signals.rs:181 "let chat_requested = kind == MarkerKind::MarkMoment",
pinned by crates/shadowrunr-clips/src/tests.rs:206 "chat_requested);" and shown to the
owner on the clip, apps/console/src/pages/onair/ClipDetail.tsx:52 "m.chat_requested === true &&".

## Surfaced to the operator at once

The stage design gives the marker a visible event the moment it fires,
apps/stage/DESIGN.md:230 "mark_moment", with a marker on the scrubber timeline. Clicking it
seeks to just before it, apps/stage/src/Controls.tsx:147 "onSeek(Math.max(start, m.at - 3000));",
a small review pre-roll that already embodies "the signal lags the moment". The operator
console counts the same event as a memory moment,
apps/console/src/kit/events.ts:13 "ev.op.op ===", so one marker feeds both the clip trail
and the host's memory of the show.

## Deviations from the standard

**The runtime still accepts every mark.** The emitted op is validated for an empty label
only; the caps live in the scorer. So the clip queue is protected, but the stage flash and
the console's memory curve count every mark, capped or not, and the host is never told a
mark was refused. The technique bounds the rate at emission.

**A viewer-requested mark is labelled but not weighed.** The flag is recorded and shown;
the marker's value is its kind's worth alone,
crates/shadowrunr-clips/src/scan.rs:101 "m.map_or(0.0, |i| kind_weight(markers[i].kind))",
so a requested mark scores exactly like a spontaneous one. The publish gate does not read
the flag either; only the owner's eye does.

**The marker carries most of the queue.** Of the 180 candidates in the local clip store on
2026-10-21 (all from simulated runs, all awaiting the owner), 87 were carried by the marker
alone and one by the crowd alone. The scorer sends those to review, as the technique asks,
but no hit rate for the marker exists yet: no owner has kept or rejected a clip, so the
technique's measure of a marker's weight, the share of marked moments an editor keeps, has
no data.

## Why it matters here

The research behind the show names short clips as its growth channel,
docs/research/01-market-landscape.md:178 "Clips are the funnel.", and asks in the same
line for auto-highlight markers and human editorial selection. The night tournament (night
tournament night-0dd890a1ad, 2026-10-18; 119 judged simulated 10-minute streams) showed why
the publish gate has to read stream state: in one run the host handled a viewer's sincere
self-harm disclosure well, then roasted the same viewer about the detail they had shared
roughly 165 s later. The factory's care-state exclusion now holds that shape; it held two
of the 180 stored candidates.
