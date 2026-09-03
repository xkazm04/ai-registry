---
layer: technique
type: technique
subject: multi-provider-gateway-plane
technique: upstream-identity-before-inventory
status: forged
laws: [unknown-is-not-a-value, gate-sees-target, one-authority-per-vocabulary]
shared_with: []
use_when: [several implementations answer on one wire protocol and the plane must say which is which, a framework header is standing in for a product identity, deciding what to do with an endpoint that answers but names nothing, an empty inventory made a reachable upstream look like the wrong product]
---

# Upstream identity before inventory

A plane that fronts several upstreams is usually described as if its candidates
were given: someone configured an address, and the address *is* the identity.
That holds while every upstream speaks its own dialect, because the dialect
identifies it. It stops holding the moment the upstreams converge on **one wire
protocol** — and convergence is the direction this class of software moves,
because a shared protocol is what lets a caller swap one for another.

The consequence is specific and easy to miss: **a shared protocol is designed to
make implementations interchangeable, so it deliberately does not identify the
implementation.** An address that answers the protocol tells you the protocol is
there. It does not tell you which program is behind it, and every per-upstream
behaviour the rest of this subject depends on — the framing table, the policy
leaf, the translation quirks, the capability set — is keyed on an answer nobody
has yet obtained.

## Identity is established before anything is imported, not after

The ordering is the technique. A plane that lists an endpoint's models first and
identifies the endpoint second has already put records into its inventory under
an identity it was guessing at, and the correction — if it ever comes — has to
walk back rows that other subsystems have started reading.

So: probe for identity, then import. The identity probe is cheap, it runs once
per endpoint rather than once per record, and its result is the key everything
downstream is filed under.

## Identify by something only that implementation serves

There is a hierarchy of evidence here, and the difference between its top and
its bottom is the difference between a correct plane and one that mislabels an
upstream on a machine you cannot reach.

**Strongest: a route that only this implementation exposes.** An implementation
that offers its own native management surface alongside the shared protocol has
published a discriminator by construction. A generic server speaking the shared
protocol does not answer that route; one that does is the thing you are looking
for, and the route usually returns richer data than the shared protocol does —
fields the shared schema has no word for, which are themselves the proof.

**Strong: a field in the shared protocol's own response whose value is a
namespace the implementation controls.** Many protocols carry an ownership or
publisher field per record. Read it from the *response*, not from configuration.

**Weak, and the one that will burn you: a header the framework supplies.** The
web framework an implementation was built on stamps its own identity on every
response. That header identifies the framework, which is shared by thousands of
unrelated programs, and it will happily identify a completely different service
that happens to sit on the same framework. It looks like evidence because it is
specific-looking and always present; it is evidence about the wrong layer
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

**A last resort with a real use: the root path's banner.** Some implementations
answer their root with a plain-text line naming themselves. It is crude, it is
undocumented, and it is exactly the right fallback for the case in the next
section.

## The empty-inventory hole

The failure this technique most often actually hits is not a wrong answer, it is
a **structurally unavailable** one: an implementation with no models loaded yet
returns a well-formed, empty list. Every per-record discriminator — the
ownership field, the naming convention, the id namespace — lives *inside the
records*, so a correct implementation returning zero records supplies zero
evidence about itself.

An identity scheme that reads only per-record fields therefore has a hole shaped
exactly like a fresh install: the endpoint is reachable, the protocol is
answered, and the plane cannot say what it is. The two acceptable answers are a
non-record-bearing probe (the native route or the banner), or **unknown** —
never the plane's most likely guess
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). A
plane that resolves the empty case to a default upstream type has arranged to be
wrong specifically on machines where somebody is setting things up for the first
time, which is where the confusing bug reports come from.

## Write the evidence down, with its date

Every rule above is a claim about somebody else's program, and it decays: a
release adds the ownership field that was missing, a framework changes its
header, a native route moves. Identity rules are therefore **dated observations,
not invariants**, and the file that holds them should say against which version
of which implementation each was measured.

That record costs a comment and it is the difference between a rule a later
maintainer can re-verify and a magic string nobody dares touch. It also makes
the decay visible: a discriminator whose measurement date is a year old, over a
project that ships monthly, is a re-verification task rather than a fact.

## What this owes the rest of the plane

- **The identity, the evidence class that produced it, and the probe's date** on
  the endpoint record — the same discipline the plane applies to a candidate's
  address ([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).
  "We think it is X" and "its native route answered" are different states.
- **Unknown as a first-class endpoint state**, which the policy tree must be able
  to route around rather than treating as a type it recognises.
- **One resolution point.** Identity is decided in one place and read everywhere
  ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary));
  a second inference elsewhere is how two subsystems come to disagree about what
  an endpoint is.
