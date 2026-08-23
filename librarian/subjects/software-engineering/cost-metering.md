---
subject: cost-metering
domain: software-engineering
last_touched: 2026-08-23
touched_by: external-reconcile
dry_streak: 0
---

# cost-metering

First touch: [[2026-08-23-2]], external reconcile against
`openmeterio/openmeter` @ `7e57a39`. Gained `go--spend-attribution`
(uncovered); single-stack debt cleared. Hint confirmed; price-tables proven
out-of-scope by grep (rating lives in the billing layer).

## Open leads (banked, convergence rule applies)

- THE AMENDMENT CANDIDATE: attribution axes can resolve at query time from
  stored raw payloads (JSON_VALUE over the event body), applying new axes
  retroactively. The obligation moves from "enumerate the axes" to "emit
  every property you might ever group by, and never truncate the payload" -
  a cheaper, strictly weaker precondition than the technique states.
- Refuse the ambiguous response: reject a query whose result would carry no
  label distinguishing merged groups.
- The uniqueness constraint as the identity mechanism - enforce
  axis-value-to-entity mapping in the store, so double counting is
  impossible rather than discouraged.
- A declared axis floor implemented as a query CLAMP (EventFrom).
- Deviation leads: dedupe off by default with no metrics in the dedupe
  package (absent-guard confirming sighting); missing group-by flattened to
  "" while the read model has the nullable slot the write model refuses
  (unknown-is-not-a-value confirming sighting); a dead uniqueness check
  (seen reallocated inside the loop) - upstream-reportable.

## Cross-subject proposals

- The at-least-once persist-commit-dedupe ordering with its declared
  duplicate-acceptance trade -> a better usage-ledgers exemplar than the
  rust application's log-and-swallow; and the declared stance must come with
  a counted metric.
- "Refuse a labelless aggregate" generalizes beyond money -> metrics-rollups.
