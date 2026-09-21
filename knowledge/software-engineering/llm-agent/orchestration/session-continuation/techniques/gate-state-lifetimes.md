---
layer: technique
type: technique
subject: session-continuation
technique: gate-state-lifetimes
status: forged
laws: [creation-names-reaper, count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [one stop-gate instance serves many concurrent sessions, a verification pass is killed by an iteration limit the work phase already spent, deciding which gate counters reset when a gate starts a sub-turn, a budget meter reads zero for the turns that ran away, a reset in one conversation clears another conversation's counters]
---

# Gate state lifetimes

A stop gate is a small predicate with a memory: an iteration counter, a
window of recent tool calls, a start time, a running token total, a count of
review rounds. What the gate counts is its own concern, and
[stuck-loop-detection](./stuck-loop-detection.md) owns the hardest version of
it: which outcomes count as progress, and why its two counters reset on
different wins. This technique owns the question underneath, which fails
separately and more quietly. **Whose state is it, and when does it end?** A
gate that counts correctly for the wrong session, or across the wrong span,
stops sessions that should run and runs sessions that should stop, with every
counter locally correct.

The distinction is exact. Progress counters reset on an **outcome** (a win, a
meaningful win). The resets here happen on a **lifecycle event**: a turn
starts, a conversation is reset, a verification phase begins. The two compose;
neither replaces the other.

## A shared gate keys its state by session

The natural construction registers gates once per workspace or process and
lets every session consult them. That is correct: gate configuration is shared
policy. Gate *state* is not. A repetition window held on the gate instance
lets one session's repeated call trip another session's warning, and a reset
issued for one conversation clears every other conversation's counters
mid-turn.

So the gate holds no state of its own. It holds a map from session identity to
a state object, resolves the current session from the ambient request context
at check time, and reads and writes only that entry. Activation, deactivation
and reset all act on the current session's entry and no other. The test is
direct: arm the gate in two sessions, drive one to its limit, and assert the
other is untouched; then reset one and assert the same.

**Reset and disarm are different operations.** Resetting clears the counters
and leaves the gate armed for this session; deactivating removes the entry. A
reset implemented as removal silently disarms a mode at every turn start, and
a gate that re-arms lazily on first check hides the bug until a mode that
should be off turns out to be on.

## Every piece of state declares its lifetime

Each field of gate state belongs to exactly one of three lifetimes, and the
declaration is what says who ends it
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)):

- **Per turn.** Reset when a turn starts: the iteration counter, the
  repetition window, the elapsed-time origin of a per-turn time limit, a
  deferred stop waiting for its boundary.
- **Per session.** Survives turns; ended only by an explicit conversation
  reset or by deactivating the mode: which mode is armed, a goal and its
  attempt history, anything the operator set for this conversation.
- **Per phase.** A span inside one turn, opened by a gate that starts a
  verification continuation. Described below, because it is where the
  lifetimes interact.

The harness calls the resets from its lifecycle hooks (turn start and
conversation reset). A gate never infers them from message content. Every
gate exposes both reset operations; the default for a stateless gate is a
no-op, and a stateful gate that does not implement them has declared, by
omission, that its state lives forever. Reset calls are fault-isolated per
gate: one gate's reset throwing must not skip the gates after it, or one bad
gate leaves every later gate carrying the previous turn's counters.

## A verification phase resets its peers

A gate that decides the work is not yet acceptable (a rubric review, a
completion check) returns a continuation that opens a verification phase: the
model is asked to review and revise. By then the work phase has spent most of
the per-turn allowances. The iteration counter sits near its cap, and the
repetition window is full of the work phase's calls. If those carry over, the
verification continuation is stopped by the iteration limit one or two
iterations in, and the turn ends reporting a limit when it should have
reported a verdict.

So a continuation that opens a phase carries an explicit **reset-peers**
flag, and the handler resets the per-turn state of every *other* gate before
the phase begins. Three constraints keep this from becoming a loophole:

- **The flag is explicit on the result.** A continuation that only injects a
  warning (a repetition nudge) does not open a phase and resets nothing. The
  handler never infers a phase from the continuation's text.
- **The triggering gate is not reset.** Its own round counter is what bounds
  the number of verification phases per turn. Resetting it along with its
  peers produces a review loop with no ceiling.
- **Meters are not peers' per-turn state.** The next section.

## Consumption meters never reset inside a turn

A meter bounds something spent that cannot be un-spent: tokens, money, wall
time against a turn's time budget, calls to a billed or rate-limited external
service. An iteration counter bounds a behaviour within a phase. The
classification test is that question, asked per field: **if this counter went
back to zero, would anything already spent be un-spent?** If not, the field is
a meter. A meter resets only at its own declared lifetime (turn start for a
per-turn budget) and never on a phase reset. A verification phase that zeroed
the token meter would let every turn buy a fresh budget per revision round,
and the real ceiling would become the budget multiplied by the round cap:
a number nobody configured.

Wall time is the meter most often misfiled. It is tempting to treat a time
limit as per-phase because it resets at turn start like an iteration counter.
Elapsed time is spent, however, and restarting its origin on a phase reset
gives each verification round a fresh time budget.

## Charge the meter on every terminal path

A meter that is correct inside the turn can still lie in the durable record.
The common construction stages usage in memory as calls complete, then commits
it to the ledger when the turn emits its completion event. On error or
cancellation, the staged usage is discarded along with the turn. The ledger
then charges **zero for exactly the turns that exhausted their budget**, or
that an operator cancelled because they were running away. Those are the turns
the meter exists to catch. A spend dashboard built on that ledger reports its
most expensive turns as free, and a per-session cap that reads the ledger
never trips on them.

Staged consumption is therefore committed on **every** terminal path: success,
failure and cancellation. It is committed with the turn's terminal status
beside the amount, so a failed turn's spend reads as spent-and-failed rather
than as no spend
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
A total carries its predicate: "turn usage" that counted only completed turns
has to say so, or it will be read as all of them
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)). The
row shape and reconciliation belong to
[usage-ledgers](../../../evaluation-and-cost/cost-metering/techniques/usage-ledgers.md);
the rule here is only that the gate's lifetime ends by committing, never by
dropping.

## Decision rules

- Register gates once and key their state by session; resolve the session at
  check time; act on the current session's entry only.
- Keep reset and deactivate distinct; a turn-start reset never disarms.
- Declare each state field per turn, per session or per phase; the harness
  calls resets from lifecycle hooks and isolates each gate's reset failure.
- Open a verification phase only through an explicit reset-peers flag; reset
  every other gate's per-turn state, never the triggering gate's round counter.
- Classify each counter: if zeroing it would un-spend something, it is a meter,
  and meters (including elapsed time) never reset on a phase.
- Commit staged consumption on success, failure and cancellation, with the
  terminal status beside the amount.

## When not to use this

A harness that runs one session per process and one phase per turn gets
session keying and phase resets for free, and building the machinery adds
places for a key to be wrong. Do not use a phase reset to extend a limit an
operator set as a ceiling on the whole turn. If the operator meant "at most
thirty iterations whatever happens", that counter is a meter by intent, and
the verification phase lives inside it.
