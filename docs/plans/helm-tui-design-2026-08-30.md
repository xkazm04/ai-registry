# Helm — chat-driven TUI for dispatching Claude Code CLI sessions

> Design doc, 2026-08-30. Stack decided by operator: **OpenTUI + Bun**, new sibling repo, dispatch target = **Claude Code CLI sessions with requirements** (fleet doctrine, not persona agents). Working name `helm` — rename freely.

## 1. What it is

A superlightweight terminal app: one chat surface, backed by an LLM engine (Claude Code CLI by default, other providers via a thin adapter), from which the operator **dispatches and oversees Claude Code CLI sessions** — each dispatched with explicit requirements (cwd, task, model, effort, permissions, name). The left rail is the live thread overview; the main pane is the focused thread's chat stream, composed of custom React components (tool cards, question cards, dispatch cards), not raw text.

It is the terminal-native sibling of Personas' Fleet plugin (`personas/docs/features/plugins/dev tools/fleet.md`), reusing its hard-won doctrine while staying independent of the desktop app.

## 2. Stack

| Layer | Choice | Notes |
|---|---|---|
| Runtime | **Bun ≥ 1.3** | OpenTUI's first-class runtime; Node path is experimental (`--experimental-ffi`) |
| TUI | **`@opentui/core` + `@opentui/react`** (pin exact 0.x versions) | Zig native renderer, flexbox, scroll boxes, mouse. Production-proven in opencode. 0.x churn → wrap all primitives in our own `ui/` layer so upgrades touch one file |
| Engine (default) | **Direct `claude` CLI spawn** — headless lane: `claude -p --input-format stream-json --output-format stream-json --verbose --include-partial-messages --session-id <uuid>` | NOT the Agent SDK: the operator's decision is CLI dispatch per fleet doctrine; direct spawn keeps subscription auth and matches fleet.md's invocation gotchas |
| Other providers | **Vercel AI SDK v6** (`ai`) | Plain-API chat threads (OpenAI, Gemini, OpenRouter…). Normalized streaming parts map 1:1 onto chat components |
| Persistence | JSON file registry (`~/.helm/registry.json`) + Claude's own `~/.claude/projects/**.jsonl` transcripts | No database. Transcripts are already durable; we persist only session rows |
| Repo | New sibling: `C:\Users\mkdol\dolla\helm` | Bun workspace; consumes ai-registry knowledge via `.ai/manifest.yaml` + `link-registry.mjs` later |

## 3. Architecture

```
helm/
  packages/
    core/        # zero-UI engine — testable headless
      dispatch.ts        # DispatchSpec -> spawn; argv builder
      registry.ts        # SessionRegistry: rows, state machine, durable JSON
      stream.ts          # stream-json NDJSON parser -> typed events
      transcripts.ts     # ~/.claude/projects watcher + incremental rollup
      providers/         # claude-cli.ts, ai-sdk.ts (Vercel), types.ts
    tui/         # OpenTUI React app
      ui/                # our wrapper over @opentui primitives (churn shield)
      components/        # chat-stream component registry (see §6)
      screens/           # ThreadsRail, ChatView, OverviewGrid, DispatchForm
  bin: helm              # `helm` (TUI) · `helm dispatch --cwd X "task"` · `helm ls`
```

### DispatchSpec (the "requirements")

```ts
type DispatchSpec = {
  cwd: string;              // @project typeahead resolves via ai-registry projects.json
  task: string;             // initial prompt (stdin as first stream-json user message)
  name?: string;            // -> `claude --name` (cli_safe_label rules from fleet)
  model?: string;           // --model
  effort?: 'low'|'medium'|'high'|'xhigh';   // --effort
  permissionMode?: string;  // --permission-mode (default acceptEdits; never default to skip-permissions)
  allowedTools?: string[];  // --allowedTools
  skill?: string;           // prepends `/skill-name` to the task
  count?: number;           // parallel copies (disambiguated names, distinct session ids)
};
```

## 4. Doctrine adopted from fleet.md (and what we deliberately drop)

