---
layer: application
type: application
subject: stream-moment-capture
technique: host-emitted-moment-markers
stack: rust
status: forged
verified_on: 2026-10-19
verified_against: rust@1.97.1
---

# The mark-moment op in a generated villain host's segment runtime

How Shadowrunr OS, an AI-run villain livestream (github.com/xkazm04/shadowrunr @ 4025231,
a Rust workspace plus a React operator console and stage), lets its generated host mark a
clip-worthy moment as a typed stage action. This is the only part of moment capture the
tree has built: there is no scorer, no windowing code and no publish gate yet, only a
design for them. Every citation below was re-opened on 2026-10-19.

## The marker is an action in the output grammar, not a phrase in speech

The core thread's reply grammar separates spoken lines from actions. Its module doc names
the action form, crates/shadowrunr-brain/src/grammar.rs:5 "OP: {json}            an action matching the contract's",
allowed only when the tag is in the current segment's list. The prompt builder shows the
host one example per allowed op, crates/shadowrunr-brain/src/compose.rs:566 "filter_map(|tag| op_example(tag))",
and the marker's example is a label and nothing else,
crates/shadowrunr-brain/src/grammar.rs:181 "mark_moment". The parser test proves a mark is
split out of the surrounding speech rather than spoken,
crates/shadowrunr-brain/src/grammar.rs:198 "Bow, minions.\nOP: {\". A free-text "clip
that!" would have been a line; this is a structured action, which is what the technique
asks for. The contract type is the minimal shape the technique describes, with no duration
and no in-point: crates/shadowrunr-types/src/event.rs:47 "MarkMoment {".

## Validated like any stage action, and stamped on the show's clock

Each segment's state table lists the ops the host may emit there, and the marker is on
the list, crates/shadowrunr-segments/data/segments/seg-01.toml:16 "mark_moment". The
runtime refuses every op after sign-off,
crates/shadowrunr-segments/src/runtime.rs:687 "if self.signed_off {", checks the
segment's list, crates/shadowrunr-segments/src/runtime.rs:690 "if !self.table.allows_op(op_tag(op)) {",
and then validates the marker's own payload,
crates/shadowrunr-segments/src/runtime.rs:800 "Op::MarkMoment { label } => {", rejecting
an empty label as `invalid_moment`. A test pins the post-sign-off rejection of a late
mark, crates/shadowrunr-segments/tests/runtime.rs:586 "&[Op::MarkMoment {".

An accepted op becomes a stream event stamped with the runtime's clock at emission,
crates/shadowrunr-segments/src/runtime.rs:661 "ts_ms: now_ms,". A rejected one is not
dropped: it becomes an output-stage moderation event carrying the rule and the op's tag,
crates/shadowrunr-segments/src/runtime.rs:671 "rejected:{}". Both confirm the technique's
procedure: a typed action, rejected with a reason, logged on the show's own clock.

## Surfaced to the operator at once

The stage design gives the marker a visible event the moment it fires,
apps/stage/DESIGN.md:127 "Clip marked", with a marker on the scrubber timeline. Clicking
that marker seeks to just before it, apps/stage/src/Controls.tsx:138 "onSeek(Math.max(start, m.at - 3000));",
a small review pre-roll that already embodies "the signal lags the moment". The operator
console shows the same event as a timed caption,
apps/console/src/pages/onair/view.ts:193 "Moment marked:", and also counts it as a memory
moment, apps/console/src/kit/events.ts:13 "ev.op.op ===": the one marker feeds both the
clip trail and the host's memory of the show.

## Deviations from the standard

**No bound on rate or label length.** The validation is the empty-label check alone. There
is no cooldown between marks, no per-segment ceiling and no length cap on the label, and
the prompt carries no guidance on how often to mark, so a host that marks every line is
accepted every time. The technique's rate-bounding step is unmet.

**Nothing records a viewer-requested mark.** The op has no field saying chat asked for it,
so the steerability bias cannot be weighed downstream.

**The designed scorer and window are not built, and the design states their numbers
flatly.** The program digest plans the rest of the pipeline,
docs/design/obsidian-program-digest.md:125 "Window = peak - 12s pre-roll. Duration 15-60s."
and docs/design/obsidian-program-digest.md:126 "0.35·AgentMarker + 0.25·ChatZ + 0.15·AudioRMS + 0.25·HaikuHookScore".
Neither line marks its figures as assumptions, and the window applies one pre-roll whatever
signal drove the peak. Contrast the segment engagement score, which carries a clip term
and says outright that its weights are guesses,
crates/shadowrunr-segments/src/lib.rs:61 "SES = 0.30·chat + 0.25·poll + 0.25·retention + 0.20·clip (weights are assumptions)".
That label is the one the golden path asks clip weights to carry. The same digest section
plans marker kinds tied to show beats, an owner signature on publish, an evidence badge
burned into claim-bearing clips, no publish while a correction is open, and captions taken
from the script alignment rather than speech recognition; the subject adopted each as an
upward lesson. Its mandatory gate, though, applies only to clips linked to an evidence case,
docs/design/obsidian-program-digest.md:130 "requires_mandatory_gate", while the standard
runs the exclusions on every segment.

## Why it matters here

The research behind the show names short clips as its growth channel,
docs/research/01-market-landscape.md:178 "Clips are the funnel.", and asks in the same
line for auto-highlight markers and human editorial selection. The night tournament (night
tournament night-0dd890a1ad, n as stated, 2026-10-18; 119 judged simulated 10-minute
streams) measured no clip quantities, because no clip pipeline exists: nothing in it tests
a marker's hit rate or a window's setup coverage. It does show why the publish gate has to
read stream state before the first clip ships. In one run the host handled a viewer's
sincere self-harm disclosure well, then roasted the same viewer about the detail they had
shared roughly 165 s later. A scorer would rank that roast highly, and its window would not
contain the disclosure.
