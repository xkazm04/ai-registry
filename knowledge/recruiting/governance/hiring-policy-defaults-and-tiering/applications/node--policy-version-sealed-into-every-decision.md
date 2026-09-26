---
layer: application
type: application
subject: hiring-policy-defaults-and-tiering
technique: policy-version-sealed-into-every-decision
stack: node
status: forged
verified_on: 2026-09-26
verified_against: node@24
applied: simulation
ab_verdict: better
---

# A canonical policy version signed into the approval token and the sealed record

`app/_lib/screen-wave.ts` builds one string that identifies the rulebook a screening wave
ran under. It signs that string alongside the reviewed cohort and seals it into every
decision record the wave produces. Re-verified on 2026-09-26 against one pinned commit;
the record half changed since the first read on 2026-08-20.

## The canonical form

`screen-wave.ts:223-224`:

```ts
const holdoutPct = effectiveHoldoutPercent(cfg);
const basePolicyVersion = `screen-wave/bottom${cfg.rejectBottomPercent}/maxMatch${cfg.maxMatchToReject}${familyFloorSuffix(cfg)}${holdoutPct ? `/holdout${holdoutPct}` : ""}`;
```

Two dimensions were added after the original two. `familyFloorSuffix` (`:109`) sorts the
family keys before joining them, so the serialisation is order-independent. It returns the
empty string when the map is absent or empty, which is "byte-identical to the
pre-family-floors token".

The holdout is the instructive one, because it is **not** omitted when absent. An absent
`holdoutPercent` resolves through `effectiveHoldoutPercent` to the shipped default of 5.
That value is non-zero, so it rides the version. The segment is omitted only at a
*resolved* zero, as the comment at `:219-222` says: "Omitted when 0, so a
holdout-disabled wave signs a byte-identical token to the pre-holdout build."

So when the holdout shipped, every workspace that had never heard of it got a new
version. That was correct: every one of those workspaces now spared 5% of its
would-be rejections, so its rulebook had changed. A workspace that typed 0 kept its old
version, and its behaviour had not changed either. The tree's rule is **omit a dimension
when its resolved value reproduces the behaviour from before the dimension existed**. The
technique as first written said "omit absent values", which is a different rule. See
Applied below.

The second property, that a change to a live dimension must invalidate, is stated at
`:215-218`: family floors ride the version "so that changing a family floor (even one that
leaves the reject SET unchanged) forces a fresh preview+approval, never a stale
rubber-stamp." A version that fingerprinted only the *outcome set* would miss exactly the
case where the rule moved and the population happened not to.

## Signed alongside the cohort, verified at redemption

`:268` appends the reviewer's exclusions (`/spared<n>`, absent when none), and `:274` binds
the result to the reviewed set:

```ts
const approvalToken = screenWaveApprovalToken(jobId, policyVersion, [...wouldReject]);
```

`:276-290` refuses a commit with no approval, a token that no longer matches the live
computation, or an expired one. The comment at `:120-123` states the contract: approval is
"REQUIRED to commit". The token carries job, policy version and cohort together. That is
the three-way binding the standard asks for: neither a changed rulebook nor a changed
population can be redeemed against a review that saw something else.

## Sealed into the record

`app/_lib/decision-record-store.ts:31` makes `policyVersion` a required field of every
record, beside the server-derived `actor`, the `candidateRef` and the snapshotted `inputs`.

**The record now carries the exact string the approval signed.** On 2026-08-20 the reject
seal rebuilt a shorter per-candidate string, `bottom<pct>/maxMatch<effective floor>`. The
tree has since reversed that, and the comment at the reject seal (`:536-549`) says why:
the shorter string "dropped both suffixes and substituted a per-candidate number for the
global one. So an auto_rejected record could not be joined back to the approval that
authorized it, nor to the holdout seals of the very same wave". The per-candidate
effective floor moved to the sealed `inputs.threshold`. In the tree's words,
"policyVersion identifies the POLICY, inputs identify the run". The first reading of this
application praised the per-candidate string. That praise is withdrawn.

The spared calibration cases are sealed too (`:378-386`): kind `holdout`, reason code
`holdout`, the same `policyVersion`, and `inputs` carrying score, threshold, rank, holdout
percentage and approver. A failed holdout seal is now counted in `sealFailures`. The
candidate is still spared, and the row says the calibration measurement did not stand.

## Deviations

- **The version is a legible label, not a digest of the resolved configuration.** It
  enumerates four hand-picked dimensions of one phase plus a run fact. A fifth governed
  value that someone forgets to append produces a version that does not move when policy
  did. Content derivation exists to make that impossible. The label has the right
  omit-when-inert semantics.
- **One run fact rides the policy string.** `/spared<n>` records the reviewer's exclusions
  for this wave. They belong in the signed set, and they are bound there, but they are not
  policy. That contradicts the tree's own rule, stated at the reject seal, that the policy
  string identifies the policy.
- **The preimage is not retained.** `decision_config` rows are still overwritten in place.
  A version from last quarter cannot be dereferenced beyond what the label spells out.
- **Resolved on 2026-09-26: the seal is no longer best-effort for a rejection.**
  `sealDecisionSafe` still never throws, but the reject path now checks its result before
  anything irreversible happens (`:525-571`): "Now the record is the PRECONDITION: no seal,
  no rejection." A candidate whose record cannot be written is kept with reason code
  `sealFailed` and counted. The residue runs the other way: if the candidate's stage changes
  between the seal and the status flip, the chain holds a rejection that was not applied.
  The tree logs this and prefers it to an applied rejection with no record.

## Applied

Simulation, 2026-09-26, recorded in `librarian/applied.md`. The tree's version builder was
reproduced and three real configurations were walked across the build that introduced the
holdout. The question: does the version move exactly when behaviour does?

- A workspace that never set a holdout: behaviour changed (5% now spared). The written
  rule ("omit absent") keeps the version, which is wrong. The tree's rule ("omit when the
  resolved value is inert") moves it, which is right.
- An explicit 0: behaviour is unchanged. The written rule moves the version, which is
  wrong and invalidates in-flight approvals for nothing. The tree's rule keeps it.
- An explicit 5: both rules move it, which is right.

The written rule got two of three wrong, and the tree's rule got all three right.
**Falsifier:** a new dimension whose absent state reproduces the old behaviour and whose
resolved value is non-inert at the same time. By construction those cannot both hold.
