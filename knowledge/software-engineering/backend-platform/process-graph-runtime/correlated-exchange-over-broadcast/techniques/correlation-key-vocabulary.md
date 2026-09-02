---
layer: technique
type: technique
subject: correlated-exchange-over-broadcast
technique: correlation-key-vocabulary
status: forged
laws: [one-authority-per-vocabulary, one-validation-door]
shared_with: []
use_when: [adding a new exchange pattern to a broadcast bus, a scheduler misclassifies correlated traffic as ordinary, plumbing keys are leaking into application code]
---

# The correlation key vocabulary

Every exchange built on metadata is, in the end, a list of key names. A
request identifier. A goal identifier and a goal status. A session
identifier, a segment identifier, a sequence number, a finality marker, an
interruption marker. The list is short enough to hold in your head and that
is exactly why it gets duplicated: it is easier to type six string literals
than to import them, and each duplication is invisible until the seventh key
is added.

## One definition, and every predicate derived from it

The vocabulary lives in **one shared module** that every participant depends
on — the sender helpers, the receiver helpers, the scheduler that decides
which queued message to serve next, the recorder that writes messages to
disk, the bridge that translates them onto another transport
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
That module exports the names *and* the predicates built from them, and no
other file constructs a predicate of its own.

The predicate that matters most is the classifier: **is this message part of
a correlation, or is it ordinary traffic?** Several layers need it for
different reasons. A queue eviction policy needs it, because dropping a
correlated event is not the same as dropping a frame of sensor data —
dropping the frame costs freshness, dropping the reply hangs a caller.
Interruption semantics need it, because a request to discard queued messages
must not discard the reply somebody is waiting on. Observability needs it,
because a correlated message is a span and an ordinary one is a sample.

The subtlest consumer is the type system. An ordinary edge carries one payload
shape, and runtimes exploit that: a static check that the sent shape matches
the declared one, a decoder that negotiates a schema once per edge and then
sends schema-less payloads against it, a cache keyed by edge. A correlated edge
breaks the assumption — several shapes legitimately share it, distinguished by
metadata — so each of those mechanisms must **exempt correlated messages**, on
the send side, on the receive side, and on any inspection path that keeps its
own cache. Three exemptions in three layers is exactly the shape that grows
three private copies of the predicate, and the failure they produce is the
quietest one in the system: a well-formed reply dropped by an optimization
that decided its shape was wrong.

If each of those layers writes its own `is_correlated` — one checking three
keys, one checking four, one checking a prefix — the system does not fail
loudly. It fails on the day a key is added, in exactly one of the layers, and
the symptom is a caller that hangs under load because a policy that was
supposed to protect its reply did not recognize the new exchange as an
exchange. Derive every one of them from the single list, so that adding a key
is one edit and the whole runtime learns it at once
([one-validation-door](../../../../_laws.md#one-validation-door)).

## Namespace the internal keys and strip them at the boundary

Not every key on a message is the application's business. Transport
bookkeeping, schema negotiation, routing hints and the correlation plumbing
itself are the runtime's, and an application that can read them will
eventually read them — and then the runtime cannot change them.

The rule is two-part and both halves are needed. **Internal keys carry a
reserved namespace prefix**, so that an application key can never collide
with a runtime key and a reader can tell at a glance which is which. And
**the boundary strips them**: the metadata handed to user code contains the
application's own keys plus the correlation keys the application is meant to
act on, and nothing else. Stripping without namespacing is a filter list that
rots; namespacing without stripping is a convention nobody enforces.

Stripping is not hygiene, it is correctness, and the reason is the echo
obligation this subject rests on. Copying an incoming message's metadata onto
an outgoing one is the *documented* way to keep a correlation id alive, and it
is also how a replay or forwarding node normally works — so whatever internal
keys survived the decode ride out on a new message that they no longer
describe. A stale decoding hint attached to a fresh payload makes receivers
reject it as a shape mismatch, and the rejection is silent because from the
receiver's side the message is simply not the one it was told to expect. Strip
at every wire-to-user boundary, once, in the shared module — not at each
forwarding site, which is the same duplication problem one layer down.

The keys an application *does* see are the ones it must echo or act on — the
request id it has to copy onto its reply, the goal status it has to set, the
finality marker that ends a segment. That is the deliberate seam: the
vocabulary is internal machinery except for the part the endpoint discipline
requires the application to participate in, and that part is documented as an
obligation rather than exposed as a convenience.

## Adding a key is a versioned change to the envelope

A key added to the vocabulary changes what a receiver may encounter, which
means it changes the envelope. Two disciplines keep that from being a silent
break. The metadata carries a **version that is bumped whenever the shape
changes**, so a peer speaking an older vocabulary is rejected at registration
with a clear message rather than misparsing at the first surprising message.
And every new key is **optional on read** — a receiver that does not know it
treats the message as it would have before, because the additivity of the
whole convention posture rests on old receivers surviving new senders.

The one thing a new key must never do is change the meaning of an existing
one. Overloading a status field with a new value, or making a previously
optional id mandatory, breaks receivers that were correct yesterday and does
so without a version bump, because the shape did not change — only the
semantics did, and no gate reads semantics.

## Types, not free strings, wherever the language allows it

Metadata is usually a string map on the wire, and it is tempting to leave it
one in memory. Do not. Wrap the vocabulary in the strongest types the binding
offers — an enumeration for the status set, a distinct type for each
identifier kind, constructors that mint an id rather than a call site that
formats one — so a goal id cannot be passed where a request id is expected
and a status cannot be assigned a value outside the set. The wire stays
strings, the endpoints do not, and the class of bug where a correct-looking
string is put under the wrong key stops existing above the serialization
boundary.

Where a binding is too thin to carry types — and on any metadata-only pattern
some binding will be — the vocabulary module still exports the constants, so
even the weakest participant is spelling the keys from the authority rather
than from memory.

## When not to reach for this

A single exchange between two components that were written together, will
always be deployed together, and are not on a bus at all does not need a
vocabulary module; it needs a function signature. This technique starts
paying at the moment there is a *second* pattern or a *second* language,
because that is when the list stops being memorable and starts being a
contract. It stops paying — and starts actively misleading — if the module
becomes a dumping ground for every constant the runtime uses. It holds the
keys that define exchanges. Routing hints, tuning parameters and feature
flags are not exchanges, and a vocabulary that includes them can no longer be
read as the answer to "what makes a message correlated?"
