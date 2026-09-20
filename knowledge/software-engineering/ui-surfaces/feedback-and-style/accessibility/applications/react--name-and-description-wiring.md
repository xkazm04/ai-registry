---
layer: application
type: application
subject: accessibility
technique: name-and-description-wiring
stack: react
status: forged
verified_on: 2026-09-20
verified_against: react@19
---

# Three naming chains in one tree, and what each one bought

*Verified against the project tree at `62c252dd` (Ascent, React 19.2.4 /
Next 16).*

This repo answers the technique's chain question three different ways
within the same application, and the three are worth reading together
because each is a defensible trade taken to a different place: a form
primitive that deletes the id plumbing, a hand-rolled field beside it
that wires the full described-by contract by hand, and a button whose
name is deliberately pinned while its visible text swaps. Two of the
three are the technique's preferred answer for the part they cover, and
each one drops a different half of the contract on the way.

## The plumbing-free primitive, and the name that absorbed its neighbours

`src/components/ui/Field.tsx` is the shared form row, and its header
states the choice outright: labels "associate IMPLICITLY (the control is
wrapped by its `<label>`) ... no id plumbing at the call site, and no
chance of a mismatched `htmlFor`" (`Field.tsx:17-18`). The wrapper is a
`<label>` by default and switches to a real `<fieldset>` with the label
rendered as its `<legend>` under `as="fieldset"` (`Field.tsx:58-63`,
through `Kicker`'s `as` prop at `Kicker.tsx:18`) — the group case, where
one `<label>` cannot wrap a set of controls. Both halves are pinned by
tests that query the *computed* relationship rather than the markup:
`getByLabelText` through the implicit association
(`Field.dom.test.tsx:14-23`) and `getByRole("group", { name })` for the
legend (`:50-57`). That is the technique's naming half, done properly,
and `CONTROL_CLASS` carries `focus-ring` on every control it skins
(`Field.tsx:27`).

The description half is where the trade lands. The hint (`Field.tsx:64`)
and the error (`:70`) are both rendered *inside* the wrapper, so in the
`as="label"` case both are inside the labeling element and both compute
into the control's accessible name. The file knows half of this and
writes it down — the hint "becomes part of the control's accessible name
('Company Optional')" (`Field.tsx:48-50`) — and recommends folding
one-word markers into the label instead. The error is the same mechanism
and is not mentioned: `<Field label="Your name" error="Required">`
(`PlanEnquiryFields.tsx:58`, `:69`) names its input "Your name" while
valid and "Your name Required" once it is not. The name rewrites itself
mid-task, and the string a voice-control user reads off the screen is no
longer the string that activates the control.

Nothing attaches the error to the control as a *description*: there is
no invalid marking and no described-by wire anywhere in the primitive,
because the implicit association was adopted precisely to avoid needing
identifiers. The comment beside the error explains only why it is not a
live region — "a form that marks the offending field AND announces the
same failure from its footer would fire two announcements for one error"
(`Field.tsx:66-69`), which is the correct instinct and the one the form
subject's aggregation rule also reaches — but not-a-live-region and
not-in-the-chain are different decisions, and only the first was taken
deliberately. The second is what the missing identifiers cost.

One structural note that is evidence the constraint was known: `Kicker`'s
own doc states that a form label "sits inside a `<label>` (phrasing
content only — a div there is invalid HTML)" and offers `span`/`legend`
for it (`Kicker.tsx:15-18`), while the hint and error two lines away are
`<p>` elements inside that same `<label>`.

The group case escapes all of this: under `as="fieldset"` the hint and
error sit inside the `<fieldset>` but outside the `<legend>`, so they
never join the group's name. The defect is specific to the wrapping
variant.

## The hand-rolled field beside it, wired the other way

`src/components/onboarding/OnboardingInvitePanel.tsx` does not use the
primitive. It is a bare `<input>` named by `aria-label`
(`:64`), and on failure it wires the contract the primitive cannot:
`aria-invalid` (`:65`), `aria-describedby="invite-error"` pointing at the
error node (`:66`, `:83`), and focus returned to the input so the reason
is voiced where the user now is (`:21-23`). Its comment says it is
mirroring "PickForm's error contract (the wizard's established
pattern)", so this is a house rule rather than one panel's idea, and
`OnboardingScanStep.dom.test.tsx:82-88` asserts all three — the two
attributes and `document.activeElement` — rather than that a red message
rendered.

