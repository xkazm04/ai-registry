---
layer: application
type: application
subject: candidate-outreach-and-halt-rules
technique: halt-state-scoped-per-role-not-per-person
stack: sql
status: forged
verified_on: 2026-09-28
verified_against: sql@3
---

# The outreach state table, and what its grain decides

Re-read at kp `0c9a742d3` on 2026-09-28 (SQLite). Since the first reading
(2026-08-20) the table has gained the one column the technique's layering needed:
a person-level stop that outranks the per-role state.

`app/_lib/db/core.ts:2000` — one small table carries the entire halt policy, and
the schema comment above it (`core.ts:1986`) makes the scoping decision explicit
rather than incidental.

```sql
CREATE TABLE IF NOT EXISTS outreach_state (
  entry_id TEXT PRIMARY KEY,
  sends INTEGER NOT NULL DEFAULT 0,
  last_sent_at TEXT,
  replied_at TEXT,
  manual_halt_at TEXT,
  candidate_halt_at TEXT,
  workspace_id TEXT NOT NULL DEFAULT 'workspace'
);
```

## The grain is stated, and its cost is stated with it

The key is the pipeline entry — candidate × role — not the candidate.
`app/_lib/outreach-halt.ts:9` argues it in one sentence: *"A reply about the
backend opening should not silence a genuinely separate conversation about a
different role — but it must absolutely silence the sequence it answered."*

That is the technique's per-role reading, chosen deliberately and written down.

## The coarse layer, now in the same table

Procedure step 3 asks for fine operational state at person-and-role with an
absolute person-level suppression above it. The first reading found only the
consent half of that. The second half is now `candidate_halt_at`, the candidate's
own opt-out, and the schema comment says why it is a separate column from the
recruiter's: *"an operator halt is an internal workflow decision a later operator
may reverse, a candidate opt-out is a legally binding objection to further
commercial contact"*, and *"Collapsing them into one column would lose the one
that matters legally the first time a recruiter cleared "their" halt."*

The column lives at the entry grain, but it is **read** at the person grain.
`candidateOptOutHalt` (`app/_lib/outreach-state-store.ts:71`) matches any row
whose entry shares the person's durable `candidate_id`, deliberately across
workspaces, and fails closed. So fine state cannot override coarse suppression,
and the coarse layer resolves across records — the decision rule the first
reading had to mark as met only for consent. The reported reason follows the
weight of the fact (`outreach-halt.ts:53`): the candidate's stop outranks a
recruiter halt, which outranks a reply.

## Every scope-sensitive field sits at the same grain

The send counter, the reply timestamp and the manual halt still share a row,
which lets `sends` serve as the reply discriminator without a scope mismatch.
The schema comment: *"The sends counter is what makes an inbound message a REPLY
rather than a re-application (outreach-halt.ts); replied_at/manual_halt_at stop
the sequence."*

## Timestamps, not booleans — and idempotent on the first reply

`outreach-state-store.ts:193`:

```sql
UPDATE outreach_state SET replied_at = COALESCE(replied_at, ?) WHERE entry_id = ? AND workspace_id = ?
```

`COALESCE` keeps the first reply timestamp, the same rule the pure module
expresses as `withReply` (`outreach-halt.ts:90`). The opt-out write uses the same
`COALESCE`, so a second click, or a mail client pre-fetching the one-click
unsubscribe, keeps the first objection's time.

## Deviations

- **No person-level volume ceiling, and no sequence to need one yet.** Outreach
  is delivered *"at most once per entry — first-contact, not a resend"*
  (`app/_lib/automation-run.ts:757`), gated on the `outreach_sent` event. There is
  no follow-up schedule, no touch budget and no cooling-off window. Nothing
  counts how many first contacts one person receives across roles and
  recruiters, and the recruiter's resend door is a second path a sequence-only
  ceiling would miss.
- **The reply and manual halts fail open.** `outreachHaltFor`
  (`outreach-state-store.ts:151`) allows the send when the workflow row is
  unreadable, and argues it in place: the consent gate and the candidate's stop
  already fail closed, so *"the irreversible risk stays covered."* That is the
  argument the halt technique names and asks readers to resist, because a storage
  fault is exactly when a batch of people who replied gets written to again. With
  only one send per entry today, the exposure is small; it grows with the first
  follow-up.
- **The manual halt is still not reachable.** `outreach-state-store.ts:202` says
  so: there is no "stop contacting this person" control in the UI, so the
  recruiter's halt exists only as a column and a precedence rule.
- **No cross-role re-approach reason.** A first touch for a second role after a
  reply on the first records nothing, because nothing reads the first role's
  state except the person-level stop.
