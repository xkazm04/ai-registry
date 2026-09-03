---
layer: technique
type: technique
subject: agent-runtime-assembly
technique: observer-and-mutator-surfaces
status: forged
laws: [one-authority-per-vocabulary, verdict-survives-boundary, absent-guard-is-loud]
shared_with: []
use_when: [designing the registration surface a contributed extension calls, a contributed callback's return value may or may not change behaviour, a policy denial is expressed by throwing an exception, deciding whether a new extension point is telemetry or policy]
---

# Observer and mutator surfaces

A runtime with an extension surface has to answer a question its
documentation usually leaves to the reader: **may a contribution's return
value change what happens?** Answering it per callback, in prose, produces a
surface where a returned value is sometimes obeyed and sometimes discarded,
and no consumer of a registration can tell which. This technique is the
structural answer: the runtime offers **two registration surfaces with
opposite return contracts** — one whose returns are discarded by the emitter
that dispatches it, one that exists only to change behaviour and declares
which point it wraps — so a contribution's power is legible from the call
that registered it.

## The two surfaces, and what makes them two

**The observer surface reports.** A contribution registers a callback against
a named lifecycle event, receives a payload, and returns nothing the runtime
reads — not by convention, but because the dispatcher discards every return.
The contract that follows is strong enough to build on: an observer cannot
refuse a call, cannot rewrite an argument, cannot delay a decision, and
therefore needs no ordering guarantee against the runtime's own gates.

**The mutator surface changes.** A contribution registers against a **closed
vocabulary of points**, each with a declared payload and return shape. The
recurring inventory is small and follows the two calls the runtime makes:
rewrite the model request, rewrite the tool arguments, wrap the model
execution, wrap the tool execution. Request points return a complete
replacement payload; wrapping points receive a continuation and return what the
call beneath them returns. Per
[one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary),
that set is defined once and every dispatcher derives from it; a second
hand-maintained list of "points that can change things" drifts the first time
someone adds a fifth.

The split buys three things a single surface cannot. A reviewer reading a
contribution's registrations knows its blast radius without reading its
handlers. The runtime can skip building an expensive payload when nobody
registered for the event that carries it. And the two surfaces carry different
failure policy honestly, because an observer's failure cannot have withheld a
decision.

## The rejected alternative: veto by throwing

The one-surface design expresses refusal as an exception. Its forces are real:
it needs no new registration kind and no result vocabulary, it composes with
whatever error handling already exists, and in most languages it is the
shortest thing a contributor can write. It is also the design that cannot be
made safe, for a reason that shows up at every consumer downstream: **a policy
denial and a contributor bug arrive as the same object.** The host cannot
attribute the refusal, cannot record it as a refusal rather than an error,
cannot apply the fail-open rule to the bug while honouring the denial, and
cannot show an operator which of the two happened. Per
[verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary),
the classification *this call was refused by policy* has to reach the boundary
that acts on it as a typed value; a refusal that survives only as an exception
type the contributor also raises by accident has not survived.

The second rejected alternative is subtler and more common: **one bag of hooks
where a returned value is honoured for some names and ignored for others.**
Its force is that it grows additively — a new behaviour-affecting event costs
one entry. But the growth is exactly the problem. Every consumer must carry
the table of which names are obeyed, the table lives in prose, and a
contributor who returns a directive from a name that is not on it has written
a guard that reports itself installed and does nothing:
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) at the
registration surface.

## Rules that keep the split from eroding

**The observer's return channel is closed by the emitter, not by the
document.** A dispatcher that reads returns "only for the names that support
it" is one refactor away from reading them everywhere. The observer emitter
discards, unconditionally.

**A directive-shaped return on the observer surface is diagnosed.** Discarding
silently is correct behaviour and a bad experience: the contributor believes
they have installed a gate. When an observer returns a value shaped like a
directive, the runtime logs it by name — which also makes the population of
would-be adopters discoverable before a mutating variant of that event ships.

**Behaviour-affecting entries on the observer surface are an enumerated,
closed exception list.** A runtime that grew observers first will have some;
pretending otherwise is worse than writing them down. They are documented as
compatibility, each with its exact return vocabulary, and the list does not
grow — a new behaviour-affecting need is a mutator point, not a sixth
exception.

**Neither surface may see raw internal objects.** Both receive normalized
payloads — sanitized, bounded, redacted, free of handles that would let a
contribution reach past its surface into the runtime's machinery. A mutator
that can reach the executor directly has both surfaces' powers and neither's
contract.

**A registration kind the host does not handle is refused, not stored** — the
rule [honest-hook-registry](./honest-hook-registry.md) states for event names,
applied identically to the mutator vocabulary.

## Where this stops

[semantic-hook-placement](./semantic-hook-placement.md) owns *where* a
contribution sits: which boundary it observes, resolved through a placement
class. This technique owns *whether it may answer at all, and in what
vocabulary*. The two are orthogonal and a contribution declares both — a
class says what it sees, a surface says what it may do about it. A runtime
that conflates them ends up with placement classes that secretly imply power,
which is how "put your telemetry at the tool-visible boundary" becomes an
authorization gate nobody reviewed.

[operator-tier-code-loading](./operator-tier-code-loading.md) owns the
*failure* protocol — the isolation wrapper, the observational-versus-
intercepting declaration that decides fail direction, and the origin rule for
cancellation. This technique owns the *success* protocol: what a healthy
return means. The two declarations agree by construction once the surfaces are
split, because a contribution on the observer surface cannot be intercepting.
[rewrite-before-the-gate](./rewrite-before-the-gate.md) takes the mutator
surface as given and governs where it sits relative to the policy path.

## Decision rules

- Offer two registration surfaces, not one: an observer surface whose returns
  the emitter discards, and a mutator surface whose points are a closed,
  singly-defined vocabulary with declared payloads and return shapes.
- Never express refusal by throwing; a denial is a typed result dispatched from
  the policy path, distinguishable at every consumer from a contributor fault.
- Discard observer returns in the dispatcher, unconditionally; diagnose a
  directive-shaped return by name rather than obeying or ignoring it silently.
- Enumerate any legacy behaviour-affecting observer events as a closed
  compatibility list with their exact return vocabulary, and add no more.
- Gate expensive payload construction on whether anything registered for the
  event; the split is what makes the uninstrumented path cheap.
- Hand both surfaces normalized payloads and no runtime handles.

## When not to use it

A runtime whose only contributions are written by the team that owns the host
has one reviewer for both power and placement, and the second surface is
paperwork. The technique starts to pay the day a contribution arrives that the
host did not review — at which point "can this thing refuse my tool calls?"
must be answerable from its registrations alone.
