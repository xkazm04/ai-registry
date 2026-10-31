---
layer: application
type: application
subject: bulk-adverse-action-governance
technique: preview-then-approve-the-signed-set
stack: node
status: forged
verified_on: 2026-10-31
verified_against: node@24
applied: simulation
ab_verdict: better
---

# Preview / approve / commit in a server-side screening wave

A TypeScript applicant-tracking app realizes the technique as one server function with a
`dryRun` flag, one pure signature module, one import-free wire contract shared with the
client, and one route that maps every approval refusal to a coded `409`. Every citation
below is pinned to a single commit of that app, read on 2026-09-26.

## The token

`app/_lib/screen-wave-approval.ts:31` — `screenWaveApprovalToken(jobId, policyVersion,
rejectIds, issuedAt = Date.now())`. It trims, filters empties, **sorts**, joins with
commas, and takes the first 32 hex characters of a SHA-256 over
`` `${jobId}|${policyVersion}|${issued}|${canonical}` ``, returned as
`<issuedAtEpochMs>.<hash>` (`:37-44`). The sort is what makes the reject-set half
order-independent; folding the issue time into both the cleartext prefix and the hash is
what lets the server age-check a token the client echoes back while making that
timestamp tamper-evident (it cannot be back-dated without invalidating the signature).
The module needs only `node:crypto` plus the import-free contract
(`screen-wave-contract.ts`, `:2`), so it unit-tests without dragging in the database that
`screen-wave.ts` imports, and so the client never recomputes it: the modal reads the
token out of the dry-run response.

A commit calls `verifyScreenWaveApprovalToken` (`:121-135`), which re-derives the
signature at the token's own `issuedAt` and additionally refuses one older than
`SCREEN_WAVE_APPROVAL_MAX_AGE_MS`, 15 minutes (`:25`), chosen as "long enough to read a
long preview list, be interrupted, and still commit the set that was on screen; short
enough that nothing meaningful … can land inside the window unnoticed" (`:18-24`). A
token issued in the future is `malformed`, so clock skew cannot extend the window
(`:132`).

A verified token is then **spent**: `consumeScreenWaveApprovalToken` (`:93-101`) records
it in an in-process `Map` (`:81`) keyed by the token and holding the token's own expiry
(`issuedAt + MAX_AGE`), so the ledger prunes itself. A second commit with the same token
is refused `spent`. The comment at `:57-80` states why the fresh-and-matching check was
not enough: the token is a pure function of (job, policy, set, issuedAt), so a re-POST
inside the window re-derives the same signature, and the only thing that used to stop a
second commit was the first one having emptied the cohort. It also states the limit: a
multi-process deployment has one ledger per worker, a weaker guarantee than a
`consumed_at` column.

`policyVersion` is where the "sign the policy, not only the members" rule lives. The base
string is built at `app/_lib/screen-wave.ts:225` and the final one at `:269`:

```
screen-wave/bottom{rejectBottomPercent}/maxMatch{maxMatchToReject}{familyFloorSuffix}{/holdout<pct>}{/spared<n>}
```

`familyFloorSuffix` (`screen-wave.ts:110-116`) sorts the family keys and renders
`/fam:legal=60,software=55`, returning `""` when there are no overrides; the holdout
segment is omitted at `0`; `spareSuffix` (`screen-wave-spare.ts:53-55`) adds
`/spared<n>` only when the reviewer excluded someone. All three omissions are deliberate:
a wave with no family floors, no holdout and no exclusions signs a **byte-identical**
token to the build before those features existed, so shipping them did not invalidate
stored approvals, while changing a family floor forces a fresh preview even when the
reject set is unchanged.

## The single predicate

`screen-wave.ts:226-237` builds `wouldReject` once (bottom-slice membership, effective
floor, fairness shield), and the commit loop at `:454` reads membership from that same
set rather than re-evaluating the condition. Three removals follow, in a fixed order and
all *before* `screenWaveApprovalToken` is called at `:275`: the reinstatement shield
(`:256-257`), the holdout draw (`:258-259`), and last the reviewer's own exclusions
(`:267-268`). So the signed set is the post-spare set the recruiter actually sees.

