---
layer: application
type: application
subject: decision-audit-and-traceability
technique: structured-facts-plus-a-locale-invariant-audit-string
stack: process
---

# "The record is canonical English, the UI localizes" as a written convention

This repo runs in four locales and seals decisions into an immutable chain, so it had to
answer the question directly. The answer is a doctrine, stated in three places that cite
each other, and it points in *both* directions: facts get localized at render, and sealed
content never does.

## Half one — persist facts, compose the sentence at render

`app/features/shared/groupEvalTypes.ts:84-100` names the failure it fixed:

> The eval is PERSISTED once and re-rendered for whoever opens it, so any prose baked into
> the payload is frozen in the language of the machine that produced it. … so a Czech
> workspace read a Czech headline stacked on English risks and an English
> (compliance-critical) governance banner in the same modal.

The fix mirrors the pattern used elsewhere for server-generated display data: "the WIRE
value stays canonical, only the rendered label is localized." Concretely, `RiskFact`
(`:101-106`) is a discriminated union — `{ kind: "low_fit", label, score }`,
`{ kind: "early_career", label }`, `{ kind: "gaps", label, gaps[] }` — and `SummaryFacts`
(`:112-125`) is a branch discriminator plus params, one `kind` per branch of
`group-eval-run`'s summary switch, with `separation` "present only when the crown needs
the confidence hedge." The client composes the sentence from those at render time.

Migration is by accepting both shapes, not by rewriting sealed history: "Legacy payloads
carry the English sentence as a bare string instead — both shapes are accepted"
(`:101-103`), with a documented legacy-prose fallback in the composer.

`assessRobustness` (`:77-88`) carries the absence rule alongside: it is single-sourced "so
the panel copy AND the sealed decision record agree, and so a no-op / a missing check can
never read as a PASS", and a misaligned fairness matrix "is treated exactly like a missing
one — an unreadable check is not a check."

## Half two — the seal does not localize, forever

`app/_lib/group-eval-run.ts:600-608` is the counter-rule, written as a standing
instruction to future contributors:

> SEALED RATIONALE LANGUAGE — CONVENTION. Everything the MODAL shows is composed in the
> reader's language from persisted facts. The sealed `rationale` below is deliberately the
> opposite: it stays the ENGLISH `deterministicSummary`, in every workspace, forever. A
> decision record is an immutable audit artifact — it is read by auditors, exported, and
> compared across tenants and across time, so its wording must not depend on whichever org
> locale happened to be configured when the eval ran (and must not change if that setting
> is later flipped). … Do NOT "fix" this by feeding a localized string into
> `sealDecisionSafe`.

The same convention governs `separationNote` (`group-eval-separation.ts:74`) and the
`reasonCode`/`kind` enums. The UI's localized mirror is composed from the reason code, not
from the sealed sentence.

The identity half is `app/features/shell/simulation/useSimulationWalk.ts:22-30`. In a file
whose every other string is translated, `DEMO_APPROVER = "Guided demo (auto-approved)"` is
a deliberate exception, and the comment says why: it is written into a sealed record as the
human-approval actor, "where the actor is an identity a reviewer and an exporter compare
across runs and tenants — not UI chrome. Translating it would mint four different 'who
approved this' values for one scripted approval and make the audit trail locale-dependent."
Chrome localizes; content does not.

## Traceability that rides in the inputs, verbatim and clipped

`group-eval-run.ts:614-635` adds the reconstruction fields to the same seal. The rationale
stays the deterministic summary — "a localized or model-authored string must never become
the record's own account of itself" — but "a record that says only 'the AI led with X' is
not reconstructible: an auditor cannot see WHICH prompt produced the ranking, nor what the
model actually SAID about the candidate it crowned. Both were computed and then dropped on
the floor." So `inputs` carries `promptVersion` (the reasoning prompts behind this cohort,
`[]` when no model ran) and `leadReasoning` — the model's own verdict, strengths and gaps
for the crowned lead, "VERBATIM and clipped, never re-narrated by us." The clip is
`MAX_REASON_ITEMS = 6`, `MAX_REASON_CHARS = 400`, "because a decision record is an audit
artifact, not a transcript store."

## The read-back, and the scoped absence

`parseSealTraceability` (`app/_lib/decision-attribution.ts:389`) "had shipped with **no
production caller**" — sealed for a period and rendered nowhere. Its first reader is
`app/features/insights/analytics/sections/DecisionRecordDetail.tsx`, which renders prompt
versions as chips and the lead's verdict, strengths and gaps **verbatim** — "it is
evidence, so it is never summarised or re-narrated."

The absences are enumerated rather than blanked (`docs/features/compliance/README.md`,
the Art. 12 read-back section): a seal carrying neither half says so in one sentence naming
both possible causes; a seal with a prompt version but no model text says that; a run with
no model behind it reports an empty prompt version as *not recorded* rather than implying
one. The parser returns `null` instead of an empty shell "precisely so those states stay
distinguishable" — and the block renders on group-eval kinds only, because "a 'not
recorded' line on an advance or an offer would claim a compliance gap that does not exist."
Pinned by `sections/sealTraceabilityRender.test.ts`.

## The boundary the record does not cross

`app/_lib/status-decisions.ts:1-9` holds the seam: the operator dossier
(`/api/decisions/records`) "exposes the full sealed record: rationale text (which names the
approving operator), payload snapshots, chain hashes, policy versions. None of that may
cross the public token boundary." The candidate's `CandidateDecisionView` (`:17-31`) is a
closed shape — kind, timestamp, a three-state `attribution` ("so an unknown writer is never
misattributed to the machine OR a human"), the structured `reasonCode`, and for
`auto_rejected` only the decisive `{ score, threshold }` facts — pinned by leak tests, with
visible kinds on an allowlist so a future kind ships hidden by default.
