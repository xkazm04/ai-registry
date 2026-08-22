---
layer: technique
type: technique
subject: fleet-orchestration
technique: outbound-compute-plane
status: forged
laws: [one-validation-door]
shared_with: []
use_when: [deciding whether the executor plane needs ingress, running executors on laptops or behind NAT, an executor wants a database connection, authenticating a spawned sandbox's first call home]
---

# The outbound compute plane

A fleet's registry lives on the control plane; its sessions execute somewhere
else — a server, a homelab, a laptop lid away from sleep. The topology
question is who dials whom, and the answer with the fewest consequences is:
**the compute plane dials out, always, and holds no listening surface the
outside world can reach.** Work arrives because the executor long-polls for
it; results and lifecycle events leave on the same outbound channel. The
control plane never needs a route to the executor at all.

## What no-ingress buys, item by item

The payoff is not one property but a bundle, and naming the items keeps the
design honest when one of them tempts a shortcut:

- **Placement freedom.** A machine behind NAT, a VPC with no load balancer, a
  laptop on hotel wifi — all are equally valid executor hosts, because none
  needs an inbound route, a tunnel, or a TLS termination story. The fleet
  grows by running a process, not by provisioning ingress.
- **No executor attack surface.** A plane that listens must authenticate,
  patch, and rate-limit what connects; a plane that only dials has nothing to
  connect *to*. The security review shrinks to the outbound channel's
  credentials.
- **The poll is the clock.** With no way to push, the control plane cannot
  grow a scheduler that reaches into executors; work dispatch stays a queue
  the executor drains at its own pace, which is also the natural backpressure
  boundary — an overloaded executor simply polls less.

Long-polling is the honest transport for this: the poll asks the server to
hold for tens of seconds, so dispatch latency stays near zero without a push
channel, and a control plane that is briefly unreachable costs a bounded
retry with backoff, not a broken route.

## The store has one door, and the executor is not behind it

The executor plane **never touches the fleet's database**. Reads and writes
go through the control plane's API, which is the store's one validation door
([one-validation-door](../../../../_laws.md#one-validation-door)); schema
migration belongs to whatever owns the store's boot, not to a process on
somebody's laptop. The moment an executor holds a database credential, every
executor host is inside the data perimeter, and the placement freedom above
was traded away silently. The rule survives inconvenience: an executor that
"just needs one lookup" gets an API endpoint, not a connection string.

## Spawned things authenticate with single-use bootstrap credentials

The executor spawns sandboxes, and each sandbox must dial back a control
channel. Its first credential is a **bootstrap token minted per spawn,
single-use, bound to that sandbox's identity, and consumed on connect**. The
consequences cut deeper than the minting:

- A token baked into a spawned environment is spent the moment the sandbox
  connects. Restarting that sandbox cannot re-authenticate it — so **every
  start is a replacement**, not a resume of the old container: recreate with
  a fresh token, keep the durable home volume. Restarting in place produces
  the worst failure shape available: a sandbox that runs but can never
  report, redispatched forever.
- The token authenticates a *machine's first call*, which is a narrower job
  than pairing a person's device; the ceremony, relay, and trust-lifetime
  questions of human-facing pairing belong to the security bundle's pairing
  subject, not here.

## The dev relaxation is labeled, or it will ship

An isolated executor network with the egress broker dual-homed onto it is
what makes "sandboxes reach only what they are granted" a boundary rather
than a suggestion — and development needs to relax it (the sandbox must reach
a broker running on the host). Ship the relaxation as an explicit flag whose
name and documentation say *development-only*, defaulted off everywhere else.
An unlabeled convenience flag is a production topology waiting for a copied
`.env`.

## When not to use this

When executors are co-located with the control plane inside one trust
boundary and one process manager, the outbound discipline is ceremony —
in-process workers with a shared store and [atomic
claiming](../../../../backend-platform/work-execution/delivery-guarantees/techniques/atomic-claiming.md)
are simpler and stronger. This technique earns its cost exactly when the
compute is *elsewhere*: other machines, other networks, other people's
hardware.
