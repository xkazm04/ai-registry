---
layer: application
type: application
subject: audit-logging
technique: two-clock-records
stack: rust
verified_on: 2026-09-02
verified_against: rust@1.95
---

# One causal clock on every message, and a recording that keeps only offsets

A dataflow runtime wraps every inter-component message in a hybrid logical
clock timestamp (`libraries/message/src/common.rs:123`, `:241`; the
`Timestamped<T>` wrapper in `docs/architecture.md`), and its recording
format stores each captured event with a `timestamp_offset_nanos` relative
to the recording's start (`libraries/recording/src/lib.rs:98-101`, `:167`).
Read against this technique, the tree is a case the technique does not
describe: a record with one clock that is *neither* of the technique's two.

## The structural fact

The technique's two clocks are effective time (when the fact was true) and
recorded time (when the ledger learned it), and its claim is that a record
holding only one has made the other unrecoverable. The message envelope
here holds a hybrid logical clock, which is a third thing: an ordering
authority that is monotone and causally consistent across machines, derived
from wall time but not equal to it. It answers "did A happen before B" for
any two messages on any two daemons - the question neither of the
technique's clocks answers on its own - and it is the right choice for a
data plane whose consumers fuse readings from several machines.

What falls out of the structure, and nobody designed, is which of the
technique's questions the tree can and cannot answer. A recording keeps the
message's causal timestamp inside the encoded event and its own capture
offset beside it (`RecordEntry`, `:98-105`), so a replay can answer "in what
order did these arrive at the recorder, and how far apart" - recorded time,
preserved as a relative clock. It cannot answer "when was this reading true
on the sensor", because the envelope's clock is the *sender's* logical
clock, not the measurement's effective time; a driver that reads a frame at
04:00:00.000 and publishes at 04:00:00.012 stamps the second. The tree does
carry a per-message key that a producer may use for exactly this
(`timestamp` in the `Parameter` enum's `Timestamp` variant,
`docs/architecture.md` "Parameter Types"), so effective time is expressible
- but as an optional application-level field, not a column the envelope
guarantees. The technique's rule holds in the failing direction: a consumer
that needs measurement time and reads the envelope's clock has taken
recorded-ish time for effective time without a signal that they differ.

## The deviation the tree's audit already found

Each timer input carries a *private* hybrid logical clock instance
(March audit, finding `A2`, `running_dataflow.rs:256`), so timer-generated
messages are not causally comparable with the daemon's shared clock. That
is a two-authority defect against the one ordering clock, and it is the
technique's "record first, interpret later" obligation failed at the source:
two messages stamped by two clocks cannot be ordered later by any reader.
The tree names it as unaddressed roadmap.

## What this realization cannot do

It cannot substitute the causal clock for a wall clock in any report that
must join to the outside world; the recording's relative offsets are
replayable but not dateable without the header's start time, which is wall
time on the recorder and inherits its skew. And it does not model belief
revision at all - a message is a fact, never corrected - so the technique's
"what did we believe on the 13th" question has no meaning here beyond the
recorder's capture order.
