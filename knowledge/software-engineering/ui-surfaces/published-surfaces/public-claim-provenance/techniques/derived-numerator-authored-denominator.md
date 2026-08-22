---
layer: technique
type: technique
subject: public-claim-provenance
technique: derived-numerator-authored-denominator
status: forged
laws: [derivation-names-recomputation, count-carries-predicate]
shared_with: []
use_when: [putting a progress fraction on a public page, a headline count must track a shipped catalog, deciding whether a public number is a fact or a goal]
---

# Derived numerator, authored denominator

A public fraction is two numbers with two different provenances wearing one
typographic form. The left half is almost always a **fact about what ships** —
how many entries exist, how many checks pass, how many surfaces are built. The
right half is almost always a **commitment** — how many are wanted, by when,
to what standard. Facts can be derived. Commitments cannot, ever, by anything,
because no instrument observes a decision that has not been made into a thing
yet. Treating both halves the same way is the defect: derive both and the
target becomes whatever the catalog happens to hold, which turns every
roadmap into "100% complete"; type both and the whole fraction is a sentence
somebody wrote once.

## The sorting question

For every number on the surface, ask: **would this change if the product
shipped one more of something, with nobody editing this page?**

- **Yes** → it is a fact. Derive it, from the same catalog the product ships
  from, and never from a parallel list maintained beside it.
- **No — it would change only if someone changed their mind** → it is a
  commitment. Hand-author it, and flag it per
  [no-data-source-labelled-inline](./no-data-source-labelled-inline.md).

The question sorts more than fractions. A headline count of supported
capabilities, a badge showing how many checks a repository passes, a "covers N
of M cases" strip: all of them decompose into the same two halves, and any
number that survives the question as "fact" has an obligation to derive.

It is also asked **per value, not per component**. One bar routinely carries
both provenances: a printed count derived from the catalog, beside a fill
geometry that is a hand-authored judgment because the underlying completeness
has no instrument at all. That is an honest shape and a common one — the error
is answering the question once for the whole element and letting the answer
cover a value it does not fit, which in practice means a derived count
lending its credibility to a fill nobody measured. Sort each, label each.

## The procedure

1. **Locate the catalog of record.** The derivation must read the thing the
   product actually ships — the module the runtime loads, the directory the
   packager walks, the table the feature queries. A hand-maintained list of
   "things we support", kept next to the real one for the marketing page, is
   the failure this technique exists to remove; it is a second authority over
   one vocabulary and it will diverge on the first entry added in a hurry.
2. **Derive the fact half at the coarsest granularity the surface shows**, and
   no coarser. If the page shows per-area progress, the derivation produces a
   count per area, not one total the page then subdivides by hand.
3. **Declare the commitment half in one table**, adjacent to the derivation,
   so a reviewer sees both provenances on one screen. Split across two files,
   nobody ever reads the pair together and the seam stops being visible.
4. **State the recomputation path at the declaration**
   ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)):
   what is read, when it runs, what makes it run again. A derived value whose
   recomputation nobody can invoke is a cache with a marketing budget.
5. **Carry the predicate with the fact half**
   ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)). "Forty
   entries" is not a claim; "forty entries with a published record, counted at
   build" is. The predicate belongs in the derivation's own declaration even
   when the surface renders only the digit, because the digit is what gets
   quoted back at you.

## The forbidden inversion

**Never hand-author the numerator over a derived denominator.** It is worth
stating as its own rule because it is the shape of nearly every public number
that has ever embarrassed a team: a typed count of what is done, over a real
count of what exists. It survives review because the derived half looks
rigorous and lends the typed half its credibility, and it fails the moment the
denominator grows — at which point the surface silently claims a completion
ratio that has gone up while nothing was completed, or reports more done than
there are things to do.

If the fact half genuinely cannot be derived, the honest surface does not
render a ratio at all. Two hand-authored numbers formatted as a fraction claim
a measurement that nobody made; the same two numbers in prose ("we are aiming
for sixty, and have built most of the first thirty") claim exactly what they
are. A bar, a percentage, and an "N of M" are all measurement typography, and
typography is a claim.

## Decision rules

- When the fact half's catalog is expensive to load, the answer is to derive
  it somewhere cheaper, not to stop deriving it — see
  [build-time-derivation-off-the-client-bundle](./build-time-derivation-off-the-client-bundle.md).
- When a commitment half would need to change every quarter, that is a signal
  the target is a forecast rather than a goal. Forecasts on public surfaces
  age worse than either facts or goals, because they carry an implied date the
  page does not show. Publish the goal, not the forecast.
- When the fact half and the commitment half are both derived from the same
  catalog — a "how many of the entries are complete" ratio — this technique
  does not apply and the pair is an ordinary measurement; the honesty rules
  that govern it are about the sample, not the provenance.
- When a fact half can only be undercounted (sources that block observation,
  entries that exist but cannot be enumerated), it is a floor rather than a
  total, and the surface says so. That is a measurement-honesty obligation
  inherited, not restated here.

## When not to use this

A count with no meaningful total — visitors, downloads, years in operation —
has no denominator to sort, and forcing one on it invents a target the team
does not hold. The derivation half of the technique still binds: the count
comes from something that counts, or it is labelled. The split does not.

Likewise, an internal progress dashboard is free to derive both halves from a
planning system, because a planning system *is* an instrument that observes
commitments — someone entered them, and the entry is the record. The technique
is about public surfaces precisely because no such record exists on the far
side of the boundary; the reader has the page, and the page is the only
evidence there is.
