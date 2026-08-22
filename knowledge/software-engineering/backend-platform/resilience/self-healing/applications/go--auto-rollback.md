---
layer: application
type: application
subject: self-healing
technique: auto-rollback
stack: go
verified_on: 2026-08-22
---

# Auto-rollback in Argo Rollouts (Go)

How the Argo Rollouts progressive-delivery controller realizes auto-rollback: a metric
verdict from an AnalysisRun becomes an *abort*, and the abort drives traffic weight,
service selectors and replica counts back to the stable ReplicaSet. Citations are against
`argoproj/argo-rollouts` commit `9f8d111` (2026-08-17), development line `1.2.0`
(`VERSION`). This is a reconciliation against an external, world-class tree — not the
consumer repo the sibling `rust` applications cite — so the pin lives here in prose
rather than in `verified_against`, whose contract is a stack runtime version. The mapping:
the "healing change" is a rollout step, the "aggregate error rate" is an AnalysisRun, and
the "undo" is the abort path.

## 1. The verdict is aggregate, not the change's own report card

The gate never asks "did my traffic shift succeed". It asks an AnalysisRun, whose
metrics are operator-authored queries against the *system's* failure stream
(`metricproviders/` — Prometheus, Datadog, CloudWatch, a Job, a webhook), and
`assessRunStatus` collapses them **worst-status-wins**
(`analysis/analysis.go:433-435`; `IsWorse` at `:501-502`): one metric failing fails the
run — the technique's "widest honest signal". The vocabulary is three-valued and each
value carries a *different* consequence
(`analysis/analysis.go:658-687`): `Failed` when `result.Failed > failureLimit`
(`:667-670`), `Inconclusive` when `result.Inconclusive > inconclusiveLimit`
(`:676-679`), `Error` when `result.ConsecutiveError > consecutiveErrorLimit`, default **4**
(`:681-685`; `utils/defaults/defaults.go:35-37`). `Failed` and `Error` abort autonomously;
`Inconclusive` only *pauses* and waits for a human (`rollout/analysis.go:157-158`,
`:377-378`, `:435-436`) — the subject's epistemic ladder at the gate. Note the asymmetry:
a broken *measurement pipeline* (`Error`) aborts, so losing the gate is failing it.

## 2. One abort funnel, four producers

Every rollback source converges on `pauseContext.AddAbort(message)`
(`rollout/pause.go:42-45`), carrying its reason string: blue-green pre/post-promotion
analysis (`rollout/analysis.go:152-171`), canary background analysis (`:376-385`), canary
step analysis (`:434-443`), and one non-metric source — `evaluateProgressDeadlineAbort`,
aborting a stalled update once `spec.progressDeadlineAbort` is set and its deadline has
expired (`rollout/sync.go:823-857`). One funnel is one behaviour with one record, rather than
four paths that drift apart. `CalculateAbortStatus` (`rollout/pause.go:72-89`) persists
`status.abort` and stamps `status.abortedAt` **once** — "preserve the original
timestamp, otherwise we'll cause a reconciliation hot-loop" (`:74-79`) — and that stamp
is the change identifier joining condition, event, metric and analysis runs.

## 3. The undo is stored prior state, not inverse logic

The strongest confirmation here. On abort the blue-green active Service selector is not
computed backwards — `newPodHash = c.rollout.Status.StableRS`
(`rollout/service.go:112-114`), a recorded fact, applied through the same
`switchServiceSelector` every normal promotion uses (`:116`). The canary side matches:
`GetCurrentSetWeight` short-circuits to `0` on `status.abort`
(`utils/replicaset/canary.go:563-565`) — the ladder is not walked in reverse, the weight
is simply its stable end — and `calculateDesiredWeightOnAbortOrStableRollback` returns a
hard `0` unless dynamic stable scaling is on (`rollout/trafficrouting.go:358-366`). The
branch also tears down managed traffic routes and re-points the canary Service at stable
(`rollout/trafficrouting.go:204-220`), and in-flight analysis is cancelled the moment the
abort lands (`rollout/analysis.go:73-83`). Undo cost is bounded: with `dynamicStableScale`
the stable ReplicaSet is scaled back up along the canary's `setWeight` steps in reverse
(`utils/replicaset/canary.go:519-548`) so the rollback does not surge a full replica set
at once — "cheaper and safer than the change", enforced on the compute side — and the
canary is held at scale for `abortScaleDownDelaySeconds`, default 30
(`utils/defaults/defaults.go:31-32`), so a retry pays no cold start.

