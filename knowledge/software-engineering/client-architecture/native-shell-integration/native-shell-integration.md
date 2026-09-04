---
layer: golden-path
type: golden-path
subject: native-shell-integration
status: forged
use_when: [the product ships a native process that holds capabilities the presentation layer cannot reach, deciding what belongs in the host abstraction and what stays a guarded direct call, a feature works for the author and is silently dead for users on another platform, an overlay or a background stream behaves differently once the window is hidden, a surface placed over another application changes what the product can read from it]
techniques:
  - permission-gate-vector
  - capability-presence-contract
  - non-stealing-overlay
  - query-transparent-overlay
  - observer-perturbation
  - unexported-capability-ladder
  - layout-resolved-input-synthesis
  - native-owned-stream
---

# Native shell integration

Some products ship their interface as a presentation layer running inside a
document runtime, wrapped in a **native process** that the operating system
treats as a first-class application. The wrapper is usually described as a
packaging detail — "it is the same interface, in a window" — and that
description is the source of every defect in this subject. The wrapper is not
packaging. It is the only part of the product that holds an identity the host
will grant capabilities to, that can observe events addressed to other
applications, that can place a surface over somebody else's work, and that the
host will not suspend when nothing is on screen. This path is about **what the
native side owns**, how it says so, and what it owes the presentation layer
when the answer differs from one host to the next.

The discriminator against a purely in-document shell is sharp and worth stating
first, because the two subjects share vocabulary and share almost no rules. An
in-document shell owns the persistent frame around pages — navigation, chrome
geometry, session-lifetime machinery — and everything it does, it does inside
one document runtime's sandbox. This subject begins where that sandbox ends:
it applies when the product ships a native process holding capabilities the
presentation layer **cannot reach at all**, at any cost, under any framework.
Global input observation, surfaces over foreign applications, out-of-band
permission grants, unthrottled long-lived work. If nothing in the product needs
those, there is no native side worth integrating and this path is weight.

## The boundary with the neighbours

The **shape** of what crosses between the native process and the presentation
layer — generated declarations, drift gates, naming, error envelopes, timeout
classes — belongs to
[ipc-contract](../ipc-contract/ipc-contract.md) and is not restated here. That
subject answers *what a call looks like*; this one answers *what the native
side is entitled to do at all*, which is upstream of every call shape. The rule
a reader uses: if the question is "how does this value cross", it is the
contract's; if it is "which side may perform this act, and what happens on a
host where nobody may", it is this path's.

Acquiring, verifying and supervising external executables and large model files
is a different subject again, and the native process is merely its most common
host: whatever the native side spawns, someone else owns the spawning. Where a
transcript or any other text is **delivered into a foreign application**
through the shared channel the host provides, the obligations that delivery
creates — the receipt, the restore, the ownership check, the empty case —
already have an owner, and this path cites that discipline rather than
re-deriving it. What this path adds to that delivery is one layer below it:
*which event to emit so the target interprets it as the command intended.*
Finally, the trust question raised by a locally reachable listener — who may
talk to it, and how the caller proves it is the product — belongs to the
pairing and transport-selection subjects, not here.

## The abstraction carries what every host answers differently

The first decision a multi-host product makes is where to draw the injected
host interface, and the naive rule — "everything native goes behind the
interface" — is wrong in a way that gets more expensive with every host added.
The correct rule is a question about the *set of answers*, not about the
implementation language:

> Put a capability behind the host interface when **every host can answer it
> differently**. Reach for it directly, behind a capability flag, when only one
> host can answer it **at all**.

An interface member whose implementation on every other host is a throw, or a
no-op that returns a lie, has bought nothing. It has not made the caller
host-agnostic — the caller still has to know not to call it — and it has made
every future host satisfy a member no host can honestly implement. Saving a
file, checking for an update, reporting a version, starting and stopping the
engine: these are genuinely answered differently everywhere, and they belong
behind the interface. Observing a global input chord, reading an out-of-band
permission grant, parking a click-through surface over another application:
these are answered by exactly one host, and forcing them through the interface
converts a legible `if (native)` into an illegible member that throws.

The cost of the direct call is real and must be stated rather than hidden. Its
escape hatch is a guarded call site or a swallowed rejection, not a null object
— and **the count of guarded call sites is the metric that says whether the
line was drawn in the right place**. A handful, clustered in the components
that own those features, is the line working. The same guard scattered through
dozens of unrelated call sites is the signal that the capability has become
general and has earned a member after all. Measure it; do not argue it.

## Grants are a vector, and absence is a different axis entirely

