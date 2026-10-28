---
layer: technique
type: technique
subject: browser-credential-boundary
technique: loopback-addressed-request-gate
status: forged
laws: [gate-sees-target, absent-guard-is-loud]
shared_with: []
use_when: [a local web app acts with the person's own command-line login or local files, a development server that defaults to listening on every interface, deciding which header proves a request was addressed to this machine, a local tool may one day be started behind a proxy or in a container]
---

# The loopback-addressed request gate

A class of application runs on the person's own machine and acts **as them**:
a local dashboard that shells out to a command-line client already logged in
to a forge, a cloud, a package registry; a tool that reads the home directory;
an agent console that pushes with the person's keys. Nothing in the browser
holds a credential, so the first regime of this subject seems not to apply.
It applies harder. The credential is the machine's ambient login, and every
request that reaches the port spends it. The browser holds nothing; the
*port* holds everything.

The naive reading is "it is on localhost, so only I can reach it". That is two
assumptions, and both fail by default. The first is about the listener: the
common development servers and many production starters listen on every
interface unless told otherwise, so "localhost" is merely the address the
person typed, not the only one that answers. Anyone on the same café network
reaches the same port. The second is about the browser: **any page the person
opens can address the local port**. A cross-origin request without a readable
response is still a request, and a page that controls its own name can point
that name at the loopback address after the browser has accepted its origin
(DNS rebinding). From then on the page is same-origin with itself, its
requests carry its own name as both Host and Origin, and it reads the answers.

## The rule: three names and one address, all loopback

Refuse, before anything is planned, read or executed, every request where any
of these names something other than a loopback name:

- **Host**, parsed as a hostname with its port stripped, compared against an
  exact set (the loopback name, the IPv4 loopback literal, the bracketed IPv6
  loopback literal). A rebinding page cannot set Host — the browser writes its
  own name there — so this one check defeats the rebinding attack outright.
- **The forwarded-host header**, every comma-separated entry, by the same
  parser. A proxy that rewrote Host still says what the caller asked for here.
- **Origin**, when present, parsed as a URL: scheme must be one of the two web
  schemes and the hostname loopback. The opaque origin (the literal `null`
  that sandboxed frames and some redirects send) is a refusal, not an absence.
- **Every forwarded-for address** — the de-facto header, the standardized one's
  `for=` parameter, the real-IP header — must be a loopback address (the whole
  IPv4 loopback block, the IPv6 loopback, and the IPv4-mapped form of the
  first). A single non-loopback entry anywhere in the list is a refusal.

The last clause covers a failure the first three cannot see. Behind a reverse
proxy or a hosting fabric's front end, the caller chooses the Host and can
write loopback into all three name headers; what the caller cannot easily
remove is the address the proxy *appends* for it. So "forwarded for someone
who is not this machine" is evidence of a hop, and a hop is exactly what a
local-only action must not have. Parse it permissively — quoted, bracketed,
with a port — and judge it strictly.

An absent Origin passes. Non-browser clients do not send one, and the person's
own scripts are legitimate callers; the gate's job is to refuse browsers
addressed under foreign names and requests that crossed a hop, not to
authenticate local processes.

## The header gate is only as good as the bind

Every header above is forgeable by a process that can open a socket to the
port. That is not a defect of the gate; it is the gate's precondition, and it
must be stated where it lives: **the server listens on the loopback interface
only.** Then the only parties that reach the port are processes on this
machine (whom the ambient login already trusts, since they could run the
command-line client directly) and browsers (whom the header gate sorts). Bind
to every interface and the header gate becomes a suggestion any neighbour on
the network can ignore by typing a header.

Neither half is optional, and each fails silently without the other — binding
to loopback alone leaves rebinding open, which is the published shape of a
recurring class of advisories against local agent and tool servers; the header
gate alone leaves the network open. So make the bind structural rather than
remembered ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)):
the start scripts pass the loopback host explicitly, and a test reads the
scripts and fails if either loses it. A guard that depends on someone typing
the right flag protects only the people who read the README.

## Decision rules

- When a handler acts with an ambient credential (a login, a key, a file the
  person owns), it calls the gate first and answers a refusal before any work.
  One function, pure over the headers, so it is tested without a request.
- Compare parsed hostnames against an exact set; never substring-match, never
  compare a raw header that carries a port.
- Judge the gate on what reached the server
  ([gate-sees-target](../../../../_laws.md#gate-sees-target)): the forwarded
  headers are the only trace of a hop, so read them rather than trusting that
  no proxy exists.
- The refusal names what the request named — so the person who opened the app
  under a LAN address learns to use the loopback name — and nothing about the
  login it protects.
- A read-only demonstration mode that never touches the ambient credential is
  not held to the gate; say so beside the gate, so nobody "fixes" the hosted
  demo into an outage.

## What it does not close

A proxy that rewrites Host to the upstream's loopback name and adds no
forwarding header passes every check, because nothing in the request records
the hop. The honest answer is a stated residual: never front the local app
with a proxy or a tunnel. When remote reach is genuinely needed, that is a
second listener with its own, smaller surface and its own credential — a
different design, not this gate with an exception.

The gate also does not authenticate. Every local process passes it. Where
other local users or untrusted local software are in the threat model, the
answer is a per-session credential the browser obtains from the person, not a
stricter header check.

## When not to use it

When the server holds its own service credential and serves the internet, the
loopback gate is the wrong shape — that is the broker regime, where callers
authenticate as themselves. And when a browser must never reach the action at
all, do not build it as a web endpoint; a command the person runs is smaller
than any gate.
