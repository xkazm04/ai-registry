---
layer: application
type: application
subject: public-money-attribution
technique: public-body-classification
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@24
---

# Node: ownership-based public-mandate classifier

The politicas repo's classifier lives in `lib/analysis/public-body.ts` — a
pure module that answers "is a company's money its OWN public mandate, or
could it reach a politician?" for the money case's attribution rule.

## The incident in the header

`public-body.ts:1-22` records the anchor incident: money batch 009 keyed its
public-body test on the entity's NAME, caught every "Ministerstvo …" /
"… kraj" / "Město …", and missed **Zdravotnický holding Královéhradeckého
kraje a.s.** — a region-owned company under an ordinary private legal form,
which was also the single largest CZK figure that batch produced. The fix is
ownership-based, in two layers: the entity's own legal form
(`pravniForma`) first, then its current shareholders/members from the ARES VR
record.

## Three tables, loud unknowns

- `PUBLIC_LEGAL_FORMS` (`public-body.ts:38-58`) is a deliberate ALLOWLIST.
  Every code carries a `verifiedVia` string naming the real subject it was
  checked against ("00006947 Ministerstvo financí", "00216208 Univerzita
  Karlova") or ARES's own `PravniForma` číselník — because that číselník
  endpoint returns only a fragment of the full table, so the list is "not
  machine-complete by construction — hence the loud `unknown` path rather
  than a closed-world assumption."
- `PRIVATE_LEGAL_FORMS` (`public-body.ts:74-103`) lists ordinary business
  forms explicitly; the comment states the point: listing them "is what makes
  the `unknown` verdict possible."
- `isPublicLegalForm()` (`public-body.ts:106-112`) returns `true | false |
  null` — null for a code in neither table.

**Since first documented (2026-08-19):** both tables grew and were corrected
under money batches 016/019 — several codes were reclassified (`301`, `771`,
`941` moved from private to public; `112`/`113`/etc. labels fixed) and the
steward-class sweep added six private-law codes (`117`, `118`, `141`, `145`,
`161`, `722`, `733`) that had been falling through to `unknown` by omission.
`PRIVATE_LEGAL_FORMS`'s header now also names three codes **deliberately
left out of both tables** (`741` professional chamber, `745` other chamber,
`999` "Ostatní") specifically so they keep answering `unknown` rather than
being asserted either way — a documented refusal to guess, not an oversight.

## The verdict function

`classifyPublicMandate()` (`public-body.ts:189-273`) orders the checks: own
public form → `public-body`; else any *current* public-form shareholder →
`publicly-owned` (`s.current && isPublicLegalForm(s.legalForm) === true` at
line 209 — historical holders, past `datumVymazu`, never decide). Then the
negative cases, each commented "the expensive error is calling a public body
private": unknown own form → `unknown`, `attributable: false`; VR record not
retrieved → `unknown` with the reason string spelling out that "nepřítomnost
dat není důkazem soukromého vlastnictví" (absence of data is not evidence of
private ownership); an unknown code among current holders → `unknown`,
`attributable: true`, routed to manual review. Only the fully-evidenced path
returns `private`, `attributable: true`. Every verdict also returns
`unknownCodes` "so callers can log and extend the table rather than silently
mis-classify."

**Since first documented (2026-08-19), money batch 015 added a fourth
verdict** the doc above did not anticipate: `ownership-not-published`
(`public-body.ts:170,256-264`). The module's own doctrine — "absence of data
is not evidence" — had been enforced for a VR record that failed to fetch,
but not for a VR record that fetched fine and simply named no *current*
owner, which for an akciová společnost is the normal case (VR lists
shareholders only in special circumstances). Measured over the 57
attributable tied companies, **49 of 52 `private` verdicts (18.05 mld. CZK,
98% of the attributable money) rested on that silence**, including Pražská
energetika a.s. (city-owned through a holding, VR names no shareholder at
all). The new state sits between "unknown code among current holders" and
the `private` fallback, stays `attributable: true`, and is gated behind an
optional `ownersRecorded` input (`PublicMandateInput.ownersRecorded`,
`public-body.ts:145`) so callers that have not been updated keep the
pre-batch-015 behaviour rather than being silently reclassified.

## Reading the register defensively

`shareholdersFromVr()` (`public-body.ts:282-284`) is now a thin wrapper over
`ownershipRecord()` (`public-body.ts:297-339`), which reads BOTH `akcionari`
and `spolecnici` arrays from the VR payload — batch 002's P35 lesson that
"several VR arrays are load-bearing, not just one" — and skips natural
persons on purpose in the `legalPersons` list it returns: this classifier
asks about PUBLIC ownership only, though `ownershipRecord` now also counts
natural-person entries (`entriesTotal`/`entriesCurrent`) to feed the
`ownersRecorded`/`ownership-not-published` check above.

**Since first documented (2026-08-19):** money batch 018 (2026-08-23, after
this application was first recorded) found the reader itself was
incomplete. Two member shapes exist in the VR payload —
`akcionari[].clenoveOrganu[]` (member object IS the person record) and
`spolecnici[].spolecnik[]` (member wraps `osoba` + `podil[]`, the share
percentage) — and only the first was read. The classifier therefore never
saw an s.r.o.'s `společník` at all: SPOLANA (ORLEN Unipetrol RPA, 100%
owner) and every other s.r.o. with a current owner were filed
`ownership-not-published` for want of a code path, not for want of a real
owner. `ownershipRecord` now reads both shapes (`public-body.ts:311-314`).

## Where the verdict lands

The `steward` split that consumes this classification is the header rule of
`features/money/reachableMoney.ts` (rule 2: a steward seat's contracts are
"that body's OWN public activity, never the MP's enrichment"; since the
batch-012 re-ingest steward money is ~91% of the raw total, an
undifferentiated figure is "false at ten times the volume"). The tie-class
precedence that keeps a human's ruling above the substring heuristic is
`resolveTieClass()` in `features/money/reviewTypes.ts:250-256`.
