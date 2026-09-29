---
layer: technique
type: technique
subject: agent-memory
technique: filter-at-the-id-door
status: forged
laws: [one-validation-door, failure-not-empty-success, unknown-is-not-a-value]
shared_with: []
use_when: [a model chooses memory items from a shortlist and code then loads them by id, retired or superseded items are filtered only when the shortlist is built, a selector that returns nothing is handled like a selector that crashed, a project-scoped read can be handed the id of an identity-tier item, each hop of a retrieval pipeline has a different failure default]
---

# Filter at the id door

A retrieval pipeline that lets a model pick items from a shortlist has two
places a retirement rule can live: where the shortlist is built, and where the
picked ids are loaded. **The shortlist is a suggestion to the model; the load is
the door.** A rule that lives only at the first place is enforced by the model's
discipline, and a model's ids come from more places than the shortlist — an
earlier turn's manifest, a path it saw in conversation, a plausible name it
composed.

## The rule

**Re-apply every read-side rule at the loader, so that no path that reaches an
item by id can skip it.** The rules are the ones the shortlist already applied:

- **Retirement.** Deprecated, superseded, expired and archived items are refused
  by id exactly as they are omitted from a list.
- **Tier and scope.** An item in the always-available identity tier, or in another
  scope, is refused by a read that was routed to a single project. A route decision
  made upstream is a claim about which ids are eligible; the loader is where the
  claim is enforced.
- **Membership.** An id the model returns that was never in its shortlist is
  dropped, not loaded. Intersection with the offered set is the cheapest form of
  the rule, and it costs one set operation.

Prefer the loader over the intersection alone. A store read by several lanes — a
vector lane, a selector lane, a citation lane — needs the rule once, at the point
they share ([one-validation-door](../../../../_laws.md#one-validation-door)), or
each lane is enforcing its own copy and the next lane added enforces none.

## What an empty answer means

A selector that returns an empty set has answered: *nothing here is relevant*.
That is a different event from a selector that timed out, returned unparseable
text or hit an error, and a pipeline that handles both with one fallback has
erased the only signal the selector gave.

The observed failure is the newest-N fallback: on an empty answer, and on a
persistent selector error alike, the loader injects the most recent few items. Every
turn a gate approved for recall then receives memory whether or not any of it was
relevant, and the items it receives are the ones with the least evidence of
relevance — recent, not chosen. Three rules follow.

1. **An empty selection injects nothing.** Say so in the trace as *selector found
   nothing*, which is a result.
2. **A selector failure gets a named default with a stated direction**, and the
   direction is chosen, not inherited: inject nothing, inject the pinned tier only,
   or fall back to a lexical shortlist. Whichever is chosen, the trace records that
   the selector failed and what took its place
   ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
3. **Every hop states its own default, and the set is read together.** A pipeline
   whose gate fails closed (no context) while its selector fails open (recent
   items) has two policies nobody chose as a pair. A test per hop that forces the
   failure and asserts the outcome is what keeps them a decision.

## The measurement

This is measured without a model. Build a store with a retired item, an item from
the identity tier and an item from another scope; hand the loader those ids
directly, as a selector that misbehaves would; count how many reach the assembled
context. The count is the **stale-served** figure for the selector lane
([stale-served-versus-stale-answered](./stale-served-versus-stale-answered.md)),
and it should be zero by construction. Then force an empty answer and a selector
error and record what was injected.

The instrument cannot say how often a real selector emits an off-shortlist id. That
is a property of the model and the prompt, and it is unmeasured here; the rule does
not depend on it, because the door costs the same whether the model errs once a
month or once a day.

## Boundaries

- Whether a superseded item should be **filtered** or **labelled** for the reader
  is [stale-served-versus-stale-answered](./stale-served-versus-stale-answered.md)'s
  question. This technique starts after that choice and makes it hold for every way
  in.
- Retirement itself — what retires an item and when — is
  [decay-and-forgetting](./decay-and-forgetting.md) and
  [consolidation](./consolidation.md). This is only the enforcement at read time.
- A lane that has no by-id load (a pure query) has no such door; the rule then holds
  at the query's predicate, and the same test applies.
