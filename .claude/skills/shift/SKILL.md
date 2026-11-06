---
name: shift
description: "Turn the CPU and RAM a long GPU video job leaves idle into registry know-how. A long-lived, resumable /intake variation: pre-researches the operator's gitignored YouTube list into topic clusters and an intake plan the operator approves, mines approved clusters as batches at a width set by live sensors, banks GPU proofs and media benchmarks to run only when the GPU is truly idle, and fills the rest of the time with /harvest backlog, /harvest evaluate and /deepen --loop. Lands into the registry and connected projects under each repo's own law. Use when a machine runs video generations for days, or when the operator wants the box working while away."
category: ai-native
memory: project
version: 0.1.0
tags: research, queue, resources, gpu, unattended, batch, cross-repo, render-proof, long-running
---

# Shift

`/intake` assumes one source, one sitting and a free machine. This box usually has none of
those: a video job holds the GPU for days, CPU sits near 15 %, and links pile up faster than
anyone mines them. This skill is the same mining method under a different economy. It writes
no content doctrine: **if a rule here disagrees with `/intake` or `/harvest` about how a source
is mined or what may land, they win and this file has a bug.**

The same law, out loud: **a source ORIGINATES a finding. It never AUTHORIZES one.** A shift runs
with nobody watching, so volume laundering authority is its specific failure.

Three laws of its own:

- **The video job owns the machine.** The shift never POSTs `/free` or `/interrupt`, never
  recycles ComfyUI, never kills a process, never submits outside ComfyUI's queue, never runs a
  bp UBT or editor build. If a reading cannot tell, the answer is no.
- **Resources only lower the width.** The attention cap (5) comes from what a director can
  review (`/harvest` `references/backlog.md`). Free RAM never raises it.
- **No duration proves the GPU idle.** Real gaps between video jobs run from 1 s to 4 h. Idle
  means every condition below holds at once, and even then a proof goes through the queue, so
  a wrong guess costs a wait and not a collision.

## Invocation

```
/shift                         # start or resume from files; the normal entry
/shift status                  # read state and sensors, touch nothing
/shift plan                    # pre-research now, stop at the rendered plan
/shift approve <planId> [--strike <clusterId>]...
/shift review                  # rebuild and show the rolling review page
/shift verdict <runId> <pairId>=<label|tie|neither> ...
/shift pause                   # finish in-flight seats, dispatch nothing new
/shift reflect                 # update LESSONS.md from the reports
```

`/shift` keeps running through `/loop` in dynamic mode. The terminal stays open. While seats or
proofs run it keeps the system and display awake, as one background
`powershell -NoProfile -ExecutionPolicy Bypass -File scripts/shift-awake.ps1` (display-off Modern
Standby took H3 clips from about 480 s to 1022-1115 s). Touch `.ai/shift/awake.stop` when nothing
is left to run. **A closed lid still sleeps.**

## Instruments

```sh
node scripts/shift-sense.mjs --json --seats-mb <n>
node scripts/shift-sense.mjs --until <gpu-idle|pressure|operator-idle> --timeout <s> --seats-mb <n>
node scripts/shift-plan.mjs sync|meta|transcripts|brief|validate|render|approve|status
node scripts/shift-queue.mjs next --sense <file|->
node scripts/shift-queue.mjs mark|list|seat
node scripts/shift-review.mjs build|size|verdict|clean
```

**Always pass `--seats-mb`** (about 1000 per research seat, 3400 per build seat). The slowdown
canary only fires with seats active, so a sensor without it cannot see the harm it measures.

## The loop

The whole session is this. **Hold nothing in context that a file can hold**: compaction and a
dead terminal must lose nothing, so every decision re-reads.

1. **Sense.** `shift-sense --json --seats-mb <n>` to `.ai/shift/last-sense.json`.
2. **Ask.** `shift-queue next --sense .ai/shift/last-sense.json`, which returns ONE action.
3. **Act** on it, at no more than its `width`. Record each dispatched seat with
   `shift-queue seat <kind>`. A running seat is never cancelled for a lower width; width
   governs top-ups.
4. **Wait.** Start `shift-sense --until <event> --timeout 1200` as a background command, whose
   exit wakes the session. Beside it, `ScheduleWakeup` at 1800 s as the fallback. Never poll.
5. **Report** once a day to `.ai/shift/reports/<date>.md`, plus when a plan or a proof awaits
   the operator (`PushNotification` if available).

| Action | Do |
| --- | --- |
| `wait` | Nothing new. Note `resumePending` or `proofsPaused` in the report if present. |
| `resume` | Re-read the cluster's state and the repo. Continue the same agents after a limit; never send a fresh worker onto a half-done repo. |
| `gpu-proof` | One proof, § GPU bank. |
| `pre-research` | § Pre-research. |
| `mine` | § Mining a cluster. |
| `filler` | § Filler. |

**Yielding to the operator.** `operatorIdleS` under 30 minutes gives width research 1, build 0,
already in the sensor. A null reading counts as active.

**Plan limits.** No instrument reads remaining quota. `maxSeatsPerDay` (30) bounds spend, and it
is a starting value, not a measured one. A seat limit blocks every session on the seat including
the operator's, so on a limit error: stop dispatching, write the reset time to the report, wake
at the reset, resume the same agents. How a limit surfaces to a seat here is unverified, so log
the first one exactly as it appears.

