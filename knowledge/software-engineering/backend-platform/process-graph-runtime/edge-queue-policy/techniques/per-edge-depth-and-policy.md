---
layer: technique
type: technique
subject: edge-queue-policy
technique: per-edge-depth-and-policy
status: forged
laws: [absent-guard-is-loud, unknown-is-not-a-value]
shared_with: []
use_when: [sizing the queue on a declared edge, choosing between drop-oldest and backpressure, a consumer needs losslessness on one input and freshness on another]
---

# Per-edge depth and policy

Depth and overflow verdict are declared on the **edge**, beside the edge, and
never inherited from the consumer. Two numbers and one enum, per channel: how
many messages may wait, what happens to the surplus, and — where the verdict is
lossless — the ceiling past which even losslessness gives up.

## Why the edge and not the consumer

A consumer's inputs differ by orders of magnitude in every property that
decides a queue. A perception edge delivers hundreds of messages a second, each
large, each worthless the moment its successor exists. A command edge delivers
one message a minute, small, and every one of them load-bearing. A parameter
edge delivers a message when a human changes something and its *last* value is
the only one that has ever mattered. One depth across the three either wastes
memory on the slow edges or truncates the fast one, and one overflow verdict
across the three is wrong twice.

Declaring per edge also puts the decision where it is legible. The reader of a
graph declaration sees "this link keeps ten and drops the oldest" next to the
link it governs, which is the only place a reviewer can evaluate it against
what the link carries.

## Deriving the depth

Depth on an edge is not a wait-time budget — nobody waits — it is a **burst
budget**. Three anchors, in order of authority:

- **The consumer's worst service pause × the producer's rate.** The queue
  exists to absorb the consumer's hiccups: a garbage-collection pause, a slow
  frame, a lock held by a sibling task. Size the queue to the pause the
  consumer actually exhibits, not to the mismatch in average rates. A queue
  sized for a sustained rate mismatch is not a queue, it is a delay line that
  fills once and stays full.
- **The staleness horizon.** Depth × inter-message interval is the age of the
  oldest message the consumer can be handed. If that age exceeds the point
  where the message is worthless — a pose from two seconds ago, a frame from
  four hundred milliseconds ago — the extra slots hold garbage that the
  consumer must still process before reaching the useful message. On a
  freshness edge, a deeper queue makes latency worse, and this is the anchor
  practitioners most often get backwards.
- **Depth × payload, summed over every edge in the process.** Per-edge bounds
  are only a memory bound in aggregate; a hundred edges of ten large frames
  each is a memory incident spelled in small numbers.

A small default — single digits to low tens — is right for the ordinary edge
precisely because it makes the first two anchors visible. When it is too small,
the drop counters say so immediately; a large default hides the same mismatch
as latency.

## The two verdicts

**Drop-oldest is the default**, and it is the default because the common edge
carries a continuing signal whose newest value supersedes the old. At capacity
the queue evicts its oldest message and admits the arrival, so the consumer
always advances toward the present and the producer is never blocked by a peer
it does not control. This is the inverse of a work queue's refuse-newest, and
the inversion is the whole reason this technique exists rather than deferring
to the executor-admission subject.

**Backpressure is the declared exception**, taken by a consumer that states it
cannot afford a gap: a transaction log, a command sequence whose meaning is
cumulative, a file transferred in chunks. At capacity the send blocks, the
pressure propagates upstream, and the producer slows to the consumer's rate.
Three conditions must hold before an edge may declare it, and all three are
checkable at review time: the producer's work can actually be deferred (a
sensor cannot be asked to stop sensing); no other consumer of that producer is
harmed when it slows (a producer with a second, latency-sensitive output edge
is now coupling them); and the pipeline has no cycle through this edge, because
backpressure around a cycle is deadlock with a queue in front of it.

## Losslessness gets a hard ceiling

An unbounded lossless queue is an unbounded queue. Where backpressure is
declared, the queue still names a cap — an order of magnitude above the
nominal depth, with a floor beneath which the multiplier is meaningless — and
at the cap it **drops and logs at error level** rather than growing further.
The cap is not a betrayal of the declaration; it is the declaration's honesty.
A consumer that was promised losslessness and instead received a hang has been
served worse than one that received a loud drop with a count attached, and the
system that grew until the host killed it served everybody worst of all.

The paired obligation is the log. A drop under a lossless declaration is the
only drop in this subject that is a *defect report* rather than a policy
outcome: it says the consumer has been slower than its declared producer for
long enough to exhaust an order of magnitude of headroom, which is a capacity
problem no queue setting can repair.

## The bound is enforced at admission, on the affected edge only

Where the queue is shared across a consumer's edges, the temptation is to sweep
— walk every edge, count each one's live messages, trim whoever is over. That
sweep runs on every arrival, allocates a map proportional to the number of
edges, and does it on the hot path to save a rare case from happening.

Enforce on admission instead, and inspect only the edge the arrival belongs to:
if every other edge was within its bound before the push, and a push changes
exactly one edge's count, then only the pushed edge can now be over. The
invariant is what makes the shortcut sound, so it has to be maintained on
*every* admission — a batch enqueue that pushes several messages between checks
silently breaks it, which is worth a comment at both sites, because the next
person to add a bulk path will not derive it.

## Degenerate values are clamped, not honoured

A depth of zero is the value most likely to be typed by accident and least
likely to mean what it says. Honoured literally it makes the edge a port that
accepts nothing — a topology change effected by a typo, presenting downstream
as an input that never fires and upstream as a producer nobody consumes. Clamp
it to one and record the clamp: an edge that exists in the declaration exists
in the runtime.

The same discipline forbids the other overload. **Zero must never mean
unbounded**, and neither must a negative or an absent field. A sentinel that
turns the bound *off* makes "off" the cheapest configuration to ship and the
one a partially-filled declaration converges on — an absent guard, arrived at
silently ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)),
and a value that renders "not stated" as a definite and extreme setting
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). If
unbounded must be expressible, it is its own named variant, chosen in words,
and it is reported as a finding by whatever reviews the graph.

## When this is not the right instrument

Do not reach for per-edge policy where the edge is not standing: a one-shot
handoff, a request awaiting its reply, a queue whose entries are work items
with a fate. Their bound belongs to the executor's admission discipline, whose
verdict vocabulary and per-requester fairness this technique deliberately does
not reproduce. And do not use depth as a rate control. An edge whose producer
is *permanently* faster than its consumer needs a rate decision at the producer
— send every nth sample, or emit on change — because no depth makes a
persistent mismatch anything other than a choice about which messages to
discard, made far from the process that knows which ones matter.
