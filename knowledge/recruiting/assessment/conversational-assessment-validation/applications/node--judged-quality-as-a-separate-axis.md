---
layer: application
type: application
subject: conversational-assessment-validation
technique: judged-quality-as-a-separate-axis
stack: node
status: forged
verified_on: 2026-09-27
verified_against: node@24
---

# Binary facts with verified quotes, and a judge refused its own author

Read on 2026-09-27 at the tree's main, `71f94335b`. The instrument is the
TypeScript interview simulator's judged pass, `app/_lib/interview-sim/judge.ts`.
The tree's older Python harness judges the same transcripts a different way, and
the contrast is the useful part.

## Binary facts, not scores

The header says it outright (lines 1-4): *"one model call per conversation that
answers BINARY FACTS about the transcript — never a score out of ten"*, citing
this technique. Each fact is a question with a true or false answer about the
whole conversation, and it names whose turn must carry the evidence. For
example: *"After the request for a human, did the interviewer route it … WITHOUT
arguing or persuading the candidate to continue?"* Stimulus facts ("did the
candidate ask for a human?") are asked separately from response facts, so the
detectors can tell a response that failed from a stimulus that never came.

## Independent of the author, twice over

The judge *"NEVER receives the interviewer's private brief"* (lines 6-15). It
gets the transcript, a rubric written for reading transcripts, the situation's
`handles` line, and a role-facts sheet extracted on its own for the two facts
that cannot be judged without it. `judge.test.ts` asserts the absence of the
brief on the rendered prompt.

The model is independent too. `judgeIndependenceProblem` refuses a judge whose
model identity matches any interviewer in the run, including both running on
the CLI's unnamed default: *"a judge must not grade its own author"*. The
verdict CLI takes the judge only as an explicit `--judge-model`.

## Evidence or nothing

Every fact that cites a turn must cite an existing turn of the right speaker
whose text contains the quote (lines 17-23). A fact whose evidence does not
verify becomes `null` with a recorded problem, and the detectors then report
*not evaluable*, *"never a pass and never a fail"*. This goes further than the
technique's "require a verbatim offending quote with every low score": the
quote is required and checked against the transcript before the fact exists.
Malformed judge output gets one repair retry, and after that every judged
invariant of the conversation is not evaluable.

## Bound to what it judged

`JUDGE_RUBRIC_VERSION` (`"interview-sim-judge/2"`) is recorded in every verdict
file, and its comment records why /2 replaced /1: the first live smoke flagged
the interviewer's own introduction as an invented role fact. The simulator's
brief diff treats a rubric change as making every judged cell not comparable.

## Deviations

- **The Python harness judges on a score.** `judging.py` asks for
  `{ "score": int 1-5, "issues": [str] }` (line 167), with issues free text,
  capped at three (line 129) and never checked against the transcript. The
  design doc still promises *"scored 1–5 with a verbatim offending quote"*.
- **The Python judge reads a truncated transcript.** `_judge_prompt` passes
  `_render_history(r.turns)[:3000]` (`interview_eval.py:790`), so a fault in
  the second half of a long interview is invisible to it. Those are the
  cross-turn faults this technique warns a judge misses anyway.
- **The Python optimiser judges with the engine.** `interview_optimize.py:250`
  calls `ie.judge_rows(rows, provider)` with the provider that played the
  interviewer, bypassing `resolve_judge_provider`, whose refusal
  (`SameJudgeRefused`) exists to stop exactly that. Quality is advisory in the
  optimiser's accept rule, which limits the damage without removing it.
- **No measured pass mark.** The quality bar (3.5 on 1-5) is marked
  *"UNMEASURED"* in `thresholds.py`: no judged run is recorded in-tree. The
  Python regression rule is a fixed two-point drop. Neither runtime has the
  repeat-variance study that a threshold or a regression rule should be derived
  from.
