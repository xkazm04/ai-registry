---
layer: technique
type: technique
subject: data-video-virality
technique: series-repeatability
status: draft
laws: [cost-per-usable-output]
shared_with: []
use_when: [ranking ideas that score similarly, planning a content calendar, choosing which visual component to build first]
---

# Series repeatability

An idea that is one instance of a repeatable template (every continent's
map, every sport's record ladder, every rivalry's head-to-head) is worth
more than its own score. Each later episode reuses the visual component,
the data pipeline and the audience the first episode found.

## Procedure

1. For each passing idea, name the template it belongs to and list three
   or more further instances that use the same data shape.
2. Give a small bonus for repeatability. Keep it small, so it breaks ties
   and doesn't carry weak ideas.
3. When choosing what to build, prefer the template whose first instance
   has the strongest precedent and whose later instances are already in
   the backlog.

## Decision rules

- Build order follows the template, not the single top-scoring idea: one
  reusable component that serves twenty passing ideas beats a bespoke one
  for the top idea.
- A series doesn't excuse a weak episode. Every instance still passes the
  precedent gate on its own.

## When not to use it

- Event-driven one-offs (a record just broken) where timing is the whole
  value. Score them on timeliness instead.
