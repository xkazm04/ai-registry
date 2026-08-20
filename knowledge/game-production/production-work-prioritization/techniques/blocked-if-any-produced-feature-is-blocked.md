---
layer: technique
type: technique
subject: production-work-prioritization
technique: blocked-if-any-produced-feature-is-blocked
status: forged
laws: [unmeasured-is-not-a-pass, one-authority-per-quantity]
shared_with: []
use_when: [deciding whether a candidate is startable, propagating blocked state through a dependency graph, a candidate that produces several outputs has mixed blocker states]
---

# Blocked if any produced output is blocked

A candidate that produces several outputs is blocked when **any one** of them is blocked.
Readiness is a conjunction, not an average: the candidate is not startable until every
output it owns can actually be built.

The tempting alternative — score readiness as the fraction of outputs that are unblocked —
is wrong for a reason worth stating precisely. Partial readiness is not a real production
state. Nobody works four-fifths of a candidate; they start it, hit the blocked output,
and either stall or split the candidate. A fractional readiness score smooths that cliff
into a gentle slope and puts stalled work into the top ten whenever its other factors are
strong, which is exactly when it is most tempting and most wasteful.

## The three states, and why there are three

Readiness has three distinguishable answers and collapsing any pair loses information a
reader needs.

- **Blocked** — at least one produced output has an unmet dependency. Readiness is zero
  and the blocker is named. Naming it is not decoration: the blocker's name is what turns
  a rejected candidate into a *different* candidate someone can pick up.
- **Ready** — every produced output's dependencies are satisfied. Full readiness.
- **Unknown** — the candidate has outputs but nothing in the graph knows anything about
  their dependencies. This is *not* ready and *not* blocked; it is unmeasured, and it must
  score a reduced, clearly-labelled value rather than a confident full mark.

Give the unknown state a partial score rather than either extreme, and label it. Scoring
it as ready lets a whole undeclared region of the project float to the top on a
technicality — the most common way this instrument gets discredited in its first month.
Scoring it as blocked hides work that is very likely fine and makes an incomplete graph
look like a stalled project.

A fourth case sits alongside: the candidate has **no outputs at all** because the binding
is explicitly empty. Nothing can evidence it, so nothing can block it either. Score a
neutral, labelled readiness and — critically — no urgency and no impact, because a
candidate that produces nothing measurable unblocks nothing measurable.

## Procedure

1. **Resolve the candidate to its produced outputs** through the declared binding.
2. **Look up each output's blocker state from the one dependency authority.** Do not
   recompute per candidate; two computations of blocked-ness disagree at the edges.
3. **If no output has any dependency information, report unknown** with the reduced score
   and the label.
4. **If any output is blocked, readiness is zero.** Collect the blocking names across all
   outputs, deduplicate them, and quote the first two or three in the reason. Reporting
   every blocker is unreadable; reporting none is useless.
5. **Otherwise readiness is full**, with an explicit "all dependencies satisfied" reason —
   a positive statement, because silence is not evidence of readiness.
6. **Apply local prerequisites as a reduction afterwards.** Unmet sibling prerequisites
   inside the same area zero readiness however clean the output graph looks. Implement
   this so it can only ever lower the value, never raise it.

## Decision rules

- **When a candidate is blocked, exclude it from the recommendation list rather than
  ranking it low.** A named exclusion with a blocker is more useful than rank forty-one,
  and it prevents strong urgency from floating stalled work upward.
- **When a blocker is itself blocked, report the immediate blocker, not the root.** The
  operator's next click is the immediate one; walking to the root is a separate view and
  should be offered, not forced.
- **When blocked-ness and completion disagree** — an output is marked complete but its
  dependency is not — treat it as a defect in the corpus and surface it. It usually means
  something was marked done by a path that did not check.
- **When the blocker set is empty but the state says blocked**, fail loudly. A blocked
  state with no nameable cause is a bug in the propagation, and it will otherwise present
  as a candidate that can never be started for no stated reason.

## When not to use this

- **Where "blocked" is soft** — waiting on a review, waiting on an asset that will arrive
  Thursday. Conjunctive hard-blocking makes routine latency look like a wall. Model those
  as their own state with their own rung, not as unmet dependencies.
- **Where candidates are deliberately coarse** and blocking one output is expected and
  routine. Then the right fix is to split the candidate along the blocked seam, so that
  the unblocked majority stays startable — not to weaken the rule.
