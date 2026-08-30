---
layer: application
type: application
subject: agent-cli-transport
technique: permission-stance-enforcement
stack: codex-cli
verified_on: 2026-08-30
verified_against: codex-cli@0.139.0
---

# Permission stances on the OpenAI Codex CLI

Codex (`codex exec`, non-interactive; v0.139.0 re-probed live 2026-08-30)
has an **OS-enforced** read-only stance, which makes it a reference for the
technique's enforcement-class honesty: its read-only promise is a different
*kind* of claim than an application-policy one. It is no longer the only
such tool in the fleet — see the Gemini CLI application, whose sandbox is
OS-level too but rests on a runtime that may be absent, which is the
distinction the technique now draws.

## The stance flags — and a position correction

**Corrected 2026-08-30.** An earlier revision of this page prescribed
`-s workspace-write -a never` as the unattended edit posture. On 0.139.0 —
the same version it claimed — that invocation **fails at argument parsing**:

```
$ codex exec -s workspace-write -a never --skip-git-repo-check "hi"
error: unexpected argument '-a' found
```

`-a/--ask-for-approval` is a **top-level** flag, accepted only *before* the
subcommand. This page recorded it from help output without smoking the
combination, which is precisely the failure the technique's three-tier
verification warns about, committed inside the corpus itself. The verified
forms are:

- `-s, --sandbox <read-only|workspace-write|danger-full-access>` — on
  `codex exec`. `read-only` is the `readonly-scan` mapping;
  `workspace-write` is the `edit` mapping.
- Approval policy, in either of two accepted shapes, **not** the one above:
  `codex -a never exec …` (flag before the subcommand), or
  `codex exec -c approval_policy=never …` (config override). Both parse
  clean on 0.139.0. Values are `untrusted|on-failure|on-request|never`, and
  `on-failure` is now marked **DEPRECATED** in the tool's own help.
- `--full-auto` is **accepted by `codex exec` and listed in no help output
  for it** (`codex exec --help | grep -c full-auto` → 0). The inverse of the
  `-a` case, in the same tool on the same day: help text is neither
  necessary nor sufficient evidence that an invocation works.
- `--dangerously-bypass-approvals-and-sandbox` is the full bypass; per the
  technique, a transport never reaches for it. A sibling
  `--dangerously-bypass-hook-trust` now exists beside it.
- Transport hygiene flags verified in the same help: `--skip-git-repo-check`
  (required outside a git repo), `-C/--cd <dir>` for the working root,
  `--add-dir <dir>`, `--ephemeral` to avoid persisting session files,
  `--strict-config`, `--enable/--disable <FEATURE>`, and
  `--ignore-user-config` / `--ignore-rules` to isolate from the operator's
  own configuration.
- **New shape worth watching**: an `exec-server` subcommand
  ("[EXPERIMENTAL] Run the standalone exec-server service") now sits beside
  `exec`. If it matures it is an alternative to this subject's normal
  one-process-per-call shape — a persistent service rather than a spawn per
  request. Not evaluated here; noted as a lead.

## Enforcement class: kernel, not policy

Per 2026 documentation (codex.danielvaughan.com writeups 2026-04→07,
deepwiki openai/codex): macOS enforces via Seatbelt (`sandbox-exec`),
Linux via Landlock LSM + seccomp-bpf, and Windows via a native sandbox
built from restricted tokens, ACLs, and synthetic SIDs. A two-tier Windows
sandbox model ships since roughly v0.142 — the exact version threshold is
approximate (treat as UNVERIFIED against release notes); the machine this
was probed on runs 0.139.0, i.e. the earlier Windows tier. `codex sandbox`
even runs arbitrary commands inside the same sandbox, which makes the
enforcement independently testable. Record the class as OS-enforced on
macOS/Linux, and check the tier before claiming it on Windows.

## Adapter notes that ride along with the stance

All [LOCAL]. Envelope and stream-hygiene rows verified 2026-08-25; the probe
and version rows below were re-run 2026-08-30 and still hold.

- **Envelope**: `--json` emits JSONL events — `thread.started` →
  `turn.started` → `item.completed` → `turn.completed` (usage). The answer
  is the last `item.completed` with `item.type=="agent_message"` →
  `item.text`; there is no single-object mode.
  `-o/--output-last-message <file>` writes just the final message — the
  cleanest channel. `--output-schema <file>` takes a JSON Schema **file**
  (not inline).
- **Stream hygiene**: a Rust `ERROR codex_models_manager::cache: …` line
  appears on stderr before the JSONL (harmless, but fatal to a merged
  parse), and with stdin attached-but-empty the tool prints "Reading
  additional input from stdin..." — close stdin at spawn.
- **Auth/probe**: ChatGPT sign-in bills plan credits; `OPENAI_API_KEY`
  switches to metered — strip it to stay on the seat (direction per
  vendor docs; behavior direction consistent across sources, config key
  names unverified locally). `codex login status` → "Logged in using
  ChatGPT", exit 0 — the zero-token probe. `codex --version` →
  `codex-cli 0.139.0` (prefixed string; parse leniently).
- **No timeout flag** — the ceiling is the host's kill, as everywhere in
  this subject.
