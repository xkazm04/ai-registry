---
layer: application
type: application
subject: eligibility-analysis
technique: applicant-type-code-mapping
stack: node
status: forged
verified_on: 2026-08-19
---

# Node: applicant-type code mapping across two eligibility regimes

The grant-writing-nonprofits repo normalizes "who can apply" in
`src/features/grant-ingest/applicant-types.ts` and consumes it through the
jurisdiction model in `src/features/jurisdictions/us.ts` and the eligibility
gate in `src/features/match-engine/eligibility.ts`.

## The canonical vocabulary and the code table

`applicant-types.ts:13-32` defines the eight-type canonical set (`nonprofit`,
`government`, `education`, `small-business`, `for-profit`, `individual`,
`tribal`, `any`). `CODE_TO_TYPE` (`:50-68`) maps grants.gov's numeric
applicant-eligibility codes onto it — `"00"`–`"04"` government, `"05"/"06"/"20"`
education, `"07"/"11"` tribal, `"12"/"13"` nonprofit, `"21"` individuals,
`"22"/"23"` for-profit/small-business, `"25"/"99"` → `any`. The mapper
(`mapApplicantCodesToTypes`, `:73-84`) zero-pads before lookup
(`padStart(2, "0")`, so `"5"` and `"05"` hit the same row) and silently
ignores unknown codes, with a guard comment naming the real hazard: grants.gov
search2's `alnist` field (ALN/CFDA numbers) is code-shaped and *"must NOT be
passed here"*.

## Free-text fallback with non-English legal-form vocabulary

`TEXT_RULES` (`:89-98`) parse prose eligibility descriptions
(grants.gov's `applicantEligibilityDesc`, CZ call prose) with
order-independent, additive keyword rules — and the patterns embed the Czech
legal-form and municipal vocabulary alongside English (`spolek|spolky|nno` →
nonprofit, `škol` → education, `obce|obec` → government), because a
legal-form regime's prose names forms, not categories.
`parseApplicantTypesFromText` (`:102-111`) returns `[]` when nothing matches
— the field stays unset rather than guessed, per the honest-null law.

## The applicant side: entity type → code set, with open codes appended

`us.ts:42-54` gives every entity type its own applicant-code set — a school
district applies under `["05","25","99"]`, a municipality under
`["00","01","02","04","25","99"]`, a university under `["06","20","25","99"]`
— with `"25"` (Others) and `"99"` (Unrestricted) appended to every type so
open opportunities pass for everyone. The comment states the product point:
segments beyond nonprofits are *"first-class here so the largest market stops
bouncing them."* Note `501c6` at `us.ts:45`: `grantEligible: false` — a
recognized legal form that is modeled, labeled, and still gated out.

## The gate branches by regime, not by opportunity

`eligibility.ts:42-81` intersects the grant's codes with
`eligibleCodesFor(jurisdiction, profile.entityType)`; an empty code list on
the grant yields `unknown` (*"The grant doesn't list applicant-eligibility
codes"*), never fail. The regime branch is one line (`eligibility.ts:50`):
when the jurisdiction's `applicantEligibility.eligibleCodes` is empty — the
CZ legal-form regime, where funders publish no applicant codes — the check
delegates to `entityTypeCheck` (`:83-113`), which looks up the org's legal
form in the jurisdiction's `entityTypes` table and returns unknown for both
an undeclared and an unrecognized form, fail only for a recognized,
grant-ineligible one.
