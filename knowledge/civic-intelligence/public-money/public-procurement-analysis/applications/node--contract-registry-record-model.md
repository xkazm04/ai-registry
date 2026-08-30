---
layer: application
type: application
subject: public-procurement-analysis
technique: contract-registry-record-model
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@24
---

# Node: record-modeling a national contract registry (politicas)

The politicas repo ingests the Czech contract registry (Registr smluv,
smlouvy.gov.cz) through two Node/TypeScript clients, and its header comments are a
measured record of every distinction the technique demands.

## Contract id vs version id — established by a decisive collision

`lib/ingest/sources/smlouvy-dump.ts:14-23` documents the batch-012 measurement: the
corpus keys `contract:<n>` on `idSmlouvy`, while the web URL `/smlouva/<n>` and the
dump's `<odkaz>` use `idVerze`, a *different sequence whose values overlap* —
`idSmlouvy` 1443766 is a 2017 AGROFERT contract, `idVerze` 1443766 an unrelated
pharmaceutical one. Keying a re-ingest on the URL id "would have silently duplicated
the entire corpus," and an earlier sweep had in fact recorded `idVerze` under the
name `contractId` (smlouvy-dump.ts:22). The interface at smlouvy-dump.ts:57-61 keeps
both: `idSmlouvy` as "THE graph key," `idVerze` as an attribute.

## Publisher-side vs party-side — the search-role asymmetry, tested

`lib/ingest/sources/smlouvy.ts:31-41`: `party_idnum` matches only the non-publishing
party; `subject_idnum` is the publisher side. A decisive test (money batch 011) —
one agency's known contract returning zero rows on `party_idnum` and one row on
`subject_idnum` for the same day — retired the file's own earlier claim that the
parameter "matched EITHER party" ("the claim was never tested until batch 011",
smlouvy.ts:40-41). The stated consequence for callers is the technique's rule: a
one-sided sweep misses every self-published contract.

## Fail-loud shape assertion, calibrated to what the site renders

`checkHeaderRow` (smlouvy.ts:189-208) compares every fetched page's `<thead>` labels
against a pinned list and throws on drift — "silently mis-parsing a shifted column
would fabricate a contract value out of the wrong cell." Calibration matters: the
site's action column has an empty `<th>`, so it is asserted by cell *count*, not
label; an earlier revision expected a literal "Detail" label that the site never
renders (batch 009), turning cosmetics into false alarms. `parseValueCell`
(smlouvy.ts:210-225) maps the publisher's own sentinel `"Neuvedeno"` to
`{valueCzk: null}` — "NEVER coerced to 0" — and `parseCzechDate` returns null,
never a guess.

## Compliance by construction

The dump's license makes the harvester a personal-data controller with deletion
obligations, so smlouvy-dump.ts:39-46 enforces GDPR structurally: only records
matching an explicit IČO allowlist are retained, and the natural-person fields
(`schvalil`, `datovaSchranka`, `adresa`) are dropped at parse time. Re-harvesting
from current dumps is how upstream deletions propagate — compliance is a parser
property, not a cleanup job.

## Upward lessons this repo taught the standard

Two things the expert draft lacked and the repo's incident record supplied: the
session-bound pagination trap (smlouvy.ts:11-30 — the search is token-free but *not
stateless*; page-size signals mutate session state and return zero rows without the
first request's cookie, so retrieval conditions must be modeled even for "public"
endpoints), and the value of writing the decisive test into the header next to the
claim it retired, so the wrong folk belief cannot regrow.
