# Managed Agents night sweep

A Claude Managed Agents deployment that, every night at 01:00 Europe/Prague, sweeps one context
of one repository (scan-sweep STABILIZE lenses: bug, UI correctness, performance), proves one fix
with a test that fails on the base and passes on the branch, and opens one pull request. It never
pushes the default branch and never merges. Opus 5.5 at effort high; each run is capped at $15
list price. `agents/sweep/` holds repo-agnostic `ant apply` templates (agent with the night method
as its system prompt, environment, vault container, ledger store with its seed in `data/`, and
the deployment); one instance per repository fills them. Each file's header names its doc source.

## Prerequisites, in order

1. The `ant` CLI (1.34.0 or later for vaults): `go install github.com/anthropics/anthropic-cli/v2/cmd/ant@latest`.
2. A fine-grained GitHub PAT on the target repository only: Contents read and write, Pull requests
   read and write, Metadata read. Mint one for this agent; do not reuse a token.
3. The lane's key in `ANTHROPIC_KEY_LANE_CLOUD`, mapped to `ANTHROPIC_API_KEY` only for `ant`.
   PowerShell environment variables are process-wide, so the wrapper restores the old value:

   ```powershell
   function ant-cloud { $p = $env:ANTHROPIC_API_KEY; $env:ANTHROPIC_API_KEY = $env:ANTHROPIC_KEY_LANE_CLOUD; try { ant @args } finally { $env:ANTHROPIC_API_KEY = $p } }
   ```

   Every `ant` below is `ant-cloud`. Read the organization and workspace from each plan header.

## 1. Instance

Copy `agents/sweep/` to `.ai/cloud-dispatch/managed/<repo>/agents/sweep/` (must be gitignored:
the instance will hold the PAT), rename `deployment.template.yaml` to `deployment-nightly.yaml`,
and fill `<REPO_SLUG>`, `<REPO_URL>` and `<REPO_SETUP>` (the paypal example sits above
`initial_events`). Trim `allowed_hosts` in `environment.yaml` to the hosts this repository needs.
Run every command below from `.ai/cloud-dispatch/managed/<repo>/`; `claude-lock.json` lands there.

## 2. Agent, environment, vault, ledger store

```powershell
$d = 'agents/sweep'
ant-cloud apply --dry-run -v "$d/agent.md" "$d/environment.yaml" "$d/vault.yaml" "$d/memory_store-ledger.yaml"
ant-cloud apply "$d/agent.md" "$d/environment.yaml" "$d/vault.yaml" "$d/memory_store-ledger.yaml"
$lock = Get-Content claude-lock.json -Raw | ConvertFrom-Json
$STORE = $lock.resources."./$d/memory_store-ledger.yaml".id; $VAULT = $lock.resources."./$d/vault.yaml".id
"content: `"@./$d/data/coverage.jsonl`"" | ant-cloud beta:memory-stores:memories create --memory-store-id $STORE --path /coverage.jsonl
ant-cloud beta:memory-stores:memories list --memory-store-id $STORE --view full   # must show the schema line, not a path
```

## 3. Credential (the operator, in a terminal of their own)

```powershell
$s = Read-Host -AsSecureString 'GitHub PAT'
$t = [Runtime.InteropServices.Marshal]::PtrToStringBSTR([Runtime.InteropServices.Marshal]::SecureStringToBSTR($s))
@{ display_name = 'GitHub MCP'; auth = @{ type = 'static_bearer'; mcp_server_url = 'https://api.githubcopilot.com/mcp/'; token = $t } } |
  ConvertTo-Json -Depth 3 | ant-cloud beta:vaults:credentials create --vault-id $VAULT
