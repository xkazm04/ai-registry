---
layer: application
type: application
subject: application-intake-and-conversion
technique: always-live-submit-that-names-the-blocker
stack: react
status: forged
verified_on: 2026-09-26
verified_against: react@19
applied: simulation
ab_verdict: better
---

# The one-screen quick-apply form: a submit that is never dead (React)

`app/apply/[id]/quick/QuickApplyForm.tsx` is the paid-traffic door. It holds
two inputs, the job's knockout questions as big yes/no toggles, and one submit.
It is also where the disabled-submit regression was found and removed, and the
removal is pinned as a test.

## The button is disabled only while a request is in flight

```tsx
<button
  type="submit"
  // Disabled ONLY while a POST is in flight. An incomplete form still
  // submits — and gets told what's missing (see `submit`).
  disabled={submitting}
```
(`:384-388`)

The comment on `firstMissingControlId` states the reasoning the standard
argues for, from the incident side (`:108-116`):

> The submit button no longer renders `disabled` on an incomplete form: a dead
> grey button on a paid-traffic mobile form is a silent leak (nothing names the
> blocking field, and a disabled control isn't even focusable to hint at one).

## Activation resolves the first blocker, in visual order, and jumps to it

`firstMissingControlId` (`:117-122`) returns the first outstanding control as a
DOM id — name, then email, then the first knockout gate whose answer is still
`undefined` — or `null` when the form is complete. `submit` (`:124-135`) calls
it before anything else. On a hit it raises a localized alert and hands the id
to one jump helper:

```tsx
const missing = firstMissingControlId();
if (missing) {
  setIncompleteError(t("quick.incompleteHint"));
  jumpTo(missing);
  return;
}
```

`jumpTo` (`:67-71`) focuses the control and scrolls it into view, and honours
reduced motion (`behavior: reducedMotion ? "auto" : "smooth"`). The reason
for doing both is in the comment at `:128-129`: "focus for keyboard/SR users,
scroll for everyone else — the KO gates can sit below the fold on a phone". The
hint renders as `role="alert"` (`:379`). The knockout group's focus target is
single-sourced as `koControlId` (`:21`), so the render and the jump cannot
drift.

## The first-blocker rule, measured against the summary rule

The technique now leads with a linked summary of every blocker, and keeps
first-blocker-only as the condition for a one-screen form of two or three
controls. This form is that condition, with one exception: the knockout list
is as long as the job's gates. Walked on the form's own controls:

1. **Name empty, the rest filled.** A single blocker. The summary rule and the
   form do the same thing.
2. **Everything empty on a job with three gates.** The form needs five
   submit-and-jump rounds: name, email, then each gate. The hint ("Almost
   there. Please answer everything above. We've taken you to the first item
   that's still missing.") asks for everything but never says how many
   items remain. A summary names all five in one round.
3. **A server `field` refusal** (an address the server rejects). The quick
   form shows the refusal's message but deliberately does not use the named
   field (`:172-174`, "`fixStepId` is not used here; only its MESSAGE is"),
   so nothing is focused or marked. The summary rule lists it against its
   field.

The summary rule wins in cases 2 and 3 and ties in case 1. Neither case
reverses the always-live rule this form exists to pin.

Two accessibility gaps sit beside the gate case:

- The hint is attached by `aria-describedby` from the name field (`:303`) and
  the submit (`:389`) only. The email field and the knockout groups never
  reference it.
- No missing field is marked invalid in the accessibility tree.

## The client mirrors the server because the server is strict

The server treats an absent knockout answer as a fail. `failedKoStepIds`
(`app/_lib/apply-intake.ts:143`) is documented as "the POST body is a public,
untrusted trust boundary — an ABSENT key is a fail, not a pass". That
strictness is survivable for real candidates only because the form guarantees
completeness first, and `QuickApplyForm.tsx:116` says so: "which is exactly
why we never let it be POSTed". The address check is single-sourced too.
`APPLY_EMAIL_RE` (`apply-intake.ts:105`) is shared by both client forms and
both server routes.

## Failure class only tunes the message, never the input

The form keeps its state on any failure. `isRetryableApplyStatus`
(`apply-intake.ts:131`) holds the retry-versus-correct contract in one named
predicate: 5xx, 408 and 429 are retryable, and every other 4xx is not, because
"re-POSTing the identical payload fails identically".

While the POST is in flight the inputs, toggles and button all carry native
`disabled` (`:304`, `:324`, `:352`, `:388`), so focus leaves the button when
it is pressed. After a failed POST nothing moves focus back. The `role="alert"`
error (`:371`) is announced, but a keyboard user is left wherever focus fell.

## Pinned as source-contract tests

`app/apply/[id]/candidate-door-conversion.test.ts:158-172` asserts the
behaviour as an executable invariant: `disabled={submitting}` and *not*
`disabled={!ready}`, the jump helper (`:171`), the localized hint, and the
alert. The file's header explains the altitude: these are conversion guards
for the candidate-facing doors, written as source-contract assertions because
the unit runner has no DOM renderer.

## The conversational door has the property in its own form

The first version of this application (2026-08-20) recorded that the
conversational door had only restart or re-POST. It now has a third path:

- **A field-named re-ask.** `app/apply/[id]/apply-submit-outcome.ts:18-25`
  sets the order: can a re-POST help, and if not, what can the candidate fix?
  A validation 400 names the step, and "the door re-asks THAT question with
  the typed answer still in the box — the step is repairable, not a restart".
  `beginFix` (`ConversationalApply.tsx:294`) drives it, pinned by
  `apply-submit-outcome.test.ts`.
- **No button to disable.** The step machine cannot submit an incomplete
  script, so there is no submit button to keep live.

What is still restart-only on that door is the knockout decline, which belongs
to the recoverable-decline technique.
