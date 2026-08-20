---
layer: technique
type: technique
subject: breach-alerting-and-attribution
technique: scope-inverted-attribution
status: forged
laws: [never-present-absence-as-an-answer]
shared_with: []
use_when: [a scoped cap's alert just names the scope back, choosing the attribution axis for a limit rule, a scoped breach shows an empty contributor list]
---

# Scope-inverted attribution

Attribution answers "what drove the spend" by grouping the breached window
along some axis. For an unscoped, project-wide cap the natural axis is the
model (optionally annotated with workload). But apply that same grouping to a
*scoped* cap and the answer collapses into a tautology: a cap on one model,
attributed by model, reports "100%: the model you capped." The operator wrote
that rule; being told its scope back is zero bits of information. The
technique is a single rule with a memorable shape:

> **Attribute along the free axis, never the pinned one.** Whatever dimension
> the scope fixes, the breakdown must vary a *different* dimension inside it.

## The inversion table

Spend in this domain lives on a small set of crossed axes — provider, model,
workload (use-case), and identity (key, customer). A scope pins one of them;
attribution walks the most diagnostic of the remaining:

- **Model cap** → break down by the **workloads** driving that model. The
  operator capped the expensive model; the actionable fact is *which feature*
  is spending it, because features can be rerouted to cheaper models.
- **Workload cap** → break down by the **models** serving that workload. The
  workload's budget blew; the lever is which model it runs on.
- **Provider cap** → break down by that provider's **models**. A provider-wide
  budget is usually about a contract or a rate agreement; the fix is per-model
  migration, so name the models.
- **Identity cap (key, customer)** → no inversion into a broadcast alert; that
  axis crosses a confidentiality boundary and is governed by its own refusal
  technique.

The table is not arbitrary; each row picks, from the free axes, the one whose
values the operator can *act on unilaterally*. When extending to new scope
types, apply the same test: which remaining axis, enumerated, hands the
operator a lever rather than a fact?

## Within-scope arithmetic

Inversion changes the denominator, and getting it wrong quietly corrupts every
share figure. For a scoped rule, filter the rollup rows to the scope *first*,
then compute shares against the **within-scope total** — not the project
total. A workload consuming 70% of its capped model's spend but 4% of the
project should read as 70% in a model-cap alert; the project-relative figure
answers a question nobody asked here. Rank, top-k, and zero-dropping then work
identically to the unscoped case, on the filtered rows.

Carry a **scope note** in the payload: a short clause stating which scope the
contributors were computed within. Without it, a receiver aggregating alerts
from many rules cannot tell a project-wide "top spender: summarization" from a
within-one-model "top spender: summarization" — same label, different
denominators, different meanings. The note makes the denominator explicit.

## The empty scope speaks

A scoped window can hold no attributable spend at all — the breach was driven
by unpriced events, or by traffic the rollup's grouping cannot see. The
unscoped case may omit its attribution section in this situation, but the
scoped case must not: an operator reading a scoped breach with a silently
missing breakdown will assume the attribution system failed. Emit the
contributor list empty *and* the scope note saying "no attributable spend in
this window, within this scope." Stated absence is diagnostic — it tells the
operator the money burned somewhere the priced rollups cannot see, which
redirects the investigation toward pricing coverage rather than toward the
listed contributors.

## When not to use this

Inversion presumes the scope pins exactly one axis. A rule scoped on a
*conjunction* (this model AND this workload) has two pinned axes and often no
free axis worth enumerating — attribute nothing rather than something
degenerate, and let the scope note carry the rule's identity. And do not
invert into an axis whose enumeration the receiving channel is not cleared
for: the free-axis rule is subordinate to the identity-refusal boundary,
always.
