---
layer: technique
type: technique
subject: terminal-multiplexing
technique: multi-client-fan-out
status: forged
laws: [creation-names-reaper, failure-not-empty-success]
shared_with: []
use_when: [several viewers attached to one session at once, one slow remote client stalls every terminal in the session, two attached terminals of different sizes fight over the window size, a second viewer's keystrokes land in a shared session, deciding whether output fans out to clients as bytes or as redraws]
---

# Multi-client fan-out

The two-column cost model assumes one pair of eyes: existence costs scale
with N sessions, attention costs with the K sessions on screen. A host that
lives *behind* its viewers — a server-owned runtime that any number of
clients may attach to, over a socket or a network — breaks that assumption
in one place. A session there is watched by **M** clients at once, and
every frame the session produces is emitted once per client. Attention
costs therefore scale not with sessions but with **attachments** — session
× viewer pairs — and the per-frame emission row of the table carries a
multiplier the single-viewer table does not need. This technique owns that
multiplier: what bounds it, which client policy keeps one slow viewer from
stalling the rest, how one device size is arbitrated among many boxes, and
what happens to "one keyboard" when there are several.

It is a technique to build only when the runtime can have more than one
attached client per session. A desktop host with one user has M = 1
everywhere and the golden path's table is exact; a web terminal that spawns
one child per connection has no shared session to fan out from at all. The
condition is the presence of a *shared* session with *independent* viewers,
and the tell is a design review in which "how many clients" has no answer.

## The screen lives on the server, so a client stream is derived

The decision that bounds fan-out is where the emulator lives. In a
single-viewer host the emulator sits with the widget and is torn down on
detach; the backend keeps only a byte ring. In a multi-client runtime the
**server owns one screen model per session** — grid, cursor, scrollback —
as an existence cost, and what each client receives is not the child's
bytes but a **redraw stream derived from that grid**, sized to that
client's own window. Attach is a full redraw from the grid, not a byte
replay; the per-client cost is a redraw state plus an output queue; and
history is bounded in *lines* here, not bytes, because the record is a grid
row rather than a fragment of the raw stream (the byte-ring rule in
bounded-replay-buffers is a rule for a raw ring, and this is the other
design).

That placement pays for everything below, because a derived stream is
**regenerable**: any prefix of it can be thrown away and the client
repainted from the grid at any later moment with nothing lost. A stream
that is *not* derived — a subscriber that wants the byte-faithful
transcript for its own emulator, a harvester, a logger — cannot be
regenerated, because the bytes are the thing. The runtime therefore has two
kinds of subscriber, and the slow-client policy is different for each.

## A slow client is dropped and redrawn, never allowed to stall the session

The failure this technique exists to prevent: one attached client on a
poor link (or one that pressed the stop-output key and forgot) fills its
output queue, the runtime waits for it, and every other viewer's terminal
freezes — worse, the child itself blocks on a full pipe. The older
multiplexer lineage shipped with exactly that as the default and grew a
non-blocking option later; the rule is that **non-blocking is the only
acceptable default**, and the mechanism follows from the two subscriber
kinds:

- **A screen-derived client that cannot keep up has its queue discarded.**
  The threshold is proportional to the client's own screen (some small
  number of screensful of cells, so a large window earns a larger queue),
  the discard is counted and logged against that client, and the client is
  marked blocked. On a short timer the runtime checks whether the client is
  draining again; once it is, the block clears and the client is
  **invalidated for a full redraw from the grid**. The viewer sees a stall
  and then a correct screen. Nobody else sees anything, and the child never
  learns the client existed.
- **A byte-faithful subscriber that cannot keep up is paused, and told so.**
  It cannot be redrawn from the grid, so its stream is cut at a boundary
  with an explicit *paused* notification carrying how far behind it is,
  and resumes only on the subscriber's own *continue* — from the session's
  current offset, with what it missed gone and the gap disclosed
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success):
  a subscriber that silently receives a stream with a hole in it has been
  lied to). A subscriber that opts out of pausing and still falls a long
  way behind is disconnected outright with the reason stated, because an
  unbounded queue on its behalf is the existence column billed for a
  reader who has stopped reading.
- **The child is throttled only when nobody can consume.** Stopping the
  read from the pseudo-terminal — the backpressure that makes the child
  block — is correct exactly when every attached subscriber is off or
  paused, and wrong whenever one viewer is keeping up, because it makes the
  slowest reader set the pace of the program for everyone. This is the one
  place the runtime is allowed to touch the child's flow, and it is the
  last resort, not the first.

The shared buffer behind these readers is drained to the **slowest
un-paused reader's offset** — each byte-faithful subscriber carries its own
position, and the runtime frees what all of them have consumed. That is
why pausing is what keeps the buffer bounded: a reader that is neither
consuming nor paused pins the whole tail.

## One device size, many boxes: the policy is named

The resize chain in pty-management has one head — layout gives the widget
a box. With M clients it has M heads and still one device, so the runtime
declares **which client's box wins**, as a stated policy rather than
whichever resize arrived last: the smallest attached client (everyone sees
everything, at the smallest viewer's expense), the largest, the client with
the most recent activity, or a fixed manual size. The losers are not
ignored — a client smaller than the window is shown the part of it that
contains the cursor, with the visible region following the cursor on a
short delay so a status-line repaint does not drag the viewport — and the
runtime states that this clipped mode costs more to draw than a fit
window, so a slow link should prefer the smallest policy.

Two refinements the field converged on, both worth stating as rules:

- **Arbitrate per surface, not per session.** Clients looking at different
  surfaces of the same session (different windows or tabs) do not
  constrain each other; only clients focused on the *same* surface share a
  size. Sizing the whole session to the smallest client meant one viewer on
  a laptop shrank everybody's screen, and the fix was to narrow the
  arbitration's scope.
- **Control-plane clients do not vote.** A programmatic subscriber
  attached for its bytes has no window, and letting its nominal size into
  the arbitration shrinks real viewers' terminals to a size nobody is
  looking at. It is excluded from the policy unless it explicitly
  declares a size.

## Keyboards merge at the device, so writes are permissioned

Focus routing's "exactly one keyboard" holds per client. Across clients
there are M keyboards and one input side of the device, and they merge
there in arrival order — a second viewer's keystrokes land in the shared
session as if the first had typed them. The runtime therefore gives each
attachment a **write permission**, decided at attach and changeable later:
a read-only attachment sees everything and types nothing, and a session
that wants exactly one author at a time can hold a write lock that one
client takes and the others are refused. The ordinary shared-session
incident — a collaborator answering a prompt the operator was still
reading — is not a routing bug; it is a missing permission.

## The rung is per attachment

The session ladder's rungs describe what one viewer's attention costs.
Under fan-out each attachment sits on its own rung, and the session's rung
is the **highest** of them: a session is attached if any client watches it,
parked if some client keeps warm state for it and none is looking, and
detached only when its attachment set is empty. Every per-client
resource — redraw state, output queue, block flag, write permission —
is created on that client's attach and named for release on that client's
detach ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)),
because a client that drops its link without a farewell is the common
case, not the edge case, and its queue must not survive it. Budgets and
eviction policy are likewise per client: each client's focused session is
unevictable *for that client*, and an eviction for one client detaches an
attachment, not the session.

The single-viewer host loses none of this; it simply has M = 1 and every
rule above collapses to the golden path's table. The reason to state the
multi-client form at all is that the collapse is silent — a design that
never wrote down M discovers it on the day the second client attaches,
usually from a frozen terminal.
