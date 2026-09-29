---
layer: application
type: application
subject: pre-publish-fillability-forecast
technique: staged-suggestion-never-auto-applied
stack: react
status: forged
verified_on: 2026-09-29
verified_against: react@19
---

# Staging a coach recommendation through a deep link, and the row that has no button

The coach's recommendations reach the recruiter as a deep link into the job
editor with a change pre-staged — never as a write. The grammar lives in
`app/features/library/jobs/jobsCoachApply.ts`, whose header states the boundary
in its first paragraph:

> "The coach itself stays deliberately read-only (it never mutates the job);
> this only pre-stages a SUGGESTION in the editor the recruiter already trusts —
> nothing is auto-saved."

and, four lines later, what the link's authority is worth:

> "The value is weak-trust: it only pre-selects a JD row and paints a suggestion
> banner. The recruiter still edits the free-text JD body themselves and saves
> through the editor's existing CAS/conflict path."

That is the technique's staging rule realised as a *transport* decision. The
suggestion travels as a query parameter (`COACH_EDIT_PARAM = "coachEdit"`,
`jobsCoachApply.ts`), which is structurally incapable of mutating anything —
the write path remains the editor's own optimistic-concurrency save, with the
recruiter as its actor.

## The three stageable kinds, and the fourth that is missing

```ts
export type CoachEditKind = "language" | "education" | "mustHave";
```

`jobsCoachApply.ts`, immediately preceded by the comment that makes this
application worth writing:

> "Salary is deliberately absent: the matchable band is fixed to the grounded
> market analysis, so editing the JD wording can't move it — a salary row
> honestly carries no apply affordance."

This is the provenance-match rule enforced at the type level. The product-side
statement of the same rule is the "The salary band is AI-fixed, not editable" section of `docs/features/jobs/README.md`, "The salary
band is AI-fixed, not editable": the band produced by the market analysis
carries "its own provenance (`web-grounded` vs `estimated`), a confidence
level, and cited sources", and is read-only in the builder because "a
hand-typed number couldn't honestly wear the 'web-grounded · high confidence ·
[sources]' label". Editing the salary line in the markdown "changes the
published wording, not the matchable band, and the salary card says so
explicitly."

So the missing fourth kind is not an omission — it is the feature, and it is
documented as such on both sides of the stack so the next person does not
"fix" it.

## The affordance moved from a component to a flag on the row

The first version of this application, written against the pre-September panel,
made the structural claim in its strongest form: a salary card rendered by its
own code, "so the absent affordance cannot be reintroduced by editing a shared
row template". That is no longer true, and the claim it supported has to be
restated rather than kept. The 2026-09 Coach redesign (kp `b894fc824`) replaced
the loosen list, the stage-edit button and the salary card with one **ledger of
patterns** (`CoachLedger`): a row per lever, all of them rendered by the same
template, with the salary verdict as one more row.

What holds the line now is data, in two places:

- `RolePattern.editable`. `derivePatterns` sets it `true` for gates and skills
  and `false` for the salary row, with the reason in the type comment: "the
  matchable band is fixed to the grounded market analysis, so editing the JD's
  wording can't move it". The row's one icon action renders only
  `onEdit && p.editable`.
- `CoachEditKind = "language" | "education" | "mustHave"`. A salary row could not
  be serialised even if the flag were flipped, because `buildCoachEditParam`
  fails closed on any other kind.

That is weaker than a separate code path and stronger than wording: a future
row kind defaults to whatever `derivePatterns` says, and the type and the
grammar both have to agree before a link exists. The technique's rule is
"structural rather than a matter of wording", and a typed flag plus a closed
grammar meets it; the lesson worth carrying is that a redesign which merges
render paths moves the guarantee into the data model, and the tests
(`rolePatterns.test.ts`, `jobsCoachApply.test.ts`) are then where it is pinned.

Two properties of the row hold across the redesign. **The evidence and the
action stay in the row**: the count (`affected` over its stated `denominator`)
and the counterfactual `gain` sit beside the action, and the denominator is
stated per row because it differs by kind (a gate over the whole pool, a missing
skill over the candidates who already clear the gates). **No job document, no
button**: `onEdit` is `null` unless `jdSlugOfJobId(jobId)` yields a slug, so a
seeded corpus role gets rows and no action.

## A durable weight is not a recorded dismissal

The technique asks that a rejected suggestion be kept as the answer to "why is
this requirement still here". The redesign added something adjacent and easy to
mistake for it: each row carries a three-notch priority (`critical`,
`important`, `minor`), stored per (role, team) and re-applied on every visit, so
the recruiter's weighing of a finding survives. It records a judgment about the
*pattern*, not a decision about the *suggestion*: an untagged row is "not yet
judged", a `minor` row is "judged and light", and neither says "I looked at
loosening this and chose not to". Today the weight only orders the ledger.

## Fail-closed serialisation

`buildCoachEditParam` (`jobsCoachApply.ts`) returns `null` rather than a
best-effort string on a bad kind, a slug failing `SLUG_RE`, or a requirement
value that is empty after cleaning; the header states the consequence, "A
malformed param stages nothing — fail-closed." `cleanValue` strips Unicode
control characters, collapses whitespace and caps at 80; `clampDelta` truncates
and bounds to `[0, 9999]`. The free-text `value` is serialised **last** so a
separator character inside a requirement name survives a parse — a detail worth
noting because the alternative is a suggestion that silently stages the wrong
requirement.

## The reduced-denominator disclosure

`winnabilityTypes.ts` (formerly `jobsCoachPanelTypes.ts`) types a `skipped` list on the coach payload with
the reason recorded in the comment:

> "candidates the CLI couldn't score (a malformed/partially-extracted profile).
> Surfaced so the recruiter sees the counts were computed over a reduced
> denominator."

`winnability_cli.py` populates it with `{id, label, reason}` per skipped
entry — recorded, not silently dropped — and `JobsCoachPanel.tsx` renders
the count when it is non-zero (the count only: the wire carries the label and
the raw validation reason, the surface does not). The silenced salary verdict is disclosed the
same way, by rendering nothing: `derivePatterns` emits the salary row only for
`belowMarket === true`, so an unknown verdict cannot degrade into a reassuring
"not below market" badge. That is also its limit: the technique asks that the
third state get its own sentence, and this surface gives it none.

## Deviations

- **Dismissal is not recorded.** The technique asks that a rejected suggestion
  be kept as the answer to "why is this requirement still here". A deep link
  that is never clicked leaves no trace, and the priority dial (above) records
  a weight on the pattern, not the decision about the suggestion, so the record
  of the decision does not exist.
- **Staleness is not bound.** The delta is serialised into the URL and can be
  opened later against a changed pool; nothing recomputes or expires it, so a
  banner can display a `+N` that no longer holds.
- **The skipped list is wider on the wire than on the screen.** `skipped` carries
  each unreadable candidate's label and the raw validation message, and the
  route returns it whole, though the panel renders only the count. The count is
  the disclosure the golden path asks for; the names and the message text are
  candidate data the surface does not need and a network reader receives.
