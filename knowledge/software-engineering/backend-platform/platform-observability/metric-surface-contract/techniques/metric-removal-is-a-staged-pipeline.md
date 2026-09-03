---
layer: technique
type: technique
subject: metric-surface-contract
technique: metric-removal-is-a-staged-pipeline
status: forged
laws: [failure-not-empty-success, unknown-is-not-a-value]
shared_with: []
use_when: [removing or renaming an exported metric, nobody appears to use a metric, writing a deprecation policy for an exported surface]
---

# Metric removal is a staged pipeline

Removing an exported metric is a **breaking change to an interface whose
clients cannot be enumerated**. That single fact disqualifies every technique
teams reach for first: searching the organisation's dashboards proves nothing
about the ones outside it; asking on a channel reaches the people already
paying attention; and a deprecation note in the emitting code is read by
maintainers, who are not the consumers.

So removal stops being a judgement — "does anyone use this?" is unanswerable —
and becomes a **process that runs over several releases**, where each stage
raises the volume of the signal and delivers it through the channel the
consumer actually reads: the surface itself.

## The three stages

**Stage 1 — announced, still on.** The metric behaves exactly as before, and
its own description carries its end: a marker that it is deprecated and the
**specific version in which it will be removed**. This matters because the
description travels with the metric into every tool that lists the surface, so
the announcement reaches consumers who never read a release note. A
deprecation with no stated removal version is not stage 1; it is a metric with
a complaint attached, and it will sit there for years.

**Stage 2 — off by default, and asking for it fails loudly.** The metric is no
longer emitted; a consumer configuring or requesting it gets an **error naming
the deprecation and the escape hatch**. The escape hatch is a documented flag
that re-enables the whole stage-2 set for one more release cycle.

**The escape hatch names the version it is escaping from, and expires by
construction.** A bare on-switch becomes permanent: it is set once in a
deployment template, inherited by every later install, and the metric never
actually reaches stage 3. Instead the flag takes the version in which the
metric was hidden as its argument, and it is honoured only while the current
release is the one immediately after that version. A consumer who sets it has
bought exactly one release cycle, must revisit the value to buy another, and
the flag left behind in an old template stops doing anything instead of
silently keeping a dead surface alive. The escape hatch is a deadline with a
value attached, not a preference.

This stage is the one that does the work, and the two properties that make it
work are non-obvious:

- **It errors rather than silently emitting nothing.** A series that quietly
  disappears is read by everything downstream as an absence, and an absence is
  read as *zero*: the dashboard flatlines, the alert on "rate below threshold"
  fires or — far worse — the alert on "errors above threshold" goes green
  forever. Silence is indistinguishable from health
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)),
  and a missing series rendered as zero is unknown published as a definite
  value ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
- **It is how the consumer discovers they are a consumer.** The error is the
  first moment an unenumerable dependency identifies itself, at a cost of one
  flag rather than a broken migration. Every escape-hatch use is a signal
  worth collecting: it is the enumeration that could not be obtained any other
  way.

**Stage 3 — removed.** The name, its emission and its escape hatch are gone.

## Tying stages to the release cadence

The stages advance **only on releases permitted to change behaviour**, and the
rule that carries the most weight is the negative one: **a patch release never
removes anything and never advances a stage.** Consumers apply patch releases
without reading anything — that is what the patch contract promises — so a
removal delivered in one arrives with no signal at all, which defeats the
entire pipeline.

- Advance at most one stage per eligible release, so a consumer that skips a
  release still sees at least one stage before the metric vanishes.
- Write the version numbers down when stage 1 starts, and honour them. A stage
  whose end date is "when we get to it" teaches consumers that the announced
  version is not real, and the next announcement gets ignored.
- Where the ecosystem has an exception for security, say so explicitly; an
  unstated exception is indistinguishable from a broken promise.

## Renames are removals

A rename is a removal plus an addition, and it runs the full pipeline: the new
name ships immediately, both are emitted through the deprecation window, and
the old name's description points at the new one. The shortcut — emitting only
the new name and calling it a rename — is a stage-3 removal with no stages, and
it breaks consumers with less warning than an honest deletion because everyone
involved believes nothing was removed.

The same applies to changes that keep the name and break the meaning: changing
a unit, changing what a label's values mean, narrowing a population, changing a
count to a level. **If a consumer's existing query returns a differently-shaped
truth, that is a removal wearing the old name** — and it is worse than a
removal, because nothing errors and no dashboard goes blank; the numbers just
become wrong. Such a change ships under a new name.

## Adjacent obligations

- **Alerting depends on the metric too.** Before stage 2, sweep the alert rules
  you *can* see and migrate them. A metric that disappears out from under an
  alert leaves a rule that can never fire, which is the most expensive
  silence a monitoring stack can hold.
- **Retention outlives the metric.** A consumer's stored history for a removed
  series remains queryable long after stage 3; if the semantic was wrong,
  removal does not un-poison the history, and the note about what it used to
  mean belongs somewhere permanent.
- **Duplicates cannot always be removed immediately.** When you discover two
  metrics for one quantity — and you will, because near-synonyms accrete when
  a second person adds a metric without finding the first — neither age nor
  elegance picks the survivor. **The survivor is the one with a demonstrated
  consumer**: a dashboard, an autoscaler, a downstream project you can point
  at. Absence of evidence is not evidence here, so a known consumer of the
  uglier metric outranks a preference for the prettier one. Run the pipeline
  on the loser and record which is authoritative in the meantime.
- **A known consumer is worth naming in the surface's own notes.** When you
  ever *do* learn who depends on a metric — an issue, a downstream change, an
  escape-hatch report — write it down next to the metric. That list is the
  only partial enumeration you will ever have, and it is the difference
  between coordinating a migration and announcing one.

## Decision rules

- **When the metric is exported, use the pipeline.** No exceptions for
  "obviously unused" — obvious is the property that has already failed here.
- **When a removal was noticed by a consumer after the fact, write the policy
  down that day.** A dated incident with a written policy is the strongest
  form of this argument, and it is the only version that survives the next
  person who is sure nobody is watching.
- **When the metric was never exported** — an internal counter behind a debug
  switch, an instrument used during an investigation — delete it freely. The
  pipeline is the price of publication, not of measurement.

## When not to use this

- **Pre-release surfaces explicitly marked unstable**, where the instability
  is stated in the surface itself, may change without stages. The marking has
  to be on the metric, not in a document.
- **A surface with genuinely enumerable consumers** — a metric emitted to a
  single sink you administer, in a system with no external scraper — can be
  changed by coordinating with them directly. Verify that the enumeration is
  real before relying on it; "we would know" is not an enumeration.
