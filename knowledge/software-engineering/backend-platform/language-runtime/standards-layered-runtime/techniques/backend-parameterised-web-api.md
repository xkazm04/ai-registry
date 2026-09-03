---
layer: technique
type: technique
subject: standards-layered-runtime
technique: backend-parameterised-web-api
status: forged
laws: [verdict-survives-boundary, absent-guard-is-loud]
shared_with: []
use_when: [implementing a standard API whose behaviour touches the host's I/O, letting an embedder replace where console output goes or how a network request is made, deciding what a guest program sees when a host backend fails]
---

# Backend-parameterised web API

A platform standard specifies an API to the letter and its I/O not at all. The
console API says which methods exist, how arguments are formatted, how groups
indent; it does not say where the text goes. The fetch API says how a request
is built, how a response is read, which errors are thrown; it does not say
which socket library sends it. A timer says when a callback runs relative to
others; it does not say which clock is read. The technique is to implement the
specified surface exactly once, and to make the unspecified part a **backend
trait** the host implements, with the runtime shipping a default so that a
program works with no host code at all.

The split has one immediate reward and one that arrives later. Immediately, an
embedder who wants console output in its own log stream, or fetch routed
through its own client with its own policy, implements a small trait and
changes nothing about what the guest sees. Later, when the runtime is
ported to a host with no sockets or no standard output, the API surface moves
unchanged and only the backends are rewritten — which is also the test that
the split was made in the right place.

## The trait shapes

Each backend is a trait with the host's verbs, not the standard's. A logger
has methods for the levels the console can emit and a notion of current
indentation, because that is what a host sink needs to render; it does not
mirror every console method, because formatting arguments is the standard's
job and belongs in the API implementation above the trait. A fetcher takes a
request the runtime has already built and returns a response the runtime will
unpack; it does not see the guest's arguments. A message sender delivers an
already-serialised message to a named target. A process provider answers the
questions the API can ask about the host process — arguments, environment,
working directory — without owning the API's guest-facing shape.

One host-owned decision sits closer to the guest than it looks. A relative
resource reference — a path without a scheme handed to fetch — is resolved
against a *base* the standard leaves to the environment: a page's location in
a browser, a working directory or a configured origin on a server. The base
is host knowledge, so **the fetcher trait carries a resolution hook with an
identity default**, and the API calls it before building the request. Without
the hook, every embedder re-implements base resolution by wrapping the API,
and the wrapping is where their programs start to differ.

**When a backend method starts to take guest values, move the work above the
trait**, because the backend is then re-implementing part of the standard, and
two implementations of the standard's behaviour — one in the API, one in each
host's backend — will disagree.

## The default backend is shipped, and it does something

**Every backend has a default the runtime ships, and the default performs the
obvious host action** — the logger writes to standard output and error, the
fetcher makes real requests, the process provider reads the real process.
A default that silently does nothing is the failure
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) describes from
the other side: a console whose default sink discards output means every
embedder who forgot to install a logger ships a runtime where programs cannot
report anything, and nothing tells them. Where a real default is impossible or
unsafe — a fetcher on a host with no network — the default is one that fails
loudly with an error naming the missing backend, never one that returns an
empty success.

The default is also the reference: an embedder's replacement backend is
correct when the guest cannot distinguish it from the default except through
the side effect the embedder intended.

## The error boundary

A backend fails in its own vocabulary: an I/O error, a connection refusal, a
sink that closed. The guest program is owed an exception of the class the
standard names, carrying a message that says what happened. **When a backend
returns an error, the API implementation converts it into the standard's
exception type at the boundary, and the conversion is the only place the
backend's error type is visible** — the guest never sees a host error type,
and the runtime never aborts on one. The classification the backend computed
— this was a network failure, this was a permission denial — travels into the
guest exception as the standard's error kind, not as prose in a message
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)):
a guest program branching on the exception's kind must be able to distinguish
the failures the standard distinguishes.

**When a backend error has no counterpart in the standard's error taxonomy,
map it to the standard's generic failure and preserve the message**, and
record the gap in the API's status header
([status-header-per-api](./status-header-per-api.md)), because a mapping
chosen by feel is where two embedders' programs start to disagree about the
same failure.

## Asynchrony belongs to the API, not the backend

A fetch is async to the guest — it returns a promise — and it may be either to
the host. The API implementation owns the guest-facing promise and the job it
enqueues; the backend either returns a future the runtime drives or blocks and
returns a result, and the API adapts. **Do not let the backend trait's
asynchrony dictate the guest's**, because the guest's is fixed by the standard
and a backend that forces a blocking guest call has broken the API for every
program that awaits it.

## When not to use it

An API with no I/O — a structured-clone routine, a text encoder, a URL parser
— has nothing to parameterise; giving it a backend trait is a seam with one
implementation that nothing will ever substitute. The technique applies where
the standard's silence about the host is real, which is exactly the set of
APIs whose behaviour differs between a browser and a server runtime.
