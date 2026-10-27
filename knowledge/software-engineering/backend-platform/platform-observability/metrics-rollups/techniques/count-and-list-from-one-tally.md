---
layer: technique
type: technique
subject: metrics-rollups
technique: count-and-list-from-one-tally
status: forged
laws: [count-carries-predicate, one-authority-per-vocabulary]
shared_with: []
use_when: [a number on screen opens into the list of what it counted, a count and its drill-down are computed by different functions, a reviewer must be able to check a figure item by item]
---

# Count and list from one tally

A figure that matters is eventually questioned, and the honest answer to
"seven of what?" is the seven. So a count that carries weight — a number of
accepted changes that unlocks a permission, a failure count that pages
someone, a figure in an audit — gets a drill-down: the items behind it, each
with why it counted. The technique is one rule about how the two are made:
**the count and the list are two renderings of one selection, computed once,
so they cannot disagree.**

The naive build writes them separately. The summary endpoint runs a count
with one filter; the detail endpoint runs a list with another, written later
by someone reading the first. They agree on the day they are written. Then the
count learns a new exclusion — reverted items do not count, items outside the
window do not count, items from before the record's start do not count — and
the list does not, or the list gains a sort and a limit and the count does
not. Now the screen says seven and opens onto nine, and the person who
questioned the figure has learned that neither is trustworthy. This is not the
snapshot problem that [bundle-endpoints](./bundle-endpoints.md) solves; two
functions reading one snapshot still disagree when they select differently.
The disagreement is in the predicate, and the predicate needs one author
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).

## The shape

Split the computation in three:

1. **Select once.** One function takes the inputs and the rule — the start of
   the record, the window, what counts as an output — and returns the
   selection: the ordered candidates, the subset that counted, and for every
   candidate the facts that decided it. Nothing downstream re-filters the raw
   inputs.
2. **Total the selection.** The counters are folds over that structure:
   length of the counted subset, the number with a given outcome, the number
   lacking a fact.
3. **List the selection.** The drill-down is a projection of the same
   structure: each candidate, whether it counted, and if not, a reason from a
   closed vocabulary (outside the window, not yet resolved, reverted).

Then expose a single entry point that returns both, so a caller who wants the
count and the list cannot get them from two calls that might be made against
different inputs. The count now carries its predicate in the strongest form
available ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)):
not a description of what was counted, but the counted items themselves.

## What the list must also say

A list that shows only the counted items answers half the question. The
interesting rows are the near misses: the item that would have counted but
fell outside the window, the one that could not be judged because a fact was
missing. List the excluded candidates with their reason, and list the
**facts the count could not read** — a source not polled this cycle, a field
no record stated — because a count that silently treated "unknown" as "did
not happen" is the defect the drill-down exists to expose. When a counter
itself is unknown (the source was not read), it is null, not zero, and the
list says which fact is missing.

## Decision rules

- When a count gates a decision or will be questioned, build it as a fold over
  a selection that the drill-down also renders; never as an independent query.
- One selection function per counted thing. When two counters share a base
  selection with different final filters, they share the selection function
  and differ only in the fold.
- Ties in ordering are broken deterministically (time, then identifier), so
  the list's order and any windowed count agree on which item was "last".
- Test the invariant directly: for a varied fixture, every counter equals the
  corresponding count over the listed items.

## When not to use it

A pure trend metric that nobody drills into — request volume per hour —
gains nothing from carrying its members, and materializing them is a cost
with no reader. And when the list is large, carrying every member is
impossible; that is the next problem, and
[capped-list-uncapped-total](./capped-list-uncapped-total.md) is its answer.