Two things about that error node are worth recording rather than
copying. It is also `role="alert"` (`:83`), and it is mounted *carrying
its text* — `{inviteErr && <p role="alert">…}` — which is the arriving-
populated case this subject's live-region semantics warn about, rather
than a region that existed before the news. And it fires in the same
tick as a deliberate focus move onto a control whose description is that
same string, which is the double-announcement the form subject's
aggregation technique names explicitly: focus movement already
announces, so a live region repeating it is redundant at best and, where
the focus change preempts speech in progress, is one path quietly eating
the other.

The sharper defect is a repeat: the error is stored as a string
(`:43`), the focus move is an effect keyed on that string (`:21-23`),
and the alert re-announces only on a mutation. A second failure with an
identical message sets the same value, so the effect does not re-run,
the node does not change, and the user who retried hears **nothing at
all** — the exact silence this subject's re-announcement rule exists to
defeat, arriving through the error channel instead of the announcer.

So the repo holds two contracts for one concern: the catalog primitive
(name absorbs the error, no invalid marking, no alert) and the
hand-rolled near-primitive (full described-by contract, plus an alert
the aggregation rule does not want). Every call site of `Field` with an
`error` prop is outside the second one.

## A name pinned against its own visible swap

`src/components/CopyForLlm.tsx` is the transient-outcome case in its
cleanest form. The button's visible content swaps to "Copied" / "Copy
failed" / "Nothing to copy" on the last activation's result
(`:106`), while its accessible name is a fixed `aria-label` defaulting
to the idle label (`:102`). The comment names the consequence and the
fix in one sentence: "the button's accessible NAME is a fixed
aria-label, so its visible Copied / Copy-failed swap was invisible to
screen readers ... Announce the outcome through a dedicated polite live
region" (`:108-110`). The region (`:111-118`) renders empty at rest and
is mutated later, and `CopyForLlm.test.tsx` asserts the empty rest state
(`:24-27`) and each outcome string (`:36`, `:45`, `:66`) — the announcer
tested as output, not as an attribute.

This is the right branch of the fork: the name stays stable for voice
control and the outcome still reaches a non-visual user. Two costs the
implementation carries rather than solves:

- **The region is per instance, not per shell.** `CopyForLlm` is used
  at 16 non-test call sites, three of them inside per-row detail
  components — `SkillCardActions.tsx`, `MemoryCard.tsx` and
  `PlaybookCard.tsx`, mounted from the expanded row of
  `SkillsLibraryTable.tsx:137`, `MemoryList.tsx:75` and
  `PracticeDetailModal.tsx:48` — so the number of polite regions on a
  screen tracks the number of mounted instances rather than being one.
  Each is correct in isolation; the set is the scattered-region shape
  this subject's architecture exists to replace, and there is no one
  place that can answer what this product ever says.
- **A prompt second copy is silent.** The outcome is boolean state that
  auto-resets after 2000ms (`COPIED_RESET_MS`,
  `copy-for-llm.logic.ts:61`). A second successful copy inside that
  window sets an already-true flag, so neither the button text nor the
  region text changes, and the user who copied again — the user whose
  first paste did not land — receives no confirmation on either channel.
  Outside the window the reset to `""` supplies the mutation, so the
  repeat works by accident of the visual timer rather than by design.

The file's stated reason for not putting the live behaviour on the
button itself — "aria-live on the button itself is unreliable"
(`:109-110`) — is recorded here as the team's premise, not as a verified
one; nothing in this tree measures it, and the decision does not depend
on it, since the technique's rule against a control naming itself with
its own outcome reaches the same architecture without the claim.

## What this realization does not prove

- **No gate sees the absorbed name.** `Field.dom.test.tsx` asserts the
  label association, the hint/error render order (`:27-37`), the
  no-live-region rule (`:41-48`) and the group name — but never the
  control's *computed* name while an error is present, which is the one
  assertion that would have caught the absorption. The cheapest payment
  is one query: render the field with an error and assert the input's
  accessible name is still the label.
- **Nothing in the tree measures the divergence between the two field
  contracts.** Which call sites use the primitive and which hand-roll
  the described-by wiring is a fact about this commit, established by
  reading, and no lint or census holds it.
- **The reduced set.** This document covers naming and description
  only. Icon-only controls, decorative-graphic hiding and the
  translated-copy rule were not surveyed here.
