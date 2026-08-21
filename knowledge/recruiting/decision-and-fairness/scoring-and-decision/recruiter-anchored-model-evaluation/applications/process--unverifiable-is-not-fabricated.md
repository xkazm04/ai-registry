---
layer: application
type: application
subject: recruiter-anchored-model-evaluation
technique: unverifiable-is-not-fabricated
stack: process
status: forged
verified_on: 2026-08-20
---

# The grounding rule in the bench judge prompt

Correctness in the bench rubric is scored against a real evidence excerpt, not
against the judge's world knowledge. `scenarios.py` stamps the model's actual
input — the job-ad text, the interview transcript, or the candidate facts — into
`meta["judgeInput"]`, and `_judge_prompt` (`pipeline/jobfit/llm/bench/judge.py:110`)
lifts it back out and shows it under its own heading.

## The rule, as written

`pipeline/jobfit/llm/bench/judge.py:131` embeds the technique's central sentence
in the prompt itself:

> Input evidence (a TRUNCATED excerpt of what the model was given — check claims
> against it; a claim outside the excerpt's scope is **UNVERIFIABLE, not
> fabricated** — penalize only direct contradictions and inventions of fact
> kinds the task forbids)

Three parts are load-bearing and all three are present: the excerpt is announced
as truncated, so the judge cannot treat it as the world; outside-the-excerpt is
named as its own state; and the penalty is scoped to direct contradictions plus
the task-forbidden invention kinds (invented pay, benefits or testimonials in
`campaign_pack`, judge.py:61).

## Truncation must match the generator's

`_EVIDENCE_MAX = 4000` (judge.py:107) is not an arbitrary cap. Its comment
states the constraint:

> Matches `scenarios._JI_MAX`: an excerpt narrower than the model's real input
> makes the judge read grounded facts as fabrications (calib-a artifact).

`scenarios._JI_MAX` is likewise 4000 (`pipeline/jobfit/llm/bench/scenarios.py:168`).
The two caps are pinned to each other because a judge with a shorter view than
the generator produces a grounding score that is wrong in an undetectable
direction — exactly the discard-the-run rule in the companion technique on
evidence-grounded correctness.

The same module docstring records why the excerpt exists at all: without it the
judge was "told 'you cannot verify correctness'" and levelled every output —
the compression failure arriving by a second route.

## The three dimensions, each with its own question

`_JUDGE_SYSTEM` (judge.py:76) scores relevance, correctness and adherence
against distinct questions rather than a shared vibe:

- relevance — "does it address THIS candidate/job/case, or could it be pasted
  onto any?"
- correctness — "is every claim supported by the provided input evidence?
  Penalize inventions and contradictions; when evidence is provided, USE it."
- adherence — "is every part of the asked deliverable present, in the asked
  shape?"

They are carried separately all the way to the scorecard: `_DIMS` in
`pipeline/jobfit/llm/bench/bake_quality.py:31` keeps a per-dimension median per
cell rather than a single blended number.

## Deviations

Two, and the standard stands on both.

**No claim-level extraction.** The judge returns `score`, three dimensions, a
one-sentence `verdict` and an `issues` list (judge.py:143-145). It does not
enumerate the artifact's claims and label each supported / contradicted /
unverifiable, so there is no unverifiable *count* — the diagnostic that
separates a model that does not lie from a model that is merely unaudited. A
verbatim quote per contradiction is likewise requested only implicitly, through
"Be critical and concrete."

**No escalation for adverse unverifiable claims.** Nothing in the rubric treats
an unsupported claim that works against the candidate differently from an
unsupported compliment; both dissolve into one correctness number.
