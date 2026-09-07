---
name: agent-reliability-reporting
version: 0.1.0
status: seed
domain: software_engineering
path: software_engineering/error-triage
---

# Agent reliability reporting

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Whether a fleet of automated work is getting more or less reliable is usually
a feeling formed from whichever failure was most recent, which is exactly the wrong
basis for deciding what to fix. The reports written to replace that feeling normally
fail in two known ways: they count failures without ever naming what was attempted, and
they average a duration whose distribution has a long tail, producing a number that
describes nobody's experience.

**Input.** The error record over the window, the count of runs attempted over the same
window including the ones that never started, the same two for the preceding window, and
how the previous report's recommendations were dealt with.

**Core action.** Turn the record into failures against attempts per unit of work, decide
which movements the window is actually thick enough to support, and rank a small number
of changes worth making instead of listing what failed.

**Output.** A report that states every rate as a count over its denominator, marks the
units where the window is too thin to say anything, names the direction where it can,
and leaves the measures somewhere the next report reads them rather than only in the
prose.

## Activities

1. Read the error record and the runs attempted over the window *(observe)*
2. Compute failures against attempts for each unit of work *(act)*
3. Compare with the preceding window, and mark where the window is too thin *(decide)*
4. Rank a few changes worth making rather than listing what failed *(decide)*
5. Publish the measures where the next report reads them, and the changes where work is
picked up *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Nobody reading the report can mistake how much evidence a number rests on.**

- Every failure rate is shown as failures over attempts, never as a bare percentage.
- Attempts count the runs that were supposed to happen, including any that never
  started, since a run that never started is the failure most easily hidden by a
  denominator of completed runs.
- A unit with too few attempts to support a rate is reported as too thin to judge rather
  than given a percentage, and a clean run of attempts is reported as no failures
  observed in that many rather than as fully reliable.

**How long failures take to deal with is described by something the distribution
supports.**

- Time to resolution is reported as a spread or as a count of cases past a stated
  threshold, not as an average across a long tailed set.
- The report does not claim that longer resolutions were more serious ones unless it has
  separately checked that, because duration and consequence are not the same measure.
- The threshold that defines a slow case is stated and stays the same between reports,
  so the count means something across them.

**The next report starts from this one, and a recommendation that was accepted turns
into work rather than into a paragraph.**

- The measures this report computed are written where the next report reads them, so a
  trend is a comparison of records rather than of documents.
- Each recommendation names a change somebody could make and where it was filed, and the
  following report says what happened to it.
- The first report states that it is establishing the baseline and reports no direction,
  rather than reporting movement against nothing.

## Guidance

A count without its denominator is unreadable and a percentage from four attempts is a
guess wearing a decimal point. State both, and let a thin window say so instead of
producing false precision. Resolution times cluster short with a long tail, so an
average of them describes nobody: report the spread or count the slow ones. Rank a few
changes rather than listing failures, and treat a recommendation that never became work
as this report's own failure.

## Where this is worth adopting

- An operator with a growing fleet who is deciding where to spend a week of hardening,
  and currently decides it from whichever failure was most annoying in the last few
  days.
- A team reporting reliability upward, where every number will be read as a promise and
  a rate computed from six runs will be quoted back for a quarter.
- A fleet where most units run rarely, so per unit percentages are noise and the honest
  report is how many units are inside the bar rather than a table of figures.
- The month after a hardening push, when the useful question is whether the failure rate
  moved or whether the volume did, and a raw failure count cannot separate them.
- A recurring report that has been shipping for months without anyone acting on it,
  where the missing piece is not the analysis but a record of what happened to the last
  set of recommendations.

## Connector types

`messaging`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[local-messaging](examples/local-messaging.md) for `messaging`.

## Recommended trigger

`self_paced`. A fixed hour is a delivery preference rather than a property of the work,
and reporting on a window in which nothing moved spends a reader's attention for
nothing. Report when the record has changed enough to be worth reading, and let an
adopter who wants it before a Monday meeting bind a time trigger on the charter.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Who reads this and what they decide with it, because a report for the person fixing
  the work and one for the person funding it are different documents and merging them
  serves neither.
- Where the count of attempted runs comes from, since without it there is no denominator
  and the whole report degrades into a failure list.
- What movement is worth calling out here, since a change that matters in a small fleet
  disappears in a large one and no default knows which this is.
- Where a recommendation has to land to become work, because a recommendation that lands
  only in the report is the reason the next report says the same thing.

## Dependencies

None.
