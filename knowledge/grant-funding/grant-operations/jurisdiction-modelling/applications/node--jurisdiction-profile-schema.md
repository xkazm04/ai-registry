---
layer: application
type: application
subject: jurisdiction-modelling
technique: jurisdiction-profile-schema
stack: node
status: forged
verified_on: 2026-08-19
---

# Node: the JurisdictionProfile schema in a grant-writing product

The grant-writing-nonprofits repo realizes the profile schema as a pure
TypeScript module family under `src/features/jurisdictions/`, one file per
market plus a shared type and registry.

## The schema

`src/features/jurisdictions/types.ts:1-82` declares the whole ownership
surface in one interface. The header comment states the doctrine verbatim:
"grant eligibility IS legislation, so every jurisdiction-bound rule (entity
types, identifiers, verification sources, grant adapters, required docs,
localization) is owned by a JurisdictionProfile rather than hard-coded …
added markets (CZ, GB) plus future ones (EU, …) become added profiles, not
rewrites. Pure data + lookups — no I/O, fully unit-testable."

Field-for-field it matches the technique's inventory: `JurisdictionLevel`
(`"supranational" | "country" | "region" | "locality"`, types.ts:13-17, with
a comment defining supranational as "a funding body a nonprofit can apply
THROUGH but cannot be incorporated IN"); `EntityType` with `grantEligible`
and optional `applicantCodes` (types.ts:19-30); `OrgIdentifier` whose
`pattern` is explicitly a "Regex SOURCE for light validation (compiled by
the caller, not stored as RegExp)" (types.ts:36-37); `VerificationSource`
with a `verifies` attestation sentence; `grantSourceKeys`, `requiredDocKeys`,
`applicantEligibility`, `Localization` (ISO 4217 + BCP 47), and `memberOf`
plus `supported` on the profile itself (types.ts:60-82).

## Reference profile vs contrast profiles

`us.ts:10-72` is the founding-market profile: the grants.gov applicant-code
table (`US_APPLICANT_CODE_LABELS`, codes "00"–"99"), eleven entity types
each carrying the codes it may apply under (a school district gets
`["05","25","99"]`, a municipality `["00","01","02","04","25","99"]` —
us.ts:42-54), the EIN identifier with pattern `^\d{2}-?\d{7}$`, a
four-source verification stack (charity publication, master file, federal
award registration, sanctions list), and doc keys
`["990","501c3","budget","audit","board"]`. Its header records the
excavate-then-abstract procedure: "The values mirror the currently
hard-coded US assumptions across the app … Phase B makes THIS the single
source of truth and removes those scattered copies."

`cz.ts:19-96` proves the abstraction by differing on every axis the schema
allows: empty `applicantEligibility` (legal-form regime), an 8-digit
national identifier with a modulo-11 check digit (validated by `isValidIco`,
registry.ts:354-365, before any registry call), a real public registry API
as verification source, a `memberOf: ["eu"]` membership, and doc keys — 
`bezdluznost` (the multi-agency clean-debt certificate), `stanovy`,
`vypis-rejstrik` — that the founding market's model would never produce.
`jp.ts:23-44` adds the coarse-registry case (legal form inferred from the
corporate name prefix) and a market where for-profits ARE grant-eligible.

## The single accessor and shape-derived predicates

`registry.ts:48-74` shows consumers branching on profile shape, not on
jurisdiction id: `usesEntityTypeEligibility(jur)` returns true when
`eligibleCodes.length === 0 && entityTypes.length > 0`, and its comment
names why it is shared: "Shared by the onboarding form (client) and the
org-profile parser (server) so the 'collect a legal form' rule can't drift
between the two. Client-safe (pure)." `eligibleCodesFor(jur, entityType)`
resolves an org's applicant codes from its declared entity type, falling
back to the jurisdiction default so legacy orgs "behave exactly as before
(the nonprofit default)".

## Deviations worth naming

The schema is honest about its partial migrations: `us.ts` still documents
scattered copies pending removal ("Phase B"), and the EU profile's
verification source is "declared-but-unbuilt". Both are recorded in-file
rather than hidden — the profile stays the map of what is true, including
what is not yet wired.
