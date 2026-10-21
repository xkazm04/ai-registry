---
layer: application
type: application
subject: interview-story-portfolio
technique: portfolio-assignment-before-per-question-pick
stack: python
status: forged
verified_on: 2026-10-21
verified_against: python@3.12
---

# A per-question kit that spends one skill list on every outline

The same Python engine as the gap application (`pipeline/jobfit/interview.py` at kp
`8e9cc25ea`) writes a STAR outline for each question in its mock interview kit. Each
outline is written alone, question by question, which is the order this technique replaces.
There is no inventory of experiences to allocate, so what gets spent across questions is
the only material the kit names: the head of the candidate's skill list.

## What conforms

- **Category assignment where the questions are unknown.** The technique's "when not to
  use" admits assigning by competency category when the question set is not known. The
  kit's three buckets (behavioral, technical, red-flag defense) are that fallback, and
  each bucket draws from its own source: must-prove evidence, missing skills, risk flags.

## Deviation: the same skills fill every outline, by construction

- `pipeline/jobfit/interview.py:110 "candidate.skills[:3]"` becomes `top_skills`, which
  fills the action line of three behavioral outlines:
  `pipeline/jobfit/interview.py:133 "Cite concrete steps using {top_skills}"`,
  `pipeline/jobfit/interview.py:177 "and the tooling ({top_skills})."` and
  `pipeline/jobfit/interview.py:197 "Show the technique you applied (drawn from {top_skills})"`.
- `pipeline/jobfit/interview.py:209 "matching = candidate.skills[:5]"` fills the technical
  outlines through `matching_label`, at
  `pipeline/jobfit/interview.py:224 "Bridge from your closest analog using {matching_label}"` and
  `pipeline/jobfit/interview.py:262 "Pick the highest-impact AI delivery in your timeline"`.

Over the 66 kits in the engine's seed set, 63 name one skill in three or more outlines (in
cand-001 and cand-002, one skill appears in five). Each outline tells the candidate to
reach for the same few tools. That is the collision the matrix is built to expose, here
produced by the template and invisible to the person reading one question card at a time.

## Deviation: "strongest" is list order

`pipeline/jobfit/interview.py:242 "Pick one of your strongest tools ({matching[0]})"` takes
the first extracted skill, and `matching` is the candidate's own list, not the job's
matched skills. The fallback questions use the job-matched list instead
(`pipeline/jobfit/interview.py:347 "job_fit.matching_skills[:3]"`), so two parts of one kit
disagree about which skills count. Calling the first-listed skill the strongest is a
strength grade nobody made, which is the fit-tier problem one step upstream.

## Not applied

The technique needs experiences with a strength per question, and this profile holds a
skill list and two job titles. No allocation can be simulated honestly on it, so no
`applied:` verdict is written. Return: when the profile carries per-experience records
with the skills each one demonstrates. The smallest step before that would rotate
`top_skills` across outlines, which only spreads the repetition; it does not allocate.
