---
layer: application
type: application
subject: candidate-outreach-and-halt-rules
technique: halt-state-scoped-per-role-not-per-person
stack: sql
status: forged
verified_on: 2026-08-20
---

# The outreach state table, and what its grain decides

`app/_lib/db/core.ts:1026` — one small table carries the entire halt policy, and
the schema comment makes the scoping decision explicit rather than incidental.

```sql
CREATE TABLE IF NOT EXISTS outreach_state (
  entry_id TEXT PRIMARY KEY,
  sends INTEGER NOT NULL DEFAULT 0,
  last_sent_at TEXT,
  replied_at TEXT,
  manual_halt_at TEXT,
  workspace_id TEXT NOT NULL DEFAULT 'workspace'
);
```

## The grain is stated, and its cost is stated with it

The key is the pipeline entry — candidate × role — not the candidate.
`app/_lib/outreach-halt.ts:9` argues it in one sentence: *"A reply about the
backend opening should not silence a genuinely separate conversation about a
different role — but it must absolutely silence the sequence it answered."*

That is the technique's per-role reading, chosen deliberately and written down.
It buys precision, and the technique's accompanying debt — a person-level ceiling
above it — is discharged only halfway here. The coarse layer exists for the
irreversible half: the consent gate resolves at the durable candidate identity
(`app/_lib/rediscovery-alert-store.ts:230`), so a person-level suppression really
does outrank the per-entry state. There is no person-level *volume* ceiling, and
that is a genuine gap (below).

## Every scope-sensitive field sits at the same grain

The technique's procedure step 2 asks that the send counter, the reply timestamp
and the manual halt all live at the grain the halt lives at, and here they
literally share a row. That is what lets `sends` serve as the reply
discriminator without a scope mismatch: the counter counts sends on the same
pairing whose halt it feeds. The schema comment at `core.ts:1030` says exactly
this — *"The sends counter is what makes an inbound message a REPLY rather than a
re-application; replied_at/manual_halt_at stop the sequence."*

## Timestamps, not booleans — and idempotent on the first reply

Both halts are nullable timestamps, which is the technique's rule and pays off
immediately in the write path. `app/_lib/outreach-state-store.ts:70`:

```sql
UPDATE outreach_state SET replied_at = COALESCE(replied_at, ?) WHERE entry_id = ? AND workspace_id = ?
```

`COALESCE` keeps the *first* reply timestamp, so an eager candidate's three
follow-ups do not keep resetting the clock — the same rule the pure policy module
expresses as `withReply` returning the state unchanged when `repliedAt` is
already set (`outreach-halt.ts:64`). A boolean could not have expressed either
the "how fast did they respond" question or the "how long did you keep writing"
audit.

The manual halt upserts (`outreach-state-store.ts:86`), so a sequence can be
halted before it ever runs — the halt is not parasitic on a prior send the way the
reply is.

## Reason precedence, separate from gate order

`outreach-halt.ts:41` records the decision the technique asks to be written down:
a manual halt outranks a reply *in the reported reason*, because *"if a recruiter
deliberately stopped the sequence, that is the fact worth surfacing, and it stays
true even if a reply later arrives."* Note this is the reason precedence, not the
gate order — the gate order is consent-first and lives in the dispatcher.

## Deviations

- **No person-level volume ceiling.** The per-role grain's stated debt. Nothing
  counts how many messages one human receives across all roles, all campaigns and
  all recruiters in a window, so several individually-compliant sequences can
  aggregate into an experience the schema cannot see.
- **The manual halt is not reachable.** `outreach-state-store.ts:79` says so
  plainly: there is no "stop contacting this person" control, so the only halt in
  production is a reply. The column and the precedence rule are kept because they
  are one coherent state model, but a recruiter who learns offline that someone is
  not interested currently has no recorded way to stop the sequence — which is
  precisely the case the technique adds the manual halt for.
- **No cadence state at all.** There is no next-touch time, no step index, no
  campaign membership, no touch ceiling, and no cooling-off window keyed off
  `replied_at` or `last_sent_at`. This system can stop a sequence; it has no
  sequence schedule to stop. The golden path's cadence craft — the touch budget,
  the widening intervals, the sourced-versus-applicant distinction — is entirely
  unimplemented here, and the correct reading is that the halts were built first,
  which is the right order, not that the cadence rules are optional.
- **No cross-role re-approach reason.** Starting a sequence for a second role
  after a halt on the first requires nothing to be recorded, because nothing
  reads the first role's state.
