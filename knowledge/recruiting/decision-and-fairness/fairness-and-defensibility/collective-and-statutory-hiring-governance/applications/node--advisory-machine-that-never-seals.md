---
layer: application
type: application
subject: collective-and-statutory-hiring-governance
technique: advisory-machine-that-never-seals
stack: node
verified_on: 2026-09-28
verified_against: node@24
applied: code
ab_verdict: better
---

# Two seal branches, two decision kinds (Node/TypeScript)

The advisory guarantee is enforced at exactly one place — the seal site in
`app/_lib/group-eval-run.ts` — and expressed as two mutually exclusive branches over
`sealsLead(governanceMode)`. Re-read at `8f3c89560` (2026-09-28): the seal site moved
about 214 lines down as the run grew consent exclusion, stage deadlines and a
compare-and-swap persist, and every quote below is still verbatim.

## The branch

```
if (lead && sealsLead(governanceMode)) {        // :851  kind: "group_eval_lead"
} else if (lead) {                              // :873  kind: "group_eval_advisory"
```

The advisory branch's comment states the doctrine at the point of enforcement: "the AI
is advisory and must NOT seal a winner. Record its ranking as an ADVISORY input so the
audit shows it informed — not made — the decision; the committee / eligibility
certification is the human's to seal" (`:874-876`).

Two properties are worth copying verbatim:

