---
layer: application
type: application
subject: agent-session-archive
technique: ingest-disposition-accounting
stack: node
verified_on: 2026-10-15
applied: code
ab_verdict: better
---

# One registry script that scoped discovery by folder, given an account of every source

This registry turns the agent harness's local transcripts into structure-only process
instances with `scripts/process-sessions.mjs` (step kinds, counts, timing, outcome; no
prompt or command text). It found sessions by matching each transcript folder's encoded
name against the fleet's checkouts, and it reported "N sessions". Nothing said what it
did not read. Measured on 2026-10-15, it read **2,024 of 10,762** top-level transcripts.
The rest sat in folders that match no checkout: headless and temporary run directories,
an app's working directory, sessions launched from the home folder, and short-path clones
and worktrees. Two other registry scripts read the same store with two other folder
rules.

## A and B

- **A:** the script at `2546c298`. Folder-name filter, first record's working directory
  attributes the session.
- **B:** branch `ab/session-discovery` (`38b1a8dc`, merged `f5fccfc5`). Every folder is
  read. A session launched inside a checkout keeps today's rule. One launched elsewhere is
  resolved through registered worktrees and clone origins, and each record's working
  directory votes for the repository it lies in; a fleet repository wins only if nothing
  outside the fleet has as many votes. Every transcript ends in exactly one disposition:
  `read`, `outside-fleet`, `empty`, `unparseable` or `in-flight`.

## Result (empty caches, same moment, both arms run)

- **Target:** work sessions in the 30-day window attributed to fleet projects:
  **1,383 -> 1,440** (+57; garden-vr +20, kp +15, firetv +7, paypal +6, four more).
- **Floor:** of 2,014 sessions arm A attributes, arm B loses **0**, re-attributes **0**
  and changes **0** summaries. Warm run time 0.25 s -> 0.64 s, inside the declared 2 s.
- **Dispositions:** read 2,101, outside-fleet 8,664, empty 1, unparseable 4, in-flight 1,
  which sum to the 10,771 scanned. The account is the deliverable: "N sessions" now comes
  with what was not read and why.

## What the seam taught the technique

The builder's first rule, "the first working directory that resolves to a checkout
wins", added three registry sessions, and all three were false. One headless run spent
654 of 657 records in a repository outside the fleet and 3 in this registry's skill
folder. Attribution by a single sighting is the identity rule's failure in another form;
the vote fixed it. The brief's premise was also wrong: registry work in short-path
worktrees lives in subagent subfolders of sessions already counted, so the registry's own
count did not move (487 -> 487).

## What it cannot do

A session in a worktree removed before its first parse cannot be attributed afterwards,
and about 28 transcripts in deleted clone directories stay `outside-fleet` although their
folder names suggest one project. The script still keeps structure only; the bytes behind
a disposition roll off with the harness's retention unless a mirror captures them first.
