---
layer: application
type: application
subject: submission-filing
technique: crowd-verified-filing-profiles
stack: node
status: forged
verified_on: 2026-08-19
---

# Node — crowd-verified filing profiles in a grant-writing pipeline

How the `grant-writing-nonprofits` repo (a Next.js/Node grant pipeline for
nonprofits) realizes capture → aggregate → confidence-gate, entirely in pure
Node modules under `src/features/submissions/`.

## Capture rides the notes column (v1, no migration)

`src/features/submissions/filing-profile.ts:17-28` defines the contribution
shape — `portalUrl`, `requiredDocs` ("the docs the funder ACTUALLY demanded"),
`minutes`, plus the proof-of-filing fields `confirmationNumber` / `receiptRef`
— and stores it as a tagged JSON suffix (`[wellspring-filing]{...}`) appended
to the existing `notes` column (`encodeFilingNotes`, lines 67-96). The human
note stays first and readable; the aggregator recovers the payload with
`parseFilingNotes` (lines 100-112), returning `null` for untagged legacy
notes. This is the "pragmatic storage note" from the technique made concrete:
zero schema migration, with a v2 promotion to first-class columns tracked as
follow-up (file header, lines 9-13).

Write-boundary sanitation happens inside `encodeFilingNotes`: `safeHttpUrl`
(lines 52-62) admits only `http:`/`https:` URLs, strings are trimmed via
`clean`, minutes must be finite and positive and are rounded. The same
`safeHttpUrl` runs again at every read — in `aggregateFilingProfiles`
(line 168), in `proofOfFiling` (line 238), and once more in
`how-to-file.ts:94` before a crowd URL becomes an `href`, with the comment
spelling out why: "values predate the write-time guard in the shared notes
column." Both boundaries, exactly as the technique demands.

## Aggregation is a pure function over filed rows

`aggregateFilingProfiles` (`filing-profile.ts:153-205`) folds submissions
into one `FunderFilingProfile` per funder. Only rows whose status is in
`FILED_STATUSES` (`filed_manually` / `filed_auto`, lines 144-147) and that
carry a parseable contribution count toward the sample. Per funder:

- portal URL = most-reported value, first-seen tie-break (`topValue`,
  lines 130-142);
- `requiredDocs` = strict-majority consensus (`n > docLists.length / 2`,
  lines 183-193 — see the majority-rule-doc-consensus technique);
- `medianMinutes` = median, not mean (lines 120-127);
- `sampleSize` travels on the profile itself (provenance).

## Confidence gates every consumer

`confidenceFor` (lines 114-118) maps sample size to a tier: ≥5 high, ≥2
medium, else low. The consumer side enforces "low overrides nothing":
`how-to-file.ts:81-83` (`isTrusted`) treats any low-confidence profile as
absent, so `preferredPortalUrl` (lines 87-98) falls back to the
deterministic grants.gov URL derivation, and `preferredRequiredDocs`
(lines 108-119) falls back to the generic `REQUIRED_DOCUMENTS` checklist with
its honesty caption ("Typical materials — confirm the exact list against the
funder's RFP", lines 54-55). When the crowd list *is* trusted, the caption
switches to name its ground: "Reported by N orgs who filed with this funder"
(line 114) — the claim and its provenance rendered together, and the
`source: "crowd" | "generic"` discriminator (line 103) travels with the
guidance object so no surface can mix them up.

## The upstream deviation worth knowing

The capture moment is the pipeline's one-way "Mark submitted" transition
(`src/app/drafts/[grantId]/StatusTransitions.tsx:17-41`): submit is
irreversible ("only an outcome follows"), guarded by a confirm, with the only
safe reversal being reactivating an *abandoned* draft (lines 43-62) — which
recorded no submission signal and so corrupts no metric. One gap against the
standard: the repo counts contributions per filing, not per org, so a single
org filing repeatedly can reach "high" confidence alone — the technique's
per-org preference for small samples is the upward standard the v2 promotion
should adopt.
