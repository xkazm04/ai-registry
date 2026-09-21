---
layer: technique
type: technique
subject: plan-entitlements
technique: live-catalog-edit-is-a-lifecycle-event
status: forged
laws: [one-validation-door, one-authority-per-vocabulary, creation-names-reaper]
shared_with: []
use_when: [moving the tier model out of code into a table an operator can edit, editing the limits or capabilities of a tier that already has subscribers, deciding whether a plan change needs a deploy, a pricing redesign that adds a capped meter to existing tiers, a customer lost a feature nobody revoked]
---

# A live catalog edit is a lifecycle event

The golden path says the tier model is declared once and read by everyone. It
does not say **where the declaration lives, or who may change it through what
door**, and that is a decision every product makes by default at the moment
the second person asks to edit a plan. There are two places the model can
live, and they buy different things.

- **In code.** The model is an immutable structure in a source file. Every
  change to it passes review, is checked by whatever checks the build, and
  reaches every tenant at one instant: the deploy. The deploy is the change
  gate, and it is a good one. The cost is that nobody who does not ship code
  can change a plan.
- **In a store.** The model is rows an operator edits in a console, so
  launching or adjusting a plan needs no release. The largest payment
  providers sell exactly this: a catalog where features are attached to and
  detached from products "without needing to change your codebase". The cost
  is that the edit arrives with **no review, no compiler and no deploy
  instant**, and each of those did work the product never had to name.

The whole technique is the observation that moving the model into a store
removes three gates silently, and each has to be rebuilt on purpose.

## Gate one: the compiler becomes a load-time schema

In code, a tier that forgets its price or names a capability that does not
exist fails the build. In a store, the same row loads fine and fails later,
in one path, for one tenant: the plan whose monthly figure nobody entered
crashes the invoice preview and nothing else. Parallel per-attribute
tables (one map of prices by plan, another of limits by plan, a third of
features by plan) are the same failure in code form, because each table can
be missing the row the others have.

