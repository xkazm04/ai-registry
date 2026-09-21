---
layer: technique
type: technique
subject: usage-event-ingestion
technique: running-total-or-increment
status: forged
laws: [one-authority-per-vocabulary, unknown-is-not-a-value, failure-not-empty-success]
shared_with: []
use_when: [admitting counter values that an emitter reports on an interval rather than one event per occurrence, two consumers of one usage stream store it with different update rules, a stored per-session or per-day total is suspiciously close to one reporting interval's worth, an emitter's reporting mode is a setting its operator can change]
---

# Running total or increment: decode the report before anything stores it

Most of this subject assumes the event is a **claim about one occurrence**: a
request was served, a message was sent, and the event carries its quantity. A
large and growing class of emitters does not work that way. A metrics exporter
inside a customer's process keeps counters in memory and **reports them on an
interval** — every sixty seconds is a common default — and each report carries,
per counter series, a number. What that number *means* is not fixed by the
counter's name. It is one of two things:

- **An increment**: how much the counter grew since the previous report. Two
  reports of 1000 and 500 describe 1500.
- **A running total**: the counter's value since the series started. Two
  reports of 1000 and 1500 describe 1500.

The report says which, in a field beside the datapoints, and the emitter's
operator can usually flip it with one setting. The two encodings are
indistinguishable by inspecting a single value, and they call for **opposite
storage rules**: increments are added, running totals are kept at their latest
value. A door that picks one rule without reading the field is right for one
setting and wrong for the other, and neither wrongness raises an error.

## The failure has two shapes, and a system usually has both

The aggregation sibling of this subject starts from a table of admitted events
and assumes each quantity appears once. A running total violates that silently:
every report re-carries everything the previous report carried. So a door that
**adds running totals** multiplies a long-lived series by its report count — a
thirty-minute series reported every minute is stored at roughly fifteen times
its value, and the error grows with how long the customer's process lives.

The mirror failure is quieter and more common, because it is usually a
deliberate design choice made against a false premise. A door that **keeps the
latest value of an increment stream** — written by someone who believed the
emitter sends running totals, and who was protecting against exactly the
multiplication above — stores only the final interval. A thirty-minute series
is stored at one thirtieth of its value. Nothing about the stored number looks
wrong; it is merely small, and a small usage number reads as a quiet customer.

These two shapes tend to appear **together, over one stream**. A system that
reads the same report into two stores — a per-day total and a per-session
record, a billing table and an analytics table — grows the two readers at
different times, from different assumptions, each with its own passing tests.
One adds, one overwrites, and the report field that would have settled the
question is read by neither. Each reader's tests encode its own belief about the
encoding, so both suites stay green; only a fixture fed through *both* readers
shows that they cannot both be right. This is the
[one-authority](../../../../_laws.md#one-authority-per-vocabulary) failure
applied to a single field: the encoding is a vocabulary, and two readers holding
private definitions of it is two authorities.

## The mechanism

**1. Read the declaration per series, at the door, once.** The encoding field
belongs to each counter in the report, not to the connection or the customer.
Decode it where the report is parsed, and carry the decoded value on every
quantity handed onward — as an explicit `increment | running-total` beside the
number, not as a convention of whichever store receives it. Downstream code
never re-derives it.

**2. Resolve an absent declaration to the emitter's documented default, with
the citation beside the code.** Reports frequently omit the field or send its
unspecified value. That absence is not permission to assume the convenient
rule. It resolves to what the emitter's own documentation states its default is
— and that statement is pinned in a comment with the document it came from,
because the default is a vendor fact with a shelf life. An emitter with **no
documented default** is not guessed at: its unlabelled counters are refused
with a reason, per
[unknown not being a value](../../../../_laws.md#unknown-is-not-a-value). The
single most expensive line in this whole area is a code comment asserting which
encoding an emitter uses, written from memory and never checked against its
documentation; it survives review because it is phrased as a fact.

**3. Store increments by adding and running totals by replacing — or refuse.**
The rule follows the decoded value, per store:

- A store keyed by the **series' own identity** (one row per session, per
  process, per counter instance) can take either: add increments, replace with
  the latest running total. Take the latest by the report's own timestamp, not
  by arrival, so a delayed report cannot move a total backwards.
- A store keyed by **something coarser** (a day, a repository, a customer) can
  only add, because several series fold into one row. It can accept a running
  total only by **differencing** it against that series' previous report,
  which requires the door to keep per-series state, handle a series restart
  (the running total drops, which is a reset, not negative usage) and survive
  its own restarts. If the door is stateless, it **refuses** running totals for
  that store, counts them as skipped under their own reason, and tells the
  emitter the one setting that fixes it. A refused, counted report is honest;
  a summed one is a number that grows with uptime.

**4. Keep the refusal visible.** A skipped running total that disappears into a
generic drop count is
[failure spelled as empty success](../../../../_laws.md#failure-not-empty-success):
the customer sees no usage and concludes they used nothing. The skip reason is
specific, it reaches the response the emitter's operator reads, and it names the
setting.

## Test it with one fixture through every reader

The test that catches this is not a unit test of a parser. It is **one short
report sequence — two reports of one series — pushed through every store that
reads the stream**, under both encodings, asserting the stored totals against
the true total:

| encoding | reports | true total | an adding store | a replacing store |
|---|---|---|---|---|
| increment | 1000, then 500 | 1500 | 1500 | **500** |
| running total | 1000, then 1500 | 1500 | **2500** | 1500 |

Every reader must land on the true total or on an explicit, counted refusal.
Run it against the code *as it stands* before changing anything: in a system
that has both shapes, the table fills with exactly the two bold cells, and that
reading is the proof that the change is needed rather than the assumption that
it is.

## Decision rules

- **If a store receives interval reports, the encoding is read, never
  assumed.** Even when the emitter has only ever sent one encoding, the setting
  that changes it belongs to someone else.
- **If two stores read one report, they share one decode.** A second reader
  added later imports the decoded quantity; it does not re-parse the raw field.
- **If a coarse store receives running totals and the door keeps no per-series
  state, refuse and name the setting.** Differencing without state is guessing.
- **If a stored total was written under the wrong rule, it cannot be repaired
  from storage.** An overwritten increment is gone; a summed running total
  cannot be un-summed without the original reports. Label rows written before
  the fix as a different measurement, or re-ingest from retained reports, and
  say which.
- **If an emitter's documented default changes, the pinned citation is the
  first thing to re-check** — before any rule, because the rule reads it.

## When not to use this

- **Per-occurrence events.** An emitter that sends one event per request,
  carrying that request's quantity, has no encoding to decode; the de-duplication
  rules of this subject already govern its repeats.
- **Levels.** A value that is *held* rather than accumulated — seats, bytes
  stored, queue depth — is neither an increment nor a running total; it is
  reported as its current value and folded as a level by the aggregation
  sibling. Treating a level as a running total takes its last value where the
  period needed its integral.
- **Reports already reconciled by the emitter into closed periods.** An emitter
  that posts "usage for this hour: 1500", once per hour, idempotently keyed on
  the hour, is sending per-occurrence events whose occurrence is the hour; store
  it under the de-duplication rules and replace on resubmission.
