---
layer: application
type: application
subject: public-money-attribution
technique: public-body-classification
stack: node
status: forged
verified_on: 2026-08-19
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

- `PUBLIC_LEGAL_FORMS` (`public-body.ts:38-55`) is a deliberate ALLOWLIST.
  Every code carries a `verifiedVia` string naming the real subject it was
  checked against ("00006947 Ministerstvo financí", "00216208 Univerzita
  Karlova") or ARES's own `PravniForma` číselník — because that číselník
  endpoint returns only a fragment of the full table, so the list is "not
  machine-complete by construction — hence the loud `unknown` path rather
  than a closed-world assumption."
- `PRIVATE_LEGAL_FORMS` (`public-body.ts:62-84`) lists ordinary business
  forms explicitly; the comment states the point: listing them "is what makes
  the `unknown` verdict possible."
- `isPublicLegalForm()` (`public-body.ts:87-93`) returns `true | false |
  null` — null for a code in neither table.

## The verdict function

`classifyPublicMandate()` (`public-body.ts:132-201`) orders the checks: own
public form → `public-body`; else any *current* public-form shareholder →
`publicly-owned` (`s.current && isPublicLegalForm(s.legalForm) === true` at
line 152 — historical holders, past `datumVymazu`, never decide). Then the
negative cases, each commented "the expensive error is calling a public body
private": unknown own form → `unknown`, `attributable: false`; VR record not
retrieved → `unknown` with the reason string spelling out that "nepřítomnost
dat není důkazem soukromého vlastnictví" (absence of data is not evidence of
private ownership); an unknown code among current holders → `unknown` routed
to manual review. Only the fully-evidenced path returns `private`,
`attributable: true`. Every verdict also returns `unknownCodes` "so callers
can log and extend the table rather than silently mis-classify."

## Reading the register defensively

`shareholdersFromVr()` (`public-body.ts:205-229`) reads BOTH `akcionari` and
`spolecnici` arrays from the VR payload — batch 002's P35 lesson that
"several VR arrays are load-bearing, not just one" — and skips natural
persons on purpose: this classifier asks about PUBLIC ownership only.

## Where the verdict lands

The `steward` split that consumes this classification is the header rule of
`features/money/reachableMoney.ts` (rule 2: a steward seat's contracts are
"that body's OWN public activity, never the MP's enrichment"; since the
batch-012 re-ingest steward money is ~91% of the raw total, an
undifferentiated figure is "false at ten times the volume"). The tie-class
precedence that keeps a human's ruling above the substring heuristic is
`resolveTieClass()` in `features/money/reviewTypes.ts:250-256`.
