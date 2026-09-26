---
layer: application
type: application
subject: time-travel-replay
technique: renderer-reuse
stack: react
verified_on: 2026-09-26
verified_against: react@19
---

# ReplayTerminalPanel — a second terminal over a different layer of the run

Written against `personas` master at `a8cb3aa62` (React `^19.2.6`). The
replay sandbox is a clean instance of the divergence the technique predicts,
and it diverges twice: in the components and in the layer of the record they
are fed.

## Two terminals

The live run renders through `ExecutionTerminal`
(`src/features/agents/sub_executions/components/runner/ExecutionTerminal.tsx`),
which mounts the shared `TerminalBody`
(`src/features/shared/components/terminal/TerminalBody.tsx`) and classifies
lines in a worker after stripping ANSI escapes
(`src/hooks/utility/useTerminalClassification.ts:9-16`). The replay renders
through its own `ReplayTerminalPanel`, with its own JSON pretty-printer
(`highlightLine`, `:9`), its own stick-to-bottom scrolling and no ANSI
stripping. The two share only `classifyLine` and `TERMINAL_STYLE_MAP`, so a
restyle, a search affordance or an escape-handling fix to the live terminal
reaches replay only if someone makes it twice.

## Two layers

The components differ, and so does what they are fed. The engine logs each
raw stdout line before parsing it
(`logger.log(&format!("[STDOUT] {}", line.trim()))`,
`src-tauri/src/engine/runner/mod.rs:2877`), then runs the provider's parser
and emits only its `display` projection to the live view
(`cli_provider.parse_stream_line(&line)`, `:2880`). The live terminal shows
parsed display lines. The record keeps the stream-json wire, and replay shows
that, pretty-printed. Moving replay onto `TerminalBody` would not by itself
make the two agree: the translation between the record and the renderer is
part of the live surface. Either the replay feed runs the provider parser
over the recorded wire, or the record keeps what the live surface showed.
Running the parser brings a version question with it: an old run replayed
through a newer parser needs its producer version stated.

## Effects and forks

No live component is mounted under replay, so there are no notifications,
sounds or unread badges to gate. The one mutation the sandbox offers is
"fork from step N" (`ReplaySandbox.tsx:106`), which builds new input from
the recorded steps and hands it to the re-run flow as a new execution. That
is the technique's rule for "run again from here": a new run, never a mode
of the replay. The replay itself re-calls nothing.
