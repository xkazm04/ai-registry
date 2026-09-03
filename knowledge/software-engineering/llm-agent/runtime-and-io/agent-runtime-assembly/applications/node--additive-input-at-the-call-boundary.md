---
layer: application
type: application
subject: agent-runtime-assembly
technique: additive-input-at-the-call-boundary
stack: node
verified_on: 2026-09-03
verified_against: node@24.15.0
---

# A steering design that records the alternative it rejected

The same local-first desktop coworker: a turn-oriented agent runtime with a
session layer above it, both specified in committed design documents that
are revised as the implementation lands rather than written once. Version
witness as before — the release workflow's Node pin at commit `f4fce64a`,
resolved 2026-09-03.

This tree is the reason the technique can state its three reasons as facts
rather than as predictions. It shipped **both** halves — the queue in the
session layer, the injection in the loop — and it wrote down the design it
did not take, with the argument.

## The rejected alternative, and why it lost

The recorded alternative is supersede-at-boundary: gracefully cancel the
running turn at the batch boundary with a "steered" reason, then promote
the message as a new turn referencing the cancelled one. The document is
explicit that this was attractive — zero schema change, and it collapses
queueing and steering into one promotion path — and then names three
defeats, each of which is a property owned by a different subsystem:

- The transmit-time elision decorator would replace the just-executed
  batch's large tool results with placeholders on the very next call. The
  model forgets what it just read at the exact moment it is steered
  mid-task.
- Cross-turn continuation stripping would drop the reasoning signatures of
  a cancelled turn, because an unclean close forfeits the seal. Every steer
  would break interleaved-thinking continuity.
- It is destructive by construction to turns suspended on permissions,
  since cancelling them discards their pending calls — and a blocked turn
  is when a person is most likely to type.

That third one is the one a design review would miss, and it is the one
that makes the choice structural rather than a preference: the state in
which steering is most valuable is the state supersede cannot serve.

## What the loop actually accepts

Injection happens at one point: the tool batch has settled, completion has
been ruled out, and the next request is about to be prepared. The loop
polls a caller-supplied drain once per iteration and the document says
plainly that the loop never learns where the messages come from — a session
queue and a test fixture are indistinguishable to it. Each accepted message
is appended as an indexed durable event, and the reducer **enforces** that
the next request references every input accepted before it; the document
notes that this enforcement is also what makes recovery correct, because an
input orphaned by a crash is picked up by the re-issued request's
references.

The budget reset is present and argued in the technique's own terms: fresh
user input buys the allowance a fresh turn would get.

## The trade-off it recorded rather than hid

Delivery is documented as "earliest safe point, never guaranteed same
turn" — if the final response has no tool calls there is no next boundary,
and the message promotes into a new turn instead.

The related decision worth carrying is the session layer's: the pending
queue is **process memory only**, deliberately superseding an earlier
committed design that made it durable. The stated reasons are one
durability point instead of cross-file reconciliation, consistency with the
runtime's rule that durable events record facts rather than intent, and a
refusal to let a durable queue promote at startup and begin model calls
nobody asked for. The accepted cost is written down beside it: a remote
sender whose message was queued loses it silently on a crash, where a local
user at least sees the pending row vanish.

That is the shape to copy — not the choice, which depends on whether a
remote sender exists, but the habit of recording the cost in the same
document as the decision.

## What this tree does not settle

Nothing here is measured. There is no count of steers delivered in-turn
versus promoted, no comparison of task outcomes under the two designs, and
no instrument that would produce one. The three reasons supersede loses are
arguments from the runtime's own invariants, which is strong evidence about
correctness and no evidence about whether users notice. A team adopting
this should instrument the in-turn-versus-promoted split before it believes
the boundary is placed well, because that ratio is the only cheap number
that would show the boundary is too narrow.
