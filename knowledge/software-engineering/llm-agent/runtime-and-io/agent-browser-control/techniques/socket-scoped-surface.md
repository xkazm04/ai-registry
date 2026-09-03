---
layer: technique
type: technique
subject: agent-browser-control
technique: socket-scoped-surface
status: forged
laws: [gate-sees-target, absent-guard-is-loud, verdict-survives-boundary]
shared_with: []
use_when: [a remote agent must drive a browser daemon that was designed for loopback, deciding whether a request is local by reading its headers, a health endpoint that returns a token, choosing which commands a paired remote agent may run]
---

# Socket-scoped surface

A browser daemon is designed for the loopback interface: one listener, every
process on the machine can reach it, nothing off the machine can, and a bearer
token in an owner-only file is the whole authorization story. That story holds
exactly as long as nothing forwards the port. The moment a remote agent must
drive the same browser — through a tunnel to a public address — the single
listener has become a public server carrying every privileged path the local
operator relies on: the liveness endpoint, the token bootstrap, the cookie
import surface, the inspector, the daemon's own configuration.

The rule: **when a daemon must be reachable remotely, it binds a second
listener and forwards only that one.** The remote surface is a locked
allowlist — a pairing path and a command path, and nothing else — and the
privilege of a path is *which socket it exists on*. A tunnel caller cannot
reach the cookie surface, not because a check refused it, but because the
socket the tunnel points at has no such route and answers not-found.

## Why not infer "remote" from the request

The alternative every team reaches for first is to keep one listener and
classify each request: a forwarded-for header present means remote, an origin
that is not loopback means remote, and remote requests get the restricted
policy. It is cheaper and it is wrong, for reasons the gate cannot see from
inside a request. Tunnel providers change what headers they add and when.
Local proxies — a development proxy, a corporate agent, a container runtime —
add the same headers to traffic that never left the machine. A caller who
controls the request controls the header. The classification is a proxy for
the fact it needs, and it passes precisely when the proxy diverges from the
target ([gate-sees-target](../../../../_laws.md#gate-sees-target)). A second
socket is not a proxy: the tunnel is pointed at it, and everything that
arrives there arrived through the tunnel by construction.

The structural corollary is that **binding the second listener must hard-fail**.
If the remote listener cannot bind, the daemon does not fall back to forwarding
the local port "for now" — that silently defeats the entire property and does
so on the one machine where nobody is watching. Failure to bind is a
start-tunnel failure, reported, with nothing forwarded.

## What the remote surface serves

Two paths, and the shape of each is a decision.

**Pairing** is the unauthenticated path, rate-limited, through which a remote
agent exchanges a setup key for a **scoped token**. The scoped token is a
different credential from the root token, minted by the local operator,
revocable individually, and bound to a command allowlist that is a strict
subset of the daemon's command set — the browser-driving commands, and none of
the daemon-configuring, session-bootstrapping or credential-reading ones. The
allowlist is a pure, unit-testable predicate over the canonical command name
*and its arguments*, because a read command with an argument that redirects
its output to local disk has become a local write, and the remote surface
never grants disk-write capability whatever the command's nominal class.

**Command** is the authenticated path, and on the remote listener it accepts
scoped tokens only. **The root token is refused there** — a caller presenting
it receives a forbidden response whose hint says to pair for a scoped token.
Refusing the root token on the remote socket is what makes a leaked root token
a local problem rather than a remote one.

Everything else on the remote socket is not-found. Not forbidden — not found.
A default-deny surface adds paths by listing them, and a path that was never
listed does not exist there, which is the difference between a guard that
must be remembered and one that cannot be forgotten
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

## Two invariants on the local surface

The separation only works if the local surface keeps two rules that are easy
to break for convenience.

**The liveness endpoint never carries a token, in any mode.** The historical
failure is precise: a health endpoint that returned the root token to callers
from a trusted-looking origin, so that any process on the machine that could
spoof the origin — and in one mode, any local caller at all — could read it.
Liveness is status only; it does not reset the idle clock, and it does not
authenticate anything. A monitor must be able to ask "are you up" without
being handed the keys.

**The one endpoint that hands out the root token pins the caller's identity.**
Token bootstrap exists because a trusted local client — an extension, a
sidebar — needs the root token without reading the state file. That endpoint
releases the token only when the caller's origin is exactly the pinned
identity of the shipped client and the host header, *parsed as a hostname
rather than compared raw*, is loopback — because a host header carries a port,
and a raw comparison against a literal either always fails or is written
loosely enough to always pass. On refusal the body carries no detail about
which check failed; a probing caller is not taught the shape of the gate.

## Every denial is a record

The remote surface will be probed, and the design should learn from it. Every
rejection on the remote listener — path not on the surface, root token over
the tunnel, scoped token missing, command not on the allowlist — is logged
with its reason, the path, the method and the source as reported by the tunnel,
to an append-only file. Two disciplines keep the log from becoming the attack.
Writes are **asynchronous and never awaited** on the request path: a
synchronous append per denial during a flood is a request path that blocks on
disk exactly when an attacker wants it to. And writes are **rate-capped**:
past the cap, denials are counted in memory and the count is attached to the
next written entry, so the log states what it dropped rather than silently
thinning. The reason is a closed string vocabulary, carried as a typed value
from the gate to the log and to the response hint
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)),
so a later analysis can aggregate by cause instead of by message text.

## Decision rules

- Remote reachability means a second listener; forward only that one; hard-fail
  if it cannot bind, never fall back to the local port.
- The remote surface is an allowlist of two paths; everything else is
  not-found.
- Root token refused on the remote listener; remote agents pair for a scoped
  token bound to a command allowlist that is a strict subset, evaluated over
  command and arguments.
- Liveness never carries a token and never resets the idle clock.
- The root-token bootstrap pins the caller's origin and a parsed loopback host,
  and refuses without explanation.
- Log every remote denial with a typed reason, asynchronously, under a rate cap
  that records what it dropped.

## The boundary

[transport-selection](../../mcp-tools/techniques/transport-selection.md) owns
the general decision between a child process and a network listener and names
the local-port trap this technique falls into on purpose. This technique
begins after that decision is made against you — the daemon *is* a listener,
and now part of it must be public — and owns the mechanism that keeps the
public part small. [browser-credential-boundary](../../../../security/data-and-transport/browser-credential-boundary/browser-credential-boundary.md)
is not this: it concerns credentials a web application ships to visitors, and
the only credential here is the daemon's own.

## When not to use this

A daemon that is never forwarded needs one listener, and a second one is
surface for no caller. The technique is triggered by the first tunnel, and the
right time to build it is before that tunnel is opened, not after the first
probe lands in a log that does not yet exist.
