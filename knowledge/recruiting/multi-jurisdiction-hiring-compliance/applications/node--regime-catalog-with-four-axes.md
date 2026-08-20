---
layer: application
type: application
subject: multi-jurisdiction-hiring-compliance
technique: regime-catalog-with-four-axes
stack: node
status: forged
---

# Node: the seven-regime catalog in KandiDate

`app/_lib/compliance-regimes.ts` is the catalog, and it is a near-textbook
realization of the technique — with one deviation worth naming precisely.

## The four axes are the type

`ComplianceRegime` (`compliance-regimes.ts:19-34`) declares exactly the four
axes, each with a doc comment stating what it is for:

- `dataLaw` — "the data-protection law candidate PII is processed under";
- `oversightBasis` — "the legal hook for the human-in-the-loop /
  no-solely-automated-decision guarantee the app already enforces (screen-wave
  approval, human decisions)";
- `antiDiscrimination` — "the equal-opportunity / anti-discrimination framework
  the jurisdiction assesses hiring against";
- `adverseImpactStandard: string | null` — "the named statutory adverse-impact
  test, where the jurisdiction has a fixed one".

Seven rows fill it (`compliance-regimes.ts:16`, `:39-84`): `eu`, `uk`, `us`,
`sg`, `in`, `ae`, `global`. The row set is keyed by a `RegimeId` union derived
from a `REGIME_IDS` tuple, so nothing keys off a display string — the stable
identifier discipline is enforced by the type system rather than by convention.

## The null column, confirmed

`adverseImpactStandard` is non-null in exactly one of seven rows: `us` carries
`"Four-fifths (80%) rule"` (`compliance-regimes.ts:64`). Every other row is
`null`, and the field's own comment (`:29`) says why — "null where there is no
single codified ratio — the `computeAdverseImpact` primitive still applies, but
no jurisdiction-specific threshold is asserted."

That sentence is the whole of
`codified-threshold-only-where-one-exists` in one line: the measurement is
still available (`app/_lib/adverse-impact.ts` holds the four-fifths primitive
with a small-cohort floor, browser-only over pasted counts), but no threshold
is *asserted* for a jurisdiction that has not set one. The deployer quick-sheet
in `docs/features/compliance/ai-act-conformity.md` §5 completes the loop by
telling a customer in a bias-audit jurisdiction to run that worksheet with
externally collected demographic counts, because the product holds none itself.

## Purity of the module, confirmed

The header comment (`compliance-regimes.ts:1-9`) states the constraint
explicitly: "this module is just the reference data + normalization, so it
imports nothing and is safe in the browser bundle, on the server, and under
`node --test`." The file has zero imports. This is what lets the same rows feed
a client-rendered candidate disclosure (`app/_components/AiDisclosure.tsx`), a
server route (`app/api/compliance/route.ts`) and the recruiter Decisions card
without any of them growing a private copy.

## Proper nouns are not translated

`compliance-regimes.ts:12-14`: "The law names are proper nouns (identical
across cs/en), so they live here as plain strings; the connecting prose is
i18n-templated at the render sites with these values interpolated in." In a
bilingual product this is the difference between a candidate being able to look
up "GDPR Art. 22" and being shown a translated approximation of it. This was an
upward lesson from the repo — the draft standard did not carry it.

## The `global` row

`compliance-regimes.ts:76-83` is the neutral row: `dataLaw` is "applicable
local data-protection law", `oversightBasis` is "human-in-the-loop review (no
solely-automated adverse decision)", `antiDiscrimination` is "applicable
equal-opportunity law". Its comment calls it "the honest fallback for a
workspace that spans jurisdictions or hasn't picked one." Also an upward
lesson: the draft's original rule was pure refusal, and a neutral row that names
the guarantee instead of an instrument is strictly more useful to a candidate.

## Deviation: the coercion target

`normalizeRegimeId` (`compliance-regimes.ts:95-99`) coerces any unknown, stale
or hand-edited value to `DEFAULT_REGIME_ID`, and that constant is `"eu"`
(`:89`), justified as preserving pre-feature behaviour. The `global` row exists
and is not the fallback.

The consequence is documented in the repo itself, in the KNOWN GAP block of
`app/_components/AiDisclosure.tsx:24-44`: for a `us`/`uk`/`sg`/`in`/`ae`
workspace the first paint asserts "Assessed under EU equal-treatment
directives; …processed under GDPR", "which is simply the wrong law, and it is
the FINAL state whenever the fetch cannot resolve." The comment further records
that an earlier revision claimed there was never a flash of wrong content, and
corrects itself — the honesty is exemplary; the behaviour is still the
deviation. **The standard stays: coerce to the neutral row, not to a
jurisdiction.** The `global` row is already sitting there, and pointing
`DEFAULT_REGIME_ID` at it is a one-line change that turns a wrong assertion
into a true one.

## Deviation: no as-of date, and the date has moved

The catalog carries no as-of stamp or review cadence. The conformity pack does
carry dates (`ai-act-conformity.md`, "compiled 2026-07-27 … re-verified
2026-07-30") and pins `appliesFrom: "2 August 2026"` in
`app/_lib/trust-posture.ts` `CLASSIFICATION`. As of mid-2026 that date has been
superseded: the 2026 digital-omnibus package defers application of the Annex III
high-risk obligations to 2 December 2027. The pack's urgency framing ("that date
is now three days away") is therefore stale in a way a reader would act on —
exactly the failure the as-of-date-and-cadence rule exists to catch. The
correction is a data edit plus a new review date, not a code change.