**Adopt:**
- **Deterministic binding.** Every spawn passes `--session-id <uuid>` on argv and pre-binds the registry row. Transcript is the known `<uuid>.jsonl`; N concurrent sessions in one cwd never cross-bind. (fleet.md `pty.rs` lesson.)
- **Headless lane as primary.** `-p` + bidirectional stream-json: structured events instead of vt100 scraping, ~zero idle cost, no ConPTY, and replies are stream-json user messages — the entire confirmed-submit / paste-vs-typed-Enter problem class **does not exist** in this lane. If helm exits, the child's stdin closes and `claude -p` ends after the in-flight turn — no orphans.
- **State machine, simplified** (signals: stream-json events > transcript growth > inactivity ticker):
  `Spawning → Idle` (system/init) `→ Running` (assistant/tool events) `→ AwaitingInput` (question/permission request) `→ Idle` (result) `→ Finished` (`FLEET:DONE` marker or Done classification) `→ Stale` (flat 6 min) `→ Exited`. Same color/label palette as fleet (`fleetStateMeta.ts`) so both surfaces read identically.
- **`FLEET:DONE — <summary>` / `FLEET:NEXT — <step>` machine protocol.** Parse markers from the result recap; DONE parks `Finished` (teal, wants nothing), NEXT offers a one-key "proceed" chip in the thread. The repo-side contract already spreads via CLAUDE.md (first adopter `pof`).
- **Env hygiene + binary resolution.** Strip `ANTHROPIC_API_KEY` / `ANTHROPIC_AUTH_TOKEN` / `ANTHROPIC_BASE_URL` from the child env to force subscription auth; resolve the real `claude.exe` on Windows (fleet's `cli_process.rs` contract).
- **Hibernate/wake.** Kill process, keep `{session_id, cwd}`, `claude --resume <id>` to wake. Less urgent than in fleet (headless idle ≈ free) but needed for the interactive lane later.
- **Incremental transcript rollup.** Fold only appended bytes into per-session `{tokens, tools, files touched, turns, last_context_tokens}`; render as an insights strip + context pill (green→amber→red).
- **External-session visibility.** Watch `~/.claude/projects/**/*.jsonl` (7-day window) so sessions launched outside helm appear in the overview, read-only, with the same rollup.

**Drop (v1):**
- **No lifecycle hooks.** Fleet installs hooks into `~/.claude/settings.json` with an HTTP receiver — on this machine those are Personas-owned; a second installer would fight it. The headless lane gives us events without hooks; external sessions are covered by the JSONL watcher (coarser, acceptable).
- **No PTY / xterm embedding in v1.** Interactive attach ("open this thread as a real terminal") is v3; until then, "attach" = print `claude --resume <id>` for the operator to run in their own terminal.
- **No autonomy machine.** No Athena-style batched assessment, mechanical answering, doze economics. Helm is operator-driven; the chat surface *is* the assessment loop.
- **Never `--dangerously-skip-permissions` by default.** Permission mode is an explicit dispatch requirement.

**Coexistence note:** Personas Fleet and helm both watch the same transcript dir and spawn the same CLI. That's fine — helm-spawned sessions will simply also appear in the Fleet grid via its watcher. Neither owns the other's processes.

## 5. UI design

```
┌ threads ──────────┬─ helm · gravity ─ ctx ▮▮▯ 41k ────────────────┐
│ ● gravity         │  ⏺ you  Fix the flaky retry test…             │
│   athena-writer ✔ │  ⏺ claude                                     │
│ ◐ personas        │    ┌ tool · Bash ────────────── 2.1s ┐        │
│   fix-retry ▶     │    │ bun test retry.test.ts  ✓ 12/12 │        │
│ ◌ pof             │    └──────────────────────────────────┘       │
│   docs-pass ⏸     │  streamed text with markdown…                 │
│                   │  ┌ question ───────────────────────┐          │
│ [n]ew [g]rid      │  │ Which branch?  ▸ main  ○ dev    │          │
│                   │  └───────────────── enter=answer ──┘          │
├───────────────────┴───────────────────────────────────────────────┤
│ > /dispatch @gravity --model sonnet "run the flaky suite"     ⏎   │
└───────────────────────────────────────────────────────────────────┘
```

- **Left rail** — threads grouped by project, state badge + name (`name ?? title ?? projectLabel`), fleet palette. Hotkeys mirror fleet: `n` next-awaiting, `↑/↓` focus, `/` search, `g` overview grid, `?` help.
- **Chat view** — the focused thread's event stream rendered through the component registry (§6). Header carries the context pill and cost-to-date from `result` events.
- **Composer** — one input, three grammars: plain text (reply to focused thread), `/` commands (`/dispatch`, `/model`, `/effort`, `/kill`, `/wake`, `/broadcast`), `@` project typeahead resolved from ai-registry `projects.json` + `.machine.local.json` (same resolver contract as `scripts/lib/projects.mjs`).
- **Dispatch** — inline via `/dispatch @cwd [flags] "task"`, or `n` opens a small form (cwd, task, model chips, effort chips, permission mode, count). Mirrors fleet's Quick Dispatch composer.
- **Overview grid** (`g`) — all sessions incl. external: state, name, cwd, tokens, files touched, age. Enter focuses; `b` broadcast-to-awaiting.

## 6. Custom component composability (requirement a)

The chat stream is a list of typed events; rendering is a **registry, not a switch**:

```tsx
registerChatComponent('tool_use:Bash', BashCard);
registerChatComponent('question', QuestionCard);      // selectable; answer -> stream-json user message
registerChatComponent('dispatch', DispatchCard);      // spec + live state of the spawned child
registerChatComponent('result', CostFooter);
registerChatComponent('markdown', MarkdownBlock);     // default text renderer
```

Components are ordinary OpenTUI React components (`<box>`, `<text>`, `<scrollbox>`), so composing a new widget = writing a React component and registering a matcher. Unknown event kinds fall back to a raw-JSON collapsible. This is the extension surface for later ideas (diff viewers, test-run meters, registry-skill pickers).

## 7. Risks & spikes (do these before any real build)

| # | Spike | Why |
|---|---|---|
| S1 | OpenTUI hello-world on **Windows Terminal + Bun**: scrollbox, input, resize, mouse | The one unverified stack assumption (Zig core on win32; docs claim x64 support). If it fails → fallback is Ink v6, same architecture, only `tui/ui/` changes |
| S2 | Headless round-trip: dispatch `claude -p` bidirectional stream-json, drive a turn, verify **how AskUserQuestion + permission requests surface** in `-p` mode and whether they're answerable via stream-json control messages | Determines whether QuestionCard works in the headless lane or blocked sessions must escalate to "attach in your terminal" |
| S3 | `--session-id` + `--resume` + `--name` behavior in `-p` mode on this machine's CLI version | Fleet's dated capability matrix warns CLI flags drift; verify before wiring |
| S4 | Registry knowledge check | Read `knowledge/software-engineering/llm-agent/runtime-and-io/agent-cli-transport/claude-code--output-normalization.md` + `streaming-output/*` before writing `stream.ts` — the parsing gotchas are already documented |

Other risks: OpenTUI 0.x API churn (mitigated by the `ui/` wrapper + pinned versions); Bun-on-Windows edge cases (mitigated by the headless-first lane — no ConPTY in v1); long-scrollback perf (OpenTUI scrollbox is native, but cap in-memory events per thread and page older history from the JSONL on demand).

## 8. Phases

- **P0 — Spikes S1–S4** (a day). Go/no-go on OpenTUI-on-Windows; headless question handling answer.
- **P1 — MVP:** one chat thread against a dispatched headless session (streamed markdown + tool cards), `/dispatch`, threads rail with live states, durable registry, kill/exit handling.
- **P2 — Oversight:** overview grid, external-session watcher, incremental rollup + context pill, `FLEET:DONE`/`NEXT`, broadcast-to-awaiting, hibernate/wake.
- **P3 — Breadth:** multi-provider threads via AI SDK v6, component registry as public extension point, interactive PTY attach lane, `helm dispatch` non-TUI CLI for scripting.
