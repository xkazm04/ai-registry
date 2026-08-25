---
layer: application
type: application
subject: agent-cli-transport
technique: permission-stance-enforcement
stack: codex-cli
verified_on: 2026-08-25
verified_against: codex-cli@0.139.0
---

# Permission stances on the OpenAI Codex CLI

Codex (`codex exec`, non-interactive; v0.139.0 probed live 2026-08-25) is
the one tool in the current fleet whose read-only stance is
**OS-enforced**, which makes it the reference for the technique's
enforcement-class honesty: its read-only promise is a different *kind* of
claim than every competitor's.

## The stance flags

- `-s, --sandbox <read-only|workspace-write|danger-full-access>` — the
  sandbox level. `read-only` is the `readonly-scan` mapping;
  `workspace-write` is the `edit` mapping.
- `-a, --ask-for-approval <untrusted|on-failure|on-request|never>` — the
  approval policy; the tool's own help recommends `never` for
  non-interactive runs (headless has no one to ask). The unattended edit
  posture is `-s workspace-write -a never`.
- `--dangerously-bypass-approvals-and-sandbox` is the full bypass; per the
  technique, a transport never reaches for it.
- Transport hygiene flags verified in the same help: `--skip-git-repo-check`
  (required outside a git repo), `-C/--cd <dir>` for the working root,
  `--ephemeral` to avoid persisting session files, and
  `--ignore-user-config` / `--ignore-rules` to isolate from the operator's
  own configuration.

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

## Adapter notes that ride along with the stance (all [LOCAL] 2026-08-25)

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