## 4. Loud, and terminal until a human says otherwise

The abort emits a Kubernetes **Warning** event once, guarded by the condition transition
so it is not re-emitted every reconcile (`rollout/sync.go:879-889`); the same reason
reaches the notification engine as the `on-rollout-aborted` trigger
(`manifests/notifications-install.yaml:259-260`); and the reported phase becomes
`Degraded` while the abort condition stands (`utils/rollout/rolloututil.go:143-144`). Then
it *stays* aborted — nothing clears `status.abort` on its own: the operator runs
`kubectl argo rollouts retry`, literally a status patch of
`{"status":{"abort":false}}` (`pkg/kubectl-argo-rollouts/cmd/retry/retry.go:19`), or
pushes a new pod spec (`resetRolloutStatus`, `rollout/sync.go:1163-1175`). This is the
quarantine rule with (signature, strategy) collapsed to (revision, promote): the machine
will not re-attempt the revision it just undid without human release, so the oscillator
the technique warns about is structurally impossible. Accounting is coarse but present —
the episode terminates into `CompletionStatusAborted` (`rollout/sync.go:531-544`), lands
in `rollout_duration_seconds{status=...}` (`controller/metrics/metrics.go:79-86`) with
the reason in log field `completion_reason` (`:543`).

## Deviations

- **No minimum-volume floor.** `result.Failed > failureLimit`
  (`analysis/analysis.go:667`) counts failed *measurements*; nothing in the controller knows
  how many events sat behind each one, so a window with three requests, two of them errors,
  yields a `Failed` measurement identical to one over thirty thousand. No `minimumSampleSize`
  field exists anywhere in the API — the floor lives only if the operator writes it into the
  provider query. Rule 3 is delegated with no affordance and no default: the highest-value
  gap in an otherwise exemplary tree.
- **The rollback target is never qualified.** `newPodHash = c.rollout.Status.StableRS`
  (`rollout/service.go:113`) treats "stable" as a synonym for "good". Stable means *last
  fully promoted* — true then, possibly false now. Nothing checks that its error rate is
  below the current one or an absolute ceiling, and no case declines to roll back and
  promotes the finding instead; a bad present rolled onto a bad past emits the same event.
- **A failed undo is not a distinct escalation.** When the abort cannot converge there
  is no "stop and page" class; the controller keeps reconciling.
  `utils/replicaset/canary.go:531-538` carries the scar — a documented three-way deadlock
  (weight step-down waits on canary drain, drain waits on stable full scale, scale-up waits
  on weight step-down) fixed by special-casing the weight computation: a real stuck undo,
  patched cycle-by-cycle rather than detected.
- **The undo path can skip the gate that fired.** Inside `spec.rollbackWindow`
  (`rollout/sync.go:1216-1245`) a rollback clears the abort and jumps to the last step
  (`rollout/canary.go:377-383`), and `reconcileAnalysisRuns` cancels analysis outright for
  a fast rollback (`rollout/analysis.go:74-78`). Defensible — the undo should be fast —
  but the return path is the one path never measured.
- **No baseline capture.** The AnalysisRun gets the stable and canary pod hashes as
  template arguments (`utils/analysis/factory.go:26-31`), so a query *can* be written
  canary-vs-stable, but whether it is a comparison is invisible to the controller and no
  pre-change value is recorded. Live control is arguably stronger than a captured
  baseline; the cost is that "what was normal before" is unanswerable from the record.

## Reconciliation summary

Confirmed: aggregate signal, worst-status-wins; a three-valued verdict where confidence
gates autonomy and a broken gate fails closed; one abort funnel with a reason string and
one episode timestamp; undo by stored prior state, not inverse logic; undo cost bounded
below the change's; loud on events, notifications and phase; terminal quarantine.
Deviations: no minimum-volume floor and no API affordance for one; an unqualified rollback
target; no escalation class for a non-converging undo; a fast-rollback path that skips its
own analysis; no captured baseline. Not present by scope, and correctly so: failure
signatures, a strategy ledger, blast-radius tiers — one strategy over one blast radius
(its own Rollout's ReplicaSets and Services) needs none of them.
