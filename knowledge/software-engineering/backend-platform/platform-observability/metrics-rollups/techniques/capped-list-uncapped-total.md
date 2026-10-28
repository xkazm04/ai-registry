---
layer: technique
type: technique
subject: metrics-rollups
technique: capped-list-uncapped-total
status: forged
laws: [count-carries-predicate, unknown-is-not-a-value]
shared_with: []
use_when: [a drill-down or activity list is capped for size, a consumer counts the items it was sent, deciding what a capped list must carry besides its items]
---

# Capped list, uncapped total

Every list that crosses a boundary is bounded eventually: the items behind a
count, a recent-activity feed, the failures in a run. The bound is right — an
unbounded list is a payload with no ceiling — but it creates a second number,
the length of what was sent, that looks exactly like the number that matters,
the length of what exists. Consumers count what they were sent. They always
do. A list capped at fifty and rendered as "50 changes" has turned a size
limit into a false fact.

The rule: **the list keeps the newest N; the total counts all of them, is
computed before the cap, and travels with the list.** A capped list is never
sent without its uncapped total, and the consumer renders "the newest 50 of
312", not "50".

This is distinct from the top-N breakdown in
[cardinality-and-cost](./cardinality-and-cost.md). There the list is a
*grouped* result — keys ranked by a measure — and the cure is a remainder
row so the rows still sum. Here the list is of *items*, members of a count,
ranked by recency; there is no meaningful remainder row, only a total and a
statement that more exist.

## The details that keep it honest

- **Total before cap, from the same selection.** Compute the total over the
  selection the list was cut from, never by a second query and never as the
  list's length. With [count-and-list-from-one-tally](./count-and-list-from-one-tally.md)
  both come from one structure, so the total and the first N cannot describe
  different sets.
- **The cap names its ranking.** "Newest" is a choice; state it, and break
  ties deterministically so the same inputs always yield the same N.
- **The cap is one constant, shared.** The producer that cuts and the
  consumer that renders "of" both read one definition, so a raised limit does
  not leave the interface claiming the old one.
- **Every capped list carries its own total.** A payload with several capped
  lists — the counted items, the excluded ones, the facts that could not be
  read — needs a total for each. A total on the first list and none on the
  others is the common half-build, and the uncounted list is the one a
  reviewer then trusts as complete.
- **A total that is unknown is not the list's length.** If the producer
  could not count the uncapped set — a source paged out, a query timed out —
  the total is absent and the list says it may be incomplete
  ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)),
  rather than falling back to the length it happens to have.

## Rendering

The consumer shows the total wherever it shows the list, and marks the cut
where the list ends: "showing the newest 50 of 312". Any derived figure
computed over the list — a share, an average — is labelled as being over the
listed items, or computed upstream over the full selection. A percentage
computed over the newest fifty and presented as the record's is the same lie
one step removed ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

## When not to use it

When the list is genuinely complete by construction — a fixed enumeration,
a list bounded by the domain below the cap — the total is redundant, though
sending it costs nothing and protects the day the domain grows. When the
consumer needs every item (an export, a reconciliation), a cap is the wrong
tool; page through the full set with a stable cursor instead.
