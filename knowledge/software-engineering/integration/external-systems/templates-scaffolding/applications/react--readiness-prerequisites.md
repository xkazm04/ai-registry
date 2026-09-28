---
layer: application
type: application
subject: templates-scaffolding
technique: readiness-prerequisites
stack: react
verified_on: 2026-09-23
verified_against: react@19
applied: experiment
ab_verdict: better
---

# Readiness prerequisites in the template adoption frontend

*Re-checked against the project tree at `f05c1759f` (react 19.2.6
installed). First written 2026-08-18. Since then the dimension model moved
under `adoption/persona-layout/` and the matcher's line numbers shifted.
Both are re-cited below.*

The matcher and the two render points live in
`vaultAdoptionMatcher.ts` (the matcher), `adoptionReadiness.ts` (the
browse-time score) and `persona-layout/useAdoptionDimensionModel.tsx` (the
pre-commit gate). The repo does the standard well and bends its "one
evaluator, two render points" rule, and since the first pass it has bent
it a third way.

## The matcher: block / auto-select / filter, decided per question

`src/features/templates/sub_generated/shared/vaultAdoptionMatcher.ts`:
`matchVaultToQuestions` (`:171-246`) walks the template's adoption
questions against the vault's credential `service_type`s and produces
`autoAnswers`, `autoDetectedIds`, `blockedQuestionIds` and
`filteredOptions`. The policy matrix is documented in place (`:140-169`)
and is a three-way verdict:

- **0 matches, no fallback → block** (`:232-234`): the question goes into
  `blockedQuestionIds`, which lights the "credentials required" banner and
  the remedy path.
- **1 match, no fallback → auto-select and tag** (`:235-238`): the adopter
  confirms instead of hunting.
- **2+ matches → narrow to matched-only** (`:239-241`). With a null
  "Other/custom" fallback the list narrows to matched+Other and never
  blocks (`:221-231`), because the escape hatch is a legitimate answer.
- **Dynamic-source questions** (`:186-203`) get the same up-front
  credential check, so the banner lights even though their options only
  arrive at render time. Optional ones skip it (`:197`).

The rationale at `:159-163` states the technique's argument in the repo's
own words: unfiltered, the credential annotations are "pure decoration.
Filtering is the whole point."

Two details are worth transplanting:

- **Alias-aware matching** (`SERVICE_TYPE_ALIASES`, `:28-37`): one logical
  provider is stored under different `service_type` spellings depending on
  which creator path minted the credential (enumerated at `:17-21`). That
  is a one-authority-per-vocabulary violation upstream, compensated at the
  single point of consumption, and the comment names the maintenance
  contract ("add to this map whenever a new creator path introduces a
  different spelling").
- **Capability-level matching** (`hasMatchingCredential`, `:56-67`): a slot
  typed by category is satisfied by any credential whose connector carries
  that category tag. It matches on role, not name.

`deriveCredentialBindings` (`:99-137`) is the adoption-time resolution the
verdict promises: answers become a `category → service_type` map so the
backend rewrites placeholder connectors to the adopter's concrete pick.

## The pre-commit gate

`adoption/persona-layout/useAdoptionDimensionModel.tsx` computes
`globalRemaining` / `globalBlocked` over the gated (non-optional,
non-disabled) questions, and `canContinue` requires both to be zero
(`:324-326`). The refusal is named: `continueDisabledReason` (`:454-458`)
says how many are blocked or unanswered, the center overlay
(`:466-478`) jumps to the first gap through `openFirstUnanswered`
(`:337`), and `onAddCredential` is threaded into the answer card as the
remedy (`:436`).

## The browse-time score: now three evaluators

`shared/adoptionReadiness.ts` computes a 0–100 score per card from
`design_result.suggested_connectors[].category` (optional ones skipped,
`:25`), matched at category level. `readinessTier` (`:74-78`) maps it to
Ready / Partial / Setup needed. That score, not the gate, drives three
surfaces in `gallery/cards/useGalleryActions.ts`: the sort
(`isReadinessSort`, `:63`, labelled **"Ready to Deploy"** at
`gallery/search/filters/searchConstants.ts:134`), the "full" coverage
filter (`:137`), and the ready/partial counts (`:88-99`).

It is still **not the same evaluator as the gate**. The score reasons over
`suggested_connectors` categories. The gate reasons over per-question
`option_service_types` and `dynamic_source`. Since the first pass, the
same hook has also added a third evaluator: `useConnectorReadiness`
(`:44-61`), "resolved by the same Rust resolver that gates execution". It
feeds the per-card connector chips and the comparison view, but not the
score, sort or filter. So a card can show connector chips from the
execution resolver, a badge and sort position from the category score,
and still be blocked by the matcher.

Three further below-standard details:

- **An unreadable template scores as ready.** `getRequiredConnectorCategories`
  returns `null` on a parse failure (`:31-33`). The caller then takes the
  fallback path and returns 100 when `connectors_used` is empty
  (`:64-66`). So "could not read the requirements" and "has no
  requirements" come out the same.
- **The label promises the gate's verdict** ("Ready to Deploy") while
  answering a different question. Even with one evaluator, a browse render
  runs before the interview and would need to say which question it asked.
- `readinessTier` hardcodes English labels in a codebase whose i18n rule
  bans exactly that, and returns raw `emerald`/`amber` utility classes
  instead of semantic tokens.

## A readiness probe that reaches nothing (unmounted)

`adoption/ucPicker/useUcPickerState.ts:241-253` runs the picker's delivery
Test through `mockTestDelivery`, imported from
`adoption/MessagingPickerShared.tsx:152`. That file's header (`:1-12`)
calls it a visual-review prototype that is "Not imported by the production
adoption flow yet", with a checklist that ends in wiring the Test button to
a real delivery IPC. The step's only export, `UseCasePickerStep`
(`ucPicker/index.ts:5`), has no importer outside its own folder and one
test, and that was already true at the 2026-08-29 verdict. So no adopter
can reach the mocked success mark today. It is the technique's
probe-reaches-target rule, waiting for whoever mounts the step.

## What the seed path proves

The built-in catalog is seeded with defaults applied and no interview,
the most automated pass through this machinery. That is why the matcher
treats a question with declared credential options but no vault match as
*blocked* rather than silently answered. An unattended answer to an
unsatisfiable question is exactly the born-broken instance the technique
exists to prevent.

## Applied 2026-09-23 - gate reach and the browse badge, read-only experiments

**The gate's reach (`better`).** The adoption gate ran over the 38 published templates:
27 carry a credential-gated question, 63 in all. An empty vault blocks 63 of 63; a present
credential clears 63 of 63; a present credential whose health check failed turns the gate
red 0 of 63, because the gate's only input is a set of service types. The run-time half
exists and reads live usability (fields present, last check not failed, success newer than
the last field edit). The refinement written into the technique: a presence-only gate also
passes a credential already failed at adoption, so the adoption gate should read the
run-time predicate. Also found: 13 of the 63 blocked questions carry a template default
that answers them, so the gate lets them through with no credential.

**The browse badge (`better`).** Badge and gate over the 38 templates on the default path:
with an empty vault 5 cards read Ready and 2 of those are blocked by the gate; with a vault
built to make every badge read Ready, 38 read Ready and 4 are blocked. The safe direction
also shows: 12 of the 33 not-Ready cards would pass the gate with an empty vault. Badge and
gate read two different category vocabularies - the badge a primary-category map in which
messaging always counts as ready, the gate each connector's own category tags - and the
gallery's readiness sort and filter inherit the badge.
