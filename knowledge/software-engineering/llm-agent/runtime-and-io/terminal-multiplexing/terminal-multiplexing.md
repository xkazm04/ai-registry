---
layer: golden-path
type: golden-path
subject: terminal-multiplexing
status: forged
techniques:
  - attach-detach-lifecycle
  - bounded-replay-buffers
  - renderer-economics
  - pty-management
  - keystroke-injection
  - multiplexer-state
  - occupant-state-detection
  - multi-client-fan-out
---

# Terminal emulation & multiplexing

This is the subject you own when a long-lived host program presents **many
interactive terminal sessions at once**: embedded shells, agent runtimes
driven through their command-line interfaces, build watchers, remote
consoles. Each session is a pseudo-terminal-backed process on one side and a
terminal emulator on the other, and the host's job is to keep **dozens of
them** alive, correct, and cheap — while the user looks at only a handful.

The boundary with the neighbors is precise. The child process itself — spawn,
supervise, terminate, reap — is
[subprocess-lifecycle](../subprocess-lifecycle/subprocess-lifecycle.md)'s
subject; this subject begins at the pseudo-terminal that makes the child
believe a human is present, and owns everything from that device up through
the emulator to the pixels. *Which* sessions exist — dispatching them,
naming them, harvesting their results — is
[fleet-orchestration](../../orchestration/fleet-orchestration/fleet-orchestration.md)'s
subject; this subject takes the roster as given and owns the terminal
machinery under each entry. Generic stream buffering — bounded rings,
eviction, truncation honesty — is
[streaming-output](../streaming-output/streaming-output.md)'s subject; the
replay rings here are that discipline wearing terminal dress, and where the
rules coincide this subject defers rather than restates. And the ladder that
keeps a long-lived manager alive across an interactive development session
is [client-state](../../../client-architecture/client-state/client-state.md)'s subject; this subject
is that ladder's most demanding tenant.

## The design point: N sessions, K eyes

Everything in this subject follows from one asymmetry: the host runs **N**
sessions and the user watches **K** of them, and in any grown product
K is small and N is not. A design that pays per-session costs as if every
session were watched — a live widget each, a GPU context each, an
unthrottled event subscription each — is correct at N = 3 and an outage at
N = 40. The subject's central discipline is a cost model with two columns:

| Cost | Scales with | Examples |
| --- | --- | --- |
| **Existence cost** | N (all sessions) | the child process, the pseudo-terminal, a **bounded** backend buffer, a registry entry |
| **Attention cost** | K (visible sessions) | the widget, the emulator's render surface, the GPU-accelerated renderer, the event subscription, resize propagation |

Every resource in the system is assigned to one column on purpose, and the
review question for any new feature is which column it lands in. Existence
costs must be individually bounded (a fixed-size ring, a dormant device pair,
a map entry) because N is unbounded from this subject's point of view;
attention costs may be rich because K is bounded by screen area and human
attention. The recurring failure of naive designs is a resource in the wrong
column — most famously the renderer, covered below.

The table carries one assumption it should state: **K counts attachments,
not sessions.** In a host with one viewer the two are the same number. In a
server-owned runtime that lets several clients attach to one session, a
session watched by M clients spends the attention column M times, and the
subscription row hides a third multiplier — every frame the session produces
is emitted once per attached client. That multiplier is bounded only by a
design choice the single-viewer table never has to make: the screen model
moves to the server as an existence cost, so each client's stream is a
*derived* redraw that can be dropped and regenerated when the client falls
behind, rather than a transcript the runtime owes it. The
[multi-client-fan-out](./techniques/multi-client-fan-out.md) technique owns
that design, the slow-client policy that keeps one viewer from stalling the
rest, and the size and keyboard arbitration that follow; a host with M = 1
everywhere reads the table as written.

## Detach is not dispose

The load-bearing distinction of the whole subject: when the user navigates
away from a session, **the session does not end — the audience leaves.** The
child keeps running, the pseudo-terminal keeps flowing, and the backend keeps
a bounded tail of everything said. What gets torn down is exactly the
attention column: the subscription, the renderer, and eventually the widget.

