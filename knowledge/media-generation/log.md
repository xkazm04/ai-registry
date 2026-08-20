# Log — media-generation bundle

Audit trail (OKF reserved file). One block per event that changed or
validated this bundle's content. Public-safe by rule: no private paths, no
operator preferences — those live consumer-side.

## 2026-08-20 — deepen run: image-prompt-composition

- Trigger: /deepen undercooked scan (deterministic signals + gap thesis);
  operator chose image-prompt-composition over four higher-scoring
  candidates as the mastery target.
- Research: 5 lanes (landscape, artstyle specifics, counter-evidence,
  recognition judges, training-data-only). 24 raw findings → 11 presented
  → 11 accepted.
- Corrections (4): 77-token truncation scoped to short-window caption
  encoders; negative prompts scoped to guidance-based models; no-text ban
  reframed capability→architecture; style restatement bounded by current
  reference-conditioning (lands in visual-style-locking).
- New techniques (2): prompt-dialect-matching, medium-vocabulary-locking
  (image-prompt-composition: 6 → 8 techniques).
- New applications (2): process--vendor-fact-ledger (generative-provider-
  routing; dated 2026-08 model landscape), process--vision-model-grading-
  schema (generated-output-grading; judge tiers + biases).
- Technique boundary notes (3 files): two-grader-disagreement-rule,
  unconditional-fail-criteria, shape-language-over-nouns.
- Local probe (n=5+5, one judge family, style-lock fixtures with known
  ground truth): scalar-vs-countable-contract scoring was perfectly stable
  (5/5 identical); pairwise-vs-anchor-image was not (3/5 correct, misses
  in both orders). Recorded in the grading application's appendix with
  confounds stated.
- Sources: 30+ URLs, recorded per document; all edits gate-clean
  (check-bundles) at each commit.
