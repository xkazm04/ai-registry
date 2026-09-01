---
layer: technique
type: technique
subject: trace-rollup-and-attribution
technique: single-shape-rule
status: forged
laws: []
shared_with: []
use_when: [list and detail views report the same derived number, defining trace duration or status, two computation paths must agree to the integer, a summary tile sits above the itemized list of the same things]
---

# Single shape rule

When the same derived number is served from two computation paths — a list
built from a grouped aggregate, a detail folded from raw events — the
*definition* of that number must live in exactly one shared shape that both
paths terminate in. The shape holds the minimal facts (first start, last
finish, error count) and owns the rules that turn them into the displayed
values (duration, status). Each path may gather the facts its own way; neither
path may state the rule — and "its own way" governs only *how* the facts are
fetched, never *which things* they are fetched over. The shape fixes the
collection too.

## Why a shared definition, not a shared warning

The incident this exists for: a list reported duration as last-start minus
first-start; the detail reported last-*finish* minus first-start. Every trace
whose final span carried real latency — that is, every trace ending in a model
call, the normal case — showed two different durations depending on the
screen. Both numbers were individually plausible, so no reviewer of either
path flagged it; the discrepancy was only visible to someone holding both
screens at once. A comment saying "keep these in sync" would not have
prevented it, because each author believed they *were* in sync. Only making
drift structurally impossible — one place to state the rule, so a second
statement has nowhere to live — prevents it.

## The rule alone is not enough: pin the collection

The clause "each path may gather the facts its own way" is the one that has to
be read narrowly, because taken loosely it licenses the exact divergence the
technique exists to kill. Two paths can hold the identical rule, apply it
without error, and still print different numbers — because they applied it to
different *sets*. The sharpest form of this is a **summary sitting directly
above the itemized list of the same things**: a strip of tiles over a span
list, a total over the rows beneath it. The tile folds the raw arrival set; the
list renders the merged or enriched set (raw records plus the ones a
reconciliation step joined in, or minus the ones a display filter drops). Both
obey the shared predicate. The reader sees "12" over nineteen rows.

This failure is worse than the rule-drift case, not milder, because the two
numbers are adjacent on one screen rather than one screen apart, so it is the
first thing a reader notices and the last thing anyone can explain. And it
survives every defense the technique has so far: the shared shape is being
used, the definitions agree, the conformance test passes — because a
conformance test that feeds *one* event set through both paths cannot see a
disagreement that lives in which set each path chose.

So the decision rule extends. A shared shape must fix two things, not one:

1. **The rule** — what the facts mean (where a trace ends, what one failure
   does to the whole).
2. **The collection** — the exact set the rule ranges over: raw or merged,
   pre- or post-filter, before or after truncation.

Operationally, that means the collection is **passed in, never re-derived at
the display site**. A tile that reaches for a set of its own — even a set it
believes is the same one — has restated the rule's domain, and restating the
domain is restating the rule. Whichever caller owns the list is the caller that
must also hand down the counts and totals printed above it; nothing on a
summary strip counts its own population. When a number cannot be handed down,
label the population in the number's own words ("backend spans") rather than
letting the reader assume the set below it.

Extend the conformance test the same way: assert the two paths agree on a trace
where the collections *could* differ — where a merge step adds rows, or a
filter removes them — because a fixture in which raw and merged happen to be
identical is a test that cannot fail for this reason.

This is the observability instance of a defect long catalogued elsewhere. In
reporting practice it is the "same metric, different filter context" bug, where
two panels carrying one governed definition disagree because one silently
excludes cancelled rows, test accounts, or a region; and it is why the
dimensional-modeling tradition insists that figures from separate queries may
only be set beside each other when their row headers are *conformed* — the
merge is licensed by the sets matching, not by the metric matching. The
correction is identical at every scale: agreement on the formula is half a
guarantee, and the other half is agreement on the population.

## What earns a place in the shape

Centralize a definition when it contains a **genuine choice** two authors
would answer differently:

- **Where a trace ends.** Last span's finish (start plus latency), not last
  span's start — a trailing call's compute time counts, and start-to-start
  under-reports exactly the requests that end in a long generation. Duration
  may therefore exceed last-start minus first-start; that is correct, not a
  bug report.
- **What one failed span does to the whole.** One rule ("any non-success span
  makes the trace an error"), stated once, so the list's error badge and the
  detail's header can never disagree about the same trace.

Do not centralize the *arithmetic* of mechanical sums (token counts, span
counts) — there is no choice inside a sum, and a bloated shape stops being read
as "the contested definitions". But note where the previous section lands on
these: a mechanical sum still has a collection, and the collection is a genuine
choice. The rule for them is therefore the weaker one — they need no entry in
the shape, but they must be handed down from whoever owns the set they count,
never folded locally.

## Agreement to the integer

"Both paths use the same rule" is not yet "both paths produce the same
number". Precision differences bite: if one path can only offer
millisecond-resolution arithmetic (an integer latency added to an epoch
timestamp in the store) while the other holds sub-millisecond timestamps,
truncate *both* to the coarser resolution before subtracting, inside the
shared shape. Otherwise the two paths agree in rule and still differ by one
on sub-millisecond inputs — a discrepancy too small to matter operationally
and exactly large enough to destroy trust in the surface ("if they can't
agree on 2100 vs 2101, what else disagrees?").

The right verification is a conformance test that computes the same trace
through both paths and asserts integer equality on every shared field — not a
unit test per path, which is precisely the blindness that let the original
drift ship.

## Related but distinct: the two time figures

The shape defines *wall-clock duration* (first start to last finish: spans
idle gaps, counts overlapping work once). Keep it distinct from *summed
per-span latency* (total compute: counts overlap twice, ignores gaps). Both
belong on the rollup; neither substitutes for the other. A trace with two
overlapping five-second calls has ten seconds of compute and five of
duration; a trace with two instant calls a minute apart has a minute of
duration and no compute. Labeling either figure with the other's name is a
category error operators will build wrong intuitions on.

## When not to use it

A number served from a single computation path needs no shape — premature
centralization of one-consumer definitions is indirection without a payoff.
Adopt the shape at the moment a second path appears, and adopt it by moving
the *existing* rule, never by writing a fresh one beside it.
