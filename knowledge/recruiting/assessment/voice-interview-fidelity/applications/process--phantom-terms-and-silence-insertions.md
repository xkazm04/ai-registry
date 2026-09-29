---
layer: application
type: application
subject: voice-interview-fidelity
technique: phantom-terms-and-silence-insertions
stack: process
status: forged
verified_on: 2026-09-29
applied: simulation
ab_verdict: unmeasurable
---

# The recall gate cannot see a phantom: kp's entity metric, run both ways

The technique claims a recall-only entity gate passes a transcript that added a
skill nobody said. kp's harness has exactly that gate, so it is a direct test.
Nothing in kp was changed; the metric was exported from the commit and run in
scratch.

## What was run

`pipeline/jobfit/eval/voice/wer.py` at kp `60aab8088`, unmodified, plus one variant
computed beside it:

- **A, shipped** — `entity_fidelity(said, heard)`: recall over spoken lexicon terms,
  `ok` when none is missing (`wer.py:242`, `:238`).
- **B, with the precision side** — the same, and additionally
  `domain_terms(heard) - domain_terms(said)`, the lexicon terms that were heard and
  never said; `ok` only when nothing is missing and nothing is a phantom.

Inputs: the three recorded ASR pairs kp commits in
`pipeline/jobfit/eval/voice/fixtures/entity_pairs.json` (the Czech corruption, a
clean English pair, a clean inflected Czech pair), and four **planted**
insertion-only variants built from those pairs' own said-text. In each planted
case every spoken term survives and one lexicon term is added: a biasing-style
insertion in English (`Kubernetes`), in Czech (`Kafka`), a term inserted mid-answer
(`Terraform`), and terms written over a stretch containing no lexicon at all
(`Python`, `Docker`, after "thank you for the invitation").

## Result

| Case | Kind | WER | A | B |
| --- | --- | --- | --- | --- |
| `v1_corruption` | real | 0.231 | fails, missing react, postgresql | fails, same, phantom `rust` |
| `clean_en` | real | 0.000 | ok | ok |
| `inflected_cs` | real | 0.000 | ok | ok |
| bias insert, en | planted | 0.154 | **ok** | fails, phantom `kubernetes` |
| bias insert, cs | planted | 0.182 | **ok** | fails, phantom `kafka` |
| mid insert, cs | planted | 0.091 | **ok** | fails, phantom `terraform` |
| silence insert | planted | 0.400 | **ok** | fails, phantoms `docker`, `python` |

- **Real pairs: 1 of 3 fail under both, verdicts identical.** B adds one thing:
  it names `rust`, the string the recogniser wrote in place of React, which is the
  `heard` form a read-back would have to list.
- **Planted: A fails 0 of 4, B fails 4 of 4.** Every planted case passes the shipped
  gate with recall 1.0. In the silence case the reference holds no lexicon term, so
  `entity_fidelity` returns recall 1.0 over zero terms and `ok`, however much the
  transcript invented.
- **No clean pair was failed by B.** 0 of 2 real clean pairs.

## What this does and does not show

The four planted cases are constructed from documented behaviours, a vendor
tuning guide saying boosted terms can be transcribed unspoken, and audits of open
models writing text over non-speech. They show that the mechanism is invisible to the
shipped gate, and nothing more. **No real pair in the tree contains an
insertion-only error**, so how often a live kp interview contains one is unmeasured;
that is why the verdict is `unmeasurable` and not `better`. The only real evidence of
a phantom is the one already in the corruption, where it accompanies a loss.

A null-audio control through a keyed recogniser would measure the biasing cause
directly and was not run: it needs a live recogniser and minutes, and the harness is
sealed offline by default.

Falsifier: a corpus of real (said, heard) pairs from the same recogniser with the
boost list on, in which phantom terms occur at zero. Then B is dead weight, and the
technique keeps only the third step (the control) as a check that the list is safe.

## Where the seam is

kp's `wer.py` would need the set difference in `entity_fidelity`, and
`voice_checks` a `phantom` failure beside `missing`. The connect-time keyword list
(`app/_lib/voice/asr-keywords.mjs`) is where the null-audio control belongs before
`BASE_ASR_KEYWORDS`, which holds both React and Rust, is changed or grown.
Not edited here: kp's main was 47 commits ahead of origin and carried sibling work
in its working tree.
