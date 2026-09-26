---
layer: application
type: application
subject: cicd-monitoring
technique: failure-drill-down
stack: react
verified_on: 2026-09-26
---

# Failure drill-down — pipeline → jobs → log tail (Personas)

The technique's lazy ladder as the pipeline viewer builds it: a two-pane
list/detail split, per-job expansion, and a scrolled log block — and the
rungs the ladder is missing.

## Where each mechanism lives

| Mechanism | Implementation |
|---|---|
| Rung 1 — collection, rollup only | `gitlabFetchPipelines` → `gitlabListPipelines(projectId, 20)` (`src/stores/slices/system/gitlabSlice.ts:396-404`); rows render status icon + ref + relative time via `PipelineRow.tsx` |
| Rung 2 — jobs on selection | `gitlabSelectPipeline` (`gitlabSlice.ts:423-434`) fetches pipeline detail + job list in one `Promise.all`; nothing is fetched for unselected rows |
| Rung 3 — log on expansion | `JobRow.tsx:87-92` — `handleToggle` calls `gitlabFetchJobLog` only when opening, never on close; log rendered by `JobLogViewer` (`:26-68`) |
| Auto-scroll to the end | `JobLogViewer` `useEffect` (`JobRow.tsx:31-35`) pins `scrollTop = scrollHeight` on every log change — the tail is what the eye lands on |
| Link out to the owning system | `sanitizeExternalUrl(job.webUrl)` / `activePipeline.webUrl` anchors on both rungs (`JobRow.tsx:114-125`, `GitLabPipelineViewer.tsx:153-163`) — the provider keeps the full artifact |
| Same status vocabulary at every rung | `pipelineHelpers.tsx` `statusColor` / `statusBg` / `StatusIcon` shared by `PipelineRow` and `JobRow` |

## Judgment calls worth copying

- **Selection resets the open job** (`GitLabPipelineViewer.tsx:76-79`
  `setExpandedJobId(null)`), so job-expansion state from one pipeline never
  bleeds into another — expansion is scoped to the rung above it.
- **The log request happens at open, not at row mount.** Fifty job rows
  cost zero log fetches until one is opened.

## Gaps against the technique (deviations, reported not fixed)

- **No auto-descent along the failure.** Selecting a failed pipeline
  renders every job collapsed and nothing preselected; the failing job is
  visually red but the user must find and open it. Zero-click triage — the
  technique's default posture — is absent.
- **No stage rung.** Jobs carry `stage` as a label (`JobRow.tsx:109`) but the
  ladder is pipeline → flat job list; stages are neither grouped nor
  collapsible, so a 30-job pipeline is a 30-row scroll.
- **The tail is bounded now, and still unlabeled.** *Corrected 2026-09-26.*
  At the 2026-08-18 read the log came back whole. Since `716fe3bfa8`
  (2026-09-17) the call asks for `tailBytes = 65_536`
  (`src/api/system/gitlab.ts:102`), the Rust command clamps it to 1 MiB
  and cuts it (see the rust application), and `JobLogViewer` paints only
  the last `LOG_PAINT_LINES = 200` lines (`JobRow.tsx:9-20,29`). Transfer
  and display are both bounded. Two silent cuts and no truncation marker:
  a 4 MB log shows 200 lines and nothing says there were more, because
  the backend returns a bare string and the paint cut is local.
- **Empty and unfetchable collapse.** `gitlabFetchJobLog` sets
  `gitlabJobLog: null` then, on failure, only `gitlabError`
  (`gitlabSlice.ts:452-460`) — the log stays `null`, which `JobLogViewer`
  renders as the *loading* skeleton (`JobRow.tsx:37-52`) forever. A 403 or an expired log is a spinner with no end; `log.length ===
  0` ("no log output") is reachable only on success. Three states, one
  rendering for two of them.
- **One log slot for all jobs.** `gitlabJobLog` is a single store field
  (`gitlabSlice.ts:68`); expanding job B while job A's fetch is in flight
  races the two responses into the same slot, and every `JobRow` reads the
  same `jobLog` regardless of which is expanded (`JobRow.tsx:84`). Identity
  down the ladder stops at the job id — the log is not keyed by it.
- **Refreshing tail: none.** A running job's log is fetched once at open;
  the liveness loop refreshes pipeline + jobs but not the open log, so a
  live tail is a manual re-open.
- **Rungs 1 and 2 are wired to commands that do not exist** — see the
  liveness-scoped-polling application. *Re-read 2026-09-26:* the log rung
  is the exception since 2026-09-17, so the one rung with a working backend
  is reachable only through two rungs without one.
  `gitlab_list_pipelines`, `gitlab_get_pipeline`,
  `gitlab_list_pipeline_jobs` and `gitlab_trigger_pipeline` are still
  `UnregisteredCommand` (`src/lib/commandNames.overrides.ts:17-20`), and
  the selection that would open a job never succeeds.
