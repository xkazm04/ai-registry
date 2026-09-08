---
layer: technique
type: technique
subject: client-state
technique: effect-identity-and-latched-callbacks
status: forged
laws: [identity-survives-reuse, creation-names-reaper]
shared_with: []
use_when: [deciding what belongs in an effect's dependency list, a poll or subscription restarts every time it writes state, backoff and retry counters that never grow past one, a caller-supplied callback changes identity on every render, deciding whether to memoize a callback or latch it]
---

# Effect identity and latched callbacks

A long-lived effect — a poll, a subscription, a connection, a scheduler —
is not a function that runs. It is a **session**: it starts something,
holds it for a while, and tears it down. Its dependency list is therefore
not a performance hint but the **identity of that session**. Every value
in the list is a declaration that *a different value here means a
different session, and the current one should be torn down and a new one
started in its place.* The view framework's own guidance says exactly
this: an effect re-synchronizes when a value it reads differs from the
last render, and the room a connection is joined to belongs in the list
precisely because a new room is a new connection.

Read that way, the dependency list answers one question per entry: **would
I want the running session killed and replaced when this changes?** For
the resource address — which collection, which identifier, which endpoint
— the answer is yes. For a callback the caller handed in, the answer is
almost always no, and putting it in the list anyway is how a poll turns
into a restart loop.

## Why a caller-supplied callback is never part of the identity

A callback passed down from a caller is re-created on every render of that
caller unless the caller works to prevent it. A toolchain that memoizes on
the caller's behalf does not change the rule: its own contract is that
memoization is an optimization the runtime may discard, so a session that
is correct only while a callback's identity happens to hold is incorrect.
The identity therefore changes for reasons that have nothing to do with
the session: the caller re-rendered because something unrelated changed,
or — the fatal case — because *this very effect wrote state*.

That closes a loop that sustains itself:

1. the session runs a tick and writes state (a result, a status, a row);
2. the write re-renders the caller;
3. the caller mints a new callback identity;
4. the dependency list changes, so the framework tears the session down
   and starts a new one;
5. the new session runs a tick immediately.

Nothing in that cycle is idle-waiting, so it does not present as a hang.
It presents as a poll that hammers, or as a connection that reconnects on
every message. The observable tell is that **the interval never elapses**:
work happens far more often than the configured cadence, and the cadence
appears nowhere in the timing.

## What a restart destroys

The restart loop's second harm is quieter and survives the first being
half-fixed. Everything a session accumulated *inside* itself is born with
the session and dies with it:

- **Backoff schedules.** A session that restarts before its penalty
  elapses always dispatches at the base interval. An endpoint that is
  failing is asked as often as a healthy one — the exact load the backoff
  was written to remove.
- **Consecutive-failure counters.** A counter that resets on every restart
  never reaches the threshold that would trip a circuit, surface an error
  state, or stop retrying. The failure is permanent and the client never
  notices it is failing.
- **Attempt tokens and generation counters.** A guard whose sequence is
  reborn cannot recognize the in-flight work of its predecessor
  ([identity-survives-reuse](../../../_laws.md#identity-survives-reuse)):
  the previous session's responses arrive holding tokens the new sequence
  never issued, and either write unchallenged or are discarded wholesale.
- **Pacing marks.** "When did the last real pull start" is the state that
  makes re-entry cheap; reborn at zero, every re-entry is treated as the
  first.

These are the counters people reach for *because* the poll is misbehaving,
which is why the diagnosis so often inverts: the accumulators are added,
they appear to do nothing, and the restart that is erasing them is never
suspected.

## The mechanism: latch the callback, depend on the address

Two rules, applied together:

- **The dependency list holds only what identifies the session** — the
  address of the resource and the values that change *what* is being
  watched. Nothing else.
- **Everything else the session calls is reached through a stable
  reference cell**, written on every render with the latest value and read
  only at call time. The session closes over the *cell*, whose identity
  never changes, so a new callback becomes visible to the running session
  without restarting it. Where the framework offers a first-class way to
  mark a piece of logic non-reactive — a handler that reads the latest
  values but is deliberately excluded from the list — prefer it: it is the
  same latch with the omission checked rather than asserted in a comment.

State that must survive across ticks but must *not* trigger a re-render
lives in the same kind of cell: a failure map, a backoff schedule, a
pacing timestamp. This has the double effect of keeping the accumulator
alive across renders and of removing it from the set of things that could
cause one.

## Procedure

1. Name the session in one sentence — *"one poll of these organizations"*,
   *"one subscription to this channel"*. The nouns in that sentence are
   the dependency list.
2. Walk every other value the effect body reads. Each is either a value
   that identifies the session (rare) or something to latch (usual).
3. Put the latched values in a reference cell updated on render. Read
   `cell.current` at the moment of use, never at session start — reading
   it once at the top re-freezes exactly what the latch exists to keep
   fresh.
4. Put every accumulator that must outlive a tick — counters, schedules,
   marks, tokens — in a cell too, and say in a comment that it is a cell
   *so recording a failure does not re-render*, because the next reader
   will otherwise "fix" it into state.
5. Give the session a teardown that stops everything it started — timers,
   listeners, in-flight work — and a local cancelled flag its own
   continuations check, so a torn-down session's late completion writes
   nothing
   ([creation-names-reaper](../../../_laws.md#creation-names-reaper)).
6. Where the dependency list is deliberately narrower than the values
   read, record *why* at the suppression, in terms of the session: "these
   are stable cells; a new callback must not restart the poll." An
   unexplained suppression is deleted by the next person to read the
   linter's advice literally.

## Failure modes

- **Latching what should restart.** The inverse error: the resource
  address is latched, so changing the selection leaves the old session
  running against the old address, and the surface shows another
  selection's data with no request in flight to explain it. The
  discriminator is always the sentence from step 1 — if the changed value
  appears in it, it belongs in the list.
- **Memoizing the caller's callback instead.** Asking every caller to
  stabilize what it passes down works until one caller forgets, and the
  restart loop returns at that one call site with no local evidence. The
  latch is inside the session, where it holds for all callers, including
  the ones not written yet.
- **Latching, then reading once.** Dereferencing the cell at session start
  and closing over the result reproduces the stale callback the list was
  hiding — with the restart gone, so nothing corrects it.
- **A stale session that still writes.** Latching removes most restarts;
  the ones that remain (a genuine address change) still leave in-flight
  work from the old session. The teardown flag is not optional, and where
  responses race for one slot the write-site guards of
  [async-race-guards](./async-race-guards.md) arbitrate which one may
  commit. The two techniques are complements and neither substitutes: one
  decides how often a session is born, the other decides which of its
  responses is allowed to land.

## Decision rule

**A value goes in the dependency list only if a change to it should kill
the running session.** Addresses qualify; callbacks, accumulators and
convenience values do not — they go in a stable cell and are read at call
time. When a poll's cadence is not visible in its own timing, or an
accumulator inside a long-lived effect never grows, suspect the identity
of the session before suspecting the accumulator.
