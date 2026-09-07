---
layer: technique
type: technique
subject: plan-entitlements
technique: subtractive-entitlement
status: forged
laws: [unknown-is-not-a-value, one-authority-per-vocabulary, verdict-survives-boundary]
shared_with: []
use_when: [one customer must lack one thing their tier includes, building a per-subscription override layer, a reset button that freezes the current number]
---

# Removal as a first-class entitlement state

The revocation discipline in this subject is built on positive grants: every
grant records what conferred it, so revocation removes exactly that and
nothing else. That holds while entitlement is *assembled* — a subscription
here, a purchased balance there, a promotional grant beside them.

It stops holding the moment a tier is **inherited** rather than assigned.
"Everything this tier includes, except one thing" cannot be written as a set
of positive grants without first enumerating the tier into the subscription —
which is copying the plan, the move
[inherited-tier-not-cloned-tier](./inherited-tier-not-cloned-tier.md) forbids
and for the same reason: the enumeration freezes on the day it is written.

So the model needs a row that names a thing it does **not** confer. A
negative grant, scoped to one subscription, subtracting from an inherited
set.

## Three states, not two

Every capability, for every subscription, is in exactly one of:

- **inherited** — no row at this level; the tier's value applies and will keep
  applying as the tier changes;
- **overridden** — a row carrying a value that differs from the tier's;
- **removed** — a subtractive row; the tier includes it, this subscription
  does not.

Resolution order is removal, then override, then tier. Publish all three
states, not just the winner: the resolved value, the tier's value, and the
override separately.
"Your tier grants ten and this customer is set to five" and "your tier grants
five" are different sentences to an operator, and only the first has an
obvious next action — but they carry the same resolved number, so a contract
that ships only the winner has let the classification
[die at the boundary](../../../../_laws.md#verdict-survives-boundary) where it
mattered.

## Why the tri-state is not a two-state with extra steps

The load-bearing paragraph, and the one that reads as pedantry until it bites:
**"no override" and "an override equal to the tier's current value" have
different futures.** Today they resolve identically. When the tier's number
moves, the first customer moves with it and the second does not — and nobody
can tell them apart by looking at today's resolved state, because today they
are the same number.

An override that merely coincides with the tier is therefore a claim of
divergence where there is none: unknown intent rendered as a definite
setting, which is
[precisely what must not happen](../../../../_laws.md#unknown-is-not-a-value).
It also quietly relocates authority: the tier is supposed to be
[the one authority for that value](../../../../_laws.md#one-authority-per-vocabulary),
and a coincidental copy takes it away without anyone deciding to.

## The collapse rule

The rule that makes the tri-state honest:

**An override whose value equals the tier's value is normalized out of
existence at write time.** Not stored and ignored — deleted, so the
subscription returns to inherited.

Without it the distinction erodes within weeks, and the mechanism is
mundane: an editing surface that round-trips a whole form submits every field
on every save, so the first time anyone opens a customer's settings to change
one number, the save writes overrides for all the others. A month later every
subscription is frozen against its tier and the freeze has no author.

With the collapse rule, **the presence of a row carries information**: a
stored override is always a deliberate divergence, an operator reviewing a
customer sees only real differences, and the count of overridden
subscriptions is a number that means something.

The same normalization applies to removals: re-granting a removed capability
deletes the removal row rather than writing a positive grant of the tier's
current value. Writing the positive grant would "work" and would freeze the
value — the defect this technique exists to prevent, re-entered through the
repair path.

## Deleting an override restores tracking, not the current number

Stated as its own rule because the naive implementation of a reset button
does the opposite: it reads the tier's value and writes it as the override.
That satisfies every test anyone writes for it — the number is right
afterwards — and it produces a subscription that will never move again. Reset
means *remove the row*. The check is not "does the value match the tier
now?"; it is "does the value follow when the tier changes?", and it requires
a second step nobody adds unless they were told to.

## Decision rules

- **A removal names a capability, not a tier, and it persists across tier
  changes.** Clearing removals when a subscription moves to a different tier
  silently re-grants something an operator deliberately took away, at the
  moment nobody is looking. If a target tier lacks the capability the removal
  is inert and harmless; if the subscription returns, the removal applies
  again, which is what the operator asked for.
- **At most one removal per subscription and capability, enforced in the
  store.** Then removing twice is idempotent without any handler logic, and
  the same replay tolerance the lifecycle technique demands comes free.
- **A removal is soft, and its reversal is the deletion of the row.** Keeping
  the discarded row preserves the audit trail of who withheld what and when,
  which is the question asked during every billing dispute this feature
  causes.
- **Removals apply to the granular unit, not only the whole capability.** If a
  capability carries several parameters, a removal of one parameter and a
  removal of the whole capability are different rows with different scopes;
  collapsing them forces an operator to withdraw more than they meant.
- **When three subscriptions carry the same removal, that is a tier.** A
  subtractive row expresses one exception; a repeated exception is a
  vocabulary entry that has not been admitted yet, and it will drift.

## When not to use this

- **Where entitlement is assembled from independent positive grants** — a
  purchased pack, a promotional credit, a second subscription — subtraction
  has nothing to subtract from, and the source-scoped revocation in
  [entitlement-lifecycle-revocation](./entitlement-lifecycle-revocation.md)
  applies exactly as written. Removals are for what a tier *confers by
  inheritance*.
- **Where a lapse is the reason.** A customer whose subscription ended has not
  had capabilities removed one by one; their tier changed. Modelling a lapse
  as a pile of removals produces rows nobody reaps and an entitlement state
  that cannot be re-derived from the subscription.
- **In a product with one tier and no per-customer variation.** The tri-state
  is machinery for a difference that does not exist there, and the collapse
  rule has nothing to collapse toward.
