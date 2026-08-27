---
layer: technique
type: technique
subject: scale-investment-timing
technique: ceiling-as-deadline-not-trigger
status: forged
laws: [count-carries-predicate, derivation-names-recomputation, absent-guard-is-loud]
shared_with: []
use_when: [stating when the current architecture runs out, deciding when a replacement programme has to start, a team is arguing about whether it is at scale yet]
---

# The ceiling is a deadline, not a trigger

The claim, in one sentence: **a system's stated capacity ceiling is the date by which
its replacement must be finished, not the signal to begin one.**

Both halves of that need work. Most teams have no stated ceiling at all, so the first
half is about producing one. The teams that do have one almost universally read it as
a trigger, and the second half is about why that reading selects the worst available
replacement method.

## A ceiling has three parts or it is an opinion

Write all three or the number is decoration:

1. **The figure.** One number.
2. **The axis it is measured on.** Requests per second, tenants, bytes stored, items
   in the largest single collection, fan-out per write. Not "load".
3. **The method that measures it.** The query, the dashboard, the load test, the
   derivation — something another person can run and get the same answer from.

This is [count-carries-predicate](../../../../_laws.md#count-carries-predicate)
applied to a number that will travel further than most: a ceiling gets quoted in
planning documents, budget requests and architecture reviews for years, and a ceiling
without its axis and method will be reused for a claim it never supported. "We can
handle about ten thousand a second" is a sentence that has started more bad projects
than it has prevented.

And the ceiling is a derived value, so it names its recomputation, per
[derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation).
It was derived against a workload mix, a data volume, a hardware configuration and a
read/write ratio, all of which move. State the conditions it was measured under and
what change invalidates it — a new access pattern, a tenant an order of magnitude
larger than the largest one measured, a feature that turns a point read into a scan.
A ceiling nobody has recomputed in two years is not a ceiling, it is a fossil.

## Say whether the ceiling is in utilisation or in headroom, because they are not the same

This is the most common way a correctly measured ceiling still misleads, and it is
worth stating precisely.

A ceiling expressed as **headroom consumed** — this box has a hundred and twenty cores
and we are using ninety-six of them — is a statement about resource exhaustion. It
reaches its limit at a hundred percent.

A ceiling expressed as **utilisation** is a statement about a queue, and queues do not
degrade linearly. For a simple single-server queue, mean time in system rises as the
reciprocal of the unused fraction: at eighty percent utilisation the average request
already spends roughly five times its own service time in the system, most of it
waiting, and past that the curve turns sharply upward. Practitioners generally place
the usable knee somewhere between seventy and ninety percent, and size for the lower
end of that band.

The two measures diverge exactly where it hurts. A team reporting "we are at eighty
percent of capacity, we have room" may be describing a box with a fifth of its cores
idle *and* a service whose tail latency has already left the acceptable range,
because the second fact lives on the utilisation curve and the first does not. **State
which measure the ceiling is in.** If the system's user-visible property is latency,
the ceiling belongs on the utilisation curve and its figure should sit at the bottom
of the knee, not at the top.

## An uninstrumented ceiling is an absent ceiling

A ceiling that must be checked by a person looking at a dashboard is not a control, it
is a hope, and it follows the rule in
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud): a guard that has to
be remembered protects the examples and not the installation. Once the figure exists,
something automatic watches the axis and says so on approach — well before the figure,
not at it.

Two alerting properties matter more here than in ordinary monitoring. The alert fires
on a **trend crossing a fraction of the ceiling**, not on the ceiling itself, because
the ceiling is the deadline and an alert at the deadline is a post-mortem. And it
fires on the *measured* axis rather than a proxy for it; the whole value of having
written the method down is that the alarm and the ceiling are computed the same way.
Wiring and lifecycle for that belong to
[observability-telemetry](../../../platform-observability/observability-telemetry/observability-telemetry.md).

## The runway calculation

Here is the part that inverts the intuitive reading.

The replacement method with the best record is incremental: stand the new
implementation up beside the old one behind a stable interface, move one capability at
a time, run both live, and retire the old path when nothing routes to it. It is
slower in calendar terms and enormously safer, because every step is individually
reversible and the system never has a flag day.

That method consumes **runway** — a period during which both systems exist, the team
is carrying two operational surfaces, and load is still comfortably under the ceiling.
A team that treats the ceiling as a trigger has, by construction, zero runway at the
moment it decides to act. What it can still do is the all-at-once replacement: build
the new system separately, cut over on a date. That method fails in four well-attested
ways, and every one of them is made worse by time pressure — requirements drift while
the target keeps moving, the hidden complexity of the old system surfaces only during
cutover, sunk cost prevents cancellation once it is clearly late, and the cutover
itself is all-or-nothing. On top of which the replacement is a **second system**, and
second systems reliably accumulate every capability that was deferred from the first,
arriving both later and larger than planned.

So the calculation runs backwards, and it is arithmetic rather than judgement:

- **T_ceiling** — the date the growth curve meets the stated figure, taken from the
  projection rather than invented.
- **T_replace** — how long an incremental replacement of this capability actually
  takes, estimated from a comparable piece of work the team has finished, not from
  the plan.
- **Start no later than `T_ceiling − T_replace − margin`.**

The margin is not decoration. Both inputs are uncertain, and they are uncertain in the
same direction: growth curves surprise upward and replacement programmes surprise
long. Where the projection's own confidence band is available, use its optimistic edge
for `T_ceiling` rather than its centre.

If that arithmetic returns a start date in the past, that is a finding and it should
be said plainly rather than rounded away. It means the incremental option has already
expired, the team is choosing between the risky method and buying time, and **buying
time is now a first-class option** — a headroom purchase whose only job is to restore
the runway that makes the safe method available again. Bought time is expensive and it
is almost always cheaper than the alternative it protects against.

## When not to apply it

**When the ceiling is not reachable.** Plenty of systems will never approach their
limit, and a stated ceiling for them is a one-line note, not a programme. The test is
whether the projection meets the figure inside the horizon anyone can defend; if it
does not, write the number down, alert on it, and stop.

**When the replacement is not incremental-capable.** Some changes genuinely have no
strangling path — a data model change that must be atomic across every tenant, a
change of consistency guarantee that callers can observe. There the runway buys
rehearsal and reversibility rather than gradual migration, and the calculation still
runs, with `T_replace` covering the dress rehearsals instead of the increments.

**When the axis is not the binding one.** A precisely measured ceiling on the wrong
axis is worse than no ceiling, because it is trusted. Axis selection is
[next-order-of-magnitude-only](./next-order-of-magnitude-only.md) and it comes first.

**Do not use the runway calculation to justify starting immediately.** The arithmetic
has a defensible latest start date and no earliest one, and a team that wants the
rewrite will happily set the margin high enough to make today the answer. The margin
is stated and argued before `T_replace` is estimated, not after.
