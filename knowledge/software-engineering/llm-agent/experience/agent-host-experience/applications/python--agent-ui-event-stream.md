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
`93a3bea8734b30ec1c26033c1f2fd809a3c48d05`; daemon on Python 3.12, desktop client on
React 18.3 inside Tauri) runs every turn in a local Python daemon and streams it to the
desktop window as NDJSON over `POST /run`. A second window listens to an app-event SSE
stream on `/events`; a paired phone or PC sends a message through the peer routes and
reads its turn back as SSE with resume. Beside the stream sits the daemon's MCP door,
which outside engines (Claude Code with tools on) call under a per-turn lease. Every
claim of the technique is marked **confirmed**, **deviation** (the standard stays) or
**upward lesson** (the technique was improved from it). Anchors sit one per line.

**Revised 2026-11-03.** The earlier version of this application recorded the pre-proof
state at `7000a27c944d10772dacafe05b6840fe601e3551`. Three commits since then
(`6f55ca7`, `71e8632`, `fe266c5`; decision records 0021 to 0023) closed four of its
deviations: refusals now answer as errors, the read-only hint is read from what an
operation writes, a settled turn keeps its parts, and structured answers stream as their
own event. The deviations that remain were re-checked against the new commit.

## One typed vocabulary, pinned across the language boundary

**Confirmed — a closed, typed turn-event union on both sides.** The TypeScript union and
the Python typed dicts name the same event kinds, and a test fails when the two sets
differ. The new structured-answer kind joined both sides and the test in one commit.

- `apps/desktop/src/lib/contract.ts:803 "export type TurnEvent ="`
- `src/athena/contracts.py:790 "the turn stream (NDJSON, one object per line)"`
- `tests/test_contract_parity.py:1 "The Python and TypeScript contracts name the same routes, catalog, caps and enum values."`
- `tests/test_contract_parity.py:124 "_py_event_types(*turn, c.BlocksEvent, *stage)"`

**Deviation (narrowed) — the parity test pins event kind names, not event shapes.** The
settled turn's parts are now pinned key for key, but the stream's events are still
compared by their `type` literals only. The tool event still differs: the TypeScript
side declares its consent class, while the Python typed dict cannot name the key and
leaves it to a builder function.

- `tests/test_contract_parity.py:214 "a settled turn's parts, key for key"`
- `tests/test_contract_parity.py:113 "def _ts_event_types(name: str) -> set"`
- `apps/desktop/src/lib/contract.ts:806 "name: ActionName; label: string; class: ActionClass"`
- `src/athena/contracts.py:809 "is a Python keyword; the wire key is"`

**Deviation — no state snapshot or delta events, no activity events.** The union carries
start, text deltas, a tool line, a consent card, report parts, done and error (plus
three stage-only kinds). A surface that joins mid-run has no snapshot to start from.

- `apps/desktop/src/lib/contract.ts:805 "delta: string"`
- `apps/desktop/src/lib/contract.ts:811 "shown: ShownBlocks"`
- `apps/desktop/src/lib/contract.ts:815 "coverage: Coverage; agreed: boolean"`

## Structured answers are their own event, in place

**Confirmed — a structured part streams as its own kind, in emitted order among the
words, and a total drop still streams.** When the model shows report parts, the turn
carries one event with the parts that passed the door, their computed values, and the
count and reasons of the ones dropped. A call where every part was dropped still
streams its disclosure, and is flagged a refusal.

- `src/athena/contracts.py:818 "report parts she chose to show, in place among her words"`
- `src/athena/report/chat.py:174 "Every part dropped: the disclosure still streams"`
- `tests/test_report_chat.py:161 "def test_the_parts_stream_in_place_and_are_kept_with_the_settled_turn"`

## Tool lines