Collapsing this distinction produces one of two familiar defects:

- **Detach as dispose** — navigating away kills or orphans the session. The
  user learns that looking away is dangerous, keeps every view open in dread,
  and the product has silently forbidden multitasking — the one thing a
  multiplexer exists to permit.
- **Attach forever** — navigating away tears down nothing. Every session ever
  opened keeps its widget, its subscription, and its render surface; memory
  and event traffic scale with N, and the product dies of its own history.

The correct shape is a **state ladder per session** — attached, parked,
detached, dead — where each downward step frees a named set of resources and
each upward step restores them, and where the steps are driven by an
explicit budget rather than by hope. The
[attach-detach-lifecycle](./techniques/attach-detach-lifecycle.md) technique
owns the ladder, the budgets, and the least-recently-viewed parking policy
that decides who falls when the budget is exceeded.

## Replay makes re-attach seamless

A detached session's output did not stop; the user's view of it did. When
they return, there are three possible experiences:

- a **blank screen** until the next byte arrives — technically honest,
  experientially indistinguishable from a dead session;
- an **unbounded scrollback** faithfully retained — honest and rich, and a
  memory liability multiplied by N;
- a **bounded tail replayed** into a fresh emulator on attach — the last
  screensful of history, enough to re-establish context, at a cost fixed per
  session.

The third is the standard. The backend keeps a ring per session — bounded in
bytes, not entries, because terminal output has no natural record size — and
attach means: create the emulator, replay the ring into it, then splice into
the live flow without gap or duplication. Truncation is disclosed, not
hidden: a tail that silently pretends to be the whole history teaches users
to distrust their own terminals. The
[bounded-replay-buffers](./techniques/bounded-replay-buffers.md) technique owns
the ring's budget, the replay-then-splice handshake, and the honesty rules —
it is deliberately a thin terminal-shaped layer over the neighbor's
buffering discipline, not a rival to it.

## Renderer resources are attach-scoped

Terminal rendering at interactive quality wants hardware acceleration: a
glyph atlas, a GPU context, a damage-tracked draw loop. Every one of those is
scarce at the platform level — GPU contexts in particular are counted, not
metered: a small fixed number per process or page, and exceeding it revokes
the oldest rather than slowing the newest — which forces the rule: **the
accelerated renderer belongs to the visible terminal, not to the session.**
N parked sessions must hold **zero** GPU contexts among them.

