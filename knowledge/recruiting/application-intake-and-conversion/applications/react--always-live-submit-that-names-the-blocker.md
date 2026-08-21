---
layer: application
type: application
subject: application-intake-and-conversion
technique: always-live-submit-that-names-the-blocker
stack: react
status: forged
---

# The one-screen quick-apply form: a submit that is never dead (React)

`app/apply/[id]/quick/QuickApplyForm.tsx` is the paid-traffic door — "everything
fits a phone held in a break room: two inputs, the job's knockout questions as
big yes/no toggles, one submit" (`:20-21`). It is also where the disabled-submit
regression was found and removed, and the removal is pinned as a test.

## The button is disabled only while a request is in flight

```tsx
<button
  type="submit"
  // Disabled ONLY while a POST is in flight. An incomplete form still
  // submits — and gets told what's missing (see `submit`).
  disabled={submitting}
```
(`:310-314`)

The comment on `firstMissingControlId` states the reasoning the standard
argues for, from the incident side (`:82-91`):

> The submit button no longer renders `disabled` on an incomplete form: a dead
> grey button on a paid-traffic mobile form is a silent leak (nothing names the
> blocking field, and a disabled control isn't even focusable to hint at one).

## Activation resolves one blocker, in visual order, and jumps to it

`firstMissingControlId` (`:90-96`) returns the first outstanding control as a
DOM id — name, then email, then the first knockout gate whose answer is still
`undefined` — or `null` when the form is complete. `submit` (`:97-110`) calls
it before anything else and, on a hit, raises a localized alert and moves the
candidate there:

```tsx
const missing = firstMissingControlId();
if (missing) {
  setIncompleteError(t("quick.incompleteHint"));
  const el = document.getElementById(missing);
  el?.focus();
  el?.scrollIntoView({ behavior: "smooth", block: "center" });
  return;
}
```

Both halves matter and the comment says why: "focus for keyboard/SR users,
scroll for everyone else — the KO gates can sit below the fold on a phone".
The hint renders as `role="alert"` (`:304-308`) and, per its comment, is
"raised only by an attempted submit on an incomplete form (never
pre-emptively)" — the cue "the dead disabled button never gave". The knockout
group's focus target is single-sourced as `koControlId` (`:18`) "so the render
and the 'jump to the first unanswered control' lookup can't drift".

## The client mirrors the server because the server is strict

The server treats an absent knockout answer as a fail —
`failedKoStepIds` in `app/_lib/apply-intake.ts:155` is documented as "the POST
body is a public, untrusted trust boundary — an ABSENT key is a fail, not a
pass, so a scripted POST can't skip work-authorization / mode / language
eligibility by simply omitting the keys". That strictness is only survivable
for real candidates because the form guarantees completeness first; the
comment at `QuickApplyForm.tsx:88-89` makes the dependency explicit ("which is
exactly why we never let it be POSTed").

The same single-sourcing covers the address check: `APPLY_EMAIL_RE`
(`apply-intake.ts:104`) is shared by "both client forms (conversational +
quick) and both server routes", because "the client accepts what the server
rejects → a 400 that wipes the conversation".

## Failure class only tunes the message, never the input

The form "keeps its state on any failure, so every error is recoverable by
editing + resubmitting (`isRetryableApplyStatus` only tunes the message
framing, never discards input)" (`:22-24`), and the retry-vs-restart contract
itself lives in one named predicate at `apply-intake.ts:143` — 5xx, 408 and
429 retryable; every other 4xx not, because "re-POSTing the identical payload
fails identically — an infinite 'Try again' dead-end".

## Pinned as source-contract tests

`app/apply/[id]/candidate-door-conversion.test.ts:64-73` asserts the whole
behaviour as an executable invariant: `disabled={submitting}` and *not*
`disabled={!ready}`, the presence of `firstMissingControlId`, the localized
hint, the `role="alert"` rendering, and both `focus()` and `scrollIntoView()`.
The file's header explains the choice of altitude (`:7-14`): these are
"conversion guards for the two CANDIDATE-facing doors … each pins a leak that
was live and is cheap to silently regress in a restyle/refactor", written as
source-contract assertions because the unit runner has no DOM renderer.

A deviation worth naming: the conversational door does not have this
property in the same form. Its failure recovery is a restart or a re-POST of
already-collected answers, not an in-place resolve of a named blocking control
— the standard's rule applies to both doors, and only one has it pinned.
