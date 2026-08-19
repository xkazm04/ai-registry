---
layer: technique
type: technique
subject: funder-intelligence-index
technique: k-anonymity-suppression
status: forged
laws: [small-samples-stay-silent]
shared_with: []
use_when: [publishing any aggregate computed from contributor data, setting a privacy floor for a shared dataset, reviewing whether a published cell can identify its members]
---

# K-anonymity suppression

A published aggregate is safe only when it hides its members. A cell built
from one organization's outcomes is that organization's private history with
the name removed — and in a domain where "who applied to whom and lost" is
reputationally sensitive, the name is often trivially restorable from
context (a funder × size-band × program cell in a small city may have one
plausible member). The k-anonymity floor is the structural answer: **a cell
is published only when at least k distinct contributors stand behind it;
below k, the cell does not exist.** This is the
[small-samples-stay-silent](../../_laws.md#small-samples-stay-silent) law's
adversarial half — the statistical half (small rates lie) would justify a
floor anyway, but the privacy half dictates *how the floor counts*.

## Count distinct contributors, not records

The floor is over **distinct contributing organizations**, never over rows.
One prolific organization can generate fifty outcome records in a cell that
still describes only that organization; a record-count floor of 5 would
publish it. The aggregation therefore tracks a contributor set per cell and
tests its cardinality. Conventional floors in published-statistics practice
run k=5 to k=10 (health statistics commonly use 5, sometimes 10 for
sensitive categories); k=5 is a defensible default for funder aggregates,
and the chosen value is a named constant — because the methodology page
discloses it, and the disclosed floor and the enforced floor must be the
same symbol so they cannot drift apart.

## Reduce granularity before you collect

Suppression is the last line; the first is **generalization at write time**.
Every quasi-identifier that enters the record enters coarse: exact revenue
becomes a bracket, the program title becomes a short non-reversible hash
bucket (grouping outcomes by program without ever storing the raw title),
submission dates become cycle buckets. Coarse dimensions do double duty:
they shrink the identification surface *and* they make cells bigger, so
less data ends up suppressed. A schema that stores fine-grained fields "for
flexibility" and relies on suppression alone has chosen to hold sensitive
data it can never show — the worst of both.

## The attacks a naive floor misses

Passing each cell independently through `contributors >= k` is necessary and
insufficient. Three composition attacks survive it:

- **Subtraction.** If a funder-level total is published alongside all but
  one of its size-band cells, the suppressed cell is recoverable by
  arithmetic. Publishing a total plus n−1 sub-cells *is* publishing the nth.
  The remedies: publish totals only over the cells actually shown, or
  suppress a second cell (complementary suppression) so no subtraction
  closes.
- **Differencing across refreshes.** Two published snapshots that differ by
  one organization's opt-out reveal that organization's aggregate as the
  delta. Batch refreshes (nightly, not per-write) and floors comfortably
  above the minimum blunt this; an index refreshed on every contribution
  leaks a running commentary.
- **Dimension slicing.** Each cell of a funder × band × program × cycle
  cube may clear k while their intersection pattern still isolates a
  member. The practical containment is hierarchy: publish fine dimensions
  only inside cells whose coarser parent is comfortably above k, and drop
  the finest dimension first — small-population funders appear at funder
  level only, never at program level.

## Suppression is total, not partial

A cell below the floor is omitted — not shown with a warning icon, not
shown as a range, not "n too small to display" *with the other columns
populated*. Partial display leaks: showing a median award while hiding the
rate still discloses that members exist and what they won. The suppressed
cell's correct representation downstream is *absence*, and consumers must be
written to tolerate absence (a missing cell yields "no estimate", never a
default — the honest-null discipline again). One asymmetry is worth
preserving in the disclosure: an absent cell means "not enough
contributors," which is itself mildly informative but acceptable; the
methodology says so plainly.

## The floor is not the consent mechanism

K-anonymity protects *consenting* contributors from re-identification. It
does not license the inclusion of anyone who has not opted in — "they can't
be identified" is not consent, and the two gates run in sequence: consent
filters the pool, then the floor filters the cells (see
consent-scoped-contribution). Conversely, consent does not replace the
floor: an organization that agreed to contribute did not agree to be the
sole visible member of a cell.

## When not to use this

The floor applies to *published* aggregates. A contributor's own dashboard
showing its own history needs no k (there is nothing to hide from
yourself) — it needs only the statistical minimum-sample guard, which is a
different, smaller number chosen for noise, not privacy. Internal
operational queries by the index's operators are governed by access control,
not suppression. Applying k everywhere confuses the two threat models and
usually ends with the private dashboard suppressing the user's own data —
protection theater that costs trust and protects nobody.
