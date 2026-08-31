---
layer: technique
type: technique
subject: agent-memory
technique: probe-without-write-back
status: forged
laws: [gate-sees-target, absent-guard-is-loud, unknown-is-not-a-value, count-carries-predicate]
shared_with: []
use_when: [running a scheduled recall health check, a memory eval scores better every month for no reason, deciding which callers of recall count as usage, the usage counter rises but recall never improves, auditing which code path increments a usage column]
---

# Probe without write-back

Two rules this corpus already holds meet in a place neither of them anticipates,
and the collision is silent.

The first: an evaluation must exercise the production path, not a replica of it
([gate-sees-target](../../../../_laws.md#gate-sees-target)) — a reimplemented
retriever scores the reimplementation, and it passes precisely when it has
drifted from the shipped code. The second:
[memory-value-model](./memory-value-model.md) ranks items partly on how often
they were retrieved, which means rank causes delivery and delivery feeds rank, a
loop the value model bounds so it terminates.

Put them together and the consequence is this: **a memory system's read path is
not read-only.** Recall writes — it increments the counter that feeds the score
that decides the next recall. So every automated client of the production read
path is a writer to the ranking state, and an evaluation obeying the first rule
is, by construction, pumping the loop described by the second.

## Why a probe is the worst possible client

A scheduled recall probe is not a random sample of traffic. It is the opposite
of one, in every property that matters here:

- It runs **forever, on a fixed cadence**, so its contribution accrues without
  bound in time.
- It replays a **fixed query set**, so it does not spread its writes across the
  store — it lands them on the same narrow neighbourhood every run.
- The items it lands on are its **expected answers**: the golden set's ground
  truth. It is inflating precisely the items it will later check for presence.

The value model's bound stops the loop running away; it does not stop this. The
probe's targets climb toward the bound and stay pinned there while the rest of
the store decays past them, so the ranking gap between "the items the probe
expects" and "everything else" widens on the probe's schedule. Hit rate rises.
Nothing about the store improved — a fraction of the corpus was placed on a
retention drip by its own instrument, and the number that was supposed to detect
recall decay now moves in the opposite direction as decay sets in.

The failure never announces itself, because every component is behaving as
designed: recall counts a retrieval, the value model rewards retrievals, the
probe measures rank. It is visible only by asking who the callers are.

## The fix keeps the production path and suppresses its feedback

The answer is not to stop using the real retriever — that surrenders
`gate-sees-target` to solve a problem that does not require it. It is to make
the read path's write-back an explicit parameter of the read path, and have the
probe pass it off:

- **A parameter, not a copy.** A flag on the production entry point that skips
  the activation write is still the production path: same fusion, same floors,
  same filters, same budget cut. A parallel "eval mode" retriever is a replica
  wearing the production path's name, and it will drift.
- **Documented at the call site, not just at the definition.** The suppression
  is the kind of thing a later reader deletes as dead configuration, because its
  purpose is invisible from the flag alone. The comment that has to exist says
  what breaks if it is removed: the instrument entrenches its own fixtures.

## Enumerate the read path's callers, and decide which reads are evidence

The probe is the sharpest instance of a general defect, and fixing only the
probe leaves the class open. The read path in a mature memory system has
several non-human callers, and the usage counter cannot tell any of them apart
from a person asking a question:

- a **health probe** replaying a golden set;
- a **cache or index warmer** touching items to keep them hot;
- **background passes** that embed a new item and search for its neighbours to
  create links — one of these can touch a large fraction of the store per cycle;
- **the compaction pass itself**, which reads candidate families before merging
  them.

So the write-back decision is not a probe feature; it is a property that belongs
on every caller, and the question it answers is:
[count-carries-predicate](../../../../_laws.md#count-carries-predicate) applied to
the usage term — *what does this counter claim to count?* If it claims "an
occasion where this memory was put in front of a consumer", then a read the
system initiated on its own behalf is not one, and counting it is the same error
as counting a delivery as a proven usefulness. Default new machine callers to
suppressed, and let a caller argue its way into counting.

## Which default the structure hands you

There are two ways to keep machine reads out of the counter, and they are not
equivalent — they differ in what a *new* caller does before anyone thinks about
it.

- **One entry point with a suppression parameter.** The read path counts by
  default and each machine caller opts out. This is the smaller change and it
  keeps a single retriever, but the default is wrong: every reader added later
  counts until someone remembers it should not, and the number of call sites
  that must each carry a correct flag grows with the system.
- **One uncounted read path plus a separate, explicit write.** Reading never
  counts; recording a use is its own call that a caller must deliberately make.
  The default is now right by construction — a new prefetcher, warmer or probe
  is silently correct — and the counter's meaning is pinned to one call site
  that can be read in full.

The second is the stronger shape wherever it is reachable, and the reason is
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud): a guard that
each caller must remember to attach is a guard the fleet converges on not
having. Prefer it when the read path has more machine callers than human ones —
which is the normal condition, since prefetchers, refetches and background
passes all multiply against a single human read.

The trade is that the explicit write must then be placed correctly exactly once,
and a miss there is now an under-count rather than an over-count. That is the
better failure: an under-counted item is ranked conservatively, while an
over-counted one is ranked by its own machinery.

## The under-count that is not conservative

The trade above is priced on the assumption that a misplaced explicit write
*lowers* a count. There is a placement that inverts it instead, and it is the
one the structure of most stores makes easiest to reach.

Ask what actually writes the usage term. In a store whose entry point is a
get-or-create helper — find the row by key, insert it if absent, hand it back —
that helper is the cheapest possible home for "touch the counters." It has
already loaded the row, it is already going to save, and every writer in the
system already calls it. So the increment gets attached there, and it is real,
monotonic, and entirely plausible-looking. What it counts is a **write**.

Meanwhile the path that actually packs items into a context is a bulk read. It
returns a result set the caller iterates, and incrementing there costs an extra
write per item on the hot path against a counter nobody is watching. It does
not get done. The delivery boundary — the only event the term claims to measure
— writes nothing at all.

The consequence is not a conservatively ranked store. The usage axis exists in
[memory-value-model](./memory-value-model.md) to repair the failure of ordering
by last edit, where a typo fix outranks a load-bearing procedure. A usage term
fed by the write path *is* an edit count. The repair and the defect have become
the same field, and the value model goes on composing trust and decay over it
correctly, which is what makes the result look sound to anyone reading the
scoring function.

**Absence is visible; misplacement is not.** A usage term nobody writes reads
as a column of zeros, and a column of zeros is noticed the first time anyone
sorts by it. A usage term written by the wrong path produces a spread of
plausible integers, correlated with nothing anybody will check, and every
component touching it behaves exactly as designed.

So the enumeration this technique runs over the read path has a mandatory
counterpart on the other side: **enumerate the counter's writers, and confirm
the delivery boundary is one of them.** The two audits do not substitute for
each other. The reader-side question — which of these callers should count —
presupposes that counting happens at the read path at all, and cannot discover
that it happens somewhere else entirely. Only the writer-side enumeration
answers [count-carries-predicate](../../../../_laws.md#count-carries-predicate)
for this term: at each site that increments, which event is being claimed?

Two cheap tests, neither of which requires reading every site:

- **Compare before you read.** If the term is a write counter it is a function
  of revision count and last-edit recency. Check it against both. A usage term
  that tracks how often an item was *edited* is not a usage term, and the check
  is one query.
- **Look for the item that was never edited.** An item unchanged since creation
  with a non-zero count is positive evidence that the delivery path does write.
  A store where every non-zero count belongs to an edited item has answered the
  question without anyone opening the scoring code.

One refinement keeps the audit from producing false positives, and it is the
first thing a real enumeration hits: **the boundary is where material reaches
the consumer, not where it was read.** A site that selects items and hands them
to a later stage — a prepared-prompt cache, a queued dispatch, a rendered blob
consumed on a subsequent turn — has not delivered anything yet, and the run it
was prepared for may never happen. Counting there inflates; counting again at
the consumer double-counts. Trace the selection forward to the point of no
return and put the single write there. An audit that flags every read site
lacking an increment will condemn the correct deferral along with the real
omission, and the "fix" it prompts is the over-count this technique opened by
warning about.

The rule being checked is short: **the delivery boundary is the term's primary
writer, the increment lands on the selected set after packing, and every other
writer argues its way in.** Omission there does not merely lose a statistic. The
age anchor and the usage bonus both hang off that write, so an item the consumer
relies on every run ages as though it had never been read — the store starves
its own decay model of the one signal that was supposed to rescue the items
worth keeping.

## An enumeration in prose decays; put it where drift fails loudly

The writer-side audit produces a claim of the form *this is the only writer, and
its only caller is the delivery path*. The claim is true when written and is
exactly the kind that rots: a second delivery surface appears, an unattended
dispatch grows its own injection point, and each addition is individually
correct while the stated enumeration quietly becomes false.

A contract naming its callers in prose therefore carries a maintenance
obligation nobody has been assigned. Where the claim is load-bearing — and here
it is, because the audit above is only as good as its inventory — **the
enumeration belongs somewhere that fails when it drifts**: a test asserting the
writer set, a check over the column's call sites, an allow-list something reads.
The prose then argues the rule and the check owns the list.

The failure this prevents is not the drift. Three correct callers where the
comment claims one is harmless on the day it happens, and stays harmless for as
long as every caller is a genuine delivery. It is that the next reader runs the
writer-side audit *against the comment* rather than against the code, finds the
one caller it names, concludes the term is sound, and moves on — which is
precisely the audit the section above exists to make somebody run.

## The fixture set must not feed on itself either

The same loop closes one level up. A golden set is usually seeded from observed
queries, and once seeded it is topped up the same way — which means the second
seeding run sees the queries the first run's cases have been generating ever
since. Within a few cycles the set is measuring its own history.

Seeding therefore excludes any query already represented in the set, and the
exclusion is on the *query*, not on which subsystem emitted it: a source tag is
a label the probe itself can wear, and filtering on it lets the probe's traffic
back in under a different name. Where the fixtures reference real recalled items
they are install-local data, not repository content — a committed template
carries the schema, the cases live beside the store they describe.

## An un-baselined probe is not a healthy probe

The measurement compares a run against a trailing baseline of prior runs, so on
a fresh install — or after any change that invalidates history — there is no
baseline and no drift verdict is available. The tempting default is to report
healthy until enough history accrues, and it is the collapse
[three-state-outcomes](../../../../operations/service-operations/health-checks/techniques/three-state-outcomes.md)
exists to name: *unverifiable rendered as verified*. A store whose recall is
already broken on the day the probe is installed reports green for its entire
observation window, and green is what an operator acts on.

The honest reading is that the drift verdict is unavailable, rendered as its own
state, with the reason attached: observing, *n* of *m* runs collected. The same
applies to a fixture set too small to support a rate and to any run where the
retriever raised — a measurement failure is a fact about the instrument and must
never be scored as a miss, because a provider outage would otherwise publish
itself as recall degradation and the false record outlives the outage.

## What the probe cannot tell you

Its verdict is a *relative* one: recall today versus recall on this same set
recently. It says nothing about whether the set was ever adequate, and it cannot
see a regression that arrived before the baseline it is compared against — a
store that has been degrading since installation reads flat and healthy forever.
Absolute quality is
[retrieval-evaluation](../../retrieval/techniques/retrieval-evaluation.md)'s job,
against a held-out labeled set with a stated predicate; the probe's job is to
notice a change, cheaply, every day. Running the second and reporting it as the
first is how a store acquires a green dashboard and no idea what it holds.
