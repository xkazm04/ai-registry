---
layer: application
type: application
subject: hitl-approval
technique: truncated-verdict-space
stack: next
status: forged
verified_on: 2026-09-03
verified_against: next@16.3.3
applied: simulation
ab_verdict: not-better
proof: structural-only
---

# The same truncation, pointed the other way

The version witness is the exact dependency pin `"next": "16.3.3"` in the
repository's own `package.json`; its CI additionally pins node 24 with a comment
naming the verified local toolchain, so the stack is pinned rather than floated.

This tree is a hiring workspace whose stated shape is "screening behind human
approval gates". It runs an automated pass over active pipeline entries: a
policy component decides, and a separate applying component commits the
decision. The technique predicts one of two designs, and the tree implements the
mirror image of the one the technique's prose describes.

## What the arms were

**Arm A — the tree as it stands.** The machine's verdict space is truncated on
the **adverse** side. A fairness-cleared rejection is never applied: it is
downgraded to a hold and routed to the human gate, and the applying module says
so in its own comment — *"the pass no longer produces a rejection"*, with
neither the rejected counter nor the applied path incremented. Meanwhile the
admitting verdict *is* auto-applied, by the system actor, with the stage
transition committed under an optimistic compare-and-set.

**Arm B — the technique as written.** Truncate the admitting verdict: route
every automated advance to a human and let refusals flow.

Walked over three real shapes from this tree — a below-floor score on a
non-protected entry, an unscored entry with a data gap, and an early-career
entry the fairness predicate protects — arm B is **worse**, and not marginally:

- It moves the human gate onto the reversible direction. A wrongly advanced
  candidate meets the next human stage anyway; the advance creates no durable
  position, because every downstream stage in this pipeline is itself gated.
- It leaves the irreversible direction where arm A already fixed it. An
  automated rejection is the decision the subject never learns about, never
  returns from, and in this domain is the one a regulator asks about.
- It would roughly invert the queue's composition, spending the scarce resource
  the technique itself says becomes the binding constraint on exactly the
  decisions that did not need it.

## The condition under which the technique does not hold

Stated as the row's return condition, and landed as an amendment to the
technique: **polarity is not part of the mechanism.** The rule is *truncate the
verdict the system cannot take back*, and which end that is depends on where the
durable position is created — by letting something in, or by shutting something
out. A reader who copies the technique's polarity instead of its rule doubles
human load on the reversible direction and leaves the irreversible one
automated, which is the precise inversion the technique exists to prevent.

That correction came from this tree, not from the source that produced the
technique; the source is a distribution system where admission is the
irreversible direction, and it could not have shown the other end.

## The second mechanism this tree contributes

The tree's truncation is enforced twice, and the second enforcement is the part
worth copying. The deciding component is a separate process in another language;
the applying component re-derives the fairness gate from the entry snapshot it
already holds, and downgrades a forbidden verdict rather than applying it. Its
own comment gives the reason: until that module existed the applier passed the
decider's verdict through verbatim, so *any* upstream regression emitting a
forbidden rejection would have been applied silently. The backstop is
deliberately not a mirror of the decider's logic — it re-derives from state —
and its downgrades are counted and alerted, because the count is the only
evidence the decider has drifted.

Both properties are now in the technique. Neither was in it before this tree was
opened.

## What this realization cannot show

The walk is over three real entry shapes and their code paths, not over a
measured queue. It establishes which direction each arm sends a decision, which
is a structural claim the code answers exactly; it does not establish the volume
on either side, and the volume is what decides how expensive arm B would have
been rather than whether it is wrong. The instrument that would settle it — a
count of automated advances that a later human stage reversed — does not exist
in this tree, and that is the return condition for measuring rather than
reasoning about it.
