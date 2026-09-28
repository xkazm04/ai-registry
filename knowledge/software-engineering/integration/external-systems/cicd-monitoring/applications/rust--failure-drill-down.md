---
layer: application
type: application
subject: cicd-monitoring
technique: failure-drill-down
stack: rust
status: forged
verified_on: 2026-09-26
verified_against: rust@1
---

# A bounded job-log tail over IPC (Personas): the bound is enforced twice and declared nowhere

Personas is a Tauri desktop app: a React surface over a Rust backend, which alone holds
the GitLab token and makes every provider request. The job-log rung of the drill-down
ladder crosses that boundary, and on 2026-09-17 (`716fe3bfa8`, "page list APIs and paint
chrome before dumps settle") it gained a real backend command. Until then the React
application recorded it as one of five unregistered commands. The other four
(`gitlab_list_pipelines`, `gitlab_get_pipeline`, `gitlab_list_pipeline_jobs`,
`gitlab_trigger_pipeline`) are still listed in `src/lib/commandNames.overrides.ts:17-20`
and appear in no Rust file. So the log tail is now the one rung with a working backend,
under rungs that cannot load. Read at `900b8f0b4`, toolchain pinned by
`rust-toolchain.toml` to `1.96.1`.

## Where each mechanism lives

| Mechanism | Implementation |
|---|---|
| Bound at the IPC edge | `src-tauri/src/commands/infrastructure/gitlab.rs:1231-1248` - `DEFAULT_JOB_LOG_TAIL = 64 KiB`, `MAX_JOB_LOG_TAIL = 1 MiB`, the caller's `tail_bytes` clamped to `1..=1 MiB`. The doc comment names the reason: "expanding a job must not ship the full log over IPC for a 72-tall pane" |
| Tail requested from the provider | `src-tauri/src/gitlab/client.rs:400-418` - `GET /projects/:id/jobs/:job_id/trace` with `Range: bytes=-N`, then `utf8_tail(&text, tail_bytes)` |
| Server-ignores-Range guard | `client.rs:398-399` - "we still slice to `tail_bytes` so a server that ignores Range cannot dump a multi-MB trace over IPC". The slice is unconditional, so the bound holds whether or not the provider honoured the header |
| UTF-8-safe cut | `client.rs:15-24` - `utf8_tail` walks the cut index forward to a char boundary; a byte bound over text never splits a code point |
| Second bound at paint | `src/features/plugins/gitlab/components/JobRow.tsx:9,29` - `LOG_PAINT_LINES = 200`, `tailLines(log, 200)`; the React caller asks for `tailBytes = 65_536` (`src/api/system/gitlab.ts:102`) |
| Empty is its own state | `JobRow.tsx:55-58` - `log.length === 0` renders `no_log_output`, distinct from the `log == null` skeleton (`:37`) |

## Judgment calls worth copying

- **The bound lives where the cost is, and it does not trust the provider.** The Rust
  side asks for a tail and then cuts one anyway. The cut is the guarantee; the Range
  header is only an optimisation. This matters because the provider's side of the
  contract is undocumented (see the gaps).
- **The clamp is at the command, not the client.** A frontend that passes
  `tailBytes: 10_000_000` still gets 1 MiB. The widest caller cannot widen the transfer
  past what the IPC edge was sized for.

## Gaps against the technique (deviations, reported not fixed)

- **The bound is enforced and not declared.** `get_job_trace` returns `String`. Whether
  the text was cut, and from how many bytes, is lost at `client.rs:417`, so no caller can
  render the technique's truncation marker ("last N lines / K bytes - full log at
  source") honestly. The paint side cuts again to 200 lines, silently. A user reading a
  4 MB log sees the last 200 lines with nothing saying there were more. The fix belongs
  in the return type (`{ text, truncated, bytes_total? }`), because only the side that
  cut knows it cut.
- **"GitLab accepts `Range: bytes=-N`" is an unverified claim.** The comment at
  `client.rs:398` states it; GitLab's documented job-log endpoint does not mention range
  requests (see the technique's capability note). When the header is ignored, the whole
  trace crosses the network and only the IPC hop is bounded. The unconditional slice
  keeps that safe, but a desktop polling a running job's log then pays a full transfer
  per refresh.
- **Every error falls back to a second, unranged request.** `client.rs:410-416` matches
  `Err(_)`: a 401, 403 or 404 on the ranged request is retried as a full GET, which fails
  the same way. The right trigger is a 416 (Range Not Satisfiable) or a 200 carrying the
  full body; an auth failure should surface once, as the error it is.
- **Unfetchable still reads as loading.** The Rust command returns a distinct error, but
  `gitlabFetchJobLog` (`src/stores/slices/system/gitlabSlice.ts:452-460`) sets
  `gitlabJobLog: null` and, on failure, only `gitlabError`, so `JobLogViewer` keeps
  rendering the skeleton. The React application's "empty and unfetchable collapse"
  finding survives the new backend: the backend distinguishes the three states, and the
  store folds them into two again.
