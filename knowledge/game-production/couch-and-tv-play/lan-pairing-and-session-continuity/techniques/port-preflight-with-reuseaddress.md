---
layer: technique
type: technique
subject: lan-pairing-and-session-continuity
technique: port-preflight-with-reuseaddress
status: forged
laws: [refuse-rather-than-destroy]
shared_with: []
use_when: [a host app starts a listener on a fixed port and sometimes cannot, a restart reports a busy port that nothing is listening on, a bind failure kills the whole process instead of showing a message]
---

# Port preflight with address reuse

Before the host starts its real listener it binds the port once, briefly, the same way the
real listener will, and releases it. If that bind succeeds the real start proceeds. If it
fails the host shows a status, waits a short interval and tries again, up to a fixed number
of attempts, and ends with a readable message instead of a crash. The probe has to carry
the same address-reuse setting as the real bind, or it is a different question.

## The two bugs this exists to prevent

**The listener's bind failure kills the process.** Many server stacks bind inside their
own accept coroutine or thread, so an address-in-use exception never travels back out of
the start call. It reaches the runtime's uncaught-exception handler and takes the
process with it, and a mobile or television operating system then reports a generic
failure to start the activity, with no hint that the cause is a port. The two fixes are
independent and both are needed: give the server engine a parent execution context the host
owns, so its failures are catchable and become a status; and check the port first, so that
the common failure never reaches the engine at all. The common trigger in development is
the host's own previous process still letting go of the port after a reinstall or a
force-stop, which makes the bug recur precisely when a developer is iterating, and
contaminates measurements taken in that window.

**The probe is stricter than the bind.** A closed TCP connection lingers in a wait state
on the local port for roughly a minute. A socket bound without address reuse is refused
while any such connection exists; a socket bound with address reuse is not, so long as no
live listener holds the port. If the real listener binds with reuse and the probe does
not, then a restart soon after any phone was connected reports the port busy while nothing
is listening. The symptom is confusing: the status says unavailable, and a plain request
to the port is refused, which is a port nobody owns. The rule is that the probe must
construct its socket exactly as the real bind does, reuse flag set before the bind call.
Some runtimes already enable reuse by default on one platform and not another, which is why
a test on a development machine can pass while the same code fails on the device; set it
explicitly and never rely on a platform default.

## Procedure

1. Open an unbound socket, set address reuse, bind it to the same interface (usually all
   interfaces) and port the real listener will use, close it. Treat any exception as "not
   free".
2. On "not free", set a user-visible status that names the port and the attempt count, wait
   a short interval (a fraction of a second is the right scale for a lingering previous
   process), and retry. Cap the attempts so the host reaches a terminal state.
3. On "free", build and start the real listener. Wrap its start in a catch as well.
4. If the real start fails after a clean probe, stop and dispose the half-built engine and
   go back to the retry loop; do not leave it half-running.
5. After the cap, set a terminal status that says what the person can do: close the other
   copy of the game, then reopen. Log it. Do not exit.
6. Put the status on the pairing screen, in words, where the person who has to act will see
   it. A dead process cannot display it, which is the point.

## The probe is advisory

A probe is not a lock. Between releasing the probe and the real bind, another process can
take the port, and the failure is back. The probe removes the common case, it does not
remove the case; the real start must still be able to fail into a status. For the same
reason the retry loop wraps both. If the host genuinely needs the port, it should hold the
socket it probed and hand that socket to the server rather than release and rebind, where
the engine allows it.

## Decision rules

- When the port is held by a live listener, report it and do not touch it. The host never
  kills the process holding the port, whether it is another copy of itself or something
  unrelated, because identifying a process by name is not enough to justify ending it.
- When the status says the port is busy and a request to it is refused, suspect the probe,
  not the world: check that the probe sets the same reuse flag as the bind.
- When a second copy of the game must coexist with the first, give the variant its own port
  at build time instead of racing for one fixed port at run time.
- When retrying, the wait must be short and the cap small; a host that retries for minutes
  looks hung.
- Do not use address reuse to bind over a live listener on a platform where the flag
  permits that. Verify on every platform class you ship that an actually listening server
  still fails the probe; semantics of the flag differ between operating systems.

## When not to use it

When the listener uses an ephemeral port that the operating system assigns, there is
nothing to preflight, and the work moves to advertising whichever port was chosen. When
the listener is created by a platform component that already reports and retries bind
failures through a supported callback, use that interface rather than a parallel probe.

## Evidence grade

The process-death failure and its fix were reproduced on a real television stick by
occupying the port from the developer's machine and observing the red status instead of
a crash, and the occupied-port outcome has an automated test against a really bound socket,
run on a development machine, not on the device. The TIME_WAIT variant was observed after
reinstalling and restarting on the device following a two-connection probe. The retry
count and interval are authored values. The reuse semantics were not checked on every
operating system the code might run on.
