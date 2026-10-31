---
layer: application
type: application
subject: form
technique: validation-timing
stack: react
verified_on: 2026-10-31
verified_against: react@19
---

# validateOn + the two validation hooks — timing policy in this repo

The technique's whole schedule is implemented in three shared pieces under
`src/features/shared/components/forms/`, plus one heavy consumer that shows
the submit backstop done by hand.

## The visibility gate: `validateOn` / `forceValidation`

`FormField.tsx` gates error *visibility*, not error *computation*
(`ValidateOn`, `:36-48`; the gate itself, `:158-163`):

```ts
const errorVisible =
  !!error &&
  (validateOn === 'change' || forceValidation || (validateOn === 'blur' && hasInteracted));
```

- Default is `'blur'` — no negative feedback on a pristine field. The
  `hasInteracted` bit is set only when focus leaves the *whole* field wrapper
  (`:238-243` checks `relatedTarget` containment, so tabbing from the input
  to its adornment button does not count as blur) — a real implementation of
  "the settling point is leaving the field", including the composite-control
  subtlety.
- After first blur the gate behaves like `'change'`: the error clears on the
  keystroke that fixes it — reward-early-punish-late in four lines.
- `forceValidation` is the submit backstop's lever: the parent flips it true
  on a submit attempt and every gated error surfaces at once.

## Debounced local rules: `useFieldValidation.ts`

`{ validate, debounceMs = 400 }` → `{ validationState, error, onChange }`.
The stale-answer guard is a monotonic sequence: each fired validation takes
`++seqRef.current` and a result is dropped unless `seq === seqRef.current`
(`:63-67`) — the technique's "pin the result to the value asked about",
implemented as last-writer-wins. State enters `'validating'` immediately on
the keystroke (`:59`), so the spinner is steady across a burst of typing.

## Async availability: `useAsyncFieldValidation.ts`

The advisory tier (`idle | checking | available | taken`), deliberately
distinct from the blocking `ValidationState`:

- Debounce 350ms; below `minLength` resets to `idle` — don't ask about
  values the local rules already reject.
- Supersession is an `AbortController` per keystroke (`cancelPending`,
  `:80-89`; the check receives the signal, `:112-119`) — stronger than a
  sequence stamp because in-flight IPC/network work is actually cancelled,
  not just ignored.
- Every keystroke re-enters `checking` rather than bouncing through `idle`
  (`:109`, and the doc comment at `:53-56` states it as intent) — the
  no-flicker rule the technique adopted upward from this file.
- **Fail-open** (`:128-134`): a thrown check resets to `idle` so a network
  hiccup never blocks the user; save-time validation stays the backstop.
  This honors "advisory at the edge, enforced at the center" — but note it
  renders could-not-check as *nothing* rather than as "couldn't verify",
  a silent variant the technique asks to be one notch louder.
- `suggestAlternativeName(base, taken)` (`:151-160`) feeds the amber "try X"
  suggestion line.

Reference consumer: `src/features/teams/sub_teamWorkspace/CreateTeamForm.tsx:69-91`
builds the `FieldAvailability` with caller-owned translated messages.

## The submit backstop, by hand: `CredentialEditForm.tsx`

`src/features/vault/sub_credentials/components/forms/CredentialEditForm.tsx`
implements the composite policy without `FormField`'s gate: a `touched` map,
blur validates and marks touched (`:114-125`), change revalidates **only if
already touched** (`:96-112`), and submit runs `validateAll` over the full
set while force-touching every field (`validate()`, `:127-132`) before
`onSave`/`onHealthcheck`/`onOAuthConsent` may proceed (`:134-136`). That is
the technique's table, hand-rolled correctly — and also a private copy of it
(its sibling `EditFormFields.tsx:54` even exports a hook that *shadows the
shared hook's name* with a different contract, plus hardcoded English
messages at `:58,:64,:67`).

## Deviations on file (measured, 2026-08-13 census)

- **`validateOn` and `forceValidation` have zero call sites outside the
  primitive's own folder.** The wild corpus is bimodal — every-keystroke red
  (`PersonaSettingsTab.tsx:109` recomputes `aria-invalid` per render) or
  nothing-until-the-backend-toast (`CreateTriggerForm.tsx:138`,
  `WebhookSubscriptionsPanel.tsx:179`) — the two failure modes the policy
  exists to prevent, at 100% market share.
- **Submit gates diverge from the error predicate** in ~70
  `disabled={!x.trim()}` sites; `CloudConnectionForm.tsx:121` gates Connect
  while ignoring the very `urlValidation.error` its field displays.
- `CreateTeamForm.tsx:189` submits regardless of `status === 'taken'` —
  defensible as "advisory tier stays advisory," except no backend uniqueness
  check exists, so the duplicate is simply created (the "enforced at the
  center" half is missing; filed against the backend, not this form).

Full census: `docs/concepts/golden-paths/form-field-and-validation.md`.

## Re-checked 2026-10-31 at personas@22260d77

- **`useFieldValidation` no longer uses a sequence stamp.** `seqRef` is gone.
  Each `onChange` now aborts the previous `AbortController` and mints a new
  one (`:42-60`), and a result is dropped when `signal.aborted` (`:76,:85`).
  This is the same supersession shape as `useAsyncFieldValidation`, retired
  on every keystroke rather than when the next debounce fires. `'validating'`
  is still entered immediately (`:69`). The "pin the result to the value
  asked about" reading still holds, in its stronger form.
- **`CreateTeamForm.tsx` no longer exists**, and nothing outside the forms
  folder now passes `availability=` or calls `useAsyncFieldValidation`. The
  reference consumer is gone, and so is the `:189` submits-while-taken
  deviation. The hook and its fail-open behaviour are unchanged
  (`:80-89,:109,:112-119,:128-134,:151-160` all hold).
- **`validateOn` / `forceValidation` now have call sites** outside the
  primitive's folder: `AddSiteModal.tsx:85` and `EditServerModal.tsx:114,131`
  (`forceValidation={touched}`), and `SitePolicyFields.tsx:68`,
  `EditServerModal.tsx:115,131` and `SetupTextField.tsx:86`
  (`validateOn="change"`). The "zero call sites" deviation no longer holds.
  The submit backstop now has adopters.
- **The two "nothing until the backend toast" examples moved.**
  `CreateTriggerForm.tsx` now marks the cron input `aria-invalid` (`:107`),
  shows a `role="alert"` message (`:110-112`) and gates Create on
  `cronInvalid` (`:147`). The webhook form now lives in
  `WebhookDraftForm.tsx`: Save is gated on a presence-only `valid` predicate
  (`:25-28`, `disabled` at `:103`) and the form shows no field error. That is
  still the silent-disable variant.
- `EditFormFields.tsx:54` still exports a `useFieldValidation` that shadows the
  shared hook's name, but its messages now come from the catalog
  (`t.vault.credential_forms.name_required`, `t.vault.auto_cred_extra.invalid_url`).
  The hardcoded-English half of that remark no longer holds.
