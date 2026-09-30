---
layer: application
type: application
subject: perf-instrumentation
technique: in-flight-visibility
stack: react
status: forged
verified_on: 2026-09-30
verified_against: react@19
applied: unapplied
ab_verdict: unapplied
---

# In-flight visibility: the IPC ring records settled calls only

Read at personas `1d4b497d2` (`src/lib/ipcMetrics.ts`, `src/lib/tauriInvoke.ts`), not run.

The IPC ring described in [react--ring-buffer-metrics](./react--ring-buffer-metrics.md)
is written from the `Promise.race` settlement branches, so an unsettled call
is absent from it. The module's exports are the record, read and summary
functions (`recordIpcCall`, `getIpcRecords`, `computeCommandStats`,
`getGlobalSummary`); none reports an in-flight count or an oldest-open age.
The gauge the technique asks for does not exist here.

The clipping the technique warns about is real in this tree. Calls default to a
90 s deadline, and named blocking mutations (`system_ops_run_now`,
`remote_command_approve`, `project_tracking_run_now`) carry a longer override
because a scan "routinely runs for minutes". For those commands a stuck call
enters the ring only at its deadline, clipped to it, and a p99 pinned at the
override reads as a timeout rather than as the length of the stall. The
in-flight bookkeeping that does exist (`inflightByKey`, `inflightAutoDedup`)
serves dedup and holds promises, not start timestamps, so it is a possible
seam rather than the gauge.

The startable change is a start-stamp map beside the ring keyed by call id and
reduced per command in `computeCommandStats`. Not made: the return condition is
a report of a hang the panel did not show, or the next edit to the panel.
