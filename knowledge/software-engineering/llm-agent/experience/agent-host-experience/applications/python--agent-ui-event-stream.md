---
layer: application
type: application
subject: agent-host-experience
technique: agent-ui-event-stream
stack: python
status: forged
verified_on: 2026-11-03
verified_against: python@3.12
---

# Agent-to-interface event stream in a private companion's daemon

The companion (`athena-meta` in the fleet, read at commit
`7000a27c944d10772dacafe05b6840fe601e3551`; daemon on Python 3.12, desktop client on
React 18.3 inside Tauri) runs every turn in a local Python daemon and streams it to the
desktop window as NDJSON over `POST /run`. A second window listens to an app-event SSE
stream on `/events`; a paired phone or PC sends a message through the peer routes and
reads its turn back as SSE with resume. Beside the stream sits the daemon's MCP door,
which outside engines (Claude Code with tools on) call under a per-turn lease. Every
claim of the technique is marked **confirmed**, **deviation** (the standard stays) or
**upward lesson** (the technique was improved from it). Anchors sit one per line.

## One typed vocabulary, pinned across the language boundary

**Confirmed — a closed, typed turn-event union on both sides.** The TypeScript union and
the Python typed dicts name the same event kinds, and a test fails when the two sets
differ.

- `apps/desktop/src/lib/contract.ts:767 "export type TurnEvent ="`
- `src/athena/contracts.py:746 "the turn stream (NDJSON, one object per line)"`
- `tests/test_contract_parity.py:1 "The Python and TypeScript contracts name the same routes, catalog, caps and enum values."`
- `tests/test_contract_parity.py:123 "== _py_event_types(*turn, *stage)"`

**Deviation — the parity test pins kind names, not shapes.** The test extracts only the
`type` literals; a field added to one side's event is not caught. The tool event already
differs: the TypeScript side declares its consent class, while the Python typed dict
cannot name the key and leaves it to a builder function.

- `tests/test_contract_parity.py:113 "def _ts_event_types(name: str) -> set"`
- `apps/desktop/src/lib/contract.ts:770 "name: ActionName; label: string; class: ActionClass"`
- `src/athena/contracts.py:765 "is a Python keyword; the wire key is"`

**Deviation — no state snapshot or delta events, no activity events.** The union carries
start, text deltas, a tool line, a consent card, done and error (plus three stage-only
kinds). A surface that joins mid-run has no snapshot to start from.

- `apps/desktop/src/lib/contract.ts:769 "delta: string"`
- `apps/desktop/src/lib/contract.ts:777 "coverage: Coverage; agreed: boolean"`

## Tool lines

**Deviation — a tool appears only after it finished, with no outcome.** The tool event
is one line emitted after dispatch; there is no start, no arguments, and no succeeded,
refused or failed outcome, so a slow call is invisible while it runs and a refused call
renders like a successful one. A call to an operation the turn was not offered emits no
line at all — the model is told, the user is not.

- `src/athena/turn.py:361 "yield from done.events"`
- `src/athena/turn.py:357 "if name not in offered:"`
- `src/athena/turn.py:358 "NOT_OFFERED})"`

**Confirmed — text and tool lines arrive in the order they happened**, including when an
outside engine runs the tools.

- `src/athena/turn.py:380 "The server's lines and cards arrive through the lease and stream in order with the"`

## Failures before the stream, failures inside it

**Upward lesson — decide every refusal you can before the first byte.** The route takes
the project's turn slot before it starts streaming, so "no engine" and "a busy project"
answer as ordinary refusals with their status; the client throws on those exactly as on
any request. The technique's section on failures before the stream was written from
these lines.

- `src/athena/routes_turn.py:113 "raises the 4xx before any streaming"`
- `src/athena/routes_turn.py:114 "takes the project's turn slot now, so a busy project answers 409"`
- `apps/desktop/src/lib/daemon.ts:155 "a refusal before the stream starts throws a DaemonError"`

## Every surface reads the same story

**Deviation — the second window sees the settled record, not the live run.** The app
event stream carries a turn-finished notice, and a window that did not ask reloads the
conversation on it. It cannot show the tool a run is waiting on, or a consent card the
moment it is filed.

- `src/athena/turn.py:502 "daemon.events.publish("`
- `apps/desktop/src/athena/store.ts:335 "void loadConversation(get().activeId)"`

**Upward lesson — a joinable, resumable stream for the remote device.** The phone path
numbers every event, resumes from the count the reader has, bounds the buffer and counts
the overflow, and ends a quiet stream with an instruction to come back. The technique's
three joinability rules are these lines generalized; the desktop window should get the
same treatment.

