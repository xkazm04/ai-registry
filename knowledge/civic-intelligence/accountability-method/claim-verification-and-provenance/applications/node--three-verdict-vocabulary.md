---
layer: application
type: application
subject: claim-verification-and-provenance
technique: three-verdict-vocabulary
stack: node
status: forged
verified_on: 2026-08-19
---

# Node: a pure verdict module behind a public claim gate

The politicas repo realizes the three-verdict vocabulary as one pure
TypeScript module, `features/overeni/verdict.ts`, behind its public gate at
`/overeni`. The header (lines 1-18) states the contract verbatim: three
answers, no fourth — `verified` ("today's re-derivation gives the same
content"), `moved` ("the address is valid but the value or content moved —
the verdict carries BOTH sides with dates"), `unknown` ("undecodable address,
figure outside the registry, or a record today's derivation no longer
carries") — and the module "derives NOTHING on its own, it only translates
the answers of the existing family loaders into one vocabulary". Inputs are
structural subsets of the loaders' result types so the module stays pure and
testable without server-only imports.

## The union carries the evidence

`GateVerdict` (verdict.ts:56-91) is a discriminated union over
`family × kind`: value-claims ("figura") carry the issued figure plus
`citedValue`/`citedDate`/`movedBy`/`citedDerivation`; receipt claims
("zdroj") carry the full `ProvenanceReceipt`; fingerprinted views ("graf",
"exponat") carry a `HashComparison` with `citedHash`, `currentHash`, and
`currentDate` — whose comment admits the address does not carry the
citation's own date, so "the surface concedes that, it does not guess it"
(verdict.ts:51-53). Every `unknown` carries an enumerated `reason`
(`mimo-rejstrik` = never issued, `zaznam-nenalezen` = record gone,
`nerozlustitelny` = undecodable), and the platform's own non-citation URLs
get a dedicated reason so the gate never tells a reader it does not
recognize its own pages (verdict.ts:279-281).

## Verified means what was re-derived — the comments enforce it

`figuraVerdict` (verdict.ts:106-122) compares exactly: pasted machine values
round-trip through `String(value)`, "so equality of numbers is equality of
bytes"; a bare ref with no pasted value returns `verified` with today's
value — "the input claimed nothing, it only asked" (verdict.ts:95-98). And
the derivation is compared too: same value written by a different formula is
`moved` with `movedBy: "basis"`, because "'verified' would confirm a match
that is a coincidence of two different formulas" — the comment anchors this
to the real 2026-07-29 → 08-04 incident (formula corrected, data not)
(verdict.ts:100-105).

`zdrojVerdict` (verdict.ts:142-159) shows the existence-claim reading:
a receipt has no value or hash to compare — "the claim IS the graph record
itself", so existence ⇒ `verified` and there is no `moved` "by principle: an
edge is in the graph or it is not". The warning comment at verdict.ts:147-150
is the technique's key subtlety in situ: "`verified` here means the EXISTENCE
of the record, not its approval" — the human-gate state is a separate
modifier (`verdictGate`/`verdictTone`, lines 213-255), without which "a
/zdroj link to a rejected tie would typeset a giant 'VERIFIED'".

## Copy as keys, and a completeness fixture

The module returns copy *keys* (`verdictHeadlineKey`/`verdictLeadKey`,
verdict.ts:268-313) into the `overeni.*` message catalog — until 2026-08-04
it returned Czech sentences, making the gate "the only monolingual surface
on a route that starts bilingual" (comment at verdict.ts:257-262). The
headline fork for existing-but-rejected/pending records happens here, in
testable code, not in JSX. `VERDICT_COPY_KEYS` (verdict.ts:316-335) exports
every key the module can return, feeding a catalog-completeness test — the
closed vocabulary is enforced by enumeration, not by review vigilance.

## Why this is the reference shape

Everything the technique prescribes is observable in one file: the closed
three-kind union, reasons on every unknown, both-sides evidence on every
moved, exact comparison with byte equality, existence vs. approval kept
orthogonal, translation-not-derivation over the same loaders the publishing
surfaces use (`claimStatus` from `lib/claims/claim.ts`, `ProvenanceReceipt`
from `features/shared/provenance/receipt.ts`), and copy externalized so the
vocabulary can be verified complete.
