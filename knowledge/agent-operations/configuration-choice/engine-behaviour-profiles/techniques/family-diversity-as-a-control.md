---
layer: technique
type: technique
subject: engine-behaviour-profiles
technique: family-diversity-as-a-control
status: draft
laws: [the-judge-never-grades-its-own-family, measure-the-tree-not-the-summary]
shared_with: []
use_when: [deciding whether to run a second vendor family at all, choosing a fallback family, separating an instruction defect from a capability gap, planning a fleet's engine mix]
---

# Family diversity as a control

The concern: running one vendor family is cheaper to operate and produces a fleet that
cannot see its own blind spots. A second family is usually justified as capacity insurance
— somewhere to go when a seat is exhausted. Its larger value is **epistemic**: it is the
control group that tells you whether a failure belongs to your instruction or to the
model, and it is the only thing that makes a judge's verdict trustworthy.

## What the control buys

- **Attribution.** A failure reproduced identically by two unrelated families is a defect
  in the instruction, the task or the environment. The same failure in one family only is
  a capability or disposition difference. Without the second family, every failure is
  ambiguous and the cheapest explanation — "the model is not good enough" — wins by
  default, because nothing contradicts it.
- **Judging integrity.** A verdict produced by a judge of the same family as the agent
  carries a constant bias toward its own style. A second family on the judging side is
  what makes a score defensible; when only one family is available, the verdicts are
  labelled single-family and provisional rather than mixed into the record.
- **Blind-spot exposure.** Dispositions that look like "how agents behave" turn out to be
  "how this family behaves" the moment another family does the opposite on the identical
  case. Every such contrast converts folklore into a routing rule.
- **Continuity.** Capacity insurance remains real: seats exhaust, providers hit capacity,
  and a fleet with a qualified second family degrades instead of stopping.

## The procedure

1. **Qualify the second family on the same grid**, not on a smoke test. A fallback that has
   never cleared the mechanical bar on your tasks is a hope.
2. **Run the families under identical conditions** — same instruction, same isolation, same
   ceilings, same environment restrictions. Where one runner loads the operator's personal
   configuration and the other does not, the comparison is measuring the configuration.
3. **Keep at least one cheap cell per family** in every recurring measurement, so the
   control persists after the initial comparison. A control that is only run once stops
   being a control the next time the instruction changes.
4. **Pair judging across families by construction**, and record which judges produced each
   verdict, so a later re-judge can be compared against the earlier one.

## Decision rules

- **Prefer a fallback that fails differently over one that scores similarly.** Two families
  with the same disposition give you capacity and no information.
- **Never compare families across a change to the harness.** If the measurement changed
  between the two families' runs, re-run the earlier family or say plainly that the
  comparison is provisional; a harness fix that lands mid-grid is a confound, not a detail.
- **When only one family is reachable, say what is unavailable** — attribution and
  unbiased judging — rather than proceeding as if the control were present.
