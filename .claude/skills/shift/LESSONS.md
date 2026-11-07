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

## 0.4.0 - 2026-11-07 - /shift reflect, on the operator's correction

The operator: "it seems like we did not extract from the video topics, either we cannot match the knowledge to specific use cases in media generation or game development, or we are not doing additional research to match techniques to our stack. If video contains prompts in description for movie scene generation, I expect we will replicate with our own methodology, the new methodology, keep for my verdict after all done. Instead of that we create a 5s video of a blanket with and with no sound."

- **Both causes held, and the method produced them.** Nothing in `/shift` asked for the source's work to be remade. The miner brief mentioned neither prompts nor our stack, and a row named a subject home, never a project. `VGDHR_U3r5k`, titled "Prompts in Description", ended at "I did not obtain a single prompt", while its report recorded `showPrompts: true` on the linked project page. `EC0lEkIKdjo` noted a prompt pack and `yNMPr6oBozg` read notes with skill downloads; none became a render. Fixed: `references/replication.md`, replicas first.
- **The rows asked questions nobody was asking.** Scenes were invented to suit an instrument: the blanket, kettle, rain and boat of `shift-editable-no-music-line`. It cleared its floor and the operator retired it unjudged: "we should not focus on topics like that where we have no direction for use". Clearing a floor is not value. Fixed: `render.use` is required, and `next` starts no row without it.
- **The planner saw 800 characters of each description.** Links sit lower down. Fixed: the brief carries the stored 4000.
- **The bank's result on 2026-11-07.** 14 rows in 15 seats. Six image and video proofs stopped because seed difference matched arm difference (`currency-edit`, `currency-world`, `currency-reftag`, `film-draft-1`, `film-draft-2`, `ref-camera`). Two stopped at setup (`ref-identity`, `ref-swap`). One sealed and was retired. `compositor-plate` found the first-frame stretch and last-frame crop in `nodes_minimax_h3.py`, then yielded to a video job. The four rows that gave figures read a model's text, not pictures: `prefill-a`, `-b`, `-c` and `product-green-pair`.
- **The supervisor kept feeding that bank.** By the third floor refusal the pattern was written in the report, and I went on dispatching rows at about 100k tokens a seat, telling each to pilot first. That saved GPU, not the operator's money or attention. A pattern across rows is a reason to stop and ask what the bank is for.
- **Pilots lie in both directions.** Five frames stopped `film-draft-2` on a clip that never held its pin, and passed `ref-camera` at 1.52x where the run read 1.15x.
- **Two rules disagree.** Rows wrote in `--allow-indistinct`, and the proof brief refuses it without the operator. The brief governed; `film-draft-1`, `ref-identity` and `ref-camera` named the conflict. Rule for new rows: don't write it in.
- **Small faults for the door and the sensors.** A landed row's `commit` field stays empty, because the sha doesn't exist until the door commits. A door gate or push reads as `settling` with dwell 0, so each landing costs the bank about 5 minutes. A runner started once on `settling` with queue, Ollama and lease clear, with no contention seen. A proof agent's seat is not counted against the cap, though each cost 80-160k tokens.
- **Backlog filler.** Three waves of 3 landed 2 of 9. A filler seat reached a fix-shaped row it could not make; 22 queued rows carry that shape.

**Starting numbers after the first overnight run, one machine, one night.** None change, and the fourth column is what the next night should read.

| Number | Value | What the night showed | Still unknown |
| --- | --- | --- | --- |
| `maxSeatsPerDay` | 30 | closed the lanes at 69 of a raised 60 on 2026-11-06; 24 used by morning on 2026-11-07 with fillers held by hand | what a seat costs, since proof agents go uncounted |
| `attentionCap` | 5 | reached by research width with the operator away; never the limit on what ran | whether 5 is reviewable |
| `operatorIdleMin` | 30 | held `/harvest evaluate` until the operator slept | whether it was worth holding |
| `operatorActiveResearch` | 3 | applied, with no complaint | any effect on the operator's work |
| `gpuIdleDwellS` | 300 | 15 proof seats without a recorded collision, and a real video job arrived during one wait | a run that takes no lease |
| `reviewCapGb` | 5 | 2.1 GB with 4 runs owed | the pause never fired |
| `minFreeDiskGb` | 100 | free space stayed at 227 GB or more | never fired |
| `pageReadsPressure` | 500 | one sensor read 512 with no pressure raised; sustain held | a real sustained reading |
| `availableFloorMb` | 12000 | available RAM stayed at 32-41 GB | never near it |
| `coLoadBudgetMb` | 18000 | not read in this reflection | the canary was not read either |
