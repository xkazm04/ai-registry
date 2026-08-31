---
layer: technique
type: technique
subject: admission-queue
technique: resource-denominated-bounds
status: forged
laws: [count-carries-predicate, gate-sees-target, derivation-names-recomputation]
shared_with: []
use_when: [item cost varies by orders of magnitude across arrivals, a concurrency cap tuned for the worst arrival starves the common one, choosing the unit a capacity bound is spelled in]
---

# Resource-denominated bounds

Every capacity bound is spelled in some unit, and the unit is a claim. "At most
eight concurrent" claims that eight of anything this queue admits will fit; it
is shorthand for *eight times the cost of one item*, with the cost left
unwritten. The shorthand is correct exactly while items cost the same. When
they do not, a count bound is a bound on the wrong quantity, and it fails in
both directions at once — too permissive for the heavy arrival, far too strict
for the light one.

[depth-bounds-and-shed](./depth-bounds-and-shed.md) derives the depth bound
from entry cost "under the pessimistic case where every entry is maximal", and
that instruction is right about the arithmetic and wrong about the unit. Sizing
a *count* against the maximal entry is what produces the pathological cap: when
the largest legitimate arrival is three orders of magnitude heavier than the
median one, the pessimistic count is one or two, and a queue that could
comfortably run thirty typical items refuses the third. The system then reads
as saturated under ordinary load, and the operator's only available repair —
raise the number — reintroduces the risk the pessimistic sizing existed to
prevent. Neither setting is right, because no single count is.

## Denominate the bound in the resource that actually runs out

The repair is to stop counting items and start counting the thing the bound is
protecting: bytes of memory held, tokens of context, connections, bandwidth,
storage. Each admitted item is charged its own true cost, so a light arrival
consumes little of the budget and a heavy one consumes a lot — which is what
the count bound was trying and failing to approximate.

- **Charge the real figure, never a class average.** The point of changing
  units is that costs differ; substituting one estimated cost per item
  re-creates the count bound with extra arithmetic. Where the exact figure is
  knowable at the door — a content length, a declared size, a measured
  payload — charge that.
- **Fold the amplification factor into the budget, not into the charge.**
  A raw input rarely occupies its own size while in flight: it is buffered,
  decoded, parsed, and transformed, and several representations coexist. Divide
  the ceiling by that multiplier once, at budget-derivation time, and let each
  item be charged its plain measured cost. Charging each item a guessed
  multiple instead scatters an estimate across every admission decision and
  makes the budget unreadable.
- **The count bound survives as a secondary guard, not the primary one.**
  Some resources are genuinely per-item — a file handle, a slot in a
  downstream pool. Keep those as their own bound; what changes is which bound
  is doing the load-bearing work.
- **The predicate travels with the number**
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
  "In flight: 41 MB of 96 MB" is actionable; "in flight: 7" is not, because it
  does not say seven of what, and under a resource-denominated gate the item
  count and the occupancy diverge precisely when it matters.

## An arrival larger than the whole budget is refused, not queued

A resource-denominated bound creates a case a count bound cannot have: an item
whose individual cost exceeds the entire budget. It can never be admitted, no
matter how empty the queue becomes, so queueing it is a promise the gate has
already decided to break — the entry waits for capacity that cannot exist, ages
past its own deadline, and occupies a position that a serviceable item could
have used.

Refuse it at the door, immediately, with a reason distinct from queue-full: the
correct caller reaction is to *make the request smaller*, which is unrelated to
backing off and retrying. Only contention among individually serviceable items
belongs in the waiting line. This is the admission-time expression of the same
rule [admission-vocabulary](./admission-vocabulary.md) applies to `invalid` —
a request that could never run does not get a promise.

## Derive the ceiling from the host, do not ship a number

A hardcoded budget is a guess about a deployment, and it is wrong on every
deployment that is not the author's: the same figure starves a small container
and wastes most of a large host. The ceiling is therefore *read* at startup
from the platform's own limits — the runtime's heap ceiling, the container's
memory allowance, whichever is tighter — and the budget is a stated fraction of
it.

Four disciplines keep the derivation honest:

- **Take the tighter of the ceilings you can read, and record which one won.**
  A process inside a container has at least two limits, they disagree, and only
  the smaller one kills you
  ([gate-sees-target](../../../../_laws.md#gate-sees-target): a budget derived
  from the runtime's own ceiling while a tighter external one is what actually
  terminates the process is a budget measured against a fiction). Where a limit
  is unreadable on this platform, its absence must be spelled as *absent* and
  the other ceiling used — not defaulted to a number that then silently
  competes with a real reading.
- **Clamp both ends, and know what each clamp buys.** A floor preserves
  liveness on a host too small for the fraction to yield a workable budget,
  explicitly accepting that the floor may reserve a large share of a tiny
  host. A ceiling stops the derivation from handing a huge machine a budget so
  large that the bound stops binding before something else breaks.
- **Resolve once and cache; never re-read on the hot path.** The gate consults
  this budget on every arrival, and a syscall per admission turns the gate into
  the load it was measuring.
- **The derivation names its inputs**
  ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)):
  which ceiling was read, what fraction was applied, what multiplier was
  divided out, and which clamp bound the result. An operator who cannot
  reconstruct the number cannot tell an undersized host from a miscalibrated
  fraction, and will tune the wrong one.

An explicit operator override stays available and passes through the same
clamps — an override is a different opinion about the fraction, not a licence
to exceed the platform's limits.

## Where the count bound is still right

Denomination is a choice, not an upgrade, and the count keeps winning wherever
its claim is true:

- **Item cost is genuinely uniform**, or varies within a factor of two or
  three. The count is then an honest proxy and a far cheaper one.
- **The scarce resource is per-item by nature** — a connection, a licence
  seat, a downstream slot.
- **No cost figure is available at the door.** A bound denominated in a
  quantity the gate cannot measure before admitting is worse than a count: it
  charges a guess and reports it as a measurement. Measure first, or keep
  counting and say so.
