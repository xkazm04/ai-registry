---
layer: technique
type: technique
subject: margin-and-unit-economics
technique: pricing-what-if-simulation
status: forged
laws: [estimation-announces-itself]
shared_with: []
use_when:
  - evaluating a price change before announcing it
  - comparing usage-metered vs flat pricing against real traffic
---

# Pricing what-if simulation

Every operator who sees a per-customer P&L asks the next question within
minutes: "what if I charged per token instead — or raised the flat fee?" The
data to answer it already exists — the window's real usage and real cost per
key. The technique is a read-only overlay that recomputes margin under a
hypothetical price model, with a strict contract that keeps decision support
from mutating into fiction.

## The contract

**Replace revenue only; keep cost real.** The simulated revenue for each key
is computed from the hypothetical model — typically
`price_per_million_tokens × window_tokens + flat_fee × window_days / 30`,
a metered term plus a flat term prorated against a nominal month. The cost
side is the *measured* windowed cost, from the same aggregation the actuals
use. A simulation that also hypothesizes cost ("assume we switch models too")
has two free variables and can be tuned to say anything; hold one side to
ground truth.

**Carry the actual beside the simulated.** Every row shows real revenue, real
margin, simulated revenue, simulated margin, and the delta between margins.
The delta is the deliverable — "this repricing changes customer X's margin by
−$41" — and the actual column is the sanity anchor: when the simulated world
looks implausibly better, the reader can see exactly how far it departed from
the world that exists. Sort by simulated margin ascending: the key that
*would still lose money under the new prices* is the headline finding.

**Announce the simulation in the payload.** The response is stamped
(`simulated: true`) and echoes every assumption — the prices supplied, the
proration basis, the window length. Unlabeled simulated numbers escape into
dashboards and become believed; the stamp travels with the screenshot, the
documentation does not.

**Read-only, structurally.** The simulation writes nothing — no revenue
record, no cached result that a later query could mistake for actuals. If the
operator adopts the new pricing, real billing events will arrive and the
actuals will move; the simulation never shortcuts that.

**Reject the empty hypothesis.** A request supplying no price parameter at all
is an error, not a zero-revenue simulation — an all-keys-deeply-negative
result from an accidental empty request looks like a catastrophe and is
actually a typo.

## Known weaknesses — stated, not hidden

Every simulation has approximations; the technique requires disclosing them
where the consumer will meet them:

- **A flat fee is per-key, and the unattributed bucket is one key.** Untagged
  usage from many customers rolls up under a single key, so a per-customer
  flat fee is understated there. Say so in the surface's own documentation and
  ideally in the response.
- **The metered term assumes tag completeness.** Simulated metered revenue on
  attributed keys is exact for the tokens observed; tokens lost to missing
  linkage bill nobody in the simulation, just as they bill nobody in reality.
- **Proration against a nominal 30-day month** is a modeling choice; echoing
  `window_days` makes the arithmetic reproducible by hand.

## Decision rules

- Keep the per-key revenue formula a separately testable pure function; the
  bugs live in proration and unit conversion (per-million-token prices applied
  to raw token counts are off by 10^6).
- Derive the key set from the actuals computation, so the simulated view and
  the actuals view cover the identical population — a key present in one and
  absent from the other reads as data loss.
- Resist tiered/graduated pricing in v1. Two parameters (metered + flat)
  answer most repricing questions; a full rate-card engine belongs in billing,
  not observability, and its complexity will leak bugs into the trusted
  actuals path.

## When not to use it

Not for revenue *forecasting* — the simulation reprices the traffic that
already happened; it does not model demand response, churn from the price
change, or growth. Presenting it as a forecast is exactly the mislabeling the
stamp exists to prevent. And skip simulation entirely while the actuals
pipeline is still untrusted: a what-if over disputed numbers multiplies the
dispute.
