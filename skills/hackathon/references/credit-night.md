# Credit night - `/hackathon --cloud`

A credit night runs the normal hackathon overnight, with one difference: a time-limited Anthropic API
key pays for it. The owner starts it by hand when the credits are in surplus. The host syncs project
and scope with the owner in the evening. Opus 5.5 and Sonnet 5.5 ideate on the key, the owner picks
2-4, and the builders race until 08:00. When the key runs out first, the owner's subscription takes
over, mid-night, without stopping an entry.

"Cloud" names the money, not the machine. The builders are local `claude -p` seats in worktrees,
exactly as in a normal hackathon. **The machine must stay awake until the deadline.**

## The key

- One key for this lane, in the user-level env var **`ANTHROPIC_KEY_LANE_HACKATHON`**. The owner sets
  it in their own terminal: `setx ANTHROPIC_KEY_LANE_HACKATHON "<key>"`. Never put it in
  `ANTHROPIC_API_KEY`: a global key moves every Claude process on the machine onto API billing. `init`
  refuses `--key-env ANTHROPIC_API_KEY`.
- A process started before `setx` cannot see the variable. On Windows, the instrument falls back to
  the user-level value in `HKCU\Environment`, so a host or a detached run from an older shell still
  finds it. The value is never printed and never written to `command.json`.
- The key reaches only a **claude** seat's child, as `ANTHROPIC_API_KEY`. That child never inherits
  `ANTHROPIC_AUTH_TOKEN`, `CLAUDE_CODE_OAUTH_TOKEN`, `ANTHROPIC_BASE_URL`, the Bedrock, Vertex and
  Foundry switches, or the lane variable itself. Codex, Grok, agy and Muse seats bill their own vendor.
  The probe (2026-10-29, claude 2.1.312): with the key, the session init reports
  `apiKeySource=ANTHROPIC_API_KEY`; with every credential stripped, it reports `none`, which is the
  subscription login.

## The handover to the subscription

Every session records `billing`: `key`, `subscription`, `seat` (a non-claude seat) or `plan` (a
night without funding). A key-billed session that fails on the key gets its own outcome:

| Outcome | Seen as | Switches the night |
|---|---|---|
| `credit-exhausted` | "credit balance is too low ... purchase credits" | at once |
| `budget-reached` | `error_max_budget_usd` (the night's `--credit-usd` cap) | at once |
| `key-rejected` | `authentication_error` / invalid x-api-key | at once |
| `key-limited` | a rate limit on the key | on the second in a row for that entry; the first resumes on the key after 2 min |

A switch is recorded once, in `hackathon.json` under `funding.switched`, with its time and reason.
From then on every new claude session in every entry runs on the subscription. A session that was
already running on the key ends on its own when the key fails, and then resumes. Key outcomes
resume to the same deadline. They do not count toward `max_sessions` and never stop an entry. After
the switch, a subscription `seat-limit` stops an entry as it always has, and `--resume-limited`
applies after the vendor's reset.

**`--credit-usd N`** caps what the night spends on the key. Each key session gets
`--max-budget-usd` = what is left of the cap divided by the entries running at once. Ideation
sessions are also capped at $15 each, cap or not. The CLI checks the budget between turns, so a
session overshoots its share by up to one turn (the probe: $0.0019 against a $0.0005 cap). Without
`--credit-usd`, the key pays until the API says it is spent.

## The evening sync - one wave, before any seat runs

This replaces the track questions of step 1 for a credit night. Ask with AskUserQuestion, at most
four questions, and keep the owner's words verbatim:

1. **Project and aim**: the repository and the high-level aim, for example "paypal - a killer feature,
   as a new module or by reshaping an existing one". This becomes the track.
2. **Walls**: what must not break, the data and spend walls, the surfaces allowed.
3. **The night's cap**: a dollar figure, or "until the key is spent". It becomes `--credit-usd`, or
   is left out.
4. **Seats**: the pre-round defaults to `claude:claude-opus-5-5@high,claude:claude-sonnet-5-5@high`.
   Builders are the proposing seat at `xhigh`.

Then write `TRACK.md` (approved by the owner) and the dossier, exactly as in steps 1-2.

## The sequence

```
node <skill>/scripts/hackathon.mjs preflight --entries 4
node <skill>/scripts/hackathon.mjs init --id <slug> --title "<t>" --track TRACK.md --dossier DOSSIER.md \
  --cloud [--credit-usd 300] [--until 08:00] [--base origin/main] [--setup "<cmd>"]... [--gate "<cmd>"]...
node <skill>/scripts/hackathon.mjs ideate --id <slug>            # on the key; prints the spend
node <skill>/scripts/hackathon.mjs board --id <slug> --clusters clusters.json
#   the owner picks 2-4 (packs when more)
node <skill>/scripts/hackathon.mjs shortlist --id <slug> --pick ...
node <skill>/scripts/hackathon.mjs prepare --id <slug>
node <skill>/scripts/hackathon.mjs run --id <slug> --dry-run     # each entry: billed to key, deadline 08:00
```

`--cloud` means `--fund key --key-env ANTHROPIC_KEY_LANE_HACKATHON --until 08:00`. `--hours H`
instead of `--until` keeps a fixed-length clock. `--fund key` with `--key-env <ENV>` funds any
hackathon from another lane's key. The deadline is fixed when the first session starts: the next
08:00 after it. A run that starts more than 16 h before its `--until`, because the night has
passed, stops the entry with that reason. It does not run to the following morning.

**Launch `run` detached and awake.** A host session that ends, or a reaped background shell, must
not end the night:

```powershell
$env:CLAUDE_CODE_DISABLE_BG_SHELL_PRESSURE_REAP = '1'
Start-Process -WindowStyle Minimized powershell -ArgumentList '-NoProfile','-Command',
  "Set-Location '<repo>'; node '<skill>/scripts/hackathon.mjs' run --id <slug> *> '.hackathon/arena/<slug>/run.log'"
```

Before launching, check that the machine will not sleep before the deadline. On Windows, run
`powercfg /query SCHEME_CURRENT SUB_SLEEP STANDBYIDLE`, and ask the owner to set AC sleep to never
for the night if it is not. Then give the owner the deadline and the funding line.

## The morning

`status --id <slug>` prints the funding line: the dollars spent on the key, the cap, and when and why
the night switched. Then collect, run the demo pass and take the verdict as in steps 6-8. Record the
key spend in the registry's lane ledger, so `--lanes` shows what is left:

```sh
node <registry>/skills/cloud-dispatch/scripts/dispatch.mjs --record --lane hackathon --cost <usd> --label "hackathon-<slug>"
```

(The lane needs an entry in the registry's `.ai/credit-lanes.local.json` with
`"keyEnv": "ANTHROPIC_KEY_LANE_HACKATHON"`.)
