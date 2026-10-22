---
layer: application
type: application
subject: legislative-change-tracking
technique: statute-citation-extraction
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Title citation extraction over a national print register (Node)

The politicas repo turns the Czech Chamber of Deputies' bill titles (psp.cz
`tisky.zip`, column 15) into bill→statute edges. The node@24 witness is the CI
pin:
`.github/workflows/ci.yml:36` "node-version: 24". Before this run the seam already held three of
the technique's rules. One citation pattern, `LAW_CITATION`, is defined once and
imported by the ingest, the body-text census, the collision core and the
law-verdict gate. It carries the treaty-series negative lookahead
`Sb.(?!\s*m\.\s*s\.)`, which was proven on three false edges. Each statute is
counted once per title. The run therefore chose a seam that could falsify the
technique's other claim: a citation proves pointing, not amending, even in the
narrowest authoritative text.

## What the title carried that the pattern could not see

The drafting convention names each target together with its amendment history:
"kterým se mění zákon č. 151/2025 Sb., …, ve znění zákona č. 360/2025 Sb.,
zákon č. 110/2006 Sb." (amends act 151/2025, as amended by act 360/2025, and
act 110/2006). Act 360/2025 last amended the target. The bill does not amend
it. Two term-10 bills (prints 88 and 124) were recorded as amending such
history acts. Both therefore appeared in those acts' statute dossiers and bill
detail as amendments they do not make. Across all terms in the dump, 856 of
6,890 title edges, on 487 bills, sit in such a clause.

## A and B

- **A**: `extractAmendedLaws` as it stood: every match becomes an edge.
- **B**: `splitTitleCitations`. A citation is history when a "ve znění"
  precedes it and nothing after that reopens a target list:
  `lib/ingest/sources/psp-legislation.ts:67` "export function splitTitleCitations"
  and `lib/ingest/sources/psp-legislation.ts:57` "const REOPENS_TARGETS =". A list is reopened by an accusative target
  noun, "kterým se mění", "o změně", or the generic "ve znění pozdějších
  předpisů", which closes its own clause. History is returned for counting and
  is never re-attributed. `LAW_CITATION` is untouched, so consumers that count
  pointing citations keep doing so.

**Target:** false amendment-history edges in the live term's titles. A 2, B 0.
**Floor:** 183 of 183 other term-10 edges unchanged, and 4,217 tests, typecheck,
eslint and doc-sync green. The new test fails on A, which returns 300/2025 as a
target:
`lib/ingest/sources/psp-legislation.test.ts:28` "drops the amendment-history acts a title names after". Shipped as politicas 7c1e748.

## The boundary the replay found

The first B predicate treated any citation after any "ve znění" as history.
Over the all-term titles it dropped one real target: "…, ve znění pozdějších
předpisů, a o změně zákona č. 50/1976 Sb." (print 132, 4th term). Here the
generic as-amended phrase is followed by a target in the genitive case. Case
alone does not separate the two roles, so the clause boundary is needed as
well. That case is now a test:
`lib/ingest/sources/psp-legislation.test.ts:47` "keeps a genitive target after the generic". The verdict on the 25-row spread sample and on the six bills left
with no target is a hand read, not an instrument. All six are correct: their
real target is the Charter, named without a number, or a citation written
without the dot ("č 418/1990"). The pattern misses those by construction.

## What this realization cannot do

It reads titles only. The omnibus undercount the technique names still applies,
and the body-text census is the reconciliation side. The history count is
returned but not yet surfaced next to the census line. The live graph changes
at the next law ingest. No store was read here, so whether the two edges are
still live was not measured. Names inside a cited act's own title ("zákon
č. 77/2002 Sb., …, a o změně zákona č. 266/1994 Sb.") still enter as edges.
That is pointing inside a name, and only the instruction grammar can reject it.
