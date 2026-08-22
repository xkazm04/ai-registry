---
layer: technique
type: technique
subject: production-work-prioritization
technique: urgency-ladder-for-what-next
status: forged
laws: [unmeasured-is-not-a-pass, one-authority-per-quantity]
shared_with: []
use_when: [an operator faces a screen of mixed statuses and asks what to touch first, two surfaces of the same tool give contradictory next-step advice, a project is too young to support a scored ranking]
---

# Urgency ladder for "what next?"

A fixed, ordered list of states, walked top down, returning the first state present and
the first item in that state. Deterministic, historyless, and correct on day one. It
answers *what do I touch first on this screen* — a different question, at a different
scale, from what a weighted score answers across a project.

## The canonical order, with each rung's justification

A rung without a written justification will be reordered by whoever finds the current
order inconvenient. This order holds for most production pipelines:

1. **Failed** — a gate ran and rejected. A failure blocks everything downstream of it, and
   the diagnosis already exists; fixing it is always the highest-value move because it is
   the only rung where the work is already specified.
2. **Disagreeing** — two authorities report different verdicts for the same thing. This
   outranks all actual work, because until it is reconciled *every other status on this
   entity is suspect*. A ladder with no rung for disagreement will confidently coach
   against a status it has no way to distrust — the most dangerous rung to omit, and the
   one most often missing.
3. **Pending** — produced, acceptance still resolving. Real work in flight.
4. **Deferred** — produced, waiting on an environment or a run that is not locally
   available. Below pending because it is not locally actionable; above never-produced
   because the work exists and only needs finishing.
5. **Never produced** — nothing has ever run here. **Last, on purpose.** Finishing started
   work beats starting new work, and this rung must never render as work-in-flight — it is
   the honest replacement for a lifecycle-fraction pseudo-progress number, and if it drifts
   upward the tool starts recommending greenfield over the half-finished pile.

## Procedure

1. **Hold the order as data in exactly one place** — an ordered list — and derive both the
   rank lookup and every surface's behaviour from it. Not as control flow, not as a switch
   statement per surface.
2. **Walk rungs in order; within the matched rung, break ties by pipeline position**, so
   the answer is stable across renders and identical for two users looking at the same
   screen.
3. **Attach to each rung an imperative verb and one plain sentence** saying why this
   surfaced — *fix*, *reconcile*, *produce*, *run the live test*, *start*. The verb is what
   makes the ladder usable by someone who has not read its design.
4. **Return nothing, explicitly, when no rung matches.** "Nothing actionable here" is a
   result, and a real one.
5. **Tolerate a missing input by emptying a rung, not by falling back to another ladder.**
   A surface with no comparison data simply has an empty disagreement rung; it must not
   silently switch to a different order.
6. **Make the glyph the primary signal, colour secondary.** A ladder read by colour alone
   is unreadable to a meaningful fraction of operators and unreadable in every screenshot
   that gets pasted into a document.

## Why one ladder, not one per surface

The failure this rule exists to prevent is specific and observed: two surfaces mounted
over the same entity ran two different orders, so the same entity was told to do two
different things depending on which panel you looked at. One order lacked the
disagreement rung entirely and therefore coached confidently against a status it could
not trust; the other ordered pending and never-produced differently, so the two panels
disagreed about whether to finish or to start.

Neither surface was wrong in isolation. That is the point: independently reasonable
ladders diverge, and the divergence is invisible from inside either one. One list, one
authority, every surface derived — then a change to the order changes every surface at
once and they cannot fork again.

## Ladder or score?

- **Build the ladder first, always.** It needs no evidence corpus, no weights, no
  calibration; it is correct the day it ships and delivers most of the operator-facing
  value.
- **Use the ladder for "next action here"** — one entity, one screen, one person about to
  click something.
- **Use a score for "where does the next week go"** — ranking many candidates across a
  project, where states alone cannot separate hundreds of items that are all simply
  *pending*.
- **Never merge them into one number.** A ladder position is ordinal and a score is
  cardinal; adding a rung index into a weighted sum produces a quantity with no meaningful
  unit, and it will be compared across projects by someone.

## When not to use this

- **When most items share one state.** A screen where everything is pending gets no
  ordering from a ladder; that is precisely the point at which a score earns its cost.
- **When the states are not genuinely ordered by urgency** — parallel independent
  workstreams with no shared pipeline. A ladder over unordered states invents an authority
  it does not have.
- **As a project-wide plan.** The ladder has no view of value, cost, or who is waiting.
  Reading a roadmap off it will schedule a trivial failing check ahead of the substrate
  four teams are stalled on.
