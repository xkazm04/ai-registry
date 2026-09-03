---
layer: technique
type: technique
subject: untrusted-extension-host
technique: two-tier-extension-format
status: forged
stage: team
laws: [one-validation-door, absent-guard-is-loud]
shared_with: []
use_when: [deciding which extension capabilities may run in the host process, an extension category needs privileges the sandbox cannot broker, choosing the install ceremony for each tier]
---

# Two-tier extension format

A host that accepts third-party code needs more than one answer, because the
capabilities extensions want are not equally containable. A single tier forces
one of two bad choices: sandbox everything and refuse the capabilities that
genuinely cannot be brokered, or sandbox nothing and hand every author the
host's credentials. Two tiers is the smallest honest answer. This technique
owns where the line between them goes, how each tier is entered, and the
economic force that decides whether the tiering survives contact with authors.

## The split is by where the code runs

The taxonomy that fails sorts extensions by purpose — themes, integrations,
analytics, workflows. It reads well in documentation and decides nothing,
because purpose does not predict privilege: an analytics extension that posts
to one endpoint and an analytics extension that reads every draft record are
the same category and nothing alike.

**Split by execution location.** The sandboxed tier's code runs in an isolate
with no ambient reach — no filesystem handle, no network client, no database
connection, no host object it did not receive through the broker. The host tier
runs in the host's own address space with the host's privileges, its module
graph, and its credentials. Every other difference between the tiers — install
ceremony, resource ceilings, review requirements, what the consent dialog says
— is a consequence of that one fact, and any difference that is *not* a
consequence of it is a difference that will be argued away.

## What forces a capability into the host tier

The rule for the line: a capability belongs in the host tier only when it
cannot cross an isolate boundary **at all**, not when crossing it would be
inconvenient. In practice that set is small and it is stable:

- **Build-time-resolved interface code.** A component the host's own admin
  bundle must compile against, resolve, and tree-shake exists before the
  isolate does; it is not code the host calls, it is code the host *contains*.
- **Host-rendered output.** A template or renderer that runs inside the host's
  own rendering pass, sharing its data structures and its output stream, is
  executing in that pass by definition.
- **Raw injection into a delivered surface.** An extension that inserts a
  script or markup into a page delivered to visitors is not being brokered; it
  is being concatenated. The reach it obtains is the surface's, not the
  isolate's, and no isolate can bound it.
- **Ambient process access as the product.** An extension whose entire value is
  reaching the host's own filesystem, process table or private network cannot
  be brokered without brokering exactly the thing that makes it dangerous.

Everything else is sandboxable, including the cases that feel like they are
not. Outbound network calls are brokered through a meter and an allowlist.
Persistence is brokered through a declared schema. Reading and writing the
product's own records is a brokered request against a declared grant. Long or
expensive computation is a ceiling problem, not a tier problem. When an author
argues that their capability needs the host tier, the question is not "is that
hard to sandbox" but "what host object would have to be handed across the
boundary, and can it be replaced by a request".

Write the list down and treat it as closed. A tier boundary defined by a rule
holds; a tier boundary defined case by case is a boundary that moves toward the
privileged side on every release, because every individual argument for
crossing it is reasonable and the aggregate is not.

## The low-privilege tier must have the shorter ceremony

This is the counter-force, and hosts that get the boundary right still lose
here. If the safe tier is the one with the heavier path to production — a
review queue, a signing step, a manual approval, a build — and the dangerous
tier can be dropped into a directory, then convenience decides the tier and the
tiering is decorative. A deployed population converges on the cheapest path
([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud)), and the
cheapest path must be the sandboxed one.

Concretely: **the sandboxed tier installs through the product's own interface
in one action, and the host tier requires host access the interface does not
have** — placing a file where only the operator can write, or an explicit
operator-tier configuration entry, or both. That asymmetry is not a
convenience gradient, it is the enforcement of the previous technique's
inversion: the whole reason an administrator may install code from a UI is that
what the UI can install is contained.

## The high-trust format is refused through the low-friction channel

The two rules above create one obvious attack, and it is the one to close
explicitly: publish a host-tier bundle through the channel that installs
sandboxed bundles in one click. Whatever gate the low-friction channel has — a
registry, an upload form, an install-from-identifier field — must **refuse a
host-tier bundle outright**, at the point of publication and again at the point
of installation, and the refusal is a stated reason rather than a silent
downgrade to the sandboxed tier.

Two doors, two validation rules, and neither door may accept the other's
artifact ([one-validation-door](../../../_laws.md#one-validation-door)). A
silent downgrade is the worst available answer: the author's host-tier code
runs in an isolate, fails at its first ambient access, and produces a support
question instead of a security decision. A silent *upgrade* — accepting the
bundle and running it in the host tier because that is what it asked for — is
the vulnerability itself.

The test is mechanical and belongs in the suite: publish a host-tier bundle
through the low-friction channel and assert a refusal with a named reason. A
host that cannot run this test does not know which tier its channel installs.

## Decision rules

- Split tiers by where the code executes, never by what the extension is for.
- Place a capability in the host tier only when no host object can be replaced
  by a brokered request; write the resulting list down and treat it as closed.
- Make the sandboxed tier the one with the shorter install ceremony, and make
  the host tier require access the product's own interface does not have.
- Refuse a host-tier bundle at every low-friction channel, at publication and
  at installation, with a named reason — never a silent downgrade, never a
  silent upgrade.
- Test the refusal; a channel whose tier behaviour is untested is a channel
  whose tier behaviour is unknown.

## When not to use it

A host whose extensions are all written by the team that owns it has one
author, one trust level, and no need for a boundary between two of them — the
tiering costs an API constraint and a second toolchain and buys nothing. A host
with no isolation primitive available on its deployment target should not
simulate one with a second tier either: with only the host tier available, the
correct posture is the absolute rule that code entry points come only from the
operator's own configuration, not a tiering that implies a containment nothing
enforces. The technique starts to pay at *team* stage, the day a party outside
the team can publish something an administrator can install.