## Reviewer exclusions

The preview renders a Spare / Undo control on each would-reject row
(`app/features/hiring/decisions/DecisionsScreenWaveLists.tsx:94-109`), so the reviewer
can disagree about one person without moving the sliders that reshape everyone else.
The request carries `spare`, a list of entry ids that the route normalizes at the trust
boundary (`app/api/decisions/screen-wave/route.ts:68-69`): trimmed, blanks dropped,
de-duplicated, sorted, capped at `SPARE_MAX = 500` (`screen-wave-spare.ts:23`, `:30-41`).
A malformed or oversized list is a `400`, never a silently shortened one. `runScreenWave`
re-checks it as a backstop (`screen-wave.ts:152-153`).

`effectiveSpare` (`screen-wave-spare.ts:45-48`) keeps only ids that would really be
rejected, so sparing a shielded, held-out, reinstated or above-cutoff person is a no-op
that leaves the token unchanged. A commit must echo the list its preview was computed
with: a different list re-derives a different set and is refused `mismatch`. Each spared
row is a keep with reason code `recruiterSpared`; on commit it gets one
`screen_wave_recruiter_spared` event naming the approver as a human actor
(`screen-wave.ts:431-448`), and no seal, because nothing adverse happened to that person.

## The gate

`screen-wave.ts:276-329`. On `dryRun: false`, each refusal throws
`ScreenWaveApprovalError` with a typed `reason` (`screen-wave-approval.ts:147-156`):

- no `opts.approval` → `"Human review and approval are required before committing an
  automated rejection wave…"`, reason `required` (`screen-wave.ts:277-282`);
- a token that fails `verifyScreenWaveApprovalToken` → `"This approval has expired — a
  review has to be recent to stand…"` with reason `expired`, or `"The candidate set changed
  since it was previewed…"` with reason `mismatch` for both `malformed` and `mismatch`
  (`:283-291`);
- an approval whose `approvedBy` is not a **named** person (`isNamedApprover`,
  `auth/operator-approver.ts:36-39`) → `NAMED_APPROVER_REQUIRED`, reason `unattributed`
  (`screen-wave.ts:311`), so a commit cannot seal to the posture placeholder;
- a token already spent → `"This approval has already been committed — an approved review
  authorizes one wave, not a window of them…"`, reason `spent` (`:324-329`).

The spend is deliberately **last** (`:321-323`): a commit refused for a missing approver,
a stale token or a changed set leaves the review unspent, so a fixable refusal does not
cost a re-preview.

The five reasons are a closed list in the import-free contract
(`screen-wave-contract.ts:185`). The route only constructs an `approval` object when a
token was actually supplied (`route.ts:103-109`), and `approvedBy` is not client input
at all: it is `await resolveApprover()` (`:108`), derived server-side, and any
`body.approvedBy` is ignored. Each refusal becomes
`jsonRefusal(SCREEN_WAVE_APPROVAL_CODES[error.reason], 409, { reason: error.reason })`
(`:116-125`), with codes `SCREEN_WAVE_APPROVAL_REQUIRED`, `_EXPIRED`, `_MISMATCH`,
`_SPENT` and `_UNATTRIBUTED` (`screen-wave-refusal-codes.ts:7-13`); the English message stays off the wire. The
client reads the reason with `readWaveRefusal` (`screen-wave-contract.ts:196-200`) and
acts on it through `REFUSAL_EFFECT`
(`app/features/hiring/decisions/decisionsScreenWaveMachine.ts:29-35`): `required`,
`expired` and `mismatch` re-preview; `spent` re-previews and reloads the queue because
the wave did land; `unattributed` disables Commit for the modal's life, because no
re-preview can name an approver.