**Deviation (narrowed) — a tool appears only after it finished, and its outcome is only
in its words.** The dispatcher now knows whether a call was refused, and a failed page
open says "Could not open" where it used to say "Opened". The stream's tool event still
has no outcome field, no start and no arguments, so a slow call is invisible while it
runs and a refused call that streams a line is told apart only by reading its label. A
call to an operation the turn was not offered still emits no line at all.

- `src/athena/contracts.py:929 "def tool_event(name: ActionName, label: str)"`
- `src/athena/browser/actions.py:328 "Could not open"`
- `src/athena/turn.py:408 "yield from done.events"`
- `src/athena/turn.py:404 "if name not in offered:"`
- `src/athena/turn.py:405 "NOT_OFFERED})"`

**Confirmed — text and tool lines arrive in the order they happened**, including when an
outside engine runs the tools.

- `src/athena/turn.py:427 "The server's lines and cards arrive through the lease and stream in order with the"`

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

**Confirmed (closed deviation) — the settled record keeps what the stream showed.** The
daemon watches the turn's events as they pass and stores its text runs, tool lines,
cards and report parts in emitted order; the window replays a stored turn through the
same reducer it feeds live, so a reload draws the turn exactly as it streamed. Turns
stored before parts were kept still read as their text and card.

- `src/athena/turn.py:286 "class _Parts:"`
- `src/athena/turn.py:289 "after a reload exactly as it drew it live"`
- `src/athena/turn.py:553 "parts=seen.parts if design is None else None"`
- `src/athena/store.py:130 "an Athena turn's parts in emitted order"`
- `apps/desktop/src/athena/store.ts:54 "The one reducer from a turn's parts to what the transcript draws"`
- `apps/desktop/src/athena/Transcript.tsx:65 "drawn by the same parts renderer as the live one"`
- `tests/test_turn_parts.py:46 "def test_a_settled_turn_keeps_its_parts_in_the_order_they_streamed"`

**Candidate upward lesson (not yet in the technique) — a stored part the reader cannot
draw is a visible row.** A part kind from a newer daemon shows as a plain line saying it
cannot be shown, so version skew never silently edits the record.

- `apps/desktop/src/athena/store.ts:70 "a visible row, never nothing"`

**Deviation (narrowed) — the second window sees the settled record, not the live run.**
The app event stream still carries only a turn-finished notice, and a window that did
not ask reloads the conversation on it. It now redraws the whole turn with its parts,
but it cannot show the tool a run is waiting on, or a consent card the moment it is
filed.

- `src/athena/turn.py:558 "daemon.events.publish("`
- `apps/desktop/src/athena/store.ts:383 "void loadConversation(get().activeId)"`

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

**Deviation (worse since the proof) — the phone's projection launders the tool outcome
and drops kinds silently.** The phone vocabulary is built by one projection function
(confirmed), but it sets every tool line's outcome to success, a value the source event
never carried, and returns nothing for the stage-only kinds and for report parts without
counting them. A phone turn runs the same stream, so a records question asked from the
phone can be answered with parts the phone never receives, while the model was told the
person sees the figures and not to repeat them.

- `src/athena/peer/remote.py:112 "def shape(event: Mapping"`
- `src/athena/peer/remote.py:125 "tool.result"`
- `src/athena/peer/remote.py:143 "return None"`
- `src/athena/peer/remote.py:332 "from athena.turn import run_turn"`
- `src/athena/report/chat.py:148 "They see these figures: do not repeat them."`

## A run that asks a person ends

**Confirmed — a consent request is its own event, and the turn ends with "waiting".**
The card is filed in the gate and answered on its own channel, from the window or from a
paired device holding the approve grant.

- `apps/desktop/src/lib/contract.ts:808 "waiting: boolean; cost_usd?: number"`
- `src/athena/peer/remote.py:20 "A turn that filed a card ends too, with"`
- `src/athena/peer/remote.py:411 "lambda r: peer_decide(daemon, r)"`

## Outside engines write into the same stream

