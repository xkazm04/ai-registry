---
layer: application
type: application
subject: interview-story-portfolio
technique: gap-response-chosen-by-story-strength
stack: python
status: forged
verified_on: 2026-10-21
verified_against: python@3.12
applied: simulation
ab_verdict: better
---

# A deterministic mock-interview kit that answers every gap with the same row

A hiring product's Python analysis engine builds a mock interview kit for each CV it reads
against a job: 8 to 12 questions in behavioral, technical and red-flag buckets, each with a
STAR outline addressed to the candidate in the second person. Read at kp `8e9cc25ea`
(`pipeline/jobfit/interview.py`, last changed `029471eba`), Python 3.12 per the CI
workflow. This is the subject's first stack with a runtime: unlike the prompt-only coach,
every rule here is code and every output can be counted.

The module's own promise is the technique's territory:
`pipeline/jobfit/interview.py:6 "each with a STAR-style answer scaffold drawn from the candidate."` and
`pipeline/jobfit/interview.py:7 "Every question is tied to a specific evidence gap so the user knows exactly"`.

## What conforms

- **Do not over-explain.** The red-flag outline opens with the technique's rule nearly
  word for word:
  `pipeline/jobfit/interview.py:310 "Acknowledge the concern in one sentence — defensiveness reads worse than the gap itself."`
- **Plans are phrased as plans.** The missing-skill outline ends in the conditional mood,
  `pipeline/jobfit/interview.py:231 "how you would close the gap (course, side project, mentor, sandbox) inside 30 days."`,
  which keeps a hypothetical looking like one rather than inventing a growth account.
- **The no-experience row exists.** The ramp question,
  `pipeline/jobfit/interview.py:278 "ramp on {skill} in the first 30 days, what would your plan look like?"`,
  is the stated-approach-plus-first-learning response the selector puts at the bottom.

## Deviation: the row is chosen by template position, not evidence

The selector's input is the strength of the candidate's best experience for a gap. The kit
never reads it. The profile carries an `evidence` list, and the module never references
`candidate.evidence`. So the row is fixed per bucket:

- The first three missing skills always get the bridge,
  `pipeline/jobfit/interview.py:213 "for skill in missing[:3]:"` then
  `pipeline/jobfit/interview.py:224 "Bridge from your closest analog using {matching_label}"`.
- Every recruiter risk flag gets the same,
  `pipeline/jobfit/interview.py:315 "Cite the closest evidence you DO have"`, and so does the
  self-assessed gap, `pipeline/jobfit/interview.py:336 "Show your closest analog evidence"`.
- The no-experience row is reached only by position: the fourth missing skill, behind
  `pipeline/jobfit/interview.py:272 "if len(missing) > 3:"`. A candidate's most absent
  skill gets the bridge, and whichever happens to sort fourth gets the honest approach.

## Deviation: a question that presupposes an experience

One technical question is appended for every candidate with no condition on the record:
`pipeline/jobfit/interview.py:258 "Take one AI/automation feature you shipped to production."`,
with the outline
`pipeline/jobfit/interview.py:262 "Pick the highest-impact AI delivery in your timeline"`.
For a candidate with no such delivery this prompt supplies the story, and the outline then
coaches its delivery.

## Measured: the engine's own seed set

The engine's seed builder runs this function over 66 seeded analyses (seven role
families, from software and data to finance, operations, sales and support), stored in
`data/seed_analyses/analyses.json` (last changed 2026-09-04, after the module). Counted
over the stored kits at `8e9cc25ea`, n = 66:

| Count | Value |
|---|---|
| kits / questions | 66 / 484 |
| outlines that ask for a closest analog or closest evidence | 151 |
| questions taking the ramp (no-experience) row | 0 |
| kits carrying the shipped-AI question | 66 |
| of those, records whose skills, evidence and CV text name no AI, ML, LLM or model term | 49 |

The 49 is a floor, since "model" also matches data models. Every one of those 49
candidates, including finance and support profiles, is told to pick their highest-impact
AI delivery.

## Simulation: the condition added to the technique

A = the kit as built. B = the technique's new rules for tools: a presupposed experience
must be found in the record the tool read, otherwise the question takes the no-experience
row. The instrument for B is not the regex above (that would grade B by its own test). It
is a read of three seeded records by hand, CV text included: `cand-000` (a senior Java
and Kafka backend engineer), `cand-050` (a senior bank credit specialist) and `cand-062`
(a senior complaints specialist). None names an AI delivery. A's outline fills its slot
from the skill list, so the credit specialist reads "Pick the highest-impact AI delivery in
your timeline — something using credit analysis, underwriting, ...". B asks how they would
evaluate such a feature and what they would learn first. A contradicts the record in 3 of 3. B contradicts it in 0 of 3,
while keeping a question for the bucket. Verdict `better` on the technique's own criterion
(claims beyond the record). It says nothing about interview outcomes. Would falsify: a
seeded record where B's rewrite drops a question the candidate could have answered from a
real AI delivery the regex and the reader both missed.

The bridge default is not changed by B, because the profile holds no per-experience
strength. The honest fix there is the selector shown to the candidate, which is a product
change for the owner to make, not this pass.

## Upward lesson

The prompt-only coach failed the gap rules by having no checks. This tree fails them in a
way only a runtime can: the template is consistent, so the same presupposition reaches
every candidate. That is why the technique now has a section for tools that write the
scaffold.
