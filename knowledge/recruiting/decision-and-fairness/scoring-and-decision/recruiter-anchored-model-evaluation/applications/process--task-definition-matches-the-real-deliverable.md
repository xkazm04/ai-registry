---
layer: application
type: application
subject: recruiter-anchored-model-evaluation
technique: task-definition-matches-the-real-deliverable
stack: process
status: forged
verified_on: 2026-09-29
---

# Per-use-case task definitions in the bench judge

The bench judge does not score against a generic "recruiting output". `_USE_CASE_TASK`
(`pipeline/jobfit/llm/bench/judge.py:30`) holds one sentence per bench use case,
written in recruiter language, and `_judge_prompt` opens every prompt with the one
for the record being scored (judge.py:110); an unlisted use case falls back to its
own key, which is the single place the definition can silently disappear. Lines
resolved on 2026-09-29 against kp `origin/main` at `b2c19295b`.

## Three definitions that carry the technique's edges

**A deliverable corrected after the judge graded the wrong one.** The
`campaign_pack` definition (judge.py:56-65) is preceded by the comment:

> The earlier description ("channels, copy, targeting") graded every model against
> a deliverable the op never asks for - a judge artifact, not model weakness.

It now names the real deliverable of `campaign.py`: about eight short feed-ad
variants, each with a typed hook, two to four sentences of copy ending in a
low-friction call to action, and a four-beat fifteen-second video script, "using
ONLY the supplied job facts, never inventing pay, benefits or testimonials". The
technique's rule that the definition follows the deliverable, not the prompt's
self-image, was learned here by a wrong score, and the fix landed on 2026-08-11
(commit `63bbeb152`).

**A domain rule the schema itself dictates.** `jd_ingest` (judge.py:39-45) says
requirements are "candidate qualifications" and that day-to-day duties belong in
the description prose, adding that a separate responsibilities list "is NOT part
of this deliverable". A fluent output that files duties under requirements is the
exact case the technique names, and only a definition written from the Job schema
catches it.

**A composite artifact with a merged-in skeleton.** `devcase_interview_scenario`
(judge.py:49-54) tells the judge that phases marked `caseGrounded:false` are the
canonical fixed skeleton "the tool merges in unchanged, NOT this model's output; do
not score them". That is the technique's "name the parts the tool supplies"
boundary in one clause.

## The definition and the evidence excerpt travel together

`scenarios.py` stamps the model's real input into `meta["judgeInput"]`, and its
comment at scenarios.py:158-167 records the failure of an excerpt that covered fewer
fact categories than the production prompt: the judge scored a model 2/10 for
"fabricating" a role that was verbatim in the candidate's highlights, and marked the
campaign copy for "inventing" an employer that sat in the description excerpt. The
resulting rule - "the excerpt must cover every fact CATEGORY the production prompt
feeds the model" - is the definition's other half, and is recorded in detail under
[unverifiable-is-not-fabricated](./process--unverifiable-is-not-fabricated.md).

## Deviations

**The domain rules live only in the graded judge.** The technique's last decision
rule asks for a stated domain rule to also be asserted as a categorical check, so
that a violation cannot be paid for with good prose. In `contracts.py` neither rule
above is one. `campaign_pack` (contracts.py:217) requires one or more variants,
each with a non-empty hook, copy and script - not the eight the definition asks for,
and nothing that looks for an invented pay figure or benefit. `jd_ingest`
(contracts.py:138) passes when any of `requirements`, `responsibilities`,
`mustHaves` or `skills` is a non-empty list, so a payload that puts every duty under
`responsibilities` and leaves `requirements` empty clears the structural contract
that the judge definition calls out of scope. Both rules are therefore priced on a
1-10 scale, where the surrounding prose can offset them, not gated.

**No single versioned catalogue.** The definitions sit in a Python dict beside the
judge. The Job schema, the generation prompts and the receiving surfaces are
elsewhere, and nothing ties a definition change to a re-baseline: the technique's
"the verdict was bound to the old definition" is followed by convention. The
committed scorecard was measured on 2026-08-12, the day after the `campaign_pack`
correction, so the baked cells postdate it; that is a timing fact, not a control.

## Second reading (2026-09-29)

One use case, `role_research`, has no entry at all: live web research has no fixed input a
bench could judge, so the tree lists it as unmeasured (`UNMEASURED_USE_CASES`,
`app/_lib/llm-quality.ts`) and pins its engine instead. The technique now says a definition can
only be scored against an excerpt every arm saw identically, and lists this as a case where it
does not apply.