ant-cloud beta:vaults:credentials list --vault-id $VAULT   # one row, no secret shown
```

Keep `$t` for step 4, then `Remove-Variable s, t`.

## 4. Deployment: apply and pause in one command

Write `$VAULT` into `<VAULT_ID>`, `$STORE` into `<MEMORY_STORE_ID>` and the PAT into `<GITHUB_PAT>`
in `deployment-nightly.yaml`. The PAT stays only in this gitignored file; never commit it, and
never re-apply a copy that still says `<GITHUB_PAT>` (the placeholder would become the token).

```powershell
ant-cloud apply --dry-run -v "$d/deployment-nightly.yaml"
ant-cloud apply "$d/deployment-nightly.yaml"; if ($LASTEXITCODE -eq 0) { $DEP = (Get-Content claude-lock.json -Raw | ConvertFrom-Json).resources."./$d/deployment-nightly.yaml".id; ant-cloud beta:deployments pause --deployment-id $DEP }
```

A deployment is live from creation; pausing in the same command keeps 01:00 from firing first.

## 5. Smoke: one manual run before the schedule

```powershell
ant-cloud beta:deployments run --deployment-id $DEP          # works while paused
$SID = ant-cloud beta:deployment-runs list --deployment-id $DEP --max-items 1 --transform session_id -r
ant-cloud beta:sessions connect $SID                          # watch; Ctrl+C detaches
ant-cloud beta:files list --scope-id $SID --beta managed-agents-2026-04-01   # RESULT.md
```

Pass: toolchain up, gates ran, one PR or a reasoned no-finding, one new ledger line. Blocked host? Fix `environment.yaml`, re-apply.

## 6. Schedule

```powershell
$AGENT = (Get-Content claude-lock.json -Raw | ConvertFrom-Json).resources."./$d/agent.md".id
ant-cloud beta:deployments list --agent-id $AGENT --format jsonl --transform '{id,status,next:schedule.upcoming_runs_at}'
ant-cloud beta:deployments unpause --deployment-id $DEP      # the operator's call, after the smoke
ant-cloud beta:deployments pause --deployment-id $DEP        # reversible; manual runs still allowed
ant-cloud beta:deployments archive --deployment-id $DEP      # terminal: the schedule ends for good
```

Execution is jittered up to 9 minutes after the listed time. Missed nights are not backfilled.

## 7. Each morning: review and record spend

```powershell
ant-cloud beta:deployment-runs list --deployment-id $DEP --max-items 1   # session_id, or error.type
$c = ant-cloud beta:sessions retrieve --session-id $SID --transform usage.list_cost.amount -r   # cents
node skills/cloud-dispatch/scripts/dispatch.mjs --record --lane cloud --cost ($c / 100) --label "night-<repo>-<yyyymmdd>"
```

Run the last line from the registry root. Review the PR diff, not its summary. A session at
`budget_reached` stays idle; raise the cap only on purpose. To stop a run: `user.interrupt`, pause the deployment, rotate the PAT.

## Security checklist (Anthropic guide "Secure your Managed Agents deployment")

| Guide section | This configuration |
|---|---|
| Choose where the agent runs | cloud sandbox |
| Limit the network | `limited`; MCP via `allow_mcp_servers`; toolchain hosts only, no wildcards |
| Keep credentials in vaults | MCP PAT in the vault; repo PAT on the resource, injected by the git proxy; no Claude API key in the sandbox |
| Restrict web search and web fetch | both disabled |
| Approve risky actions | read/glob/grep `always_allow`; bash/write/edit `auto`; GitHub read tools `auto`. **Differs:** `create_pull_request` is `auto`, not the guide's `always_ask` for MCP writes, because nobody answers at 01:00 and a PR is undone by closing it |
| Give the agent the smallest tool set | `default_config.enabled: false`, six built-ins and three GitHub tools enabled |
| Keep untrusted input away from powerful tools | mount only a repository whose writers you trust (its `.claude/skills`, AGENTS.md and CLAUDE.md load as instructions); ledger store is `read_write` because the agent must append |
| Set limits and a way to stop | $15 deployment budget; pause/archive above |
| Offline reviewer / monitoring | **Not set:** no webhooks. The morning review (step 7) is the check |

After step 4, run `/claude-api managed-agents-secure <agent id>` in Claude Code for the live comparison.
