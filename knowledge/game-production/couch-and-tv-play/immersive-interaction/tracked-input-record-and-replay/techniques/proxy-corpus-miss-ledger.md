---
layer: technique
type: technique
subject: tracked-input-record-and-replay
technique: proxy-corpus-miss-ledger
status: draft
laws: [unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [synthetic or mouse-drawn input stands in for real hands before the device arrives, real-hand results contradict the proxy numbers, deciding when a proxy corpus may be retired]
---

# Proxy corpus miss ledger

The named concern: before the device arrives, synthetic clips or mouse-drawn strokes stand in
for real hands. They are useful and they are wrong in ways nobody has listed. Without a
record of what they missed, the team keeps trusting numbers that real hands have already
contradicted.

## When synthetic or mouse-drawn input stands in for real hands, label every figure it yields as a proxy figure, because its basis is an author's idea of a hand

The label sits in the same field as the number. A proxy result may unblock work and shape
the rules. It may not be reported as a result about tracked hands.

## When real-hand results contradict the proxy numbers, write the contradiction in the ledger, because the contradiction is the only measure of the proxy

Each row names the rule, what the proxy said, what the real recording showed, and the
property of real hands the proxy lacked, such as jitter, dropouts, confidence dips, speed
range or hand size. Rows are never deleted when the proxy is fixed. The ledger is what says
which kinds of claim a proxy can support.

## When deciding whether a proxy corpus may be retired, read the ledger, because retirement by feel repeats the original error

A proxy corpus may be retired for a rule when real recordings cover that rule's cases and
the ledger shows no open class of miss for it. Until then it stays, labelled, beside the real
corpus. If real recordings never arrive, the proxy is never promoted.

## Decision rules

- **When no ledger exists, the proxy has never been checked.** Say so in the report.
- **When a proxy and a real clip disagree, trust the real clip** and ask what the proxy
  lacked.
- **When the device is still absent, state which claims wait for it** instead of leaving
  silence that reads as coverage.
- **When a label names the channel the input entered through, it is not a basis label.**
  "Mouse" or "recorded" says what the input pretends to come from. A generator can write
  clips in a mouse shape, and a figure on them is still the generator's figure. The label
  names what produced the input: a generator, a model of a stream, a person, or a device.
  A label rule written in channel words passes this check and hides the proxy.

## When not to use it

When real recordings already exist for the rule under test, the proxy adds a labelled
cross-check at most, and a ledger is overhead.
