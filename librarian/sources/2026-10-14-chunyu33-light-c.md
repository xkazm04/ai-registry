---
source: github:Chunyu33/light-c
kind: repository
url: https://github.com/Chunyu33/light-c
title: A Windows disk cleaner on a desktop shell whose delete commands span the whole range of IPC trust
author: Chunyu33
words: 649
extracted: 8
accepted: 1
declined: 0
leads: 3
already_covered: 1
untriaged: 3
dispatched: 0
applied: 1
shipped: 0
run_id: lightc-1014
siblings: 3
fetches: 0
rescan_when: a release lands after 15dc1af9 (2026-10-14); or 8 weeks elapse (2026-12-09)
---

# Four delete commands that trust the page, one that does not

Operator focus: the quality of the desktop-shell (Tauri) code. Class: practitioner
repository, first-party, one author. Expected yield stated up front: one or two
techniques at most, because the corpus already owns the contract-shape subject.
Live siblings at start: 3 (framefields, revogrid, wordcraft); none held the
native-shell subject.

Swept at `15dc1af9`: the agent instruction file, the capability manifest, the
config, the build script, the command registry (`lib.rs`), the delete commands,
both delete engines and their shared protection table, the runtime-mode
detector, the changelog. The README (649 words) was read last.

## Design record

1. **decision:** the deep-clean delete takes a scan id and category names and the
   native side restores the full path set from its own session; every path is
   re-tested against a positive matcher. **forces:** results are paged to the
   page, a tampered page must not widen the delete. **buys:** the selection and
   the deletion mean the same set. **rejects:** trusting the path list.
   **where:** src-tauri/src/commands/delete.rs:94 "后端再次校验路径规则".
   **corpus:** NONE (ipc-contract owns call shape, not entitlement). -> technique.
2. **decision:** one protection table shared by two delete engines, with rebuildable
   cache directories exempted by exact marker, drive-root anchor and whole-segment
   boundary. **where:** src-tauri/src/cleaner/safety_constants.rs
   "is_rebuildable_system_cache_path". **corpus:** nearest neighbour unverified.
   -> lead.
3. **decision:** distribution mode (installed vs portable) is decided by a ladder
   from strongest to weakest evidence, and an unreadable probe resolves to
   installed because the wrong guess there is cheaper. **where:**
   src-tauri/src/runtime.rs "宁可写 AppData 也不误写程序目录". **corpus:** NONE
   (packaging owns acceptance, not mode detection). -> lead.
4. **decision:** the portable build suppresses the auto-created window and builds
   it in setup with its own data directory. **where:** src-tauri/src/lib.rs
   "window_config.create = false". -> lead, thin.

Routing count: 2 verified NONE in different homes, no shared HOME IF NEW, so no
handoff and no XL trigger.

## Triage

| # | Candidate | Prior art | Impact | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|
| 1 | Native side owns the target set (handle not list, allow-list, normalise, every layer refuses, shell string) | native-shell-integration / ipc-contract (no entitlement technique) | new-technique | real gap | 2/0/2 | accept (technique + application) |
| 2 | Exact exemptions from a protected root | unverified | new-technique | partial | 2/1/2 | untriaged (home unread) |
| 3 | Mode detection ladder fails toward the cheaper wrong guess | packaging | new-technique | partial | 2/2/2 | untriaged (single source, one author) |
| 4 | Suppress auto window, build in setup | native-shell-integration | new-technique | thin | 1/1/1 | untriaged |
| 5 | Placeholder audit script over the AST | localization | script | partial | 2/1/3 | untriaged (no fleet seam) |
| 6 | Agent instruction file with a changelog style gate | agent-instruction-files | none | likely catch | - | already covered |
| 7 | Scan sessions with TTL and a degraded mode | folded into 1 | - | - | - | absorbed |
| 8 | A layer that only logs | folded into 1 (rule three) | - | - | - | absorbed |

Rows 2-5 are untriaged: nobody verified them, none is a decline.

## Landing

- technique `native-side-owns-the-target-set` in native-shell-integration, linked
  from the golden path.
- application `rust--native-side-owns-the-target-set` against this tree, 15 anchors
  run through check-anchors, none failed. The strongest finding was structural:
  the author's own comment names the threat, the newest command meets it and the
  four older ones do not, and the second safety layer in the engine is a `warn!`
  that falls through to the delete.
- Not executed: the alternate-spelling bypass of the deny-list is read from the
  code (Windows-only crate). The application says so.

## Apply (Phase 7.5)

Project: personas, mode `experiment` (structural audit), verdict `unmeasurable`.
Seam chosen to falsify: "a tight manifest and a missing content policy are the
usual pair". Personas has a content policy (the technique's pairing held in its
favour) and no per-command manifest across about 1700 commands, so half the
prediction held. It also has a command, `dev_tools_run_tests`, that runs a
caller-supplied string through `cmd /C` or `sh -c`. That is the product, not a
defect, and it produced the inversion clause now in rule five (the bound moves to
who may call it). No change shipped: introducing runner allow-lists is a
posture decision for the owner. Return condition: a behavioural arm needs the
owner's decision on whether the runner stays free-form.
