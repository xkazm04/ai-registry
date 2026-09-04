---
layer: technique
type: technique
subject: execution-state-checkpointing
technique: restore-semantics-belong-to-the-format
status: forged
laws: [one-authority-per-vocabulary, failure-not-empty-success, verdict-survives-boundary]
shared_with: []
use_when: [one capture API must cover backends whose restores mean different things, deciding where a stored capture is checked against the thing that will restore it, a backend genuinely cannot capture and needs a way to say so, publishing which captures can move between backends]
---

# Restore semantics belong to the format

One interface, several capture mechanisms, and their restores do not mean the
same thing. A filesystem commit restores by booting a fresh instance, so
processes die and long-running work is relaunched. A full machine image
restores by resuming processes mid-instruction. A provider-side handle restores
by asking somebody else's service to do it, at whatever boundary that service
chose. These are not variations in quality; they are different contracts, and a
caller that assumes one and receives another has a defect it will find at the
worst possible moment.

The resolution is to stop pretending the interface hides the difference.
**The format identifier carried beside the payload is the contract; the payload
itself is opaque.** Everything below follows from taking that literally.

## The storing layer never looks inside

The layer that persists captures, lists them, and routes them to a consumer has
a complete job that requires no interpretation: take a payload, write its bytes
and its identifier, hand both back later, and pick a consumer that has said it
can read that identifier. It does not parse the bytes, does not sniff them, and
does not branch on their contents.

That restraint is what makes new capture mechanisms cheap. A backend is added
by choosing an identifier, producing payloads under it, and declaring it — with
no change to storage, orchestration, or any surface above. The moment the
storing layer learns to recognise one payload's internals, adding the next
mechanism means editing the storing layer, and the seam that justified the
design is gone.

The rule for callers is the same in the other direction: **a caller may route a
payload it cannot interpret, and must never infer semantics from the bytes.**
Routing is a legitimate operation on an opaque value. Guessing is not, and a
caller that reads a payload's header to decide whether processes will survive
has taken ownership of a contract it does not hold and cannot be told about
when it changes.

## Each restoring side declares what it consumes

The consuming half of the contract is a published list: every backend states
the set of identifiers it can restore from. The declaration is data, on the
backend, not documentation next to it — because it is going to be read at run
time by the layer that dispatches.

The vocabulary of identifiers itself is defined once and derived from by both
halves ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
Two hand-maintained spellings of the same format name — one where it is
produced, one where it is declared — is a race with a delay fuse: they drift
when somebody adds a version suffix on one side, and the symptom is a restore
refused for a capture that would have worked.

Keep the vocabulary **open**. Identifiers are strings, not members of a closed
enumeration, so a backend can define a private format without editing shared
code and a format can evolve by minting a new versioned name rather than
mutating an existing one. An open vocabulary also means an unrecognised
identifier has to survive a round trip through storage intact — decoding an
unknown name must preserve it, not collapse it to a default, or a capture
written by a newer producer becomes unroutable after one save-and-load.

## Refuse at dispatch, and refuse is the right word

Here is the seam that catches teams out. The general rule for versioned
machine-readable identifiers is that an unknown value is *ignored* so the
format can grow without breaking old readers. That rule is right where the
identifier annotates something the reader can still use, and it is wrong here,
because the identifier *is* the thing being routed. Ignoring it does not
degrade a feature; it hands a consumer a payload it cannot interpret.

So: **validate the stored payload's identifier against the target's declared
set before dispatching, and refuse when it is absent.** Two details make the
refusal worth having.

It happens **above** the backend, at the dispatch point, not inside each
backend's restore path. Validation inside each backend is validation minus
whichever backend is written next, and the one written next is the one whose
author had not read this. One check, at the single place where a stored capture
meets a chosen consumer.

And the message **names both sides**: the identifier that was requested and the
full set the chosen target supports. A refusal that says only "unsupported
format" sends the reader to the wrong layer — they go looking for a corrupt
payload when the real answer is that they selected the wrong backend, or moved
a capture between two that share no format. The verdict must reach the caller
as something it can branch on and a human can act on, not as a generic failure
with the classification lost on the way out
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).

## "Supported formats: none" is an answer

Some execution environments genuinely cannot be captured — a bare process with
no isolated filesystem has nothing to capture that would mean anything on
restore. The declaration must be able to say so, and an empty set is the honest
spelling.

What follows is the part that gets skipped: a backend that declares nothing
returns an **explicit error from both the capture side and the restore side**.
Not an empty payload, not a zero-length blob, not a success with nothing behind
it. An empty capture stored successfully is the most expensive shape available,
because it is discovered at the resume — the moment somebody needed the state
back ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
The same applies to the surface above: an affordance that offers to capture an
environment whose backend has declared no formats should not be offered at all,
rather than offered and failing.

## Portability is a table, not an adjective

The declarations, taken together, are a matrix: for each identifier, which
backend produces it and which backends consume it. Publish it. It converts
"our captures are portable" — unfalsifiable, and usually false in one direction
— into a claim a reader can check against a specific pair.

Read it as follows. An identifier with **one producer and one consumer** is
private; it is a handle into that runtime's own store and the previous
technique's namespacing rule applies to its name. An identifier with **one
producer and two or more consumers** is a portability claim, and it owes a
round-trip test that actually captures on one and restores on the other,
because it is the only claim in the table that can silently stop being true. An
identifier with **no consumer** is a reservation and should be marked as one;
it is a name held for future work, and it must never be selectable in the
surface that stores captures.

## Decision rules

- Store the identifier beside the payload and treat the payload as opaque
  bytes; never branch on its contents in the storing layer.
- Route an uninterpretable payload freely; never infer its semantics.
- Have every restoring backend declare its consumable identifier set as data.
- Define the identifier vocabulary in one place and derive both halves from it.
- Keep the vocabulary open, evolve a format by minting a new versioned name,
  and preserve an unrecognised name through storage rather than defaulting it.
- Validate the identifier against the target's declared set at the dispatch
  point, once, above the backends.
- Refuse an undeclared identifier rather than ignoring it, and name both the
  requested identifier and the supported set in the refusal.
- Let a backend declare an empty set, and make both its capture and its restore
  return explicit errors rather than empty successes.
- Publish the producer-to-consumer table and require a round-trip test for
  every identifier with more than one consumer.

## When not to use it

A system with exactly one capture mechanism, and no prospect of a second, does
not need the identifier or the declaration — a single format tagged with its
own name is ceremony, and the check will never have refused anything. Introduce
the identifier when the second mechanism is real, and let the second one shape
the vocabulary; the version minted for the first mechanism alone will encode
that mechanism's assumptions into the shared name.

The technique also does not apply to captures whose consumer is fixed at
capture time and never re-selected — an in-process undo buffer, a restore path
with one implementation compiled in. There the contract is enforced by the type
system and an identifier string adds a way to be wrong.
