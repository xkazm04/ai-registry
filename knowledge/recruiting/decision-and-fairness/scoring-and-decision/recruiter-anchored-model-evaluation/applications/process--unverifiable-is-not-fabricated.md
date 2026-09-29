---
layer: application
type: application
subject: recruiter-anchored-model-evaluation
technique: unverifiable-is-not-fabricated
stack: process
status: forged
verified_on: 2026-09-29
applied: simulation
ab_verdict: not-better
---

# The grounding rule in the bench judge prompt

Line numbers re-resolved on 2026-09-29 against kp `origin/main` at `b2c19295b`; the
prompt wording quoted below is unchanged.

Correctness in the bench rubric is scored against a real evidence excerpt, not
against the judge's world knowledge. `scenarios.py` stamps the model's actual
input — the job-ad text, the interview transcript, or the candidate facts — into
`meta["judgeInput"]`, and `_judge_prompt` (`pipeline/jobfit/llm/bench/judge.py:109`)
lifts it back out and shows it under its own heading.

## The rule, as written

`pipeline/jobfit/llm/bench/judge.py:130-132` embeds the technique's central sentence
in the prompt itself:

> Input evidence (a TRUNCATED excerpt of what the model was given — check claims
> against it; a claim outside the excerpt's scope is **UNVERIFIABLE, not
> fabricated** — penalize only direct contradictions and inventions of fact
> kinds the task forbids)

Three parts are load-bearing and all three are present: the excerpt is announced
as truncated, so the judge cannot treat it as the world; outside-the-excerpt is
named as its own state; and the penalty is scoped to direct contradictions plus
the task-forbidden invention kinds (invented pay, benefits or testimonials in
`campaign_pack`, judge.py:60-65).

## Truncation must match the generator's

`_EVIDENCE_MAX = 4000` (judge.py:106) is not an arbitrary cap. Its comment
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

`_JUDGE_SYSTEM` (judge.py:75) scores relevance, correctness and adherence
against distinct questions rather than a shared vibe:

- relevance — "does it address THIS candidate/job/case, or could it be pasted
  onto any?"
- correctness — "is every claim supported by the provided input evidence?
  Penalize inventions and contradictions; when evidence is provided, USE it."
- adherence — "is every part of the asked deliverable present, in the asked
  shape?"

They are carried separately all the way to the scorecard: `_DIMS` in
`pipeline/jobfit/llm/bench/bake_quality.py:39` keeps a per-dimension median per
cell rather than a single blended number.

## Deviations

Two, and the standard stands on both.

**No claim-level extraction.** The judge returns `score`, three dimensions, a
one-sentence `verdict` and an `issues` list (judge.py:143-144). It does not
enumerate the artifact's claims and label each supported / contradicted /
unverifiable, so there is no unverifiable *count* — the diagnostic that
separates a model that does not lie from a model that is merely unaudited. A
verbatim quote per contradiction is likewise requested only implicitly, through
"Be critical and concrete."

**No escalation for adverse unverifiable claims.** Nothing in the rubric treats
an unsupported claim that works against the candidate differently from an
unsupported compliment; both dissolve into one correctness number.

## The whole record and the slice disagree, by design (second reading, 2026-09-29)

The rule above is right for a slice. The source-tree check in
`node--evidence-grounded-correctness.md` holds the whole source set and treats a figure
absent from it as unsupported, blocking the export. The two do not contradict: the judge
sees a 4000-character excerpt of a longer input, the gate sees everything the generator was
given. The technique now says so: the neutrality rule follows the truncation, and where the
checker holds the whole record a specific checkable assertion about the person that the
record does not carry is a defect. The judge's own carve-out ("inventions of fact kinds the
task forbids") is the narrow form of the same idea.

The technique also lost a sentence. It said scoring after claim enumeration is "markedly
more stable" than scoring by impression. A 2026 prompt-controlled comparison found a
holistic judge matching or beating a decompose-then-verify judge on two of three
benchmarks, with the gap concentrated in partly supported answers, i.e. incompleteness
(arXiv 2603.28005, abstract read verbatim), and no study of run-to-run stability for hiring
text is known. This tree's judge is holistic in the sense the study tested; the enumeration
stays recommended for auditability, not for stability.

`applied: simulation`, `ab_verdict: not-better`: the standing absolute was walked against
this tree's slice-based judge, the whole-record gate and the external comparison; it held for
the first, failed for the second, and was unsupported for the third.
