---
layer: application
type: application
subject: cicd-monitoring
technique: deployment-history
stack: rust
status: forged
verified_on: 2026-09-26
verified_against: rust@1
---

# Personas' deployment ledger: an append-only log, a live-probe fold, and a removal the fold cannot see

Personas deploys personas as agents into GitLab projects it does not own (the Duo Agent
API, or an `AGENTS.md` file as fallback), then answers "what is deployed where" from the
Rust backend. That question is the technique's current-state-per-environment view, and
the backend builds it from both shapes the technique names: a local append-only run log
and a live probe of the provider. Read at `900b8f0b4` (`src-tauri/`, toolchain pinned to
`1.96.1` by `rust-toolchain.toml`).

## Where each mechanism lives

| Mechanism | Implementation |
|---|---|
| Append-only run log | `src-tauri/db/src/repos/resources/deployment_history.rs:31-73` - `insert` is the only writer (uuid id, server-side `created_at`); no update or delete exists in the module. Each row carries method, result, agent id, the prompt snapshot that was actually deployed, `rolled_back_from`, and `target` |
| One projection for every read | `deployment_history.rs:7-11` - a single `COLUMNS` constant and a name-bound row mapper, so the SELECT and the mapper cannot drift apart |
| Windowed reads, newest first | `list_by_persona_project` / `list_by_project` / `list_all` (`:76-124`, `:225-238`), each with an explicit `LIMIT` |
| Derived current state, recomputed per request | `src-tauri/src/commands/infrastructure/gitlab.rs:445-540` `gitlab_deployment_status` - folds the live Duo Agent list with the newest history row per persona slug. The fold is written out in the doc comment at `:427-441`: live agent means `active`, a history deploy with no live agent means `file-based` or `failed`, and a failed probe means `unknown` |
| Honest unknown when the probe fails | `gitlab.rs:506-538` - api-method deploys become `unknown` ("never a false green"); `file-based` stays, because it was recorded at deploy time rather than probed |
| Rollback reads its snapshot from the log | `gitlab.rs:1274-1289` - the target row's `snapshot_prompt` is redeployed, not the persona's current state |

## Judgment calls worth copying

- **The derivation names its recomputation.** The rule for `active` / `file-based` /
  `failed` / `unknown` sits in a doc comment beside the fold, and the fold is recomputed
  from the log plus one probe on every call. Nothing hand-maintains a "current" column.
  The doc comment records why: it replaced "the dashboard's old 'every row is `active`
  by construction' behaviour".
- **A failed probe degrades to unknown, not to the last answer.** This is the
  capability-honesty rule applied to history: the one fact the monitor recorded itself
  (`file-based`) survives, and the fact it can only get from the provider becomes
  `unknown`.
- **The snapshot travels with the event.** Storing the deployed prompt in the row makes
  rollback a replay of history, and the row is immutable because nothing updates it.

## Gaps against the technique (deviations, reported not fixed)

- **A deliberate removal renders as a failure.** `gitlab_undeploy_agent`
  (`gitlab.rs:543-559`) deletes the live agent and writes no history row. The next
  `gitlab_deployment_status` finds an api-method history row with no live agent and
  labels it `failed` (`:487-493`). The fold names its rule but not its event set:
  undeploy is an event the log never receives, so the derivation cannot tell "removed"
  from "vanished". Per derivation-names-recomputation the fix is on the event side
  (write an `undeployed` row) and not in the fold.
- **A failed history read reads as no history.** `:452-453` -
  `list_by_project(..., 200).unwrap_or_default()`. A database error becomes an empty
  log; when the probe also fails, the command returns `[]`, "nothing deployed", where the
  truth is "unknown". The comment says history is "safe to read even if GitLab is down",
  which is true of GitLab and silent about the database.
- **A window is used as the whole.** `gitlab_rollback_from_history` looks up its target
  in the newest 100 rows of the project (`:1265-1269`). An older deployment the user
  picked from a deeper page returns "Deployment record not found", although the row
  exists. The status fold reads 200 rows, so a persona whose last deploy is older than
  that drops out of the "what is deployed" view entirely. Neither window is stated on the
  surface.
- **The result column is hardcoded.** Every writer passes the literal `"success"`
  (`:356`, `:901`, `:1083`, `:1336`), and a failed deploy returns an error before
  inserting. `get_previous_deployment`'s `deploy_result = 'success'` filter
  (`deployment_history.rs:141`) therefore selects every row. The log records successes
  only, so a streak or a success rate computed from it would be 100% by construction.
