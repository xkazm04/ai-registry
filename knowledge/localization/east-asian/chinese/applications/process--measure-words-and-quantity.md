---
layer: application
type: application
subject: chinese
technique: measure-words-and-quantity
stack: process
status: forged
verified_on: 2026-10-14
applied: experiment
ab_verdict: better
---

# Process - counting classifiers and plural keys in a shipped zh catalog

**A (as shipped).** A scripted pass over the zh catalog found 1,458 strings where
a count placeholder is directly followed by Chinese. 1,366 (94%) carry a
classifier or a unit noun; 92 do not. Of the 92, most are legitimate: a unit that
is itself the counter (跳, 字, 处), a predicate or status tail (`{count} 运行中`,
`{count} 更多`) or an index placeholder. Four were the broken bare calque the
technique names (`{count} 团队`, `重试 {count} 失败`, `{count} 曲目`,
`{count} 选定的资产`). Of 246 `_one`/`_other` pairs, 34 differ; the differences
are overwhelmingly the permitted literal-digit mirror (`1 项能力` against
`{count} 项能力`), so ZH-PLURAL-OTHER held.

**The seam the count did not predict.** The same scan for a Latin plural `s`
glued to Chinese found nine strings: `{count} 团队s` and eight English sentences
carrying `人格s` or `团队`, left half-translated by a terminology substitution
that rewrote the noun and kept the English plural. That is invented plural
morphology plus code-switching in one defect, and a classifier audit alone would
not have found it.

**B.** Four classifiers added (个团队, 项失败, 首曲目, 个选定的资产) and seven
sentences retranslated whole. The coverage gate reports 0 gaps across 13 locales.

**Floor.** Key count and per-locale coverage unchanged (24,778 each). Not
measured: whether any consumer interpolates the strings with a count that
makes 项失败 wrong (the `Retry N failed` button counts failed runs).

**Calibration.** Count before rewriting: 94% adoption means the classifier half
is a spot-fix, not a re-translation. The audit worth adding is the glued-`s`
grep, one line, zero false positives here.
