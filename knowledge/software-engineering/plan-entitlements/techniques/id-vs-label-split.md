---
layer: technique
type: technique
subject: plan-entitlements
technique: id-vs-label-split
status: forged
laws: [identity-survives-reuse, one-authority-per-vocabulary]
shared_with: []
use_when: [naming or renaming a tier, storing a plan on a tenant row, marketing asks for new plan names]
---

# Splitting the tier's id from its label

A tier has two names and they change at wildly different costs. The
**identifier** is persisted: it sits on tenant rows, in historical lifecycle
events, in analytics partitions, in exported invoices. Changing it is a data
migration with a backfill and a compatibility window. The **label** is
rendered: it sits on a pricing card and in an upgrade prompt. Changing it is
a copy edit.

Fuse them into one field and the product acquires a permanent tax: every
rename becomes a migration, so renames get refused, so the pricing page keeps
a name the business abandoned — or the migration ships, and every stored
historical row now disagrees with every row written before it.

The rule, stated as the product should state it to itself: **read one word
everywhere a human looks, keep another everywhere a machine looks.**

## The procedure

1. **Mint identifiers once, at tier creation, and never reuse them.** They are
   identity in the sense of
   [identity surviving reuse](../../_laws.md#identity-survives-reuse):
   reordering the tiers, renaming them, retiring one and adding another must
   leave every stored identifier meaning exactly what it meant.
2. **Choose identifiers that describe position, not marketing.** `tier_2`,
   `pro`, `team` age differently: a name derived from the current pitch
   (`launch_special`) is a rename waiting to happen; a name derived from the
   tier's structural place survives three repositionings.
3. **Store the identifier, never the label.** Every persisted reference — the
   tenant row, the lifecycle event record, the audit entry — carries the id.
4. **Resolve the label at render time**, through the tier model, at the last
   possible moment. One lookup function; no string tables scattered through
   the interface.
5. **State the asymmetry where the fields are defined.** A one-line comment at
   the model saying "changing this id is a data migration; changing this label
   is free" is the cheapest defect prevention in the subject, because the
   person who will violate it is reading exactly that line when they do.

## Decision rules

- **When marketing asks to rename a tier, change the label and ship.** If that
  is not possible, the split is not implemented and the rename request is the
  bug report.
- **When a tier's *substance* changes** — different limits, different included
  capabilities, a different price bracket — that is a new tier with a new id,
  not a relabelled old one. Reusing an id for changed substance silently
  rewrites history: every past row now claims the tenant had the new limits.
- **When identifiers must appear in an interface** (a support console, an
  admin tool, a debugging view), show both: label for recognition, id for
  precision. These are the surfaces where a human needs the machine's word,
  and hiding it forces them to guess the mapping.
- **When a label must vary by locale or by segment**, that variation belongs to
  the label resolution path — a function of (id, context) — and the id stays
  invariant. Localized identifiers are the same defect in a costume.

## The failure this prevents, concretely

A tenant subscribes while the tier is called one thing. The business
repositions and the tier is renamed. If the label was stored: existing rows
read one name, new rows read another, and every report that groups by plan now
shows two plans where there is one — a segmentation that quietly splits a
cohort in half and makes conversion numbers wrong in a direction nobody can
explain. This is
[one authority per vocabulary](../../_laws.md#one-authority-per-vocabulary)
failing across time rather than across files: the vocabulary forked at a
timestamp.

## When not to use this

- **Where the label genuinely is the identity** — a product with a single
  hand-managed enterprise agreement per customer, where the "tier" is the
  contract name — the split is ceremony. Note that this is rarer than it
  looks: as soon as two customers share terms, the terms want an id.
- **In throwaway prototypes** before pricing has ever been shown to a
  customer, when there are no persisted rows to migrate. The cost of the split
  is one field; the cost of retrofitting it after launch is a migration, so
  the window in which skipping it is rational is short.