**Upward lesson — a per-run credential, distinct from the client's, with a sink into the
stream.** A turn on an engine that calls tools itself mints a lease for that turn,
scoped to the turn's operations, and every tool line, card and report part the engine
causes reaches the turn's stream through the lease's sink; the lease is dropped when the
run ends. The technique's section on outside engines was written from these lines.

- `src/athena/mcp.py:4 "The bearer is a lease, never the daemon's token"`
- `src/athena/mcp.py:6 "mints one for the length of the turn and hears every line and card through the lease's sink"`
- `src/athena/turn.py:432 "daemon.mcp.mint(space_id, ttl=AGENT_LEASE_S, tools=names"`
- `src/athena/turn.py:468 "daemon.mcp.drop(lease.token)"`
- `src/athena/routes_mcp.py:18 "The route that checks its own bearer (a lease), not the daemon's token."`
- `tests/test_report_chat.py:187 "def test_a_turns_lease_streams_the_parts_and_an_outside_host_never_sees_the_tool"`

**Upward lesson (to depth-handoff) — a gated call returns a pending identity, and says
nothing happened.** The door files a card instead of acting and answers with its
identity; the server's instructions and the text result both say it is not done.

- `src/athena/mcp.py:10 "files a card and answers"`
- `src/athena/mcp.py:11 "nothing a caller sends can run it"`
- `src/athena/mcp.py:41 "answers pending: nothing has happened until they sign it, so never say it is done"`
- `src/athena/turn.py:230 "Filed for the person to sign. Nothing has changed yet."`

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

The door is not the stream, but its results feed it, and what it advertises reaches the
user through the host.

**Confirmed (closed deviation) — the read-only hint comes from what an operation writes.**
A table beside the catalog says whether each action changes anything, a test holds it to
the catalog, and an unknown name is never read-only. Remembering and putting a record are
automatic and now advertise as writes.

- `src/athena/mcp.py:47 "Whether each catalog action changes anything when it runs"`
- `src/athena/mcp.py:49 "an AUTO action may write (remember, record_put)"`
- `src/athena/mcp.py:172 "A name outside the catalog is never called read-only."`
- `src/athena/mcp.py:173 "WRITES.get(fn"`
- `tests/test_mcp_server.py:122 "def test_every_catalog_action_says_whether_it_writes"`
- `docs/adr/0023-a-tools-hints-come-from-what-it-writes-and-every-refusal-is-an-error.md:19 "never from the consent class"`

**Confirmed (closed deviation) — every refusal is an error, flagged where it is decided.**
The dispatch result carries a refused flag set by the branch that refuses, and the door
copies it into the error flag rather than inferring it. The inference it replaced (no
line and no card means refused) broke on browser paths that stream a line when they
fail; four such paths are now held by tests.

- `src/athena/browser/actions.py:61 "flag is set where the refusal is decided, never inferred from the lines"`
- `src/athena/turn.py:226 "return Dispatched(checked, refused=True)"`
- `src/athena/mcp.py:263 "The dispatch says whether it refused (ADR 0023)"`
- `src/athena/mcp.py:265 "done.refused}"`
- `tests/test_mcp_refusals.py:42 "def test_page_open_on_a_site_signed_out_is_an_error"`
- `tests/test_mcp_server.py:150 "def test_every_refusal_is_an_error_and_a_card_or_a_run_is_not"`

**Deviation (narrowed) — no change notifications.** The door now serves a rendered view
(see [the in-host views application](python--in-host-views.md)), but it still declares
no list-change notifications, although the offered set depends on whether the desktop's
browser is running and, since the proof, on whether the project keeps any records. A
host that cached the list keeps offering operations that have gone, or never learns of
ones that arrived.

- `src/athena/mcp.py:219 "listChanged"`
- `src/athena/mcp.py:138 "her browser while the desktop runs it"`
- `src/athena/mcp_views.py:64 "bool(daemon.records.kinds(space_id))"`
