---
layer: application
type: application
subject: form
technique: submit-lifecycle
stack: node
verified_on: 2026-08-23
---

# The submit machine in TanStack Form's framework-agnostic core

How `@tanstack/form-core` — the headless TypeScript engine under every TanStack
Form adapter — realizes the submit-lifecycle technique. Citations are against
`@tanstack/form-core` 1.33.5, `TanStack/form` commit `57a855b` (2026-08-17),
`packages/form-core/src/`. External tree, not the consumer repo the sibling
`react--*` applications cite, so the pin lives in prose rather than in
`verified_against`, whose contract is a stack runtime version. Every behavioral
claim below was executed against the published package.

## 1. The machine is one function, and it is the whole machine

`FormApi._handleSubmit` (`FormApi.ts:2420-2565`) is the technique's diagram in
order: attempt accounting (`:2421-2428` — `submissionAttempts + 1`, with
`isSubmitted` and `isSubmitSuccessful` cleared, so a second attempt cannot
show the first one's success), touch-everything (`:2430-2440`), field
validation (`validateAllFields('submit')`, `:2468`), form-level validation
(`validate('submit')`, `:2491`), in-flight, then one of two terminal branches.
Both failure branches call the same `done()` closure (`:2464-2466`) clearing
`isSubmitting` and both fire `onSubmitInvalid` — validation failure is a cheap
ordinary transition, not an exception. Touch-everything is the submit backstop
made structural: untouched fields are marked touched *before* validation runs
(`:2437`), so a timing policy keyed on `isTouched` cannot hide an error from a
submit attempt. The public `handleSubmit` overloads (`:2411-2414`) delegate
straight in; there is no second path.

## 2. `canSubmit` reserves disabling for "nothing to try yet"

The derived flag (`FormApi.ts:1556-1561`) is three clauses:

```ts
const canSubmit =
  (currBaseStore.submissionAttempts === 0 && !isTouched && !hasOnMountError) ||
  (!isValidating && !currBaseStore.isSubmitting && isValid) ||
  submitInvalid
```

Clause one is the good instinct: a pristine, never-submitted form is always
submittable, so the first press reaches the machine, runs validation, and
surfaces errors — "button enabled, submit attempt runs validation", in core.

The docs then undercut it. Under `docs/framework/react/guides/`,
`validation.md:592` states plainly that "in practice, disabled buttons are not
accessible, use `aria-disabled` instead" — and every example, including the
one twelve lines below that sentence, ships `disabled={!canSubmit}`
(`validation.md:604`, `basic-concepts.md:251`, `arrays.md:115`,
`ssr.md:166,311,481`; eleven sites across `docs/`).

## 3. Deviation: the re-entry guard is off from the second attempt on

`isSubmitting` is a `canSubmit` term (`:1560`), so an in-flight submit *does*
make the form un-submittable, and `:2446` reads that flag. But the early
return underneath it is conditional:

```ts
if (!this.state.canSubmit && !this._devtoolsSubmissionOverride) {   // :2446
  if (this.baseStore.state.submissionAttempts <= 1) {                // :2452
    this.options.onSubmitInvalid?.({ ... }); return }}
```

The counter was already incremented at `:2426`. A second submit arriving while
the first is in flight therefore sees `submissionAttempts === 2`, skips the
return, and re-runs the whole machine. Executed against 1.33.5: two
`handleSubmit()` calls 10ms apart, with a 120ms `onSubmit`, invoke `onSubmit`
**twice**. The hatch is deliberate but aimed elsewhere — its comment
(`:2447-2451`) says it exists so re-validation can clear stale `onBlur`
errors, and its regression test (`FormApi.spec.ts:1947`) covers only the
sequential case; nothing separates "retrying after a failure" from
"double-clicked". `done()` is likewise unscoped to a submission: measured, a
fast second submit's completion clears `isSubmitting` while the first is still
awaiting. Where the transport offers no idempotency this is the gap the
technique calls data corruption rather than UX polish.

## 4. Deviation: group-scoped submits carry no gate at all

`FormGroupApi` gives each group its own lifecycle slice in
`formGroupStateBase` (`FormGroupApi.ts:2404-2412`) — the technique's rule that
the guard binds to *this* submission, never to a global busy flag, honored
better than most: two groups cannot lock each other. But
`FormGroupApi._handleSubmit` has no `canSubmit` check whatsoever; it marks
fields touched and goes straight to `isSubmitting: true` (`:2427`), while the
group's `canSubmit` (`FormApi.ts:1376-1381`) is derived for display only —
per-group save buttons are unguarded by construction.

## 5. Dirty tracking: persistent by choice, baseline model beside it

`setFieldValue` sets `isDirty: true` and never unsets it (`FormApi.ts:2665`) —
the touched-bit the technique warns about. TanStack knows:
`basic-concepts.md:124-136` names the split (non-persistent RHF/Formik vs
persistent Angular/FormKit), picks persistent, and ships `isDefaultValue` as
the true baseline comparison (`FormApi.ts:1236-1241` — a deep `evaluate`
against the field's own `defaultValue`, else the form's `defaultValues`).
Measured: `b` then back to `a` leaves both `isDirty` and `isDefaultValue`
true. **An unsaved-changes guard must read `isDefaultValue`, not `isDirty`.**
The baseline advances only if the caller advances it: `reset(values)`
(`:1810-1819`) rewrites `options.defaultValues` unless `keepDefaultValues`.
Calling it inside `onSubmit` works — after it, `isDirty: false`, values
retained — but it also zeroes `submissionAttempts`.

## 6. Rejection keeps the draft, and the outcome is broadcast

A throwing `onSubmit` clears `isSubmitSuccessful`, calls `done()`, and
rethrows (`:2547-2564`): values preserved as submitted, `isSubmitted` still
false, attempt count standing. Every terminal transition also emits a
`form-submission` event carrying the attempt number and, on failure, a `stage`
of `'validateAllFields' | 'validate' | 'inflight'` (`EventClient.ts:20-39`;
emitted at `FormApi.ts:2479-2487, 2503-2509, 2539-2543, 2553-2559`).

## Reconciliation summary

Confirmed: submit as the one door that touches and validates everything;
validation failure as an ordinary transition; per-instance and per-group
lifecycle state rather than a global busy flag; drafts preserved across
rejection; success and failure explicitly represented. Deviations: the
in-flight re-entry guard is bypassed from the second attempt onward by a
stale-error escape hatch, with `done()` unscoped to a submission; group
submits have no gate; the docs prescribe the disabled-submit pattern their own
prose rejects. Not present by scope: the unsaved-changes guard and its exit
paths, busy state on the pressed control, focus-to-first-invalid — a headless
core owns no DOM and no router; those land on the adapter and its consumer.
