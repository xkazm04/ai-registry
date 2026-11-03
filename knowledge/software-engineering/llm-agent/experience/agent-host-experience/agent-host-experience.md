---
layer: golden-path
type: golden-path
subject: agent-host-experience
status: forged
use_when: [deciding what a product's tool surface for outside agents should contain, adding a rendered view to a tool an agent host will call, a task that starts in a general assistant and must finish in the product, choosing between tools a rendered view a declarative spec and a peer agent]
techniques:
  - journey-shaped-tool-surface
  - in-host-views
  - depth-handoff
  - agent-ui-event-stream
  - portable-view-spec
  - peer-agent-delegation
---

# Agent-host experience

An AI-driven experience has two tiers. **Inside**, a model conducts the product's own
screen: it chooses the form an answer takes and composes views across modules without
destroying the user's sense of place; that tier is
[model-composed-workspace](../model-composed-workspace/model-composed-workspace.md).
**Outside** — this subject — the product is a capability that other people's agents
operate: a general assistant the user already talks to, a coding agent in a terminal,
another organization's agent working on someone's behalf. The product does not own the
conversation, the model, the composer, the layout or the rendering engine. It owns a
handful of operations, perhaps a small view, its depth, and its consent.

The subject is the experience decisions on that outside tier: what the operations are,
when a view is worth shipping, what may finish inside the host and what must come home,
how the product's own front end talks to its own agent, how one in-app vocabulary
reaches other surfaces, and when the product should be a peer agent rather than a
capability. The wire, schemas, transports and security mechanics of the tool protocol
are [mcp-tools](../../runtime-and-io/mcp-tools/mcp-tools.md); this subject routes into
it and never restates it.

## The base contract is text, in every host

The tool protocol is the only surface every agent host speaks. Rendered views, display
modes, handoff links and host-specific extras all sit on top of it, and every one of
them is missing in some host the product will meet — a terminal agent that calls the
tool and prints the result, a mobile client with a reduced view runtime, an enterprise
assistant that implements a subset. So the floor is fixed: **every operation completes
as text.** Its result carries a complete human-readable answer and a structured result
for machines, and nothing the user needs to finish the journey exists only in a view.
A product that passes that test works everywhere and is merely plainer in some hosts; a
product that fails it works only in the host it was tested in.

## Operations are journeys, not endpoints

The tempting first surface is the product's API re-exposed, one operation per noun and
verb. It produces a large, fuzzy catalog the model navigates badly: it must chain four
calls to finish one thing the user wanted, every call is a choice it can get wrong, and
the definitions spend context in every host that loads them upfront. The surface is
instead **a handful of clearly named operations that each finish something the user came
to do**, with a concise and a detailed response mode, and pagination and filtering on
anything that lists. A read that tells the model what it may do next — which operations
can succeed now, and why the others cannot — is worth more than three that return raw
records. Which operations the model sees at all, and which exist only for a view to
call, is a design decision, not a default. The procedure, the counter-case where a thin
read is right, and the grant model that keeps the product's own agent on the same door
are [journey-shaped-tool-surface](./techniques/journey-shaped-tool-surface.md).

## A view is earned, never compensatory

Some hosts can render a small interface the product ships alongside an operation. It
earns its place only where **seeing or manipulating beats reading**: picking one of
several, comparing side by side, confirming a precise thing, visualizing a shape. A
view added because the operation's text result was confusing has hidden a defect in
the operation and left every non-rendering host with the defect. Inline views are
glimpses, under limits at least one host family publishes (at most two actions, about
four or five data points, no nested scrolling, no menus, never a second composer that
competes with the host's own) and that another family's guidance is reported to share;
depth goes to a larger display mode or home to the product. Language understanding
goes through the host's chat; direct manipulation of things the product already
controls stays in the view. The view runs inside someone else's application, so it
speaks only the standard bridge, declares every network origin it contacts, and treats
every channel by which it can talk to the model as an injection surface. That is
[in-host-views](./techniques/in-host-views.md).

## The host gets a glimpse; the product owns depth and consent

A host conversation is a good place to start a task and a poor place to finish a
consequential one. The host renders a glimpse; the full product is where the user edits
at length, sees history, and commits anything irreversible. The handoff is a link back
into the product carrying an **opaque, expiring handle to the exact state** — never the
state itself and never a credential — so the user lands on the decision, not on a home
screen. Irreversible and money-bearing acts complete in the product's own consent
surface or through an out-of-band, user-bound confirmation, and secrets and payment
details never pass through anything the model or host can read. A destructive hint the
product publishes is advice to a host that may ignore it; the confirmation is enforced
by the product. The split between what may finish in-host and what must come home is
[depth-handoff](./techniques/depth-handoff.md), and it rests on the consent model of
[hitl-approval](../../orchestration/hitl-approval/hitl-approval.md).

## Hosts diverge feature by feature, so the product detects

There is no conformance suite for agent hosts. They differ in which protocol revision
they speak, whether they render views at all, which display modes they offer, which
behavior hints they honor (at least one major host honors only the read-only hint and
ignores the destructive and idempotent ones), whether they enforce a view's declared
origins, and how they read an authentication failure. The product therefore **detects
rather than assumes**: it reads the capabilities a host declares, degrades to text when
a feature is absent, and never lets a safety property rest on a host feature it has not
observed. A product tested in one host has a measurement of that host, not of agent
hosts.

## The product's own front end speaks one typed event stream

Everything above is about appearing inside someone else's host. When the product hosts
its *own* agent front end — its main window, a second window, a phone page — the
question changes: there is no outside host, and the product's surfaces need a live view
of a run. The answer is **one typed event stream**: run lifecycle, text deltas, tool
calls with start, arguments and outcome, state snapshots that replace and deltas that
patch, activity and consent requests, all in the order they happened. Every surface
attaches to the same stream by run identity and can resume from where it left off. A
trusted server sits between every client and the agent, and nothing a client sends
other than the user's own words is believed. The stream is not how the product appears
inside a third-party host — those hosts speak the tool protocol — and routing the two
together is the most common confusion in this subject. That is
[agent-ui-event-stream](./techniques/agent-ui-event-stream.md), over the stream
mechanics of [streaming-output](../../runtime-and-io/streaming-output/streaming-output.md).

## One in-app vocabulary, projected outward

A product whose own surfaces render a closed component vocabulary will be tempted, or
asked, to speak a declarative view format that other hosts render with their own
components. That format is a **projection** of the product's vocabulary at one
boundary, never a second vocabulary authored beside it: the in-app registry stays the
single authority, and the projection is a function that can lose fidelity and says so.
The choice between a declarative spec (consistent with the host, safe, bounded by the
host's catalog) and an embedded view (full fidelity in a sandbox, visually disjoint and
slower) is a trade of trust against expressiveness, and an interop format that has not
reached a stable release is projected to, never designed around. That is
[portable-view-spec](./techniques/portable-view-spec.md), resting on
[emitter-registry-sync](../../../ui-surfaces/input-and-editing/schema-driven-ui/techniques/emitter-registry-sync.md).

## A peer agent is the exception, not the default

There is a second way to be reachable by outside agents: as a peer agent that another
agent delegates a whole task to, with a lifecycle (working, input required, auth
required, done) and an opaque interior. It is right for long-running work that needs the
product's own reasoning and policy, delegated across organizations. It is wrong as a way
to reach general assistants, which call tools; a peer endpoint shipped instead of tools
reaches almost nobody, and at least one practitioner retrospective concluded that its
implementation burden outweighed its benefit. When it is right, it carries a signed description, human
approval for critical acts, and the awareness that a stateful peer session is itself an
injection channel. That is [peer-agent-delegation](./techniques/peer-agent-delegation.md).

## Choosing the surface

| The product needs to... | Use | Because |
| --- | --- | --- |
| be operable by any agent host | journey-shaped tools, complete as text | the only surface every host speaks |
| let the user pick, compare or confirm inside a host | a small in-host view on top of a tool | seeing beats reading for exactly these |
| let the user edit at length or commit something irreversible | a handoff into the product | the product owns depth and consent |
| drive its own windows from its own agent | a typed event stream behind a trusted server | there is no outside host to render |
| show its composed views in a host that renders declaratively | a projection of the in-app vocabulary | one authority, many renderers |
| take a long task delegated by another organization's agent | a peer-agent endpoint, beside the tools | delegation with an opaque interior |

The rows compose; they do not compete. A mature product often ships the first three
together, the fourth for itself, and the last two only when a named consumer asks.

## How the naive reading fails

- **The API mirrored as tools.** Forty operations named after tables; the model chains
  them badly, the catalog crowds out other servers, and nobody can say which operation
  finishes the user's task.
- **The view as the product.** The journey works only by clicking inside a rendered
  view, so it fails in every terminal agent and every host that renders nothing, and
  the text result says "see the view".
- **The host as the consent surface.** A money-moving operation marked destructive and
  trusted to be confirmed by the host; one host confirms, another ignores the hint, a
  third auto-approves after the user ticked "always allow".
- **One host as the test.** A view that only ever ran in one permissive host ships with
  undeclared origins and a feature the next host lacks, and breaks on first contact.
- **The event stream offered to outside hosts**, or the tool protocol used to drive the
  product's own windows: each is the right answer to the other tier's question.
- **A second vocabulary for the outside.** An interop spec hand-authored beside the
  in-app registry drifts the first time a component is added to one and not the other.
- **A peer agent to reach assistants.** Months of lifecycle and card work for a
  surface no general assistant connects to.

## The techniques

- [journey-shaped-tool-surface](./techniques/journey-shaped-tool-surface.md) — a
  handful of operations that each finish a journey, response modes, model-visible
  versus view-only, one door with different grants.
- [in-host-views](./techniques/in-host-views.md) — when a view earns its place, the
  inline limits, text fallback, the standard bridge, declared origins, and view-to-model
  channels as untrusted input.
- [depth-handoff](./techniques/depth-handoff.md) — the glimpse and the depth: opaque
  expiring handles, what may finish in-host, consent enforced by the product,
  out-of-band entry of secrets.
- [agent-ui-event-stream](./techniques/agent-ui-event-stream.md) — one typed stream from
  the product's own agent to every surface it owns, behind a trusted server.
- [portable-view-spec](./techniques/portable-view-spec.md) — declarative spec versus
  embedded view, and the interop format as a projection of the one in-app vocabulary.
- [peer-agent-delegation](./techniques/peer-agent-delegation.md) — when to be a peer
  agent rather than a capability, and what that costs.
