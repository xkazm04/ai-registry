---
layer: technique
type: technique
subject: zero-budget-channel-planning
technique: free-channels-lead-onboarding
status: forged
laws: [label-convention-as-convention, a-gate-before-money-and-copy]
shared_with: []
use_when: [ordering a first-run checklist for a marketing product, deciding which onboarding steps are required per business type, reviewing why a zero-budget path is undiscoverable]
---

# Free channels lead onboarding

A marketing product's first-run checklist tells a new business what to do first.
When the list is written from the product's connectors outward - connect the
storefront, import the catalog, connect the ad account - the one thing every
business can do on day one with no account, no credentials and no money sits at
the bottom, marked optional, behind a step that says "spend". For a business type
that has no ad account, that list has inverted the product: its blocking item is
the thing they cannot do and its skippable last item is the only route they have
to a first visitor.

The technique is a rule about ordering and optionality, resolved per business
type.

## The rule

**The free-channel plan is the first step after the website scan, for every
business type; and it is required for the types that typically have no ad budget
and no catalog.** A pre-launch software product, a content site and a
lead-generation site have no catalog step at all and typically nothing to
connect; for them free channels are the only route to a first visitor, and
calling the step optional told them the opposite. A shop or a local business has a
catalog to import and a storefront or business profile to connect, so for them
free channels are one honest route among several and the step stays optional.

The scan stays first because it is what grounds the plan: a URL-first business
whose catalog is empty gets a plan addressed to "your business" before the scan
and one that names its offering after it. Ordering the plan ahead of the scan
would hand a new business the least grounded surface in the product as its
first impression.

## Why the evidence is usability, not telemetry

The case for the rule is a series of test-character findings rather than a
measured funnel: a run in which the strongest-grounded, most honest surface in a
tester's whole reachable set was also the one the product never pointed at, and
two earlier characters whose exact zero-budget job was "not listed". A product
that carries no tenant telemetry cannot answer "did the change alter behaviour",
and the honest posture is to state that: the cost of the reordering was near zero
and the benefit is unverified, which is an argument for leaving the default in
place, not for calling it settled. The decision is therefore recorded as a
**reversible default** - two edits in one place, adjacent, commented - with the
triggers that would revisit it written down:

- the types where the step is required start skipping it anyway (a required step a
  business routes around is noise at the top of the list, the most expensive place
  to be wrong);
- a type in the required set gains an ad budget by default (the premise of the
  split changed, so the map is stale);
- a second self-serve step arrives (one row was an override; two rows are a
  category and belong in the step definition).

## Required is a label and an order, not a gate

"Required" here changes what the row says and where it sits. It does not change
what counts as activation: completion still counts every step, optional or not,
and a test pins that, because "required" is exactly the word that would tempt a
later edit into making optional steps stop counting. A checklist that gates
activation on the free plan would be a different decision with a different cost -
it would block a shop that wants to start from its catalog - and it is not this
one.

The verb matters too. A step that connects nothing must not read "Connect". The
free plan's row reads "Open", the card is titled as the business's first steps
rather than as data connections, and it says which steps need no account.
Promoting a self-serve step to the head of a list titled for connectors would put
the wrong verb on the first row a new business reads.

## Discoverability has two halves

Leading the checklist fixes discovery for a business that has created a project.
A business that never creates one cannot see the checklist, so the second half is
positioning: a public feature page, a mention in the product's own description, a
place in the pricing narrative. The rule above does not fix that half; it names it
as out of scope so nobody reads the checklist change as the whole fix.

## Decision rules

- When a business type has no catalog step and typically no ad account, require
  the free-channel step and order it first after the scan, because it is that
  type's only day-one route to a visitor.
- When a business type has a catalog or a storefront to connect, keep the
  free-channel step first but optional, because the free plan is one honest route
  among several for them.
- When a checklist's per-type requirement map is added, make it exhaustive over
  business types, so a new type is a decision rather than a silent default.
- When the ordering is asserted in tests, assert *position*, not membership,
  because a membership check passes before and after the change and could never
  have caught it.

## When not to use

Do not apply the rule to a product whose users arrive with a budget and an
account by definition - an agency workspace onboarding paid clients has a
different first step. Do not turn "required" into a gate on activation without a
separate decision about who it would block. And do not treat the default as
confirmed because it survived several waves of unrelated work; survival is the
only evidence a reversible default can produce on its own, and the technique
records it as that.
