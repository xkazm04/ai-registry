---
layer: technique
type: technique
subject: agent-browser-control
technique: persistent-browser-daemon
status: forged
laws: [identity-survives-reuse, creation-names-reaper, failure-not-empty-success]
shared_with: []
use_when: [every browser command pays a cold start and loses the login, a slow page makes the tool kill and restart the browser, two workspaces fight over one browser port, deciding what a rebuilt binary does to a running browser]
---

# Persistent browser daemon

The agent's browser is a long-lived process, one per workspace, started by
the first command that needs it and addressed by every later one over a local
socket. A cold start is seconds and loses every cookie, tab and login; a call
to a warm daemon is in the hundred-millisecond range and arrives at a page
still logged in. For a loop that issues many commands per task the daemon is
the difference between a loop that can test a flow and one that cannot.

This technique owns what a *browser* daemon adds on top of the generic child
process. Spawning, environment hygiene, the termination ladder and orphan
sweeps are [subprocess-lifecycle](../../subprocess-lifecycle/subprocess-lifecycle.md)'s
and are inherited unchanged; the warm-session economics are its
[session-reuse](../../subprocess-lifecycle/techniques/session-reuse.md). What is
specific here is that the state worth keeping alive lives *inside* the child —
the cookie jar, the open tabs — so every decision that would kill the child
is a decision to destroy the session, and the rules are tuned to that
asymmetry.

## The state file is the discovery door

Every command finds the daemon through one small file in the workspace: the
process identity, the port, a bearer token, the start time, and the version of
the binary that started it. Three properties make the file trustworthy rather
than merely present. It is **written atomically** — to a temporary name, then
renamed — so a reader never sees a half-written record, and the temporary name
is unique per writer so two concurrent starters do not clobber each other's
staging file. It is **owner-only**, because it carries the token, and a
world-readable state file hands every process on the machine the browser. And
it is **the only copy**: the daemon does not also announce itself on a
well-known port or by process name, because two discovery paths that can
disagree are the root of every split-brain incident this design has seen.

Liveness is asked of the identity in the file, never of a process name. A
signal-zero probe of the recorded process id — treating permission-denied as
alive, since the process exists even if it is not yours to signal — is the
liveness fact; the health endpoint is the *responsiveness* fact; and the two
are different questions with different answers
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse):
the record names one process, and a name-pattern kill would take a sibling
workspace's daemon with it).

## Busy is not dead

Here is the rule the naive design breaks first, by being reasonable. The
health probe times out; the tool concludes the daemon is hung, kills it, and
restarts. The daemon was alive, rendering a heavy page with a navigation still
in flight; the kill lost every login and tab; the restarted daemon hits the
same page and the loop repeats. A short probe window turns a slow page into a
crash loop.

So: **an alive process is never killed automatically.** When the health probe
fails, the tool probes for a bounded window sized to the slow cases actually
observed — several seconds, not one — and if the process is still alive at
the end it *reports busy* with a non-zero exit, naming the process, the budget
it waited, and the one command that will kill it if the operator decides to.
Only that explicit force kills a live daemon. The action space is a closed set
— retry against the same daemon, report busy, force-restart, restart-dead —
computed by one pure function from three facts (process alive, healthy after
the probe, force requested), so it can be unit-tested without a browser and
cannot drift between call sites. A command that times out against a live
daemon follows the same rule from the other side: "busy, not restarting", and
exit. The cost of a wrong "busy" is one retry; the cost of a wrong "dead" is
the session.

## Version mismatch restarts, crash exits

Two transitions are decided in advance, in opposite directions.

**A binary version mismatch restarts the daemon.** The build stamps its own
identity into the binary; the daemon records it in the state file; every
command compares the two. When they differ, the running daemon is serving a
world that no longer exists, and this is the one case where a live process is
killed without the operator asking — because the alternative is a class of
bug ("works after I restart") that cannot be diagnosed and never ends. The
rule is a fingerprint mismatch in session-reuse's terms, applied to the single
component that changes most.

