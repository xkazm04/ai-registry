---
layer: application
type: application
subject: selection-score-calibration
technique: deterministic-holdout-clean-arm
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
applied: simulation
ab_verdict: better
---

# The screening-wave calibration holdout (Node/TypeScript)

Read against kp at `006bf7a0a`; the first version of this note (2026-08-20) cited lines
that have since moved by 10 to 230 lines, and one of its structural claims has changed
(see "The arm is the sealed record" below).

The clean arm is four small pieces: a pure membership function
(`app/_lib/screen-wave-holdout.ts`), a config resolver
(`app/_lib/decision-config-schema.ts:69-80`), the wave that applies it and seals the
result (`app/_lib/screen-wave.ts:223-274`, `:365-392`), and a derived-set query over the
sealed records (`app/_lib/decision-record-store.ts:631`).

## Membership: a pure function of (job, entry)

`isHoldout(jobId, entryId, percent)` (`screen-wave-holdout.ts:62`) hashes
`` `${jobId}:${entryId}` `` with 32-bit FNV-1a, takes it modulo 10,000 for two decimal
places of resolution, and compares against `percent * 100`. No date, no score, no
threshold, no policy version. The hash is no longer a private copy: `hash32` (`:54`) reads
the repo's one shared `fnv1a` (`app/_lib/hash.ts`) back off its hex digest, and
`holdout-hash-parity.test.ts` proves the shared function digest-identical to the old
shift-add form over the exact key shape, because a digest change here would move who a live
wave spares and silently retire the arm the calibration figures are computed against.

The header comment (`:1-36`) is the densest statement of the technique's rationale in the
repo, and it names both constraints the standard rests on: the wave signs the exact reject
set into an approval token at preview time and re-derives it at commit, so "a re-rolled
holdout would change the set between the two, so every commit would 409"; and "membership
must not move when the recruiter adjusts a threshold, or the slider becomes a re-roll
button for un-sparing a specific person." It also settles the scope question the standard
flags as having two defensible answers: membership "is deliberately NOT keyed on the policy
version for constraint 2, and IS keyed on the role so one candidate isn't permanently in
(or out of) the holdout everywhere".

`isHoldout` fails closed as the standard requires: non-finite or non-positive rate is
`false`, because "a malformed config must never silently spare an unbounded share of a
reject wave"; `>= 100` is `true`, an explicit spare-everyone. `selectHoldout` (`:73`)
partitions the would-reject list preserving the caller's order in both partitions.

**Measured, 2026-09-29, on the module itself** (a copy of `hash.ts` and
`screen-wave-holdout.ts` with the import path suffixed so bare Node could load them; 200,000
keys per row, rate 5%, binomial sd 0.049 points): UUID entry ids spared 5.02%, sequential
integer ids 4.95%, `entry-<n>` ids 4.98%; over 2,000 roles of 100 would-be rejects the mean
spared was 4.96 per role and 0.5% of roles had none (binomial 0.59%). The mixing claim holds
for the id shapes tried; nothing about the hash needs a condition. What the rate does to a
small role does: at 5% a role with 20 would-be rejects has no spared candidate 36% of the
time, so the arm exists per workspace and accrues across roles.

## Configuration: 5%, absent-means-default, malformed-means-zero

`DEFAULT_HOLDOUT_PERCENT = 5` (`decision-config-schema.ts:69`) is deliberately **not** a key
in `SCREENING_DEFAULT` — the persisted rule shape is pinned "byte-identical, no phantom
key" by the config tests, so a rule saved before the holdout existed keeps validating. It is
resolved at point of use by `effectiveHoldoutPercent` (`:75`): absent takes the default, "an
explicit 0 disables it, which is how a workspace opts out", non-finite or negative is 0, and
the result is clamped at 100. The type declaration (`:34-46`) carries the rationale, ending
on the line the standard generalises: "This is the clean arm. 0 disables it (calibration
then stays circular)."

## Application point: before the token is signed, after the shields

`screen-wave.ts:257-258` computes `heldOut` from `selectHoldout` and deletes those ids from
`wouldReject` *before* `screenWaveApprovalToken` is built (`:274`), so the token covers the
set the recruiter sees and a commit re-derives byte-identically. The rate rides the
`policyVersion` string (`:224`) while membership does not, and the string is unchanged when
the rate is 0 so a holdout-disabled wave signs a byte-identical token to the pre-holdout
build. That is the standard's separation of rate-in-the-seal from membership-unkeyed.

