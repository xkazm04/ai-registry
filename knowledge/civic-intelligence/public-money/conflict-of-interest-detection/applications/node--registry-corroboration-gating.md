---
layer: application
type: application
subject: conflict-of-interest-detection
technique: registry-corroboration-gating
stack: node
status: forged
verified_on: 2026-10-10
verified_against: node@24
applied: experiment
ab_verdict: better
---

# Node: one exit gated, one exit not, in the politicas money layer

The politicas money layer links sitting MPs to companies and adds up the public
money those companies reach. Each tie carries a corroboration verdict from a
reconciliation against the Czech commercial register (ARES VR). The stack is
Node 24, witnessed by the CI pin in `.github/workflows/ci.yml:36` "node-version: 24". The tree was read at commit `19a54e8`.

## Where the gate holds

The vote-versus-interest join applies the technique exactly.
`features/money/collisions/deriveCollisions.ts:102` "t.corroboration ===" admits a tie to the join only
when it is registry-confirmed and has a known period start. The statute
relevance check repeats the same condition. The review queue orders trust
before money: `features/money/reviewTypes.ts:354` "if (t.corroboration !==" puts every
unconfirmed tie in the last tier, whatever its money.

## Where it does not

The figure printed next to an MP's name is not gated. The MP profile and the
`/penize/[pspId]` case file both print the "attributable" sum, meaning the
money of companies the MP owns or manages. That sum is built in
`features/money/reachableMoney.ts`, and a tie's bucket is decided by its class
alone: `features/money/reachableMoney.ts:110` "export function isAttributable(tieClass: TieClass | string): boolean {".
Corroboration is not an input. The profile passes the bucket on unchanged:
`features/profile/profileMoney.ts:225` "attributableFigure: mpBucketClaim(detail.pspId,".
The figure's only status is the human review gate, and all 211 ties in the
replayed ledger are `pending_review`. So that status cannot tell a
register-confirmed sum from an unconfirmed one. The tie lines do carry a
"not confirmed in the registry" badge, but the headline figure does not.

## The experiment

- **Instrument.** A replay over the committed tie ledger
  (`docs/data-analysis/case-money/ledger.json`, 211 ties, 63 MPs). Each tie's
  money is recovered from its stored review rank, which packs tier and money
  into one key.
- **Positive control.** Recomputing the tier from class and corroboration
  matched the stored tier on all 211 ties, and the rank decoded to an amount
  in range on every row.
- **Arm A** is the attributable sum as the tree computes it. **Arm B** adds up
  only registry-confirmed owner and manager ties.
- **Target:** published figures that rest partly on a tie the register has
  not confirmed. Arm A had 6 of the 30 MPs with a figure, carrying
  128.1 M CZK. Arm B had 0.
- **Floor:** no registry-confirmed contribution is withheld. On all 63 MPs,
  arm B's set of confirmed companies matched arm A's.

## The falsifying seam

This seam was chosen because it could have refuted the gate. If the
unconfirmed ties were mostly real, gating would hide true money.

They were mostly real. The six ties had all been stored as `conflicting`.
Later corroboration payloads in the tree confirmed four of them:
- two from the register's bulk full-history export,
- one from a live re-check,
- and one was a wrong-entity link, re-pointed to the dissolved company it
  meant.

Those four carried 121.4 M of the 128.1 M arm B withheld, which is 95%. None of
the six had a register record that contradicted the role. The reconciliation
writes `conflicting` whenever the current officer list has no birth-date match:
`scripts/case-loops/money/reconcile-ares-vr.ts:189` "if (matches.length === 0) {". The surface labels that state correctly as "not
confirmed". But the technique routes a contradiction to the data-quality lane,
and here the name `conflicting` would have sent four real roles there.

The gate held. Before the deeper reads ran, nothing anyone could cite made
those four ties real. With the later payloads applied, arm B still withholds
6.7 M CZK from one MP's figure, from a tie that the full-history read also
failed to match. The technique gained the boundary this seam showed: record
how deep each check read, and send a current-view no-match to the history read
before calling it a contradiction.

## What this realization cannot do

The replay ran on a committed snapshot, not the live store. Later corroboration
payloads were applied by hand, and ties ingested after the snapshot are not in
it. Gating the
headline means touching 102 call sites across 22 files, because one
`ReachableMoney` shape feeds the ledger, the case files, the profile, the
company page and the claim re-derivation. A tie that is attributable but
unconfirmed needs a bucket of its own. Moving it into the steward bucket would
present it as an institution's money. That change is task-sized and is not
shipped here.

## Review limits

Money per tie is the review-rank amount (contracts plus subsidies). The printed
figure counts contracts only, so the CZK totals above are an upper bound on the
printed difference. The count of MPs affected does not depend on that.
