---
layer: technique
type: technique
subject: claimed-improvement-remeasurement
technique: change-point-by-ancestry
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [splitting CI runs into before and after a change, finding which commit moved a timing series, a repository with branches and merge commits feeds a performance series]
---

# Change point by ancestry

A comparison of before and after needs two sets of runs, and the definition of those sets
decides the verdict before any arithmetic runs. The clock is the obvious divider and the
wrong one. A series of CI runs is not a line; it is a partial order over commits, and *before*
and *after* are questions about ancestry.

## Why time ordering mixes the sets

On any repository with more than one branch, three kinds of run sit on the wrong side of a
time cut:

- A run that started after the change merged but built a branch that has not merged the
  default branch since — it does not contain the change, and counts as head.
- A run on the feature branch that carries the change, started before the merge — it
  contains the change, and counts as base.
- A run of a revert, a cherry-pick, or a release branch cut earlier — its content is
  unrelated to when it ran.

A mixed head sample dilutes a real gain into an inconclusive verdict. A mixed base sample
does worse when another change landed nearby: the judge credits a gain that belongs to a
neighbour's commit.

## The sets

Given the change commit C:

- **Head** = runs whose commit has C as an ancestor (or is C).
- **Base** = runs whose commit does not have C as an ancestor, restricted to commits on the
  same line of development — ancestors of C's first parent, typically the merge-base region —
  so the base is not polluted by unrelated branches.

Restrict both further to the same pipeline definition and runner class, and bound both by
sample floor rather than by date: take the newest N base runs below C and the oldest N head
runs above it, so that later changes stacked on C do not contaminate the head. Every count the
judge reports names this predicate, per
[count-carries-predicate](../../../../_laws.md#count-carries-predicate): "eleven head runs"
means eleven runs descending from C, on this pipeline, on this runner class.

## Finding the first head run cheaply

Ancestry questions are answered exactly by the repository's history — one query asks whether
commit C is an ancestor of commit X — but each query costs a process call or a round trip, and
a series may hold thousands of runs. When the runs being split follow **one line of history**
(a pipeline that runs only on the integration branch, a variant defined by branch), "contains
C" is monotone along them: false, then true, never false again. That turns the split into a
binary search: ask about the middle run, discard half, repeat, and the first head run is found
in a logarithmic number of ancestry queries. Two guards keep the shortcut honest. The
monotonicity is an assumption about the series, so it belongs to series that really are one
line — a series mixing branches must be classified first. And an ancestry query has three
answers, not two: yes, no, and *cannot tell* (a commit the local history does not hold, a
rewritten branch). *Cannot tell* is not *no*; the search stops and falls back to an exact
commit match, which is narrower but never wrong.

A judge that cannot ask ancestry questions at all — it holds run records without the commit
graph, or the claim names only a branch — must record which fallback it used. Falling back to
the integration branch's linear first-parent history, where time and ancestry agree, is sound.
Falling back to *the first run on the claimed branch's start time* is the time split again, and
a verdict reached that way must say so in its record.

## Locating an unnamed change

When nobody claimed anything and the question is *which commit moved this series*, the same
partial order drives the search. Published practice in CI performance testing uses
change-point detection over the series — an energy-statistics divisive method is the common
choice — because threshold rules on consecutive runs produce floods of false alarms on noisy
data. Two adaptations make it correct for CI:

1. **Linearise along first-parent history of the default branch**, with each point the median
   of the runs on that commit, so the series has one point per integration commit rather than
   one per run in arrival order.
2. **Treat the detected point as a range, not a commit.** A detector over noisy medians
   localises a shift to a neighbourhood. Resolve it by bisection over ancestry: take the
   commits between the last point clearly before and the first clearly after, and measure
   candidates (with queued runs, if needed) until a single commit separates the sets.

A change point found and attributed this way can then be offered back to the claim system as
an unclaimed improvement — or regression — with the commit identified by the history, not by
anyone's description.

## Decision rules

- When base and head are defined by time on a branched history, the verdict is unsafe; redo
  the split by ancestry.
- When a later change sits on top of C inside the head window, shrink the window to commits
  between C and the next change on the same series, or report the verdict as for the pair.
- When a detector reports a change point, bisect the range by ancestry before attributing it.
- When the runs follow one line of history, binary-search the change point; when they do not,
  classify them into lines first.
- When an ancestry query cannot tell, treat it as unknown and fall back to an exact match.
- When ancestry is unavailable, say so in the verdict record.

## When not to use it

On a strictly linear history with one integration branch and no long-lived side branches,
time and ancestry coincide and the extra work buys nothing. For metrics that do not depend on
the code — queue wait, runner provisioning time — ancestry is the wrong axis entirely; those
move with the fleet, not the commit, and are not this technique's to attribute.
