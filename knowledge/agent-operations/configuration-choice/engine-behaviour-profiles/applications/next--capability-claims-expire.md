---
layer: application
type: application
subject: engine-behaviour-profiles
technique: capability-claims-expire
stack: next
status: forged
verified_on: 2026-10-10
verified_against: next@16.3
applied: code
ab_verdict: better
proof: ab-paired
---

# Next: a quality board that pinned routing from a grid older than the release it replaced

Applied 2026-10-10 to kp, a Next.js recruiting app whose `package.json` pins `next`
16.3.8 (the version witness above). kp routes its model calls per use case, and a
Models > Quality board recommends a model for each use case from a baked benchmark grid,
with a one-click Pin that rewrites the routing row.

## The inherited default

The grid is a capability claim in the technique's exact sense. It was measured once and
is quoted every time the board renders:

- `app/_lib/llm-quality-scores.ts:9` "2026-08-12T00:49:23.000Z"
- `app/_lib/llm-quality-scores.ts:15` "claude-sonnet-5" and
  `app/_lib/llm-quality-scores.ts:16` "claude-opus-5" are the Claude releases it measured.

Since then kp moved its own call sites to the next release of both families:
`app/_lib/llm-pins.ts:18` "claude-sonnet-5-5", and the plan seats in
`app/_lib/gigs/plan-seats.ts:13` "claude-sonnet-5-5", whose header records its
own probe date: `app/_lib/gigs/plan-seats.ts:7` "Ids probed on 2026-09-29/30".

So the grid is older than the newest release in one of the families it compares. The
technique's decision rule says the honest answer there is "we do not currently know".
The board said something else.

## The seam, and both arms

`pickRowState` in `app/features/settings/models/modelsQualityPick.ts` joins the pick
against the current pin. Before the change, any pin whose model was not on the grid
read `unmeasured_pin`, and the board showed the Pin button for that state
(`app/features/settings/models/ModelsQualityOverview.tsx:384` "state === ").
A pin of `claude-sonnet-5-5` was therefore "not benchmarked", and one click moved the
use case back onto `claude-sonnet-5`, on the strength of a measurement of the release it
had replaced.

Arm B adds one state. When the pin is a newer release of a family the grid measured,
the row reads `superseded_pin` and no Pin button is offered:
`app/features/settings/models/modelsQualityPick.ts:66` "return supersededBy(pin.model, ctx.measuredModels)".
Family and release are read from the id. Non-numeric tokens are the family and version
tokens are the release. A token of six or more digits is a dated snapshot, so it counts
toward neither.

**Proof: `ab-paired`.** The same inputs went through both arms: the committed grid,
kp's 11 routing use cases, and six pins per use case. Two pins were the releases kp
runs today, one was a measured release, one an older release, one a family the grid
never measured, and one was the default.

| | re-pin offered away from a release newer than the grid | other 44 rows |
|---|---|---|
| A (as shipped) | 22 of 22 | baseline |
| B (`superseded_pin`) | 0 of 22 | byte-identical |

The target moved from 22 to 0. The floor held: every other row kept its state, the
existing state assertions pass unchanged (the closed-vocabulary test gained the new state), and the typecheck and the i18n parity check are
green. Verdict `better`, shipped as kp commit 7392a7179 with two new tests, through kp's full pre-push gate.

## What the tree's shape says

Before the change, kp already knew the newer releases. It names them in five call-site
pins and two plan seats. The board never read any of that. The grid also carries most
of the technique's stamps: a date, the judge, runs per cell
(`app/_lib/llm-quality-scores.ts:11` "limit" is 4), the cases (the bench ops) and the
release ids. It carries no harness version and no effort tier for its CLI targets, and
nothing compares it with the releases kp runs. The stamps were written for whoever
reads the grid. Nothing was written for when the grid stops being true. That is the
gap the technique names: a stamp makes a claim falsifiable, and something still has to
fire the trigger.

## What this realization cannot do

- It reads only the **pin**. A superseded *pick* under a default pin is still offered:
  the grid's `claude-opus-5` is recommended even though kp runs `claude-opus-5-5`
  elsewhere, because the board has no list of the releases kp runs. That needs the bake
  to record them, or a re-bench on the current releases.
- Release order comes from parsing ids, not from a vendor catalogue. A family that
  renames its tiers between releases reads as two families. The state then falls back
  to `unmeasured_pin`, which is the old behaviour, so the failure is the one this change
  narrows rather than a new one.
- It does not stamp the harness version, so a CLI update under an unchanged model id
  still leaves the grid quoting itself. The bench runner's records carry no CLI version.
