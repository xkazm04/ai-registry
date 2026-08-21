---
layer: technique
type: technique
subject: production-work-prioritization
technique: fan-out-max-not-sum
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity]
shared_with: []
use_when: [scoring how much downstream work a candidate unblocks, a hub item dominates every ranking, a candidate produces several outputs with overlapping dependents]
---

# Fan-out: max, not sum

When a candidate produces several outputs, and each output has its own set of downstream
dependents, the fan-out credited to the candidate is the **maximum** dependent count
across its outputs — not the sum.

This is small and consequential, and it is the rule most often got wrong by the obvious
implementation.

## Why summing is wrong

Two distinct mechanisms, and both bite.

**Shared dependents get counted once per path.** Outputs of the same candidate very often
have overlapping downstream sets — that is largely *why* they were grouped into one
candidate. If output A and output B are each depended on by the same three downstream
items, summing credits six unblocked items where three exist. The overcount is not a
rounding error; it scales with how cohesive the candidate is, so the *better factored*
your candidates are, the more the sum lies about them.

**Hub candidates dominate unconditionally.** A candidate that produces ten small outputs,
each with two dependents, sums to twenty and outranks a candidate producing one output on
which fifteen things are truly stalled. The sum is measuring *how many outputs the
candidate happens to bundle*, which is an artifact of how someone chose to draw the
candidate boundary, not a property of the project. Re-partitioning the same work into
different candidates changes the ranking, which is the signature of a broken metric.

Both mechanisms push in the same direction: sums inflate the biggest, most bundled nodes
and put them permanently at the top, where they are immune to evidence.

## What the maximum claims

The maximum is a deliberately conservative and clearly stated claim: *at least this many
downstream items are waiting on something this candidate produces.* It is a lower bound
on the unblocked set, it never overcounts a shared dependent, and it is invariant to how
the outputs were bundled — the same underlying work scores the same however it is
partitioned into candidates.

It also has an honest, sayable interpretation for the person reading the recommendation:
"as urgent as its most-depended-on output". When a candidate has more than one output, say
so in the reason string — *most-depended-on of the four outputs this item produces* — so
nobody reads the number as a total.

## Procedure

1. **Bind the candidate to its outputs** using the declared map; an explicitly empty
   binding means fan-out is zero, not unknown-and-guessed.
2. **Look up each output's dependent count from the single reverse index** derived from
   the dependency graph. Do not rescan the graph per candidate; fan-out is a static graph
   property and one authority owns it.
3. **Take the maximum**; with no outputs, the fan-out is zero.
4. **Gate on freshness before crediting it.** A candidate whose outputs are *all already
   complete* unblocks nothing, whatever the graph says — the dependents are no longer
   waiting on it. Credit fan-out only while at least one produced output is still
   outstanding. Skipping this check keeps finished hub work permanently at the top of the
   ranking, which is the most demoralising possible failure of the instrument.
5. **Feed the same single value to every factor that reads it**, rather than deriving it
   twice.

## When neither max nor sum is right

There is a real case the maximum under-serves: **genuinely independent downstream values**.
When a candidate's outputs feed disjoint downstream sets, and those sets are of comparable
size, the maximum discards most of the actual benefit — a candidate unblocking three
separate teams of four scores four, the same as one unblocking a single team of four.

Do not fix this by switching to the sum. Fix it in one of two ways, in this order of
preference:

- **Split the candidate.** Disjoint downstream sets are strong evidence that this is
  several pieces of work wearing one name. Splitting makes each piece rank on its own
  merits and removes the problem rather than papering over it.
- **If it genuinely cannot be split, count the union of the distinct downstream set.** The
  union is correct by construction — it never double-counts a shared dependent, and it
  degrades to the maximum when the sets fully overlap and to the sum when they are
  disjoint. It costs a set-union per candidate instead of a lookup, which is why the
  maximum is the right default at scale and the union is the considered upgrade.

Whichever you use, **say which one in the number's basis.** A fan-out of four means three
different things under max, union and sum, and a consumer that assumes the wrong one is
wrong silently.

## When not to use this

- **When the graph edges are weighted by real waiting cost**, use the weighted union;
  counting nodes assumes every dependent is equally valuable, which is a simplification
  and should be named as one.
- **When dependents are transitively reachable and you are counting only direct edges.**
  Direct-dependent counting is the honest default — transitive counting explodes and
  makes everything upstream look identical — but state that the number is direct-only, or
  someone will read it as total downstream impact.
