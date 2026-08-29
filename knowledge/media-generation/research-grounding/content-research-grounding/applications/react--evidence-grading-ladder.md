---
layer: application
type: application
subject: content-research-grounding
technique: evidence-grading-ladder
stack: react
status: forged
verified_on: 2026-08-29
verified_against: react@19
applied: experiment
ab_verdict: not-better
---

# React: a class chip is not the fix when the ladder is empty

*Verified against the consuming tree at commit `78fe0aa`, 2026-08-29.*

The technique says provenance surfaces at human triage — a reviewer
deciding what to cut sees each card's class chip, so cutting decisions are
made against evidence quality rather than rhetorical appeal. This tree
models the ladder properly and does not draw that chip. The obvious
adoption is to draw it. Measured against the asset as it actually stands,
drawing it is **not better**, and the measurement says why.

## The seam

`app/_phases/_shared/notebook/types.ts:60-83` carries the full apparatus:
a plural `FactSource` with `evidenceClass`, `locator` and an `interested`
flag whose doc comment states the load-bearing distinction ("Interest is
NOT unreliability. A disclosure is self-published AND authoritative"), and
a `source: string` field marked `@deprecated Use sources[]`.

`app/_phases/_shared/notebook/cards.ts:62` builds the triage card from the
deprecated field and drops the plural one. The card reaches
`app/_phases/research/_parts/CardTile.tsx:137-141`, which prints
`{card.source} · as of {card.asOf}` — a source-shaped blob and a
confidence chip, and no class chip. The project's own schema note routes
`facts[].sources[].evidence_class` to "the provenance chip at card
triage", so the intent is written down and the wire is cut in one line.

## A and B

**A** — the shipped policy: the card carries `source`; triage renders the
blob plus confidence.

**B** — the technique's policy: the card carries `sources[]`; triage
renders a class chip per source.

The A/B ran as a harness over the shipped notebook rather than as a code
change, because the question is not whether a chip can be drawn — it is
how many cards it would change.

## What was read

Counting what each policy could render, over 21 facts and the 21 fact
cards built from them:

| | cards a class chip can be drawn for |
|---|---|
| A | 0 of 21 — `buildCards` carries `source`, not `sources` |
| B | **1 of 21** — facts with `sources[]` populated |

Of 19 load-bearing facts, one can be classed. Fifteen facts hide more
than one publication-shaped token inside the single string — `"KuCoin,
phemex, bitcoinworld"`, `"coindesk 2026-07-06, cryptoslate"`, `"CF
Benchmarks; Onramp research"` — which is the technique's rule 1 violated
fifteen times over: a comma-joined string of publication names is one blob
that nothing can count, class, or locate.

The verdict is a rejection of the *adoption*, not of the technique. B
buys one card. Two facts in that list make the point on their own:
`f-sbr`, sourced to `"whitehouse.gov fact sheet"` — a primary record —
and `f-lth-distribution`, sourced to `"on-chain data via intellectia"` —
an aggregator, and the fact's own `confidenceNote` says "single
aggregator, not verified against primary". Both graded facts, both blobs,
both cut on identical information. Rendering a chip over an empty ladder
would put a fresh surface on top of that and change nothing about it.

**Return condition:** re-run when `facts[]` carries `sources[]` on the
load-bearing rows, or when a gate refuses a `source` string holding more
than one publication-shaped token. The seam class is *render-surface
change over an unmigrated data layer*; a later run should not spend the
same test again before the data moves.

## The structural fact

The one fact that carries `sources[]` is `f-midtier-distribute` — and
`f-midtier-distribute` is the corrected one. Its note records a
load-bearing claim that compared a 30-day window to a 60-day one and
called 77,800 "slightly more than" 270,000, shipped into three rendered
scripts. The plural source field was populated on exactly the row where a
defect forced somebody to look at the sourcing, and nowhere else.

Nobody designed that distribution. It is the technique's own recurrence
observed rather than argued: the rule lives as a checkable field-level
requirement or it does not live. Here it lives as an optional field with
one voluntary adopter, and the adopter is a scar.

## What this realization cannot do or prove

- **It measures reachability, not review behaviour.** The count says how
  many cards *could* carry a chip. Whether a reviewer with chips cuts
  differently than one without is not measured, and nothing in this tree
  records cut decisions to measure it against.
- **The multi-publication count is a heuristic.** It matches commas,
  semicolons, slashes and "via" — `"coindesk 2026-03-04, analyst
  explanation"` is one source and a description, not two sources, and it
  is counted. The direction of the finding survives; the exact 15 does
  not.
- **It cannot grade what it counts.** Deciding that `whitehouse.gov fact
  sheet` is `primary` and `intellectia` is `aggregator` is a researcher's
  judgment. A migration cannot be generated from the strings; it has to be
  made, fact by fact, which is precisely the cost that kept the field
  empty.
- **A `not-better` here is not a general one.** It is one project, one
  asset, one run. The technique demotes only on two such rows from
  different projects.