**A browser crash exits the daemon.** When the browser process disconnects,
the daemon does not try to reconnect, relaunch or hide the event; it flushes
its buffers, logs the cause, and exits with a code that distinguishes a clean
user-initiated close from a crash
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
The next command finds a dead process in the state file and takes the
ordinary start path. Self-healing inside the daemon is rejected because a
half-reconnected browser presents as healthy while its tabs and cookies are
gone, which is a lie the agent cannot detect; a clean restart is at least
honest about what was lost.

## Ports come from a range, not from the pool

A daemon that lives for weeks must not hold a port the operating system
hands out to short-lived processes. Binding "any free port" draws from the
ephemeral pool — the same pool every test server and every outbound
connection uses — and a long-lived squatter there silently absorbs traffic
meant for something else. So the daemon draws a random port from a fixed
range that **ends below the platform's ephemeral pool**, retries a bounded
number of times on collision, and reports the retry count and the last error
when it gives up. The failure message distinguishes "every sampled port was
in use" from "the sandbox forbids loopback binding", because the second is
the common case in restricted environments and its remedy is different.
Random-in-range is what lets ten workspaces run ten daemons with no
configuration; a small fixed scan range is what broke constantly before it.

## Reaping, and the idle clock

The daemon names its reaper at creation
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)): an idle
timer, reset by commands but not by health probes, shuts it down after a
bounded quiet period, and shutdown removes the state file, the profile locks
and any helper processes the daemon spawned — by their recorded identities.
The health probe deliberately does not reset the clock, because a monitor
polling health would otherwise keep a forgotten daemon alive forever. The
crash-loop guard on any helper the daemon respawns is windowed to the tick
that drives it: a guard whose window is one tick can never see three failures
and never fires.

## Bounded event buffers

The daemon captures console, network and dialog events continuously, and the
capture must never be the thing that blocks a command or exhausts memory.
Each stream goes into a **fixed-capacity ring buffer** — constant-time push,
oldest entry overwritten — and a periodic flush appends only the new entries
to an append-only file. Reads serve from memory; disk is for post-mortem
after a crash. The loss bound is one flush interval, and stating it is the
point: an unbounded buffer is a memory leak shaped like a feature, and a
synchronous write per event is a request path that stalls under exactly the
page load it is trying to observe.

## Cookie import, at the boundary

Importing a person's cookies into the agent's browser is the one place this
subject touches credentials, and the store is the person's whole logged-in
life. The import reads a **copy** of the store, opened read-only, never the
live database; decrypts **in process** and loads values straight into the
browser context, never to disk in plaintext; treats the platform's keychain
consent dialog as the gate and never bypasses it; caches the derived key for
the daemon's lifetime and no longer; and lets no cookie **value** reach a log
or a picker interface — domains and counts only. These rules are a first-party
account of one desktop platform and the cross-platform story is thinner. The
web application's own credential design is
[browser-credential-boundary](../../../../security/data-and-transport/browser-credential-boundary/browser-credential-boundary.md)'s
concern and stays there.

## Decision rules

- One daemon per workspace, discovered only through an atomically written,
  owner-only state file recording process identity, port, token and binary
  version.
- Liveness by recorded identity, never by process name; responsiveness by the
  health endpoint; keep the two answers distinct.
- Alive but unresponsive: probe for a bounded window sized to observed slow
  cases, then report busy with a non-zero exit. Only an explicit force kills a
  live daemon.
- Binary version mismatch: kill and restart, unconditionally.
- Browser disconnect: flush, log the cause, exit with a distinguishing code;
  the next command restarts.
- Ports from a fixed range ending below the ephemeral pool, bounded retries,
  the failure message distinguishing occupancy from a binding prohibition.
- Fixed-capacity ring buffers with asynchronous flush; state the loss bound.

## When not to use this

A single screenshot of a public page needs no daemon; the cold start is paid
once and there is no session to keep. And a browser that must be shared by
many agents across machines is a fleet resource with admission and fairness
concerns that this technique does not address — one daemon, one workspace,
one operator is its jurisdiction.
