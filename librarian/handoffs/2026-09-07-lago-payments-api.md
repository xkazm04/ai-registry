---
kind: forge-handoff
opened: 2026-09-07
run: lago
source: github:getlago/lago-api
commit: a24f3abe
bundle: software-engineering
status: banked
scoped_by: operator at the Phase 5 gate (2026-09-07) - the billing/paywall path was forged in-session, these two clusters were kept whole rather than half-forged
consumed_by: null
return_condition: "a forge wave with budget for 8-10 subjects; OR a fleet project grows a payment-provider abstraction with more than one provider (today kp and ascent each have exactly one), which would give the settlement cluster a seam to be applied against"
---

# Lago - the two clusters not forged

The 2026-09-07 intake over `getlago/lago-api` ran a six-system design read and found
**46 design entries, 34 unhomed**, with five of six systems firing the Phase 2d
routing clause. The operator scoped the session's wave to the billing/paywall path
(`operations/metered-billing/`, six subjects, plus three techniques into
`plan-entitlements`). These two clusters were banked **with their design records
intact** so a later forge does not re-derive them.

Both were read by workers who verified their own anchors against the pinned commit.
The full design records are in the run's source note,
[[2026-09-07-lago]], and the raw worker outputs were scratch and are gone - what
survives is below, which is enough to dispatch from.

## Cluster 1 - payment settlement (6 unhomed of 8 entries; 5 converge on one home)

Proposed home: `backend-platform/payment-settlement-boundary` **or** a subcategory
under `operations/`. **Do not assume the first**: `backend-platform/` holds 9 of 10
subcategories and this would spend its last slot. The 2026-09-07 run deliberately
preserved it. Re-run the placement arithmetic before dispatching.

The five converging entries:

- **A1 - the provider status abstraction.** Several providers with genuinely
  different models (card intents, bank debit, redirect-only). The enumeration gap is
  the finding: a redirect-only provider appears in the customer factory but **not**
  in the payment factory and has no payments directory at all. That asymmetry *is*
  the model difference, stated by omission rather than by an interface.
- **A3 - the auto-payment delay.** `CHECKOUT_AUTO_PAYMENT_DELAY = 10.minutes`. When a
  human may be paying the same invoice through a provider-hosted page, there is no
  shared key, no shared row and no lock either party can join, so the only remaining
  lever is to make the machine wait for the human. The general shape - *the duplicate
  your idempotency key cannot see is the one where the system decides twice, and the
  second decider is often the customer* - is the most transferable idea in the cluster.
- **A4 - the last-statement freshness check.** Re-read the invoice from the database
  at the **last** statement before the network call, not at the top of the service,
  because the three provider round-trips made while preparing the charge are
  themselves the staleness window. And when the check fires, re-fetch the row you
  clean up: in a design where only one in-flight payment may exist per invoice, the
  row is shared and your copy may already be bound to a real charge.
- **A7 - the irreversible credit grant.**
- **A8 - the dunning ladder**: the retry ladder, what stops it, and the open question
  the run banked - whether there is a deliberate state in which the customer owes
  money and still has access.

The sixth unhomed entry:

- **A5 - the wallet's two balances**, proposed home
  `backend-platform/data-layer/estimate-and-authority-split`. An ongoing *estimate*
  beside a settled *truth*, serving different consumers. The design read **refuted the
  dispatching brief's premise** here and the correction is the finding: the ongoing
  balance is not merely a scheduled recomputation, it is **flag-and-drain** - flagged
  on every ingested event and on every balance decrease, with the clock as a batched
  drainer. The clock's cache gate is a **cost** gate, not a correctness one. Anyone
  forging this should start from that correction, not from the scheduled-job reading.

Two entries in this system already had homes and are amendments, not subjects:

- unique-index idempotency -> `work-execution/concurrency-guards`, for the
  **narrowing** force (manual payments had to be *excluded* from the in-flight
  uniqueness constraint).
- flag-and-drain refresh -> `work-execution/background-jobs`, for **set-atomicity**: a
  subset refresh is forbidden by a cascade between records, not by job hygiene.

## Cluster 2 - the API version overlay (4 unhomed of 8 entries)

Proposed home: `backend-platform/api-surface/api-version-overlay` (A1, A2) and
`.../tenant-gated-model-migration` (A3), plus `resilience/webhook-delivery` (A5).

**The finding that reframes the system, and the reason this is worth forging:** the
v1/v2 split is *not* the migration boundary. A guard is mounted on the **v1**
controllers and 403s legacy pricing **writes** once an organization flips a rollout
flag, while a second guard 403s the v2 catalog controllers for organizations without
it. So **the URL version selects which shapes can be expressed; a per-tenant flag
selects which model is authoritative.** The overlay is what lets clients move at
their leisure, and it is only safe because the tenant flag makes the older surface
refuse writes - the overlay without the flag is a data-integrity hazard dressed as a
courtesy.

The exit condition is the second half: it is **not a deprecation date**, it is a
routing parity spec - a set-difference assertion over the router that keeps v2 a
superset of v1 forever. v2 never has to "become complete"; it is complete the day it
ships and grows only where the new model needs new nouns.

- **A2** - a greedy route parameter causes a double-draw in the router.
- **A5 - webhook *delivery*.** `resilience/webhook-ingestion` is, by its own boundary
  statement, the **receiving** side, and the corpus's sender-authentication material
  standardizes on one algorithm and models the *verifier's* obligations - none of
  which are a sender's decisions. The unhomed half is the sender's: signing with **two
  selectable algorithms per endpoint** (symmetric per-organization key, or asymmetric
  JWT), which is unusual enough that the force is worth recovering.

Also banked from this system, as a lead rather than a subject: **`app/legacy_inputs/`
is fully orphaned** - one file, zero references repo-wide (director-verified). The
directory name outlived the decision it names.

## What a consuming forge should know

- The engine is `getlago/lago-api`, **not** the `getlago/lago` URL, which is a meta
  repo whose `api/` and `front/` are empty submodules.
- 142,610 lines of app Ruby, **396,197 lines of spec (2.8:1)**, a 16,017-line GraphQL
  schema, and only 5,676 words of markdown with a 105-word README. The specs and the
  route table are the operating documents; there is no `docs/` in the engine (it lives
  in the meta repo and covers deployment, not design).
- Every anchor above was verified by the worker that wrote it; the director
  independently re-verified four load-bearing ones across the run and all four held.
