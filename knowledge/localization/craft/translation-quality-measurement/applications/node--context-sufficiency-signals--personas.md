---
layer: application
type: application
subject: translation-quality-measurement
technique: context-sufficiency-signals
stack: node
status: forged
verified_on: 2026-10-06
verified_against: node@22
applied: experiment
ab_verdict: not-better
---

# Two engines, one catalog, seventy blind labels: divergence flagged at the base rate (personas)

`personas` at `ea56887baa`, with the change this run shipped at `62df24375`. The catalog
is `src/i18n/locales/en.json`. It holds 23,893 keys, 358 of them `_comment_<leaf>` notes
written for the translator, and 13 target locales. The node version is witnessed by
`.nvmrc` (`22`), which CI reads. The target language was Czech, which marks gender,
aspect and case that English leaves open. That makes it a fair test of the technique's
claim that divergence in one language usually names a source gap.

## What ran

The two engines were gemma4 (12B) and qwen3.8 (27B), served locally at temperature 0
with seed 1 and thinking off. Each unit was translated alone. The two outputs were
normalised (placeholders masked, punctuation and case folded) and compared with chrF
(character 6-grams, beta 2). Divergence is 1 − chrF.

The sample was 70 units drawn from the 324 that carry a note, plus 70 drawn from the
22,748 that do not, with a seeded shuffle. The arms:

| Arm | Context delivered | Units |
| --- | --- | --- |
| A | key + English, which is what the gap pipeline delivered | noted |
| B | A + the unit's own author note | noted |
| C | A + another unit's note (placebo) | noted |
| U | key + English | unnoted |
| D | U + the project glossary and Czech style guide in full, as the translator skill reads them | unnoted |

Two Sonnet subagents served as instruments. Neither saw a score or the other files. The
**labeller** marked each of the 70 unnoted units sufficient or insufficient for a Czech
translator, counting only a missing referent, a part-of-speech or sense ambiguity, or a
forced grammatical choice. Near-synonyms and loanword policy did not count. The
**judge** saw each case where an engine's A and B renderings differed. It saw them in
random order, with the note given as ground truth, and picked the better one, a tie, or
both wrong.

## What it measured

| Measure | Result |
| --- | --- |
| Insufficient units (labeller) | 4 of 70 (5.7%) |
| Flags at divergence > 0.5, arm U | 24, **1** true (4%) |
| Flags at > 0.3 / > 0.7, arm U | 35 with 2 true / 10 with 0 true |
| Flags at > 0.5, arm D (glossary + style delivered) | 21, **1** true |
| AUROC of divergence for the label | 0.44 (U), 0.56 (D), on 4 positives |
| Mean divergence A / B / C | 0.423 / 0.421 / 0.411 |
| Per-unit change A→B | 16 down, 17 up, 37 tied (sign test p = 1.0) |
| Mean divergence U / D | 0.318 / 0.312 (19 down, 18 up) |
| Renderings changed by the note (A vs B) | 43 of 140 |
| Judge on those 43 | note arm 16, no-note arm 8, tie 11, both wrong 8 (p ≈ 0.15) |
| Placeholder parity failures (floor) | 0 in every arm |

A second label set was already committed, and it needed no labeller. The project's
source-defect register held 26 keys that still resolve in the catalog. Its reviewers in
13 locales had filed those keys as defects in the English source. Both engines
translated them as in arm U:

| Measure | Register keys (26) | Random note-less units (70) |
| --- | --- | --- |
| Mean divergence | 0.300 | 0.318 |
| Flagged at > 0.5 | 3 (12%) | 24 (34%) |
| Flagged at > 0.3 | 15 (58%) | 35 (50%) |
| AUROC, register vs random | 0.49 | |

Some register rows are classes the technique already excludes: frozen plural branches,
which a rule decides, and two keys naming one step differently, which no single-unit
comparison can see. Seven register keys drew identical renderings from both engines,
among them "Set Up Agent" and "Adopt agent", which name the same step.

The **target** was flag precision above the 5.7% base rate, and it did not move. The
**floor** was placeholder parity, and it held. The verdict is `not-better`.

## Why it did not hold here

- **Two of the four insufficient units had divergence 0.00.** For "Open variant" both
  engines wrote `Otevřít variantu`, the imperative. For "{count} blocked" both wrote
  `{count} zablokováno`, a neuter singular. The shared default reading hides the
  ambiguity completely.
- **The flags are mostly not about the source.** The director's read of the 24 flags is
  opinion, not the verdict. About 12 are termbase choices: `Varování`/`Upozornění` for
  "Warning", `koncept`/`draft` for "Draft", `vzpomínky`/`paměti` for "Memories". About
  6 are engine errors: an invented word for "Pipeline traces", `tento dvojča`, `lidskou
  zásahu`. About 6 plausibly name a source gap: the referent of "Failed ({retry}/{max})"
  and of "Degraded", noun or verb for "Plan rail" and "Build {title}". The labeller
  counted only one of those six, so the two readers disagree on referent-gender cases.
  Even on the generous read, three flags in four would have gone to the source owner
  for a decision that is not theirs. Delivering the glossary (arm D) did not change
  that mix. "Notifications" still split `Upozornění`/`Oznámení`.
- **The author note fixes meaning without reducing divergence.** "Credential gaps" went
  from `Mezery v přizváních` / `Chybějící údaje` to `Chybějící přihlašovací údaje` from
  both engines. "Runners" moved from the people sense (`Běžci`) to the tool sense. Over
  the whole set, though, divergence moved 0.002, less than the placebo did. Divergence is
  not measuring the thing a context note repairs.

## The structural fact

The project already holds the technique's fix, a human-written context note per key,
and its pipeline threw the note away. The contract names the notes:
`docs/i18n/contract.md:73 "translated, copied verbatim (`translate-extract.mjs` splits them out)."`
The translator skill the project links in from this registry (`i18n-translate`) lists
"the human-written context note" among the fields every unit carries.
Before `62df24375`, the gap pipeline wrote `strings` alone into every work chunk, so 0
of 358 notes reached a translator. The cheaper instrument on this tree was never two
engines. It was counting delivered notes. That change shipped:
`scripts/i18n/plan-gaps.mjs:93 "...(Object.keys(notes).length ? { notes } : {}),"`
(the companion application is in the translation-pipeline-topology subject). The
three-step extract flow still separates notes from the strings:
`scripts/i18n/translate-extract.mjs:58 "const commentKeys = all.filter(isComment);"`.

## What this realization cannot say

Both engines are mid-size local models below ceiling in Czech. Engine error is a
quarter of the flags here, and it would shrink with the production engine as one arm.
The labeller and the judge are one model family each and are not the source owner.
Four positives cannot support a precision interval, only the statement that 1 of 24
flags is the base rate. The return condition: rerun arms U and D with the production
engine as one arm, and put the four labelled units to the owner, whose confirmations
are the precision worth keeping.

## Proof

`proof: ab-paired`. The arms are A/B/C on 70 noted units and U/D on 70 unnoted units,
two engines each, 560 + 140 calls, at the same seed and settings. The source-gap
candidates were filed for the owner in `docs/i18n/source-defects.md` (commit
`bad262c0c`), marked unconfirmed.
