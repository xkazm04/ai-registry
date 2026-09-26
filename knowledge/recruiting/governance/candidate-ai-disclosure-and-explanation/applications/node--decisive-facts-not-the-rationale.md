---
layer: application
type: application
subject: candidate-ai-disclosure-and-explanation
technique: decisive-facts-not-the-rationale
stack: node
status: forged
verified_on: 2026-09-26
verified_against: node@24
applied: code
ab_verdict: better
---

# One extractor per kind, and the caveat sealed with the pair

`app/_lib/status-decisions.ts` builds a candidate's decisive facts out of the
sealed decision record and nothing else. `CandidateDecisionFacts` is "A CLOSED
DISCRIMINATED UNION, not an open bag". Every variant is a shape some extractor
produces from a sealed payload, and "the extractor is the only way a fact is ever
built". The discriminant is `type`, deliberately not `kind`, because "two fields
with one name on one object is how a redaction bug gets written".

## The two shapes

**A threshold pair.** `autoRejectFacts` reads the screen wave's sealed inputs and
emits `{ type: "threshold", score, threshold, stale }`. It reads, and never
recomputes, which is the technique's first procedural step. Anything non-numeric
yields no facts, and "NO other input key ever crosses (approvedBy names the
operator; group-eval inputs name other candidates)". The wave's rule is
conjunctive: the bottom share of the round *and* under the floor. So the floor is
a valid counterfactual on its own, since a score at or above it would not have
been declined. The candidate copy says the score "was below the screening
threshold", not that the threshold was required. The rank arm never crosses; it
is a comparison with other applicants.

**A rubric verdict.** `aiScorecardFacts` emits the competencies an AI interview
assessed and each rating, "the SMALLEST thing that answers 'on what was I
judged'". It withholds three things, and the comment gives each reason:
- The verbatim evidence quote. It is the candidate's own words, but it is a
  model's selection presented as the decisive line, and an ASR error reads as
  something they did not say.
- The summary and recommendation prose, which is rationale-register text.
- Any key other than `dimensions`, so a future input added to the seal cannot
  start crossing silently.

The list is capped at twelve, because it originates in a model's synthesis. A
not-assessed axis is filtered at the seal, where its placeholder evidence is
still visible. The redaction side cannot repeat that filter.

## Coverage is a number

`FACT_EXTRACTORS` maps kind to extractor, "a map rather than a switch precisely so
the coverage is COUNTABLE". `factsCoverage()` reports extractors against every
visible kind, and against the five kinds that are an AI verdict about a person.
The suite asserts the ratio. Two of the five AI verdicts explain themselves today.
The three that do not are the auto-advance and the two group-evaluation kinds,
and group evaluation compares candidates, so its facts are the hard case the
technique's no-comparison rule governs.

## The caveat that stayed behind

The wave seals `stale` beside the score whenever the score predates the job
description's last edit. The wave's own comment calls it "the one fact that
undermines" the comparison. It was added so that an audit record could not
present "a clean score-vs-threshold comparison while omitting" it. Until
2026-09-26 the candidate boundary did exactly that. `autoRejectFacts` read the
score and the threshold and dropped the flag, so a person declined on a score
computed against an older version of the role saw a clean pair.

Commit `cf6cb58a` carries `stale` in the threshold fact. It is true only when the
seal says so, and `staleSince` does not cross. The page adds one sentence
naming it as grounds to ask for a human review. On three records sealed the way
the wave seals them, the fresh and the stale decline reached the candidate
byte-identical before the change. After it, they differ by the one fact that
makes the second contestable.
