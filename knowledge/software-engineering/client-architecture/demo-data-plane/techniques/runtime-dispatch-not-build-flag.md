---
layer: technique
type: technique
subject: demo-data-plane
technique: runtime-dispatch-not-build-flag
status: forged
laws: [gate-sees-target, one-authority-per-vocabulary, failure-not-empty-success]
shared_with: []
use_when: [deciding how a demo surface is switched on, a demo build has drifted from the shipped artifact, a fake data path must be provably unreachable for real tenants]
---

# Runtime dispatch, not a build flag

The data plane is resolved **per call, from live session state**, inside the one
artifact that also serves real tenants. The demo is a route the product serves
and a choice a visitor makes — never a build variant, never an environment
variable read once at module load.

## The dispatch

There is one module that knows the implementations exist. Every consumer asks it
for the client; it reads the current session, selects a plane, and returns it.
The selection happens **at the moment of the call**, not at import time.

That timing is the part that is easy to get wrong and expensive to debug. A
module that resolves its plane once, when it is first loaded, captures whatever
the session was at load time — typically *not signed in, not in a demo* — and
serves that stale answer for the life of the page. The viewer enters the demo,
the surfaces keep calling the plane that was chosen before they did, and the
result is a page that is half demo and half nothing, differing by which module
happened to load first. The dispatch must observe the state it dispatches on, at
the time it dispatches
([_laws: gate-sees-target_](../../../_laws.md#gate-sees-target)).

The plane's name is a closed vocabulary — one declaration of the possible
planes, read by the dispatch, by whatever renders the marker, and by the tests
that assert containment
([_laws: one-authority-per-vocabulary_](../../../_laws.md#one-authority-per-vocabulary)).
A second hand-written list of mode strings somewhere in the interface layer is
how a fourth plane gets added and one surface keeps rendering three.

## What the session state may be derived from

Exactly one thing: **an explicit act by the viewer**, recorded in session state
for the life of that session.

Not from any of these, each of which is a real bug that has shipped in real
products:

- **The shape of a result.** An empty list means the tenant has no data. It does
  not mean the viewer wants a demo, and treating it as such is how fabricated
  numbers reach a paying customer's screen.
- **A failed request.** A failure means the product could not answer. Serving
  fixtures in its place converts an outage into a fabrication, and removes the
  one signal that would have told anyone the outage was happening.
- **The absence of a session.** Anonymous does not mean demo. A visitor who has
  not signed in sees the product's public surface, which may include an
  invitation to the demo; it does not include the demo's data.
- **A host name or deployment target.** This is a build flag wearing a costume:
  it is decided before the viewer arrives, cannot be varied per viewer, and
  cannot be tested against the artifact you ship.
- **Anything persisted across sessions.** A stored preference means a viewer can
  return days later, in a state they do not remember choosing, with no memory
  of having entered a demo. Entry is per session and it expires with the
  session.

The doors are one-way in the direction that matters. Entering the demo is a
deliberate act with a visible exit. Leaving it — signing in, or taking the exit
— discards the demo session entirely rather than layering a real identity on top
of demo state, because a session that is partly both is a session in which
nobody can say where a given number came from.

## What this costs

State it plainly, because a technique that hides its price gets adopted by
people who would otherwise have declined.

**The fake plane and its fixtures ship to production.** They occupy payload
bytes. They are readable by anyone who cares to look, which means the fixture
set is public: no real customer names, no borrowed screenshots of a real
account, no internal terminology you would not put on the marketing site. And
they are a live code path in the artifact that serves paying customers, which is
precisely why the containment rules in the honesty contract have to be enforced
by tests rather than by architecture — architecture is not keeping this code
away from real tenants; the contract is.

The payload cost is usually smaller than it feels and is easy to bound: the
fixture module is loaded on the demo route's code path only, so a real tenant
pays for the dispatch and not for the world.

## Why it is worth paying

Four reasons, in descending order of how much they matter.

**The contract is enforceable against the thing you ship.** A test suite driving
the real artifact can enter the demo, assert the marker is present, assert no
fabricated badge renders, and assert the exit works. Under a build flag the
demo lives in a different artifact from the one under test, so every one of
those assertions runs over a proxy — which passes exactly when the proxy has
diverged from what customers get
([_laws: gate-sees-target_](../../../_laws.md#gate-sees-target)).

**The demo does not drift.** A second artifact must be produced, deployed and
kept current by a pipeline nobody watches, because nobody is paged when a demo
is stale. It breaks silently and is discovered by a prospect.

**The demo is a door, not a destination.** A visitor exploring the demo is one
click from signing in, in the same product, on the same host, with the same
navigation. A separately hosted demo makes conversion a journey between two
places.

**One code path is reviewed.** A surface that only exists in a build variant is
a surface that is reviewed less, typed less, and refactored around. The fake
plane living in the main artifact means it is touched by every rename and every
interface change, which is the mechanism that keeps it working.

## The route, and its escape hatch

The demo is reachable at a stable route that does one thing: records the
explicit choice in session state and sends the viewer into the product. Two
properties are worth writing into it.

**It is idempotent and re-enterable.** A viewer who reloads, or who shares the
link, arrives in the same state. Nothing about entry depends on having come from
a particular page.

**It carries an escape hatch out of the product's normal flow.** The demo route
is also the answer to "the real product cannot load and I need to show
something" and to "a contributor cannot run the service locally." Making it an
explicit, documented door — rather than a hidden combination of flags — means
the fallback everyone actually needs is the one the contract already governs.

**And the entry route itself has a visible failure path.** An entry point whose
whole job is to record a choice and redirect will sometimes not arrive: a
resource fails to load, the destination's error boundary catches something, the
navigation is interrupted. A route that shows a spinner while that happens is a
demo that appears broken to the one visitor who was most willing to try it. Bound
the wait, and on expiry replace the spinner with a plain, manual way in
([_laws: failure-not-empty-success_](../../../_laws.md#failure-not-empty-success)).
This costs a handful of lines and it is the difference between a prospect who
saw the product and one who saw a loading indicator.

## When not to use it

If the fake plane contains material that genuinely must not be published — a
partner's data, an unreleased feature's surface, anything under an agreement —
then it cannot ship in the public artifact, and a separate build is the correct
answer despite its costs. Take the drift and the untestability knowingly, and
put the honesty contract's assertions in that build's own pipeline.

If the product has no unauthenticated surface at all and the demo exists only
for internal sales use, a gated deployment is a reasonable alternative — but the
containment rules do not relax, because the audience that must never see
fabricated numbers now includes every internal person who might screenshot one.
