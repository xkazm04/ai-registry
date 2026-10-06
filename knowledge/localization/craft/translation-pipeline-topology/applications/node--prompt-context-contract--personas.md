---
layer: application
type: application
subject: translation-pipeline-topology
technique: prompt-context-contract
stack: node
status: forged
verified_on: 2026-10-06
verified_against: node@22
applied: code
ab_verdict: better
---

# The note was written and never sent: attaching author notes to the gap work chunks (personas)

`personas` before and after `62df24375` (2026-10-06). The node version is witnessed by
`.nvmrc` (`22`), which CI reads. The project's translation fan-out builds one work file
per locale and section and hands each file to a translator subagent. Its source catalog
carries 358 `_comment_<leaf>` notes, written per key for the translator. The translator
skill the project links in from this registry (`i18n-translate`) names "the
human-written context note" as a field every unit carries. The project's contract calls
the notes translator notes:
`docs/i18n/contract.md:73 "translated, copied verbatim (`translate-extract.mjs` splits them out)."`
The fan-out did not attach it. Every chunk held `strings` alone, so the field the
contract lists first after the key had a 0% delivery rate.

## The change

Each chunk now carries a `notes` map for the keys that have one. A note for `a.b.leaf`
is read from `a.b._comment_leaf`:
`scripts/i18n/plan-gaps.mjs:60 "const noteOf = (k) => {"` and
`scripts/i18n/plan-gaps.mjs:93 "...(Object.keys(notes).length ? { notes } : {}),"`.
The merge step reads `strings` from the chunk and nothing else, so it is untouched:
`scripts/i18n/merge-chunks.mjs:78 "const srcAll = JSON.parse(fs.readFileSync(t.file, 'utf8')).strings;"`.
This is the technique's rule that the pipeline attaches whatever is mechanically
derivable, and a note keyed beside its unit is exactly that.

## Proof

`proof: ab-paired`. The live catalog had zero gaps, so both arms emitted nothing, which
is identical by default. A fixture fixed that: 140 sampled keys were reverted to English
in `cs.json` inside two exports of the same commit, and the old and new scripts ran with
`--lang=cs`.

| Measure | Old | New |
| --- | --- | --- |
| Gap keys / tasks | 134 / 2 | 134 / 2 |
| `strings` maps | identical | identical |
| Notes delivered to noted gap keys (target) | 0 / 65 | **65 / 65** |

The effect on output was measured in the companion run (the application of
`context-sufficiency-signals` in the translation-quality-measurement subject). Two
local engines translated 70 noted units into Czech with and without the note. 43 of 140
renderings changed, and a blind judge preferred the noted arm 16 to 8, with 11 ties and
8 both wrong (p ≈ 0.15). Placeholder parity held at 0 failures in both arms. This
measures a direction, not significance.

## What it cannot do

Notes exist for 1.5% of keys, and the delivery fix reaches only those. The three-step
extract flow still writes notes to a file separate from the strings:
`scripts/i18n/translate-extract.mjs:58 "const commentKeys = all.filter(isComment);"`.
A translator working from that flow sees them only if it opens the second file. The
other contract fields (surface, occurring glossary terms, placeholder map) are still
the subagent's job to look up rather than the pipeline's job to attach.
