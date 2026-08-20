---
layer: technique
type: technique
subject: multi-provider-event-normalization
technique: provider-family-matching
status: forged
laws: [never-present-absence-as-an-answer, nullable-never-zero]
shared_with: []
use_when: [resolving provider identity from heterogeneous telemetry, handling hosted or resold variants of a provider, deciding what to do with an unrecognized provider string]
---

# Provider family matching

Resolve provider identity by **family membership**, not exact string
equality: match the sender-supplied provider value against substrings that
identify a provider family, and map every hosted, resold, or namespaced
variant of that family onto the same internal provider — because a hosted
variant is still the same models priced on the same price-book keys.

## The problem exact matching gets wrong

Provider identity arrives as free text shaped by whoever wrote the sender's
instrumentation. The same underlying provider appears as a bare name, a
cloud-namespaced identifier (a hyperscaler hosting another vendor's models
emits its own prefix), a platform alias, or a casing variant — and the
standard's own guidance has changed which attribute carries it. An
exact-match table plays whack-a-mole with this space and loses: every miss
becomes an "unknown provider," and unknown providers are unpriceable, so
each miss silently removes real spend from cost accounting.

The family insight is economic, not syntactic: what the operator needs
provider identity *for* is selecting a price book and grouping analytics. A
major provider's models resold through a cloud marketplace are the same
models with the same token prices under the same price-book keys. For those
purposes, the hosting wrapper is noise; the family is the signal.

## Procedure

1. **Lowercase the raw value** before any comparison; casing is
   instrumentation accident, never meaning.
2. **Test family substrings in a fixed order.** Each internal provider gets
   the minimal set of substrings that identify its family across known
   variants — the vendor's name, its flagship model-family name, the hosting
   platforms it is commonly reached through. First match wins; order the
   tests so more specific families precede generic ones if substrings could
   collide.
3. **Unmatched means Unknown — accepted, unpriced, preserved.** An
   unrecognized provider is not an error and not a guess: store the event,
   leave its cost null (a null is an admission; a zero would be a lie), and
   keep the raw string in provenance metadata. The Unknown bucket is a
   worklist: when it grows, its raw strings tell you exactly which family
   entry to add.
4. **Never let Unknown vanish into totals.** Surfaces that aggregate cost
   must carry how much traffic was unpriceable; an Unknown provider that
   disappears into a dashboard presents absence as an answer.

## Two matchers, two risk appetites

Family matching at ingest is deliberately *eager* — false-merge risk is low
because the substrings are curated, and the payoff (day-one pricing of a
new hosted variant) is high. But when identities cross an installation
boundary — federated aggregation, shared leaderboards — the correct posture
inverts: there, use a conservative reviewed alias table where anything not
explicitly listed passes through **unchanged**, because a silent false
merge in shared data cannot be detected or unwound by any single
contributor. Same input, two normalizers, opposite defaults — by design.
Do not "unify" them.

## Decision rules

- **When a new hosted variant appears, extend the family's substrings**, and
  record the raw string that motivated the entry — the matcher's table
  should read as an evidence log.
- **When two families could match one string, the match order is a
  documented decision**, not an artifact of code layout.
- **When pricing genuinely differs by host** (a marketplace surcharge on the
  same models), family matching for identity still holds — the price book,
  not the matcher, is where a host-specific price row belongs.

## When not to use it

Substring matching presumes a curated, small family set; it does not scale
to open-ended vendor ecosystems where substrings collide (one vendor's name
inside another's model string). If the provider space becomes adversarial or
dense, promote the matcher to an explicit alias table with tests per entry.
And never family-match *model* identity — models carry version and pricing
distinctions that substring matching would destroy; model normalization is
its own, stricter operation.
