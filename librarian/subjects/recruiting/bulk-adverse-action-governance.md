---
subject: bulk-adverse-action-governance
domain: recruiting
last_touched: 2026-09-26
dry_streak: 0
---

# bulk-adverse-action-governance

First touch by `/deepen` (single subject, dispatched by the Curator lane on the scan
finding "single stack (node)"). Registry HEAD at dispatch 55c6bce2; worked from
origin/main d52e6a5f.

## 2026-09-26 - widened to react, two absolutes refuted, three applications re-verified

**Depth rung:** L2 primary for the corrections (regulation text, court rulings,
peer-reviewed field studies), L3 empirical for the applications (read against one pinned
commit of the one consumer).

Lanes: counter-evidence (web, unconstrained), training-data-only (blind), consumer-tree
re-verification, and a react read of the review surface.

**Landed** (one commit):
- NEW application `react--preview-then-approve-the-signed-set` (react@19). This clears the
  single-stack finding with a real second stack in the same consumer.
- Golden path corrections (both lanes converged):
  - "override rates consistently below one percent" is unsupported;
  - "a cohort of six is unmeasurable by definition" is refuted by the selection
    guidelines' own small-numbers clause;
  - "regulatory doctrine has converged" is softened to guidance plus the courts'
    draws-strongly test.
- `small-cohort-floor-with-no-silent-exemption`: underpowered alone, poolable across
  waves. The record must carry the pooling keys. New decision rule: pool small waves,
  never drop them.
- `preview-then-approve-the-signed-set`: two conditions (converged across the tree and
  the training-data lane): spend the approval once, and give every refusal its own
  reason.
- All three node applications moved to `verified_on: 2026-09-26`, with three
  corrections of things wrong even on 2026-08-30:
  - the queue's membership kept human-after-reinstate rejects;
  - the seal's policy string differed from the signed one;
  - an unanchored small-sample size of 5.

**Verified and left untouched:** tie-safe cutoff toward the candidate. No authority
requires a lottery. Banding case law supports a fixed rule set before scores are seen,
applied the same way and recorded. The tie technique already covers precision and
recording.

**Declined:**
- Naming specific statutes or dates in the golden path. They are jurisdictional and
  fast-moving: one US state's AI act was repealed and replaced in 2026, and the EU
  high-risk dates moved. A dated regulatory application with a short `refresh_by`
  would be the right home. It is not forged here, because no consumer has a
  jurisdiction-specific surface to read.
- The FCRA two-step as a model for internal approval: it is candidate-facing notice,
  not internal review.

**Consumer defects found (recorded as deviations, not fixed; the consumer has a live
sibling session):**
- the reconsider queue's 50-row truncation flag never reaches the UI;
- a spare does not carry into the next wave;
- the spend ledger is per process.

**Source classes:**
- Regulation text and court rulings decided claims 2 and 4.
- Peer-reviewed field studies (pretrial, clinical alerts, hiring discretion) decided
  claim 1.
- Commentary carried the only "99% agreement" figure, and it was a hypothetical.
- The training-data lane matched the web lane on every correction, so the class priors
  are not drifting.

## Impact

`build-registry-map --project kp`: no judged verdict in kp rests on this subject (all its
pairs are `unknown`). The map was stale on 19 verdicts for other subjects; it was
regenerated and committed in kp (not pushed: kp's main is diverged by a sibling session).

## Clocks and return conditions

- Colorado's replacement act takes effect 2027-01-01, and its enforcement is stayed in
  litigation. The UK ICO's final automated-decision guidance is due winter 2026. The EU
  high-risk obligations for recruitment move to 2027-12-02. Any one of these is an event
  for a dated regulatory application.
- Per-reason grouping in the consumer's review list is the standing deviation. Re-read
  when it lands.
- Sibling check, no debt:
  `combining-signals-into-a-hire-decision/terminal-decisions-stay-with-a-person` already
  says a 99.5% agreement gate "is either an excellent model or an unstaffed formality,
  and the two are distinguishable only by looking at the cases". That is the corrected
  reading. This subject's golden path was the outlier.