Two other ways of being spared now sit on either side of the draw, and neither is the arm:

- **The reinstatement shield runs first** (`:246-256`): a candidate whose auto-rejection a
  recruiter reversed is removed from `wouldReject` before the draw and carries the
  `reinstated` keep-reason, not `holdout`. `screen-wave-guards.test.ts:62` pins it.
- **Reviewer exclusions run last** (`:259-266`), "so only a person who would really be
  rejected can be spared", and ride the policy version as `/spared<n>`.

Because the arm is read from `holdout` records (next section), neither path can enter it. The
standard now says so explicitly; before this pass it did not, and a build that derived the arm
from "everyone spared" instead of "everyone drawn" would have filled the clean arm with the
candidates a human had already chosen to keep.

## The arm is the sealed record, not the hash

The 2026-08-20 note described the arm as derived from the sealed records minus later
rejections, which is still true. What changed is what happens when the record cannot be
written. `screen-wave.ts:365-392` seals a `screen_wave_holdout` decision for every drawn
candidate and now *checks* the seal: "MEMBERSHIP IS THE SEAL … no seal, no arm." A failed
write used to be swallowed into a `console.warn`, dropping the candidate from the arm while
the recruiter's row still read "kept as a calibration holdout". Now a failed holdout seal
increments `sealFailures` exactly as a failed reject seal does, the row says the sparing
stands but the measurement does not, and the candidate is still spared, because they left
`wouldReject` before the token was signed: "A failed holdout costs a calibration data point,
never a person." That is the standard's "fail toward under-claiming the arm", and the file
notes why the alternative is worse: silent contamination of the one arm whose purpose is to
be uncontaminated, reported as if it had worked.

`heldOutEntryIds` (`decision-record-store.ts:631`) computes the arm as the newest sealed
`screen_wave_holdout` refs **minus** those later sealed `auto_rejected`, "because a candidate
spared by one wave can be auto-rejected by a LATER wave (e.g. the holdout rate was lowered)
… membership survives only while the sparing still stands". Tests
(`calibration-holdout-arm.test.ts:74`, `:202`) pin both the exit and the per-role scope; the
scoped read falls back to the workspace arm rather than an empty one when the pipeline table
is absent from the connection.

The curve reads that set through the ordinary producer:
`pipelineCalibrationPairs(ws, { onlyEntryIds })` (`app/_lib/db/pipeline.ts:651`), whose
comment pins the comparability rule — "the inclusion rule is IDENTICAL to the contaminated
curve's — the only difference is which entries are eligible".

**Run on 2026-09-29:** the four holdout and verdict test files (36 tests) and
`screen-wave-guards.test.ts` (11) pass against the tree, with the runner at
`scripts/run-unit-tests.mjs`.

## Deviations from the standard

- **Nothing sizes the rate from a target power.** 5% is a chosen default, not a number
  derived from below-floor volume and a smallest detectable effect, and no surface projects
  the monthly yield of clean-arm outcomes at the configured rate. The standard's arithmetic
  (30 usable outcomes at 5% need 600 rejection decisions) is not on any panel, so a workspace
  can run a holdout for a year and never learn that it will not clear
  `MIN_CALIBRATION_OUTCOMES`.
- **The arm is a recency window that no surface states.** `heldOutEntryIds` reads the newest
  2,000 sparings per workspace (`HELD_OUT_SCAN_LIMIT`, `:629`; `:653` clamps a caller's limit
  to 10,000), a deliberate bound with the reason given in the function ("an arm is a
  measurement of recent selection quality"). All three callers found call it without a role
  (`calibration/route.ts:78`, `calibration/band/route.ts:54`, `calibration-recommendation.ts:44`),
  so the per-role option exists and is unused, and the cap is not among the things the
  calibration surface prints beside the curve. At 5% the cap is reached after 40,000 would-be
  rejections.
- **Score-blindness is policy, not architecture.** The spared candidate reaches the same
  recruiter view, which shows the match score; the descriptor in `calibration.ts` is honest
  about it in its `holdout` ceiling, but nothing hides the number.
- **Rate changes are not treated as an arm boundary.** The rate is sealed per wave, so the
  history exists, but no calibration surface splits the clean arm at a rate change.
