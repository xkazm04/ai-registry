---
subject: candidate-communication-integrity
domain: recruiting
last_touched: 2026-09-26
dry_streak: 0
---

# candidate-communication-integrity

First touch by `/deepen` (single subject, dispatched by the Curator lane on the scan
finding "single stack (node)"). Registry HEAD at dispatch 55c6bce2; worked from
origin/main d52e6a5f, landed on 016d5d26.

## 2026-09-26 - a spec second stack from the mail standards, three conditioned absolutes

**Depth rung:** L2 primary for the spec applications and the corrections (RFC text,
regulator guidance, provider documentation), L3 for the consumer read (kp's receipt
path read against its tree, one code-mode apply measured).

Lanes: primary standards (RFC 5321/3461/3463/3464/8098, fetched and re-opened),
counter-evidence (web, unconstrained), training-data-only (blind), consumer-tree
re-verification.

**Landed** (one registry commit):
- NEW `spec--terminal-delivery-status-vocabulary` and
  `spec--bounce-receipt-supersedes-a-green-send`, pinned to the RFC texts retrieved
  2026-09-26. None of the RFCs is obsoleted at that date. This clears the single-stack
  finding (points 5 -> 3; the remaining reason is "never swept by the librarian").
- `terminal-delivery-status-vocabulary`:
  - *delivered* becomes its own member, licensed only by a delivery report and never
    by a relay acceptance;
  - *delayed* is added as a non-terminal state after acceptance;
  - relay-side suppression is a refusal that supersedes *sent*;
  - "a failure report is not proof of non-receipt" (standards and blind lanes);
  - read receipts are removed as the example of a richer terminal state (RFC 8098: may
    be silently withheld, does not assert reading).
- `bounce-receipt-supersedes-a-green-send`:
  - ordering binds to the attempt, not to arrival. Standards, counter (provider event
    ordering) and blind lanes converged.
  - the yours-or-foreign condition on unmatched receipts: counter and blind lanes, and
    kp had reached the split in the field.
  - the orphan window times only promised receipts: under default NOTIFY, silence after
    acceptance is expected.
  - "never prune" becomes symmetric retention: counter lane (ICO recruitment-records
    guidance, re-opened) and blind lane.
  - the append-only rule gains the erasure exception.
- `dead-letter-escalation-and-orphan-receipts` and the golden path carry the same
  unmatched-receipt and retention conditions, plus "later" meaning later in the
  attempt's story.
- `node--bounce-receipt-supersedes-a-green-send` re-verified to 2026-09-26 against kp.
  It records the `unknown_ref`/`no_matching_send` split, the half-built `messageId`
  repair, and two shortfalls read from the tree:
  - the attempt is stamped at its outcome, so a bounce that beats a retried send's row
    can misattribute. Not reproduced.
  - foreign receipts left no trace in the install. Closed by the apply below.

**Verified and left untouched:**
- opens and engagement kept out of delivery. Already hedged in both techniques, so
  adding it would be a phantom fix.
- consent evaluated before operational halts.
- *queued* as terminal under the relay model.

**Declined / banked (single lane, or reasoning only):**
- The blind-case tension. The vocabulary technique's "the un-recorded case is the one
  that went fine" sits against its own "default unknown to the pessimistic member".
  Reasoning only, from one lane. The node application already lists it as a
  shortfall: "an invariant held by convention ... not by a type". Return when a
  second lane or a consumer incident speaks to it.
- A statutory language mandate outranking the candidate's locale choice (Québec
  Charter of the French Language s.41, via law-firm commentary). One lane, commentary
  class. Return with the statute's own text, or when a consumer hires in a
  mandated-language jurisdiction.
- Retracting the send marker when a later bounce overturns the acceptance. Reasoning
  only; follows from the subject's own supersession rule. Return with a consumer whose
  sequencing reads the marker.
- An old do-not-contact objection not blocking transactional messages about a later,
  self-submitted application. Two weak lanes; GDPR Art. 21(3) was cited from memory.
  Return with the primary text.

**Source classes:**
- RFC text decided every vocabulary and ordering claim.
- Regulator guidance decided retention.
- Provider docs (two ESPs) carried event ordering and duplicates. They are
  product-named, so they stay out of upper layers.
- Commentary carried the only locale claim, which is why it was banked.
- The blind lane matched the standards lane on the DSN vocabulary and on
  ENVID/ORCPT without seeing it, so the class priors are not drifting.

## Impact

`build-registry-map --project kp`: 5 kp contexts carry this subject, all `unknown`, so
no judged verdict is stale on it. The rebuild carried 19 stale verdicts for other
subjects forward. Committed in kp (11da7e2f6), not pushed: kp's main is diverged by a
live sibling session.

## Applied

- kp, code, better. Foreign-ref receipts are now counted install-wide
  (0aabc0da). Arm A has no trace; arm B counts 2 of 2 and 0 of 2 controls.
- kp, simulation, better. Symmetric retention: erasure scrub, consent-expiry sweep and
  simulation teardown all act on every row alike. Not independent: kp already did it.

## Clocks and return conditions

- The standards pin has no clock (`spec` stack). The event is an RFC 5321bis or DSN
  revision reaching publication.
- kp's `messageId` echo in the callback: when it lands, re-read attribution and delete
  the heuristic shortfall.
- kp's attempt-stamp ordering shortfall: re-read when the send row takes its time from
  the attempt start.
