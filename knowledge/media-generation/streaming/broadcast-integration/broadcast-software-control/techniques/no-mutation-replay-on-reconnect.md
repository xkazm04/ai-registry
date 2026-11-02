---
layer: technique
type: technique
subject: broadcast-software-control
technique: no-mutation-replay-on-reconnect
status: forged
laws: []
shared_with: []
use_when: [designing what a tool does when the control connection to the broadcasting software drops and returns, a request timed out and its outcome is unknown, several parts of a tool send requests to the broadcasting software concurrently]
---

# No mutation replay on reconnect

When the control connection to the streamer's broadcasting software drops, the tool does not
queue its pending changes and resend them when the connection returns. It reconnects,
re-reads, and recomputes what still needs doing from the state it now observes. A mutation
whose outcome is unknown is settled by looking.

## Why replay is wrong here

A request can be lost in either direction. If it never reached the software, resending it is
correct; if it reached the software and only the response was lost, resending it does the
change twice. From the tool's side the two are indistinguishable, and the mutations a stream
tool sends are almost none of them idempotent:

- "Create the overlay source" twice makes two sources, or fails on the second with "already
  exists" and leaves the tool unsure which one is its own.
- "Remove this placement" twice may, after the software has reused the item number, remove
  something else.
- "Switch to the segment scene" replayed after a gap of minutes yanks a live broadcast to
  wherever the tool wanted it before the streamer took over.
- "Start recording" or "start streaming" replayed is an outcome nobody asked for, on air.

Retry-on-reconnect libraries are built for systems where requests are idempotent or carry an
idempotency key the server deduplicates. The control socket of a broadcasting program
typically has neither, so the generic pattern is unsafe and the tool must opt out of it.

## The procedure

1. **One channel, one request at a time.** All requests from every part of the tool pass
   through a single serialised client. The software processes requests in order; concurrent
   senders interleave a create with a remove of the same object and the outcome depends on
   which response arrives first. Batching is fine when the batch is one unit sent from that
   channel.
2. **A bounded budget per request.** Each request has a timeout in seconds, not minutes. On
   expiry its outcome is recorded as unknown - not failed, not succeeded.
3. **On any failed operation, drop the connection.** A timeout, a protocol mismatch or a
   rejection that leaves the tool unsure of the peer's state discards the client; the next
   operation opens a fresh connection lazily and starts from a read. This is the simplest
   design that cannot replay: there is no reconnect loop and no queue for one to drain.
4. **On disconnect, drop the in-flight queue.** Pending mutations are discarded, with each
   one's intent noted so the reconcile step can recompute it.
5. **On reconnect, authenticate, read, reconcile.** Read the inventory, settle every unknown
   outcome against it (is the overlay there? is the placement gone?), then derive the
   remaining work from the present state and the tool's current intent - not from the old
   queue.
6. **Never replay a scene switch, a start or a stop.** Those are decisions about the live
   show, and the streamer may have made a different one while the tool was away. Re-derive
   them only from an explicit, current request.

## Decision rules

- **When the software answers "not ready, try later"** - typical during a scene-collection
  switch or shutdown - one delayed retry of a *read* is fine. A mutation answered that way is
  dropped and re-derived after a read, because the collection it was aimed at may be gone.
- **When the server closes the session as deliberately invalidated** (as opposed to a drop),
  do not reconnect automatically. Something - the streamer, another client, a credential
  change - ended the session on purpose; show it and wait for a human.
- **When reconnects repeat**, back off with a cap and keep the streamer's view honest
  ("disconnected since…") rather than flickering between states.
- **When a mutation must happen exactly once and the reconcile cannot tell** (no observable
  trace), surface the uncertainty to the streamer rather than choosing.

## When not to use it

Reads are safe to retry and need no reconcile. A tool talking to an instance it launched
itself, in a test harness where a doubled object is caught by the test, may accept simpler
retry behaviour; the rule binds against the streamer's live instance.
