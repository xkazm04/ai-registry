---
layer: application
type: application
subject: narrative-engine-selection
technique: fit-vs-hazard-axes
stack: process
status: forged
verified_on: 2026-09-26
applied: simulation
ab_verdict: better
---

# Hazard lines in a video studio's hostile-review notebooks (process)

The source studio's first hostile-review sweep (2026-08-12) had domain seats
research a topic into a notebook and score every catalogue engine against
it. Each `engine_fit[]` row carries a `fit` grade and a free-text `hazard`
line, the shape this technique prescribes. Three seats wrote hazard lines
for the adjudication engine on subjects involving named parties. They are
the evidence for the amendment this pass made: a verdict carries a level of
imputation, and the level can be pitched where the evidence stands.

All paths are under `gauntlet/runs/2026-08-12-l1-first-sweep/l2/`.

## The three cases

- **Public procurement** (`public-corruption/notebook.json:651`). Adjudication
  fits "good", hazard "HIGH": the question is "expressly unsettled by the
  bodies empowered to settle it, so an honest D produces a verdict of 'not
  established', which is D's least watchable ending and the exact place a
  renderer will be tempted to improve on the record." The notebook's own
  verdict (`:15`) is already pitched at that level: "the route was found
  defective, and the awards were not found to have been bought."
- **Conflict open-source intelligence** (`conflict-osint/notebook.json:693`).
  Adjudication fits "excellent". Hazard: a confident ruling on "two months
  old, unverified" counts from interested parties "is a stronger claim than
  the evidence can carry — Mitigable: the ruling must be about the METRIC,
  which is fully checkable, and never about the campaign, which is not."
- **Creator economy** (`creator-economy/notebook.json:455`). Adjudication fits
  "excellent". One candidate is a published plagiarism finding about named
  living people: "The honest move is to drop the candidate and say why —
  which weakens the adjudication. That trade is the hazard."

The same notebook as the first case also carries the refusal the technique
predicts for insinuation (`public-corruption/notebook.json:672`). The paradox
engine is refused outright because "repeating a contradiction about a public
body while asserting nothing is insinuation with a runtime: it produces the
imputation in the viewer and leaves nothing on the page to defend."

## A/B, walked over the three adjudication rows

- **A** is the arbitration rule as the studio wrote it, and as the technique
  stood before this pass: "Drop every fit whose hazard line you would not
  defend on air" (`knowledge/ENGINES.md:342`). It is binary, keep or drop.
- **B** adds the level: a verdict about people is an imputation at a grade
  (guilt, reasonable grounds to suspect, grounds to investigate), and it is
  pitched at the grade the record carries.

| Case | What the seat decided | Expressible under A | Under B |
| --- | --- | --- | --- |
| public procurement | keep D at "not established" | no: neither keep-as-is nor drop | yes |
| conflict open-source intelligence | keep D, ruling moved to the checkable metric | no | yes |
| creator economy | drop the named-party candidate | yes | yes, and names a third option: report the published finding at attribution level |

A expresses 1 of 3 decisions and B expresses 3 of 3. In the two cases A
cannot express, the seats invented the level move themselves in free text,
with no vocabulary for it. B changes none of the three outcomes. What it adds
is the name for the move the best seats were already making, so a renderer
reading the hazard line gets an instruction rather than a mood. The paradox
refusal is the same under both.

**What would falsify it:** a render whose words pitch the verdict at a lower
level while its shape still delivers the higher one. The verdict engine's
pleasure is a settled question, and "not established" delivered as a
triumphant ruling reads as exoneration or conviction whatever the sentence
says. The first case's own seat names that pressure. None of the three was
rendered in this sweep, so the render-side half is untested.

## Status

Confirmed: the hazard axis exists as a stored field, is used on every row,
and carries the refusal the technique predicts. Deviation: the arbitration
rule's keep-or-drop vocabulary is narrower than its users' practice. The
level lives only in the hazard line's free text, so nothing downstream can
check that a render kept to it.
