---
domain: software-engineering
subject: prompt-assembly
last_touched: 2026-08-22
touched_by: research
dry_streak: 0
---

# prompt-assembly

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-08-22 - `/research`, from a practitioner deep-dive

Gained `context-reachability` (6 -> 7 techniques). Source: [[2026-08-22-inside-deepwiki]].

`context-budgeting` split layers into floors and elastic allowances and never said what
makes a layer one or the other - so it was being decided by intuition about importance,
which is the wrong axis. Reachability is the right one: could the agent have obtained
this itself with the tools it already has? The two classes have opposite value curves
and opposite failure modes, which is what makes the split load-bearing rather than
taxonomic.

The non-obvious half, and the part the source did not state: reachable context needs a
HIGHER freshness bar than unreachable context, because an error there steers the agent
away from checking something it would otherwise have found.

## Open leads

- **The classification has to reach the feeders.** The technique says each feeder
  declares the class of what it contributes. `retrieval`, `agent-memory` recall and any
  state digest are the feeders; none of them currently says. If a later run touches any
  of the three, check whether the declaration belongs there too.
- **Reachability moves when the tool surface moves**, which ties this to
  `mcp-tools/orchestration-to-tool-migration`, landed in the same run. Two subjects now
  describe the same boundary from opposite sides; check the seam is stated once.

## Standing debt

- **Single stack** (`rust`). The new technique has no application.
- **Never swept by `/librarian`.**

## Declines

None.
