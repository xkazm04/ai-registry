---
layer: technique
type: technique
subject: convergence-loop-and-requeue
technique: per-key-exclusion-under-a-global-cap
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [a concurrency setting is being used to prevent a key racing itself, choosing how many convergence passes may run at once, the queue depth graph does not explain the loop's behaviour]
---

# Per-key exclusion under a global cap

A convergence loop carries two limits that are constantly mistaken for one.
**Exclusion** says a key never runs concurrently with itself. **The cap** says
how many passes run at once across all keys. They answer different questions,
they fail differently, and the design must hold both — because each one, used
to do the other's job, produces a system that is wrong in a way its
configuration cannot express.

## Exclusion is an invariant, not a setting

Two passes for one key, overlapping, both read the world before either writes
it. Both compute the same missing thing, both create it, and the second create
either fails on a uniqueness boundary — a visible error for a condition the
design permitted — or succeeds and duplicates the effect. The full-state pass
that makes everything else in this subject safe is exactly what makes this
unsurvivable: full-state means *read, then decide, then write*, and that is a
read-modify-write with no guard around it.

So exclusion is not exposed. It has no knob, no default, and no documented way
to disable it, and the queue enforces it structurally rather than asking the
pass to take a lock — the key whose twin is executing is parked and released
when the twin finishes (see
[keyed-queue-with-earliest-wins](./keyed-queue-with-earliest-wins.md)). A
reconciler that must remember to acquire something is a reconciler that will
forget in the branch added next quarter; the whole value of putting exclusion in
the queue is that no pass author ever thinks about it.

The one thing exclusion does *not* provide is exclusion across processes. Two
copies of the loop, in two processes, each hold their own map and each will
happily run the same key at the same moment. This technique's guarantee is
in-process and must be stated that way
([cross-process-exclusion](../../../../backend-platform/work-execution/concurrency-guards/techniques/cross-process-exclusion.md)
owns the other kind). The mature answer in this territory is usually not to
acquire a cluster lock but to make the *effects* safe under concurrent writers
— which is the record-side discipline the sibling subject on declarative
resource lifecycle owns, and the reason a well-built converger can often run in
several copies with no election at all.

## The cap is an economy, and it is the number operators move

The cap bounds what the loop does to everything around it: the read and write
volume it puts on the store, the memory held by concurrent passes, the
downstream services each pass calls. It has no correctness content whatsoever
— any value from one to unbounded produces the same final state, differently
fast — which is precisely why it is the safe knob and exclusion is not.

Rules for choosing it:

- **Unbounded is a defensible default for a loop with cheap passes**, and it is
  a bad default for one whose passes call anything rate-limited. The tell is
  whether a pass's cost is dominated by work the loop owns or by a call it
  makes to something that can be overwhelmed.
- **Size it against the constrained resource, not against processor count.** A
  cap of eight when each pass holds a connection means eight connections; the
  same cap when each pass reads a large object into memory means eight copies.
  Where pass costs differ by orders of magnitude, a count is the wrong unit
  entirely and
  [resource-denominated-bounds](../../../../backend-platform/work-execution/admission-queue/techniques/resource-denominated-bounds.md)
  is the repair.
- **Never lower it to fix a correctness symptom.** A cap of one makes an
  exclusion bug disappear by serialising the entire loop, and the bug returns
  the moment somebody raises the cap for throughput — with no memory of why it
  was one. If lowering the cap fixes something, the something is an exclusion
  or idempotence defect and should be fixed where it lives.

## The interaction: a full cap must not lose arrivals

The two limits meet at one moment that is easy to get wrong. When the cap is
full, the queue keeps expiring entries — their times have arrived — and there
is nowhere to run them. The naive implementation stops draining the queue while
saturated, which is correct for the cap and wrong for everything else: arrivals
stop being deduplicated because they never reach the map, timers stop being
consulted, and an urgent arrival for a distant key cannot pull it forward
because nothing is reading arrivals at all. Under sustained load the loop's
behaviour changes character precisely when it is busiest.

The rule is: **the queue keeps accepting and coalescing while the cap is full;
only execution is withheld.** Expired entries move to the parked set exactly as
they would behind an in-flight twin, and are taken from it as slots free. The
consequence is that saturation costs latency and never costs deduplication —
in fact a saturated loop deduplicates *more*, because arrivals pile onto entries
that have not run yet, which is the correct behaviour and the opposite of what
a blocked queue does. The same rule covers the startup window: a loop waiting
for its local view to become complete withholds execution while accepting
arrivals for the whole warm-up, so the first pass runs against a warm queue
rather than an empty one.

There is a companion trap on the requeue path. A pass that finishes asks for a
next look by writing into the same queue, and if that write can block while the
loop's own consumer is busy running the pass that is writing, the loop
deadlocks — full slots, all of them blocked on a buffer only the consumer can
drain. Any bounded channel between "pass finished" and "queue" must therefore
be drained by a party that is not itself a pass, or the requeue must be able to
fail rather than block. The failure is load-dependent and does not reproduce on
a small object count, so it belongs in a test that floods the requeue path
deliberately.

## Three populations, three numbers

A single "queue depth" gauge on a converger is not one number badly named; it
is three numbers added together, and they diverge exactly under the conditions
an operator is investigating
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)):

- **waiting** — entries whose next-look time has not arrived. Growth here is
  normal and means the loop is tracking many keys.
- **parked** — entries whose time has arrived but which cannot run, either
  because a twin is executing or because the cap is full. Growth here is the
  loop falling behind, and the two causes want different fixes: twins mean a
  slow pass on a hot key, a full cap means the cap.
- **running** — passes in flight. Bounded by the cap by construction, so it is
  the number that tells you whether the cap is the binding constraint.

Report the oldest waiting time per population as well; a converger's real
service-level statement is "no key waits longer than X after its time arrives",
and no depth number answers it.

## The rejected alternative: one worker per key

The shape that removes both limits is a long-lived task per key, each looping
on its own. It gives exclusion for free — one task, one key, no shared state —
and it gives each key an independent cadence with no scheduler at all. It fails
on cardinality: a loop watching ten thousand records now holds ten thousand
tasks, most idle, each with a stack and a timer, and the cost is paid whether or
not anything is happening. It also has no way to express a global cap, because
the tasks do not know about each other, so the loop's total load is the sum of
whatever every key decided to do. Choose it when the key population is small,
bounded and long-lived — a handful of partitions, a fixed set of peers — and
choose a shared queue the moment the population is user-determined.
