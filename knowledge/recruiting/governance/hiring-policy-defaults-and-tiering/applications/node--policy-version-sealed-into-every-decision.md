---
layer: application
type: application
subject: hiring-policy-defaults-and-tiering
technique: policy-version-sealed-into-every-decision
stack: node
status: forged
verified_on: 2026-08-20
---

# A canonical policy version signed into the approval token and the sealed record

`app/_lib/screen-wave.ts` builds one string that identifies the rulebook a screening wave
ran under, signs it alongside the reviewed cohort, and seals it into every decision record
the wave produces.

## The canonical form

`screen-wave.ts:254`:

```ts
const holdoutPct = effectiveHoldoutPercent(cfg);
const policyVersion =
  `screen-wave/bottom${cfg.rejectBottomPercent}/maxMatch${cfg.maxMatchToReject}` +
  `${familyFloorSuffix(cfg)}${holdoutPct ? `/holdout${holdoutPct}` : ""}`;
```

Two dimensions were added after the original two, and both were added the same way: **omit
when absent**. `familyFloorSuffix` (`:136`) sorts the family keys before joining them, so
the serialisation is order-independent, and returns the empty string when the map is absent
or empty — "byte-identical to the pre-family-floors token, so a wave with no family floors
signs exactly as before". The holdout segment is omitted at zero for the same reason, stated
at `:250-252`: "Omitted when 0, so a holdout-disabled wave signs a byte-identical token to
the pre-holdout build."

That is the technique's first property, implemented literally: adding a policy dimension
leaves every existing approval valid until someone actually sets it.

The second property — a change to a live dimension must invalidate — is the reason the
dimensions ride the version at all, and the comment says why in the vocabulary of the
failure it prevents (`:245-249`): the family floors are carried "so that changing a family
floor (even one that leaves the reject SET unchanged) forces a fresh preview+approval,
never a stale rubber-stamp." A version that only fingerprinted the *outcome set* would miss
exactly the case where the rule moved and the population happened not to.

## Signed alongside the cohort, verified at redemption

`:278` binds the version to the reviewed set:

```ts
const approvalToken = screenWaveApprovalToken(jobId, policyVersion, [...wouldReject]);
```

and `:283-286` refuses a commit whose token no longer matches the live computation. The
contract is stated in the signature's own comment (`:141-145`): "`approval` is REQUIRED to
commit (dryRun:false) ... A commit without it — or with a token that no longer matches the
live set — is refused (no solely-automated adverse decision)." The token carries job,
policy version and cohort together, which is the three-way binding the standard asks for —
neither a changed rulebook nor a changed population can be redeemed against a review that
saw something else.

## Sealed into the record

`app/_lib/decision-record-store.ts:6` defines the record input, and `policyVersion` is a
required field beside the server-derived `actor`, the `candidateRef` and the snapshotted
`inputs`. The wave seals one per applied rejection (`:405-419`) with a **per-candidate**
version:

```ts
policyVersion: `screen-wave/bottom${cfg.rejectBottomPercent}/maxMatch${floor}`,
```

carrying "the EFFECTIVE floor this candidate was judged against (family override or
global) — byte-identical when none". The record therefore replays against the number that
actually decided this person, not against the workspace-wide value.

The spared calibration cases are sealed too (`:325-334`) — kind `holdout`, reason code
`holdout`, `inputs` carrying score, threshold, rank, holdout percentage and approver. A
machine declining to act on someone is recorded as a decision about them, which is the
coverage discipline the audit sibling asks for.

## Deviations

- **The version is a legible label, not a digest of the resolved configuration.** It
  enumerates four hand-picked dimensions of one phase. Adding a fifth governed value that
  someone forgets to append produces a version that fails to move when policy did — the
  failure content-derivation exists to make impossible. The standard's requirement is a
  digest over the effective policy with cosmetic fields excluded; the repo has a curated
  string with the right omit-absent semantics.
- **The preimage is not retained.** `decision_config` rows are overwritten in place, so a
  version identifier from last quarter cannot be dereferenced to the configuration it names
  beyond what the label itself spells out, and no surface can render "this differs from
  today's policy in these values".
- **The seal is best-effort.** `sealDecisionSafe` never throws — "a seal failure must NEVER
  abort the wave" — so an adverse action can commit without its record. The standard treats
  the record as a precondition in the same transaction. The repo's trade is deliberate and
  documented, and it is the one place where an unrecorded adverse outcome is reachable.
