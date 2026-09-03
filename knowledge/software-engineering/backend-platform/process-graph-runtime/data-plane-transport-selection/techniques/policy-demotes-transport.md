---
layer: technique
type: technique
subject: data-plane-transport-selection
technique: policy-demotes-transport
status: forged
laws: [absent-guard-is-loud, one-validation-door]
shared_with: []
use_when: [an edge declares a guarantee the fast path cannot observe, deciding whether a declared deadline forbids a bypass, a policy in a descriptor stopped taking effect after a transport change]
---

# Policy demotes transport

Size and reachability decide whether a direct route *can* carry a message. A
declared policy decides whether it *may*. The rule is one line and the rest of
this document is its consequences: **an edge whose declared guarantee is only
observable on the brokered path takes the brokered path, whatever the payload
size and whatever the measurement says.**

## Why a declaration outranks a measurement

A guarantee written in a descriptor is a promise the system made to whoever
authored the graph. The bypass is an optimization the system chose for itself.
When the two collide, the promise wins — not because promises are sacred, but
because the author of the descriptor cannot see the collision. They declared a
staleness deadline on an input; nothing they wrote said anything about
transports; and if the transport quietly voids the deadline, the guard they
asked for is present in the configuration and absent in the running system
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

The alternative design — let the fast path win and document that certain
declarations are incompatible with it — fails for a specific reason. It makes
the operator hold both halves of an invariant, so the guarantee now depends on
every future descriptor author having read a note about transport interaction.
That is exactly the shape of a policy that has become advisory.

## The demotion table

Four declarations pin an edge, and each pins it for a mechanical reason worth
knowing rather than memorizing.

**A staleness deadline on an input.** This is the sharp case. The deadline is
armed and refreshed by the supervisor sitting beside the consumer: it sees
each delivery, resets the timer, and raises the timeout when nothing arrives.
A direct route removes precisely that supervisor from the path, so deliveries
stop refreshing the deadline and the guarantee inverts — a *healthy* fast edge
looks stale. The demotion is not a conservative choice, it is the only correct
one, and it applies specifically to a **remote** consumer whose deadline is
kept by its own supervisor rather than the producer's.

**A recording or observation obligation.** Where the observer is a privileged
tap on the broker, an edge that bypasses the broker is an edge the recording
does not contain. Either the edge is pinned, or the observer is re-implemented
as an ordinary subscriber on the direct path — and that is a real cost, not a
configuration change, because such a subscriber must copy every message it
observes.

**A lossless or strictly ordered delivery requirement.** An edge that has
declared it may not drop is claiming a property the brokered queue implements
and the direct route does not, or implements differently. Until a paired test
proves the direct route holds the same property, the declaration pins the
edge.

**Any policy enforced by a component the bypass removes.** This is the general
form and the one to reason from. Ask, for each declared policy, *which process
enforces it*. If the answer is a process the direct route skips, the
declaration pins the edge, and the table above is just the four instances that
recur.

A fifth row is not a policy at all but belongs in the same table because it
produces the same verdict: **an edge whose consumer can only be attached
later, by a control-plane mutation, is pinned.** A route added after the fact
is wired by the mediator and delivered by it; a producer that had gone direct
would be publishing where the newcomer has no subscription, and would starve
it silently. Pin on the structural fact — no current receivers — rather than
waiting to discover it.

## One door for the decision

The demotion is evaluated in **one routing computation that every edge passes
through** ([one-validation-door](../../../../_laws.md#one-validation-door)),
which takes the edge's declared policies and the peers' resolved placement and
returns the route. It is not a condition sprinkled at the call sites that
happen to know about deadlines, because the call site added next quarter will
not know, and a routing rule that holds at three of four call sites holds
nowhere.

**That computation belongs on the control plane, not in the producer.** It
needs two things a producer does not have: the whole descriptor, and where
every peer actually landed — which machine, whether that machine has a
reachable address, whether a consumer is statically declared or may join
later. The producer is handed the resulting decision per output and executes
it; its own per-send branch reduces to a frozen flag and a size comparison.
Pushing the derivation down into each producer means re-deriving a placement-
dependent rule in a process that can only guess at placement, and the guesses
diverge.

Two properties keep that door honest. It returns a **typed route decision with
its reason attached** — pinned-by-deadline, pinned-by-observer, below
threshold, probe not acknowledged, direct — so the operator-facing answer to
"why is this edge slow" is a value the system already computed rather than an
inference from configuration. And it is **directly testable**: given a
descriptor fragment and a peer location, assert the route. That test is the
cheapest one in this subject and it is the one that catches a future
optimization quietly reordering the checks.

## The traps

**Testing size before policy.** If the size comparison runs first, a large
payload on a pinned edge takes the fast path, which is the exact case the
pinning existed for — pinned edges usually carry big things. Policy is
evaluated first, always.

**Applying the deadline rule to local consumers by symmetry.** The deadline
pins a *remote* consumer because its deadline is maintained by a supervisor
the bypass removes. Where the producer's own supervisor keeps the deadline and
remains in a position to observe the edge, the pin is unnecessary and costs
throughput for nothing. Symmetry is a plausible-sounding reason to lose the
benefit on half the graph; ask which process holds the timer instead.

**Treating the demotion as a diagnostic rather than a decision.** A pinned
edge is a normal, correct, permanent state, and it is reported as a route with
a reason — not as a warning. Logging it as a problem trains operators to
ignore the log, and the demotion log is where a genuinely misconfigured edge
becomes visible. Where the demotion is documented, name the lever: an operator
told "this input declares a deadline, and that is why this edge is on the slow
path" can decide to drop the declaration and take the speed. That sentence is
what makes the rule a trade the operator owns rather than a limitation they
work around by accident.

**Letting a policy be declared that nothing enforces on either path.** The
audit runs in both directions: a declaration that pins an edge to a path where
the guarantee is *also* unimplemented has bought a slowdown and no promise.

## When not to use it

- **When no edge declares anything.** A graph whose descriptor carries no
  guarantees has nothing to demote, and the routing function reduces to
  probe-and-threshold. Keep the door — it is where the first declaration will
  land — but do not build a table for an empty set.
- **When the guarantee is genuinely available on both paths.** Once a paired
  test proves the direct route honours the declared property, the pin is
  removed. Pinning is a statement about a missing implementation, not about
  the declaration, and leaving a stale pin in place is a permanent tax on a
  problem that was fixed.
