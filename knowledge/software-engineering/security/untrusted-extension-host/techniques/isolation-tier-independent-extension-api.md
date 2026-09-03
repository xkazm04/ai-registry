---
layer: technique
type: technique
subject: untrusted-extension-host
technique: isolation-tier-independent-extension-api
status: forged
laws: [one-authority-per-vocabulary, failure-not-empty-success]
shared_with: []
use_when: [designing the context object an extension receives, an extension must move between isolation tiers, the isolation runner is unavailable on a deployment target]
---

# Isolation-tier-independent extension API

Once a host has two tiers, the tempting next move is to give each the API that
suits it: the host tier gets the rich one, because it can, and the sandboxed
tier gets a reduced one, because it must. That is how a host ends up with two
extension products, one migration path that is a rewrite, and a population of
authors who chose the host tier for a capability they never used. This
technique owns the invariant that prevents it: **the format changes isolation
and resource limits, and nothing else.**

## One vocabulary, declared once

Same hook names. Same context object shape. Same capability vocabulary, same
privilege token spellings, same result envelopes. An extension's source, moved
from one tier to the other, changes its manifest's format field and nothing
else; if it changes anything else, the tiers have diverged and the divergence
will grow.

The vocabulary is defined in exactly one place and both tier runtimes derive
from it ([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)).
Two hand-maintained hook tables drift precisely when somebody adds a hook under
deadline and finds only one of them — and the drift is silent, because the
extension registers successfully against a table the other tier's dispatcher
never reads. A registration the host accepts and never invokes is worse than
one it rejects.

The invariant has a consequence worth stating because hosts resist it: **the
host tier does not get a richer API because it could.** Ambient access is not
an API; it is the absence of one. If host-tier code reaches the database
directly while sandboxed code goes through a brokered request, those are not
two versions of a capability, they are one capability and one escape hatch, and
the escape hatch is what the tier boundary was drawn to contain. Where the host
tier genuinely needs something the sandbox cannot have — a build-time component,
a host-rendered template — that thing is a *different registration kind* the
sandboxed tier simply does not offer, not a wider version of a shared one. The
shared surface stays identical; the difference is a set difference, never a
shape difference.

## Migration becomes a configuration move

The invariant's payoff is that tier assignment stops being a permanent design
commitment. An extension written for the host tier because its first release
needed one host-rendered template can drop the template and move down a tier
without its author touching a hook. A host that discovers a capability is
brokerable after all can move a whole class of extensions down without a
deprecation cycle. A deployment that cannot run the host tier at all can be
described by a policy rather than a port.

This is what makes the tier boundary reviewable. When moving is cheap, an
argument for the host tier is answerable with "then move down when you drop
that one thing", and the boundary drifts toward the safe side over time instead
of away from it.

## Degradation is by skipping, and skipping is announced

The second payoff is the one hosts get wrong. A host whose isolation runner is
unavailable — a deployment target without the platform primitive, a runner
binary that failed to provision, a configuration that never named one — has a
choice between three behaviours, and only one is correct.

**Refusing to start** is defensible for a host whose extensions are load-bearing,
and it is what the operator asks for by marking the extension required. It is
the wrong default: a content product that will not serve a page because an
optional analytics extension has no runner has converted a degraded feature
into an outage.

**Silently skipping** is the common default and it is the one to refuse. The
host starts, the sandboxed extensions do not run, their hooks never fire, their
validations never validate, and every surface that reports on extensions
reports the installed set. That is empty success wearing a green check
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)) —
and it is worse here than in most places it appears, because some of the
skipped hooks were guards. An extension installed to reject records that fail a
policy is, when skipped, an extension that accepts everything.

**Skipping loudly** is the default. The host starts; every sandboxed extension
is marked not-running with a reason naming the missing runner; that state
appears on the administrative surface, in the health output, and in the startup
diagnostics; and any surface that lists installed extensions distinguishes
*installed and running* from *installed and not running*. The distinction is
the deliverable — a host that reports a count of installed extensions, with no
predicate attached, has told the operator nothing it can act on.

The same rule covers the narrower case: a single sandboxed extension whose
isolate failed to instantiate is not-running with a reason, not absent, and the
operator learns which one and why.

## Decision rules

- Define hook names, the context object and the capability vocabulary once;
  derive both tier runtimes from that definition.
- Never widen the host tier's shared API because it can be widened; express
  genuine tier differences as registration kinds the other tier does not offer.
- Keep tier migration to a manifest field change; if a move requires editing a
  hook, the tiers have diverged and the divergence is the defect.
- When the isolation runner is absent, skip the sandboxed set and start —
  loudly. Mark each extension not-running with a reason, on every surface that
  lists extensions.
- Reserve refuse-to-start for extensions the operator explicitly marked
  required, and make that marking opt-in per extension.

## When not to use it

A host with one tier has one API and needs no invariant to keep it single. And
a host whose two tiers are genuinely two products — an in-process automation
surface and a remote integration protocol, sharing no concepts and no
lifecycle — should not be forced into one vocabulary; the invariant is valuable
because the tiers are the *same product at two privilege levels*, and imposing
it on things that merely coexist produces an abstraction neither side fits.
