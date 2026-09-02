---
layer: application
type: application
subject: terminal-multiplexing
technique: multi-client-fan-out
stack: rust
status: forged
applied: simulation
ab_verdict: unapplied
verified_on: 2026-09-02
verified_against: rust@1
---

# Rust — a desktop fleet host where M is one by type, and the phone is a keyboard without a screen

*A negative application. The technique says it is "a technique to build only
when the runtime can have more than one attached client per session" and
that a host with M = 1 collapses every rule to the golden path's table. This
tree is that host, and the interesting part is how it fixed M = 1: not by
never being asked, but by the shape of two types and one route table.
Backend is Rust (`rust-version = "1.80.0"`, `portable-pty 0.8`, `tauri 2`);
the viewer is an xterm.js pane in a React front end.*

## The attachment set is a boolean

The reader loop (`pty.rs`) always pushes every chunk into a bounded byte
ring and forwards over IPC only while the session is subscribed. The
subscription is one field on the ring:

```rust
pub struct OutputRing {
    buf: VecDeque<u8>,
    cap: usize,
    subscribed: bool,
    ...
    parser: Option<vt100::Parser>,
}
```

`subscribe_output` sets it, `unsubscribe_output` clears it, and the
`tauri::command` pair takes a `session_id` and nothing else — no client
identity, because there is exactly one webview to emit to. M ∈ {0, 1} is
therefore not a design-review answer nobody gave; it is a fact the type
system states. Everything the technique owns — per-client queue, per-client
block flag, per-client offset, the drain-to-slowest-reader rule — has no
place to live, and the tree confirms none of it exists: the emit is a
fire-and-forget `let _ = app.emit(...)` into the webview's event queue,
with no backpressure and no discard counter, because the one consumer's
queue is the runtime's own.

## The front end reached M = 2 first, and refused it

Two real incidents in the same week are the desktop's own version of "the
day the second client attaches":

- **Second pane, same session (commit dated 2026-08-29).** One holder `<div>`
  per session; a second pane attaching the same session re-parented it and
  the first pane rendered an empty black box "indistinguishable from a
  session that has printed nothing". The fix was not fan-out — the manager's
  comment says a refcount "is the wrong instrument - the resource is a DOM
  node and counting holders would not let two of them paint". Instead the
  displaced owner is *named and told* (`onTerminalHolderLost`) and offered a
  button that takes the terminal back. The host chose a single viewer with a
  handover protocol over two viewers with a shared screen. Under the
  technique (policy B) the same session would carry two redraw streams from
  a server grid; under the shipped policy (A) it carries one holder and a
  displacement notice. With M = 1 by construction, B has no observable
  advantage — and A's own probe suite (6 of 6 after, 0 of 6 before) is the
  only instrument that moved. Falsifier: a surface that needs both panes to
  paint at once, which the manager's comment explicitly says "fires on no
  current path".
- **The only viewer's listener dies (2026-08-29).** The one app-wide output
  listener failed to register, the pane hydrated from the ring snapshot, and
  then froze forever with keystrokes still reaching the child. This is the
  technique's "one slow client stalls every terminal" failure with M = 1: the
  stall reached every terminal *because there is only one subscriber for the
  whole app*, not because a slow one was waited on. B's per-client discard
  and redraw would not have helped — the client was not slow, it was
  unsubscribed and did not know it. The fix (report the rejection, paint an
  in-terminal notice, retry on 1 s–30 s backoff) is the single-viewer form
  of "marked blocked, checked on a timer, invalidated for a full redraw".
  Falsifier: a second viewer that kept receiving while the first froze,
  which would have shown the fault to be per client. There was none.

## The paired phone is a keyboard without a screen

The tree does have a second client class: a paired mobile PWA served by an
`axum` router. Its whole API is two routes, `GET /api/state` and
`POST /api/act`. The state payload carries session state, an attention
label and Athena's *proposed* reply — the DTO comment says "A proposal, not
terminal output" — and never the ring, the grid, or a byte stream. So
M_viewers stays 1. But `act` includes `Reply { session_id, text }`, which
sanitises the text (control sequences stripped, length capped) and writes
`{text}\n` into the session through the same `fleet_write_input` the
desktop keyboard uses. M_keyboards is 2, and they merge at the device in
arrival order exactly as the technique says they must.

Where the technique wants a **write permission per attachment**, this tree
has a **state gate per write**: a remote reply is accepted only while the
session is `AwaitingInput` — "typing into a working terminal from a phone is
never right" — and rejected otherwise. Under B the phone would hold a
read-only or writable attachment decided at pair time; under A it holds no
attachment at all and is judged per keystroke by what the occupant is doing.
For the shipped case the state gate is the stronger rule: an attachment
permission grants the phone the right to type into a *working* session,
which is the incident the gate exists to prevent. Falsifier: a phone that
needs to interrupt a running session (Ctrl-C from the bus), which a
per-write state gate cannot express and an attach-time permission can.

## The structural fact: the server grid already exists, with no client on it

The technique's precondition for bounded fan-out is that "the server owns
one screen model per session" as an existence cost, so each client stream
is a *derived* redraw. This tree pays that cost already —
`OutputRing.parser: Option<vt100::Parser>` is a persistent VT screen fed
incrementally by every `push`, with a benchmark guarding its O(screen)
steady state — but for a different customer: orchestration wakes,
screen-hash dedupe, approval previews and the companion bridge all call
`render_screen_for`. No *viewer* consumes it; the only viewer takes the raw
ring bytes over IPC and runs its own emulator. So the tree holds both halves
of the technique's design, each in service of a single reader, and the
technique's collapse is visible as a grid nobody looks at. The day the
phone shows a terminal, the derived-redraw stream is a `render_screen_for`
call away, and the boolean is the only thing in the way.

## What this realization cannot do

- It cannot measure the fan-out multiplier, because there is no M to
  multiply by; the only numbers the tree emits are the probe counts of its
  own incidents.
- Its throttle policy is not the technique's: the child is *never*
  throttled — the bounded ring overwrites — which is the raw-ring design of
  bounded-replay-buffers and is correct only while the ring is the sole
  history and one viewer can re-hydrate from it.
- Return condition: a second surface that renders a session screen (the
  companion PWA, a detached window, a second pane that must paint), or the
  moment `subscribed: bool` is replaced by a set. Until then this is
  `unapplied`, and the row says so.
