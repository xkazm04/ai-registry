---
layer: application
type: application
subject: content-research-grounding
technique: provenance-signal-asymmetry
stack: react
status: forged
verified_on: 2026-10-14
verified_against: react@19
applied: simulation
ab_verdict: unmeasurable
---

# React: the vocabulary was right and the sketch still said boolean

*Verified against the consuming tree at commit `d13a0ce`, 2026-10-14.*

The technique says origin marks are three-valued at minimum (detected, not
detected, not checked), and that a negative moves nothing. The seam hunt was
chosen to falsify "this tree already holds that": find a consumer that reads
an absent mark as clearance, or a place where the three states collapse.

## What the tree holds

- The audio asset schema carries `c2pa` as an enum of
  `claimed-by-provider | absent | unknown`, default `unknown`
  (`packages/schemas/src/index.ts`, `AudioAssetSchema`). All three states are
  distinct and "not checked" has its own name.
- Both producers (`packages/audio/src/generate.ts`, `apps/server/src/pipeline.ts`)
  write only `unknown`, with a comment that provider marks may not survive the
  AAC re-encode and are never claimed. That is the dilution argument, held
  without the technique.
- No gate, policy or disclosure reads the field. The AI-disclosure line derives
  from what was generated (`kind`), not from any mark, which is the
  technique's "a claim about your process, not a detector's output".
- No consumer promotes on `absent`; the only reader is a display string in the
  render gate page.

## What disagreed with itself

`DESIGN.md`'s manifest sketch showed `"c2pa": true` while the schema and
ADR 003 kept the three states apart. A boolean is exactly the collapse the
technique warns of, and a future consumer written from the sketch would read
`true` as a claim about the whole asset. Fixed in stat-reel `28e2316`
(sketch now shows `"unknown"`).

## Verdict

Technique held; no amendment. Not measurable: nothing in the tree writes
`claimed-by-provider` or `absent` yet, so there is no positive or negative to
walk under both policies. The research side of the pipeline has no source-origin
detector either, so the "an unmarked source does not move up the ladder" half
has no seam.

Return condition: when a producer starts writing `absent` or
`claimed-by-provider`, read every consumer of the field for a branch that treats
`absent` as clearance. The instrument is a grep of readers plus one gate case
per state. Floor declared: no verdict changes for existing runs (all `unknown`).