- `src/athena/peer/remote.py:17 "are kept;"`
- `src/athena/peer/remote.py:18 "the rest are counted."`
- `src/athena/peer/remote.py:25 "every event from index"`
- `src/athena/peer/remote.py:26 "A stream that carried nothing for"`
- `src/athena/peer/remote.py:94 "MAX_EVENTS = 2000"`
- `src/athena/peer/remote.py:96 "STREAM_QUIET_S = 15.0"`
- `src/athena/peer/remote.py:368 "A turn's stream is the asker's alone"`

**Deviation — the phone's projection launders the tool outcome and drops kinds silently.**
The phone vocabulary is built by one projection function (confirmed), but it sets every
tool line's outcome to success, a value the source event never carried, and returns
nothing for the three stage-only kinds without counting them.

- `src/athena/peer/remote.py:112 "def shape(event: Mapping"`
- `src/athena/peer/remote.py:125 "tool.result"`
- `src/athena/peer/remote.py:143 "return None"`

## A run that asks a person ends

**Confirmed — a consent request is its own event, and the turn ends with "waiting".**
The card is filed in the gate and answered on its own channel, from the window or from a
paired device holding the approve grant.

- `apps/desktop/src/lib/contract.ts:772 "waiting: boolean; cost_usd?: number"`
- `src/athena/peer/remote.py:20 "A turn that filed a card ends too, with"`
- `src/athena/peer/remote.py:411 "lambda r: peer_decide(daemon, r)"`

## Outside engines write into the same stream

**Upward lesson — a per-run credential, distinct from the client's, with a sink into the
stream.** A turn on an engine that calls tools itself mints a lease for that turn,
scoped to the turn's operations, and every tool line and card the engine causes reaches
the turn's stream through the lease's sink; the lease is dropped when the run ends. The
technique's section on outside engines was written from these lines.

- `src/athena/mcp.py:4 "The bearer is a lease, never the daemon's token"`
- `src/athena/mcp.py:6 "mints one for the length of the turn and hears every line and card through the lease's sink"`
- `src/athena/turn.py:385 "daemon.mcp.mint(space_id, ttl=AGENT_LEASE_S, tools=names"`
- `src/athena/turn.py:421 "daemon.mcp.drop(lease.token)"`
- `src/athena/routes_mcp.py:18 "The route that checks its own bearer (a lease), not the daemon's token."`

**Upward lesson (to depth-handoff) — a gated call returns a pending identity, and says
nothing happened.** The door files a card instead of acting and answers with its
identity; the server's instructions and the text result both say it is not done.

- `src/athena/mcp.py:10 "files a card and answers"`
- `src/athena/mcp.py:11 "nothing a caller sends can run it"`
- `src/athena/mcp.py:35 "answers pending: nothing has happened until they sign it, so never say it is done"`
- `src/athena/turn.py:227 "Filed for the person to sign. Nothing has changed yet."`

## A trusted server between the client and the agent

**Confirmed — the run route believes only the user's words and the scope.** Nothing
else a client sends reaches the turn; tools come from the catalog.

- `src/athena/routes_turn.py:104 "text, space_id = data.get("`
- `src/athena/routes_turn.py:106 "send text and space_id as strings"`

**Deviation — the stream credential travels in a URL.** The browser stream reader cannot
set headers, so the daemon token rides in the query string. The daemon is loopback-only,
which bounds the exposure, but the token is long-lived and is the daemon's own, not a
short-lived ticket for the stream.

- `apps/desktop/src/lib/daemon.ts:214 "events?token="`

## The tool door beside the stream

The door is not the stream, but its results feed it, and two defects reach the user
through it.

**Deviation — a write is advertised read-only.** The behavior hints are derived from the
consent class, and an automatic operation is published as read-only; remembering is
automatic and writes the companion's memory.

- `src/athena/mcp.py:115 "auto = CATALOG.get(fn"`
- `src/athena/mcp.py:121 "readOnlyHint"`
- `src/athena/contracts.py:148 "remember"`

**Deviation — refusals answer as successes.** An unknown tool is flagged as an error,
but every refusal the dispatcher returns in prose — an operation not offered here, a
refused argument — is sent with the error flag off.

- `src/athena/mcp.py:177 "There is no such tool here."`
- `src/athena/mcp.py:183 "done.result}"`
- `src/athena/turn.py:220 "That action is not offered here."`

**Deviation — tools only, no views, no change notifications.** The door publishes tools
with no rendered views, and declares no list-change notifications although the offered
set depends on whether the desktop's browser is running — a host that cached the list
keeps offering operations that have gone, or never learns of ones that arrived.

- `src/athena/mcp.py:157 "listChanged"`
- `src/athena/mcp.py:94 "her browser while the desktop runs it"`
