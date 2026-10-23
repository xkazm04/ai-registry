---
project: source tree (not a fleet project) - github:garrytan/gstack
run: apply-aae-1022
subject: software-engineering/agent-browser-control
technique: agent-actionable-errors
mode: task
branch: intake/pin-wraperror, commit 70b8db6 over base 514fbfdc9799376edfd2536f60659501a48ead64; exported as `2026-10-22-gstack-wraperror-task.patch` beside this file. The clone was deleted.
size: 4 files / +139 -23
status: landed on the branch; not pushed; no PR opened
---

# Task: pin `wrapError` and key it on the failure class

Backlog item 2 of `2026-09-02-gstack-source-tree-task.md`. Measurable: of 13 recorded
real Playwright failures, how many reach the agent as an actionable message. Before 7,
after 13; the three rewrites that already worked are byte-identical (the floor).
The control (the new test against the verbatim move) fails 2 of 3.

Re-apply: `git clone https://github.com/garrytan/gstack && git checkout 514fbfd && git am <patch>`;
tests: `bun test browse/test/error-rewrite.test.ts` (needs `bun install`; run it with
bun, the recording script ran under node because bun hung driving Chromium here).

Remaining backlog: items 1, 3, 4, 5 of the earlier handoff; plus a stale-reference
message that restores the element's former role and name (the technique's first
canonical case; the tree has only the unknown-ref message at `browse/src/tab-session.ts:94`).
Upstream is the operator's call.
