---
layer: golden-path
type: golden-path
subject: plan-entitlements
status: forged
use_when: [adding a paid tier or a gated feature, wiring subscription lifecycle events, deciding what a lapsed customer keeps, shipping a build that must not gate]
techniques:
  - tier-model-single-source
  - id-vs-label-split
  - capability-gate-predicates
  - entitlement-lifecycle-revocation
  - price-book-authority
  - deployment-mode-short-circuit
---

# Plan entitlements

An entitlement is the product's answer to one question: **what does this
tenant's plan include, right now?** Not who they are, not what they have
already consumed, not what they are permitted to do by role — what the money
they pay (or do not pay) buys them today. The subject owns the model of the
tiers, the gates that read it, the copy that sells it, and the lifecycle
events that turn it on and off.

The reason it deserves a subject of its own is that this one answer is
consumed by three audiences that almost never share code: a **gate** deep in
a server path that must refuse an action; a **page** that must render a
pricing grid and an upgrade prompt; and a **lifecycle handler** reacting to a
payment event by granting or removing access. Each audience will happily
build its own private notion of what a tier includes. The moment they hold
two notions, the product bills for one thing and delivers another — and the
direction of that divergence is not symmetric. A gate that under-grants
generates support tickets; a gate that over-grants generates revenue that
was never collected and a pricing page that lies. Both are defects; only one
is visible.

## What this subject does not own

The seams matter more here than in most subjects, because entitlement sits at
the intersection of four neighbours and inherits confusion from all of them.

- [cost-metering](../../../llm-agent/evaluation-and-cost/cost-metering/cost-metering.md) owns units, price
  tables, ledgers, preflight estimation and budget ceilings — *how much a
  thing costs and how much has been spent*. This subject owns *whether the
  tenant's plan includes it at all, and when it stops including it*. The two
  meet at exactly one point: a charge decision reads the tier from here and
  the balance from there. Nothing in this subject re-derives a unit price or
  re-implements a ledger.
- [authorization](../../../security/authorization/authorization.md) owns who may act — the
  identity-to-permitted-action mapping and its enforcement. **Entitlement is
  orthogonal to permission**, and conflating them is a defect with a
  characteristic shape: an administrator on a free plan gets a paid feature
  because the check asked "is this user an admin?" when the question was
  "does this workspace's plan include it", and a paying member is refused
  because the check asked about the plan when the question was whether a
  viewer may mutate. Both questions must be answered, in that order —
  permission first (may this actor act at all?), entitlement second (does the
  plan include this action?) — and a single conflated predicate cannot be
  audited for either.
- [webhook-ingestion](../../../backend-platform/resilience/webhook-ingestion/webhook-ingestion.md) owns getting
  the lifecycle delivery in the door: sender authentication, payload bounds,
  deduplication, replay. This subject owns what an admitted event *means* —
  which statuses still entitle, what a cancellation removes, what a
  downgrade leaves behind.
- [settings](../../governance-and-records/settings/settings.md) owns tenant preferences — what the
  operator chose. A plan is not a preference. Nobody may set their own tier,
  which is why entitlement state must never live in the same mutable
  key-value substrate that preferences do.

## The model is declared once and read by everyone

