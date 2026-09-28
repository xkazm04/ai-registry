---
layer: application
type: application
subject: templates-scaffolding
technique: adoption-lifecycle
stack: react
status: forged
verified_on: 2026-09-23
verified_against: react@19
---

# The interview's upstream edge, two fixes and one open key

*Checked against the project tree at `f05c1759f` (react 19.2.6 installed).
This is a read-only pass: nothing was built or run.*

Three of the technique's rules show up in the template adoption frontend.
Two were broken on 2026-08-29 and fixed on 2026-09-17, and each fix is
worth reading for what it kept. The third is still open.

## An escape hatch that defaulted open (fixed, `c42eb7baa6`)

`src/features/templates/sub_generated/adoption/SelectPills.tsx:33` used to
default `allowCustom` to `true`, and
`QuestionnaireFormGridParts.tsx:447` passes `question.allow_custom`, which
is undefined on most questions. So every closed option list grew an
"Other…" pill, and the interview stored answers the parameter surface never
declared. The fix flips the default to `false`. The doc comment at
`SelectPills.tsx:40-47` gives the reasoning the technique now states: an
authored option list is closed, and a missing flag means "no escape hatch".
It also notes that `questionnaireHelpers.isStackable` already read the flag
that way. So two readers of one flag had disagreed about what "absent"
meant.

One residual: with the hatch closed, an off-list value that *arrives* in
the answer "is ignored rather than rendered as a custom pill"
(`SelectPills.tsx:44-46`). A stored value outside the options is now
invisible in the picker rather than visible as custom. That is the
template-anatomy defect (a value no screen shows) moved from the options
to the display. It is harmless only if something upstream guarantees an
off-list value never arrives.

## A picker narrower than the value it edits (fixed for no-op, `47a9217969`)

Adoption has an `hourly` time preset. The schedule composer's vocabulary is
daily / weekly / monthly. `triggerSelectionToComposerSchedule`
(`adoption/persona-layout/composerScheduleToTriggerSelection.ts:89-101`)
projects hourly onto "daily at the kept hour", and the forward map used to
re-seed that daily. So opening the When picker on an hourly template and
pressing Apply with no changes rewrote the declared trigger. The fix
(`:51-60`) is a round-trip equality guard: if the picker returns exactly
what the reverse map produced, the existing selection stands. That is the
GetPut law, and the commit adds a round-trip test
(`persona-layout/__tests__/composerScheduleRoundTrip.test.ts`).

The commit message states what the fix left open. Exposing Hourly in the
composer would mean widening a `Frequency` union shared with other
surfaces, so the picker **still displays Daily** for an hourly trigger. A
real edit to the hour on an hourly trigger goes through the forward map
and comes out daily. The frequency the adopter never touched gets
re-derived from the field they did touch. The technique's preferred fix
(cover the template's vocabulary) was scoped out, and the fallback half
("this value can't be shown here") was not built.

## Resuming an in-flight adoption by display name (open)

`gallery/cards/GeneratedReviewsTab.tsx:140-150`: the "adoption in progress"
banner (`gallery/explore/BackgroundBanners.tsx:106-110`, shown while
`templateAdoptActive` is true, which `adoption/ChronologyAdoptionView.tsx:1149`
sets) resumes by reading `templateName` from the localStorage key
`template-adopt-context-v1` and matching it against
`PersonaDesignReview.test_case_name`, the display name. Its sibling
`handleResumeDraft` (`:152-156`) keys on `draft.reviewId`, which is correct.

Two things are wrong, and the second is new since the 2026-08-29 verdict.
First, the key is the display name. Second, a search of `src/` and
`src-tauri/src/` finds no writer for `template-adopt-context-v1`. The key
is only ever read (`GeneratedReviewsTab.tsx:142`,
`useAdoptionCompletionNotifier.ts:49`) and removed (`:42`), and the
notifier's own comment calls it "legacy wizard". So the resume button can
only act on a value left over from an older build. On a fresh install it
logs "Template not found" and does nothing. The completion notifier that
reads the same key never fires either. The fix is to key the resume on the
review id the adoption view already holds, and to write it where
`setTemplateAdoptActive(true)` is called.

## What this does not show

- No part of this was run. The verdicts come from reading the code and
  commits, with the two fixed cases resting on their own tests.
- The GetPut residual (an hour edit re-deriving the frequency) is inferred
  from the forward map at `:62` onward. No test observed it.
