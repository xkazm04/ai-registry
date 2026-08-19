---
layer: application
type: application
subject: generative-provider-routing
technique: cost-per-usable-economics
stack: process
status: forged
---

# Process — the style-trial grid that re-ordered a vendor plan

How `gravitone-gcloud` produced a routing-grade cost number and acted on it:
a 6-style x 5-beat measurement grid, a binary usable bar, and a plan flip
recorded where the plan lives.

## The grid

Six style blocks x five beats from the repo's own Bitcoin script, rendered on
both candidate vendors — 60 graded cells, driven by
`pipeline/build-style-trials.mts` and read with
`npx tsx pipeline/report-style-trials.mts` (`docs/imaging.md:180-216`). Every
cell is graded by a vision model against the brief that made that plate, not
against a generic quality rubric.

## The bar, defined before grading

A plate is **usable** only if it is on-brief *and* free of rendered text —
text is an unconditional fail "because captions are the vector layer we draw
ourselves" (`docs/imaging.md:191-193`). The raw quality reads were
`google: on-brief 93%, text leak 10%` vs `leonardo: on-brief 47%, text leak
57%`; collapsed to the binary bar:

```
leonardo   7/30 usable (23%)   $0.0257/render  ->  $0.110 per usable plate
google    26/30 usable (87%)   $0.0450/render  ->  $0.052 per usable plate
```

The vendor charging 1.75x per render is *half* the price per usable plate
(`docs/imaging.md:195-201`). The premise Leonardo was chosen on — better
quality per credit — inverted the moment quality meant "a plate you can
composite".

## What made it a verdict, not a sample

Two checks, both worth copying (`docs/imaging.md:203-208`): fourteen cells
flipped between vendors **and every one flipped the same way** — no task in
the grid where the loser won; and the motivating failure proved model-bound,
not prompt-bound — Leonardo drew the countable mechanism 0/6 across six
*unrelated* style blocks, where the rival drew it 4/6. "A failure that
survives six different prompts is not a prompt problem."

## Acting on it, and recording it where it acts

The dev plan in `lib/imaging/router.ts:58-79` was flipped to
`generate: ["google", "leonardo"]`, with the full measurement restated in the
comment above the row — "MEASURED, not assumed" — so the number and the
decision it drives live one screen apart. Leonardo stays in the chain as the
refusal re-route target and "the cheaper option for work where being on-brief
does not matter" (`docs/imaging.md:215-216`): the verdict ordered the plan,
it did not purge it.

## The pricing hygiene underneath

The per-render figures feed `lib/imaging/pricing.ts:94-133` as `estimated`
rows whose `source` says exactly what they are: "our spend over our render
count, not a rate card", each with a `checked:` date. The file's rule
(`pricing.ts:10-14`): never invent a price — rows without a measurement are
`unpriced` with the reason recorded, a vendor-reported figure always outranks
the table, and an unpriced call surfaces as unknown, never as $0.00. The
grid's rate is also size-bound: the Google row carries `atSize: "1K"`, and a
call at any other size quotes unpriced because "the price does not scale
linearly across sizes" (`pricing.ts:70-78,205-213`).

## Residuals the method flagged, honestly

Two-grader disagreement on the same plate (`docs/imaging.md:134-137`) — one
vision model said `isFlat: true`, another `isFlat: false` with identical
colour readings — established that a single grader is an opinion, so gating
judgments ask two and treat disagreement as "needs a human". And per-plate
variance (`docs/imaging.md:176-178`: the same prompt leaked text in one run
and not the next) is the argument for grading every plate rather than
sampling — acceptance is a rate, not a property of the prompt.
