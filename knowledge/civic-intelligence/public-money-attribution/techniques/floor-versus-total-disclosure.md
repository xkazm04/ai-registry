---
layer: technique
type: technique
subject: public-money-attribution
technique: floor-versus-total-disclosure
status: forged
laws: [every-cap-ships-its-population, deterministic-code-owns-numbers]
shared_with: []
use_when:
  - the underlying corpus may be capped or truncated
  - rendering a money sum whose completeness is uncertain
---

# Floor versus total disclosure

A sum over a capped corpus is a floor. Rendering it under a "total" heading
presents a lower bound as a census — a fabricated claim about completeness,
even though every constituent number is real. The technique is the discipline
of knowing, for every figure, whether the read beneath it was complete, and of
carrying that knowledge *through the arithmetic* to the rendered word: "at
least" versus "in total".

## Detecting the cap you were not told about

Ingest caps are often invisible by the time the data is queried: the pipeline
that pulled a bounded page of contracts per entity is long gone, and the store
just holds numbers. But a cap leaves a signature: **a run of entities sitting
at exactly the same maximum count**. Real per-entity counts are heavy-tailed;
several entities at an identical shared ceiling is the cap's fingerprint, not
coincidence. The detection rule: a ceiling is credible when the observed
maximum is low (an ingest-page-sized number, not an organic one) *and* shared
by several entities. One large supplier that happens to top the list is not a
cap.

Compute this from the data on every read rather than hardcoding "the corpus is
capped": a re-ingest that lifts the cap then silently turns the floor wording
off, and a re-ingest that reintroduces one turns it back on. The detector is
deterministic, reviewable code, and its output — the cap value, how many
entities sit at it, whether the figure is a floor — travels with the number
([deterministic-code-owns-numbers](../../_laws.md#deterministic-code-owns-numbers)).

## The cap no signature can see: the source's own publication rules

One cap class leaves no fingerprint in the data at all: the register itself
publishes only what its rules require — contracts above a statutory value
threshold, awards after a cutoff date, one procedure type and not another.
An ingest that reads *everything the source holds*, uncapped and complete,
is still a floor of the state's actual spending, and no ceiling-signature
detector can discover that, because the truncation happened before the data
existed. This knowledge comes only from the source's documented rules, so it
is carried as *declared* coverage metadata — recorded at ingest, attached to
the corpus, and merged into the same floor-versus-total verdict the detector
feeds. Field practice confirms the shape of the gap: the standard contracting
schemas themselves omit fields that completeness accounting needs, so "the
source published it all" is a claim about the source's rules, never about
the absence of a cap signature.

## The scale trap: a corpus statistic is not a slice statistic

The cap signature is a *corpus-level* statistic, and only the corpus may run
it. Calibrated on a population of hundreds of entities, "several entities
share a low maximum" is a signature; on one official's slice of three or four
entities, it is noise — three small firms that organically have the same
handful of contracts each will satisfy the test, and the page starts printing
"at least" plus a sentence naming a per-entity cap that does not exist. A
false floor is the mirror defect of a false total: it tells the reader the
investigation found more than it published, which is its own kind of
fabrication. One live case file sat one coincidental count away from
publishing exactly that.

The fix is a declared read scope. A caller that read the whole corpus lets the
signature detector run. A caller that performed an indexed per-entity read
declares what *it* knows about its own read: **slice-complete** (the read did
not hit its own limit — the figures are what the store holds, and the corpus
cap question is not the slice's to answer) or **slice-truncated** (the read
hit its own limit — the figure is a floor for a reason that has nothing to do
with any ingest cap, and no per-entity cap value is invented for it). Scope is
the *only* parameter a caller may pass into the shared arithmetic; everything
else is fixed.

## Decision rules

- **When the coverage says floor, the surface says "at least"** — in the
  headline, the cell, and the citation text alike. Wording is part of the
  figure, not a copy-edit.
- **When a cap is detected, ship its population**: the cap value and the count
  of entities sitting at it render alongside the number, so the reader can see
  the size of what was truncated
  ([every-cap-ships-its-population](../../_laws.md#every-cap-ships-its-population)).
- **When the read scope is declared, never also run the corpus heuristic** on
  the slice — the two answers are not comparable and the heuristic's false
  positives at small n are near-certain.
- **When floor and total figures meet in one view**, do not sum them into a
  single labeled quantity; a floor plus a total is a floor, and the label must
  downgrade accordingly.
- **When in doubt about a read's completeness, claim the floor.** Understating
  completeness costs rhetorical force; overstating it costs the truth of the
  claim.

## When not to use it

Do not use floor wording as a universal hedge. Stamping "at least" on figures
whose reads are known-complete trains readers to ignore the qualifier and
surrenders the strongest honest claim available. The technique's value is the
*distinction*; blurring it in either direction — false totals or reflexive
floors — destroys it. Nor does the cap signature substitute for provenance:
knowing a corpus is capped tells you the figure is a floor, not that the
figure is right.
