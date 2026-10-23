---
layer: technique
type: technique
subject: tracked-input-record-and-replay
technique: record-below-the-rule
status: draft
laws: [a-verdict-is-bound-to-its-content, unmeasured-is-not-a-pass]
shared_with: []
use_when: [choosing what a tracked-input recorder writes, a recorded frame carries values the tracking runtime already decided, a tracking runtime update lands and the replay suite stays green]
---

# Record below the rule

The named concern: a recording holds one layer of the input stack, and replay feeds the stack
from that layer upward. Nothing beneath the recorded layer runs on playback. A change there
cannot fail a replay, however much it changes what a player's hand does to the game.

## When choosing what to record, record at least one layer below the rule under test, because replay is blind to every layer the recording sits above

Three layers are common, and each one decides a different set of regressions.

| Recorded layer | What a replay can regress | What it bypasses | Assertion form |
| --- | --- | --- | --- |
| Raw sensor: camera frames and motion data, with tracking run again on playback | The tracker and everything above it | Nothing in the stack, but the replay is not the session: results may differ from the recording and between runs | Tolerances, over repeated runs |
| Tracked poses: joints and transforms per sample | Recognisers, thresholds, filters, timing windows | The tracker: a runtime update moves the joints and no clip changes | Exact, given a deterministic step |
| Decided values and events: a contact strength, a runtime gesture bit, a "select" | Only the code that consumes the decision | The recogniser that decided it | Exact |

Pose-level recording is the usual home for game input rules, because the game's rules sit
just above it. A raw-sensor tier is the only one that can see a runtime change, and on
devices whose runtime owns the cameras it is often not available at all. Then the gap is named:
the rules are regressed on poses, and runtime changes are caught only by re-recording, per
the versioned input corpus.

## When a recorded frame carries fields from more than one layer, label each field with its layer and list which fields each rule reads, because a pose recording can carry a value the runtime already decided

A frame of joints often also carries a contact or pinch strength, a tracking confidence and a
system-gesture flag. Those are verdicts, not samples. A rule that gates on one of them is
regressed on its use of the verdict, never on the verdict itself, and the runtime can move that
verdict without moving a joint. The rule-by-field table is what tells a reader which rules a
runtime update leaves unmeasured.

## When a rule reads a value the runtime derived, keep the samples it was derived from beside it and check the two layers against each other, because a disagreement between them is the first sign the runtime moved

If a recorded frame says the fingers touch, the recorded joints should put the fingertips
together. Report, per clip, the frames where the layers disagree. On real recordings that
count is a measure of the runtime's own decision layer. A synthetic corpus that writes the
decided value first and poses the hand from it agrees with itself by construction. Its zero
is not a pass, and the proxy corpus miss ledger records it as a property the proxy lacks.

## When an input-path model is applied to a recording, apply it to every field the rule reads or say which fields it holds, because a held decided field can hide most of the effect

A model of a lower camera rate or of pose prediction that degrades the joints but holds the
contact value tests a different input path from the one that ships. If whether the runtime
predicts that value is unknown, run the model both ways and report both. The recording that
could settle the question needs the capture time of each sample beside the time it was emitted.

## Decision rules

- **When a tracking runtime update lands, every rule that reads only layers above the
  recording is unmeasured for that update** until clips are re-recorded on it. Name those
  rules in the report.
- **When the recorded layer re-runs on playback, never assert an exact threshold crossing.**
  Use tolerances, and compare repeated runs before blaming the rule. Whether the game side
  of the replay is reproducible is the deterministic headless timestep's question.
- **When the game derives a value itself, such as a pen state synthesised from fingertip
  motion, that value sits above the recording** and a replay regresses it fully. Say which
  derivation a rule uses when both exist.

## When not to use it

For a rule that reads only a discrete event from a stable interface, such as a button press,
an event-level recording is enough. A layer table is overhead there.
