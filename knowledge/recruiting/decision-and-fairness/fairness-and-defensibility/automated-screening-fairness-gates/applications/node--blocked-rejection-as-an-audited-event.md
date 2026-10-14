---
layer: application
type: application
subject: automated-screening-fairness-gates
technique: blocked-rejection-as-an-audited-event
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
---

# The refusal event in a TypeScript policy-pass apply step

The pipeline's policy pass proposes advance, hold or reject for every active entry, and a
TypeScript backstop re-derives the fairness gate before anything is applied. A refused
reject is downgraded to a hold and an alert kind is appended to the decision.

## What already conformed

- The refusal kind is declared once and imported by both the writer and the attribution
  map, so a rename cannot leave an event stream and a surface that disagree.
- It is deduplicated on the natural key (entry, kind, business day), not suppressed: a
  new day writes a new row, and a test pins that.
- It lands in the workspace's existing pipeline-event log, which the decision log and
  the export read, not a private table.
- The dry-run preview and the commit share one encoding of the downgrade.

## Where it disagreed with the technique

The seam was chosen to falsify "the refusal is a first-class event". Two fields the
technique requires were missing:

1. **The proposer.** The event was written with a null actor, so the log could not say
   that the policy pass proposed the reject. A null actor renders as not identified,
   which is honest but loses the one attribution that is knowable here.
2. **The refusing rule.** The rule lived only inside an English sentence
   (early-career shield, unknown archetype, unscored, at-or-above-floor), so refusals
   could not be counted by rule without parsing prose.

## Change and measurement

The verdict now carries a stable rule id, the downgrade records it with the proposed
outcome beside the sentence, and the blocked-reject event is stamped with the policy
pass as its actor. Other alert kinds keep a null actor.

- Arm A (old code, 2 new tests): 2 of 27 fail. Arm B: 27 of 27 pass, type check and
  lint clean, push gate green.
- Floor held: the 25 existing tests in the two files, including the per-day dedupe.

Not changed, and why: the event is written by the apply loop after the decision, not in
the same transaction as the downgrade (the decision is a returned value persisted with
the run, so there is no separate transaction to join); the structured rule id lives in
the persisted decision, not as an event column. Neither was measured.
