---
subject: form
domain: software-engineering
last_touched: 2026-08-23
touched_by: external-reconcile
dry_streak: 0
---

# form

First touch: [[2026-08-23-2]], external reconcile against `TanStack/form`
@ `57a855b` (form-core 1.33.5). Gained `node--submit-lifecycle` (uncovered);
single-stack debt cleared. Hint held; the wave's sharpest finding is a
MEASURED double-submit bug in the current release: the in-flight guard is
nested under attempts<=1, so two calls 10ms apart invoke onSubmit twice.
Upstream-reportable (with the group API's missing gate and the docs
prescribing disabled= against their own aria-disabled warning).

## Open leads (banked, convergence rule applies)

- Two dirty models exist deliberately (sticky touched-bit vs baseline
  comparison); the unsaved-changes guard binds to the BASELINE flag,
  whichever name it carries.
- The re-entry guard must not be relaxed by the retry path: re-validate on
  retry, but gate the in-flight term separately from the validity term.
- The busy flag is owned by the SUBMISSION, not the form - a shared done()
  closure leaks even when state is correctly instance-scoped.
- Emit a submission event tagged with attempt number and failure stage
  (validate vs inflight).

## Cross-subject proposals

- A library stating the a11y rule in prose and shipping the violation in
  every example - the fix has to be in the EXAMPLE -> whichever subject owns
  disabled-vs-aria-disabled.
- A correctly-derived UI double-submit guard bypassed by an unrelated
  refactor is a clean witness that server idempotency keys are not optional
  -> concurrency-guards/idempotency-by-design.
- revalidateLogic gating on submissionAttempts -> form-core counterpart lead
  for validation-timing.
