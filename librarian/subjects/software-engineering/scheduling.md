---
subject: scheduling
domain: software-engineering
last_touched: 2026-09-29
touched_by: intake
dry_streak: 0
---

# scheduling

First touch: [[2026-08-22-5]], external reconcile against `temporalio/temporal`
@ `6805cae` (1.32.0). Gained `go--next-run-computation` (uncovered) — second
stack; single-stack debt cleared. Hint confirmed.

## Open leads (banked, convergence rule applies)

- A third totality outcome: a spec that parses but resolves to nothing within a
  bounded two-tier search (warn threshold, then hard stop with a metric and a
  non-retryable error).
- Jitter must be clamped to the gap to the next nominal time, or it can
  reorder occurrences of one item.
- Canonicalization includes writing the normalized form BACK to storage, so
  preview, enumeration and fire read one representation. (Candidate sibling of
  wave-1's persist-the-verdict — watch for a second sighting.)
- A strong overlap-policy layer may legitimately offer only the schedule
  anchor — name the trade, don't count it as an omission.
- Observed deviation class worth its own lead: a code comment asserting a
  default ("disabled by default") that the shipped config contradicts.

## Cross-subject proposals

- Temporal's OverlapPolicy set + buffer-with-drop-counter → a stronger go
  application for overlap-and-reentrancy in a future wave.
- EventLog + FutureActionTimes + MissedCatchupWindow + BufferDropped → a
  near-complete schedule-observability realization, banked for that technique.

## 2026-09-29 - intake PilotDeck ([[2026-09-29-pilotdeck-agent-os]], run `in-pd-0929`)

New application `node--next-run-computation`: a cron parser whose tests cover leap days and a timezone
and neither daylight-saving rule. Executed: on the fall-back night a daily task fires twice, an hour
apart; on the spring-forward night it is skipped, both exactly the outcomes the technique names as wrong.
The revision-guarded claim and the crash recovery beside it are sound and are catches.

## 2026-10-31 - architecture review

First architecture-review record. All ten documents read, and Temporal anchors spot-checked at the pin.
The DST rules held against cron's own manual, with one missing scope. Three clarify items were applied
in the same pass, so a second record follows against the new bytes. The two applications stay reverify:
the node tree was not reopened, and the Rust consumer's anchors drifted in a module split.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/scheduling",
  "date": "2026-10-31",
  "baseline": "e3f00b8a4",
  "digest": "sha256-b2:cd982b42588a2de5",
  "disposition": "clarify",
  "coverage": "All 10 documents read in full. Load-bearing Temporal anchors spot-checked at 6805cae, DST and missed-run claims checked against cron and Kubernetes primary docs, Rust consumer mechanisms grepped by name; node tree not reopened.",
  "counterexamples": [
    "Temporal skips a nonexistent spring-forward time and fires both copies of a repeated fall-back time. Tests pin both behaviours, so a mature scheduler can deliberately choose the opposite of this subject's DST rules.",
    "A rule like '*/15 * * * *' must fire throughout a repeated fall-back hour. Applying 'first occurrence only' to it would drop an hour of runs, which is why the DST rules are scoped to fixed-time rules.",
    "Kubernetes CronJob bounds missed schedules by refusing to start past 100, not by coalescing: a bound whose overflow behaviour is to halt.",
    "Temporal anchors intervals on an epoch grid plus phase, not per item. It answers stacking with overlap policy (default SKIP) instead of a completion anchor."
  ],
  "sources": [
    {
      "url": "https://github.com/temporalio/temporal/blob/6805cae/service/worker/scheduler/spec.go",
      "result": "Read lines 300-407 at the pinned commit: maxIterations<=0 means unlimited (\"disabled: effectively unlimited\") while the comment says \"Disabled by default (maxIterations == math.MaxInt)\"; jitter clamped by \"maxJitter = min(maxJitter, following.Sub(nominal))\"; nextIntervalTime is \"(((ts-phase)/interval)+1)*interval + phase\". Supports the go application's sections 3, 4 and 8."
    },
    {
      "url": "https://github.com/temporalio/temporal/blob/6805cae/common/dynamicconfig/constants.go",
      "result": "SchedulerSpecMaxIterations default 2*7*24*60*60 (1 209 600) and SchedulerSpecWarnIterations 24*60*60 (86 400). Confirms the deviation the go application records."
    },
    {
      "url": "https://github.com/temporalio/temporal/blob/6805cae/service/worker/scheduler/calendar_test.go",
      "result": "TestCalendarNextDST: \"march 13 has no 2:33:33\" (the next fire is March 14) and \"nov 7 has two 1:33:33s and 1:44:33s\". Confirms both DST deviations as tests pin them."
    },
    {
      "url": "https://github.com/temporalio/temporal/blob/6805cae/chasm/lib/scheduler/scheduler.go",
      "result": "jitterSeed is \"%s-%s\" over NamespaceId and ScheduleId; an unspecified overlap policy resolves to SKIP. Confirms go application sections 4 and 8."
    },
    {
      "url": "https://github.com/cronie-crond/cronie/blob/master/man/cron.8",
      "result": "\"If time was adjusted one hour forward, those jobs that would have run in the interval that has been skipped will be run immediately. Conversely, if time was adjusted backward, running the same job twice is avoided.\" This supports both DST rules in next-run-computation. It also scopes them: \"This only applies to jobs that run at a specific time and jobs that run with a granularity greater than one hour. Jobs that run more frequently are scheduled normally.\" The technique lacked that scope."
    },
    {
      "url": "https://manpages.debian.org/bookworm/cron/cron.8.en.html",
      "result": "Debian cron says the same: skipped-time jobs \"will be run soon after the change\" and jobs in repeated time \"will not be re-run\". Jobs with wildcards in the hour or minute field are run on the new time immediately."
    },
    {
      "url": "https://github.com/kubernetes/website/blob/main/content/en/docs/concepts/workloads/controllers/cron-jobs.md",
      "result": "\"If there are more than 100 missed schedules, then it does not start the Job and logs the error.\" This supports missed-run-semantics on bounding replay. It is also a counterexample: past the bound the controller refuses to run, where the technique coalesces."
    },
    {
      "url": "https://docs.rs/tokio/latest/tokio/task/struct.JoinHandle.html",
      "result": "\"A JoinHandle detaches the associated task when it is dropped\". Supports overlap-and-reentrancy step 6 and the rust application's generation-counter rationale."
    },
    {
      "source": "Personas checkout (rust application's consumer), read only",
      "result": "The mechanisms are still present: schedule_overlap_active with its fail-open comment, previous_run_active, try_begin_start, stuck_reap_seen, mark_triggered and advance_schedule_pointer. But background.rs is now split into engine/background/ modules, part of it moved into an extracted engine crate, and triggers.rs into triggers/scheduling.rs. Every file:line anchor in the application has drifted."
    },
    {
      "source": "node application's tree (commit ae87280a)",
      "result": "Not reopened and not re-executed. The UTC arithmetic in its table was checked and is consistent with America/New_York on 2026-11-01 and 2026-03-08."
    }
  ],
  "documents": {
    "scheduling.md": {
      "disposition": "clarify",
      "reason": "Reconciliation-loop stance, trigger taxonomy and restart contract are sound. Internal inconsistency: advance-before-dispatch is stated as unconditional ('at most one lost run'), yet the same document says multiplicity is chosen per item as at-most-once or at-least-once. Name advance-before-dispatch as the at-most-once choice and say how an at-least-once item recovers."
    },
    "techniques/next-run-computation.md": {
      "disposition": "clarify",
      "reason": "Both DST rules match cronie and Debian cron. The primary source scopes them to fixed-time jobs, and the technique applies them to every calendar rule. Open leads (third totality outcome, jitter clamp, canonical write-back) stay banked under the convergence rule: they have one sighting each."
    },
    "techniques/missed-run-semantics.md": {
      "disposition": "keep",
      "reason": "Three policies, claim-before-compute and the replayable-vs-consumed skip distinction are coherent. Kubernetes' 100-missed-schedule halt corroborates that unbounded replay must be bounded."
    },
    "techniques/overlap-and-reentrancy.md": {
      "disposition": "keep",
      "reason": "Policy menu, claims with identity and a named reaper, generation counter and fail-direction rule are coherent. Tokio docs confirm the drop-detaches premise of step 6."
    },
    "techniques/trigger-matching.md": {
      "disposition": "clarify",
      "reason": "Step 4's heading says filters 'fail closed', and its body then leaves suppress-vs-force undecided. State fail-closed as the default and forcing as a documented per-subscription choice."
    },
    "techniques/cooldown-and-debounce.md": {
      "disposition": "keep",
      "reason": "Shapes are distinct and compose. The state-predicate fifth shape and the count-carries-predicate rule are sound. No unstable external claim."
    },
    "techniques/schedule-observability.md": {
      "disposition": "keep",
      "reason": "Four surfaces, the three-silences distinction and the read-path rule (the laws link resolves) are coherent. No unstable external claim."
    },
    "applications/go--next-run-computation.md": {
      "disposition": "keep",
      "reason": "Spot-checked at the pinned commit: compute-limit comment vs default, jitter seed and clamp, interval grid formula, DST tests, day-of-month rollover and SKIP default all match. verified_on left unchanged because not every anchor was re-checked."
    },
    "applications/node--next-run-computation.md": {
      "disposition": "reverify",
      "reason": "Dated executed account in a third-party tree that was not reopened here. Its UTC table is arithmetically consistent. Re-execution needs the tree at ae87280a. The pre-existing verified_against field was left as found."
    },
    "applications/rust--overlap-and-reentrancy.md": {
      "disposition": "reverify",
      "reason": "Every mechanism the application describes is still present in the consumer, but all file:line anchors drifted: background.rs was split into engine/background/ modules and an extracted engine crate, and triggers.rs became triggers/scheduling.rs. Re-anchoring needs a read of the current tree, then a new verified_on."
    }
  }
}
```

Applied the three clarify items (golden path, next-run-computation, trigger-matching) and re-recorded.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/scheduling",
  "date": "2026-10-31",
  "baseline": "e3f00b8a4",
  "digest": "sha256-b2:f19e6de214b49bc8",
  "disposition": "reverify",
  "coverage": "Re-record after applying the three clarify items above. Techniques and golden path are now keep. The two applications remain reverify for the evidence reasons stated.",
  "counterexamples": [
    "Temporal skips a nonexistent spring-forward time and fires both copies of a repeated fall-back time. Tests pin both behaviours, so a mature scheduler can deliberately choose the opposite of this subject's DST rules.",
    "A rule like '*/15 * * * *' must fire throughout a repeated fall-back hour. Applying 'first occurrence only' to it would drop an hour of runs, which is why the DST rules are scoped to fixed-time rules.",
    "Kubernetes CronJob bounds missed schedules by refusing to start past 100, not by coalescing: a bound whose overflow behaviour is to halt.",
    "Temporal anchors intervals on an epoch grid plus phase, not per item. It answers stacking with overlap policy (default SKIP) instead of a completion anchor."
  ],
  "sources": [
    {
      "url": "https://github.com/temporalio/temporal/blob/6805cae/service/worker/scheduler/spec.go",
      "result": "Read lines 300-407 at the pinned commit: maxIterations<=0 means unlimited (\"disabled: effectively unlimited\") while the comment says \"Disabled by default (maxIterations == math.MaxInt)\"; jitter clamped by \"maxJitter = min(maxJitter, following.Sub(nominal))\"; nextIntervalTime is \"(((ts-phase)/interval)+1)*interval + phase\". Supports the go application's sections 3, 4 and 8."
    },
    {
      "url": "https://github.com/temporalio/temporal/blob/6805cae/common/dynamicconfig/constants.go",
      "result": "SchedulerSpecMaxIterations default 2*7*24*60*60 (1 209 600) and SchedulerSpecWarnIterations 24*60*60 (86 400). Confirms the deviation the go application records."
    },
    {
      "url": "https://github.com/temporalio/temporal/blob/6805cae/service/worker/scheduler/calendar_test.go",
      "result": "TestCalendarNextDST: \"march 13 has no 2:33:33\" (the next fire is March 14) and \"nov 7 has two 1:33:33s and 1:44:33s\". Confirms both DST deviations as tests pin them."
    },
    {
      "url": "https://github.com/temporalio/temporal/blob/6805cae/chasm/lib/scheduler/scheduler.go",
      "result": "jitterSeed is \"%s-%s\" over NamespaceId and ScheduleId; an unspecified overlap policy resolves to SKIP. Confirms go application sections 4 and 8."
    },
    {
      "url": "https://github.com/cronie-crond/cronie/blob/master/man/cron.8",
      "result": "\"If time was adjusted one hour forward, those jobs that would have run in the interval that has been skipped will be run immediately. Conversely, if time was adjusted backward, running the same job twice is avoided.\" This supports both DST rules in next-run-computation. It also scopes them: \"This only applies to jobs that run at a specific time and jobs that run with a granularity greater than one hour. Jobs that run more frequently are scheduled normally.\" The technique lacked that scope."
    },
    {
      "url": "https://manpages.debian.org/bookworm/cron/cron.8.en.html",
      "result": "Debian cron says the same: skipped-time jobs \"will be run soon after the change\" and jobs in repeated time \"will not be re-run\". Jobs with wildcards in the hour or minute field are run on the new time immediately."
    },
    {
      "url": "https://github.com/kubernetes/website/blob/main/content/en/docs/concepts/workloads/controllers/cron-jobs.md",
      "result": "\"If there are more than 100 missed schedules, then it does not start the Job and logs the error.\" This supports missed-run-semantics on bounding replay. It is also a counterexample: past the bound the controller refuses to run, where the technique coalesces."
    },
    {
      "url": "https://docs.rs/tokio/latest/tokio/task/struct.JoinHandle.html",
      "result": "\"A JoinHandle detaches the associated task when it is dropped\". Supports overlap-and-reentrancy step 6 and the rust application's generation-counter rationale."
    },
    {
      "source": "Personas checkout (rust application's consumer), read only",
      "result": "The mechanisms are still present: schedule_overlap_active with its fail-open comment, previous_run_active, try_begin_start, stuck_reap_seen, mark_triggered and advance_schedule_pointer. But background.rs is now split into engine/background/ modules, part of it moved into an extracted engine crate, and triggers.rs into triggers/scheduling.rs. Every file:line anchor in the application has drifted."
    },
    {
      "source": "node application's tree (commit ae87280a)",
      "result": "Not reopened and not re-executed. The UTC arithmetic in its table was checked and is consistent with America/New_York on 2026-11-01 and 2026-03-08."
    }
  ],
  "documents": {
    "scheduling.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: advance-before-dispatch named as the at-most-once choice; at-least-once items re-dispatch recorded-but-unacknowledged runs from the startup sweep."
    },
    "techniques/next-run-computation.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: DST transition rules scoped to fixed wall-clock-time rules; hourly-or-finer rules run on elapsed time (cronie/Debian cron line). Open leads remain banked."
    },
    "techniques/missed-run-semantics.md": {
      "disposition": "keep",
      "reason": "Three policies, claim-before-compute and the replayable-vs-consumed skip distinction are coherent. Kubernetes' 100-missed-schedule halt corroborates that unbounded replay must be bounded."
    },
    "techniques/overlap-and-reentrancy.md": {
      "disposition": "keep",
      "reason": "Policy menu, claims with identity and a named reaper, generation counter and fail-direction rule are coherent. Tokio docs confirm the drop-detaches premise of step 6."
    },
    "techniques/trigger-matching.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: step 4 now states fail-closed (suppress) as the default and forcing as a documented per-subscription choice."
    },
    "techniques/cooldown-and-debounce.md": {
      "disposition": "keep",
      "reason": "Shapes are distinct and compose. The state-predicate fifth shape and the count-carries-predicate rule are sound. No unstable external claim."
    },
    "techniques/schedule-observability.md": {
      "disposition": "keep",
      "reason": "Four surfaces, the three-silences distinction and the read-path rule (the laws link resolves) are coherent. No unstable external claim."
    },
    "applications/go--next-run-computation.md": {
      "disposition": "keep",
      "reason": "Spot-checked at the pinned commit: compute-limit comment vs default, jitter seed and clamp, interval grid formula, DST tests, day-of-month rollover and SKIP default all match. verified_on left unchanged because not every anchor was re-checked."
    },
    "applications/node--next-run-computation.md": {
      "disposition": "reverify",
      "reason": "Dated executed account in a third-party tree that was not reopened here. Its UTC table is arithmetically consistent. Re-execution needs the tree at ae87280a. The pre-existing verified_against field was left as found."
    },
    "applications/rust--overlap-and-reentrancy.md": {
      "disposition": "reverify",
      "reason": "Every mechanism the application describes is still present in the consumer, but all file:line anchors drifted: background.rs was split into engine/background/ modules and an extracted engine crate, and triggers.rs became triggers/scheduling.rs. Re-anchoring needs a read of the current tree, then a new verified_on."
    }
  }
}
```

