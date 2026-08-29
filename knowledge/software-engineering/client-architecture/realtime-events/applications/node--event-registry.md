---
layer: application
type: application
subject: realtime-events
technique: event-registry
stack: node
status: forged
verified_on: 2026-08-29
verified_against: node@24
applied: code
ab_verdict: better
---

# Event registry — what a name-list diff cannot see

*Verified against the project tree at `bf2a1e249`.*

The [event-registry](../techniques/event-registry.md) technique closes with a
sentence that reads like pedantry until you run it: *zero findings from a gate
that scanned zero emit sites is not a pass — the gate asserts it found the emit
sites before it reports them clean.* This tree had the mirrored registry, the
typed payload map, and a real parity gate, and that sentence still cost it a
subscription that has never fired.

## The seam

`src/lib/eventRegistry.ts` is a genuine closed vocabulary: 152 names bound to
payload types, with `typedListen`/`typedEmit` wrappers so a deriving consumer
cannot misspell one. `src-tauri/core/src/events.rs` is its Rust mirror, and
`scripts/check-event-registry.mjs` is the gate — run in CI through
`npm run check:contracts`. Both right answers from the technique's mirroring
section are present in outline: the authority is declared and the parity is
gated rather than trusted.

The gate reads both artifacts, diffs the two name sets, and prints
`Event registry OK (151 Rust events, 152 TypeScript events)`. It never opens a
call site. Two lists can agree perfectly about a vocabulary that is not the
vocabulary the program actually speaks.

## A and B

- **A** — the gate as written: parse `EventName`, parse `events.rs`, diff the
  names, report OK.
- **B** — the same, plus a scan of `src/` for bare `listen(` / `emit(` calls
  with a literal first argument, in files that import `@tauri-apps/api/event`;
  fail if any such name is in neither list, and fail if the scan matched
  nothing at all (a scanner that finds no call sites is broken, and its clean
  report is a lie).

The scan deliberately ignores `bus.emit(...)`: the in-process store bus is a
second vocabulary with a different owner, and folding it in would have made the
finding noise. That distinction is worth 45 findings — the unfiltered first
draft reported 47 hits, of which 38 were store-bus names.

## What was read, and what it said

`node scripts/check-event-registry.mjs`:

- **A**: `Event registry OK (151 Rust events, 152 TypeScript events).` exit 0.
- **B**: exit 1, `9 of 15 literal call sites` off-registry.

Eight of the nine are names whose authority is a private Rust const outside the
mirrored file — `athena://mcp/guidance-request`
(`src-tauri/src/companion/orchestration/mcp/pending.rs:45`),
`athena://orchestration/digest-changed`
(`src-tauri/src/companion/orchestration/mod.rs:25`), `radio:state`
(`src-tauri/src/commands/radio.rs:16`), `dev_tools_standards_scan_status`
(`src-tauri/src/commands/infrastructure/standards_scan.rs:29`, subscribed from
two surfaces), `kb-extraction-progress` (`src-tauri/src/engine/kb_extract.rs:42`).
These are working events. They are simply outside the artifact that answers
"what events exist?", so the registry's own inventory is short by at least five
and the parity gate could never have said so.

The ninth is different. `src/features/onboarding/components/ExecutionStep.tsx:55`
subscribes to `execution-complete`. That string does not appear anywhere in the
Rust tree — not in `events.rs`, not as a private const, not as a literal. The
onboarding step that tells a first-time user their first execution finished is
waiting on a channel no producer writes. It is written carefully: cancelled
flag, handshake race handled, payload typed at the call site. It has never
fired. This is the technique's headline failure — *a subscriber typos a name and
waits forever; both failure modes present identically at runtime as nothing
happening* — sitting in a first-run path, invisible to a gate that was watching
the wrong two files.

The commit leaves the gate red on the branch on purpose. The findings are real
and the repair (folding the private consts into `events.rs`, and deciding what
the onboarding step should actually listen to — `execution-status` fires on
every transition, not only the terminal one) is a separate change with its own
judgment calls.

## The structural fact

The registry's doc comment declared its mirror to be
`src-tauri/src/engine/event_registry.rs`. That path does not exist and, from
the git history's shape, has not for some time; the gate has always diffed
`src-tauri/core/src/events.rs`. So the human-readable statement of the
authority and the machine-checked one had already diverged, in the one file
whose entire job is to be the single answer. A mirror whose declared master
cannot be opened is the "symmetric keep-them-in-sync instruction with no
declared master" the technique warns about, arrived at by decay rather than by
design. The comment is corrected in the same commit.

## What this realization cannot do or prove

- **It only sees literals.** `useRunEventListener.ts:60,83` takes a free-text
  `eventName` prop and calls raw `listen`, and dynamic names are exactly what
  the technique's "producers the compile-time authority cannot reach" section is
  about. The scan cannot resolve them, does not count them, and reporting clean
  while they exist is the same class of half-measurement this change was made
  to fix — one level down.
- **It does not check payloads.** A name in the registry with the wrong shape
  behind it passes. The strong form of the gate ("a payload produced that does
  not satisfy the declared shape") is not implemented here.
- **It cannot find the dead emitter.** The scan reads TypeScript. An event
  *emitted* from Rust that nobody subscribes to, or a registered name no
  producer writes, is invisible to it — `execution-complete` was caught only
  because the subscriber's side is TypeScript. The symmetric check needs a Rust
  emit-site scan that does not exist.
- **It judges nothing about frequency or audience.** Which events cross a
  boundary, which are internal, who else listens — the operational questions the
  technique says a registry earns its keep by answering — are still unanswerable
  from this artifact.