This is the sharpest instance of the two-column cost model, and the one most
often violated, because the naive object design bundles emulator + renderer +
widget into one "terminal" object whose lifetime equals the session's. The
standard breaks that bundle: the renderer is created on attach, destroyed on
detach ([creation-names-reaper](../../../_laws.md#creation-names-reaper) applies to
GPU handles with unusual force, since the platform's penalty for leaking them
is losing acceleration everywhere), and the design names a **fallback
renderer** for the moments acceleration is unavailable — context lost,
budget exhausted, driver blacklist — so degradation is a slower terminal,
never a blank one. The
[renderer-economics](./techniques/renderer-economics.md) technique owns the
renderer's lifecycle, the fallback ladder, and the resize/reflow costs that
make "just keep it rendering off-screen" a false economy.

## The terminal is opt-in: two lanes

The deepest cost lever is upstream of all the machinery above: **not every
session needs a terminal at all.** An interactive program behind a
pseudo-terminal spends real resources being interactive — it repaints its
status line even when idle, it emits escape-sequence redraws that must be
emulated, and driving it programmatically means synthesizing keystrokes into
a full-screen interface. A session that will be operated by software and
merely *summarized* to humans can instead run on a second lane: plain piped
streams carrying **structured events**, no pseudo-terminal, no emulator, no
redraw loop. The state machine reads events instead of scraping a screen;
the replay ring is fed cooked display lines derived from the events, so
every downstream reader of the ring — previews, orchestration, the
attach-time replay — works unchanged and reads *cleaner* content than a
scraped interface would give it.

The two lanes share session identity, lifecycle, and the ring; they differ
only in what sits between the child and the host. The design obligation is
choosing the lane **per session's audience**: human eyes and hands get the
pseudo-terminal lane; programmatic drivers get the structured lane; and a
session can cross lanes at a lifecycle boundary (a programmatic session
resumed for a human gets a terminal then). Paying pseudo-terminal costs for
sessions no human will ever watch is the existence-column mistake at its
largest grain.

## The pseudo-terminal is a real seam

A pseudo-terminal is the kernel object that makes a child process believe it
is talking to a human: line discipline, window size, control codes, signal
semantics. It is also one of the least portable objects in systems
programming. The two dominant desktop lineages differ in how the device pair
is created, how window resizes are communicated, how the child's exit is
observed, and what a control-code interrupt actually delivers — differences
in **semantics**, not just spelling, which is why they cannot be papered
over by a rename at the call site. The standard is a single portability
seam: one module owns the platform split, exports one platform-neutral
contract (spawn with size, write, resize, observe exit, kill), and every
other layer is platform-blind. The
[pty-management](./techniques/pty-management.md) technique owns the seam, the
resize-propagation chain (widget → emulator → device → child), and exit
detection — the place where this subject hands the corpse back to
subprocess-lifecycle for reaping.

## Programmatic keystrokes are semantic

A multiplexer that hosts sessions soon wants to **drive** them: automation
sending commands, an orchestrator answering a prompt, a test harness
navigating a full-screen terminal program. The naive approach — concatenate
a string, write it to the device — fails in ways that all trace to one
misunderstanding: a terminal's input is not text, it is **keystrokes**, and
full-screen programs attach meaning to how the keystrokes arrive. Whether a
newline arrives inside a pasted block or as its own keypress decides whether
a terminal editor inserts a line or submits a form; whether a command and
its confirming keypress arrive in one chunk or two decides whether the
target program's input loop sees them as one event or a sequence.

The standard is a **readable key notation** — a small closed vocabulary
naming special keys and modifiers, with one parser as its single authority
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)) —
plus explicit chunking rules that make "type this, then press this key"
expressible and reproducible. The
[keystroke-injection](./techniques/keystroke-injection.md) technique owns the
notation, the typed-versus-pasted distinction, and the timing discipline for
driving full-screen programs.

## Driving requires knowing who is home

Injection answers *how* to send a keystroke. It does not answer *whether to
send one now*, and for a hosted program that question has teeth: a write
aimed at a session showing a confirmation dialog does not reach the
program's input loop, it answers the dialog. So a multiplexer that offers
programmatic control owes its callers one more thing — a reading of the
**occupant's** state, distinct from the session's attachment rung above.

The neighbour already owns the state machine this feeds. Fleet
orchestration's
[lifecycle-signals](../../orchestration/fleet-orchestration/techniques/lifecycle-signals.md)
tracks what each session is doing, and its best channel is the session's own
runtime announcing transitions. This subject's contribution begins where
that channel is absent: the occupant is a third-party interactive program
that emits no hooks and offers only the screen it paints. Turning that into
a signal worth acting on is a terminal problem — it is about which region of
which buffer to read and how much to believe it — and so it belongs here,
with the result handed upward as an observation like any other.

Two rules carry most of the value. The classifier reads a buffer the **user
cannot scroll**, because a verdict that changes with the scrollbar is a
verdict about the viewer rather than the session. And the vocabulary keeps
an explicit **unclassifiable** state that no caller may read as completion —
an occupant sitting in an overlay the rules do not model is not finished, and
saying so is the difference between a driver that waits and one that
harvests nothing and calls it a result. The
[occupant-state-detection](./techniques/occupant-state-detection.md)
technique owns the channel ranking, the manifest-as-data discipline, and the
contract each state implies for whoever is driving.

## The manager is a singleton with a lifecycle

All of the above needs an owner: one **manager**, keyed by session identity,
holding the session→state map, enforcing the budgets, and routing attach and
detach. Two properties are non-negotiable:

