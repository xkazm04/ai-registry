---
layer: application
type: application
subject: selection-score-calibration
technique: deterministic-holdout-clean-arm
stack: node
verified_on: 2026-08-20
---

# The screening-wave calibration holdout (Node/TypeScript)

The clean arm is four small pieces: a pure membership function
(`app/_lib/screen-wave-holdout.ts`), a config resolver
(`app/_lib/decision-config-schema.ts:69-80`), the wave that applies it
(`app/_lib/screen-wave.ts:253-278`), and a derived-set query over the sealed
records (`app/_lib/decision-record-store.ts:453`).

## Membership: a pure function of (job, entry)

`isHoldout(jobId, entryId, percent)` (`screen-wave-holdout.ts:51`) hashes
`` `${jobId}:${entryId}` `` with FNV-1a 32-bit, takes it modulo 10,000 for two
decimal places of resolution, and compares against `percent * 100`. No date, no
score, no threshold, no policy version.

The header comment (`:1-33`) is the densest statement of the technique's rationale
anywhere in the repo, and it names both constraints the standard rests on:

1. the wave "signs the exact reject set into an approval token at preview time
   and re-derives it at commit … A re-rolled holdout would change the set between
   the two, so every commit would 409 'the candidate set changed since it was
   previewed'";
2. "Membership must not move when the recruiter adjusts a threshold, or the
   slider becomes a re-roll button for un-sparing a specific person."

It also settles the scope question the standard flags as having two defensible
answers: membership "is deliberately NOT keyed on the policy version for
constraint 2, and IS keyed on the role so one candidate isn't permanently in (or
out of) the holdout everywhere" (`:29-31`). The hash choice is justified in the
same register — FNV-1a because "this needs stable spread, not unpredictability
against an adversary with the source" (`:35-36`).

`isHoldout` fails closed exactly as the standard requires: non-finite or
non-positive rate → `false` (`:52`), because "a malformed config must never
silently spare an unbounded share of a reject wave" (`:49-50`); `>= 100` → `true`
as an explicit spare-everyone. `selectHoldout` (`:62`) partitions the would-reject
list while "preserving the caller's order in BOTH partitions — the wave renders
rows in rank order and the human approves what they saw" (`:59-61`). The module
is import-free so it runs under bare `node --test`.

## Configuration: 5%, absent-means-default, malformed-means-zero

`DEFAULT_HOLDOUT_PERCENT = 5` (`decision-config-schema.ts:69`) is deliberately
**not** a key in `SCREENING_DEFAULT` — the persisted rule shape is pinned
"byte-identical, no phantom key" by the config tests, so a rule saved before the
holdout existed keeps validating. It is resolved at point of use by
`effectiveHoldoutPercent` (`:75`): absent → the default, "an explicit 0 disables
it, which is how a workspace opts out", non-finite or negative → 0, and the
result is clamped at 100. The type declaration (`:34-46`) carries the full
rationale, ending on the line the standard generalizes: "This is the clean arm.
0 disables it (calibration then stays circular)."

## Application point: before the token is signed

`screen-wave.ts:276-277` computes `heldOut` from `selectHoldout` and deletes those
ids from `wouldReject` *before* `screenWaveApprovalToken` is built (`:278`) —
"Applied HERE, before the approval token is signed, so the token covers the set
the recruiter actually sees and a commit re-derives byte-identically" (`:267-275`).

The rate rides the `policyVersion` string (`:254`,
`` `${…}${holdoutPct ? `/holdout${holdoutPct}` : ""}` ``) while membership does
not: "the sealed record attests to the rate in force, and changing that rate
forces a fresh preview+approval rather than a stale rubber-stamp … Omitted when
0, so a holdout-disabled wave signs a byte-identical token to the pre-holdout
build" (`:249-252`). That is exactly the standard's separation of *rate in the
seal* from *membership unkeyed on policy*.

## The arm is derived, not stored

`heldOutEntryIds` (`decision-record-store.ts:453`) computes the clean arm as the
sealed `screen_wave_holdout` refs **minus** the sealed `auto_rejected` refs,
because "a candidate spared by one wave can be auto-rejected by a LATER wave
(e.g. the holdout rate was lowered) — at which point their reject IS score-caused
again, so they are removed from the clean arm … membership survives only while
the sparing still stands" (`:445-452`).

The curve then reads that set through the ordinary producer:
`pipelineCalibrationPairs(ws, { onlyEntryIds })` (`app/_lib/db/pipeline.ts:418`),
whose comment pins the comparability rule — "the inclusion rule is IDENTICAL to
the contaminated curve's — the only difference is which entries are eligible — so
the two are directly comparable." `app/_lib/calibration-holdout-arm.test.ts`
exercises that seam end to end against a real database.

## Deviations from the standard

- **Nothing sizes the rate from a target power.** 5% is a chosen default, not a
  number derived from below-floor volume and a smallest detectable effect, and no
  surface projects the monthly yield of clean-arm outcomes at the configured
  rate. A workspace can therefore run a holdout for a year and never learn that
  it will not clear `MIN_CALIBRATION_OUTCOMES`.
- **Score-blindness is policy, not architecture.** The spared candidate reaches
  the same recruiter view, which shows the match score — the descriptor at
  `calibration.ts:408` is honest about this in its `holdout` ceiling, but nothing
  hides the number.
- **Rate changes are not treated as an arm boundary.** The rate is sealed per
  wave, so the history exists, but no calibration surface splits the clean arm at
  a rate change.
