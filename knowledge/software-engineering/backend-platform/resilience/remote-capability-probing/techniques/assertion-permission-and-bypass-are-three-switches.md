---
layer: technique
type: technique
subject: remote-capability-probing
technique: assertion-permission-and-bypass-are-three-switches
status: forged
laws: [absent-guard-is-loud, failure-not-empty-success]
shared_with: []
use_when: [adding an operator flag that turns a capability probe off, a single switch is doing duty for skip-the-probe and use-the-fallback, choosing the default for an unset probe control, a test enumerates the settings a subsystem publishes]
---

# Assertion, permission and bypass are three switches

A probe ladder acquires operator controls within weeks of shipping, because
somebody's peer behaves oddly and somebody else's costs too much. From a
distance every one of those requests reads as *let me control the probing*, so
they land as one flag. They are three decisions with different owners, different
blast radii, and different failure signatures, and collapsing them means the
operator who asked for the mildest one is handed the most destructive one.

## The three meanings

**Assertion — *I already know the answer for this peer; do not spend the round
trip asking.*** It is an optimisation, supplied by whoever administers the peer
or has measured it. Its blast radius is small and its failure is graceful: if
the assertion is wrong, the read path proceeds on a false premise and fails at
the first real request, which is a loud, immediate, per-peer error naming the
object. An assertion is the only one of the three that is safe to accept from a
per-peer configuration rather than a global one, and it is the only one whose
wrongness the system can discover on its own.

**Permission — *if the probe says no, you may take the expensive path.*** It is
a policy, and its owner is whoever pays the bill: bandwidth, egress, latency
budget, memory. Its failure is not an error at all. Granted where it should not
have been, the system quietly works and costs an order of magnitude more;
withheld where it should have been granted, a legitimate peer becomes
unreadable. Neither shows up as a failure of the probe, which is why this switch
in particular must be visible in whatever record says why a read behaved the way
it did.

**Bypass — *do not probe; go straight to the expensive path.*** It is an
override, and it is the only one of the three that can turn off the capability
the system exists to provide. Its blast radius is every read against every peer,
and its failure signature is the worst kind: nothing fails. Every result is
correct. Only the bill and the latency distribution change, and both of those
are attributed to load long before anybody suspects a flag.

## The rule

**Three independent switches, three separately stated defaults, and each
default argued at its definition.** The decisive one is the bypass's.

A bypass whose unset value resolves to *on* retires the capability for every
deployment that never configured it — which, in any deployed fleet, is nearly
all of them. This is
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) pointed at a
probe instead of a validator: the fleet converges on the default, so the default
*is* the decision, and a system that degrades to the expensive path because
nobody set a value has made its most consequential choice silently. The
correction is not vigilance. It is that an unset probe control resolves to the
posture the feature was built for, and any other resolution is announced where
an operator reads it — a boot line, a diagnostic surface — rather than inferred
from a bill.

The same law has a second edge here. When the bypass is on, the system never
finds out whether the peer supports fragments, and the state it is in — *we did
not ask* — is indistinguishable from *we asked and the answer was no* unless the
two are spelled differently
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
Record the verdict's provenance alongside the verdict: probed, asserted, or not
attempted. Without it the instrument in
[instrument-by-cause-not-by-hit-rate](./instrument-by-cause-not-by-hit-rate.md)
cannot tell an unsupportive fleet of peers from a switch nobody meant to leave
on.

## Decision rules

- **One switch per meaning, named for the decision rather than the mechanism.**
  A flag named after the probe ("skip the check") will be set by someone who
  wanted one of the other two.
- **The permission and the bypass are not the same value inverted.** Permission
  granted with bypass off is the intended configuration: probe, and fall back if
  the probe refuses. Permission granted with bypass on is *always fall back*.
  Permission withheld with bypass on is a contradiction the configuration reader
  must reject at load rather than resolve by precedence, because whichever
  precedence it picks will surprise half its operators.
- **An unset control resolves to the designed posture, not to the safe-looking
  one.** "Safe" for a probe control means *do not ask*, and *do not ask* is the
  expensive answer.
- **State the default beside the declaration and again in the operator-facing
  document,** with the consequence in the direction the operator cares about:
  not "probing enabled" but "each new peer costs one extra request; without it
  every read transfers the whole object".
- **Scope the assertion per peer and the other two globally.** An assertion is a
  claim about one address; a permission is a claim about a budget; a bypass is a
  claim about the whole feature. A configuration that offers all three at the
  same scope invites each to be used as the others.
- **A wrong assertion must fail loudly at first use.** If the read path silently
  falls back when an assertion turns out to be false, the assertion has become a
  third bypass with a friendlier name.

## The test that must enumerate every switch

These switches are usually serialized somewhere — into a settings payload, a
diagnostic dump, a snapshot the runtime layer reads. Whatever consumes that
payload is the last place a missing or mis-defaulted switch can be caught before
a fleet inherits it, so the test over that payload is the one that matters, and
it is routinely written to assert the presence of *some* of the switches.

A test that names three switches and asserts two of them certifies nothing about
the third, and the third is where the defect lives, because the switch nobody
asserted is the switch nobody thought about when the default was chosen. Two
rules make the test load-bearing:

- **Assert every switch by name and by value**, not merely that the payload
  contains members. A presence assertion passes on a payload that omits the one
  switch whose default is wrong.
- **Assert the defaults with nothing configured.** The configuration a fleet
  actually runs is the empty one, and it is the only configuration no
  hand-written test naturally covers, because the author was thinking about the
  values they were adding.

The characteristic incident is worth stating so it can be recognised: an unset
bypass resolving to *on* at two independent serialization sites, a test over one
of those payloads that checks the permission switch and not the bypass, and a
fleet that has been transferring whole objects since the flag was introduced —
correctly, expensively, and with a green suite the whole time.

## When one switch is right

If the feature has exactly one operator and one peer — a fixed internal store,
a single deployment — the three collapse honestly, and inventing three controls
for a system with one reader is over-engineering. The rule engages the moment
the peers are supplied by users, or the moment the bill is paid by someone other
than the person setting the flag; that is when the three meanings acquire
different owners and stop being interchangeable.
