---
layer: technique
type: technique
subject: fire-tv-device-realities
technique: unhandled-bind-failure-kills-process
status: forged
laws: [refuse-rather-than-destroy, compiling-is-not-wiring]
shared_with: []
use_when: [a game hosts a network server on a device and vanishes to the launcher at start, a worker thread opens a socket, a convenience service must never be able to end the game]
---

# Unhandled bind failure kills the process

## The concern

A game that hosts a small server - a phone-as-controller bridge, a lobby, a telemetry
endpoint - opens a listening socket when it starts, usually on a worker thread so the main
loop is not blocked. On a development machine the bind always works. On a real device it can
fail: the port is still held by a previous instance of the game that is dying, the platform
refuses the permission, the network interface is not up yet at launch, the address family is
not available. A bind failure is an ordinary exception. The trap is what happens to it.

An exception that escapes the top of a worker thread is, by default, an uncaught exception,
and the runtime's response to an uncaught exception on any thread is to terminate the
process. The game opens, the server thread throws, and the player is back at the launcher
with no message, no log the player can see, and the sense that the game "crashed on start".
A feature that was an extra took down the thing it was an extra to.

## Procedure

1. **Treat every thread entry as a boundary.** The outermost frame of every thread the
   game starts catches everything, logs it with the thread's name, and decides explicitly what
   the failure means. Anything else leaves the platform's default in charge.
2. **Wrap the bind and the accept loop separately.** A failed bind is a startup failure of the
   server: catch it, mark the server state as failed, and continue. A failure inside the accept
   loop is a per-connection failure: close that connection, keep the loop. The two have
   different recoveries and a single wrapper cannot distinguish them.
3. **Publish the server state as a value the game can read**: not started, listening on a
   named port, failed with a reason. The state is what the user interface renders. A game that
   shows "controller bridge unavailable" with the reason has degraded; one that is silent has
   lied.
4. **Retry a bind failure only with a bound and only where it can help.** A port held by a
   dying previous instance clears in seconds; a few spaced retries are right. A denied
   permission does not clear, and retrying it is noise. Classify by the error, not by hope.
5. **Offer a fallback port or an ephemeral one**, and publish the one actually bound, so the
   consumer that connects reads the truth instead of a constant.
6. **Set a last-resort handler for the process** that logs the uncaught exception to storage
   the player cannot lose, as a record, and stays a record. It is a flight recorder, not a
   recovery path; recovering from inside it hides the bug it was meant to reveal.
7. **Test the failure on purpose.** Hold the port from another process, start the game, and
   check that it starts, shows the degraded state, and carries on. A guard that was never
   made to fire is a guard nobody has seen work.

8. **Own the parent context of a framework-hosted server.** Some server frameworks bind inside
   their own accept coroutine, so the bind exception never returns from the call that started
   the server; it surfaces on a thread the caller never sees. Supplying the framework's parent
   context with a failure handler is what makes the failure the game's to handle. Judge the
   whole cause chain, since the bind exception can arrive wrapped.
9. **Release on suspend, rebind on resume.** A suspended game that keeps its port blocks its
   own restart; stop listening when the window is paused and rebind when it returns.
10. **Make the preflight use the same socket options as the listener.** A free-port check that
    disables address reuse reports "busy" for a port that is only in the closing state after a
    recent connection, and the game then refuses to start for a server that is not running. The
    preflight must pass exactly when the real bind would pass.

## Decision rules

- **When a component is optional, its failure must not be able to reach the process.** The
  isolation is structural: the catch lives at the component's thread entry. A policy of "that
  should not throw" is not isolation.
- **When the failed component is the game's only input path, the game must say so on screen
  and offer the alternative.** A degraded game with no way to be controlled is a failure that
  has changed shape; render it as one.
- **When a bind fails with "address in use", suspect the previous instance before the
  platform.** Check for a lingering process, and prefer releasing the socket promptly on
  shutdown with address reuse enabled so that a quick restart does not collide with itself.
- **When the failure cannot be told apart from a platform restriction, record it as
  unknown.** Do not reclassify a failure the game cannot explain as a policy fact; that feeds the
  portability question and poisons it.

## What it does not prove

A caught bind failure proves the game survives the failure it was tested against. It does not
prove the server works on a device where the bind succeeds, and it does not prove the
platform permits listening at all. A game that survives a refused bind has a degraded mode,
which is a different deliverable from a working server.

## When not to use this

When the server is the product - a dedicated host with no other function - dying on a bind
failure is the correct behaviour, provided it dies loudly, with a message and an exit status
a supervisor can read. The rule is that the *optional* part must not end the *necessary*
part; where there is no necessary part, say what happened and stop.

## Evidence status

The incident - a bind failure on a worker thread ending the game - was observed once on one
device and was fixed by catching at the thread boundary. The retry classification and the
last-resort recorder are authored practice, not measured on the device; the specific causes
of the bind failure on that device were not isolated.
