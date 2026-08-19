---
layer: technique
type: technique
subject: conflict-of-interest-detection
technique: temporal-alignment-of-money-and-role
status: forged
laws: [deterministic-code-owns-numbers, missing-is-not-zero]
shared_with: []
use_when:
  - testing whether a decision or payment falls inside an official's role period
  - weighting a money total by overlap with a mandate window
  - a tie lacks registered role dates and a join needs a period
---

# Temporal alignment of money and role

A conflict of interest is a *simultaneity* claim: the private interest and
the public power existed at the same time. Money that reached an entity
years before the official joined it, or a vote cast after they left, is a
biographical footnote, not a conflict. Temporal alignment is the technique
of making that simultaneity a computed, declared, boundary-tested property
— used both as a hard gate (does this decision fall inside the role window
at all?) and as a graded weight (how much of this money landed inside it?).

## The role window is registered, not assumed

The window comes from the corroborating register's validity dates for the
role — not from election terms, not from a declaration's vague "since
around", not from the first date the tie was observed. This anchoring is
what makes the alignment defensible: the same authority that confirms the
tie also dates it, and the two facts publish together.

The rules of the window are declared once and tested at their edges:

- **Boundaries are inclusive on both ends.** A decision on the day the role
  was registered, or the day it was removed, counts as inside. This is a
  convention, not a truth — the honest move is to pick it, state it in the
  published method, and cover both boundary days with tests, because
  off-by-one at a boundary is exactly the kind of error that surfaces in a
  dispute with a named person on the other side.
- **An open end is open, not infinite history.** A role with no end date
  extends to the present; it says nothing about the past before its start.
- **Compare at day precision, uniformly.** Timestamps from decision records
  and date-only values from registers must be truncated to a common
  precision before comparison, in one shared helper — two call sites
  truncating differently is a drift that flips boundary cases, which is why
  the window test lives in exactly one imported function, per
  [deterministic-code-owns-numbers](../../_laws.md#deterministic-code-owns-numbers):
  the alignment verdict is a number-grade fact, and code owns it.

## Missing dates fail the gate — and are counted, never invented

A confirmed tie without a registered period start cannot be aligned, and
the resolution is asymmetric by design: for *accusatory* joins the tie is
excluded (no window, no candidate — an invented window would manufacture or
suppress overlap invisibly), and for *coverage* reporting the exclusion is
counted and shown. Per [missing-is-not-zero](../../_laws.md#missing-is-not-zero),
"we could not test alignment" is a different fact from "alignment failed",
and both are different from "aligned" — a pipeline that lets undated ties
silently vanish reports a cleaner world than it measured, while one that
defaults them to "always aligned" defames. The count of confirmed-but-
undated ties is itself a standing work item: each is one register lookup
away from entering the join.

## Alignment as weight, not only as gate

For money flows, alignment is graded. Given a tie's role window and a set
of dated payments or contracts, compute the **aligned amount** — the sum of
money whose dates fall inside the window — alongside the raw total, and
derive the **aligned fraction** (aligned over total). Both belong in the
significance score, and they do different work:

- The aligned *amount* (log-scaled, like all money in ranking) says how
  much simultaneous money there is.
- The aligned *fraction* distinguishes an entity whose public revenue
  coincides almost entirely with the official's tenure — a pattern worth a
  reviewer's attention — from a long-established supplier the official
  briefly joined. A high fraction on modest money can be a better lead than
  a low fraction on large money.

Undated payments join the missing-data ledger: they contribute to the raw
total, never to the aligned amount, and their count is disclosed so the
aligned fraction is read as a floor.

## Decision rules

- When a decision's date falls outside the role window, the pair produces
  no candidate — no "near miss" bucket in accusatory output. Near-window
  patterns (money arriving immediately after the role ends, a role starting
  just after a key vote) are real investigative shapes, but they are
  *different hypotheses* with different framings; model them as their own
  declared patterns or not at all, never as relaxed alignment.
- When role periods from two sources disagree, prefer the register's and
  surface the disagreement; never merge windows into a union, which is an
  invented, wider window.
- When a person holds multiple roles at the same entity with different
  windows, test alignment per role and attribute the candidate to the
  specific role that aligned.

## When not to use it

Alignment gates conflict *candidates*; it does not gate the underlying
money attribution. An official's total reachable money is a fact about
their ties regardless of vote timing, and reporting it does not require
window overlap — collapsing the two lets "the money predates the mandate"
argue away a figure that never claimed simultaneity. Keep the aligned and
raw figures side by side, each labeled with what it claims.
