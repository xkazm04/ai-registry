---
layer: technique
type: technique
subject: peer-benchmarking-under-k-anonymity
technique: exclude-yourself-from-the-peer-aggregate
status: forged
laws: [say-only-what-the-record-holds]
use_when: [computing a peer average a participant will read, auditing a benchmark for differencing attacks, deciding what the word "peers" means in a comparison]
shared_with: []
---

# Exclude yourself from the peer aggregate

The aggregate a participant reads is computed over every contributor **except
that participant**. "Your time-to-hire is 24 days; your peers average 31" means
peers *other than you*. This is not a rounding nicety. It is the control that
makes the rest of the benchmark's privacy story hold, and it is the cheapest
control in the entire subject.

## The attack it defends

A participant knows their own figures exactly — count, sum, mean, everything.
If the published peer aggregate includes them, it is a system of equations with
one term already solved. Subtract the known contribution from the published
total and the remainder is the rest of the pool.

At two contributors this is not an approximation; it is exact. Participant A
reads "the average across contributors is 27 days over 40 hires", knows its own
15 hires averaged 21 days, and recovers B's 25 hires at 30.6 days in one line of
arithmetic. B's private operating data has been handed to its competitor by a
feature marketed as anonymous.

At larger pools the same subtraction yields the *remainder of the pool* rather
than any single organisation, which is far less damaging — but it degrades
smoothly, not sharply. At four contributors, a participant who subtracts itself
is looking at three, and if it knows one of the three from public sources it is
looking at two. Self-exclusion removes the first and easiest step of every such
chain, at the cost of one predicate.

There is a second, quieter benefit. A self-inclusive comparison is also
**analytically wrong**: a large contributor compared against an aggregate it
dominates is comparing itself against itself, sees agreement, and reads that as
validation. Self-exclusion is what makes a benchmark an *external* reference
rather than a mirror.

## Procedure

1. **Make exclusion a property of the read, not of the caller.** The
   cross-organisation read takes the reader's identity as a required input and
   excludes it internally. An optional flag, or an exclusion applied by whoever
   calls the function, is a defect waiting for the second caller.
2. **Apply the floors after the exclusion.** A pool of five contributors where
   the reader is one is a pool of four peers, and four is the number that must
   clear the contributor floor. Checking before exclusion overstates the pool by
   exactly one, which matters most in precisely the small cohorts where it
   matters most.
3. **Say what "peers" means in the interface.** One clause — *organisations
   other than yours* — removes a whole class of misreading, and it tells a
   privacy-conscious customer that the exclusion exists without them having to
   ask.
4. **Show the reader's own figure separately**, computed over their own data
   alone, so the comparison is explicit rather than implied. Two labelled
   numbers cannot be confused; one number with a footnote can.
5. **Audit every cross-organisation read for the predicate.** This is a control
   that is easy to add and easy to lose in a refactor, and its absence is
   invisible in the output — the number simply shifts slightly.

## Decision rules

- When a reader belongs to several organisations in the system, exclude all of
  them. Exclusion is over everything the reader can see, not over the currently
  selected workspace.
- When the reader has contributed no rows to a cohort, exclusion is a no-op and
  the aggregate is unchanged — but keep the predicate anyway, because the reader
  may contribute tomorrow and nothing will announce it.
- When a benchmark is shown to somebody who is not a contributor at all — an
  internal operator, a market report — exclusion has nothing to do, and the
  floors do all the work. Do not let this case become the default
  implementation that participants then also receive.
- When exclusion drops a cohort below its floor, withhold. Never fall back to
  the self-inclusive figure because it clears; that trade sells the exact
  property the exclusion exists to protect.
- When the benchmark is recomputed on a schedule, remember that exclusion does
  not defend against **longitudinal** differencing: a participant watching the
  peer aggregate move as contributors join and leave can still subtract across
  time. Coarse recompute cadence and headroom above the floor are the controls
  there; self-exclusion is not.

## When not to use this

Do not exclude the reader from a figure that is explicitly *market-wide* and
labelled as such — a total pool size, a count of participating organisations, a
statement of coverage. Those are facts about the pool, not comparisons against
peers, and removing the reader from them makes them wrong.

Do not use self-exclusion as a substitute for the floors. It removes one
subtraction; it does not make a three-contributor cohort safe. The two controls
compose and neither is sufficient alone.

Do not let the exclusion go unstated in the released figure's basis. A benchmark
that silently means different populations for different readers must say so, or
two participants comparing notes will conclude the product's arithmetic is
broken — [say only what the record holds](../../_laws.md#say-only-what-the-record-holds)
applies to the definition of a number as much as to its value.
