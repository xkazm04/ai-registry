---
layer: technique
type: technique
subject: remediation-handoff
technique: batch-shaping-for-one-session
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when:
  - deciding how many findings to hand to one autonomous session
  - a weakness appears across most of the estate at once
---

# Batch shaping for one session

A batch is not a sprint and not a ticket. It is **the set of findings one
autonomous session can plausibly finish in one working tree**, and shaping it
is the first decision of the handoff, because every later decision inherits
it. Too small and the operator repeats the ceremony for trivial gain. Too
large and the agent runs out of budget mid-batch, leaving a partial state
nobody can interpret from outside: some items fixed, some marked, some
touched and abandoned, and no way to tell which is which except by reading a
diff you cannot see.

## The sizing rule

Size the batch to a session, not to a quarter and not to an item. In
practice, for findings drawn from a repository-level assessment, that is
**roughly five to fifteen items in a single codebase**, and the ceiling is
lower when the items are exploratory rather than mechanical. The bound worth
enforcing in code is a hard maximum on identifiers per handoff — a few dozen
— because it is the difference between a stale multi-select and a request
that ties up the write path.

Three properties, in priority order, decide whether a set of items is one
batch:

1. **One codebase.** This is not a preference; it is a structural fact of how
   the executing agent works. One working tree, one set of conventions, one
   branch. A selection spanning several codebases is several batches, and
   the artifact must at minimum partition itself by codebase and instruct
   the agent to work one at a time.
2. **One coherent theme, where possible.** Items in the same category tend to
   share a fix — a missing check, an absent document class, an untested
   surface. Batching them lets one change close several, and the marker
   grammar must therefore allow several identifiers on one commit.
3. **Descending value.** Within the artifact, codebases are ordered by the
   total projected value of their items and items by impact then cost, so
   that a session which runs out of budget runs out at the bottom, where it
   costs least. This is the only defence you have against partial completion,
   because you cannot intervene once the session starts.

## Value numbers must carry their predicate

Batch shaping is usually driven by a projected value per item — points on a
score, risk reduced, a rank position. That number travels: into the
selection summary, into the artifact's heading, into whatever the operator
tells their manager. So it must carry what it measures and how
([count-carries-predicate](../../_laws.md#count-carries-predicate)). "+14"
means nothing; "up to +14 on the assessed maturity score if all of these
close, as projected by the same model that scored the codebase" is a claim
that survives being quoted. Where a projection is unknown for an item, show
it as unknown rather than as zero — zero is a measurement, absent is not.

## The fleet-wide gap: one practice, not N tickets

The most valuable shaping decision has nothing to do with counting. When the
same category is weak in **half or more** of the codebases you assess, the
finding is not N repository problems that happen to rhyme. It is one
organizational problem with N applications, and the correct response is to
decide the practice once — usually by copying whichever codebase already does
it well — and then apply it, rather than to open N near-identical items and
hand off N near-identical artifacts.

Make this computable and put it on the row. For each category, count the
distinct codebases with an *active* finding in it, over the total number of
codebases in the ledger; flag the category as estate-wide at a threshold
(half is a defensible default, with a minimum denominator so that one
codebase out of two does not qualify). Then let the operator filter to
estate-wide categories. That single flag changes what a batch *is*: instead
of "the top ten items", the batch becomes "this category, everywhere",
handed off as a practice decision with per-codebase applications underneath.

## Decision rules

- **When the selection spans codebases, split by codebase and order by total
  value**, because the agent's unit of work is a working tree.
- **When a category is active in half or more of the estate, shape the batch
  as one practice**, not as per-codebase items, and name the codebase that
  already does it well as the reference.
- **When items in a batch share a fix, keep them together** and rely on
  multi-identifier markers rather than forcing artificial commit splits.
- **When the batch would exceed the hard identifier cap, refuse the request**
  rather than silently truncating; a truncated batch produces an artifact
  that disagrees with the claim you recorded.
- **When an item's projected value is unknown, sort it last and label it
  unknown** — never impute zero and never impute the median.

## When not to use this

- **A single urgent finding.** One item with an obvious fix does not need a
  batch, an artifact, or a marker; it needs someone to fix it. The ceremony
  is justified by the ratio of packaging cost to work, and at one item that
  ratio is bad.
- **Work that requires a design decision.** If the batch's items cannot be
  resolved without someone choosing between architectures, batching them for
  an autonomous session produces a plausible choice made by something with
  no standing to make it. Route those to a human decision first.
- **Findings whose fix spans codebases atomically** — a contract change that
  must land in producer and consumer together. That is a coordination
  problem, and the one-codebase rule that makes this technique work is
  exactly what it violates.
