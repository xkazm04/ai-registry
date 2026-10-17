---
layer: technique
type: technique
subject: tracked-input-record-and-replay
technique: versioned-input-corpus
status: draft
laws: [unmeasured-is-not-a-pass, a-verdict-is-bound-to-its-content]
shared_with: []
use_when: [recording real hand or controller sessions for later tests, a corpus was recorded on an older tracking runtime, a test passes on a clip nobody can identify]
---

# Versioned input corpus

The named concern: recorded tracked input is only useful as a test if a later reader can say
what it is. A pile of clips without their origin lets a rule pass on input that no longer
resembles what ships.

## When recording real sessions for later tests, store each clip with its provenance, because a verdict is bound to the input it judged

Every clip carries the tracking runtime and its version, the sensor mode, the device class,
the rules revision in force when it was recorded, who or what performed it, and the intent
the performer was asked to make. The raw samples keep their capture timestamps and their
confidence, because later rules may read fields the first rules ignored. The corpus has a
manifest, and the manifest is under version control with the code.

## When a corpus was recorded on an older tracking runtime, mark it and re-record what the rule depends on, because runtimes change latency, smoothing and confidence

Do not delete old clips. They remain useful for rules that should not depend on the runtime.
Mark them with the runtime they came from, and judge a rule that is sensitive to latency or
confidence on clips from the runtime that ships. Where that is not yet possible, the report
names the gap instead of passing.

## When a test passes on a clip nobody can identify, treat the pass as unmeasured, because a result bound to nothing proves nothing

Quarantine clips with no manifest entry. A test may use them to explore, but a gate may not
count them. Each gating test names the clips it reads, by identifier, in its output.

## Decision rules

- **When a clip is edited, trimmed or smoothed, it is a new clip** with a new identifier and
  a note of what was done.
- **When the rules revision changes the fields it reads, check the corpus still carries
  them** before trusting a replay.
- **When a clip contains a person's identity, such as hand size or a recognisable room,
  keep it local** and keep only what the test needs in the shared corpus.

## When not to use it

For a throwaway exploration of one motion on one afternoon, a loose recording is fine. The
discipline applies from the moment a clip is allowed to gate a change.
