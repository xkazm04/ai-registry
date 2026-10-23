---
layer: application
type: application
subject: translation-quality-measurement
technique: engine-quality-from-reviewer-corrections
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: experiment
ab_verdict: better
---

# A git history read as a correction log (kp)

`kp` at `79326e4ead`. The node version is witnessed by `package.json` `engines`
(`>=24 <25`) and the CI `node-version: 24` pin. The catalogs are an English source
and three targets (cs, de, fr), each about 14,400 translated units at HEAD. A model
writes every target value, and dated review passes (also model-run, with a
native-review queue per locale for the calls they leave open) correct some of
them. No store keeps a machine pretranslation beside a final text, and nothing
reports a per-locale quality number. The history does keep both texts, though.
A unit's value at the commit that introduced it is the machine text. Its value
after a review commit that left the English unchanged is the reviewer's text.

The seam was chosen to falsify the technique. The reviewers are a model pass
rather than people, and the store is git rather than a review tool. If
"approved unchanged" could not see engine differences here, the technique's
claim that reviewers' corrections are the most direct quality signal would not
reach a store like this one.

## What ran

A replay of 944 non-merge commits to the four catalogs. Each commit was diffed
against its first parent per locale, giving 60,010 value-change events (two
commits had unparsable catalogs and were skipped). A correction is a change to
a target value whose English value held across the commit. The instrument's
known positive came from another layer: a commit whose message says it fixed
one Czech plural sentence. It came back as exactly one correction on that key.

- **Arm A, the naive store-wide rate.** At HEAD, the share of translated units
  never changed since their source last changed.
- **Arm B, the technique.** The rate over each review pass's own population (the
  units present at its parent), with the reviewed count beside it. Arm B adds
  the rule-epoch split the amendment describes: a rejection that vanishes once
  dashes, quote glyphs, whitespace classes and spacing around punctuation are
  normalized counts as policy, not engine.

The independent check was each locale's native-review queue. That is a separate
file of typed error records, and the replay does not read it. Major and
critical rows: cs 32, de 13, fr 10. So the expected order is cs worst, fr best.

| Instrument | cs | de | fr | Order matches queue? |
| --- | --- | --- | --- | --- |
| A, store-wide at HEAD | 93.5 | 97.3 | 92.3 | no (fr worst) |
| A, units from before the last full review | 84.1 | 93.2 | 80.9 | no |
| B, full sweep under a new rulebook (2026-08-05), raw | 78.4 | 82.3 | 68.4 | no |
| B, same pass, policy rejections dropped | 93.5 | 97.3 | 97.5 | yes |
| B, full review, no rulebook change (2026-08-12) | 95.8 | 96.8 | 97.3 | yes |

All rates are percent approved unchanged. At the 2026-08-05 pass, 1,685 of fr's
1,829 rejections were policy, against 878 of 1,259 for cs and 865 of 1,021 for
de. Over the whole history, policy rejections are 43, 67 and 82 percent of all
corrections in cs, de and fr. Mean chrF between machine and reviewer text over
substantive rejections at the clean 2026-08-12 pass was 0.67 to 0.75.

The coverage trap also showed up in the numbers. 63 percent of each locale's
current units were introduced after the last full review. Those units read 99
percent "unchanged", and they lift the store-wide rate 9 to 13 points above the
reviewed population's. That is exactly the "steady" a dashboard would have shown.

## Verdict

**Target:** whether the per-locale order agrees with the independent queue. Arm
A got it wrong both ways it was read. Arm B, as the technique was written,
also got it wrong at the rulebook-change pass, and it agreed only once policy
rejections were split out. With no rule change, it agreed on the raw count.
**Floor:** the instrument's known positive was recovered, every count reports
its denominator, and no product code changed. Verdict: `better`, on the
technique as amended. The amendment ("When the rulebook moved, not the engine")
came from this seam. Three locales give a weak ranking (one in six orders
agrees by chance). The 9-to-13-point coverage inflation and the 14-point policy
spread do not depend on that ranking.

## What this realization cannot do

The reviewer is a model. Its rejections measure disagreement between two
machine passes, so the signal ranks engines only as well as the reviewing pass
can judge them. A review pass leaves no record of the units it read and kept,
so the denominator is an inference: that a "full" pass opened every unit
present at its parent. A scoped pass, like the 2026-09-18 one, has a smaller
population that the commit does not state. Merge-commit conflict resolutions
are not attributed. The adoption would be a script beside the catalog checker
that emits this table per review commit. It is filed as the project's next
change, not shipped.

## Proof

`proof: ab-paired`. The same history through both arms, read against a layer
neither arm reads.