- **The kinds are genuinely distinct, all the way out.** `group_eval_lead` and
  `group_eval_advisory` are separate members of the decision-log kind enum
  (`app/features/insights/analytics/analyticsDecisionLogTypes.ts:234-235`), separate
  members of the candidate-visible allowlist (`app/_lib/status-decisions.ts:94-95`),
  and separate `reasonCode`s (`"lead"` vs `"advisory"`). This is the standard's rule
  that advisory and decisive are different *kinds*, not one kind with softer copy —
  and it is what lets `app/_lib/decision-attribution.ts:346` treat both as group-eval
  provenance while everything downstream can still tell which one happened.
  The candidate's status page then maps both kinds onto one neutral label
  (`app/status/[token]/StatusClient.tsx:199-200`, "Application compared within the
  candidate group for this role"). That is the right collapse in the right place: the
  record keeps the distinction, and a candidate in a committee process is never told
  they were the machine's lead.
- **The advisory record stamps the regime.** `policyVersion` becomes
  `${source}/${governanceMode}` (`:880`) and `governanceMode` also rides in `inputs`
  (`:886`), so a reader reconstructing the run sees the rules that were in force
  rather than inferring them from a date.

A third branch is implicit and correct: when there is no knockout-passing lead, neither
record is written — `const lead = comparable && top && top.koPassed !== false ? top :
null` (`:685`, comment `:680-684`) — and `group-eval-cohort-run.test.ts:41-42` pins that
a single-candidate field seals *neither* kind.

## What rides in the sealed advisory record

Both branches carry the same `traceability` object (`:844-849`) — the reconstruction
shopping list the standard names, and the comment explains why each item is there:

> a record that says only "the AI led with X" is not reconstructible: an auditor cannot
> see WHICH prompt produced the ranking, nor what the model actually SAID about the
> candidate it crowned. Both were computed and then dropped on the floor. (`:832-835`)

So `promptVersion` (the reasoning prompts behind the cohort, `[]` when no model ran)
and `leadReasoning` (the model's own verdict, strengths and gaps, "VERBATIM and
clipped, never re-narrated by us") join the machine facts already in `inputs` (`:886`):
the honest `score` (null when unmeasured rather than a fabricated 0), the `confidence`
band, the `separation` verdict, the `robustness` status, `cohortSource`
(`"selection" | "top"`), the compared count and the full `cohortSize`. Clipping is
deliberate — six items, 400 characters (`:840-843`) — "a decision record is an audit
artifact, not a transcript store."

The language convention is the other reconstruction rule, stated at `:814-823` and
unchanged since it was written: the sealed `rationale` "stays the ENGLISH
`deterministicSummary`, in every workspace, forever", and "Do NOT "fix" this by feeding
a localized string into sealDecisionSafe" (`:823`). Two September commits localized the
*comparison narrative* on the payload (`--lang` at `:338`, the persisted
`comparisonLang` at `:1018`), and neither reaches the seal.

The one verbatim quote in the record, `leadReasoning`, is English too, but by default
rather than by statement: the per-candidate reasoning call passes no `lang`
(`runReasoning({ jobId, profileId: c.candidateId }, …)`, `:591`) and
`app/_lib/reasoning-run.ts` falls back to `"en"`. Nothing pins it. A later change that
threads the team's locale into that call — the same change `:338` made for the
narrative — would seal a Czech quote beside an English rationale with no language stamp
on it. A verbatim quote cannot be re-composed at render time, so if it ever varies it
must carry its language; a test on the call's argument is the cheaper guard.

**Deviation (new at this reading).** Consent exclusion (`:400-418`, since 2026-09-04)
removes anonymized and consent-expired candidates before the cohort is formed, and
fails closed. The payload discloses the counts (`consentExcluded`, `:943-950`) and the
modal shows them. The sealed record does not: its `cohortSize: totalCandidates`
(`:871`, `:886`) is the count *after* exclusion (`:422`), so an auditor reads the
compared field as the whole field. The same holds for `degradedStages` (`:1025`), which
is persisted on the payload and absent from the seal. The advice a committee was given
was advice over a smaller field than applied, and the record should say so.

## Advisory does not mean thinner

The advisory run computes and publishes the full analysis: per-candidate scores and
bands, differentiators, risks, the recommended order, coverage bookkeeping, and
`leadSeparation` on the payload (`:983`) so the surface hedges a lead sitting inside the
confidence overlap instead of reading it as reassurance. The separation caveat is
appended to *every* governance mode that names a lead (`:800`) and rides into the
sealed rationale, which is the standard's rule that the hedge belongs wherever the crown
is stated.

The deterministic summary is genuinely mode-aware rather than re-worded: committee mode
says "Top by fit (advisory) … The search committee decides — the AI does not pick or
seal a hire" (`:790`), against the recommendation branch's "Recommended lead:" (`:793`).
The comment names the reason: in governed modes the summary "must NOT read as an AI
verdict … that's the very thing those modes reject" (`:746-747`).

## The deviation: the crown survives, and it is now on screen

`payload.topPick` (`:961`) is emitted in **all three modes**, gated only on `lead` — an
object literally named the top pick, carrying the lead's label, identity, score and a
`why` sentence — and `eligibilityList` (`:921`) is *added* alongside it in list mode
rather than replacing it. The advisory record is also keyed `candidateRef:
lead.entryId` (`:881`), so the audit trail for an advisory run still points at one
person.

At the first reading this was a latent payload defect. At `8f3c89560` it renders. The
modal passes `hasLead={evaluation.topPick != null}` to the comparison table
(`GroupEvalModal.tsx:171`), which draws a crown pill labelled "Lead" on column one
(`GroupEvalComparisonTable.tsx:41-50`); the compact view heads the same object
"Recommended lead" (`GroupEvalLegacyView.tsx:20-26`, `en.json:4471`); the per-candidate
tabs attach "Unique strengths" to it. None of the three files reads the governance
mode. In committee mode the recruiter therefore sees the banner "the AI comparison is
ADVISORY input … it does not pick or seal a hire" directly above a crowned column —
advisory in the copy, decisive in the artifact, which is the failure mode the golden
path names. The API route returns the raw payload (`app/api/decisions/group-eval/route.ts:30`),
so any integration reads `topPick` the same way.

The seal is correct and the artifact is not. Committee mode should publish the ordering
with the separation stated and no singled-out candidate; list mode should publish the
ordinal list and refuse the `topPick` field outright. The data to do both is already on
the payload, and the fix is one predicate — `sealsLead(governanceMode)` — at the
`topPick` construction and at `hasLead`.

## Applied: the table crown reads the seal's predicate (`aa43bceb0`)

The on-screen half was applied in code by this pass. The modal now passes
`hasLead={evaluation.topPick != null && sealsLead(normalizeGovernanceMode(evaluation.governanceMode))}`,
so the crown on column one appears only where the seal would crown a lead, and a
payload saved before governance existed normalizes to `recommendation` and keeps
it. `groupEvalComparisonLeadCrown.test.ts` pins it in source, in the file's own
idiom (the table has no unit seam). The new assertion fails against the previous
modal and passes after; 16 of 16 green, `tsc --noEmit` clean. Before: in committee
and list mode the crown drew on every run with a lead. After: on none. In
recommendation mode, unchanged. **Better**, at code.

What remains open is the part a component change cannot reach without touching the
message catalogues, which carried another session's uncommitted edits at this
reading:

- the compact view's "Recommended lead" heading (`GroupEvalLegacyView.tsx:20-26`),
  which renders for payloads without the enriched comparison;
- `topPick` on the payload and the API response in governed modes;
- `candidateRef: lead.entryId` on the advisory record.

The first needs a governed-mode label ("Top by fit (advisory)" already exists as
summary prose, not as a heading key). The second and third are server changes to
make with the payload's consumers in view.
