---
subject: durable-agent-operations
domain: software-engineering
last_touched: 2026-09-09
dry_streak: 0
---

# durable-agent-operations

## 2026-09-04 - forged by intake `pi` ([[2026-09-04-pi]], run pi-2026-09-04)

**Born from a routing count, like its nearest neighbour.** The Phase 2d read of
an agent toolkit's harness returned **four load-bearing design decisions with no
subject whose golden path models their forces** - a total replaceable restart
point that stays small by holding ids, two commits around every uncertain effect
with the output's identities minted at the first, a durable state between "the
effect settled" and "the result is placed", the split between a caller's
cancellation and the operation's, and shutdown that writes nothing so reopening
finds what a crash would have left. All shared one HOME IF NEW, which is the
mechanical XL trigger. Whole-tree count was 6 across 4 systems; the concentration
in one system is what made this a scoped in-session forge rather than a `/forge`
handoff over the repository.

**The subject exists because both candidate homes disclaim the ground in their
own words.** [[agent-runtime-assembly]]'s boundary section says "about a record's
lifecycle, go to job-coordination"; [[job-coordination]] models a durable record,
a lease and a step position - a status column and a cursor, not a state machine
whose leaves are the phases of an agent turn. Neither was wrong; the ground
between them was unclaimed. That is the second time in three days that an
agent-harness routing count has produced a subject rather than amendments, and
the two subjects are now siblings across a category line.

**Placement was contested and MOVED.** `llm-agent/runtime-and-io` is the
merits-correct home and holds **exactly 10 subjects against a cap of 10**;
an 11th fails `check-bundles`. Verified against `taxonomy.json` as the authority
rather than a folder count. Placed in `llm-agent/orchestration` (9 subjects,
identical link depth), and the golden path carries a sentence in its own boundary
section saying where it belongs and why it is not there.

**Six techniques**, forged by one worker against a spec and reconciled with the
source at `744a94d`: `total-restart-point-by-reference`, `intent-mints-the-identity`,
`settlement-order-is-not-placement-order`, `two-cancellations-and-a-synchronous-door`,
`close-is-a-controlled-crash`, `recovery-prefix-enumeration`. The sixth was a spec
open question the worker **decided rather than discovered**, keeping it here over
`test-harness` on the argument that the case list is a corollary of the state
vocabulary and not a testing decision - filing it under machinery would separate a
claim from its proof, and the first consequence would be a state added here with
no case added there. The worker also overrode the spec's single discriminator
against `step-position-and-resumability` and added two more, which is the right
call: a step has one outcome, an agent turn has a provider outcome plus a
concurrently-settling tool batch that no cursor orders.

**Applied: 6 rows, 0 shipped from this subject, and the shape is worth keeping.**
Two came back `not-better` and both are more useful than a `better` would have
been. `two-cancellations-and-a-synchronous-door` met a job runner that had already
built the split, from a different problem domain, with the production incident
that taught it recorded in its own test module - a **second independent sighting**
of the mechanism, which is the convergence bar, arriving through a verdict column
that reads like a miss. `close-is-a-controlled-crash` met the same tree taking the
opposite stance deliberately, for the reason the technique's own exception already
names, so a condition written from one system's reasoning now has a real tree
standing in it.

**One condition is owed to `total-restart-point-by-reference` and was deferred.**
Its apply row came back `not-better` against a plugin host whose durable content is
an opaque guest-owned blob: the technique presupposes that the runtime owns the
state vocabulary, and a host that delegates state shape to guest code cannot
enumerate its crash states however it stores them. That boundary is not in the
technique. It was banked rather than written because a condition from one tree is a
lead, and a second sighting should decide whether the boundary is "plugin hosts" or
the narrower "any host whose durable content is opaque to it". **Return on that
second sighting** - and `recovery-prefix-enumeration` is blocked behind the same
precondition, so one answer unblocks two rows.

**Unapplied, and reported by precondition rather than by row.**
`settlement-order-is-not-placement-order` has no seam in any authorized tree - its
precondition is parallel effects entering one record in an order that is not their
completion order, and the fleet has no such record. That is a distinct precondition
from the one above, not a third instance of it.

## Architecture review - 2026-09-09

The historical application outcomes above were not rerun. This review narrows
universal claims inferred from one runtime and states the opaque-host boundary
as a contract limitation, not a fabricated second field observation. It keeps
the six technique identities while removing repeated rhetoric and making the
assumptions and counterexamples explicit.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/durable-agent-operations",
  "date": "2026-09-09",
  "baseline": "fee4d71f",
  "digest": "sha256:4c4c110e98eea53d",
  "disposition": "clarify",
  "coverage": "All seven owned documents read in full. Primary storage/replay/idempotency contracts checked; no private source runtime or provider service was executed.",
  "counterexamples": [
    "A valid event-history implementation recovers by replay; a journal is not intrinsically untestable.",
    "A finite phase enum with unbounded batch contents still has unbounded concrete states.",
    "An admission seal can refuse new effects while ordinary settlements drain safely.",
    "A database-write trace omitting effect dispatch cannot prove intent preceded dispatch.",
    "A synchronous local check cannot order a cancellation committed by another process.",
    "Fresh local attempt identities do not imply fresh destination idempotency keys."
  ],
  "sources": [
    {
      "url": "https://docs.temporal.io/workflow-execution/event",
      "result": "Primary documentation explicitly uses append-only event history for crash recovery and declares history limits."
    },
    {
      "url": "https://www.sqlite.org/atomiccommit.html",
      "result": "Primary explanation distinguishes atomic visibility from physical writes and states storage/flush assumptions."
    },
    {
      "url": "https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/",
      "result": "Primary guidance describes client intent keys, matching parameters and finite retention; checked relevant sections."
    },
    {
      "source": "librarian/subjects/software-engineering/durable-agent-operations.md, historical 2026-09-04 entry",
      "result": "The source runtime at 744a94d and historical fleet observations remain unreproduced; opaque-host applicability is now explicit without claiming a new field sighting."
    }
  ],
  "documents": {
    "durable-agent-operations.md": {
      "disposition": "clarify",
      "reason": "Retain explicit unknown outcomes and restart identities; scope representation choices, ownership fencing, transactional assumptions and shutdown guarantees."
    },
    "techniques/total-restart-point-by-reference.md": {
      "disposition": "clarify",
      "reason": "Distinguish bounded envelope from collection cost, cumulative writes from live storage, cross-store cleanup and opaque guest semantics; replay remains valid."
    },
    "techniques/intent-mints-the-identity.md": {
      "disposition": "clarify",
      "reason": "Retain the four crash positions; distinguish attempt identity from remote idempotency identity and require stale-owner protection."
    },
    "techniques/settlement-order-is-not-placement-order.md": {
      "disposition": "clarify",
      "reason": "Scope source-order requirements and parallelism; durably staged batch placement is a valid alternative without inherent display duplication."
    },
    "techniques/two-cancellations-and-a-synchronous-door.md": {
      "disposition": "clarify",
      "reason": "Local serialization does not establish global cancellation. Separate requested from reconciled, handle failed persistence and classify actual side effects."
    },
    "techniques/close-is-a-controlled-crash.md": {
      "disposition": "clarify",
      "reason": "Separate admission sealing from write closure; preserve genuine settled outcomes during bounded drain and test abrupt loss separately."
    },
    "techniques/recovery-prefix-enumeration.md": {
      "disposition": "clarify",
      "reason": "Finite labels do not bound all states; journal prefixes are testable and write-only traces cannot prove intent-before-effect ordering."
    }
  }
}
```
