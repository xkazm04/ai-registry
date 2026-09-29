---
layer: application
type: application
subject: generated-speech-acceptance
technique: published-number-comparability
stack: python
status: forged
verified_on: 2026-09-29
verified_against: python@3.10
---

# Replication notes as comparability records

Written against an open-source audio-model evaluation framework at commit
bead726925d43f526bed48a4a6a827595169429d. Read-only: the tree's replication
notes and evaluator sources were read, and nothing here was executed. Runtime
witness: Python 3.10 or later (`pyproject.toml:10 "requires-python"`).

The framework ships a directory of per-model replication notes, each a table of
`reproduced(published)` cells with a note column. Read together they are a small
catalogue of the reasons a reproduction misses a published number, and they show
the technique's rules being applied, sometimes carefully and sometimes not. This
document maps them, one cause class per note, and does not restate the
technique.

## Cause classes, each in a note

- **A hosted service versus released weights.** One note sets a reproduced
  1.82 English word error against a published 0.99 and attributes the whole gap
  to the paper's figure having come from the vendor's hosted model
  (`replication/fishaudio-s2-pro.md:23 "online service"`). The note declines to
  put the published figure in a comparison cell as a target and says the results
  are not directly comparable, which is the technique's rule for this class:
  compare direction and ordering, not value.
- **A downstream summary that redefined the metric.** A model's README reports
  character error for four languages of a 24-language benchmark whose original
  paper reports word error for all of them
  (`replication/FireRedTTS3.md:66 "统一报 WER"`). The note scores those four with
  the original's word-error definition and leaves the published cell as a dash
  with the unit stated, for example
  `replication/FireRedTTS3.md:40 "12.13 (WER, —)"`, and the same for the other
  three at lines 49, 50 and 63. An empty cell with a stated reason is the
  correct form. The original paper, checked independently, does label every
  language word error and is silent on the unit for unspaced scripts, so the
  dash is honest about a comparison the original itself does not fully define.
- **The vendor's scorer, re-run.** For a headline benchmark the note reproduces
  1.81 against a published 1.64 and adds that the value matches what the official
  evaluation script recomputes
  (`replication/FireRedTTS3.md:26 "1.81 (1.64)"`). Running the vendor's own
  scorer is the one check that moves the gap from the scorer to the model side,
  and the note reports it as a comparability fact, not as a defence.
- **A cause the files cannot support.** One note reports a reproduction that
  aligns in Chinese and misses in English by 0.85 on word error and 2.91 on
  similarity, names the candidates the result files cannot separate (inference
  parameters, language tag, evaluation environment), and closes with a sentence
  that says it will not infer a cause (`replication/moss-tts-v1.5.md:27 "本文不对根因作推断"`).
  That is "cause not traced" written into a table, and it is the right status.
- **A retired judge.** The style-following benchmark's original judge is a dated
  preview that has been withdrawn
  (`replication/InstructTTSEval.md:42 "This preview model is no longer available"`),
  and the note replays the replacement over the benchmark's own reference audio
  (`replication/InstructTTSEval.md:45 "we evaluated the official reference audio"`)
  rather than presenting the new judge's numbers as the published ones. That is
  the technique's replay, taken up in the judge technique of this subject.
- **A missing row, traced or not.** The English style split carries 999 scored
  rows of 1000 and the note says why no more can be said:
  `replication/FireRedTTS3.md:79 "1 条未产出评测结果"` followed by "成因未追溯"
  (cause not traced). The valid-row count sits in its own column, beside each
  score, which is where the technique wants it.

## Deviations from the standard

- **No tolerance behind "broadly aligned".** The judge replay closes with
  `replication/InstructTTSEval.md:70 "broadly aligned"` after individual axes
  moved by up to 2.2 points in either direction. The notes' own scorer reports
  valid and unscored counts, but there is no repeated replay from which a
  tolerance could be taken, and the sentence certifies more than the run
  supports. The standard is a spread from the replacement judge's own reruns.
- **Two published sources for one row.** The same note compares against the
  reference row in the benchmark's official repository. The paper's own tables
  (read in full text on 2026-09-29) give reference values that differ from the
  repository's by up to 3.8 points on one cell (Chinese role-play, 69.8 in the
  paper against 66.0 in the repository) and by 2.8 on another (English
  role-play, 67.2 against 70.0), more than the 2.2 the note's own deltas reach
  and the deltas it calls aligned. Set against the paper's row, the same replay
  reads from about -4.3 to +4.1. The note names its target, which is right; it
  does not say the two sources disagree, and the standard is to say so.
- **A metric label that outlived its metric.** One results table lists the
  similarity row with a lower-is-better arrow
  (`replication/MGM-Omni.md:20 "simo⬇️"`) and labels the English similarity row as
  word error (`replication/MGM-Omni.md:22 "wer⬇️ | 68.5(68.6)"`). Sixty-eight
  percent word error is not a plausible result for a working synthesizer, and the
  cell is plainly similarity, but a table that cannot be read without knowing
  the answer is the failure the technique names, and the published cell beside
  it inherits the mislabel.
- **A dispersion nobody chased.** A small system's English score of 33.91 with a
  spread of 13.06 sits in a table beside a larger sibling at 3.77 with a spread
  of 0.19 (`replication/qwen3_tts.md:32 "33.91±13.06"`). The table reports both
  without comment; a spread that size is a failure signal to trace, not a mean to
  publish.