1. **Keyed by durable session identity.** Widgets are reused, views are
   reordered, the same session is opened from three different surfaces; if
   the map is keyed by widget instance or by position, re-attach duplicates
   sessions and detach orphans them
   ([identity-survives-reuse](../../../_laws.md#identity-survives-reuse)).
2. **It survives the death of its callers.** In an interactively developed
   host, the code that *uses* the manager is reloaded many times an hour
   while the sessions it manages must not blink. The manager therefore lives
   at whatever scope survives module replacement — the ladder rung is chosen
   per [client-state](../../../client-architecture/client-state/client-state.md)'s
   singleton-lifecycle technique, with stale-copy guards so a reloaded
   module cannot resurrect a second manager over live sessions.

The [multiplexer-state](./techniques/multiplexer-state.md) technique owns the
map, focus routing, per-session view state (scroll position, selection), and
the reload-survival wiring.

## The session ladder

A session, seen from this subject, is always on exactly one rung, and every
transition frees or restores a named set of resources. (The rung is a
property of one viewer's attention; where a session can have several
attached clients, each attachment sits on its own rung and the session's is
the highest of them — see
[multi-client-fan-out](./techniques/multi-client-fan-out.md).)

| Rung | Child | Backend ring | Subscription | Emulator + renderer | Widget |
| --- | --- | --- | --- | --- | --- |
| **attached** | running | filling | live | accelerated, painting | mounted, focused or focusable |
| **parked** | running | filling | live or paused | fallback or none | mounted, hidden |
| **detached** | running | filling | none | none | none |
| **dead** | exited | retained for post-mortem, then reaped | none | none | tombstone only |

Two rules fall out of the table:

1. **The ring never blinks.** On every rung where the child is alive the
   backend ring is filling — it is the existence-cost resource that makes
   every other teardown safe, because whatever the user missed is waiting in
   the tail. With one condition, and it lands on this subject's most
   demanding tenant: a child drawing on the **alternate screen** has no
   scrollback to lose rows into, so its ring holds repaints of the current
   grid rather than a transcript, and no budget increase recovers what the
   terminal never retained. The tail's promise is a promise to children that
   scroll; [bounded-replay-buffers](./techniques/bounded-replay-buffers.md)
   owns the boundary and the two recoveries.
2. **Downward is cheap and automatic; upward is deliberate.** Parking and
   detaching happen by budget without asking; attaching happens only on
   explicit user or automation intent, because it spends attention-column
   resources that are budgeted by design.

## The techniques

- [attach-detach-lifecycle](./techniques/attach-detach-lifecycle.md) — the
  attach/park/detach/dead ladder, what each rung frees, budget-driven
  least-recently-viewed parking, teardown ordering.
- [bounded-replay-buffers](./techniques/bounded-replay-buffers.md) — per-session
  byte-budgeted rings in the backend, replay-then-splice on attach,
  truncation honesty.
- [renderer-economics](./techniques/renderer-economics.md) — accelerated
  renderer per visible terminal, fallback ladder, context-loss recovery,
  resize/reflow cost management.
- [pty-management](./techniques/pty-management.md) — the platform portability
  seam, spawn wiring, resize propagation, exit detection.
- [keystroke-injection](./techniques/keystroke-injection.md) — readable key
  notation, typed-versus-pasted semantics, chunking and timing for driving
  full-screen programs.
- [multiplexer-state](./techniques/multiplexer-state.md) — the session-keyed
  manager, focus routing, per-session view state, survival across code
  reload.
- [occupant-state-detection](./techniques/occupant-state-detection.md) —
  reading a hosted program's readiness off the screen when it emits no
  lifecycle hooks: channel ranking, the unscrollable detection buffer,
  per-occupant manifests as reloadable data, and the unknown state that
  never means done.
- [multi-client-fan-out](./techniques/multi-client-fan-out.md) — the third
  multiplier when several clients attach to one session: the server-owned
  screen that makes client streams regenerable, drop-and-redraw for slow
  viewers versus pause-and-notify for byte-faithful subscribers, throttling
  the child only when nobody can consume, size arbitration among many boxes,
  and per-attachment write permission.
