# Lessons - shift

Append-only reflection lane. One entry per shift that taught something, newest last.
Format: `## <version used> - <YYYY-MM-DD> - <scope>` followed by `- ` bullets.

Every number in `DEFAULTS` (`scripts/lib/shift-policy.mjs`) stays an unmeasured starting value until
the reports say otherwise. One run does not change that.

## 0.1.0 - 2026-11-06 - first real run, as reported by its director

- One action blocked parallel work. Evidence: `next` returned a single action, so the session ran one
  thing at a time while the box had room. Fixed in 0.2.0: `next` returns everything to start now, per lane.
- `resume` blocked siblings. Evidence: `next` returned `resume` while any cluster was `mining`, so a
  cluster waiting on a proof or a verdict held every other cluster. Fixed: `resume` is gone, a live seat
  means only "nothing to start here", and a cluster owing only a verdict is `waiting`.
- `AskUserQuestion` stalled the loop. Evidence: a verdict asked that way blocked the supervisor's turn,
  and no dispatch happened until it was answered. Fixed: questions wait for `/shift decisions`.
- Operator presence set width to 1 at 7 % CPU and 41 GB free. Evidence: `width()` collapsed to research 1,
  build 0 on any activity in the last 30 minutes, regardless of load. Fixed: presence only caps research,
  at a new starting value that is itself unmeasured.
- `harvest evaluate`, which is build-class, was offered at `width.build` 0. Fixed: it needs a free build seat.
- `--seats-mb` was manual and easy to forget, which silences the canary. Fixed: read from the ledger.
- A long seat lost its board claim, because claims reap at 45 minutes unless beaten. Fixed: beat every tick.
- A 5 s poll hid a 3x timing error in a proof. Time a proof from its execution timestamps, not by polling.
- A pair below the discrimination floor can still inform a lead, though it may not author a landing.
- The numbers from this run: H3-free GPU, CPU 6-17 %, 36-43 GB available through 12+ audio renders plus
  one research seat, no pressure fired, canary null. **That is one observation and does not validate the
  defaults.** The canary read null, so this run says nothing about the slowdown it measures.

## 0.2.0, 2026-11-06

- `--until opening` wakes on any width rise, so CPU swinging across the build ceiling wakes the session with nothing to start. Seen once, at 18:11.
- A lander committed past a red gate because its command did not stop on failure, then fixed it in a follow-up. The supervisor reads each lander's report for this before pushing.
- The operator's list took 18 GitHub repositories mid-shift. The instruments know only YouTube, so 0.3.0 adds a repository row and a RAM rule; `sync` still does not read those lines.

## 0.3.0 - 2026-11-06 - the verdict page

- 2026-11-06, operator: a verdict needs the tracks and the choice in one place, and the reason for the comparison.

## 0.3.1 - 2026-11-06 - the commit door

- A gate and a commit composed by hand are two steps. Evidence: `815760d9f` was committed with `check-run-results` red and repaired by `f9a2e0d59`; the report says the lander's command did not stop on the failed gate. The exact command was not recorded, so why it did not stop is not known. 0.4.0 takes the composition away from the lander.
- Shared ledgers dirty in one checkout deadlocked two landers. Evidence: at 18:50 the film and currency landers each waited on the other's commit. The "first ready carries the shared files" fix removed the wait but could commit a line naming a sibling's note not yet in HEAD, while a gate over the working tree stayed green because the note was on disk.
- `/shift approve` stored no digest, so an edited `plan.json` stayed approved. Evidence: `approved.json` held only `approvedAt` and `struck`, found by the uzi miner against our own `hitl-approval` rule.
- `transcriptOutcome` read all stderr, so `VGDHR_U3r5k` was labelled throttled, cause unconfirmed, and such a video is retried each run and doubles the pace.
- What the miners proposed. dark-factory (AGPL, design recorded in our words, no code taken): a door script that reads the gate's exit status, a mechanical gate at push, a total order on waits, one file per ledger entry, and a last hook on the ref move, which it warned against while the gate judged a shared dirty checkout. uzi (MIT): gate the tree that lands in a short-path detached checkout, a receipt keyed on the tree hash, one file per writer with a coverage oracle, and a lock that refuses with the holder's name.
- What we chose. The door and the push gate from the first, the pinned tree and short checkout from the second. No receipt: the same process gates and commits the same tree object, so a receipt would certify nothing more. No ordered waits: a lander waits only on a lock with an owner and a bound. No ref-move hook: the door moves the ref itself, and a hook is not needed to gate it. The lock waits instead of refusing, because a lander holds nothing while it waits and so cannot close a cycle.
- Against per-entry ledgers across the corpus. Both miners and three of our own techniques (`per-contributor-aggregation`, `physical-isolation`, `commit-time-claim-guard`) point at one file per entry, and that remains the better shape. It would change the format of `sources/index.md`, `applied.md`, `backlog.jsonl` and their readers (`ledger-read`, `registry-mcp`), so it stays a proposal for the operator. Fragments applied inside the lock end the shift's own intertwining without it.
