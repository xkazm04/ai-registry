---
layer: technique
type: technique
subject: tenant-scoped-agent-runtime
technique: stamp-ownership-before-the-router
status: forged
stage: multi-service
laws: [identity-survives-reuse, unknown-is-not-a-value]
shared_with: []
use_when: [ingress handling runs before the event carries a tenant stamp, two tenants serving the same conversation collide on one lane, batching or a busy guard is keyed on something that is not the tenant, deciding the resolution order for an event with no owner]
---

# Stamp ownership before the router

The clean model of a multiplexed runtime is that every inbound event is
routed, stamped with its tenant, and handed to code that reads the stamp.
The model is true of the turn and false of everything before it. **Ingress
runs before the router does** — an event arrives on a connection, and the
receiving surface batches it, tracks it against an active-session table,
checks a busy guard, and decides whether to acknowledge it, all before any
routing decision exists to read.

Code in that window has no tenant to consult, so it consults the resolver,
which returns the process default. Every tenant's ingress therefore derives
the *same* key, and every per-lane structure keyed on that string collides.
This technique is the fix: **ownership is installed on the ingress surface
at configuration time, before any event can arrive**, and resolution
follows a fixed order that names the absent case rather than defaulting
through it.

## The collision is not rare, it is the normal case

It is tempting to read the collision as an edge case — two tenants would
have to be serving the same conversation. They routinely are. A
direct-message conversation is usually keyed by the *human's* identifier on
the platform, which is identical no matter which of the runtime's
identities they are talking to. So a person who talks to two of the
runtime's tenants from the same account produces two event streams whose
ingress-derived keys are byte-identical, and every structure keyed on that
string merges them: their messages batch together, one tenant's in-flight
turn trips the other's busy guard, and the active-session table shows one
lane where there are two.

The symptom is a runtime that works perfectly in testing — where the
tester's two tenants are exercised one at a time — and interleaves
conversations the first time a real user talks to both.

## Ownership is installed with the handlers, not discovered from traffic

The ingress surface is configured before it is started: handlers attached,
credentials resolved, callbacks bound. That is the moment the runtime knows
which tenant this surface belongs to, and it is the last moment before an
event can arrive. So the owner is stamped there, in the same block that
installs the other handlers, with a comment saying why the order matters —
because the natural instinct of the next author is to move the stamp
somewhere tidier and later, and later is after the first event.

The owner is a **configuration-time fact about the surface**, minted once
and carried
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).
It survives reconnects, which is the property that matters most: a surface
that re-authenticates and rebuilds its connection must not lose its owner in
the process, or every reconnect silently returns that tenant's traffic to
the default lane. The default tenant is represented as the absence of a
stamp rather than as its name, so the key shape stays stable across a
runtime that has isolation switched off.

## The resolution order, and why it is that order

An adapter-derived key resolves its tenant from three sources, first match
wins:

1. **The event's own stamp**, where routing has already run — some ingress
   paths, notably a relay or connector that routes upstream, deliver events
   that already carry the tenant. That stamp is the most specific fact
   available and outranks everything.
2. **The surface's configured owner** — this ingress's own tenant, the
   subject of this technique, and the answer for everything that runs before
   routing.
3. **The store's resolver** — the active scope, or the no-isolation answer.
   This is the fallback, and it is correct only when the first two are
   genuinely absent.

The order is specificity-descending, and each rung answers a case the rung
below cannot. Collapsing it to the third rung alone is the defect this
technique names; collapsing it to the first alone breaks every pre-routing
path.

Two guards belong at every rung. **Every candidate is type-checked before
it is interpolated into a key.** A duck-typed or test-double store that
returns a truthy non-string turns the key into the rendering of that
object — a key that is stable within a run and meaningless across runs, which
corrupts exactly the structures this technique is protecting. And **every
read is defensive about the attribute existing at all**, because ingress
surfaces are routinely constructed without their base initialiser by
subclasses and by tests, so no attribute may be assumed present.

The absent case is a case, not a default
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)): an
event whose tenant cannot be resolved by any rung must not be handled as
the default tenant's. It is dropped, with a diagnostic naming the surface,
because misdelivering an event to the wrong tenant is worse than losing it.
The same rule covers a routed event whose target is outside the served set:
dropped, not redirected.

## Every per-lane structure is keyed the same way

The stamp is worthless if only some structures use it. Enumerate them, and
the list is longer than the obvious one:

- the session key itself, namespaced by tenant;
- message and media **batching** buffers, which accumulate before the turn
  exists;
- the **active-session** table used to decide whether a new event joins an
  existing turn;
- the **busy guard** that refuses or queues concurrent work;
- any per-lane timers, cooldowns, or mode flags — a voice mode, a typing
  indicator, a per-conversation preference — which are keyed by
  conversation and must be keyed by tenant and conversation;
- the **status surface's** own key, which usually wants *both* dimensions:
  the tenant and the platform, so an operator can see which tenant's
  connection failed.

One namespacing scheme, applied to all of them, derived from one function.
A structure keyed by a hand-built string is the addressing hole again, and
it is found by searching for the key format outside its builder.

## Decision rules

- Stamp the tenant on every ingress surface at configuration time, in the
  block that installs its handlers, with the reason written beside it.
- Make the stamp survive reconnects; represent the default tenant as an
  absent stamp rather than a named one.
- Resolve in order: the event's stamp, the surface's owner, the store's
  resolver. Never collapse the order.
- Type-check every candidate before interpolating it into a key, and read
  every attribute defensively.
- Drop an event whose tenant cannot be resolved, or whose target is not
  served, with a diagnostic. Never fall back to the default tenant.
- Key every per-lane structure — batching, active sessions, busy guards,
  per-conversation modes — through one namespacing function.
- Give the status surface both dimensions, tenant and surface, so a failure
  is attributable.

## When not to use it

Where every ingress path routes upstream and every event arrives already
stamped, rung two is dead code and the surface owner is a fact nobody reads.
And where a runtime serves one tenant, namespacing every lane key by an
always-absent tenant is a migration cost with no benefit — which is exactly
why the default tenant must serialise to the *unnamespaced* key shape, so
the scheme can be adopted before isolation is switched on without rewriting
every stored key.
