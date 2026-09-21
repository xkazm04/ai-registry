---
subject: plan-entitlements
domain: software-engineering
last_touched: 2026-09-02
dry_streak: 0
---

# plan-entitlements

First touch: [[2026-09-02-1]]. Class: MATURE (6 techniques; was 3 applications
node ×2 + process; 6 consumer deviations on the floor).

## State

6 techniques, 5 applications (node ×2, process, **elixir**, **spec**). The
elixir application is the corpus's first on that stack; `stacks:` was widened
for it this run. The spec application carries `refresh_by: 2026-12-02` (vendor
landscape, ~3 months) — the first clock this subject has.

## What run 2026-09-02-1 changed

- `entitlement-lifecycle-revocation`: a **retries-exhausted** state (does not
  entitle) and four qualifications — active is provider good-standing, not
  proof of payment; the retries-exhausted end is provider-configured, so the
  product bounds its own grace; period end vs termination timestamp, leeway on
  the order of a day; refund is charge-level. Downgrade guard step 3: **compare
  state, never delivery order or event timestamps**. New section: an unknown
  tenant at grant time is a retry, not a refusal. Survival ladder gains its
  rule: stop the reversible side, keep the side whose stopping loses data.
- `capability-gate-predicates`: gate-vs-grant distinction; rollout flag vs
  entitlement separated by the "would it change on upgrade" test.
- `price-book-authority`: drift detector keys on the price identifier, not the
  product (immutable prices).
- Golden path: release-flag seam; the "not cancelled" trap.
- One blind-lane claim refuted the other way: providers do NOT leave
  paused-collection access to the merchant; the technique honours the verdict.

## Open leads (banked, with return conditions)

- **Seat / quantity entitlements** — blind-lane prediction, no primary material.
  Return when a tree with per-seat billing is read.
- **Two-cycle + margin + grace** as a quota-enforcement rule — single origin,
  kept in the elixir application. Return on a second sighting; home may be
  cost-metering.
- **A feature-flags subject does not exist** in this bundle; the golden path's
  release-flag seam has nothing to link to. Forge candidate if consumers ask.

## Cross-subject proposals (placed)

- webhook-ingestion: provider behaviour changes with the endpoint's
  acknowledgement latency (a checkout waits on the webhook response before
  redirecting; an unacknowledged invoice-created delays finalization). Recorded
  on [[webhook-ingestion]].

### Impact (2026-09-02)

Stale verdicts after this landing: systedo-case (1), ascent (2). Apply row: see `librarian/applied.md`.

## 2026-09-07 - the provider seat (3 techniques, via [[2026-09-07-lago]])

Read against an open-source billing engine that *serves* entitlement answers to
third parties. Three of this subject's rules INVERT once the model is a product
surface rather than a private in-app tier table, and each became a technique that
BOUNDS the existing rule rather than contradicting it:

- `provider-publishes-state-not-decision` - inverts `capability-gate-predicates`'
  "refusing the boolean". A provider refuses the *decision* for this subject's own
  reason: one level up, the four outcomes are the consumer's enumeration, and a
  provider computing them would be the second tier model the golden path warns
  against. It cannot know whether an operator's `max: 0` means nothing or everything.
- `inherited-tier-not-cloned-tier` - price overrides copy, capability overrides
  inherit. The engine's override service clones five collections into a child plan
  and deliberately skips entitlements. **The forging worker argued this was half a
  duplicate and was right**: `tier-model-single-source` already forbade forking the
  tier *vocabulary*. Resolved by shortening that bullet to a pointer rather than
  leaving two half-answers.
- `subtractive-entitlement` - a negative grant, naming a thing it does NOT confer.
  Three states (inherited / overridden / removed), because "everything in the plan
  except X" cannot be written as positive grants without the cloning the technique
  above forbids. An override equal to the plan value is normalized away, so the
  subscription keeps tracking the plan.

Not landed but recorded as a lead: the engine's two public read surfaces disagree
about provenance - one publishes value + plan_value + override_value + an overrides
map, the other only value (director-verified in both the type surface and the
serializer). This subject says the read gate and the write gate must agree; it does
not model read-surface vs read-surface.

Fleet impact: kp and ascent both collapse a negotiated per-customer contract to a
single `unlimited` boolean and have no override layer at all (kp grep: zero hits).
That absence is the negative evidence for the two techniques above.


## 2026-09-18 - intake youtube:IdwdqdywNOM (Type Object over subscription plans)

Landed `live-catalog-edit-is-a-lifecycle-event`, the stage nobody owned: where
the tier model lives and who may change it. A store-resident model loses
three gates. The compiler becomes a load-time schema. The deploy instant
becomes a per-tenant lifecycle event at a period boundary for any narrowing of
a subscribed tier. The review question "does this reach existing
customers?" becomes the choice between editing a tier and minting a new one.
Primary: the payment provider applies catalog feature changes to existing
subscriptions at the next billing period, through the entitlement event.

The kp apply step corrected the draft. Gate two is not a property of the
store: a code-resident catalog narrowed every paid tier in one deploy
(`275141050`), and the number-pinned tests were rewritten in the same change,
so nothing could see it. kp now carries an acknowledged-baseline guard
(`83085b027`).

Fleet: ascent has an operator plan control beside a code catalog, unread.
Banked as a lead in the source note.
