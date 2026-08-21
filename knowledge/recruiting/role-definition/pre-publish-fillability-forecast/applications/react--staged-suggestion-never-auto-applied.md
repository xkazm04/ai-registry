---
layer: application
type: application
subject: pre-publish-fillability-forecast
technique: staged-suggestion-never-auto-applied
stack: react
status: forged
verified_on: 2026-08-20
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
`jobsCoachApply.ts:18`), which is structurally incapable of mutating anything —
the write path remains the editor's own optimistic-concurrency save, with the
recruiter as its actor.

## The three stageable kinds, and the fourth that is missing

```ts
export type CoachEditKind = "language" | "education" | "mustHave";
```

`jobsCoachApply.ts:23`, immediately preceded by the comment that makes this
application worth writing:

> "Salary is deliberately absent: the matchable band is fixed to the grounded
> market analysis, so editing the JD wording can't move it — a salary row
> honestly carries no apply affordance."

This is the provenance-match rule enforced at the type level. The product-side
statement of the same rule is `docs/features/jobs/README.md:28`, "The salary
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

## The affordance is a component, so its absence is structural

`JobsCoachPanelLoosenList.tsx` renders one row per gate and one per must-have,
each ending in `<StageEditButton>` (`JobsCoachPanelStageEditButton.tsx`) whose
click calls `stageEdit(kind, value, delta)`. Two properties of that rendering
matter:

- **Every suggestion carries its counterfactual in the same row.** The `+N`
  badge sits beside the label and is passed into the stage call as `delta`, so
  the evidence and the action are never separated by a click.
- **The salary card is rendered by different code.** `JobsCoachPanel.tsx:148`
  renders it in its own branch with no `StageEditButton` in scope. The absent
  affordance cannot be reintroduced by editing a shared row template.

`StageEditButton` also takes `show={Boolean(jdSlug)}` — a role with no editable
job document gets no button at all, because there is nothing to stage into.

## Fail-closed serialisation

`buildCoachEditParam` (`jobsCoachApply.ts:66`) returns `null` rather than a
best-effort string on a bad kind, a slug failing `SLUG_RE`, or a requirement
value that is empty after cleaning; the header states the consequence, "A
malformed param stages nothing — fail-closed." `cleanValue` strips Unicode
control characters, collapses whitespace and caps at 80; `clampDelta` truncates
and bounds to `[0, 9999]`. The free-text `value` is serialised **last** so a
separator character inside a requirement name survives a parse — a detail worth
noting because the alternative is a suggestion that silently stages the wrong
requirement.

## The reduced-denominator disclosure

`jobsCoachPanelTypes.ts:27` types a `skipped` list on the coach payload with
the reason recorded in the comment:

> "candidates the CLI couldn't score (a malformed/partially-extracted profile).
> Surfaced so the recruiter sees the counts were computed over a reduced
> denominator."

`winnability_cli.py:74` populates it with `{id, label, reason}` per skipped
entry — recorded, not silently dropped — and `JobsCoachPanel.tsx:136` renders
the count when it is non-zero. The silenced salary verdict is disclosed the
same way, by rendering nothing: the card's condition at `:148` requires
`salary.belowMarket !== null`, so an unknown verdict cannot degrade into a
reassuring "not below market" badge.

## Deviations

- **Dismissal is not recorded.** The technique asks that a rejected suggestion
  be kept as the answer to "why is this requirement still here". A deep link
  that is never clicked leaves no trace, so the record of the decision does not
  exist.
- **Staleness is not bound.** The delta is serialised into the URL and can be
  opened later against a changed pool; nothing recomputes or expires it, so a
  banner can display a `+N` that no longer holds.
