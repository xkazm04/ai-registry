---
layer: application
type: application
subject: modelled-performance-estimates
technique: refuse-rather-than-emit-a-sentinel
stack: next
status: forged
verified_on: 2026-09-26
verified_against: next@16
---

# A usage page whose cost is null for want of a rate, zero for a free engine, and the one place those collide

Ascent's usage page publishes an LLM spend figure that no invoice produced. It
is token counts multiplied by a per-model list price or by operator-supplied
rates, which makes it a modelled estimate in exactly this subject's sense. The
tree refuses the sentinel almost everywhere, and its one gap is instructive. A
second lane records the same true zero as an absence, and the headline adds
the two together. Citations are against commit `06e14f77` (read 2026-09-26).

## Null for want of an input, and the partial-config trap

`estimateLlmCostUsd` (`src/lib/db/usage.ts:657`) returns `null` unless both
per-MTok rates are set. Its doc comment names the trap the technique's
"missing input" state exists for: a partial config "would bill the output side
at $0 behind a confident dollar figure (a quiet ~halving of the bill)". The
same comment says the opposite case is a value: "A deliberately-set "0" is a
valid explicit price, so both rates "0" yields a real $0.00." An empty string
and a non-finite or negative rate are treated as unset (`:663-670`). That is
the technique's "validate at the door, fall through, never coerce" rule
applied to an env var.

`estimateLlmCostFromTable` (`:696`) refuses the whole period when **any**
token-bearing model lacks a table price (`:719`, `if (!price) return null;`). The
alternative, a sum over the models it could price, is the aggregate that
"absorbs" the absence. The comment calls it "the same half-billing trap".

## The evidence class is a sibling field

`UsageSummary.costBasis` (`:145`) is `"env" | "builtin" | null`. It is derived
at the one resolution point (`:527-528`) from which basis produced the number,
not stored beside it. Its doc comment says it "drives the UI's labeling". This
is [provenance-travels-with-the-value](../techniques/provenance-travels-with-the-value.md)
in two rungs, and the resolved rates themselves are not published beside the
figure.

## A partial sum is published as a floor, labelled

The headline `allLanesCostUsd` (`:192`) sums every lane that could be priced.
`allLanesUnpricedCalls` (`:195`) counts the calls that could not. "Non-zero
means `allLanesCostUsd` is a FLOOR — the headline must say so." The dashboard
does say so (`src/app/usage/usageDashboard.tsx:257-258`). This is the
golden path's "publish the bound labelled as a bound", applied to a sum with
missing terms rather than to a model's ceiling. It is a lower bound because
the missing terms are non-negative. `foldLaneCost` (`:237`) also counts a lane
that ran with no estimate at all, "so the headline's floor qualifier can't be
smaller than the itemization's."

## Zero is the price, and the two lanes disagree about it

In the scan lane, local inference is **priced at zero, not skipped**
(`:709-717`). There are two reasons. A self-hosted org "reads "$0.00" instead
of "no estimate"". And "a local model tag that happens to prefix-match a
hosted one in MODEL_PRICES can't invoice it at that vendor's rate." That is
the technique's condition in code. Zero is inside the domain, so it cannot be
a sentinel. When zero is the true value, it is the value. An absence there
would also have a cost: the fallback lookup would price the call at somebody
else's rate.

The meter lanes do the opposite. `costMicrosFor` (`src/lib/llm/meter.ts:190`)
returns `null` for a zero-cost provider (`:197`). The doc comment (`:181-183`)
gives the reason: so "a $0 lane reads as "nothing to price" rather than as
"free"". `LaneUsage.unpricedCalls` (`src/lib/db/usage-events.ts:92-94`) then
counts those calls alongside BYOM, unpriced models and missing usage. The
four causes collapse into one number, which is the technique's "two kinds of
nothing" failure widened to four.

## Deviation

The two policies meet in `foldLaneCost`. Take a self-hosted org whose scans
and assistant calls both run locally. The scan lane contributes `$0.00` as a
price, and the assistant lane contributes `null` with `unpricedCalls = N`. The
headline then renders "$0.00" with "a FLOOR: N calls … could not be priced
and contribute $0". The true total is exactly zero, but the page says it
could be higher. With hosted scans and local assistant calls, the floor
caption again overstates what is unknown. The standard stays as written, and
the scan lane's reading is the one it endorses: zero-because-free is a value,
and absent-because-unpriced is reserved for a missing input. The product
distinction the meter comment wants ("nothing to price", not "free") is real.
Its place is the basis field (a `self-hosted` basis beside `env` and
`builtin`), not the unpriced count. `unpricedCalls` feeds the floor caption,
and the floor caption is a claim about unknown money.
