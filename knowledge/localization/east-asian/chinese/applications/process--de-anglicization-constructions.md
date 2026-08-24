---
layer: application
type: application
subject: chinese
technique: de-anglicization-constructions
stack: process
status: forged
verified_on: 2026-08-24
---

# Process — de-anglicization findings from a shipped zh catalog

The Personas Chinese style guide
(`C:\Users\kazda\kiro\personas\docs\i18n\style-zh.md`, "Pitfalls" section)
records each de-anglicization rule with the exact wrong form that shipped in
`src/i18n/locales/zh.json` — incident-shaped evidence for the technique's
rules, verified against the 2026-07-10 source audit of ~11,500 keys.

## ZH-CODE-SWITCH, caught live

Pitfall §2 ships the canonical half-translated sentence:
`"无pending reviews for this 人格."` — corrected to
`"此人格当前没有待处理的审核。"`. The guide's ruling matches the technique
verbatim: a half-Chinese sentence reads as broken, not bilingual; not
knowing a word is a flag-for-review case (glossary §4), never a partial
translation.

## ZH-DE-CHAIN and ZH-PRONOUN-DROP, as recorded MT calques

Pitfall §4: `人格的监视器` / `触发器的条件` corrected to `人格监视器` /
`触发条件` — the guide names the mechanism (English always needs
"of"/possessive; MT propagates it as 的) exactly as the technique teaches.
Pitfall §6: the three-您 sentence
`您可以随时点击您的头像来查看您的设置` corrected to `点击头像即可查看设置`,
with the register-side ruling (keep 您 for the first reference where warmth
matters, then drop) recorded in the guide's Register section alongside its
428-您 / 81-你 count.

## The skeleton incident that ranks above all style findings

Pitfall §1 is the live shipped bug the bundle's first law describes:
`monitor.subtitle` shipped as
`"{人格s} 人格s · {attention} need attention · {running} running"` — the
placeholder name `{personas}` transliterated to `{人格s}`, which the
runtime's exact `\w` match never resolves, so raw braces rendered on screen.
In the review process this is typed **critical** unconditionally, while
every 的-chain and pronoun-stack finding in the same file is a style-severity
finding — the two-tier severity is what lets a bulk audit fix the
render-breaking defect first.

## Half-width residue as measured backlog

The guide counts ~483 raw ASCII `...` (plus 4 stray `……` doubles) still in
the shipped file and rules them leftover MT output, not house style — the
process lesson being that a residue class this greppable is cleaned by one
scripted sweep gated on the do-not-translate list (code/CLI strings keep
ASCII), not by per-string review.
