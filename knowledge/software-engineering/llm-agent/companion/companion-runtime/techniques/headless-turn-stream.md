---
layer: technique
type: technique
subject: companion-runtime
technique: headless-turn-stream
status: forged
laws: [identity-survives-reuse, verdict-survives-boundary, creation-names-reaper]
shared_with: []
use_when: [a second transport needs to run companion turns, two messages arrive on one conversation at once, stopping a turn leaves state behind]
---

# The headless turn

A turn is the runtime's central callable: given a conversation and an input, it
produces a stream of typed events and ends in exactly one verdict. Everything
that shows a turn to somebody — a desktop surface, a local endpoint, a terminal
channel, a test driver — is an adapter over that callable and contains no turn
logic of its own.

## The signature is the design

```
turn(conversation_id, input, options) -> stream of turn events, ending in a verdict
```

Three properties make it portable, and losing any one of them re-couples the
runtime to a surface:

- **It takes identity, not objects from a host.** A conversation identifier, not
  a loaded conversation the caller assembled — otherwise every adapter needs to
  know how to build one, and they will build them differently.
- **It returns a stream, not a result.** Even an adapter that only wants the
  final text consumes the stream and takes the last event. A function with two
  shapes (streaming and non-streaming) becomes two implementations within a
  quarter, and the non-streaming one is where the missing telemetry lives.
- **It ends in a typed verdict** — completed, interrupted, failed with a
  classified reason — that travels intact to every adapter
  ([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).
  An adapter that has to infer "did that work" from whether the text looked
  finished will infer it wrongly on the day it matters.

The stream's own contract — event vocabulary, framing, ordering, backpressure,
what finalization means — is the streaming subject's, and this technique
deliberately borrows it rather than restating it. What is owned here is that the
turn *is* a function returning one, and that nothing above it may add turn
behaviour.

## Adapters carry transport concerns and nothing else

An adapter's legitimate work is transport-shaped: authenticating the caller,
translating the event stream into the wire format its channel speaks, mapping the
verdict into a status, and handling disconnection. The moment an adapter decides
what goes into the prompt, writes an episode, chooses a model, or decides whether
a turn may start, the runtime has a second implementation of itself living in a
transport — and that implementation will be the one that lags, because it is the
one nobody thinks of as the companion.

The diagnostic is a question with a checkable answer: **if this adapter were
deleted, would any behaviour be lost other than reachability over its channel?**
Anything that would be lost belongs in the runtime.

## One active turn per conversation

Two turns running on one conversation at once produce a history nobody wrote:
two model streams interleaving into one transcript, two sets of memory reads
against a state each is changing, two episodes describing an exchange that did
not happen in that order. Nothing crashes; the corruption is plausible, which is
what makes it expensive.

So the runtime holds a lock keyed on **conversation identity** — minted at
creation and stable across reconnects, restarts and resumption
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)), never
on a socket, a window, or a request. The moment the key is a transport artifact,
the same conversation opened in two places is two locks and no protection at all.

What a second arrival does is a **declared policy**, not whatever the race
produced. Three are defensible and they suit different products: reject it and
tell the caller a turn is in flight; queue it and run it after; or supersede —
interrupt the running turn and start the new one, which is the right answer for a
conversational companion where the newest thing a person said is what they meant.
What is never defensible is leaving it undeclared, because the untested branch is
the one that runs under load.

The lock names its reaper
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)): it is
released on completion, on interruption, on failure, on adapter disconnection,
and on process restart. A lock held by a dead turn is a conversation that has
gone permanently mute, and the person on the other end has no vocabulary for what
happened or how to clear it.

## Interruption is an outcome, not an absence

Stopping is a first-class path with three obligations, and systems routinely
honour the first and skip the other two:

1. **Stop means now.** Generation is cancelled and the cancellation propagates to
   the model leg, so an abandoned turn stops spending. A stop that lets the
   current request finish invisibly is a stop control that is fake in exactly the
   dimension that costs money.
2. **The record is complete anyway.** The turn still records what it did: the
   partial output kept or discarded by declared rule, the ledger row for whatever
   was consumed before the stop, and the interrupted verdict on the conversation.
   An interrupted turn that leaves no trace is indistinguishable from a turn that
   never happened, and the two have very different meanings the next time the
   companion reads its own history.
3. **The verdict reaches the caller.** Interrupted is not an error and not a
   success; it is its own value, and every adapter renders it as itself.

The same three obligations apply when the *adapter* disappears — a closed window,
a dropped connection. Whether the turn continues headless or is cancelled is a
product decision, but it must be a decision: a turn whose only consumer has gone
away and which nobody cancelled is spend with no reader.

## Where the second consumer pays for itself

The whole shape earns its keep the first time a companion must be exercised
without a person: a scripted conversation in a test, a channel that runs turns
from a terminal, an automation that asks the companion something on a schedule.
Each is a small adapter over an unchanged runtime. The alternative — turn logic
living inside the interactive surface — makes each of those a re-implementation,
and the re-implementations are how a companion ends up behaving differently
depending on which mouth it is speaking through.

## When not to do this

A product where the companion will only ever be spoken to from one surface can
keep the turn inline and lose nothing. But the cost of the shape is one function
signature and a lock, paid once, and the cost of retrofitting it is the untangling
of every place where the surface and the reasoning grew into each other — which
is why the honest advice is to take the signature early even when the second
adapter is hypothetical.
