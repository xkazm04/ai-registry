---
layer: golden-path
type: golden-path
subject: generative-provider-routing
status: forged
use_when: [wiring a second generation vendor into a pipeline, handling safety refusals from an image model, deciding which vendor serves which generation stage, auditing generation spend, choosing a model to label or extract at corpus scale]
techniques:
  - capability-to-vendor-plan
  - refusal-reroute-hop
  - non-silent-elimination
  - vendor-fact-ledger
  - cost-per-usable-economics
  - resolution-as-stage-property
  - extraction-model-bake-off
---

# Generative provider routing

A production pipeline that generates images or video will not run on one vendor
for long. Vendors refuse content the brief legitimately needs, rate-limit at
the worst moment, ignore request fields they never promised to honour, change
their billing shapes mid-quarter, and — most importantly — differ in which of
them produces a *usable* output for a given kind of work. The naive response
is to sprinkle vendor calls across the codebase and wrap each in a retry loop.
The principal response is to treat the vendor roster as a **routed capability
chain with policy edges**: callers name a capability, one chokepoint decides
which vendor answers, and every edge of that decision — refusal, elimination,
cost, resolution — is governed by an explicit rule rather than by whatever the
nearest call site improvised.

The subject is that chokepoint and its policies. It is small in code and large
in consequence, because it is where four otherwise-scattered judgments get
made once: who *can* do this work, who *should*, what happens when they
decline, and what the attempt actually cost.

## Capability is the interface; vendor is a routing outcome

No surface outside the routing layer may name a vendor and get it. Callers ask
for a capability — generate, edit, recognize — and the router consults a plan:
an ordered vendor list per capability, per environment. This is not an
abstraction for its own sake. The vendor split is an *environment decision*
(development iterates on whatever is cheap and keyed; production runs the
vendor the style system was tuned against), and environment decisions must
live in one table, editable in one line, not nailed into a dozen surfaces.

Callers may still *steer* — but a steer moves within the plan, it never
escapes it. The two halves of a steer have deliberately different strength.
"Prefer this vendor" only reorders, and only when the preference can be
honoured; an unhonoured preference is dropped, because the caller asked for a
better first try, not for a failure. "Avoid this vendor" *removes*, and when
removal empties the chain the request fails with "no alternative" rather than
quietly serving the avoided vendor — because the one caller who sends an
avoid is a caller who was just refused, and a re-route that can land back on
the refusing vendor is not a re-route. Asymmetric teeth are the design:
preference is advisory, avoidance is binding.

## Refusal is a state, not an error

Generative vendors refuse — safety classifiers decline public figures, brand
imagery, medical scenes, and a long tail of false positives. The single most
important routing rule follows from one field observation, replicated across
vendors: **a refusal is cleared by a different model for one hop, not by a
better prompt and not by retrying the same model.** Retrying the refusing
vendor with the same request is a wall; retrying with a "softened" prompt is a
slow wall that also degrades the brief. So refusal is a first-class outcome
kind that the chain walks past — to the next *configured* vendor — while
non-reroutable failures (a malformed request, a budget ceiling) throw
immediately, because trying them elsewhere would just fail twice.

The corollary that costs teams the most to learn: refusals do not always
arrive labelled. Some vendors surface a safety block as an empty-but-
successful response. The safe reading of an empty generation result is
*refused*, never *success with zero images* — misread it one way and the
caller gets a re-route to a vendor that can serve them; misread it the other
way and the caller gets nothing, silently, with a green status attached.

## No elimination is silent

Between the plan and the pixels, a candidate vendor can drop out four ways: it
lacks the capability, it cannot honour a field of *this* request, it has no
credential configured, or it was called and failed. Every one of these must
land in a trail that reaches the caller — as the error when the whole chain
comes up empty, and as provenance *attached to the result* when a later vendor
served. The asset outlives the process that made it; "why is this plate from
the fallback vendor?" must stay answerable from the asset's own record months
later, not from a log that rotated.

The subtlest of the four eliminations deserves its own name: the request-level
constraint. Two vendors may both "generate", while only one actually *reads*
reference images — the other accepts them and silently ignores them. A field a
vendor ignores is not a capability difference; it is a routing constraint, and
it must be enforced by the router, because the failure it prevents is the
worst kind this layer can produce: a perfectly good image that is not what was
asked for, with nothing anywhere reporting a problem. An unconditioned image
in the wrong style is not a cheaper success; it is a failure that looks like
one.

