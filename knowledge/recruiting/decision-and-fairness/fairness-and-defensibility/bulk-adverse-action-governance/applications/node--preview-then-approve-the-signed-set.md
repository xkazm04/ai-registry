---
layer: application
type: application
subject: bulk-adverse-action-governance
technique: preview-then-approve-the-signed-set
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@24
---

# Preview / approve / commit in a server-side screening wave

A TypeScript applicant-tracking app realizes the technique as one server function with a
`dryRun` flag, one pure signature module, and one route that maps a mismatch to `409`.

## The token

`app/_lib/screen-wave-approval.ts:30` — `screenWaveApprovalToken(jobId, policyVersion,
rejectIds, issuedAt = Date.now())`. It trims, filters empties, **sorts**, joins with
commas, and takes the first 32 hex characters of a SHA-256 over
`` `${jobId}|${policyVersion}|${issued}|${canonical}` ``, returned as
`<issuedAtEpochMs>.<hash>` (`:41-44`). The sort is what makes the reject-set half
order-independent; folding the issue time into both the cleartext prefix and the hash is
what lets the server age-check a token the client echoes back while making that
timestamp tamper-evident (it cannot be back-dated without invalidating the signature).
The module is deliberately dependency-free (`node:crypto` only) so it unit-tests without
dragging in the database that `screen-wave.ts` imports, and so the client never
recomputes it — the modal reads the token out of the dry-run response.

A commit calls `verifyScreenWaveApprovalToken` (`:61-75`), which re-derives the
signature at the token's own `issuedAt` and additionally refuses one older than
`SCREEN_WAVE_APPROVAL_MAX_AGE_MS` — 15 minutes (`:24`), chosen as "long enough to read a
long preview list, be interrupted, and still commit the set that was on screen; short
enough that nothing meaningful … can land inside the window unnoticed." This closes the
staleness gap this application originally documented as unaddressed (see *Since first
documented* below).

`policyVersion` is where the "sign the policy, not only the members" rule lives
(`app/_lib/screen-wave.ts:279`):

```
screen-wave/bottom{rejectBottomPercent}/maxMatch{maxMatchToReject}{familyFloorSuffix}{holdout}
```

`familyFloorSuffix` (`screen-wave.ts:154-160`) sorts the family keys and renders
`/fam:legal=60,software=55`, returning `""` when there are no overrides; the holdout
segment is omitted at `0`. Both omissions are deliberate: a wave with no family floors and
no holdout signs a **byte-identical** token to the build before those features existed, so
shipping them did not invalidate stored approvals — while changing a family floor forces a
fresh preview even when the reject set is unchanged.

## The single predicate

`screen-wave.ts:280-291` builds `wouldReject` once — bottom-slice membership, effective
floor, fairness shield — and the commit loop at `:416` reads membership from that same set
rather than re-evaluating the condition. The holdout is subtracted at `:312-313`, *before*
`screenWaveApprovalToken` is called at `:319`, so the signed set is the post-holdout set
the recruiter actually sees.

## The gate

`screen-wave.ts:320-353`. On `dryRun: false`:

- no `opts.approval` → `ScreenWaveApprovalError("Human review and approval are required
  before committing an automated rejection wave…")`;
- a token that fails `verifyScreenWaveApprovalToken` (`screen-wave-approval.ts:61-75`) —
  malformed, no longer matching the live set, or older than
  `SCREEN_WAVE_APPROVAL_MAX_AGE_MS` — → `ScreenWaveApprovalError`, with the message
  branching on the reason: `"This approval has expired — a review has to be recent to
  stand…"` for `expired`, the original `"The candidate set changed since it was
  previewed…"` for `malformed`/`mismatch`;
- an approval whose `approvedBy` is not a **named** person (`isNamedApprover`,
  `auth/operator-approver.ts:36-39`) → `ScreenWaveApprovalError(NAMED_APPROVER_REQUIRED)`
  (`screen-wave.ts:353`) — a commit can no longer seal to the posture placeholder.

Three distinct messages now, not two — a staleness window and a named-approver
requirement both landed after this application was first documented (see *Since first
documented* below). `app/api/decisions/screen-wave/route.ts:67-73` only constructs an
`approval` object when a token was actually supplied; the `approvedBy` half of it is no
longer client input at all — the route derives it server-side via `resolveApprover()`
(`:52-73`) and ignores any `body.approvedBy`. Every `ScreenWaveApprovalError` maps to
`409` at `:79-81`, which the client handles by re-previewing.

The check sits **inside** `runScreenWave`, at the same boundary as the override validation
(`screen-wave.ts:204-211`, "enforcing the schema HERE — at the actual destructive
operation"), so no other caller can reach the write path without it.

## What the preview carries

The returned `ScreenDecision[]` covers the whole stage cohort, not just the rejects
(`screen-wave.ts:596-599`): keeps carry a `keepReason` from a closed vocabulary
(`screen-wave.ts:121-149`) — `auto-reject off`, `early-career — never auto-rejected`,
`unknown archetype — shielded (fail-closed)`, `tie at cutoff — kept so equal scores
aren't split`, `above the bottom cutoff`, `match at/above threshold` — and unscored
entries are appended at `:584-595` as explicit `"unscored"` keeps with `matchScore: null`,
so the reviewer sees the people who need scoring instead of finding them ranked at the
bottom as fabricated zeroes (`screen-wave.ts:234-241`). `reasonCode`/`reasonParams` mirror
the English rationale for localized rendering while the persisted audit string stays
English.

Per-row disclosures ride the same payload: `stale`/`staleSince` when a score predates the
role description's last edit (`screen-wave.ts:219-233`, rendered as a chip in
`DecisionsScreenWaveLists.tsx:34-42`), and the effective family floor when it differs from
the globally displayed one (`decisionsFloorDisclosure.ts:34-55`,
`DecisionsScreenWaveLists.tsx:47-59`).

## Deviations from the standard

- **Grouping by reason is per-list, not per-reason.** The modal renders a reject list and
  a keep list with per-row reason text; the standard's per-reason grouping — which is what
  makes a hundred-row wave reviewable and makes a swollen reason bucket visible — is not
  built.

## Since first documented (2026-08-30 re-verification)

This application's other two original deviations have since been closed in the tree —
worth recording rather than silently dropping:

- **A staleness window now exists.** `SCREEN_WAVE_APPROVAL_MAX_AGE_MS` (15 minutes,
  `screen-wave-approval.ts:24`) landed in `fix(craft-scan)` (2026-08-21, commit
  `62fbf833`): a token that still matches the live set is now refused as `"expired"` once
  it is older than 15 minutes.
- **`approvedBy` can no longer default to the posture placeholder on a commit.**
  `isNamedApprover` (`auth/operator-approver.ts:36-39`) specifically rejects
  `"operator (single-operator deployment)"`; `runScreenWave` now throws
  `NAMED_APPROVER_REQUIRED` rather than seal an unattributed commit, landed in
  `fix(decisions)` (2026-08-28, commit `92b5add7`). The route also stopped taking
  `approvedBy` from the client at all — it is resolved server-side from the signed-in
  session (`resolveApprover()`, `route.ts:52-73`), so a caller can no longer attribute the
  review to an arbitrary name.
