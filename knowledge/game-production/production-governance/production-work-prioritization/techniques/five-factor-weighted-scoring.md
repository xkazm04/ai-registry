---
layer: technique
type: technique
subject: production-work-prioritization
technique: five-factor-weighted-scoring
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity, unmeasured-is-not-a-pass]
shared_with: []
use_when: [ranking eligible production candidates across a whole project, replacing an opaque priority number with an arguable one, auditing why a backlog ranking keeps surfacing the wrong item]
---

# Five-factor weighted scoring

A composite rank built from a small, fixed set of named factors, each bounded by a
published weight, summing to a stated ceiling — and emitted together with its per-factor
breakdown so that the recommendation can be argued with on its factors rather than
dismissed as a black box.

Five is not sacred; the property that matters is that a practitioner can hold the whole
factor set in their head and say which one is responsible for a surprising rank. Below
three factors the score is a proxy for one thing and should say so. Above about seven,
nobody can attribute a result, and the score becomes an oracle.

## A workable factor set

For production candidates, this set covers the ground with little overlap:

| Factor | Asks | Typical share |
| --- | --- | --- |
| Urgency | Is other work waiting on this? | ~30% |
| Success odds | Has work like this landed before? | ~25% |
| Impact | How much does finishing it unblock? | ~20% |
| Recency | Did a recent review flag it? | ~15% |
| Readiness | Are its own prerequisites met? | ~10% |

The shares are a defensible starting point, not a derived truth, and the honest way to
present them is as a declared policy with a review date. Urgency and impact both read
fan-out and are therefore correlated by construction; that is acceptable — deliberately
double-weighting "other people are waiting" is a stated position — but it must be a stated
one, not an accident nobody noticed.

## Procedure

1. **Name the factors and write what each asks in one sentence.** A factor whose question
   you cannot write in a sentence will be computed inconsistently.
2. **Publish the weight table as a single exported constant** that both the engine and
   every surface rendering the breakdown read. A visualisation with its own copy of the
   segment maxima will disagree with the engine after the first weight change, and the
   disagreement renders as a bar that does not fill.
3. **Bound each factor at its weight.** Every contribution is clamped to its ceiling, so a
   candidate with extreme fan-out cannot swamp the other four factors. State the
   saturation point: a per-dependent step of six points against a thirty-point urgency
   ceiling means urgency is maxed at five dependents and cannot distinguish five from
   fifty. That is a design choice and it should be published as one.
4. **Score zero for absent evidence, never a midpoint.** An unmeasured factor contributes
   nothing and its segment is dropped from the display entirely, not rendered empty.
5. **Return the breakdown with the score**, in the same payload, along with the binding
   provenance it was computed over. Never let a consumer re-derive a factor.
6. **Attach a reason string built from the factors that actually fired**, most significant
   first, and label it when the underlying binding was heuristic.

## Decision rules

- **When a factor can only lower a score, implement it as a reduction, not a term.** An
  unmet sibling prerequisite zeroes readiness; it never adds. Mixing one-directional
  adjustments into additive terms makes the ceiling untrue.
- **When two factors read the same underlying quantity, compute it once and pass it to
  both.** Two independent derivations of fan-out will diverge on an edge case and the
  breakdown will be internally inconsistent.
- **When a candidate has no binding to any measurable evidence**, do not score urgency or
  impact at all, and say so in the reason. Do not substitute a neighbour's numbers.
- **When the ranking looks wrong, inspect the binding before touching the weights.**
  Weight-tuning to fix a stale or fuzzy binding is how a scoring engine acquires
  weights nobody can justify.
- **When you change a weight, date it and record why.** The score's basis moved; ranks
  before and after that date are not comparable, and someone will compare them.

## Calibrating weights honestly

You cannot derive the weights from first principles and should not pretend to. What you
can do is record every human override — the candidate, the rank it was given, the rank the
human acted on, and the stated reason. When the same factor is overridden in the same
direction repeatedly, that is evidence the weight is wrong, and it is the only trustworthy
evidence you will get. A dozen recorded overrides beats any amount of argument about what
urgency *ought* to be worth.

## When not to use this

- **On a project with no evidence corpus.** With no run history, no review findings and a
  thin dependency graph, three of five factors score zero and the composite is a
  relabelled fan-out count. Ship the deterministic state ladder instead and add the score
  when there is something to rank over.
- **For an operator's next action on one screen.** A ladder is deterministic, needs no
  history, and is the right instrument at that scale.
- **Where a hard constraint exists.** A contractual milestone is not a factor with a
  weight; it is a filter applied before scoring. Encoding a must-do as a large number of
  points means a sufficiently urgent pile of other work can outvote it.