**Board.** The supervisor holds no claim: claims only grow, and one held for days blocks every
sibling. Each cluster run claims and releases its own, per `/intake` § "Running beside a dozen
siblings". Beat it when dispatching seats. Locks are for seconds, never across a seat or a proof.

## Pre-research

Read [`references/preresearch.md`](references/preresearch.md). In short: `sync`, `meta`,
`transcripts` (all paced and serial, because YouTube's 429s are the limit and not CPU), `brief`,
then **one planner seat** reads `input.json`, maps themes with `research-map --prose`, and writes
`plan.json`. `validate`, `render`, tell the operator. **Nothing mines until the operator approves
the plan, every plan.** Filler keeps running meanwhile, so a waiting plan never means an empty box.

## Mining a cluster

A cluster is one run of `/intake`'s batch lane
([`source-classes.md`](../intake/references/source-classes.md) § "The batch lane"), and each
phase of `/intake` applies, with these differences:

- Claim `--source "shift:<planId>/<clusterId>"`; `beat` each home subject as the map names it.
- One miner per video, up to `width.research`. Topped up one per completion, and each sense can
  only lower that. Miners return proposals and write nothing: the `/harvest` Phase 3 brief.
- **Convergence counts voices, never videos.** A single-channel cluster has no convergence.
- One lander seat at a time per cluster holds every write, serially, under the `/intake` locks.
- **Phase 5 is scored, not asked** (it already is). E1-E4 escalations never block a shift: they
  become proposals in the report. No directions, no XL forge dispatch, no new laws unattended.
- **Phase 7.7 is skipped and says so** (`gate=skipped`).
- A row that needs a GPU becomes a held row, § GPU bank. Never a `simulation` substitute.
- Phase 8 lands per [`references/authority.md`](references/authority.md). Build-class gates run at
  `width.build`: **a project's test suite is the heaviest thing a shift does** (one vitest suite,
  78 % CPU and 17 GB). If `build` is 0 the change waits; do not run it anyway.
- Mark each video `landed` or `parked`, write `run-result.mjs` per cluster with `held` subjects
  counted. **Superseded and parked are never declined.**

## GPU bank

Read [`references/gpu-bank.md`](references/gpu-bank.md). Proofs and benchmarks are held rows in
`librarian/harvest/backlog.jsonl` (`"status":"held"`, `"queue":"media"`). **This skill is the
media host that `/intake` Phase 6b names.** One proof at a time, one idle window at a time; it
holds the gravitone lease with `pipeline/gpu/hold.py` and submits through the queue. Results go
on one rolling page. **The operator's blind pick is the verdict, and nothing render-bound lands
before it.**

## Filler

When `next` says `filler`, run the named skill's own method, at the action's width, one pass:

1. `/harvest evaluate` when evaluation debt is 3 or more. Project gates make it build-class.
2. `/harvest backlog --size <width>`. It lands only on `better`, with its mode recorded.
3. `/deepen --loop <n>` on the subjects `node scripts/librarian-scan.mjs --top 15` ranks worst.
   Most tokens per finding, so it comes last.

Each stops on its own saturation rule. **A filler is not a reason to spend the cap**: if all three
saturate, wait with long wakeups and say so. An idle box beats a padded corpus.

## Failure modes

| Happens | Do |
| --- | --- |
| Terminal dies or session compacts | `/shift` resumes from `.ai/shift/` and `git log`; re-read before acting. |
| Reboot | Board claims reap at 45 min. Re-claim per cluster on resume. |
| Pressure fires | Width 0, no new seats, next wake re-senses. Log which string fired. |
| Canary over 1.3x | Note the seat count and the ratio. It is the only measurement of this mixed load, so never smooth it. |
| YouTube 429 | `shift-plan` backs off and records `throttled`; filler continues. |
| Video has no captions | `no-transcript`, keeps its place in the plan by metadata. No local transcription in v1. |
| Disk under 100 GB | `disk` pressure stops dispatch. The janitor shortens worktree life at that point, so finish or park worktrees. |
| Red gate in a project | Hold there, no push. Inherited red is reported against the base, not fixed in passing. |

## Never

- Never touch ComfyUI beyond GET and queueing a proof at idle. Never `/free`.
- Never read `memory.used` or `vram_free` as idle or headroom. They read 51 GB on an idle card.
- Never treat a null sensor reading as a low one.
- Never write banked material to temp or the scratch root: the janitor reaps them.
- Never rewrite `.ai/.youtube-intake.local.md`. It is the operator's file.
- Never mine a plan the operator has not approved.
- Never decline on the operator's behalf.
- Never count a video as a voice.
- Never force-push, `--no-verify`, or `git add -A`.

## Reflection

Write `LESSONS.md` entries against the version used, from reports and real runs only. The first
real overnight run owes a lesson on every starting number in `DEFAULTS`
(`scripts/lib/shift-policy.mjs`): each is a guess until the canary and the reports say otherwise.
Run `node scripts/log-run.mjs --skill shift ...` per day of a shift, per the skill-reflection
contract. Never read run logs during a run.
