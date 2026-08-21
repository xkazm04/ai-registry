---
layer: technique
type: technique
subject: honest-measurement-presentation
technique: a-capped-table-says-what-it-dropped
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [rendering a top-N list, a chart with a row limit, rows that do not sum to their total, an export that truncates]
---

# A capped table says what it dropped

Every list on a measurement surface is capped. Top ten sources, top eight
stages, the first twenty roles, the largest six slices of a pie. The caps are
justified — a chart with forty categories is unreadable and a query without a
limit is a liability — and they are almost always invisible. An invisible cap
turns a partial view into a universal claim: a reader looking at ten sources
under a heading that says "sources" believes they are looking at the sources.

## The two harms

**Arithmetic.** The rows do not sum to the total shown beside them. A reader
who adds them by eye gets a smaller number and has no way to tell whether the
rows are wrong, the total is wrong, or something is missing. The usual outcome
is worse than confusion: they conclude the total is inflated and discount the
panel.

**Decision.** What falls under the cut is the long tail, and the long tail is
where the interesting failures live — the small source that converts at three
times the rate of the big ones, the rare stage where everyone stalls, the
handful of roles that never fill. A capped table silently argues that nothing
worth knowing happened outside the top rows, which is precisely backwards.
It is a form of absence rendering as evidence
([absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence)).

The decision harm has a sharper form worth stating on its own, because it
determines who the cap hurts. A volume-ranked cap **removes exactly the reader
who most needs the row**. The person opening a by-role table is very often the
manager of one seat with a handful of applicants — which is the row that ranks
last and drops off first. The cap is not a neutral trim of the boring rows; it
is a systematic exclusion of the individual case in favour of the aggregate,
on a surface whose whole purpose is to let someone act on their own case.

## The procedure

**1. State the cap in the heading or the caption.** "Top 8 of 34 sources", not
"Sources". Three words, and it converts a misleading picture into a true one.
The cap and the population size both belong in the sentence — the cap alone
does not tell the reader whether they are missing two rows or two hundred.

**2. Account for the remainder explicitly.** Add an aggregate row — "Other (26
sources)" — carrying the summed value, so the rows sum to the total by eye.
Where the remainder cannot be aggregated meaningfully (a median cannot be
summed), say so in the caption instead of faking a row: "26 further sources
not shown".

**3. State the ordering the cap was applied on.** "Top by hires" and "top by
applications" produce different tables from the same data, and a reader who
assumes the wrong one draws the wrong conclusion. The cut criterion is part of
the claim's basis
([a claim carries its sample and its basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis)).

**4. Handle the boundary honestly.** Ties at the cut line are the place a
capped table gets arbitrary: three sources tied at the tenth position and one
of them shown is a coin flip presented as a ranking. Either extend the cap to
include the whole tied group, or say that a tie was broken and how.

**5. Never let the cap coincide with a suppression.** A row omitted for
smallness (a slice too thin to report) and a row omitted for the cap are
different omissions with different meanings, and collapsing them lets a
privacy or sample suppression hide inside a "top ten". Count and report them
separately.

**6. Offer the full view, and make the escape hatch honest about its own
reach.** A link to the complete list, a search, an export, a raised limit —
anything that makes the cap a display choice rather than a data boundary. A cap
the reader cannot escape is a cap that determines what the organisation can
notice.

The subtle failure lives in the escape hatch. A search box over a capped table
filters **the loaded rows**, not the population — so when it finds nothing it
must say *not among the rows shown* and hand the query onward to the full
surface, never *no such row exists*. A lookup that reports absence when it only
searched a window is the original defect wearing a helpful interface. The same
applies to a bounded scan of a long trail: reading the most recent N records is
a **scope**, and a scope stated is honest where a scope hidden is a truncation.

**7. Keep the header and the rows in agreement.** When a filter is active, the
count reports the filter ("6 of 12 matching") rather than the cap, so the
header never describes a population the rows below it do not show. And an
export takes exactly the rows on screen, under exactly the visible filter and
cap, carrying the disclosure with it: a file that quietly disagrees with the
surface that produced it is the same defect one layer down, and it is the layer
where nobody can check.

## Deciding the cap itself

- Cap by **legibility**, not by round numbers. Eight rows that are readable
  beat ten that are not, and both must be declared.
- Prefer a **coverage-based** cap where the distribution is skewed: "the rows
  covering 90% of volume, plus Other" tells the reader something the rank
  cutoff does not.
- Where a cap exists purely for query cost, say that too. "Showing the first
  500 records" is a different claim from "the top 500", and a reader who
  mistakes the first for the second has mistaken an arbitrary slice for a
  ranking.

## Decision rules

- **When rows are filtered rather than capped**, the same obligation applies
  and is stronger: a filter is a claim about relevance, and the reader must be
  able to see which one is active. Filters that persist across navigation and
  into exports are the version that causes real errors, because the person
  reading no longer knows a filter exists.
- **When the total is computed over the full population and the rows are
  capped**, that is correct — and it is exactly why the remainder row is
  mandatory. Never "fix" the mismatch by recomputing the total over the
  visible rows; that replaces a visible discrepancy with an invisible lie.
- **When a chart caps its categories**, the cap applies to the legend too. A
  legend listing ten of thirty-four series reads as a complete key.
- **When an export truncates**, it must carry the cap statement as a row or a
  header line. A truncated spreadsheet with no marker is indistinguishable
  from a complete one the moment it leaves the product.

## When not to use this

- **Where the cap is the question.** A "top 5 sources" panel that a reader
  explicitly asked for, labelled as such, is already honest — the label is the
  disclosure. The obligation remains to account for the rest wherever a total
  appears next to it.
- **Where every row is shown.** Do not add "showing 6 of 6"; noise that always
  fires trains readers to ignore the notice when it means something.
- **In a paginated view with a visible count and controls**, the pagination is
  the disclosure. Take care that any total, chart or summary drawn beside it is
  computed over the full set and says so, rather than over the current page.
