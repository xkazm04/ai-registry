---
name: database-anomaly-baseline-refresh
version: 0.1.0
status: seed
domain: software_engineering
path: software_engineering/observability
---

# Database anomaly baseline refresh

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Anomaly detection is only as honest as the baseline behind it, and the refresh
is where the anomaly gets lost: recompute from a window that contains last week's
incident and the detector learns the incident as normal, while a baseline never
recomputed turns every ordinary business change into an alert.

**Input.** A recent window of the database's own rows, the baseline currently in force
with the window it was built from, the periods already known or already flagged as
abnormal, and what the business knows about its own calendar.

**Core action.** Recompute the distributions detection rests on from what the business
has actually been doing, with the periods that were already called abnormal held out and
an estimator a handful of extreme rows cannot move, then decide whether the new numbers
differ from the old for a reason anybody can name.

**Output.** A baseline in force that records the window it came from and why it replaced
its predecessor, or the previous baseline still intact together with a plain statement
that the refresh did not succeed.

## Activities

1. Read a recent window of the fields detection depends on *(observe)*
2. Hold out the periods already known or already flagged as abnormal *(act)*
3. Recompute the distributions and rates with an estimator a few extreme rows cannot
move *(act)*
4. Decide whether the new numbers differ from the old for a reason anybody can name
*(decide)*
5. Install the new baseline with its window and its reason recorded, or keep the last
good one and say the refresh failed *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Detection is judged against a baseline that reflects how the business actually runs
now, without having quietly absorbed the events it was meant to catch.**

- Baselines are recomputed from a rolling recent window rather than a fixed one
- Periods already flagged as anomalous, and periods the adopter has declared abnormal by
  design, are held out of the recomputation
- The estimator used does not move materially when a small number of extreme rows are
  present, so one bad hour cannot raise the bar for the next month

**A refresh that cannot be trusted leaves detection exactly as it was rather than
replacing it with worse numbers.**

- A refresh whose window is short of data, truncated, or otherwise incomplete is
  abandoned and the previous baseline retained
- A move between the old and new numbers large enough to change what detection would
  have fired on is reported before it is installed, not after
- A corrupted baseline is reinitialised from scratch and marked as establishing rather
  than propagated forward

**When a later anomaly is questioned, it is possible to tell whether the baseline moved
or the world did.**

- Each installed baseline records the window it was computed from, what was held out,
  and why it replaced its predecessor
- The first computation says it is establishing a baseline rather than reporting a
  change against nothing
- A refresh that ran and changed nothing is recorded as having run, so quiet is
  distinguishable from skipped

## Guidance

A refresh is where the anomaly you were meant to catch gets absorbed into normal.
Recompute from a trailing window with the periods you already flagged held out, and use
an estimator a few extreme rows cannot move. Compare the new numbers against the old
before installing: a large move is either a business change somebody can name or a bad
window, and the two need different answers. Record the window and the reason, or a later
investigation cannot tell whether the baseline moved or the world did.

## Where this is worth adopting

- A team whose anomaly alerts have gone quiet since a growth push, because the detector
  is still measuring against a baseline computed when the business was a third of its
  current size.
- A seasonal business whose trailing window has just swallowed its busiest fortnight, so
  January will read as a collapse against a normal that only existed in December.
- An operation that had a genuine incident last week and is about to fold it into normal
  on the next scheduled recompute, which would make the same failure invisible the
  second time it happens.
- The month after a schema or pricing change, when the fields detection is built on have
  shifted meaning and nobody has decided whether the old baseline is still about the
  same thing.
- A team arguing about whether an alert was real, where the honest answer needs to know
  what the baseline was on the day it fired and when it last moved.

## Connector types

`database`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[supabase](examples/supabase.md) for `database`.

## Recommended trigger

`self_paced`. A recompute over a trailing window is not a sampling obligation the way
metric collection is, because the rows are already there whenever it runs. Refreshing on
a clock also guarantees it will sometimes land in the middle of a genuine shift and
learn it. Act when the distribution has demonstrably moved and the move is understood,
or when the window behind the current baseline no longer covers the business as it now
runs.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which databases and which fields detection actually rests on, because a refresh over
  everything is expensive and a refresh over the wrong column silently changes nothing
- What normal looks like for this data and which periods the adopter already knows to be
  abnormal by design, since holding those out is the difference between a baseline and
  an average of the last incident
- How long a window has to be here before it represents the business, given a baseline
  over a few days mostly measures the days it happened to contain
- Who is told when the numbers move a long way, because a large shift is a question for
  a person rather than a value to install quietly

## Dependencies

None.
