---
layer: technique
type: technique
subject: plan-entitlements
technique: inherited-tier-not-cloned-tier
status: forged
laws: [one-authority-per-vocabulary, derivation-names-recomputation, gate-sees-target]
shared_with: []
use_when: [giving one customer a bespoke price, adding per-customer commercial terms, a customer who stopped receiving new features]
---

# Inheriting the tier, not cloning it

The golden path says the tier model holds, for each tier, everything anyone
downstream needs to know: limits, included capabilities, the identifier the
store uses. That is right, and it is right until the day one customer
negotiates a bespoke price — at which point the natural implementation is to
**copy the tier record and edit the price**, and the copy takes the
capabilities with it.

From that moment the customer is detached from every future capability
change, silently. Nothing fails. No gate errors. The next capability added to
the base tier reaches every customer except the one who was important enough
to negotiate, and the discovery path is a support ticket months later that
reads "we were told this was included".

## Price and capability have different override semantics

This is the whole technique, and it is one sentence:

**A price override must copy. A capability override must inherit.**

A negotiated price is a term of a signed agreement. Freezing it is not a side
effect of the implementation — it is the point. If the list price rises next
quarter, this customer's does not, and a price that tracked its tier would be
a breach.

A capability set is a description of the product. Tracking it is the point.
When the product gains a capability the tier includes, every customer on that
tier has it, including the one paying a negotiated rate — that is what "on
that tier" means.

**One record carrying both cannot express two override semantics.** Copying
it freezes the capabilities along with the price; pointing at it lets the
price float. The resolution is not a cleverer copy. It is to stop asking one
record to answer two questions.

## The shape that works

- **The derived record holds only the commercial terms** — the negotiated
  amount and currency, the charges, the fixed and metered lines, the minimum
  commitment, the tax mapping, the trial length, the invoice display name.
  Everything that is a term of the deal, copied deliberately and frozen.
- **It carries a pointer to the tier it derives from**, and that pointer is
  the identity that matters for everything non-commercial.
- **Every capability read climbs the pointer to the root before resolving.**
  One resolution helper, used by every reader — the gate, the read contract,
  the operator console, the analytics rollup that segments by plan. A reader
  that resolves against the derived record is
  [a gate reading a proxy](../../../../_laws.md#gate-sees-target): it passes
  exactly when the copy has diverged from the tier, which is the only moment
  it existed for.
- **The capability set has one authority and it is the root tier**, per
  [one authority per vocabulary](../../../../_laws.md#one-authority-per-vocabulary).
  The derived record is not a second, quieter tier model; it holds no
  capability rows at all.

## Capability writes are refused on a derived record, not redirected

The second half, and the one teams skip. When an operator opens a
per-customer record and edits a capability, there are three possible
behaviours and only one is safe:

- **Write it onto the derived record** — the defect this technique exists to
  prevent, now created by hand.
- **Silently retarget the write to the root tier** — worse, because it looks
  identical to the operator and changes the capability for every customer on
  that tier. A write that lands somewhere other than where it was aimed is
  indistinguishable from a write that landed.
- **Refuse, naming the root.** The write interface for capabilities rejects a
  derived record outright and says which tier owns the capability set. The
  operator then makes a deliberate choice: change the tier for everyone, or
  express a per-customer difference where per-customer differences belong —
  as an override or a removal against that customer's subscription, per
  [subtractive-entitlement](./subtractive-entitlement.md).

## If you must denormalize, name the recomputation

Resolving through a pointer costs a read, and someone will propose caching
the resolved capability set on the derived record. That is legitimate only
under [derivation naming its recomputation](../../../../_laws.md#derivation-names-recomputation):
the cached set states how it is rebuilt and something invokes that rebuild
whenever the root tier changes. A set materialized once at creation time and
never again is the original defect wearing the word "cache" — and it is the
most convincing disguise it has, because the field is named as derived and
behaves as authored.

## The two-minute test

Give one customer a bespoke price. Add a capability to the base tier. Check
whether that customer has it.

It catches the entire class, it needs no instrumentation, and almost no team
runs it — because the two operations are performed by different people months
apart, and neither one is thinking about the other. Run it before the first
negotiated deal, not after.

A second check for a product already in this state: count the customers on
records that derive from a tier, and compare their capability sets against
that tier's. Every difference is either a deliberate per-customer decision
someone can name, or an accident of the day their price was set. If nobody
can tell which, they are all accidents.

## Decision rules

- **When a customer must genuinely *not* receive a new capability**, that is a
  removal recorded against their subscription — one row naming one thing —
  not a frozen copy of the tier. A removal survives inspection and can be
  reversed; a frozen copy withholds everything added afterwards and nobody
  can enumerate what.
- **When the derived record needs an identifier**, mint a new one and keep the
  pointer. The customer is on a derived agreement *of* a tier; reports that
  segment by plan resolve through the pointer, or the tier's cohort silently
  splits every time somebody negotiates.
- **When a tier is retired while derived records point at it**, the tier stays
  readable forever — the golden path's rule about retired tiers is load-
  bearing here, because a dangling pointer resolves to no capabilities at
  all, which is a total revocation delivered by a cleanup task.
- **When three customers need the same non-standard capability set**, that is
  a tier, not three derivations. A derivation expresses one deal; a repeated
  deal is a vocabulary entry.

## When not to use this

- **A product with no per-customer commercial terms.** If everyone pays list
  price, there is nothing to derive from and the tier model stands alone.
- **A genuinely contract-driven product** where no two agreements match — the
  escape hatch [tier-model-single-source](./tier-model-single-source.md)
  already names. There the capability set really is per-agreement, and the
  single source is the *shape* of an agreement. Note the honest version of
  that claim: it is true far less often than a sales team will tell you, and
  it is worth re-testing whenever two agreements turn out to be the same.
