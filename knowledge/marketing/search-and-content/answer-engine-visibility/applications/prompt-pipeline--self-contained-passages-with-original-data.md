---
layer: application
type: application
subject: answer-engine-visibility
technique: self-contained-passages-with-original-data
stack: prompt-pipeline
status: forged
verified_on: 2026-10-14
refresh_by: 2027-01-14
verified_against: prompt-pipeline@2026.10.14
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# Prompt pipeline: the drafter already carries a brief's figures; the lever is its block vocabulary

An advertising workspace drafts publishable articles from an approved brief. The brief's
outline points can hold the business's own prices, counts, durations and dates. The
technique's second half says those figures must reach the page exactly, with unit, currency
and period in the same sentence as their subject, and that three or more comparable
figures belong in real table markup.

## What was tested

Seam chosen to falsify "the drafting prompt silently loosens or drops supplied figures": three
Czech briefs (a painting firm with a price list, a running-shoe shop with specs, a nut shop with
per-kilo prices), each outline point carrying figures with units and a year, two repetitions
per arm. Arm A was the production system prompt, which already holds the answer-block and
no-invented-figure rules. Arm B added one rule: carry every supplied figure verbatim, with
subject, unit and period in the same sentence, never rounded, and group three or more
comparable figures in one list. A caught outcome would have been figures lost or softened
in A; that is what would have justified shipping B.

## What came back

| Measure | A | B |
| --- | --- | --- |
| Figures from the brief present verbatim in the draft | 46 of 46 | 46 of 46 |
| Numbers in the draft that no brief contained | 2 | 2 |
| Softening words (about, roughly, approximately) | 6 | 4, all echoing a "roughly 800 km" the brief itself carried or a lead-in |
| Structure intact (one callout, one call to action, three headed sections, two answers) | 6 of 6 | 6 of 6 |

The target did not move: with the facts handed over as structured outline points, the baseline
already reproduced them with units, and grouped three prices into one list unprompted. So the
rule would have bought nothing and changed a prompt fingerprint and a golden. Nothing shipped.

## What is left

The table half is unreachable by prompt: the drafter's flat schema and its normaliser accept
paragraph, heading, list, callout, call to action and figure blocks only, and silently drop any
other kind, although the article model supports table, stat and quote blocks. A price list
therefore lands as a list of strings. Adopting the table shape is a scoped task (schema, a
strict row normaliser that rejects ragged rows, the prompt rule, a golden re-bake), measurable
as the share of drafts with three or more supplied figures that render one table.

## Limits

n is twelve generations on constructed briefs, one model that is not the one this app serves
in production, a regex reading of "verbatim". Return condition: a brief class whose figures
arrive as free prose rather than outline points, where the carry-over could genuinely fail.
