---
layer: technique
type: technique
subject: voice-io
technique: caller-scoped-voice-binding
status: forged
laws: [unknown-is-not-a-value, failure-not-empty-success, one-validation-door]
shared_with: []
use_when: [several automated callers share one speech channel, choosing which voice an unhosted request speaks in, an unrecognised voice name silently produced the default voice, deciding where a per-client speech preference is stored]
stage: team
---

# Caller-scoped voice binding

Once the channel admits callers the product does not host, "the default voice"
stops being a sufficient answer to *which voice*. Several automated callers
share one output device and one endpoint, they speak into the same room, and
with a single global default they are indistinguishable to the listener: three
different clients, one voice, no way to tell which of them is talking without
looking at a screen the listener is not looking at.

The correction is small and it is the whole technique: **voice identity is
resolved per caller, through one fixed precedence, whose last arm is an
error.**

## The precedence

```
explicit argument  →  per-caller binding  →  global default  →  error
```

Read it in order, take the first arm that produces a voice, and stop:

1. **Explicit argument.** The request named a voice. The caller knows what it
   wants for this utterance and outranks any stored preference.
2. **Per-caller binding.** Stored configuration keyed by the caller's
   identifier: the voice this caller speaks in when it does not say.
3. **Global default.** The product's configured playback voice — the same one
   the hosted surfaces use. One value, not duplicated per caller.
4. **Error.** No voice could be resolved; the request fails with a message
   naming where a default is set.

**The terminal error is the load-bearing arm, and there is no fifth.** A
resolution chain whose last step is "pick something" cannot fail, which sounds
like robustness and is the opposite: it converts every misconfiguration into
audio in an arbitrary voice, delivered to a listener with no reason to suspect
anything went wrong. Speech that cannot be attributed to a chosen voice is not
a degraded success
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success));
it is a failure that happens to be audible.

## An explicit argument that does not match is an error, not a fall-through

This is the arm implementations get wrong, and the mistake is subtle enough to
survive review: the request named a voice, the lookup missed, and the code
continues down the chain to the binding or the default. It feels forgiving. It
is a laundering step — the caller's *unknown* voice reference has been rendered
as a *definite* one
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)), at
exactly the boundary where an optional lookup result meets a non-optional
parameter.

The consequences are worse than a plain misconfiguration, because the caller
asked. A typo in a voice name, a voice deleted since the caller's configuration
was written, a caller pointed at a different installation — each produces
confident speech in the wrong person's voice, and the caller's logs say the
request succeeded. So: **explicit and unmatched terminates the chain**, with an
error naming what was asked for and what exists. The rule generalises past
voices to every explicit parameter the door accepts (engine, language, delivery
style): an argument the caller supplied and the product could not honour is
reported, never approximated.

The remaining arms fall through legitimately, and the asymmetry is the point:
arms 2 and 3 are *the product's* stored guesses about what the caller wants, so
a stale one degrading to the next guess is correct. Arm 1 is the caller's
statement, and a statement is either honoured or refused.

## One row per caller, not a singleton

The binding is a table with one row per caller identifier, created on first
sighting of a caller the product has not seen before. Two properties follow
from that shape and neither is available from a single "automation voice"
setting:

- **It scales to callers nobody enumerated.** The set of automated clients on a
  machine is open — a new assistant, a new script, a colleague's tool. A
  configuration model that requires a caller to be registered before it can
  speak makes every new client a settings task; a row minted on first contact
  makes the settings surface a *list of what has actually called*, which is
  also the only honest inventory of who is using the door.
- **It gives the listener a discriminator.** Distinct voices per caller is the
  cheapest possible attribution channel, and it works while the listener is
  looking elsewhere — which is most of the time. It complements, and never
  replaces, the surface
  [unattended-caller-attribution](./unattended-caller-attribution.md) requires:
  a voice tells you *which* caller, only if you already know the mapping.

A first-sighting row also carries a timestamp of last contact. It costs one
column and it answers the single most common configuration question the door
generates — *did my client's identifier actually arrive* — without a log dive.

## The identifier is disambiguation, not authentication

The caller states its own identifier. Nothing verifies it. Any client can send
any other client's identifier and inherit its binding, and a client that sends
none simply resolves at the global default.

Say this plainly in the technique and in the surface, because the table looks
exactly like an access-control table and will be read as one otherwise. What
the identifier buys is the ability to tell callers apart *when they cooperate*,
which is enough for the thing it is for: giving distinct callers distinct
voices and keeping a visible inventory. What it does not buy is any claim about
who is on the other end. Binding a high-stakes voice — a clone of a real person
— to an identifier is therefore binding it to an unverified string, and that is
a reason to scope such voices deliberately rather than a reason to trust the
string.

The question of whether the door should admit the caller at all — origin
checks, a shared secret, what a listener bound to a local address is actually
reachable by — is a property of the transport that opened the door, is owned
elsewhere, and is not softened by anything in this file. A product that treats
a local listener as trusted because it is local has made that decision, not
inherited it.

## Where the binding lives, and the door it passes through

A per-caller binding is **stored configuration that outlives voices** — the
same class as a persisted voice preference, and subject to the same hazard: the
voice it names can be retired, deleted, or belong to an engine no longer
installed. Every read of it therefore passes through the normalization door
owned by [engine-abstraction](./engine-abstraction.md)
([one-validation-door](../../../../_laws.md#one-validation-door)), so a binding
pointing at a dead voice degrades exactly as a user's stored preference does —
visibly, on read, without being eagerly rewritten. A resolver that reads the
binding table directly is a second reader of voice configuration, and the
product will disagree with itself the first time a voice is removed.

Two placement rules keep the table from growing into a second settings system:

- **The global default is not copied into the rows.** A caller with no bound
  voice has no voice column, and resolves to the product's default at request
  time. Copying the default in at row-creation time freezes it: changing the
  product's default then changes nothing for the callers that already exist,
  which is the classic two-copy vocabulary race with an audible symptom.
- **The row holds preferences, not capabilities.** Which voice, which engine,
  whether the caller's text is rewritten before speaking — these are defaults
  for requests that do not say. Whether the caller *may* speak, how often, and
  whether it may capture are policy, and policy that lives in a row minted
  automatically on first contact has granted itself.

Voice references stored in a row obey the same rules as any other stored voice:
a **selected** voice is a reference that may go stale, an **authored** one
stores its specification rather than an identifier
([authored-voice-identity](./authored-voice-identity.md)), and neither is
resolved anywhere but through the door above.

## When not to use this

- **One caller.** A single automated client and a global default are the same
  thing; the table is ceremony until the second caller appears.
- **The callers are hosted surfaces.** Speaker identity within the product is
  the catalog's job, and [tts-pipeline](./tts-pipeline.md)'s rule that identity
  is consistent within a context already covers it.
- **The product needs one recognisable narrator by design.** Where the voice is
  the product's own persona, per-caller variation is a defect, and attribution
  must be carried entirely by the surface rather than by timbre.
