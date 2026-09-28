---
layer: technique
type: technique
subject: page-load-pipeline
technique: field-measured-load-budget
status: forged
laws: [count-carries-predicate, gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [choosing which load numbers to gate before merge, a lab score and real-visit experience disagree, setting up or reviewing a per-route bundle budget]
---

# Field-measured load budget

Three numbers describe a page load as the reader experienced it: **when the
largest content in the first viewport painted**, **how long the page took to
respond to interactions** across the visit, and **how much visible content moved
unexpectedly**. The accepted good thresholds are two and a half seconds, two
hundred milliseconds and a shift score of one tenth; beyond four seconds, half a
second and a quarter, the experience is poor. Each is judged at the **75th
percentile of real visits, segmented by device class** — the percentile chosen
so that most visits meet the target while a handful of outliers cannot move the
verdict.

Every word of that sentence is a predicate, and dropping any one of them turns
the number into a claim it does not support
([count-carries-predicate](../../../_laws.md#count-carries-predicate)). A median
hides the slow quarter of visits. A number pooled across phones and desktops
describes a device nobody owns. A number from a lab run describes one machine.

## The lab is the instrument, the field is the verdict

A lab run loads the page on one device, over one simulated network, from one
cache state, usually with no interaction at all. That makes it excellent for
**diagnosis** — a reproducible waterfall and profile, a before-and-after for one
change — and useless as the **verdict**, because the verdict is about a
population the lab does not contain. Responsiveness in particular barely exists
in the lab: it is defined over the reader's interactions, and a load with no
interactions can only report a proxy such as total blocking time.

So the work splits in two:

- **Before merge, gate proxies that are deterministic in the tree.** First-load
  script bytes per route and for the shared floor every route pays; the count of
  render-blocking resources and foreign origins on the critical path; the number
  of high-priority and preload declarations; a lab score floor only if it is
  run several times and the gate reads the median with its spread, because a
  single lab run's variance is larger than most regressions. How a measured
  number becomes a gate — baselines, ratchets, noise — is
  [metric-gates](../../../engineering-process/standards-and-gates/metric-gates/metric-gates.md),
  and its [ratchet-design](../../../engineering-process/standards-and-gates/metric-gates/techniques/ratchet-design.md)
  is the shape a per-route byte ceiling takes.
- **After release, judge the three metrics from real visits.** Collect them from
  the reader's browser with the element or interaction responsible attached, so
  a poor 75th percentile names a culprit, not a mood. Compare releases by
  percentile per device class, never by average.

## A byte gate must see the build it judges

A per-route budget reads numbers the build wrote. That is a proxy for the
shipped output, and it passes exactly when the proxy diverges
([gate-sees-target](../../../_laws.md#gate-sees-target)):

- **Absent numbers fail.** If the build stops emitting size statistics — a
  toolchain upgrade that drops a report is enough — the gate must fail, not pass
  with nothing to compare. A heavy dependency can otherwise ride a route's first
  load for months with nothing able to see it
  ([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)).
- **Stale numbers fail.** The gate asserts the statistics came from the build it
  is judging — same commit, same run. A locally cached report from an earlier
  build yields a verdict about a different tree.
- **New routes enter with a ceiling.** A route with no budget entry is the one
  most likely to be heavy; reporting it and passing lets every new surface in
  unbounded.
- **Say what was counted.** Compressed bytes predict transfer; uncompressed bytes
  predict parse and compile cost. Pick deliberately and write it beside the
  ceiling.

## A budget without an owner decays

Every budget line names the person or team who is paged when it goes red and who
may raise it. A ceiling anyone can raise in the same change that breached it is a
formality; the raise should require a stated reason in the change's description,
and ceilings well above measured values should be lowered so the win is locked.

## Decision rules

- Judge the three field metrics at the 75th percentile, per device class, from
  real visits; never ship a lab number as the verdict.
- Gate before merge only on numbers the tree determines — bytes, counts of
  blocking resources, declarations — plus a lab floor only as a median of
  several runs.
- Make a missing or stale input fail the gate; give new routes a ceiling on
  arrival.
- Record which bytes were counted and why beside every ceiling.
- Name an owner for every budget line; require a written reason to raise one.

## When not to use this

- **Pages with too little traffic** for a stable 75th percentile per device
  class. Use lab diagnosis and the pre-merge proxies; do not invent a field
  number from a few dozen visits.
- **Packaged shells**, whose launches are not document navigations; phase the
  boot instead.

## How to test for the property

- Delete the build's size report and run the gate: it fails with a message that
  names the missing input.
- Run the gate against a report from an older commit: it refuses.
- Add a route with no budget entry: the gate fails or assigns a ceiling, and
  never passes silently.
- Pick one release and show the three metrics at the 75th percentile for each
  device class, each with its responsible element or interaction.
