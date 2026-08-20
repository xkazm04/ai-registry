---
layer: technique
type: technique
subject: agent-memory
technique: memory-value-model
status: forged
laws: [derivation-names-recomputation, one-authority-per-vocabulary]
shared_with: []
use_when: [ranking what to recall, tuning how fast memory ages, deciding what may be forgotten]
---

# The memory value model

Recall must order candidates; forgetting must choose victims. Both questions are
the same question — *what is this item worth right now?* — and a memory system
answers it once, in one function, or it answers it twice and the two answers
diverge. The value model is that function: a small, pure, explicitly-argued
score over the properties an item already carries.

## One model, two callers

The rule that makes everything else safe: **the score that ranks recall is the
same score that gates forgetting.** Remembering and forgetting can then never
disagree about what an item is worth. Two scores — one "relevance" for the read
path, one "importance" for the janitor — is
[one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)
violated on the most consequential vocabulary the system has: the store will
retire items its own recall path was actively serving, and nothing in either
component looks wrong when read alone.

The corollary is directional: the janitor imports the read path's model, never
the reverse. Value is a property of the item as a *reader* sees it; forgetting
is a policy layered on top of that value.

## Three axes, and why one of them alone is a bug

Ordering by a single property is the naive design, and each single property
fails in a way the others repair:

- **Order by last edit** and the agent gets its most recently *edited* memory,
  which is not its most valuable one — a typo fix outranks a load-bearing
  procedure.
- **Order by confidence** and the agent gets a year-old certainty, asserted
  with full force, about a world that moved.
- **Order by usage** and whatever was popular once stays popular forever; the
  ranking becomes a monument to its own history.

So the value model multiplies three axes, each doing a job the others cannot:

- **Trust** — the item's confidence, the ceiling on how strongly it may ever
  score. Nothing else may raise an item above what its grounds justify.
- **Age decay** — an exponential falloff on time since last confirmation.
  Multiplicative, so decay attenuates trust rather than competing with it.
- **Proven usefulness** — a bonus in the number of times the item actually
  reached a consumer, **sub-linear** (logarithmic, small coefficient) so a hot
  item is lifted, not enthroned. A linear usage term turns the ranking into a
  popularity ratchet: the top item is recalled, its count rises, it stays top,
  and the store's tail becomes structurally unreachable.

The composition is the argument. Trust bounds, decay erodes, usage rescues —
and an item that is old, modestly trusted, and *still being used* survives on
the third term alone, which is the behavior worth having.

## Half-lives, per kind, declared in one table

Decay is a **half-life, not a cutoff**. A cutoff is a cliff: an item is fully
valuable the day before it and worthless the day after, so the whole system's
behavior hinges on an arbitrary constant nobody can defend. A half-life
degrades an item continuously and lets the usage term hold it up.

Half-lives are **per kind**, because kinds rot at wildly different rates: a
record of what happened last cycle is stale within a month, while a procedure
that works is good for a year. One global half-life necessarily overstates one
and understates the other.

Two disciplines make the table honest:

- **The table is the claim, and it lives in one place.** Each entry is a
  falsifiable assertion about how fast that kind of knowledge decays, stated
  where a reviewer can read them side by side and argue with one. Half-lives
  scattered as literals across the scoring path are the same claim made
  unreviewable.
- **An unknown kind has a defined default.** The kind vocabulary is open (see
  [consolidation](./consolidation.md)), so the model will meet kinds that
  postdate it. It must fall back to a stated default half-life — never to
  zero (silent erasure of everything new) and never to infinity (a kind that
  never ages because nobody added a row).

Tuning is legitimate here and nowhere else: when recall feels stale or
forgetful, the half-life table is the lever, and moving one number is a
reviewable change with a stated rationale.

## The model is a pure derivation of an injected clock

The score is a derived value and must name its recomputation, per
[derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation).
That means, concretely:

- **Nothing but the item's own stored properties and a supplied instant.** The
  current time is *passed in*, never read from inside the model. A scoring
  function that reads the wall clock cannot be asserted against a fixed
  expected number, so its behavior is verified by nobody, and the one part of
  the system that decides what an agent knows becomes the part with no tests.
- **Clock skew clamps, it never boosts.** An item whose last-confirmation
  instant is in the future has an age of zero, not a negative age — otherwise
  a bad timestamp lifts an item above its own confidence ceiling and a clock
  bug on one writer silently promotes its rows above everyone else's.
- **An unparseable instant is treated as new, not as poison.** One malformed
  timestamp must not propagate a non-number through the arithmetic and
  destroy the ordering of the whole result set.
- **Round before comparing.** Two items whose values differ only in float
  noise must not swap places between two calls; ties break on a stable
  identity so the order is total and reproducible.

Scores are never hand-written into individual rows. A stored, hand-poked score
is a ranking with an unmarked exception in it, and it survives every future
change to the model.

## Thresholds: only inside a conjunction

The value model produces a number, and a number invites a threshold. The rule:
**an absolute threshold on the score may gate an irreversible-feeling action
only as one condition among several, never alone.** A bare "below this value,
retire it" is tuning theater — the constant absorbs every disagreement about
policy and expresses none of it. Conjoined with a minimum age, a
confidence-band limit, and a kind exemption, the same constant becomes one
readable clause in a policy whose other clauses cover its failure cases. The
detailed shape of that conjunction belongs to
[decay-and-forgetting](./decay-and-forgetting.md).

For ordering under pressure — which of these do we drop first — no threshold
is needed at all: rank and take the top.

## When not to use it

A value model is not a relevance model. It answers "what is this worth?", not
"is this about the current task", and it cannot substitute for topical
matching in [recall-injection](./recall-injection.md) — a store ranked by value
alone hands the agent the same excellent items on every unrelated call. Value
orders the candidates *after* relevance has chosen them, and orders the whole
store only when the question genuinely has no topic (an always-include tier, a
forgetting sweep).
