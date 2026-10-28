---
layer: application
type: application
subject: watch-cache-and-resync
technique: per-cycle-read-budget
stack: node
status: forged
verified_on: 2026-10-27
---

# A read budget and finality-keyed memos for agent MR facts (Node)

afterlife (https://github.com/xkazm04/afterlife, commit `009c7893`, the same tree as the
GitLab hackathon showcase) shows, for each agent-authored merge request, its size and the
status of its head pipeline. Both are detail reads per MR on top of the project's list
reads, so they are where a polling cycle's cost lives. `src/server/poller/mrFacts/facts.ts`
caps them per project per poll and memoises them in `src/server/poller/state.ts`; it
realises per-cycle-read-budget and, beside it, finality-keyed-memo.

## 1. The budget, its derivation, and deferred reads as unknown

`export const FACT_READS = 20;` (`src/server/poller/mrFacts/facts.ts:18`) carries its reasoning: "A first poll of a
busy project (mrLimit is 200, the task window a day by default) would otherwise make two
calls per agent MR at once; 20 covers a typical day's agent MRs in one or two polls, and a
steady poll re-reads only the running pipelines and the MRs that got a new head."
(`:13-17`). The budget is per project — a new `{ left: FACT_READS, skipped: 0 }` per call
(`:97`). `spend` charges before the read and counts denials (`:34-42`); memo hits return
before `spend` is called (`:55-57`, `:72-74`). A deferred or failed read is null: the
header says "A read that fails or is left for the next poll is null with an issue, never 0"
(`:4-5`), and the deferral issue names the count and the budget, "left for the next poll,
at most ${FACT_READS} a poll; shown as unknown" (`:106`).

A list cut by its own limit is recorded the same way in `src/server/poller/project.ts:119`:
"the port cuts the list at the limit without saying so: a full one may be missing MRs".

## 2. Memo keys: a sha forever, a pipeline only once final

`src/server/poller/state.ts:23-26` declares both memos with their immutability: `mrSizes` is "An agent MR's
size at a head sha (a sha's diff never changes)", and `mrPipelines` "An agent MR's head
pipeline once final (success, failed, canceled) ... Running is re-read." A size hit requires
`hit?.sha === mr.sha` (`src/server/poller/mrFacts/facts.ts:56`); a pipeline hit requires `hit?.id === id` (`:73`), so a
re-run's new pipeline id misses. Only finals are stored: `if (isFinal(status))
r.mem.mrPipelines.set(key, { id, status });` (`:80`). Unrecognised statuses map to null,
"unknown (skipped, manual, anything new)" (`:22-26`), and are never cached.

The memo is volatile by declaration — "Losing it (a restart) only costs one slower cycle:
every row is rebuilt from GitLab." (`src/server/poller/state.ts:1-2`) — and its reapers are typed:
`const KEYED: Readonly<Record<keyof PollMemory, 'project' | 'mr' | 'commit'>>`
(`src/server/poller/state.ts:40-42`) is "Keyed by PollMemory itself, so a map added there fails the typecheck
here until forgetProjects is told how to forget it." (`:37-39`). Entries of MRs that left the
window are dropped each poll (`src/server/poller/mrFacts/facts.ts:95-96`).

## Deviations recorded

- **No rotation.** `addMrFacts` walks the derived tasks in the same order every poll
  (`src/server/poller/mrFacts/facts.ts:98-105`), and running pipelines are re-read and charged each time. A project
  with twenty or more agent MRs whose pipelines stay running at the head of the order would
  defer the rest indefinitely; the technique's step 5 (oldest-deferred first, or a reserved
  share for never-read items) is missing.
- **The budget is derived from demand, not from the limit.** The comment at `:13-17` sizes
  the budget against a typical day's MRs. The rate limit it shares is cited only for the
  poll interval's floor (`src/server/poller/scheduler.ts:14`), so the two numbers are not
  computed against each other: twenty reads per project per thirty-second poll is safe for
  one project and not obviously so for fifty.
- **A deferred read overwrites the last read value.** The task's detail is merged with
  `{ ...prev, ...next }` (`src/server/poller/project.ts:83`), so a fact deferred after a restart (memo empty)
  replaces a previously stored size with null. That is the *unknown* choice of step 3 and is
  honest; the view gains nothing from the value the store already had, which an aged
  last-known value would have kept.
