---
layer: application
type: application
subject: collective-and-statutory-hiring-governance
technique: advisory-machine-that-never-seals
stack: node
verified_on: 2026-08-20
---

# Two seal branches, two decision kinds (Node/TypeScript)

The advisory guarantee is enforced at exactly one place — the seal site in
`app/_lib/group-eval-run.ts` — and expressed as two mutually exclusive branches over
`sealsLead(governanceMode)`.

## The branch

```
if (lead && sealsLead(governanceMode)) {        // :637  kind: "group_eval_lead"
} else if (lead) {                              // :659  kind: "group_eval_advisory"
```

The advisory branch's comment states the doctrine at the point of enforcement: "the AI
is advisory and must NOT seal a winner. Record its ranking as an ADVISORY input so the
audit shows it informed — not made — the decision; the committee / eligibility
certification is the human's to seal" (`:660-662`).

Two properties are worth copying verbatim:

- **The kinds are genuinely distinct, all the way out.** `group_eval_lead` and
  `group_eval_advisory` are separate members of the decision-log kind enum
  (`app/features/insights/analytics/analyticsDecisionLogTypes.ts:223-224`), separate
  members of the candidate-visible allowlist (`app/_lib/status-decisions.ts:59-60`),
  and separate `reasonCode`s (`"lead"` vs `"advisory"`). This is the standard's rule
  that advisory and decisive are different *kinds*, not one kind with softer copy —
  and it is what lets `decision-attribution.ts:316` treat both as group-eval
  provenance while everything downstream can still tell which one happened.
- **The advisory record stamps the regime.** `policyVersion` becomes
  `${source}/${governanceMode}` (`:666`) and `governanceMode` also rides in `inputs`
  (`:672`), so a reader reconstructing the run sees the rules that were in force
  rather than inferring them from a date.

A third branch is implicit and correct: when there is no knockout-passing lead, neither
record is written (`:498`, `:637`), and `group-eval-cohort-run.test.ts:41-42` pins that
a single-candidate field seals *neither* kind.

## What rides in the sealed advisory record

Both branches carry the same `traceability` object (`:630-635`) — the reconstruction
shopping list the standard names, and the comment explains why each item is there:

> a record that says only "the AI led with X" is not reconstructible: an auditor cannot
> see WHICH prompt produced the ranking, nor what the model actually SAID about the
> candidate it crowned. Both were computed and then dropped on the floor. (`:618-621`)

So `promptVersion` (the reasoning prompts behind the cohort, `[]` when no model ran)
and `leadReasoning` (the model's own verdict, strengths and gaps, "VERBATIM and
clipped, never re-narrated by us") join the machine facts already in `inputs` (`:672`):
the honest `score` (null when unmeasured rather than a fabricated 0), the `confidence`
band, the `separation` verdict, the `robustness` status, `cohortSource`
(`"selection" | "top"`), the compared count and the full `cohortSize`. Clipping is
deliberate — six items, 400 characters (`:626-629`) — "a decision record is an audit
artifact, not a transcript store."

The language convention is the other reconstruction rule, stated at `:600-609`: the
sealed `rationale` is the English `deterministicSummary` "in every workspace, forever",
because the record is read by auditors, exported, and compared across tenants and across
time, so its wording must not depend on whichever org locale was configured when it ran.
The UI localizes from structured facts; the record does not move.

## Advisory does not mean thinner

The advisory run computes and publishes the full analysis: per-candidate scores and
bands, differentiators, risks, the recommended order, coverage bookkeeping, and
`leadSeparation` on the payload (`:753`) so the surface hedges a lead sitting inside the
confidence overlap instead of reading it as reassurance. The separation caveat is
appended to *every* governance mode that names a lead (`:586`) and rides into the
sealed rationale, which is the standard's rule that the hedge belongs wherever the crown
is stated.

The deterministic summary is genuinely mode-aware rather than re-worded: committee mode
says "Top by fit (advisory) … The search committee decides — the AI does not pick or
seal a hire" (`:576`), against the recommendation branch's "Recommended lead:" (`:579`).
The comment names the reason: in governed modes the summary "must NOT read as an AI
verdict … that's the very thing those modes reject" (`:537-538`).

## The deviation: the crown survives

`payload.topPick` (`:731`) is emitted in **all three modes** — an object literally named
the top pick, carrying the lead's label, identity, score and a `why` sentence — and
`eligibilityList` (`:707`) is *added* alongside it in list mode rather than replacing
it. The advisory record is also keyed `candidateRef: lead.entryId` (`:667`), so the
audit trail for an advisory run still points at one person.

The seal is correct and the artifact is not. The standard's rule holds: a downstream
consumer that reads `topPick` gets a crowned lead out of a process where no winner may
be named, and the first element of a list exposed as a recommendation becomes one.
Committee mode should publish the field with the separation stated and no singled-out
candidate; list mode should publish the ordinal list and refuse the `topPick` field
outright. The data to do both is already on the payload.
