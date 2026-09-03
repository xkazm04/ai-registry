---
layer: technique
type: technique
subject: session-continuation
technique: continuation-as-state
status: forged
laws: [gate-sees-target, creation-names-reaper]
shared_with: []
use_when: [an agent stops before the task is complete despite being told not to, designing a keep-working mode for a harness, a session opened in a directory inherits a stale continuation from a crashed run, deciding which states may hand control back to the operator]
---

# Continuation as state

The instruction "keep working until the task is done" is the first thing every
harness author writes and the first thing that stops working. It is advice,
and advice lives in the same context as everything else the model is weighing:
the reviewer's approval, the partial result that reads like a milestone, the
growing transcript that dilutes every earlier sentence. When the model yields,
nothing in the harness disagrees, because the harness never held the fact —
it lent the fact to the model and hoped. This technique moves the fact to the
only place it can be enforced: **a persisted record the harness re-reads at
the turn boundary and acts on by refusing the stop.**

## The record

The record is a small file or row, written when a continuation mode is armed
and read by the stop-time hook on every turn boundary. It carries, at minimum:
the mode that is active; the condition it is waiting for, stated so the hook
can evaluate it or so the model can be asked to; the moment it was armed and
last confirmed; and the identity of the session that owns it. When the model
tries to end its turn, the hook reads the record, decides whether the
condition holds, and if it does not, returns a continuation instruction and
blocks the stop. The model resumes work because the harness put it back to
work, not because a sentence persuaded it.

The gate reads the record, never the prompt
([gate-sees-target](../../../../_laws.md#gate-sees-target)). Prompt text may
restate the mode for the model's benefit — it is useful for the model to know
why it keeps being sent back — but the text is a courtesy, and the design is
correct only if it works with the courtesy removed. The acceptance test is
destructive and has two halves, both mandatory. **Strip every reinforcing
sentence and leave the record: continuation must still happen.** A design that
fails here has the fact in the prompt. **Age the record past its lease and
leave every sentence: the session must stop.** A design that fails here has
two facts and no authority.

## The lease

A record with no expiry is a trap for the next session. A run crashes mid-loop,
the record stays on disk, and every session opened in that working directory
for the rest of the week inherits a mode nobody armed — the operator's "stop"
is refused by a hook enforcing a task from Tuesday. So the record carries a
**lease**, and the lease is its reaper
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)): past
it, the record is treated as inactive. The duration is hours, not days, and
both bounds are load-bearing. Too short and a legitimately long task — a
migration, a large refactor across a slow test suite — is cut off by a clock
tuned for something smaller. Too long and the crashed run holds the directory
hostage. The hook that reads the record renews the lease on every confirmed
continuation, so an active loop never ages out and only an abandoned one does.

A stale record is **inactive, not an error**. The hook that finds one lets the
stop proceed and says, in its diagnostic, that it found a stale record and
ignored it. Treating staleness as an error would block the stop on the way to
reporting that the stop should be allowed. Freshness is judged from the most
recent of the record's timestamps — armed, updated, last confirmed — and a
record with no parseable timestamp at all is stale, because the safe reading
of "we cannot tell how old this is" is the one that lets the operator out.

Two further bounds ride beside the lease, and each catches what the other
misses. A **reinforcement cap** limits how many times one guard may refuse a
stop before it stands down regardless — so a guard the teardown forgot, or a
condition the model can never satisfy, blocks a bounded number of turns rather
than a lease's worth of minutes. And the harness's own **re-entry marker** is
honoured: when the stop being evaluated is itself the product of a previous
block in the same cycle, the hook does not block again, because the host
harness marks that case precisely to prevent a hook from pinning a session in
an infinite refuse loop. Continuation is delivered by re-arming on the next
genuine turn boundary, never by refusing forever.

## Yield states are enumerated, and approval is not one

The record says when to keep going; the hook needs the complementary list of
when it is allowed to let go. That list is **closed and short**: a clean
terminal exit, meaning the stated condition holds and the hook has confirmed
it; and an explicit rejection, meaning an operator or a gate said no and the
loop has nothing further to do. A stop for any other reason is refused.

The line that earns this technique its place is the one that is missing from
the list. **A positive review verdict is not a yield state.** When a plan
reviewer approves, when a gate returns "proceed", when a test run passes, the
model's strongest instinct is to summarise the achievement and end the turn —
and in every one of those cases the work has just been *authorised*, not
*done*. The hook treats approval as the transition into execution, sends the
model back, and yields only on completion. Harnesses that leave this implicit
watch their agents stop precisely at the moments they were built to continue
past. The decision of *what* is approved belongs to the human gate and to the
executor's fixed and amendable terms; this technique only refuses to treat
the approval as an exit.

## The arming channel is suppressed inside workers

A mode is armed through a channel — a keyword in the operator's message, a
command, a flag — and that channel is read by a hook on the way in. A harness
that spawns workers passes them prompts, and a prompt composed from an armed
session's context will contain the arming word. If the worker's hook reads it,
the worker arms the mode, spawns its own workers, and the harness has recursed
into itself with no operator at any level. The rule is that **the arming
channel is suppressed in any session the harness spawned**: a worker inherits
the work, never the mode. Recognise a worker by an environment marker the
spawner sets, not by inspecting the prompt for signs of delegation, because
the prompt is the thing that cannot be trusted here.

One class of mode is kept off automatic detection entirely: any mode whose
first act is to spawn. Arming that from a keyword the operator may have used
descriptively — in a question, in a quoted error — is a fan-out nobody asked
for, and the cost of requiring an explicit command for it is one keystroke.

## Decision rules

- Put the continuation fact in a persisted record; read it at the turn
  boundary; enforce it by blocking the stop. Prompt text may restate it and
  must never be the only carrier.
- Every record has a lease, renewed on each confirmed continuation. Past the
  lease it is inactive, the stop proceeds, and the diagnostic says why.
- Enumerate the yield states: clean terminal exit on the stated condition,
  explicit rejection. Nothing else, and never a positive verdict.
- Suppress the arming channel in spawned sessions, identified by a marker the
  spawner sets. Keep spawning modes off keyword detection.
- Before shipping, run both halves of the destructive test.

## When not to use this

A single-turn question needs no loop, and a harness that arms continuation by
default turns every question into a task the operator must cancel. Arm on an
explicit act. And a record is only as good as the teardown that clears it —
a continuation record with no entry in the cancel path is the fourth guard
ordered-teardown warns about, so the two techniques ship together or neither
does.