## 2026-10-31 - rust application re-anchored

The rust application's anchors were re-read in the Personas checkout at `61029d7ae0` and moved to the
split modules. All mechanisms are still present, and four changes are recorded as dated notes. It is
now keep. The node application stays reverify.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/scheduling",
  "date": "2026-10-31",
  "baseline": "1212e28aa",
  "digest": "sha256-b2:afa4c5a64e9573a6",
  "disposition": "reverify",
  "coverage": "Re-anchor pass on the rust application only: every citation re-read in the Personas checkout at 61029d7ae0 and updated to the current modules (engine/background/ split, extracted engine crate state.rs, triggers/scheduling.rs, subscription/runner.rs). Other documents carried over from the previous record without re-reading.",
  "counterexamples": [
    "Temporal skips a nonexistent spring-forward time and fires both copies of a repeated fall-back time. Tests pin both behaviours, so a mature scheduler can deliberately choose the opposite of this subject's DST rules.",
    "A rule like '*/15 * * * *' must fire throughout a repeated fall-back hour. Applying 'first occurrence only' to it would drop an hour of runs, which is why the DST rules are scoped to fixed-time rules.",
    "Kubernetes CronJob bounds missed schedules by refusing to start past 100, not by coalescing: a bound whose overflow behaviour is to halt.",
    "Temporal anchors intervals on an epoch grid plus phase, not per item. It answers stacking with overlap policy (default SKIP) instead of a completion anchor."
  ],
  "sources": [
    {
      "url": "https://github.com/temporalio/temporal/blob/6805cae/service/worker/scheduler/spec.go",
      "result": "Read lines 300-407 at the pinned commit: maxIterations<=0 means unlimited (\"disabled: effectively unlimited\") while the comment says \"Disabled by default (maxIterations == math.MaxInt)\"; jitter clamped by \"maxJitter = min(maxJitter, following.Sub(nominal))\"; nextIntervalTime is \"(((ts-phase)/interval)+1)*interval + phase\". Supports the go application's sections 3, 4 and 8."
    },
    {
      "url": "https://github.com/temporalio/temporal/blob/6805cae/common/dynamicconfig/constants.go",
      "result": "SchedulerSpecMaxIterations default 2*7*24*60*60 (1 209 600) and SchedulerSpecWarnIterations 24*60*60 (86 400). Confirms the deviation the go application records."
    },
    {
      "url": "https://github.com/temporalio/temporal/blob/6805cae/service/worker/scheduler/calendar_test.go",
      "result": "TestCalendarNextDST: \"march 13 has no 2:33:33\" (the next fire is March 14) and \"nov 7 has two 1:33:33s and 1:44:33s\". Confirms both DST deviations as tests pin them."
    },
    {
      "url": "https://github.com/temporalio/temporal/blob/6805cae/chasm/lib/scheduler/scheduler.go",
      "result": "jitterSeed is \"%s-%s\" over NamespaceId and ScheduleId; an unspecified overlap policy resolves to SKIP. Confirms go application sections 4 and 8."
    },
    {
      "url": "https://github.com/cronie-crond/cronie/blob/master/man/cron.8",
      "result": "\"If time was adjusted one hour forward, those jobs that would have run in the interval that has been skipped will be run immediately. Conversely, if time was adjusted backward, running the same job twice is avoided.\" This supports both DST rules in next-run-computation. It also scopes them: \"This only applies to jobs that run at a specific time and jobs that run with a granularity greater than one hour. Jobs that run more frequently are scheduled normally.\" The technique lacked that scope."
    },
    {
      "url": "https://manpages.debian.org/bookworm/cron/cron.8.en.html",
      "result": "Debian cron says the same: skipped-time jobs \"will be run soon after the change\" and jobs in repeated time \"will not be re-run\". Jobs with wildcards in the hour or minute field are run on the new time immediately."
    },
    {
      "url": "https://github.com/kubernetes/website/blob/main/content/en/docs/concepts/workloads/controllers/cron-jobs.md",
      "result": "\"If there are more than 100 missed schedules, then it does not start the Job and logs the error.\" This supports missed-run-semantics on bounding replay. It is also a counterexample: past the bound the controller refuses to run, where the technique coalesces."
    },
    {
      "url": "https://docs.rs/tokio/latest/tokio/task/struct.JoinHandle.html",
      "result": "\"A JoinHandle detaches the associated task when it is dropped\". Supports overlap-and-reentrancy step 6 and the rust application's generation-counter rationale."
    },
    {
      "source": "node application's tree (commit ae87280a)",
      "result": "Not reopened and not re-executed. The UTC arithmetic in its table was checked and is consistent with America/New_York on 2026-11-01 and 2026-03-08."
    },
    {
      "source": "Personas checkout (rust application's consumer) at 61029d7ae0, read only",
      "result": "All four mechanisms re-read and re-anchored: schedule_overlap_active (scheduler.rs:579-609) and the overlap skip block (:946-967), mark_triggered and advance_schedule_pointer CAS (triggers/scheduling.rs:266-323), backfill claim-before-compute (scheduler.rs:1015-1069), generation counter and try_begin_start (engine crate state.rs:96-174), stop bump (lifecycle.rs:718), run_single generation check (subscription/runner.rs:95-106), stuck_reap_seen and the two-pass reaper (state.rs:85-90, event_bus.rs:122-253). Changes noted in dated notes: fail-open now covers query failure too, the start bump lives inside try_begin_start, run_single adds an engine-leadership gate, and the headless daemon is a second claimant. claim_pending still records no claim timestamp or holder."
    }
  ],
  "documents": {
    "scheduling.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: advance-before-dispatch named as the at-most-once choice; at-least-once items re-dispatch recorded-but-unacknowledged runs from the startup sweep."
    },
    "techniques/next-run-computation.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: DST transition rules scoped to fixed wall-clock-time rules; hourly-or-finer rules run on elapsed time (cronie/Debian cron line). Open leads remain banked."
    },
    "techniques/missed-run-semantics.md": {
      "disposition": "keep",
      "reason": "Three policies, claim-before-compute and the replayable-vs-consumed skip distinction are coherent. Kubernetes' 100-missed-schedule halt corroborates that unbounded replay must be bounded."
    },
    "techniques/overlap-and-reentrancy.md": {
      "disposition": "keep",
      "reason": "Policy menu, claims with identity and a named reaper, generation counter and fail-direction rule are coherent. Tokio docs confirm the drop-detaches premise of step 6."
    },
    "techniques/trigger-matching.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: step 4 now states fail-closed (suppress) as the default and forcing as a documented per-subscription choice."
    },
    "techniques/cooldown-and-debounce.md": {
      "disposition": "keep",
      "reason": "Shapes are distinct and compose. The state-predicate fifth shape and the count-carries-predicate rule are sound. No unstable external claim."
    },
    "techniques/schedule-observability.md": {
      "disposition": "keep",
      "reason": "Four surfaces, the three-silences distinction and the read-path rule (the laws link resolves) are coherent. No unstable external claim."
    },
    "applications/go--next-run-computation.md": {
      "disposition": "keep",
      "reason": "Spot-checked at the pinned commit: compute-limit comment vs default, jitter seed and clamp, interval grid formula, DST tests, day-of-month rollover and SKIP default all match. verified_on left unchanged because not every anchor was re-checked."
    },
    "applications/node--next-run-computation.md": {
      "disposition": "reverify",
      "reason": "Dated executed account in a third-party tree that was not reopened here. Its UTC table is arithmetically consistent. Re-execution needs the tree at ae87280a. The pre-existing verified_against field was left as found."
    },
    "applications/rust--overlap-and-reentrancy.md": {
      "disposition": "keep",
      "reason": "Re-anchored 2026-10-31 at 61029d7ae0: every file:line citation and quote re-read and updated, verified_on moved to 2026-10-31. No mechanism gone; four changes recorded as dated notes in the document."
    }
  }
}
```
