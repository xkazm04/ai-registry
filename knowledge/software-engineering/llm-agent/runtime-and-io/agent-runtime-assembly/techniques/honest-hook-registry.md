---
layer: technique
type: technique
subject: agent-runtime-assembly
technique: honest-hook-registry
status: forged
laws: [failure-not-empty-success, absent-guard-is-loud, one-authority-per-vocabulary]
shared_with: []
use_when: [choosing which contributed callbacks get a timeout, a hung contributed callback wedges the conversation loop, a contribution registered for an event that never fires, adding an event name to a published extension contract]
---

# Honest hook registry

The registry of extension events — the list of names a contribution may
register against — is read as a set of promises. Registering for a name here
will get you called. A callback registered here will be bounded, so a slow one
cannot wedge the loop. Both promises are routinely false in ways nothing
detects, and both failures are silent by construction: a contribution that is
never invoked reports nothing, and a callback exempt from a timeout looks
exactly like a bounded one until the day it hangs. This technique makes the
registry state only facts that are currently true, in both directions. Per
[one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary),
it is the single definition of the event vocabulary — dispatcher, contract
document, configuration validator and any external-process variant of the
surface all derive from it.

## A timeout needs a safe abandonment direction

The universal rule is easy to state and widely repeated: bound every handler
by a registry-enforced timeout. It is a good rule with a missing predicate.

A timeout is not a limit on how long a handler may take. It is the decision to
**abandon a handler in flight** and continue without its answer — and
abandoning is only available where continuing without the answer has a safe
direction. Where a handler's class already fixes that direction, the rule is
right and applies without exception: an advisory observer passes on timeout, a
protective gate refuses, and both are defensible defaults chosen in advance.
The neighbouring standard for turn-boundary interceptors states exactly this,
for exactly those handlers. Two classes have no such direction, and for them a
timeout is not a safety mechanism but a second failure mode:

- **The last-chance flush.** A teardown handler whose whole purpose is to write
  state before an identity goes away. Abandoning it open loses the state it
  existed to save; abandoning it closed means nothing, because the thing it
  guards is ending anyway. There is no direction to choose, so the handler runs
  to completion.
- **The gate whose two wrong answers are both unsafe.** A dispatch-time policy
  check standing in for an authentication decision: abandon open and the check
  is skipped; abandon closed and legitimate traffic is dropped. Picking one
  silently is worse than the hang, because the hang is visible.

So the order is fixed: **classify the abandonment direction first, then
bound.** A handler with a safe direction is bounded and its fail mode derived
from its class. One without is *named* on an exemption list carrying a written
reason and the condition that would lift it — usually "give this handler a safe
direction", a design task rather than a configuration change. An exemption with
a reason is a known gap; one without is an oversight that looks identical.

Three mechanical rules keep the bounded half honest. The enforcing timer must
not itself hold the process open, or the timeout has traded a wedged turn for a
process that will not exit. The abandoned worker must not be joined — waiting
for the thing you gave up on reintroduces the hang, in the shutdown path where
it is hardest to diagnose. And because an abandoned worker is still live and
may still mutate shared state, a repeatedly-invoked hung handler is
**suppressed for a cooldown**; without that, every invocation accumulates
another. That liveness is itself an argument for the exemption list: abandoning
a handler that returns a value is survivable, abandoning one that writes state
is a race the runtime cannot see.

## No name ahead of its fire site

The second promise is that registering for a name does something. The failure
that breaks it is a refactor: a subsystem is rewritten, its only emit site
disappears, the name stays in the registry because nothing references it as
code, and contributions registered against it silently do nothing. Published
types keep compiling; registrations keep succeeding; the gap is measured in
months and found by a contributor wondering why their guard never fires. This
is [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
at the extension contract — "the event fired and the handler found nothing to
report" and "the event never fired" must not be the same observable — and where
the dead name is a decision point, it is
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) at its most
expensive: an installed, configured, believed-in guard absent since a change
nobody connected to it.

Four rules close it:

- **A name enters the registry in the same change as its emitter and its
  payload contract.** Not before, not "for later", not to reserve the
  vocabulary. A declared name with no emitter is a promise with no payer.
- **Registration for an unknown name is refused, loudly.** The tempting
  alternative — store it anyway, for forward compatibility with hosts that will
  have the event — is precisely the silent no-op, moved from the host's side to
  the contributor's. A contribution built against a newer host should fail to
  install on an older one with a message naming the event, not install and do
  nothing. The same holds for every other registration vocabulary the surface
  exposes, including the mutating points of
  [observer-and-mutator-surfaces](./observer-and-mutator-surfaces.md).
- **The pairing is checked mechanically, at build time.** Every declared name
  resolves to at least one live emit site. It is a cheap check and the only one
  that catches the failure, because the drift is introduced by a change that
  touches neither the registry nor any contribution.
- **A deliberate non-fire is written down as a refusal with a reason.** Where
  an event is *not* emitted on a path it plausibly covers — the operator's
  escape hatches on a run already in flight, say, where letting a contribution
  observe or one day veto them would turn a slow extension into a way to lose
  control of a live run — the absence is recorded at the name, so the next
  reader finds a decision rather than a hole.

## Where this stops

The neighbouring standard for turn-boundary interceptors owns the **risk
class** — advisory versus protective — and derives the fail mode from it. That
is machinery this technique depends on and does not restate: where a class
fixes the direction, its rule stands unchanged. What this adds is the predicate
under which that rule applies. Bounding is available to handlers that can be
abandoned; those that cannot are enumerated rather than silently bounded, which
is the honest form of the same policy. Read together: classify the direction,
bound everything that has one, name everything that does not.

[operator-tier-code-loading](./operator-tier-code-loading.md) owns what happens
when a contributed callback *fails* — the isolation wrapper, the origin rule
for cancellation, and the rule that a registration the host silently ignores is
worse than one it rejects. This owns what happens when it does not finish, and
what the registry may claim before any of that is reachable.

## Decision rules

- Derive every consumer of the event vocabulary from one registry definition.
- Classify each handler's abandonment direction before bounding it; bound the
  ones that have a safe direction and derive the fail mode from the class.
- Enumerate the unbounded handlers with a written reason and the condition
  that lifts the exemption; treat last-chance flushes and gates with two unsafe
  answers as its standing members.
- Keep the enforcing timer from holding the process open; never join an
  abandoned worker; suppress re-firing a timed-out handler for a cooldown.
- Add an event name only in the change that adds its emitter and its payload
  contract, and record a deliberate non-fire at the name with its reason.
- Refuse registration against an unknown event name; never store it for
  forward compatibility.
- Check at build time that every declared name has at least one live emit site.

## When not to use it

A runtime with a handful of internal callbacks and no published event contract
has no reader to mislead: the emitter and the registration are usually in the
same file, and a dead name is found by the next person to open it. It starts to
pay when the event list becomes an interface someone codes against without
reading the runtime — at which point the registry is documentation with the
authority of code, and every stale entry is a lie with a long half-life.
