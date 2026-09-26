---
layer: application
type: application
subject: cicd-monitoring
technique: remote-action-consent
stack: rust
status: forged
verified_on: 2026-09-26
verified_against: rust@1
---

# Personas' deploy and rollback commands: a fallback that is a different act

The write half of Personas' GitLab surface lives in the Rust backend: deploying a persona
into a GitLab project, rolling one back from history, and removing it. The React side
holds the confirmation step (`DeploymentHistoryTab.tsx:29,50-55` arms a two-click
rollback confirm and disables it while in flight, `:265,278`). The Rust side decides what
the confirmed click actually does. Read at `900b8f0b4`, toolchain `1.96.1`.

## Where each mechanism lives

| Mechanism | Implementation |
|---|---|
| Primary act | `src-tauri/src/commands/infrastructure/gitlab.rs:302-318` - `create_duo_agent`, a Duo Agent registered in the project |
| Fallback act | `gitlab.rs:320-344` - on `Err(_api_err)`: fetch the project, take its default branch, and `upsert_agents_md` (`src-tauri/src/gitlab/client.rs:421-464`), i.e. PUT, or on 404 POST, a commit to `AGENTS.md` on that branch |
| Same shape in rollback | `gitlab.rs:1291-1325` - `create_duo_agent`, and on `Err(_)` the same `AGENTS.md` commit, from the stored snapshot |
| Local record of the fired act | `gitlab.rs:1327-1349` - a `deployment_history` row with method, agent id, web URL, the deployed prompt and `rolled_back_from` |
| Result names what happened | `GitLabDeployResult { method: "api" \| "agents_md", web_url }`, returned to the caller after the fact |

## Judgment calls worth copying

- **The local audit row answers "who deployed that" without the provider.** Every
  deploy and rollback writes the row, with the prompt as deployed and the id it rolled
  back from. That is the technique's attribution obligation, met on the side that holds
  the credential.
- **The result reports the method that ran.** `method` and `web_url` come back in the
  result, so the surface can at least say afterwards that it wrote a file.

## Gaps against the technique (deviations, reported not fixed)

- **The fallback is a different act, taken on any error.** Both commands match
  `Err(_)`. A 401, a 5xx, a rate-limit refusal, or an instance without the Duo API all
  turn "register an agent" into "commit a file to the default branch". The two acts sit
  on different rungs of the blast ladder: the second changes a protected branch of a
  repository the monitor does not own, is visible to everyone who pulls it, and is not
  removed by `gitlab_undeploy_agent`. The user confirmed the first act. The technique's
  capability-honesty link applies directly: an emulation is opt-in and labelled, and its
  consent step names the real act. The confirmation happens in React before the Rust
  side knows which act it will perform, so the only honest shape is to fail the primary
  act and offer the fallback as its own confirmed action. The trigger should also be
  narrowed to "Duo API not available", not every error.
- **The recorded result is not observed.** The history row is written with the literal
  `"success"` (`gitlab.rs:1336`) straight after the provider call returns. An
  `AGENTS.md` commit is acknowledged when the file lands, and whether GitLab picks it up
  as an agent is never observed. Fire-then-watch has a watch half for the Duo path
  (`gitlab_deployment_status` re-probes the live registry) and none for the file path,
  which that fold labels `file-based`, "a recorded, not probed, fact".
- **The doc comment promises an act the code does not perform.**
  `gitlab_rollback_from_history` is documented as redeploying the snapshot "and
  revokes CI/CD variables from the current deployment" (`gitlab.rs:1251-1254`). No
  revocation call exists in the body (`:1261-1358`). A reader reviewing the rollback's
  blast radius from its comment would believe credentials are withdrawn, and they are
  not.
- **No server-side single-flight.** Nothing in the command stops two concurrent
  rollbacks of the same project; the React disarm is the only guard. For comparison, the
  same backend's own team pipelines re-check a running-pipeline guard inside a
  `BEGIN IMMEDIATE` transaction (`src-tauri/src/commands/teams/teams.rs:231-243`).
  Because each rollback creates a new agent rather than replacing one, a double fire
  leaves two agents.
