---
layer: application
type: application
subject: judge-calibration-and-drift
technique: golden-set-agreement-measurement
stack: process
status: forged
applied: 2026-08-20
refresh_by: 2026-11-20
verified_on: 2026-08-20
---

# Process: the calibration field layer, dated 2026-08-20

This application records where the published field stood on 2026-08-20
against this subject's claims — the committee defense the sibling
judge-contract survey handed across, and a training-data audit of the
kappa bars, spread-based selection, and persistence conventions. Re-verify
by the refresh date; the adversarial half of this literature turns over in
months.

## Committees: the calibration-side answer to in-band attack

The judge-contract subject's 2026-08-20 survey established that
optimization-based in-band attacks (JudgeDeceiver, arXiv:2403.17710)
bypass boundary fencing unflagged, and that the strongest measured defense
sits outside the prompt: **mixed-model committees cut attack success to
10–19% at seven mixed models** (arXiv:2504.18333), where single frontier
judges sat near 35–42% and small ones near 66%. The mechanism is transfer
failure — a sequence optimized against one model steers the others poorly
— which is why family *diversity*, not headcount, carries the effect.

Independent support that committees are not only a security device: PoLL
(arXiv:2404.18796) found a panel of three smaller judges from disjoint
families outperformed a single GPT-4 judge on correlation with human
labels at roughly a seventh of the cost, while diluting single-model
self-preference. So the committee earns its seat twice — robustness under
attack and bias dilution under honesty — and this subject's discipline
(the committee is one instrument with its own verdict tuple and history;
hostile fixtures are a calibration stratum) is the part the papers leave
unsaid: nothing in the attack literature tells you the committee's own
kappa, and only a golden set with an attack stratum can.

## Kappa bars: confirmed, with a prevalence caveat worth carrying

The 0.6 floor / 0.8 strong convention traces to Landis & Koch (1977)
(0.61–0.80 "substantial", 0.81+ "almost perfect") and matches current
LLM-judge meta-evaluation practice. The counter-evidence found is the
**kappa paradox** (Feinstein & Cicchetti, 1990): under heavy prevalence
imbalance, kappa can sit *low despite high genuine agreement* — the
inverse of the rubber-stamp failure the technique guards against.
Alternatives that hold up better under imbalance exist (Gwet's AC1;
Krippendorff's alpha for multi-annotator sets). Verdict: the technique's
guidance survives — kappa quoted with its threshold, degenerate cases
handled explicitly — but on a golden set whose pass rate cannot be kept
near balance, a low kappa is a lead to inspect the contingency table, not
by itself proof of a bad judge. The bar stays; the reading gains a caveat.

## Spread: confirmed by the score-compression literature

Score compression is a documented LLM-judge pathology, not a local
observation: judge score distributions cluster in a narrow high band
(reported for G-Eval-style direct scoring, and the reason Arena-style
evaluation reports *separability* of rankings as a first-class property).
Field selection practice still leans on raw human-agreement rates
(MT-Bench's ~80%-agreement framing); the discrimination-first doctrine
here remains ahead of common practice, and nothing found contradicts it.
One refinement candidate, not applied: AUC over the good/bad strata is the
statistically standard form of "spread" and is threshold-free; the mean-gap
form stays because it is readable per-item, which the technique's
rotten-middle rule depends on.

## Reserved-rubric persistence: verified, untouched

No published counter-evidence. The convention rhymes with how the current
observability platforms (Langfuse, Phoenix) store eval scores in the same
score table as product telemetry, but none of the surveyed tools make
meter-on-its-own-dial calibration history a first-class pattern, and none
carry the no-restatement discipline explicitly. This remains the subject's
standard rather than field consensus — a real gap, not a survey omission.

## Sources

arXiv:2504.18333 (attack taxonomy + committee defense) · arXiv:2403.17710
(JudgeDeceiver, CCS 2024) · arXiv:2404.18796 (PoLL, panel-of-juries) ·
Landis & Koch 1977 · Feinstein & Cicchetti 1990 (kappa paradoxes) · Gwet
AC1 / Krippendorff alpha literature · MT-Bench (arXiv:2306.05685) ·
sibling survey: judge-contract-design/applications/
process--nonce-fenced-candidate-isolation.md (2026-08-20).
