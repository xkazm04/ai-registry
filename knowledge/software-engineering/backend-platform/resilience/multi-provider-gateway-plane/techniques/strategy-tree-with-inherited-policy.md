---
layer: technique
type: technique
subject: multi-provider-gateway-plane
technique: strategy-tree-with-inherited-policy
status: forged
laws: [identity-survives-reuse, unknown-is-not-a-value]
shared_with: []
use_when: [a flat routing rule list cannot express fallback over a load-balanced pair, a child config silently erased a policy field its parent set, deciding whether an absent policy key means inherit or off, a breaker keyed to a provider name cannot tell two placements of that provider apart]
---

# Strategy tree with inherited policy

Routing structure and execution policy are one recursive object, not two
adjacent ones. Each node declares **how it picks among its children** — serve
this one, spread across all of them by weight, try them in order, choose by
predicate — and **the execution policy for everything beneath it**: the retry
rule, the cache window, the timeout, the credential handle, the header
allowlist, the checks to run, the parameter overrides. A node's children are
themselves complete nodes. That single decision is what makes strategies
compose, and the inheritance it implies is where every remaining hard question
in this technique lives.

## Why a flat rule list is the wrong shape

The alternative, and it is the one most designs start with, is a flat cascade of
rules over one candidate set plus a global execution policy. It is simpler, it
validates more easily, and it has a hard ceiling: a rule can select candidates
but it cannot *contain* them, so any policy that belongs to a group of
candidates has nowhere to live.

The forces that break it are ordinary operator requests. Spread across two
vendors, and if the pair as a whole is unwell fall back to a third — that is a
strategy whose child is another strategy, and a flat list has no way to say
"the pair". Retry twice around the whole arrangement, but only once for the
expensive candidate — that is a policy attached to a subtree and overridden at
one leaf, and a global policy has no way to say either. Cache for an hour, but
never for the jurisdiction-restricted branch. Each request individually looks
like it could be met by one more field on the rule; together they are asking for
containment, and containment is a tree.

So the test another team can run against their own design, without adopting any
of this vocabulary: is *fallback over a load-balanced pair* expressible, and does
a budget declared on the outer node reach the inner one while remaining
overridable at a single leaf? A design that answers no to either has a rule list
wearing a tree's name.

## The inheritance table is the design

Every node merges its parent's resolved policy into its own on the way down, and
the merge mode is **a property of the key, not of the merge function**. Three
modes recur, and a design that has not classified each of its keys into one of
them has not specified inheritance at all — it has specified whatever its merge
helper happens to do.

- **Merge per entry, child wins.** Maps whose entries are independent: header
  allowlists, parameter overrides, tag sets, metadata. A child that names one
  header changes one header. This is the mode people assume is universal, and it
  is the mode that is safe to assume only for genuinely independent entries.
- **Replace wholesale.** Compound rules whose fields are interdependent: a retry
  policy of attempts plus retryable statuses plus a ladder, a cache policy of
  mode plus window plus key. Merging these key-by-key produces a policy nobody
  wrote — a child that says "one attempt" and inherits the parent's list of
  retryable statuses has an attempt count from one author and a trigger
  condition from another, and the combination was never reviewed by either.
  Declare the whole object the unit: absent means inherit the parent's object
  entire, present means replace it entire.
- **Convert once, at the root.** Caller-supplied shorthands and named handles
  that resolve to a canonical runtime form. Resolve them exactly once, at the top
  of the descent, and let every node below read the resolved form. Converting at
  each hop assumes the conversion is idempotent, and conversions that clamp,
  default, or expand a shorthand almost never are — the second pass clamps an
  already-clamped value or expands an already-expanded one, and the defect
  appears only at depth three where nobody is testing.

## Absence is not "off"

The single most expensive ambiguity in an inheriting tree: a key the child does
not mention. It has two plausible readings — *inherit the ancestor's value* and
*explicitly disabled here* — and both are reasonable, which is why the design
must pick one and write it down rather than let the merge helper decide by
accident. Rendering an absent key as a definite "off" is the general failure of
converting unknown into a value
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)), and here
it silently drops the parent's timeout at one leaf, which surfaces as a single
candidate that hangs.

The workable rule: **absence means inherit, and disabling is explicit.** A key
that can be switched off carries a value that means off — a zero window, an
empty list, a declared null — so that "the author said nothing" and "the author
said no" are different bytes in the config. Then the resolved policy at a leaf is
a total function of the path to it, and an operator asking "what timeout did this
call use" gets an answer instead of an argument.

## The leaf's address is its identity

A leaf is reached by descending a path through the structure, and it needs a name
that is stable under everything the structure does to it: filtering out unhealthy
candidates, reordering by weight, drawing at random from a spread, re-entering
the same subtree on a retry. The cheapest name that satisfies all of that is
**the path itself** — the ordered sequence of child positions taken from the
root — minted during the descent and carried on the attempt
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).

It matters because three separate consumers key on it and all three are wrong
without it. The breaker keys its state per candidate, and the same provider
placed at two points in one tree under two policies is two candidates, not one —
a breaker keyed to the provider name lets a failure under the strict branch open
the lenient one. Telemetry attributes an attempt to a node, and "provider B
answered" is not attribution when provider B appears three times. And an operator
answering "which of nine candidates served this" reads the address directly.

Two properties keep it honest. It is assigned **before filtering**, from the
declared structure, so removing an unhealthy candidate does not renumber its
siblings and silently re-point every breaker and every dashboard at a different
node. And it is opaque to the caller: it describes internal topology, which is
the origin-disclosure question the N=1 neighbour already settled
([origin-non-disclosure](../../stream-proxy-hop/techniques/origin-non-disclosure.md)).

## Where this stops

This technique owns the structure and its inheritance. It does not own *which*
candidate should be preferred among the eligible ones — that ranking, and the
policy vocabulary of allow, block and compliance rules, belong to the routing
neighbour, and a tree is the carrier for those rules rather than a replacement
for them. It does not own the retry rule's semantics, only the fact that the
rule is a key with a merge mode; the ladder, the jitter and the budget are
[retry-backoff](../../retry-backoff/retry-backoff.md)'s. And it does not own the
breaker's state machine — only the statement that the breaker's key is the leaf
address rather than the provider's name.

## When not to use it

- **When there is exactly one candidate set and one policy.** A tree of depth
  one is a list with ceremony; adopt the structure when a second policy scope
  appears, not in anticipation of it. The migration is cheap precisely because
  the leaf address of a depth-one tree is stable.
- **When operators cannot author it.** A recursive config is authored by whoever
  operates the plane, and if that population will not write nested structures the
  honest design is a small set of named arrangements they select from — each
  expanding to a tree internally. The expressiveness stays; the authoring
  surface shrinks. What is not acceptable is offering the tree and then papering
  over it with a flat form that can only express one shape.
- **When the policy keys genuinely have no interdependence.** If every key merges
  per entry, the replace-wholesale machinery earns nothing. Check first; the
  usual finding is that at least the retry and cache rules are compound, which is
  enough to require the classification.