## The economics run on usable outputs, and on facts with dates

Two ledgers keep the chain honest. The first is the **vendor fact ledger**:
every operational fact about a vendor — endpoint shapes, model identifiers,
prompt caps, billing field spellings, rate-limit behaviour, cleanup
obligations — recorded once, with how it was verified and when. Vendor APIs
are moving targets; a fact without a date and a source is a future incident.
The ledger also enforces the pricing discipline: never invent a price. A call
that cannot be priced is *unpriced*, which is honest; a guessed figure with a
dollar sign on it is not, and a missing figure that renders as blank reads as
"free", which it certainly is not. Every cost figure carries its basis —
vendor-reported receipt, local estimate, or unpriced — because downstream will
print dollar signs, and a receipt and an estimate must not be confusable.

The second ledger is the **usable-output economics** that order the plan in
the first place. Price per render is the number vendors advertise and the
wrong number to route on. The routing-grade number is price per *usable*
output — a render that clears the brief's own bar — and it inverts the naive
ranking often enough to misroute real money: a measured comparison in one
production pipeline found the vendor charging 1.75x per render was *half* the
cost per usable plate, because its acceptance rate was nearly four times
higher. Plan order is a measurement, refreshed when models change, never a
belief about which vendor is "cheaper".

Spend is also gated before it happens: a per-window ceiling checked against a
pre-call estimate, refused before any vendor is touched. A budget that only
observes after the fact is a report, not a control.

## Resolution belongs to the stage, not to a global setting

The last routing dimension is not *who* but *how large*. Vendors price by
output size, often doubling per size step, and a pipeline that renders
everything at one resolution pays final-quality prices for drafts that exist
to be thrown away. Resolution is a property of the pipeline *stage* — cheap
and small for exploratory drafts, mid-size for the graded candidate, full size
only for the promoted winner — and the promotion between sizes is an explicit
step, not a re-roll that voids the grading already done.

## Failure modes this standard exists to prevent

- **The retry wall** — hammering a refusing vendor with the same or a
  softened request instead of hopping vendors.
- **The false empty success** — a safety block presenting as zero images and
  being passed to the caller as a completed call.
- **The silent near-miss** — a request field a vendor ignores, producing
  on-time, on-budget output that fails the brief with no error anywhere.
- **The phantom re-route** — an avoid-steer that quietly lands back on the
  avoided vendor because the chain had nowhere else to go.
- **The unexplained fallback** — an asset served by the second-choice vendor
  with no surviving record of why the first choice dropped out.
- **Routing on sticker price** — plan order set by price per render while the
  cheaper vendor's rejects make it the dearer plate.
- **The invented price** — a rate copied across sizes or vendors it was never
  measured at, or an estimate rendered as a receipt.
- **Flat-rate resolution** — drafts billed at final-render size because
  resolution was one global knob.

## The techniques

- [capability-to-vendor-plan](./techniques/capability-to-vendor-plan.md) — the
  chokepoint table: capabilities not vendors at the call site, per-environment
  plans, steering that reorders or removes but never escapes.
- [refusal-reroute-hop](./techniques/refusal-reroute-hop.md) — refusal as a
  reroutable state: cross-vendor hops, the empty-result-is-refusal rule, and
  what must never re-route.
- [non-silent-elimination](./techniques/non-silent-elimination.md) — the trail:
  four elimination kinds, provenance that travels with the asset, and
  constraint rejections that outrank vendor errors in the final message.
- [vendor-fact-ledger](./techniques/vendor-fact-ledger.md) — operational vendor
  facts recorded with source and date: billing shapes, caps, undocumented
  behaviours, cleanup contracts, and the never-invent-a-price rule.
- [cost-per-usable-economics](./techniques/cost-per-usable-economics.md) —
  pricing vendors by usable output against the brief's own bar, and gating
  spend before the call.
- [resolution-as-stage-property](./techniques/resolution-as-stage-property.md) —
  the draft → proof → final size ladder, priced per stage, with explicit
  promotion instead of regeneration.