Two capabilities the host grants to the product are not one "permissions are
fine" boolean, and collapsing them is the most common way this surface ships
broken. They have different blast radii. One capability's absence makes the
feature **dead** — no event is ever delivered, so arming anything downstream is
pointless. Another's absence is **swallowed silently** while the rest of the
pipeline still works, costing the user one stage of a feature whose other
stages are fine. The gate that arms the feature includes only the killers; the
rest are surfaced as a degraded notice, so the user keeps the share of the
feature that functions. Neither kind reports an error, which is why grant state
is *polled up front* rather than discovered by trying, and why the grant
happens out of band, in a surface the product does not control and cannot
observe — so the product reconciles on regaining focus, never on restart. The
[permission-gate-vector](./techniques/permission-gate-vector.md) technique owns
the vector, the blast-radius rule and the out-of-band reconciliation.

Grant state has a sibling that looks identical from a call site and is not:
**presence**. "The user has not granted this" and "this host has no such
capability, and no user action will ever produce one" are two different facts,
and a product that stores them in one boolean will eventually tell a user to
open a settings surface that does not exist on their machine — a refusal that
names the wrong cause, which is worse than no refusal at all
([unknown-is-not-a-value](../../_laws.md#unknown-is-not-a-value)). Every
capability therefore carries a per-host presence class alongside its grant
state, and a capability absent on a host is declared as such: refused with its
own reason, disclosed to the presentation layer before the user reaches for it,
and — where the underlying call is unsafe rather than merely useless — compiled
out rather than guarded at runtime. That is
[capability-presence-contract](./techniques/capability-presence-contract.md).

## Focus is a custody chain, and the host's answers are advisory

A native surface that annotates somebody else's work — a status pill, a
capture indicator, a floating control — must **never take focus**, because the
whole pipeline it serves depends on the user's original focus staying exactly
where the user put it. That is easy to state and hard to hold, because a
surface's teardown is not one call. On at least one host a transparent,
always-on-top window survives its own hide as an invisible click target: the
window is gone from the screen and still steals focus when the user clicks
where it used to be. So the teardown is defence in depth — suppress hit
testing, park the surface off any viewport, *then* hide — and the show path
deliberately omits the focus call rather than accidentally omitting it, which
is a comment's worth of difference that survives the next refactor only if it
is written down. The judgement is what remains **clickable**, not what remains
visible. [non-stealing-overlay](./techniques/non-stealing-overlay.md) carries
the teardown order and the reasons each layer is load-bearing.

The custody chain has a second half. If the product later delivers something
*into* the application the user was working in, it must hand focus back
deliberately — and that hand-back is an act the host is entitled to refuse. A
target that quit mid-flight, a grant revoked since the last check, a
cooperative-activation request the host declined: each returns a plain "no"
that a call site written for a void return will discard. **Verify the
hand-back before the first destructive step**, because the ordering is what
separates "the transfer did not happen" from "the transfer did not happen and
the user's clipboard is now full of our text"
([record-precedes-effect](../../_laws.md#record-precedes-effect) is the same
shape one level up).

## The overlay that reads is transparent in a third sense

Focus and clicks are two axes; a surface that *reads* the application beneath it
has a third, and it is the one nobody enumerates until the feature is built. The
host's structural interfaces — the ones that answer "what element is at this
point" — are global and return the **topmost** surface, which is by construction
the product's own. So a picker built over an always-on-top surface returns that
surface at every coordinate, and it does so with no error, because the interface
answered correctly the question it was asked. Visual transparency does not help;
neither does input transparency. What helps is a property the accessibility
layer's *own traversal* reads, declaring the surface not part of the tree, after
which the documented query walks past it unchanged. The two workarounds that
present themselves instead — observing input globally rather than querying, and
cloaking the surface at the compositor around each query — are rejected for
reasons worth carrying:
[query-transparent-overlay](./techniques/query-transparent-overlay.md) holds
them, along with the exclusion's construction-path rule and the outside-in
acceptance test that is to the query axis what clicking is to the click axis.

There is a second failure on the same axis that no amount of transparency
touches, because it happens in the *other* application. An instrument that
covers what it measures is inside the scene it measures, and some targets react
to being covered: an application that concludes it is fully occluded hibernates
its renderer and moves its accessibility provider out of the subtree the query
walks, leaving a placeholder behind. The query then returns a bare root with
nothing in it, no error, and no trace of the cause at the call site. The
discipline is to suspect the product's own surface before debugging the query,
to establish causation with a rig that removes the surface's contact with the
target and changes nothing else on the code path, and to fix at the perturbation
rather than at the reaction — because there is one surface and an open-ended
number of occlusion heuristics to defeat one at a time.
[observer-perturbation](./techniques/observer-perturbation.md) carries the
mechanism, the four impostors of an empty result, and the experiment.

## Reaching what the host does not export, and the rule that ends the climb

Occasionally the capability the product needs demonstrably exists in the host,
is used by the host's own components, and is not exported. What follows is a
ladder — published symbol data, hardcoded offsets, runtime resolution against an
anchor the function carries with it — where every rung costs more and lasts less
than the one below, and where the rungs that look cheapest are the ones that
fail silently: a resolution on a per-event path spends the feature's latency
budget on bookkeeping, and an offset written down from one release calls an
unrelated function on the next.

The load-bearing rule is not on the ladder at all; it is the one that says do
not climb it yet. **When the product's own instrument perturbs a subsystem, look
for that subsystem's own opt-out before building a scoped replacement for its
interface.** The two failures above are the demonstration: a scoped replacement
for the host's structural query, built to ignore the product's surface, was
retired in a single change by a property on the surface that the queried
subsystem already honoured. The replacement was not wrong — it was aimed one
level too low, at the interface used to observe rather than at the subject being
observed. Where the ladder is genuinely the answer, it is admissible only under
the obligations that make it survivable: resolve once at startup and never per
call, treat a failed resolution as a null with a stated fallback to the
supported interface rather than as a guess, and write the derivation beside the
result so the next person can re-run it.
[unexported-capability-ladder](./techniques/unexported-capability-ladder.md)
owns the search order, the rungs and those obligations.

## Reaching a foreign application means emitting what it will interpret

Synthesizing input into an application the product does not own is not "send
the keystroke". It is producing an event that the **target's** interpretation
layer will resolve into the command intended — and that layer is not the
product's, is not the same on every host, and is not documented anywhere the
product can read at runtime. On one host the target matches a command chord
against the *layout-translated character*, so a hardcoded physical key position
fires an entirely different command under a non-default layout. On another the
raw virtual key is delivered to the target regardless of layout, so hardcoding
is exactly correct. Two hosts, two opposite right answers — which is the whole
point of the technique. It is not "resolve the key"; it is *identify which
layer the target matches on, and resolve at that layer, and encode nothing
where the target matches on nothing*.
[layout-resolved-input-synthesis](./techniques/layout-resolved-input-synthesis.md)
owns the resolution, its threading constraint, its refresh trigger and its
conservative fallback.

## Long-lived work belongs to the process the host does not throttle

A stream owned by a presentation context that the host is entitled to throttle
is unreliable **by construction**, and no amount of reconnect logic repairs it:
a hidden or backgrounded view has its network suspended by policy, not by
error, so there is no failure for a reconnect to observe. The correct move is
to relocate ownership rather than harden the client — the native process holds
the stream, and events fan out to the view over the local bus the host does not
police. The view becomes a pure renderer of what it is handed.

The split is deliberate and partial, not a migration. A stream that only
matters while the view is visible may honestly stay in the view; suspension
while nobody is watching is the correct behaviour, and a hard cap is its
backstop. What moves is what must arrive whether or not anyone is looking. Once
moved, the stream carries the two numbers a long-lived subscriber always needs:
an idle timeout sized against the *producer's* heartbeat interval so it absorbs
exactly one missed beat and no more
([limits-are-derived](../../_laws.md#limits-are-derived)), and a reconnect
backoff that resets on a round which **produced a frame** — not on one that
merely connected, because a host that accepts the connection and then goes
quiet is the failure the timeout exists for, and resetting on connection turns
it into a hot loop.
[native-owned-stream](./techniques/native-owned-stream.md) carries both.

## The techniques

- [permission-gate-vector](./techniques/permission-gate-vector.md) — grants as
  a vector with per-capability blast radius; killers gate, degraders notify;
  polling instead of trying; reconciliation on refocus.
- [capability-presence-contract](./techniques/capability-presence-contract.md)
  — presence as an axis distinct from grant; the per-host capability matrix;
  refusing with the right reason; compile-out versus runtime guard.
- [non-stealing-overlay](./techniques/non-stealing-overlay.md) — the layered
  teardown, the deliberately-omitted focus call, and the clickability test.
- [query-transparent-overlay](./techniques/query-transparent-overlay.md) — the
  third transparency, the property the queried layer itself reads, the global
  hook and compositor-cloak rejections, and verifying from outside the product.
- [observer-perturbation](./techniques/observer-perturbation.md) — the
  instrument inside the scene it measures, the empty tree and its four
  impostors, the self-exclusion experiment, and fixing at the perturbation.
- [unexported-capability-ladder](./techniques/unexported-capability-ladder.md)
  — the search order that precedes the ladder, what each rung costs, and the
  five obligations that make a runtime resolution admissible.
- [layout-resolved-input-synthesis](./techniques/layout-resolved-input-synthesis.md)
  — which layer the target matches on, resolving there, the main-thread and
  refresh constraints, and the fallback constant.
- [native-owned-stream](./techniques/native-owned-stream.md) — moving stream
  ownership out of a throttleable context, what stays behind, and the derived
  idle timeout and productive-round backoff.
