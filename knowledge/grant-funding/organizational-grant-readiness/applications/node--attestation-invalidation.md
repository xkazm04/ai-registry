---
layer: application
type: application
subject: organizational-grant-readiness
technique: attestation-invalidation
stack: node
status: forged
---

# Node: verification attestations bound to the EIN in Wellspring

Wellspring (repo `grant-writing-nonprofits`) persists its registry
verification as an attestation on the org profile itself, and invalidates
it in the write path when the identifier changes — the exact discipline
this technique names.

## The attestation shape

`src/features/org-profile/types.ts:32-40` carries the verification result
on `OrgProfileRecord`:

```ts
verifiedAt: string | null;         // ISO-8601 timestamp of the confirming check
verificationSource: string | null; // passing source keys (e.g. "irs-pub78,irs-bmf")
verificationDetail: string | null; // human-readable headline from the run
```

Not a boolean: it records *when* the check ran, *which* sources passed
(the comma-joined source keys allow a combined pass to name its parts —
the IRS Pub. 78 exempt list and the Business Master File are two facts,
not one), and the human-readable headline for the audit trail. The
comment above these fields states the motive: the onboarding "Verify"
control runs a real IRS/ARES lookup, and persisting the outcome makes it
"survive the save — powering a '✓ verified' badge, an eligibility signal,
and an audit trail instead of evaporating into client state."

## Invalidation in the write path

The same comment block declares the reset rule: all three fields are
"INVALIDATED (back to null) whenever the EIN changes, since the stored
attestation no longer describes the new identifier." The input shape
(`types.ts:99-104`) makes the carry-forward-or-invalidate branch the
storage layer's job — the optional `verifiedAt` / `verificationSource` /
`verificationDetail` on `OrgProfileInput` are absent when the user didn't
verify this save, and "the storage layer carries forward or invalidates
the stored value based on EIN change." No cleanup cron, no stale-flag
limbo: reset means null, applied atomically in the one place profile
writes flow through.

## The user-facing contract matches

The product FAQ (`src/app/faq/page.tsx:100-109`) tells applicants the same
model in prose: the EIN is checked live against the IRS
exempt-organization data and the record is bound "to your organization's
name so a verified badge can never vouch for the wrong entity". The same
passage carries the fiscal-sponsorship edge the golden path names: "If
you're fiscally sponsored, you put the sponsor's EIN on the submissions
and your program name on the cover" — identity fields belonging to
another legal entity, represented rather than fudged.

## Transferable reading

The pattern generalizes to every derived trust artifact in a readiness
system: bind the attested input values into the stored record, enumerate
the dependency fields, and reset in the write path when any of them
mutates. Wellspring's version binds implicitly (the EIN lives on the same
record and the storage layer compares on save); a stricter variant would
also store the checked identifier inside the attestation so consumers can
re-compare defensively — the technique's "the one consumer that skips the
comparison" rule.
