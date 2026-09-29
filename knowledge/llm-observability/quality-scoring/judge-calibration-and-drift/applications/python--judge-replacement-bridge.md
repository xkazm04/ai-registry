---
layer: application
type: application
subject: judge-calibration-and-drift
technique: judge-replacement-bridge
stack: python
status: forged
verified_on: 2026-09-29
verified_against: python@3.10
applied: experiment
ab_verdict: better
---

# A retired judge replaced and replayed, with nothing in the rows to say which judge scored them (UltraEval-Audio)

UltraEval-Audio is an open evaluation framework for speech and audio models. Its
integration of an instruction-following speech benchmark had to replace that benchmark's
judge model, which its provider withdrew, and it validated the replacement by replaying
it over the benchmark's own reference recordings. This document reads the tree at commit
`bead726925d43f526bed48a4a6a827595169429d` (Python witness: `pyproject.toml:10` "requires-python"). **Executed, in a narrow sense:** the integration's own evaluator,
aggregator and task runner ran with the judge model replaced by a stub that answers,
answers unparseably, or raises, so the numbers below are structure and never magnitude.
The tree was not modified. **What was not measured** is the bridge itself, the
replacement's repeatability floor, which needs a live judge and the reference recordings.

## The bridge, as built

The anchor is right. The replay scores the benchmark's official reference audio with the
replacement and sets each axis beside the published aggregate, per language
(`replication/InstructTTSEval.md:45` "we evaluated the official reference audio", the
cells at `replication/InstructTTSEval.md:62` "-2.20 pp"). The replacement is the evaluator's hard default
(`audio_evals/evaluator/instruct_tts_eval.py:78` "model_name: str",
`registry/evaluator/instruct_tts_eval.yaml:6` "model_name: gemini-2.5-pro"), and the aggregator reports valid and null
counts per axis (`audio_evals/agg/instruct_tts_eval.py:60` "_valid"), which is the
technique's coverage rule half-built. Against the repository's reference row the gaps run
from -2.20 to +1.50 points with both signs, which is the right reason to apply no
correction, and the note applies none.

## What it lacks

**A named anchor.** The published aggregate the replay compares against is the one in the
benchmark's repository, and the note says so. The benchmark's paper publishes the same
reference row too, and the two disagree. Read in full text on 2026-09-29, the paper's
Tables 5 and 6 (arXiv 2506.16381) give English 96.2 / 89.4 / 67.2 and Chinese 90.9 / 86.7 /
69.8 for the three axes; the repository's row is English 93.6 / 89.8 / 70.0 and Chinese
92.0 / 84.1 / 66.0. The two publications differ by up to 3.8 points on one cell, more than
any gap the replay was judged on, and set against the paper's row the same replay reads
from about -4.3 to +4.1. "Broadly aligned" is therefore a statement about one of two
published numbers, and the note does not say the other exists.

**A tolerance.** The conclusion is "broadly aligned"
(`replication/InstructTTSEval.md:70` "broadly aligned") and the note itself says the two
runs "have different valid/null sample counts" (`replication/InstructTTSEval.md:77` "different valid/null sample counts"). No repeat replay is reported, so a
2.2-point gap cannot be sorted into the judge disagreeing with itself or the judge being
different.

**A judge in the row.** The evaluator's result carries a score, the raw output, the
instruction type and nothing that names the judge
(`audio_evals/evaluator/instruct_tts_eval.py:136` "gemini_score"). A second evaluator is
registered against a different judge model with the identical row shape
(`registry/evaluator/instruct_tts_eval.yaml:11` "model_name: gemini-2.5-flash"), so rows
from two judges cannot be told apart in a stored record.

**One home for a judge failure.** The evaluator retries five times
(`audio_evals/evaluator/instruct_tts_eval.py:108` "for retry in range(5)"). When every
attempt raises, the final return reads a variable that was never assigned
(`audio_evals/evaluator/instruct_tts_eval.py:157` "raw_output"), so the recorded error is
an unbound-variable crash and not the upstream failure. That item is dropped from the
aggregate's own counts and shows up only in a separate failure rate.

## The paired run

Arm A is the integration as it stands. Arm B applies the technique's two rules to the
same evaluator: a judge that fails after its retries becomes a null row carrying the real
error, and every row names the judge. The target is items the aggregate's own counts
account for, and whether a stored row can say who scored it.

| Case (12 clips: 4 clean verdicts, 4 unparseable, 4 judge exceptions) | Arm A | Arm B |
| --- | --- | --- |
| Valid plus null over items | 8 of 12 | 12 of 12 |
| Error rows | 4, each naming an unbound variable | 0 |
| Where the upstream failure text survives | nowhere | in the row |
| Full outage: every clip raises | aggregate holds only a failure rate, every axis key absent | axis present, 0 valid, 12 null |
| Two different judges, same clips, same verdicts | stored rows identical | every row names its judge |

The judge was called 44 times for 12 clips, 5 per failing clip and no pause between them.
The verdict is `better` for the accounting and identity half: the target moved, and the
floor (the clean verdicts and the headline rate over them) did not change.

## A second finding inside the aggregator

With no valid scores on an axis, the aggregator sets that axis's pass rate to 0.0
(`audio_evals/agg/instruct_tts_eval.py:57` "rate = 0.0") and adds it to the average
(`audio_evals/agg/instruct_tts_eval.py:62` "valid_rates.append(rate)"). A judge that
answered nothing parseable for a whole axis therefore reads as a 0.0 percent pass rate,
which is an outage counted as an opinion. The valid count beside it is 0, but the rate
and the average are what a table quotes. Arm B inherits this, because it is the
aggregator's rule and not the evaluator's.
