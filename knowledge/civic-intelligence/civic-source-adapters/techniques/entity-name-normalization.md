---
layer: technique
type: technique
subject: civic-source-adapters
technique: entity-name-normalization
status: forged
laws: [one-definition-one-import, lead-not-finding, missing-is-not-zero]
shared_with: []
use_when: [matching person or company names across registries, building searchable name columns, choosing a diacritic-folding strategy]
---

# Entity name normalization

Civic sources spell the same entity differently: with and without diacritics, with
academic titles and honorifics, with legal-form suffixes in three abbreviation
styles, in display order and registry order. Cross-source joins — the whole point of
a civic graph — live or die on making these forms comparable without collapsing
genuinely distinct entities together. The technique has three commitments: one
explicit folding scheme, applied once at ingest, feeding matches that are candidates
rather than conclusions.

## Build the fold table explicitly; do not trust decomposition

The tempting shortcut for diacritic folding is Unicode normalization: decompose to
NFD, strip combining marks. It is wrong for exactly the alphabets civic data in
much of Europe is written in — several letters with carons, strokes, and slashes
(the d-caron/t-caron/l-caron family, stroked d and l, slashed o) do **not**
decompose into a base letter plus a combining mark, so they survive the strip
untouched and those names silently fail to fold. Because the failures cluster on
specific letters, they cluster on specific *names* — the same people mismatch
forever, which is far worse than a uniform error rate.

So: an explicit character-to-ASCII fold table, covering the full alphabet of the
languages that actually appear in the corpus (including neighboring languages'
letters — naturalized citizens and historical records import them), plus the
multi-character folds (ß→ss, æ→ae). Lowercase first, fold through the table,
collapse and trim whitespace. Keep it deterministic and allocation-cheap; it runs
once per ingested row.

Layer the rest of name canonicalization as separate, individually testable steps:
strip academic titles and honorifics (a closed, per-country list — another thing to
model, not guess), canonicalize legal-form suffixes for organizations, and decide
ordering (display versus registry order) once.

## One scheme, applied at ingest, persisted and indexed

- **Fold at ingest time, persist the folded form** in its own column, and index
  that column. Folding at query time defeats the index and — worse — reintroduces
  the environment dependency you avoided: database-side unaccenting extensions
  differ from your application fold in edge cases, and embedded engines may not
  ship them at all.
- **One folding function, imported by every consumer** — ingest, search, and
  matching all call the same code. Two folds that agree on 99% of inputs disagree
  on precisely the rare letters, i.e. precisely the distinctive names where
  matching matters most. This is
  [one definition, imported everywhere](../../_laws.md#one-definition-one-import)
  at its sharpest: a second folding scheme is a future mismatch with a person's
  name on it.
- **Version the scheme.** Changing the fold table invalidates every persisted
  folded value; a change means a re-fold migration of the normalized columns, not
  a quiet edit that leaves old and new rows folded differently in one index.

## A folded match is a candidate, never an identity

Name equality — even perfect, folded, title-stripped equality — is weak evidence.
Common names collide; transliterations coincide. The adapter's output is therefore
a *match candidate* carrying its evidence (which forms matched, from which
sources), and identity is adjudicated downstream with independent keys: a registry
identifier, a birth date used strictly as a comparison key, an address at the
role-relevant granularity. Per
[a machine result is a lead, never a finding](../../_laws.md#lead-not-finding),
nothing consequential — least of all a conflict-of-interest edge — rides on a name
match alone.

Honesty about the matching substrate is part of the technique. Free-text
self-declared fields (occupations, affiliations) are seductive join material and
must be measured before trusted: quantify on real data what fraction is usable for
the signal you want, and carry that number with every metric built on the field.
A measured blind spot disclosed is coverage information
([missing is not zero](../../_laws.md#missing-is-not-zero)); an unmeasured one is
a silent bias toward whoever writes tidy strings.

## When not to use this

Do not fold for *display* — the folded form is an index key, and rendering it
would misspell every name it exists to match; the original spelling is the datum.
Do not extend folding into phonetic or fuzzy matching by default: edit-distance
and phonetic schemes trade precision for recall and belong in an explicitly
labelled candidate-generation tier with its own thresholds, never silently inside
the canonical fold. And where a source provides stable numeric identifiers, join
on those and demote names to corroboration — normalization is the fallback for the
joins identifiers cannot make.
