---
layer: application
type: application
subject: metrics-rollups
technique: capped-list-uncapped-total
stack: node
status: forged
verified_on: 2026-10-27
---

# The newest fifty of every output (afterlife)

Project `afterlife`, https://github.com/xkazm04/afterlife at main, commit 009c7893 (the same
tree as the hackathon mirror on GitLab). The list of merge requests behind an agent's
promotion counters is bounded, and the bound is one shared constant:
`src/lib/demo/sources.ts:66` "export const SOURCES_CAP = 50;", documented at `:65` as "The most
outputs (and missing facts, and blocks) a record's sources list: the newest."

## Total before the cap, from the same tally

The producer cuts the newest fifty from the tally's ordered selection
(`src/server/poller/derive/sources.ts:12` "t.ordered.slice(0, SOURCES_CAP)") and sends the
total of the same, uncut selection (`src/server/poller/derive/sources.ts:31` "total:
t.ordered.length"). The wire type says what the total means: "Every output since `since`:
more than `outputs` lists when the list is capped." (`src/lib/demo/sources.ts:41`). The
consumer renders the cut where the list is shown:
`src/lib/promotion/sources/explain.ts:66` "Lists the newest ${s.outputs.length} of ${s.total}
outputs since ${day(s.since)}." — only when the list is in fact capped.

## Deviation recorded

Three other lists in the same payload are cut by the same constant and carry no total of their
own: the guardrail blocks, the missing facts and the trial merge requests
(`src/server/poller/derive/sources.ts:33-36`). Blocks and trials have their counts on the
counters beside the list, so a reader can still compare; the missing facts have none, and past
fifty a reviewer would read the list of facts the counts could not read as complete. This is the
"every capped list carries its own total" clause, met for the first list and not the others.
