---
layer: application
type: application
subject: triage-queues
technique: queue-ordering-and-identity
stack: react
status: forged
verified_on: 2026-11-16
verified_against: react@19
applied: code
ab_verdict: better
---

# Queue ordering and identity — the tiebreak, and the test that could not see it

*Measured against the project tree at `bf2a1e249` (2026-08-29). Re-read at HEAD
`8d076db46a` on 2026-11-16 (read only); see "Re-checked 2026-11-16" at the end.*

This is a fused triage deck: four producers (persona reviews, backlog ideas,
workspace practices, build questions) normalized into one `TriageItem` and
worked through one keyboard surface. It implements most of
[queue-ordering-and-identity](../techniques/queue-ordering-and-identity.md)
carefully and on purpose — the cursor is an item id resolved to a position at
render time, not an index (`triageQueue.ts:164`), with the unresolvable-cursor
fallback to the front the technique prescribes, and the comment above it names
the 30-second poll as the reason.

## The seam

`src/features/agents/quick-answer/triage/triageTypes.ts:363-373`. The ordering
law is one comparator, hoisted to primitives so the queue can sort its rows
without dereferencing items inside `O(n log n)` comparisons:

```ts
if (bWeight !== aWeight) return bWeight - aWeight;
if (aCreatedAt < bCreatedAt) return -1;
if (aCreatedAt > bCreatedAt) return 1;
return 0;                      // ← two fields, no third clause
```

Weight then age, oldest-first inside a band — both of the technique's policy
rules, with a comment explaining why age is ascending. What is missing is the
final tiebreak on identity, and with it totality. Two items with the same
weight raised in the same second are not a hypothetical here: one poll, one
producer, one batch of rows stamped together. Their relative position is
whatever sequence the backend handed over, and the deck replaces the array
wholesale every 30 seconds.

## A and B

- **A** — the comparator as written; ties resolve to the input order.
- **B** — `compareOrder` takes both item ids and tiebreaks on them. Six lines
  in the comparator, plus the two call sites (`compareTriage`, and the sort in
  `triageQueue.ts:151`).

## What was read, and what it said

The A-side test was written first, against the unchanged comparator: build two
items with the same weight and the same `createdAt`, assert the comparator does
not return 0, assert antisymmetry, and assert that sorting `[a, b]` and `[b, a]`
yields the same id sequence.

- **A**: `AssertionError: expected +0 not to be +0`. The queue's order for a
  same-second pair is the poll's order, and two polls that disagree present the
  reviewer with two different decks.
- **B**: passes. `vitest run` over the whole triage `__tests__` directory: 19
  files, 311 tests, green. `tsc --noEmit` clean.

Two existing tests failed in between, and they are the finding. Both pin the
new comparator's output against a verbatim copy of the *old* comparator kept in
the test file as a baseline — and that baseline also ended at `createdAt`. What
it pinned for tied pairs was therefore not an order at all, but the sequence
the fixture happened to build them in. The baseline gained the same identity
clause, with a comment saying why; the alternative was pinning the untotality
forever.

## The structural fact: a totality test that a non-total order passes

The same file already contained this test, and it was green under A:

> `it('stays a consistent TOTAL ORDER whatever the sources hand over', ...)`

It shuffles the input eight ways, projects the queue, and walks adjacent pairs
asserting `compareOrder(prev, next) <= 0`. That is a real property and a good
test, and a comparator that returns `0` for every tied pair satisfies it
trivially — `0 <= 0`. The fixture is even built with deliberate ties in both
fields, and its comment says so ("a tie is where an unstable comparator or a
bad partition actually shows up"). The author aimed straight at this case and
the assertion shape let it through, because faulting adjacent pairs measures
*consistency*, never *totality*. Totality is only visible if you assert on the
tie itself: that the comparator's answer for a pair is non-zero, and that it is
the same answer whichever way the pair arrives.

Nobody designed that gap. It is what a test named after the property, written
against the wrong predicate, looks like from the inside — and it is a better
argument for the technique's "final tiebreak on identity" clause than the
missing line was, because it shows the property surviving an author who was
explicitly looking for it.

## What this realization cannot do or prove

- **It fixes the law, not every queue that should obey it.** This comparator
  governs the fused deck. A sibling surface in the same product splits its
  decision center into three separate collections with their own bodies, so a
  global ordering policy holds in none of them; a total order here says nothing
  about that.
- **The tiebreak is arbitrary by design.** Sorting tied items by opaque id is
  stable and meaningless — it is a coin flip that always lands the same way. It
  buys determinism, not a better queue: if two same-second items genuinely
  differ in urgency, the fix is a third named tier in the policy, not this.
- **It does not prove a reviewer was ever affected.** The measurement is over
  the comparator, not over recorded sessions. The tree carries no ordering
  telemetry, so "how often did two tied cards swap between polls" is
  unanswerable here; the instrument that would answer it is a logged queue
  digest per poll, which does not exist.
- **Identity minting is untouched, and it is the weaker half.** Elsewhere in
  this subtree a build-question's id is derived from its unanswered field keys,
  so answering one field elsewhere mints a new id and orphans that item's skip
  ledger — a content-derived identity, which is the mistake the technique's
  identity section names. A total order over unstable identities is still a
  haunted queue.

## Re-checked 2026-11-16 (HEAD `8d076db46a`)

- **B landed and still holds.** The tiebreak shipped in `c45d0a4a9b`
  (2026-08-29). `compareOrder` is now at `triageTypes.ts:383-403`. The
  identity clause is at `:394-401`, with a comment that names the 30 s poll.
  The tie test is at `__tests__/triageRebuildCost.test.ts:202-205`. It
  asserts a non-zero answer, antisymmetry, and the same order whichever way
  the pair arrives. The queue's sort is at `triageQueue.ts:151-162` and the
  id cursor at `:171`. The A-side code quoted above is history. The tests
  were not re-run today.
- **The poll figures still hold.** `POLLING_CONFIG`
  (`src/hooks/utility/timing/usePolling.ts:6-19`) sets `dashboardRefresh`
  to 30_000 ms and `cloudReviews` to 15_000 ms. `useMonitorData.ts:950-951`
  reads both, and `useUnifiedTriage` inherits them.
- **The sibling-surface caveat is resolved.** The decision center is no
  longer three collections. `src/features/decision-center/model/decisionOrder.ts`
  (added 2026-10-06) orders every decision item with `compareDecision`. It
  sorts by a tier first, then hands over to this same `compareOrder`
  (`:53-58`), which its header describes as "reused rather than restated".
  `useDecisionRoster` sorts by it, and every reader takes that one roster.
  So one total order now governs both surfaces. The tier is strict
  precedence with no escalation clock. A tier-3 item (`message`, `report`)
  ranks behind every tier-1 arrival, however old it is (`decisionTier`,
  `:36-51`). See the 2026-11-16 condition on "severity dominates age".
- **Identity minting is still the weak half.** A build question's id is
  still derived from its content, `question:<sessionId>:<sorted unanswered
  keys>` (`triageAdapters.ts:908`).
- **"Four producers" above is out of date.** Workspace practices were
  removed in `bec576bc8f` (2026-09-14). `TRIAGE_KINDS` now has six kinds
  (`triageTypes.ts:337-344`).
