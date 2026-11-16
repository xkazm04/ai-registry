---
subject: triage-queues
domain: software-engineering
last_touched: 2026-11-16
dry_streak: 2
---

# triage-queues

Forged 2026-08-18 from the personas tree, with a golden path and six
techniques. It had three `react` applications: focus mode and source
normalization (2026-08-18), and queue ordering (2026-08-29, `applied: code`,
`better`). The librarian scan picked it on 2026-11-16 because it had a
single stack and had never been swept. This is its first touch: the
`/deepen` loop below. That pass added a `python` application read from a
public error-tracker tree, which clears the single-stack debt.

## 2026-11-16 - `/deepen` loop (run `filler-deepen-20261116c`, /shift filler)

The librarian scan dispatched this run because the subject had a single
stack (`react`), had never been swept, and had two applications dated
2026-08-18 with no `verified_against`.

#### Round 1 (survey round)

**Not dry. No new technique. Four rules flipped, each gaining a condition.
One mechanism was corrected. All three applications were re-resolved. One
of them described a surface that had been deleted.**

Lanes:
- A read lane over personas at HEAD `8d076db46a`, read through `git show`
  and `git grep`.
- A counter-evidence web lane.
- A blind lane, written down before any search.
- The volatile facts.

Findings:

- **`queue-ordering-and-identity` flipped (condition added).** The rule
  "an old low item never outranks a fresh critical one" now carries a
  condition: severity dominates age *unless a stated escalation clock
  promotes the item*. Strict precedence starves the low tier while the high
  tier keeps arriving. So the clock (an aging rule or a response deadline)
  becomes a named tier, and a queue without one has to state that choice.
  Sources:
  - The blind lane predicted this from priority aging.
  - Web: the scheduling literature on aging ("avoid starvation"), a
    service desk that sorts by SLA time remaining with breaches negative,
    and an error tracker that raises priority on escalation.
  - Read lane: the decision roster's tier order has no clock.

  The golden path gained one sentence. **Correction to the same
  technique's mechanism:** a modern stable sort keeps tied items in input
  order. So ties are haunted by the producer's order, which a store leaves
  unspecified, not by the sort. The tiebreak rule stands, and it gained the
  tied-pair test clause (from the 2026-08-29 application).
- **`queue-lifecycle` flipped (condition added).** The rule "a recurrence
  after resolution is a *new* item" is now "never a silent fold". There are
  two honest shapes: a new item, or a reopen in a visible recurrence state.
  A reopen is conditional and respects the resolution's scope.
  - Blind lane: named both shapes.
  - Web: an incident pager opens a new alert after resolve, and an error
    tracker documents resolve-then-regressed.
  - Second stack: the error tracker's `_handle_regression` is a filtered
    conditional `UPDATE` to `REGRESSED`, scoped by the release it was
    resolved in.

  Expiry also gained a sentence. Common alerting tools report a timed-out
  alert as plain "resolved", so the queue must record the exit itself.
- **`verdict-writeback` flipped (condition added), twice.**
  1. *A timeout is not a failure.* A timed-out item returns marked
     unconfirmed. It is re-read before it is offered again, and a second
     verdict on it goes only through an idempotent or conditional write.
     Read-lane evidence: personas' IPC wrapper documents that a timeout
     "does NOT cancel the backend". The tree already treats that error as
     "indeterminate" in one place, but the decision roster restores a
     timed-out item as plainly pending. The blind lane's idempotence probe
     agreed.
  2. *Per-item truth applies to non-atomic batches.* An atomic batch
     within one owner has no partial state to report. Web: a document
     store's batched writes are all-or-nothing, while a multi-status
     response and a search engine's bulk API report per item.
- **`focus-mode` flipped (condition added).** The watchdog returns the item
  marked unconfirmed, never undecided. A deck that removes cards
  optimistically and frees input at once needs no flight lock, but the
  watchdog's job moves to the removal, which only a transport deadline
  undoes. The read lane found exactly that in the successor deck.
