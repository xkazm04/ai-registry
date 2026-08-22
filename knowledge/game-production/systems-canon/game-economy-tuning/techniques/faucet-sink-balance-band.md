---
layer: technique
type: technique
subject: game-economy-tuning
technique: faucet-sink-balance-band
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass, law-and-check-share-one-source]
use_when: [specifying a currency's sources and drains, deciding whether an economy is balanced, auditing a design that has never had its net flow measured]
shared_with: []
---

# Faucet, sink, and the balance band

The named concern: **whether the total rate at which a resource enters the world and
the total rate at which it leaves are known, and whether their difference sits inside a
stated band.** Everything else in economy work assumes this has been done. It usually
has not.

A faucet is any mechanism that creates a unit of a currency. A sink is any mechanism
that destroys one. Note *destroys*: transferring a unit from one player to another is
not a sink, and the most common enumeration error is counting a trade, a transfer, or a
stash as a drain. If the unit still exists in the world afterwards, it is not a drain.

## The entry shape

Each faucet and each sink is one entry carrying four things:

| Field | Example content | Why it is load-bearing |
| --- | --- | --- |
| **base amount** | units per occurrence | the raw magnitude, at neutral tuning |
| **scaling term** | a formula in progression level | how the magnitude changes; "it goes up" is not a scaling term |
| **frequency, per hour** | occurrences per hour for a representative player | converts an amount into a rate — without it there is nothing to balance |
| **applicability** | which progression window this entry is live in | a drain no longer reachable past a tier is not a drain past that tier |

The rate contributed by an entry is base amount, scaled to the progression point,
multiplied by frequency. Sum the faucets, sum the sinks, take the difference, express
it as a fraction of the faucet total: that fraction is the net flow, and it is the only
number the band applies to.

Put the requirement in the currency's own definition, not in a document beside it: a
currency declares a list of its drains and its per-hour faucet and drain estimates as
required fields of its own shape. A rule enforced by the type an author fills in is
obeyed; a rule enforced by a convention is obeyed until the week before a milestone.

**An entry with no frequency estimate is not an entry — it is a hole.** It records as
unspecified, and it makes the whole economy's verdict unspecified. Do not default it to
zero (which inflates the apparent surplus) and do not default it to something plausible
(which manufactures a pass). This is the discipline the technique lives or dies on.

## Procedure

1. **Pick the horizon and the progression point.** Net flow at level one and net flow at
   endgame are different numbers about different games. State which one you are
   computing, in the report, next to the result.
2. **Enumerate faucets from the code and the content, not from the design document.**
   The document describes the intended economy; you are measuring the real one. Every
   reward table, every completion payout, every conversion, every salvage return.
3. **Enumerate sinks the same way, and then challenge each one for reachability.** For
   each, ask: is a player at this progression point still doing this? Repair costs that
   scale below income, vendor purchases obsoleted by drops, and crafting fees a player
   has stopped paying are the usual casualties. Reclassify them by applicability window
   rather than deleting them.
4. **Attach a frequency to every entry**, from telemetry where it exists, from a
   playtest count where it does not, and from `unestimated` where neither is available.
   Record which of the three it was — an estimate sourced from a single playtest and one
   sourced from a million sessions are different evidence and must not read the same.
5. **Compute the net flow** at the stated point, and compare it against the band. Take
   the imbalance as the absolute difference between inflow and outflow over the larger
   of the two, not over the faucet total: that denominator treats a surplus and a
   shortfall symmetrically, which a faucet-only denominator does not. Escalate severity
   at a stated multiple of the tolerance — twice the band is a materially different
   finding from just outside it, and reporting both as one severity gets both ignored.
6. **Report the verdict with its basis attached.** "Net flow +9% of faucet throughput at
   level sixty, over six faucets and nine drains, two drains unestimated" is a verdict.
   "Balanced" is not.

## Choosing and stating the band

The band is a design decision, not a discovered fact. Plus or minus fifteen percent of
neutral is a defensible default: wide enough that reasonable specification error does
not trip it, tight enough that a genuine structural surplus does. Narrower than about
five percent and you are enforcing the precision of your frequency estimates rather than
the health of the economy; wider than about twenty-five percent and a compounding
surplus can run for a full progression arc without tripping anything.

Whatever the number, three rules hold:

- **The band is stated once, in prose, with its basis**, and the check reads its
  threshold from that statement. Two copies of a band will diverge and the unreviewed
  copy will be the one enforced.
- **The band is asymmetric only if the design says so.** A scarcity design may
  legitimately declare a band centred below neutral. Declare it; do not achieve it by
  quietly tolerating one-sided failures.
- **The band is checked against the configuration that ships.** A band that has never
  been evaluated against the default tuning is a wish. Expect the first run to fail, and
  treat that failure as the most valuable output of building the check at all.

## Decision rules

- **When a currency has faucets and no sinks, stop tuning and go design a sink.** No
  coefficient fixes a missing drain; you can only slow the accumulation, and slowing it
  is how you get a boring economy that still breaks, later.
- **When net flow is inside the band but one faucet supplies more than half of the
  inflow, treat that as a finding.** A concentrated economy is inside the band only
  until that one activity is nerfed, buffed, or optimised by players.
- **When an estimate is missing and the entry is small, still record it as missing.** Not
  because it changes the sum, but because "two drains unestimated" is the sentence that
  prevents the next person from reading the verdict as complete.
- **When measured throughput contradicts the design's intended frequency, the measurement
  wins for the balance verdict and the contradiction is a separate design finding.** Do
  not average them; do not quietly adopt the convenient one.
- **When a check's input facet is absent, emit the verdict as unmeasured — never as an
  empty list of violations.** A checker built from independent per-law facets naturally
  returns "no violations found" when it was handed nothing to inspect, and every layer
  above it reads that as a pass. The facet design is right; the empty return is the bug.
- **When two currencies can be converted into each other, balance them as one economy or
  remove the conversion.** A free conversion is an unmetered faucet on the receiving side
  funded by a band computed elsewhere, and neither currency's verdict is valid afterwards.
- **When a sink's cost scales more slowly than the faucet that pays for it, flag it even
  if today's net flow passes.** That pair diverges with progression, and the band will
  be violated later at a point nobody is checking.

## When not to use this

- **For a resource that is not conserved.** Experience points, reputation and similar
  monotonic accumulators have no meaningful sinks; they are progression curves, and they
  are checked by shape rather than by flow.
- **Before the drains exist.** If the design has not yet decided how the currency is
  spent, faucet-sink balance has nothing to say and computing it produces a number that
  looks like a verdict on something that is still a blank.
- **As a standalone health verdict.** Aggregate net flow inside the band coexists
  comfortably with a broken distribution and a decayed reward curve. It is a necessary
  check and never a sufficient one.