The check sits **inside** `runScreenWave`, at the same boundary as the override
validation (`screen-wave.ts:142-149`, "enforcing the schema HERE — at the actual
destructive operation"), so no other caller can reach the write path without it. The
route in front of it also asks the seat for `pipeline:write` (`route.ts:42`) and
throttles preview and commit together at 60 requests per 10 minutes per IP
(`:24`, `:77-78`).

## What the commit writes, and in what order

For each member of the signed set (`screen-wave.ts:454-635`), the commit:

1. **Re-reads the live row** (drift pre-check, `:490-525`). The cohort is a snapshot and
   the loop awaits a notification dispatch per rejection, so a recruiter may have moved or
   rejected the candidate by hand in the meantime. If the row is gone, no longer
   `active`, or on a different stage, it is kept as `staleSkipped` and **nothing is
   sealed**.
2. **Seals the decision record before anything irreversible** (`:526-572`). No seal, no
   rejection: a failed seal keeps the candidate (`sealFailed`) and counts it in
   `sealFailures`. The record carries the same `policyVersion` the token signed
   (`:551`); the candidate's effective floor rides the sealed inputs as `threshold`
   (`:472-480`, `:562`), next to `approvedBy` and the score-staleness flag.
3. **Flips the status** with a stage compare-and-swap and actor `"system"` (`:583`).
4. **Queues the rejection notice** (`:608-622`).

The ordering leaves exactly one residue, named in the comment at `:586-593`: a row that
drifts in the single synchronous gap between the re-read and the compare-and-swap gets a
sealed `auto_rejected` record for a rejection that did not apply. That is accepted as the
better trade against an applied, emailed rejection with no record.

## What the preview carries

The returned `ScreenDecision[]` covers the whole stage cohort, not just the rejects
(`screen-wave.ts:663-666`). Keeps carry a `keepReason` from a closed vocabulary
(`screen-wave.ts:77-105`): `auto-reject off`, `early-career — never auto-rejected`,
`unknown archetype — shielded (fail-closed)`, `reinstated — a recruiter reversed an
earlier auto-rejection; not re-rejected automatically`, `tie at cutoff — kept so equal
scores aren't split`, `above the bottom cutoff`, `match at/above threshold`. Holdout,
reviewer-spared, drift-skipped and seal-failed keeps carry their own rationale strings
(`:364`, `:390`, `:433`, `:512`, `:566`). Unscored entries are appended at `:651-662` as
explicit `"unscored"` keeps with `matchScore: null`, so the reviewer sees the people who
need scoring instead of finding them ranked at the bottom as fabricated zeroes
(`screen-wave.ts:180-187`). `reasonCode`/`reasonParams` mirror the English rationale for
localized rendering while the persisted audit string stays English; the full code set is
the closed list at `screen-wave-contract.ts:22-48`.

Per-row disclosures ride the same payload: `stale`/`staleSince` when a score predates the
role description's last edit (`screen-wave.ts:165-179`, rendered as a chip in
`DecisionsScreenWaveLists.tsx:47-55`), and the effective family floor when it differs
from the globally displayed one (`decisionsFloorDisclosure.ts:34-55`,
`DecisionsScreenWaveLists.tsx:60-72`).

## Deviations from the standard

- **Grouping by reason is per-list, not per-reason.** The modal renders a reject list and
  a keep list with per-row reason text (`DecisionsScreenWaveLists.tsx:114-164`); the
  standard's per-reason grouping, which is what makes a hundred-row wave reviewable and
  makes a swollen reason bucket visible, is not built. A keep classifier exists
  (`waveKeepKind`, `decisionsFloorDisclosure.ts:78-83`), but nothing outside its tests
  uses it.
- **A spare does not carry into the next wave.** A spared person stays active at
  Screened, and only a `reinstated` event shields someone from a later run
  (`screen-wave.ts:256`). The next wave on the same rule selects them again, and the
  reviewer has to spare them again.
- **The spent ledger is per process.** Single use holds within one server process only
  (`screen-wave-approval.ts:76-80`). A replay routed to a second worker is not caught.

## Since first documented

### 2026-08-30 re-verification

This application's other two original deviations had been closed in the tree by then:

- **A staleness window exists.** `SCREEN_WAVE_APPROVAL_MAX_AGE_MS` (15 minutes,
  `screen-wave-approval.ts:25`) landed in `fix(craft-scan)` (2026-08-21, commit
  `62fbf833`): a token that still matches the live set is refused as `"expired"` once it
  is older than 15 minutes.
