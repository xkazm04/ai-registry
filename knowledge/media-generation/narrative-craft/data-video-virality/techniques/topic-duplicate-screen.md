---
layer: technique
type: technique
subject: data-video-virality
technique: topic-duplicate-screen
status: draft
laws: [output-never-outruns-evidence]
shared_with: []
use_when: [generating ideas in batches against an existing backlog, reporting how many ideas passed, merging idea lists from several sessions]
---

# Topic duplicate screen

Batch generation drifts back toward the same handful of strong topics
under new titles. A string-level title check misses this ("The box under
the television" and "Nintendo vs Sony vs Microsoft" are the same video).
Unscreened duplicates inflate the pass count, which is exactly the number
the loop is optimizing.

## Procedure

1. Before scoring, compare each new idea's **subject plus measure plus
   span** against the existing backlog and against earlier passes.
2. If two ideas would render essentially the same chart, mark the newer
   one as a duplicate of the older and fail it with that reason. Keep the
   older one.
3. Keep the duplicate map as a file, so later batches and later scorers
   inherit it.

## Decision rules

- The same subject with a genuinely different measure (spending vs troop
  numbers) or form (map vs race) is not a duplicate.
- Duplicates are failed visibly with a reason, never silently dropped.
  The report counts them.
- If the newer framing is clearly better, record that as a suggested
  edit to the older idea instead of passing both.

## When not to use it

- When deliberately producing a variant set (vertical and landscape cuts,
  or language versions) of one idea. Those are one idea.