So a store-resident model has
[one validation door](../../../../_laws.md#one-validation-door): every tier
is checked against a declared schema when it is written *and* when it is
loaded. Every limit is present or explicitly unbounded with the declared
sentinel. Every capability named is in the closed capability set the gates
index. The ordering rank is unique. An unknown key is a failure. The
load-time check is what replaces the compiler, and without it the store is
strictly worse than the source file it replaced.

## Gate two: an edit to a subscribed tier is a bulk entitlement change

This is the half teams miss. A capability added to a tier with four hundred
subscribers is four hundred grants. A capability removed, or a limit
lowered, is four hundred downgrades, and it does not arrive through the
lifecycle path at all. No subscription changed status. No event fired. The
downgrade guard in
[entitlement-lifecycle-revocation](./entitlement-lifecycle-revocation.md),
which removes only what a subscription conferred and never deletes data made
under the richer plan, never ran, because the handler it lives in was never
called. The gates just start reading a smaller number.

The providers that sell the editable catalog do not apply such an edit
instantly. Existing subscriptions pick up product feature changes **at the
start of the next billing period**, and the change reaches the product
through the same entitlement-updated event a real upgrade or cancellation
would send. That is the shape to copy whether or not a provider is in the
loop:

- **A catalog edit that narrows a subscribed tier takes effect at a period
  boundary**, not at save. The customer paid for the current period under
  the terms the period started with.
- **It is emitted per tenant, through the lifecycle path.** The edit fans out
  into one entitlement change per affected tenant, each handled by the same
  code that handles a downgrade, so the guard, the read-only preservation of
  existing work and the upgrade prompt all apply. A catalog edit that
  bypasses the lifecycle handler has built a second revocation path with none
  of the first one's rules.
- **It names its population before it is saved.** The console shows how many
  tenants the edit narrows and for which limits, and a narrowing with a
  non-zero count needs an explicit confirmation. The count is the review the
  deploy used to provide.
- **Widening is safe to apply at once**, and still goes through the event so
  the gates and the interface agree.

**Gate two is not a property of the store.** The store makes it easier to hit,
because an edit needs no deploy, but a code-resident catalog skips it just as
completely: the deploy reaches every tenant at once, and review sees a pricing
change, not the subscribers it narrows. The common shape is a pricing redesign
that adds a new capped meter to every existing tier. Each tier that had no cap
on that dimension now has one, so every paid tier narrows in a commit whose
message reads like a pricing improvement. And the tests that pinned the old
numbers get rewritten in the same change to derive from the catalog, because
pinned numbers break on every tune. That leaves the suite unable to see a
limit move in either direction. The instrument that closes it is small: keep
an acknowledged baseline of each sold tier's caps beside the model, and fail
when any cap falls below it, **counting a cap that appears where there was none
as a fall from unlimited**. A narrowing then has to be decided in the diff,
either as a new tier or as a baseline update that states when existing
subscribers get it.

Paid-plan changes can also carry legal notice requirements that differ by
jurisdiction. The period-boundary default is the floor, not the ceiling, and
a product selling into regulated markets asks counsel what the notice window
is before building the console.

## Gate three: a change nobody should inherit is a new tier, not an edit

The deploy used to force one question: does this change apply to existing
customers? A console does not ask it. The answer decides the operation:

- **The change should reach everyone on the tier** (a new capability, a
  corrected limit that was always meant) → edit the tier, under gates one
  and two.
- **The change is a new offer that existing subscribers should not receive
  or lose** (a cheaper plan with a lower cap, a repackaging) → **mint a new
  tier** and retire the old one for purchase, keeping it readable forever,
  which is the retirement rule in
  [tier-model-single-source](./tier-model-single-source.md). Existing rows
  keep the old identifier and keep their terms. This is the same move the
  providers make for prices, which are immutable objects that a change
  replaces rather than edits, applied to the capability half of the tier.

Editing a subscribed tier in place to launch a new offer is how a product
downgrades its oldest customers by accident. Every row that carries the
tier's identifier has
[one authority](../../../../_laws.md#one-authority-per-vocabulary) for what
it means, and changing that authority's answer changes every row at once.

## Choosing where the model lives

- **Keep the model in code while plans change no more often than the product
  deploys.** For most products this holds for years, and the deploy is a
  better change gate than any console built to replace it.
- **Move it to a store when someone who does not ship code must change plans
  more often than releases happen**, and build all three gates in the same
  change. A store with the schema check but without the lifecycle fan-out is
  the common half-migration, and its first symptom is a support ticket from a
  paying customer who lost a feature on a day nothing happened to their
  subscription.
- **Never copy the tier's capabilities onto each tenant's record to make the
  store cheaper to read.** That trades the bulk-edit problem for silent drift,
  and it is the defect
  [inherited-tier-not-cloned-tier](./inherited-tier-not-cloned-tier.md)
  exists to prevent. Cache the resolved tier. Do not fork it.

## Decision rules

- **When a tier is edited and it has subscribers, count them before saving.**
  A narrowing with a non-zero count is a lifecycle change and goes through
  the lifecycle path at a period boundary.
- **When the edit should not reach existing subscribers, it is a new tier.**
  Retire the old one for purchase and keep it readable.
- **When the model is loaded from a store, validate it against a declared
  schema and refuse to start on a failure.** A missing field on one tier is
  a load-time error, never a runtime crash in one tenant's path.
- **When a catalog edit changes what a tenant is entitled to, the tenant's
  record of what conferred the entitlement changes with it**, per
  [creation naming its reaper](../../../../_laws.md#creation-names-reaper), so
  a later revocation removes what the edited tier conferred and nothing else.

## When not to use this

- **A product whose model lives in code and ships only with deploys** needs
  gates one and three less, because the build and the review already do most
  of that work. It does not escape gate two: a release that narrows a sold tier
  still owes the period boundary and a decision somebody wrote down, and the
  baseline check above is how a code catalog gets one.
- **Where the payment provider owns the catalog and delivers its changes as
  entitlement events already.** Most of gate two is then done for you. What
  remains is handling that event with the downgrade handler rather than a
  bare overwrite of the tenant's capability set.
- **A contract-driven product with no shared tiers.** There is no population
  to fan out to. Each agreement is its own record, and its changes are
  amendments to one customer's terms.
