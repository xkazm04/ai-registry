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
own accept coroutine or thread. In some versions the start call does not wait for that
bind. In others it waits, and rethrows the failure as well as delivering it to the
engine's parent execution context; that holds for the engine this subject's source ships.
Either way, the failure that reaches the parent context with no handler there goes to the
runtime's uncaught-exception handler, whatever the caller did with the start call, and it
takes the process with it. A mobile or television operating system then reports a generic
failure to start the activity, with no hint that the cause is a port. Which path a given
stack takes is a version question; handle both. The two fixes are
independent and both are needed: give the server engine a parent execution context the host
owns, so its failures are catchable and become a status; and check the port first, so that
the common failure never reaches the engine at all. The common trigger in development is
the host's own previous process still letting go of the port after a reinstall or a
force-stop, which makes the bug recur precisely when a developer is iterating, and
contaminates measurements taken in that window.

**The probe is stricter than the bind.** The side that closes a TCP connection first keeps
it in a wait state on its local port, for sixty seconds on a Linux kernel and so on the
television sticks this subject targets, which run one. When the host closes its phones'
connections, as it does on pause, the wait states sit on its own listening port; when a
phone closes first, they sit on the phone's side and the host's port is clean. A socket
bound without address reuse is refused while any such connection exists; a socket bound
with address reuse is not, so long as no live listener holds the port. If the real listener
binds with reuse and the probe does not, then a restart soon after any phone was connected
reports the port busy while nothing is listening. The symptom is confusing: the status says
unavailable, and a plain request to the port is refused, which is a port nobody owns. The
rule is that the probe must construct its socket exactly as the real bind does, reuse flag
set before the bind call.

The flag on the real listener matters more than the flag on the probe. On a Linux kernel a
wait-state connection keeps the reuse setting of the listener that accepted it, and a new
bind passes only when both carry the flag. A probe that sets reuse therefore cannot rescue
a previous run whose listener did not, and a retry loop of a few seconds cannot outlast a
sixty-second wait. Server engines differ in what they set: some leave the option at the
platform's default unless their own configuration turns it on, and platform defaults differ
between operating systems. Set it explicitly on the real listener and never rely on a
default.

Expect the explicit flag to change nothing you can observe on today's common runtimes. The
mainstream server libraries already turn reuse on for listening sockets on Unix-like
kernels. Windows uses an exclusive bind that a wait state does not block. The flag is a
guard against the engine or runtime that turns it off, not a fix that a test will show.

A development machine can hide all of this. On Windows a wait-state connection did not
block a fresh bind at all, with the flag or without it, while the same sequence on a Linux
kernel was refused. A test on a Windows machine can pass while the same code fails on the
device, and no test there can reproduce the failure; reproduce it on the device's
operating-system family, or in a container running that kernel.

## Procedure

1. Set address reuse explicitly on the real listener, in the server engine's own
   configuration where it has one. Then open an unbound socket for the probe, set address
   reuse, bind it to the same interface (usually all interfaces) and port the real
   listener will use, and close it. Treat any exception as "not free".
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
- When clients learn the port only from what the host advertises, and nothing they keep is
  tied to the port, skip the probe: let the real bind be the test and walk to the next free
  port, then advertise the port actually bound. That is simpler than a probe and a retry.
  When a phone keeps a seat token or any state in browser storage, the port is part of the
  page's origin, and both the stored state and the page's own socket address belong to it.
  A host that walks to another port then orphans every seated phone. It may walk at a
  first start, before anyone is seated, and must come back on the same port at every
  resume.
- When retrying, the wait must be short and the cap small; a host that retries for minutes
  looks hung.
- Do not use address reuse to bind over a live listener on a platform where the flag
  permits that. Verify on every platform class you ship that an actually listening server
  still fails the probe; semantics of the flag differ between operating systems. On
  Windows, a second bind with the flag takes over a live listener only if that first
  listener also set the flag. A default-bound listener refuses it. Server code should
  still ask for an exclusive bind there.

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
count and interval are authored values.

The reuse semantics were measured on 2026-10-09, outside any project, with one run per
case. A live listener was the control that every bind must fail.
- **Windows 11** (binds from two different runtimes): a fresh bind over a server-side wait state
  on the port succeeded with the flag off and on, while the operating system listed the
  wait-state row.
- **Linux 6.6 in a container:** the same bind was refused without the flag. With the flag
  it was refused too, unless the listener that had accepted the connection also set it.
- **Client closes first:** the host's port carried no wait state on either system.

macOS and the television's own kernel build were not measured. That the stick behaves like
the Linux case is an inference from its kernel family and from the incident.
