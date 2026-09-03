---
layer: technique
type: technique
subject: correlated-exchange-over-broadcast
technique: binding-parity-floor
status: forged
laws: [absent-guard-is-loud, verdict-survives-boundary, one-authority-per-vocabulary]
shared_with: []
use_when: [documenting which languages support an exchange pattern, a binding cannot read metadata, a control-plane mutation is recorded as applied without proof]
---

# The binding parity floor

A pattern carried in metadata is portable to exactly those participants that
can **attach metadata on send and read it on receive**. That is the floor.
It is not a quality bar or a maturity level; it is a capability test with a
yes/no answer, and a participant that fails it cannot host the pattern no
matter how much helper code is written above it.

The test has two halves and they fail differently, which is why "supports
metadata" is not a useful summary. A participant that can attach but not read
can *issue* a request and will never recognize the reply — it can be a client
only in the degenerate sense of one that never learns the answer. A
participant that can read but not attach can *serve* a request and cannot
echo the identifier, so its reply is unmatched by every correct client. A
participant with no metadata surface at all is outside the pattern in both
directions.

## Publish the table, per binding, per half

The obligation this technique creates is documentary, and it is the whole
point: **state the capability per binding as a table** — full, send-half,
receive-half, none — and put it beside the pattern's description so nobody
can read one without the other.

The failure mode it prevents is not a crash. It is a document that says the
pattern is available in every supported language, read by an integrator who
picks a language on that basis and discovers the hole at integration time,
after the architecture is set. The gap existed the whole time; the only thing
missing was the sentence admitting it
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)). A hole
that is announced is a scoping decision; a hole that is implied to be closed
is a defect in the documentation, which is the artifact people actually plan
against.

Two disciplines keep the table honest. It is **derived from the capability,
not from intent** — a binding that is scheduled to gain metadata support is
listed by what it does today. And it is **checked when the vocabulary
changes**, because the authority that defines the keys
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary))
is also the natural place to notice that one binding cannot express the new
one.

## Raising a binding to the floor

When a binding must gain the pattern, the work is at the boundary type, not
in the helpers. The message type crossing into that language must grow a
metadata surface — an accessor on receive, a parameter on send — and until it
does, helper functions in that language are building requests that carry no
identifier. Two intermediate states are worth naming because both ship:

- **Send-half only** is a real and useful state. The binding can act as a
  client of an exchange whose answer arrives as ordinary data on another
  edge, and it can produce correlated streams. It cannot implement a targeted
  wait. Say that in the table rather than calling it partial support.
- **A metadata surface that is present but lossy** — one that carries an
  application's own keys and drops unknown ones — is worse than absence,
  because it passes a naive test and silently breaks the echo obligation on
  which every reply match depends. Test the round trip with a key the binding
  has never heard of.

Do not paper over a missing surface by smuggling correlation identifiers into
the payload. It works for one exchange between two participants you control,
and it makes the identifier invisible to every layer that classifies messages
by metadata: the queue policy that protects correlated events, the recorder,
the bridge, the observability layer. The pattern's portability came from all
those layers agreeing on where correlation lives, and payload smuggling
withdraws that agreement for one language.

## The same discipline in the control plane: commit on the exact reply variant

A control-plane mutation — register a participant, change a route, apply a
policy — is a request, and its confirmation is a reply. The parity discipline
appears here as a rule about *which* reply counts:

**A mutation is recorded as committed only when the exact typed reply variant
for the request that was sent comes back.** Not "a reply arrived." Not "a
reply arrived and it was not an error." The variant.

Two bug classes are the reason, and both are ordinary code that reviews well.
The first is a handler that treats any successful reply as proof, so a
response to a *different* in-flight request — a parameter-set confirmation, a
heartbeat acknowledgement — commits a mutation the responder may have
rejected. The second is a mutation whose reply variant carries no payload,
which a forwarding layer skips as uninteresting; the caller then waits for a
reply nobody will forward and fails on its own bound long afterward, reporting
a dispatch timeout for a mutation that was applied successfully. An empty
reply is still a reply, and its emptiness is the answer.

Both are prevented by the same rule and the fix has a shape worth copying:
give **every** mutation its own named reply variant, even the ones whose
answer is "it worked", so that the reply type enumerates the request type and
a caller matching on the wrong variant does not compile. The variant is what
makes an unrelated reply unmatchable rather than merely unlikely, and it is
what stops a null reply from being indistinguishable from no reply at all.

The general form is that a classified outcome must reach the boundary that
acts on it as a typed value
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).
A control plane that matches on shapes rather than variants has erased the
verdict one hop before the place it mattered, and what it writes down is a
belief rather than a record.

## When not to use this

A single-language system has no parity problem and needs no table; the floor
is a fact about multi-binding surfaces. The control-plane half is different
and is not exempted by language count: any request/response mutation, in any
number of languages, commits on its own reply variant or it is guessing.
