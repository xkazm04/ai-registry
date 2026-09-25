---
layer: application
type: application
subject: table
technique: loading-and-empty-states
stack: react
verified_on: 2026-09-23
verified_against: react@19
applied: code
ab_verdict: better
proof: ab-paired
---

# Loading and empty states — twelve stored payloads that said "run Produce" for a step that had run

`pof` is a Next.js 16 / React 19 game-content pipeline. Each catalog step
stores a JSON artifact, and a generic `ViewPanel` renders it by a view
descriptor the step declares: a table, a checklist, a manifest, a graph or a
chart. Read at `pof` HEAD `824df6e2` on 2026-09-23; the change below is
`5a5c36f9`.

The tree already knew half of this technique. Its checklist and manifest
branches render a `ShapeMismatch` state
(`src/components/layout-lab/steps/ArchetypeStep.tsx:59`) whose own comment
calls the alternative "the empty-state lie": data is present, and it is the
wrong shape for the view. The chart branch did not get that treatment. It
read `data[view.field]`. If that was missing or not an object, it showed
`No data yet — run Produce.`. If the record held none of the rows the
descriptor named, it showed `No numeric data yet — run Produce.`. A histogram
decoded each missing key as `?? 0` and drew a row of zero bars.

## Why this seam could falsify the rule

The tree has a spec linter that runs every step's stub `produce()` and fails
when a chart field is absent or not an object
(`src/__tests__/catalog/pipeline-spec-linter.test.ts:270`). If that guarantee
reached production, stored payloads would never mis-shape. The defaulted
decode would then be dead code, and the corrected rule would add nothing
here. The instrument therefore read the real artifact store, not fixtures.

It did not hold. The linter sees only stub output, and model-authored
produce writes whatever it writes.

## Proof

The instrument was a throwaway vitest file. It rendered `ViewPanel` over
every stored payload of the 16 chart steps. The source was a read-only dump
of the live table plus superseded revisions, n=178 (27 live, 151
revisions). The same inputs went through HEAD (A) and the change (B).
Eleven synthetic shape controls ran beside them.

- **Target:** stored payloads that arrived and rendered an empty state.
- **Floor:** stored payloads that rendered a chart (tolerance 0). An
  unproduced step (`{}` or bookkeeping keys only) still reads "run Produce".

| Arm | Empty, but payload present | Shape mismatch shown | Chart rendered |
| --- | --- | --- | --- |
| A, tree as it was | 12 / 178 (3 live) | 0 | 166 |
| B, `decodeChartPayload` | 0 / 178 | 12 | 166 |

Three classes produced the twelve:

- **A control status routed through a DPS chart.** A knockback Balance
  record holds a `controlBudget`, a note and launch distances. It holds none
  of `dps`, `totalDamage` or `referenceHit`. A said "run Produce", which
  cannot fix it. The payload is right and the descriptor is wrong for this
  entity. This is the case the rule's wording does not name: sometimes the
  view is the thing that failed to decode.
- **A renamed field.** Two live bestiary Encounter Balance rows carry
  `derivedBalance`, `referenceStats` and fourteen other keys, and no
  `balance`. The decode treated a missing field as a missing payload. The
  step's artifact was full.
- **A contract change.** An items Economy revision predates the `economy`
  field: `power`, `target` and `cost` sit at the top level.

The controls behaved as expected. The absent and `{}` controls stayed
empty. A string, a number, a list where a record belongs, renamed keys,
wrapped rows, a scatter record and a waveform string all moved from empty
to mismatch. The histogram with none of its keys moved from a chart of
zeros to mismatch. The floor held in every case: no stored chart stopped
rendering.

## What the change is

`decodeChartPayload` (`ArchetypeStep.tsx:92`) sits between the payload and
the body state. It returns `absent`, `empty`, `mismatch` (with expected and
received) or `ok`. Emptiness is asserted in two cases only. The first is a
payload with nothing beyond bookkeeping keys (`_provenance`, `sourced`,
`links`, `python`), meaning nothing was produced. The second is a
zero-length record, or named rows that are all null. Anything else that
fails to decode renders the existing `ShapeMismatch`, which names what the
view expected and what the data holds.

## What it cannot do

- It only states the mismatch. It cannot tell a wrong payload from a wrong
  descriptor, and the knockback case is the second kind.
- The bookkeeping set is a list. A new store-written key that is missing
  from it would turn an unproduced step into a false mismatch. No such key
  exists at `5a5c36f9`.
- The graph branch (`ArchetypeStep.tsx:232`) still carries the same
  defaulted decode, `data[field] ?? {}` then `nodes ?? []`, and still says
  "No graph yet". It was left for a separate change.
