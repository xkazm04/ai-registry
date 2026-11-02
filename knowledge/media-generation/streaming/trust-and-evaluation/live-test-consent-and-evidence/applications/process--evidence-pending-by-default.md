---
layer: application
type: application
subject: live-test-consent-and-evidence
technique: evidence-pending-by-default
stack: process
status: forged
verified_on: 2026-11-02
---

# Pending-by-default status in a streamer toolkit's spike log, submission checklist and demo shot list

Castle Control (main checkout, 2026-11-02) was built toward a hackathon deadline with a
large share of its platform behaviour not yet observed live. Three documents carry its
claims: the owner live-spike record, the submission checklist, and the floor-demo shot
list. This application reads them as one process for keeping every live claim pending
until evidence is attached, including the places where the process slipped.

## A status vocabulary that names who owes the next step

The checklist uses a closed key. Pending is split by whose action is owed, "done" is
scoped to a narrow artifact, and the rule that matters most is written into the key
itself:

- `docs/submission/checklist.md:22` "Status key: **done** means the narrowly stated artifact is committed on local"
- `docs/submission/checklist.md:24` "integration, evidence or document finalization remains. **pending-owner** means"
- `docs/submission/checklist.md:26` "commit never counts as a live exit. **pending-owner review** means a prepared"

Done rows carry their own limit in the same cell, and the schedule row refuses to be
read as progress:

- `docs/submission/checklist.md:55` "| Fixture-only Playwright e2e lane and polish round one | done | **Code completion only**:"
- `docs/submission/checklist.md:36` "Schedule is a target, not completion evidence."

The document states what its own author checked and what was reported by someone else:

- `docs/submission/checklist.md:5` "spike results are read from this worktree; this task ran no live checks. No remote"
- `docs/submission/checklist.md:10` "round one. Browser pass counts below are Director-reported runs at the cited"

## Evidence rows separate the expected line from the recorded result

The spike record's evidence table puts the expected PASS pattern, the recorded timestamp
and the owner evidence in separate columns, and says the pattern column is not a result.
Twin rows not yet run hold "pending owner live run" in both recorded columns:

- `docs/spike-log.md:152` "commands above; WP means the existing WP 0.7 command below. Expected lines are"
- `docs/spike-log.md:166` "| WP timeout / undo — ARMED, owned target only | WP (below) | `<UTC> PASS timeout_and_undo` | 2026-10-27T16:44:57.252Z | run 10: 30 s timeout on castlecontroltarget, undone |"
- `docs/spike-log.md:64` "readings before admitting a model. Exit zero alone is insufficient."

## Evidence proves what it observed (upward lessons)

The runbooks scope each observation narrowly. An acknowledgement from the broadcasting
software is not the picture; one observed action is not the vocabulary; an interface echo
is not the server's limit; no limit is found by force and no threshold invented:

- `docs/spike-log.md:247` "The source name includes a fresh run ID. CreateInput PASS means OBS acknowledged"
- `docs/spike-log.md:248` "the request; confirm the static page **visually in OBS** before marking its row"
- `docs/spike-log.md:265` "Helix streams read. This spike makes no ON AIR, viewer-count or M1 claim."
- `crates/cc-twitch/README.md:124` "one observed action does not establish the whole vocabulary. Likewise the"
- `crates/cc-twitch/README.md:143` "actual integration timing are deferred. A UI echo of 500 characters is not proof"
- `crates/cc-twitch/README.md:147` "computed retry wait if observed. It never drives traffic to find a limit."
- `crates/cc-twitch/README.md:152` "natural applicable response is available in integration. No pass threshold is"

The offline verifier guide keeps a passing proof from standing in for a live draw:

- `docs/guide/verifier.md:4` "self-contained web verifier work offline. Verification checks a proof, not"
- `docs/guide/verifier.md:51` "public quicknet signatures. A working example is not live Twitch evidence."

## The shot list carries readiness, and live narration is conditional

The floor-demo script applies the same discipline to footage (the
no-fixture-for-live-footage technique): the plan says it is a plan, every shot carries a
readiness verdict, and a missing live shot is never filled with fixtures:

- `docs/submission/floor-demo-script.md:8` "This is a recording plan, not evidence that the pictured live behavior works."
- `docs/submission/floor-demo-script.md:32` "Never replace a missing LIVE shot with fixture footage under live narration."
- `docs/submission/floor-demo-script.md:33` "A LIVE narration line below is conditional on recording the stated evidence."
- `docs/submission/floor-demo-script.md:23` "participant enters. Use generated, labelled simulated data for fixtures."
- `docs/submission/floor-demo-script.md:74` "If a required shot fails, keep the package pending instead of narrating success."
- `docs/submission/checklist.md:41` "Never substitute fixtures for live proof."

## Where it falls short: hand-written headers went stale

The spike record's headers were typed by hand and never derived from the rows. After run
10 passed all six spike checks, the file still opened by declaring everything pending,
and the table preamble still said every row was pending. Two downstream documents had to
carry a note explaining the contradiction instead of the source fixing it.

- `docs/spike-log.md:3` "**Status: pending owner live run.** This delivery supplies the build half only."
- `docs/spike-log.md:151` "Every row's status is **pending owner live run**. Command IDs refer to the exact"
- `docs/submission/checklist.md:69` "The log's pending header is stale for WP/O rows."
- `docs/submission/floor-demo-script.md:11` "screenshot reference and socket recovery. Its pending header is stale for"

**Deviation:** the standard asks for every summary to be derived from its rows. Here the
stale header points in the safe direction (it understates), which is why it survived; the
same mechanism pointing the other way would overstate a live claim.
