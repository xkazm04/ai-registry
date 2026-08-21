---
layer: application
type: application
subject: bulk-adverse-action-governance
technique: preview-then-approve-the-signed-set
stack: node
status: forged
verified_on: 2026-08-20
---

# Preview / approve / commit in a server-side screening wave

A TypeScript applicant-tracking app realizes the technique as one server function with a
`dryRun` flag, one pure signature module, and one route that maps a mismatch to `409`.

## The token

`app/_lib/screen-wave-approval.ts:16` — `screenWaveApprovalToken(jobId, policyVersion,
rejectIds)`. It trims, filters empties, **sorts**, joins with commas, and takes the first
32 hex characters of a SHA-256 over `` `${jobId}|${policyVersion}|${canonical}` ``. The
sort is what makes it order-independent; the module is deliberately dependency-free
(`node:crypto` only) so it unit-tests without dragging in the database that
`screen-wave.ts` imports, and so the client never recomputes it — the modal reads the
token out of the dry-run response (`screen-wave-approval.ts:11-13`).

`policyVersion` is where the "sign the policy, not only the members" rule lives
(`app/_lib/screen-wave.ts:249`):

```
screen-wave/bottom{rejectBottomPercent}/maxMatch{maxMatchToReject}{familyFloorSuffix}{holdout}
```

`familyFloorSuffix` (`screen-wave.ts:132-141`) sorts the family keys and renders
`/fam:legal=60,software=55`, returning `""` when there are no overrides; the holdout
segment is omitted at `0`. Both omissions are deliberate: a wave with no family floors and
no holdout signs a **byte-identical** token to the build before those features existed, so
shipping them did not invalidate stored approvals — while changing a family floor forces a
fresh preview even when the reject set is unchanged.

## The single predicate

`screen-wave.ts:255-271` builds `wouldReject` once — bottom-slice membership, effective
floor, fairness shield — and the commit loop at `:352` reads membership from that same set
rather than re-evaluating the condition. The holdout is subtracted at `:276`, *before*
`screenWaveApprovalToken` is called at `:278`, so the signed set is the post-holdout set
the recruiter actually sees.

## The gate

`screen-wave.ts:279-290`. On `dryRun: false`:

- no `opts.approval` → `ScreenWaveApprovalError("Human review and approval are required
  before committing an automated rejection wave…")`;
- token present but `!== approvalToken` → `ScreenWaveApprovalError("The candidate set
  changed since it was previewed — re-preview and approve the current set before
  committing.")`.

Two distinct messages on purpose. `app/api/decisions/screen-wave/route.ts:47-70` only
constructs an `approval` object when a token was actually supplied, precisely so "you
never approved" and "your approval is stale" do not collapse into one string; both map to
`409` at `:78`, which the client handles by re-previewing.

The check sits **inside** `runScreenWave`, at the same boundary as the override validation
(`screen-wave.ts:186-188`, "enforcing the schema HERE — at the actual destructive
operation"), so no other caller can reach the write path without it.

## What the preview carries

The returned `ScreenDecision[]` covers the whole stage cohort, not just the rejects
(`screen-wave.ts:466-468`): keeps carry a `keepReason` from a closed vocabulary
(`screen-wave.ts:112`) — `auto-reject off`, `early-career — never auto-rejected`,
`unknown archetype — shielded (fail-closed)`, `tie at cutoff — kept so equal scores
aren't split`, `above the bottom cutoff`, `match at/above threshold` — and unscored
entries are appended at `:452` as explicit `"unscored"` keeps with `matchScore: null`, so
the reviewer sees the people who need scoring instead of finding them ranked at the bottom
as fabricated zeroes (`screen-wave.ts:209-216`). `reasonCode`/`reasonParams` mirror the
English rationale for localized rendering while the persisted audit string stays English.

Per-row disclosures ride the same payload: `stale`/`staleSince` when a score predates the
role description's last edit (`screen-wave.ts:196-204`, rendered as a chip in
`DecisionsScreenWaveLists.tsx:30-38`), and the effective family floor when it differs from
the globally displayed one (`decisionsFloorDisclosure.ts:36-55`,
`DecisionsScreenWaveLists.tsx:39-55`).

## Deviations from the standard

- **No staleness window on the approval.** A token that still matches is accepted no
  matter how old it is; the standard requires refusal on age alone.
- **`approvedBy` falls back to a configured operator identity** when the caller supplies
  none (`screen-wave.ts:291`), so the sealed "approved by" can name a default rather than
  the individual who clicked.
- **Grouping by reason is per-list, not per-reason.** The modal renders a reject list and
  a keep list with per-row reason text; the standard's per-reason grouping — which is what
  makes a hundred-row wave reviewable and makes a swollen reason bucket visible — is not
  built.
