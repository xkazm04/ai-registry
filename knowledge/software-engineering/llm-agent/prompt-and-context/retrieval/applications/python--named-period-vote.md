---
layer: application
type: application
subject: retrieval
technique: named-period-vote
stack: python
status: forged
verified_on: 2026-10-14
verified_against: python@3.12
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Past-state questions replayed over a memory harness's hybrid arm (personas)

The tree is personas' simulated-year memory harness, at commit `4933593909` on its main
branch. The harness declares no interpreter floor; the version is the interpreter the
replay ran on. The product's own memory retrieval reads three lanes (keyword, vector, a
recency tail) and nothing in it owns a period named in a question, so the seam is a
decision made by default. The harness arm closest to the design under test is its
hybrid verbatim arm, a lexical and vector ranking over the raw record, and that is where
the experiment ran.

## The arms

The check builds past-state questions from the scenario's own ground truth: for each of
the 70 superseded facts, "what was it in the month it was first stated", with and without
the year, 140 in all. It replays the arm's ranking over the store as it stood 30 days after
the superseding statement, and compares, by retrieval coverage only:

- **A**: the ranking unchanged.
- **vote**: the same ranking fused by reciprocal rank with a list of the top 200 candidates
  whose event day falls in the named window, at weight 1, 0.5 and 0.25
  (`evals/memory-year/memory_year/checks/temporal_vote.py:142 "score[i] = score.get(i, 0.0) + w / (RRF_K + r + 1)"`).
- **filter**: the top 200 candidates inside the window only.

Each under the right window and under the window shifted one month early. The packing is
the arm's own, including its 40-item cap and its sibling hydration. The instrument asserts
itself first: the parser fires on none of the 194 standard probes
(`evals/memory-year/memory_year/checks/temporal_vote.py:183 "CONTROL FAILED: the parser fired on"`), so their
contexts are identical under every arm, and a zero-weight vote or an empty window must
leave the order unchanged
(`evals/memory-year/memory_year/checks/temporal_vote.py:137 "if not lane or weight == 0:"`).

## What it measured

Target, questions whose context held a statement from the asked-about month, at caps of 5,
10 and 40: A 78, 94, 105; full-weight vote 104, 112, 127; quarter-weight vote 101, 103, 114;
filter 103, 110, 125. Floor: the standard probes, unchanged by construction. At a cut of
five the superseding statement shared the context in 72 of A's contexts and in none of the
vote's.

The seam was **chosen to falsify**. The source keeps its period as an equal-weight vote and
argues a wrong window is the expensive error. With the window one month early, the
questions A had answered that each arm then lost were: full vote 24, 35, 1; half 21, 20, 1;
quarter 7, 8, 0; filter 24, 36, 41. The source's reason holds only at a wide cut. At a cut
of five, a full-weight vote is a filter in all but name. That is what the technique's weight
rule was written from, and the source's own default cut is five.

The depth bounds the gain: at a cut of 40, a full-weight vote gained 2 questions over A with
50 candidates visible, 22 with 200 and 30 over the whole store. The statement asked about is
usually present, ranked below its newer and more often repeated siblings.

## What this realization cannot do

Coverage is not accuracy. A context holding the right month's statement can still be
answered wrong, and nothing here ran the consumer or the judge. The parser recognises one
form (a named month with its preposition) because the questions use one; a product parser
needs the wider and more cautious grammar the technique describes. And the store's events
carry true event days, so the "unknown time" rule was never exercised.

## Verdict

`better` at the experiment mode: the target moved at every cut and the floor held by
construction, with the wrong-window cost stated beside it. The product change is a task,
not a change: a period vote in the product's retrieval, weighted below the topical lanes
because its own cut is small.