- **Applications.**
  - `react--focus-mode` was **rewritten**. Its whole subject, the Quick
    Answer deck, was deleted on 2026-10-06 (`f5a1c27d2b`), and every cited
    symbol was gone. It now describes the decision deck: identity cursor,
    stamp-beat guard, optimistic removal with walk-back, and skip as a
    walk. It also records the triage projection (bounded skip, 30 s undo),
    which survives with no surface left to use it.
  - `react--queue-ordering-and-identity`: re-checked. The tiebreak (B)
    landed in `c45d0a4a9b`. The sibling-surface caveat is resolved, since
    the decision center reuses the same law under a tier. Identity minting
    is still derived from content. "40 rows" was removed (it had no
    source).
  - `react--source-normalization`: seven sources corrected to six. The
    companion inbox was replaced by the decision roster. The roster now
    counts nine server queues, including `audit_incidents`, while
    `persona_healing_issues` is still not counted.
  - All three are `verified_on` 2026-11-16, `react@19`.
  - **New:** `python--queue-lifecycle--regression-reopen`, read in a public
    error-tracker tree at `0af5f81`.
- **Volatile facts.**
  - "30-second" / "30 seconds": confirmed (`POLLING_CONFIG.dashboardRefresh`
    30_000; cloud reviews 15_000).
  - "40 rows": unsourced, so removed.
  - "84.9%", "82 days" and "2026" (§0 of the findings document): confirmed
    as that document's own measurement, re-read and not re-measured.
  - Golden path "85%": the same measurement, rounded.
  - "95%": an illustration, not a measurement.

Confirmed and left untouched:
- Every page should be actionable (SRE book, opened).
- Undo beats confirm for the reversible direction (a usability firm's
  article on confirmation dialogs, opened). It keeps confirmation for
  serious actions, which matches the bulk-accept asymmetry.
- Durable snooze is a verdict with a wake condition (the error tracker's
  archive-until-escalating, and the pager's logged snoozes).
- Failed is not empty, and a full capped page is a slice (both re-read in
  the tree).

Applied: four simulations against personas. Two are **better**
(verdict-writeback, focus-mode), one is **not-better** (queue-lifecycle:
the tree already uses the new-item shape), and one is **unmeasurable**
(queue-ordering: no per-tier age data). See the ledger fragment.

Defects found in personas, read only:
1. `useDecisionRoster.decide` treats `InvokeTimeoutError` as a refusal.
2. `audit_incidents::promote`'s open-duplicate guard reads `status = 'open'`,
   which is narrower than the repo's own active set (open, acknowledged,
   in_progress).
3. `summary()` counts `'open'` only, while `pending_counts` counts every
   non-terminal status.

#### Round 2

Dry. Training-data-first probes, all confirmed:
- Selection as an identity set that never absorbs arrivals (bulk-triage).
- The count carries its predicate.
- An undo loses to a newer decision, and reports the conflict.
- Adding a source is one adapter, one roster entry and one route.

#### Round 3

Dry. Probes, all confirmed:
- Dedup folds repeats with an occurrence count and last-seen. The second
  stack updates `last_seen` on every fold, `_process_existing_aggregate`.
- Expiry and dismissal rates per source as the entrance-discipline
  instrument.
- Deep links that survive resolution.

dry=2, so the loop idles until a clock or an event.

Banked leads (with return conditions):
- The error tracker's auto-resolve path was not opened. Does it write a
  state distinct from an operator's resolve? Return: the next
  `queue-lifecycle` pass that wants a second-stack expiry case.
- "Select all matching" in mail-style clients may run the predicate at
  action time, not selection time, which would be a possible counter-case
  to bulk-triage's "captures the members at selection time". Training data
  only. Return: a bulk-triage pass with a web lane.
- The personas triage projection (bounded skip, undo window) is unused and
  could be deleted or wired into the deck. Return: a personas `/perfect`
  pass on the decision center, or a focus-mode application that needs a
  bounded-skip witness.
- A service desk's SLA-ordered queue would make a second-stack
  queue-ordering application for the escalation clock. Return: a
  queue-ordering pass that wants the clock read in code, not docs.

Impact: not computed. The map regeneration is owed (the Director's step 4).
