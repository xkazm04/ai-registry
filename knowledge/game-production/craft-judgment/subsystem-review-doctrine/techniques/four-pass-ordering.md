---
layer: technique
type: technique
subject: subsystem-review-doctrine
technique: four-pass-ordering
status: forged
laws: [structural-proof-is-never-sufficient, no-gate-self-certifies]
shared_with: []
use_when: [designing a review procedure, a review produced confident findings on code nobody confirmed, deciding what a pass may conclude]
---

# Four-pass ordering

## The rule the passes are an instance of

**Entitlement:** a review pass may conclude only what earlier passes confirmed. Every pass
has premises; a pass whose premises were never established does not produce weak findings, it
produces non-findings that are indistinguishable in form from real ones.

Teach the rule first, because the specific passes are one instantiation of it and a team on a
different problem will need a different instantiation. What does not change is the obligation
to be able to answer, for any finding: *which earlier pass confirmed the premise this rests
on?* If the answer is "none", the finding is speculation dressed as analysis, and its fluency
is a liability rather than evidence.

The ordering is therefore not about convenience, cost, or batching similar work. Cheap checks
sometimes run late and expensive ones early, because the dependency graph of premises — not
the cost graph — sets the order.

## The four passes

1. **Ground truth.** Confirm the entities exist, with the members the review will discuss and
   one observable runtime behaviour each. Premises: none. Entitled to conclude: this exists,
   this does not exist, this could not be confirmed. Refusal branch attached — see
   `ground-truth-pass-before-proposals`.
2. **Structure.** Organisation, ownership, layering, inheritance, module boundaries. Premises:
   the entities are real. Entitled to conclude: the wrong class owns this, this responsibility
   is duplicated, this base is concrete where it should be abstract, this dependency points
   the wrong way. *Not* entitled to conclude anything about behaviour or cost.
3. **Quality.** Correctness, convention, anti-patterns, edge cases, platform idiom. Premises:
   the entities are real *and* the arrangement is understood — because "this is wrong here" is
   a claim about a place, and the place came from the structural pass. Entitled to conclude:
   this is incorrect, this misses a case, this violates a rule the platform enforces.
4. **Performance.** Frame-path cost, allocation, pooling, synchronous loading, update
   frequency, scale behaviour. Premises: all three earlier passes. This pass is last because
   it has the most premises, not because it matters least — a cost claim needs the call site
   (ground truth), the ownership that says how often it runs (structure), and the correctness
   read that says whether the work is even necessary (quality).

An optional fifth pass — an end-to-end trace — attaches where a subsystem's defects live in
its seams; it is a separate technique because its premises and its output shape differ from
all four.

## Why the order cannot be inverted for convenience

Running performance first is the most tempting inversion, because profiler output arrives
without reading anything and looks like ground truth. It is not: a hot path with no
structural read behind it produces recommendations to cache values that were never stable, to
pool objects with lifecycles nobody checked, and to move work off the frame path that has to
be there. The finding is measured and still wrong, which is the most expensive kind — a
measurement lends it credibility the reasoning has not earned.

The reverse inversion, running quality before structure, produces the subtler failure:
convention findings about code that is in the wrong place entirely. Every one of them is
technically correct and all of them evaporate when the structural finding is fixed, so the
team burns a day fixing things that were about to be deleted.

## Decision rules

- **When a pass's premises were not confirmed, the pass does not run.** It reports "not run,
  blocked on <premise>". It does not run at reduced confidence. Not-run and clean are
  different states and must be different values in the report.
- **When a later pass discovers that an earlier pass's conclusion was wrong, stop and re-run
  from there.** Carrying forward a falsified premise contaminates everything downstream, and
  the contamination is invisible in the output.
- **When you add a pass, place it by its premises, not by its topic.** Ask what it must be
  true for its findings to mean anything, and put it after whatever establishes that.
- **When a finding cannot name the pass that grounded it, it does not ship.** This is the
  operational form of the entitlement rule and the only one that survives contact with a
  large finding list.
- **When passes disagree** — structure says a component owns a quantity, quality says another
  component writes it — the disagreement is a finding in its own right, usually a severe one,
  and never something to average away.

## When not to use it

- **Not for a one-line diff review.** Four passes over a three-line change is ceremony; the
  entitlement rule still applies but collapses to a single question about the change's
  immediate context.
- **Not when the four topics do not carve your problem.** A content or data review needs
  passes shaped by its own premise graph — perhaps existence, then internal consistency, then
  cross-artifact consistency, then craft. Instantiate the rule; do not import the labels.
- **Not as a schedule.** The passes are an entitlement order, not four calendar slots. Running
  them in one sitting is normal; running them out of order because a sprint boundary fell in
  the middle is the failure.