The structural commitment that the rest of the subject depends on: there is
**one tier model** — a declarative structure listing the tiers, and for each
one, everything anyone downstream needs to know. Limits. Included
capabilities. The identifier the store uses. The label a human reads. The
allowance a period grants. The gate imports it. The pricing page imports it.
The lifecycle handler imports it. This is
[one authority per vocabulary](../../../_laws.md#one-authority-per-vocabulary)
applied to the tier set, and the failure it prevents is specific and common:
a fourth tier is added, the gate learns about it, and the pricing page keeps
rendering three because its array was typed by hand.

The test for whether a product has this: **add a tier, and count the files
that must change.** If the answer is more than one plus the surfaces that
genuinely need bespoke copy, the model is not single-sourced. The mechanics —
what belongs in the model, what must stay out, how limits are expressed so
gates can compare them — are the
[tier-model-single-source](./techniques/tier-model-single-source.md) technique.

## The stored word and the shown word are different words

Every tier has two names, and the whole discipline is refusing to let them be
one field. The **id** is what rows carry, what gates compare, what lifecycle
events set; changing it is a data migration across every persisted row and
every stored event. The **label** is what a human reads on a pricing card;
changing it is a copy edit that ships in an afternoon. Marketing renames tiers
routinely — that is their job, and a well-built product lets them do it
without a migration.

A product that stores the label has fused a fast-moving decision to a slow,
risky one, and will eventually either refuse a rename it should have granted
or ship a migration to satisfy a copywriter. The stable form is: read one word
everywhere a human looks, keep another everywhere a machine looks, and derive
the first from the second through the model. This is
[identity surviving reuse](../../../_laws.md#identity-survives-reuse) in the small,
and it is the
[id-vs-label-split](./techniques/id-vs-label-split.md) technique.

## A gate is a predicate over state, not a branch in a feature

The naive gate is an `if` in the feature that needs it. It works, it is
invisible, and it is unenumerable — which means nobody can answer "what does
the paid tier actually include?" except by grepping. The discipline is to make
entitlement checks **named predicates over declared state**: pure functions
whose only inputs are the tier, the tenant's counted usage, and any balance,
and whose output is a named decision rather than a bare boolean.

Naming the decision is the part that gets skipped and the part that pays. A
boolean collapses distinct situations that the caller must handle
differently: *included without limit*, *within a periodic allowance*,
*payable from a purchased balance*, and *refused* are four outcomes, and a
gate that returns `false` for the last two has thrown away the information the
upgrade prompt needs. Make the decision an enumerated value; let the caller
branch on it; let the interface render the reason.

Two rules keep such predicates honest. **The read gate and the write gate must
agree** — the check that decides whether to show the feature and the check
that decides whether to perform it must call the same predicate over the same
state, or the product ships a button that fails. And **an unknown tenant is
unknown, not free**. The tempting default for a missing record is "treat them
as the free tier with a full allowance", which is exactly wrong: it converts
a lookup failure into a grant. Absence of an entitlement record is
[failure spelled differently from empty success](../../../_laws.md#failure-not-empty-success);
it refuses, loudly, and is counted. Structure, decision states, and the
purity rule are the
[capability-gate-predicates](./techniques/capability-gate-predicates.md)
technique.

## Entitlement is a lease, not a grant

The half of this subject that teams build last and regret first: **what
happens when someone stops paying.** Granting is easy — a payment succeeds,
a flag flips. Revocation is where the money-out trust boundary lives, and it
is full of decisions that are invisible until the first cancellation.

Which subscription states still entitle? Active does. So, usually, does a
subscription in its paid-through grace window after a failed charge, and one
that has been cancelled but not yet reached the end of the period the
customer already paid for. A product that entitles on "active" alone revokes
access from customers who are, contractually, still paid up. A product that
entitles on "has a subscription row" never revokes at all.

What does a downgrade remove? Only what *this* subscription conferred. A
tenant may hold entitlements from more than one source — a purchased balance,
a promotional grant, a legacy arrangement, a second subscription — and a
cancellation handler that resets the tenant to the floor destroys entitlements
nobody cancelled. The rule follows from
[everything created naming its reaper](../../../_laws.md#creation-names-reaper):
the grant records what conferred it, so the revocation can remove exactly
that and nothing else.

And what happens to state produced under a richer plan? Data created while
entitled is not clawed back — it is made read-only, or its refresh stops, or
its export stays available. Deleting it converts a billing event into data
loss and is never the right default. Statuses, grace, the downgrade guard,
re-entitlement on recovery and the server-side derivation of granted amounts
are the
[entitlement-lifecycle-revocation](./techniques/entitlement-lifecycle-revocation.md)
technique.

## The place that takes the money owns the price

Prices exist in at least two systems: the one that charges the card, and the
one that renders the pricing page. Only one of them is authoritative, and it
is not the one you control — the **payment system is the price book**, because
it is what the customer is actually charged. Every price inside the product is
a *display duplicate*.

The honest posture toward that duplication is not to pretend it does not
exist, and not to claim the copy is kept in sync by discipline. It is to name
the duplicate as a duplicate at its definition, and to build a **drift
detector**: something that compares the in-product figure against the price
book and fails loudly when they diverge. A comment promising the two are
identical is a claim of safety with nothing behind it; a check that reads both
is [a gate that sees its target](../../../_laws.md#gate-sees-target). The same rule
governs granted amounts: what a purchase confers is derived server-side from
the product that was purchased, never read from anything the client sent.
Authority, duplication and drift detection are the
[price-book-authority](./techniques/price-book-authority.md) technique.

## Some deployments sell operation, not capability

The case that breaks every assumption above, and that a surprising number of
products eventually hit: a build where **the customer is not buying the
features, they are buying not having to run it.** A source-available product
that also offers a hosted tier, an on-premise licence, an enterprise
deployment with a site agreement — in all of these the software's capabilities
are already fully in the customer's hands, and metering them is at best
theatre and at worst a bug that stops a paying customer's own instance from
working.

The doctrine that resolves it: entitlement gating is a property of the
**deployment mode**, declared once, and in modes that sell operation rather
than capability, every capability gate short-circuits to "entitled". Not each
gate remembering to check — one shared entry point that all gates pass
through, so that a gate written next quarter by someone who has never thought
about the other build is correct by construction. When a gate does forget, it
is a bug against that deployment, and it is the kind of bug that only its
users find. Declaration, short-circuit placement, and what must *not*
short-circuit are the
[deployment-mode-short-circuit](./techniques/deployment-mode-short-circuit.md)
technique.

## The free tier is a dial, not a constant

One number in the tier model deserves to be called out as policy rather than
configuration: what the unpaid tier includes. It is the product's single
strongest lever over the ratio between cost of goods and conversion, and its
correct value changes when the business around it changes — a licence change,
a shift in unit costs, a new acquisition channel all move it.

The reason it moves is worth stating plainly, because it is the part teams
forget: **the free tier's job is defined against the alternative the customer
actually has.** When there is no alternative, a small free allowance is a
trial, and a trial can be stingy. The day a credible free alternative exists —
including one the product itself published — the same allowance stops being a
trial and becomes a comparison the product loses: an allowance too small to do
real work is not a reason to stay, it is a reason to go run the alternative.
The number did not change; its job did. Treat it
accordingly: one named constant in the model, a comment stating what job the
free tier is currently doing and therefore why the number is what it is, and
the explicit expectation that it will be tuned. A free allowance scattered
across three files cannot be tuned; a free allowance with no stated rationale
gets tuned by whoever is least informed.

## What this subject refuses

- **Two tier models.** A pricing page with a hand-typed plan array beside a
  gate with its own switch is one product with two prices.
- **Entitlement checks that ask about roles.** Permission and plan are
  different questions with different answers; a predicate that conflates them
  can be audited for neither.
- **Booleans where the caller needs a reason.** A refusal that cannot say
  which of *not included*, *allowance exhausted* or *balance empty* it is
  cannot drive an upgrade prompt.
- **A missing record treated as a free tenant with headroom.** Unknown is
  unknown, and it refuses.
- **Blanket downgrade resets.** Revocation removes what this subscription
  conferred; anything else destroys grants nobody cancelled.
- **Deleting data on downgrade.** Access ends; the customer's work does not.
- **In-product prices asserted to match the price book.** Either a check
  compares them or the claim is decoration.
- **A gate that ignores the deployment mode.** In a build that sells
  operation, a capability gate is a defect.

## The techniques

- [tier-model-single-source](./techniques/tier-model-single-source.md) — one
  declarative tier structure holding limits, capabilities, ids and labels;
  every surface derives from it.
- [id-vs-label-split](./techniques/id-vs-label-split.md) — stored identifier
  versus displayed name; renaming as a copy edit, not a migration.
- [capability-gate-predicates](./techniques/capability-gate-predicates.md) —
  entitlement as pure named predicates returning enumerated decisions;
  read gate and write gate sharing one.
- [entitlement-lifecycle-revocation](./techniques/entitlement-lifecycle-revocation.md)
  — which statuses entitle, grace windows, the downgrade guard, and what
  survives a lapse.
- [price-book-authority](./techniques/price-book-authority.md) — the payment
  system as the authoritative price; in-product figures as detected
  duplicates; server-side derivation of granted amounts.
- [deployment-mode-short-circuit](./techniques/deployment-mode-short-circuit.md)
  — declaring what a deployment sells, and short-circuiting capability gates
  in the modes that sell operation.