- **`approvedBy` can no longer default to the posture placeholder on a commit.**
  `isNamedApprover` (`auth/operator-approver.ts:36-39`) specifically rejects
  `"operator (single-operator deployment)"`; `runScreenWave` throws
  `NAMED_APPROVER_REQUIRED` rather than seal an unattributed commit, landed in
  `fix(decisions)` (2026-08-28, commit `92b5add7`). The route also stopped taking
  `approvedBy` from the client: it is resolved server-side from the signed-in session
  (`resolveApprover()`, `route.ts:108`), so a caller cannot attribute the review to an
  arbitrary name.

### 2026-09-26 re-verification

- **Tokens are single use.** `fix(decisions)` (2026-09-04, commit `81a35926d`) added the
  spend ledger and the `spent` refusal described under *The token* and *The gate*.
- **The sealed record carries the signed policy.** The same commit (2026-09-04,
  `81a35926d`) made every `auto_rejected` seal use the token's `policyVersion`
  (`screen-wave.ts:551`) and moved the per-candidate floor into `inputs.threshold`, so a
  record joins back to the approval that authorized it and to the holdout seals of the
  same wave.
- **Refusals are typed and coded.** The `reason` field arrived with `81a35926d`
  (2026-09-04); `fix(hiring-decisions-api)` (2026-09-17, commit `d616db1ab`) replaced the
  English 409 body with the `SCREEN_WAVE_APPROVAL_*` codes; `refactor` (2026-09-23,
  commit `f02e7a3ad`) moved the reason list and the decision shapes into the import-free
  `screen-wave-contract.ts`; `feat` (2026-09-23, commit `6d12c9814`) made the client
  branch on the reason through `REFUSAL_EFFECT`.
- **Per-person exclusions are signed into the approval.** `feat` (2026-09-23, commit
  `bef78eaa3`) added the Spare control, the `spare` request field, the `recruiterSpared`
  keep and the `/spared<n>` policy suffix. This closes the technique's "removal
  re-derives the token" step, which had no counterpart before.
- **The route is gated and throttled.** `pipeline:write` (2026-09-03, commit
  `feacfd5b7`) and the per-IP limit (2026-09-03, commit `23ea143ba`).

### 2026-10-31 re-verification

Re-checked 2026-10-31 at kp@6edf5d7e6. The token, the gate, the spend and the spare
modules are unchanged; anchors in `screen-wave.ts` and the route moved and are updated
above. Two changes in the tree:

- **The commit now has a fifth step.** `fix(ats)` (2026-10-06, commit `e00ada3cb`) mirrors
  each applied rejection to a subscribed ATS as `candidate.rejected`
  (`screen-wave.ts:623-631`), after the seal and the status flip and fire-and-forget beside
  the notice, so a holdout, spared, seal-failed or drift-skipped entry mirrors nothing. The
  seal-before-anything-irreversible order is kept.
- **The refusal codes moved out of the route.** `SCREEN_WAVE_APPROVAL_CODES` now lives in
  `app/_lib/screen-wave-refusal-codes.ts`, shared with the role-run gate commit route
  (`app/api/role-runs/[id]/gate/commit/route.ts`, `5bbcbdfc7`), so a refusal reads the
  same on both doors. That second door was not re-read for this application.

Neither change touches the verdict. The three deviations above still hold.

### Corrected on re-verification

- **The drift pre-check and seal-before-reject ordering were already in the tree on
  2026-08-30** (landed 2026-08-21 in commits `f9730d3c` and `62fbf833`) but the earlier
  text did not describe them. They are now under *What the commit writes, and in what
  order*.
- **The earlier text said the approval signs the policy, and left it there.** On
  2026-08-30 the `auto_rejected` seal did not carry the signed string: it rebuilt a
  shorter `screen-wave/bottom<pct>/maxMatch<effective floor>` that dropped the family
  and holdout segments. A sealed rejection could not be matched to the approval that
  authorized it until `81a35926d`.
- **The keep vocabulary listed six strings.** The same function already returned a
  seventh, the `reinstated — …` keep, on 2026-08-30.
