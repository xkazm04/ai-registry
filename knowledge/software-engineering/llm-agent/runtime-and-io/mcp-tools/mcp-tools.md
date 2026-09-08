---
layer: golden-path
type: golden-path
subject: mcp-tools
status: reconciled
techniques:
  - transport-selection
  - orchestration-to-tool-migration
  - authentication-and-scoping
  - tool-schema-design
  - server-composition
  - client-integration
  - untrusted-result-handling
  - egress-argument-gating
  - write-freshness-gate
  - catalog-projection-modes
  - tool-identity-vs-tool-name
  - sanctioned-session-state
  - caller-differentiated-capability
  - fluent-syntax-bounded-grammar
  - suspendable-request-classes
  - sealed-continuation-state
  - enumeration-without-a-scope
---

# Tool protocols (MCP)

A tool protocol is the wire contract through which a reasoning system acquires
hands. The Model Context Protocol standardizes that contract: a **host** (the
AI application) creates one **client** per connection to each **server** (a
program exposing capabilities), and across that connection flow the three
server primitives — **tools** the model may invoke, **resources** the
application may read, **prompts** the user may select. The subject of this
path is the discipline on both sides of that wire: exposing capabilities
without exposing the process behind them, and consuming capabilities without
trusting the process behind them.

What decides everything here is one framing: **the tool boundary is a trust
boundary, in both directions.** A schema published by a server is a contract
the server must actually enforce — not documentation of what well-behaved
callers send. A result returned by a server is untrusted input twice over: the
consuming application must not act on it blindly, and the model reading it
must be defended against instructions smuggled inside it. Every technique in
this path is a consequence of taking that framing seriously; most tool-protocol
incidents are a consequence of not.

What is *not* this subject: the model's own function-calling format (a private
contract between one application and one model vendor), plugin systems that
load code into the host's address space (no process boundary, so no protocol —
a different and weaker isolation story; in-process plugin loading and the
host's custody of long-running tool work belong to
[agent-runtime-assembly](../agent-runtime-assembly/agent-runtime-assembly.md)),
and generic RPC between services that
no model ever reads (ordinary distributed-systems discipline applies, without
the injection surface).

## The current architecture: stateless, self-describing, discovered

The protocol's 2026-07-28 revision replaced connection lifecycle with
statelessness, and designs still shaped around the old lifecycle are carrying
dead weight. The load-bearing facts:

- **Every request is self-describing.** Protocol version, client capabilities,
  and client identity travel in each request's metadata. A server infers
  nothing from previous requests; there is no negotiated connection state to
  desynchronize, and any request can be the first request.
- **Discovery is a cacheable request, not a handshake.** A client *may* ask
  the server to describe itself — supported versions, capabilities, identity —
  in a single mandatory-to-implement request whose response carries explicit
  freshness and sharing hints. It may equally skip discovery, send any request
  directly, and handle a version error. The old world's mandatory
  initialize-then-operate ceremony is gone.
- **There are no protocol-level sessions.** State that must span calls — a
  cart, a workflow, a cursor — is an explicit **handle** minted by the server
  and passed back as an ordinary argument. The corollary is a law of this
  subject: *possession of a handle is not authentication.* A server binds
  every handle to the principal it verified, or the handle is a bearer token
  it never meant to issue. A deployment that genuinely must route a caller
  back to the instance holding its state is not excused from that rule, but
  it is a real case with a disciplined form —
  [sanctioned-session-state](./techniques/sanctioned-session-state.md).
- **Change notifications are opt-in subscriptions, delivered best-effort.** A
  client that cares about a changing tool list opens a long-lived listen
  stream naming the notification types it wants, and still polls, because
  delivery across reconnects is not guaranteed. Correctness never rests on a
  notification arriving.
- **Three capabilities were retired in one decision, on one criterion.**
  *Sampling* — servers borrowing the client's model — and *roots* — the
  client advertising which directories a server may consider — are the two
  client-side capabilities deprecated; *logging* is a **server** capability
  deprecated alongside them, and its level-setting request was removed
  outright rather than deprecated. The criterion that made three features one
  decision is the reusable part: **a capability belongs in a protocol only if
  it cannot be obtained outside it.** Each of the three had a working
  substitute one layer out — a model integrated with directly, directories
  passed as ordinary tool arguments, the transport's native error stream and
  standard telemetry — so each was a convenience re-export of an existing
  capability through the protocol's socket, priced against every
  implementation on both sides. Roots is the sharpest case, and it shows the
  second-order rule: it was *advisory*, servers were never required to honour
  it, and **a field nobody must respect decays into a field nobody sends.**
  What remains on the client side is **elicitation**: a server asking the
  user a structured question mid-operation, through the client, over a
  multi-round-trip pattern.
- **Long-running work gets a durable handle, not a held connection.** The
  tasks extension lets a server return a pollable handle for an operation that
  outlives any reasonable request timeout — the request/response shape stays
  clean and reconnects stop being failures.

## Who controls what

The three server primitives differ in *who decides to use them*, and the
distinction is a safety architecture, not taxonomy. **Tools are
model-controlled**: the model chooses to invoke them, which is exactly why
tool execution is where consent gates, approval dialogs, and audit trails
concentrate. **Resources are application-controlled**: the host decides what
context to read and feed to the model; no side effects, so the risk is
disclosure, not action. **Prompts are user-controlled**: explicitly invoked
templates, never auto-triggered. Collapsing these into "the server has
functions" discards the load-bearing question every reviewer should ask of a
capability: *who pulls this trigger, and what stands between the trigger and
the effect?*

## Schemas are contracts; enforcement is the server's

A tool's declared input schema is the model's only map of the tool. It is also
the boundary's contract — and the party that must enforce it is the server,
at dispatch, against the actual arguments
([gate-sees-target](../../../_laws.md#gate-sees-target)): client-side validation is
a courtesy to the model, not a defense of the server. One dispatch door that
validates, authorizes, executes, and audits every call
([one-validation-door](../../../_laws.md#one-validation-door)) is what makes those
properties structural instead of per-handler conventions; the shape of that
door is the [server-composition](./techniques/server-composition.md) technique,
and what a good contract looks like — naming, argument design, result shapes,
and the two distinct error channels — is
[tool-schema-design](./techniques/tool-schema-design.md).

The error-channel distinction deserves its headline early because it is this
subject's instance of
[failure-not-empty-success](../../../_laws.md#failure-not-empty-success) — and
because the axis that routes it is **not** whether the call validly happened.
It is **who can act on the answer**. A failure a differently-composed retry
could fix belongs to the model, and it is a *result*: flagged as an error,
delivered in-band, read and recovered from in one turn. That includes
argument validation — a date in the wrong format, a value out of range, a
rule the published schema could not express — because the party that wrote
the arguments is the only party that can rewrite them. A failure only a
re-listing, a re-encoding, or a different tool could fix belongs to the
machinery, and it is a *protocol error*: an unknown tool, a request that
fails the call envelope's own schema, a server fault. And a failure only a
new credential could fix belongs to neither — it is a third destination,
addressed to the caller's authorization machinery, which is expected to
widen its grant and retry.

The tell that the axis is the actor and not the call boundary is that **the
same failure changes channel with the primitive**. A missing required
argument is a protocol error for a user-invoked prompt and an in-band result
for a model-invoked tool: the fixer differs, so the channel differs. Nothing
about "did the call happen" separates those two, and an argument that failed
validation means the handler never ran in both. Conflating the three either
hides infrastructure failures inside model-visible prose, or converts
recoverable domain failures into dead conversations, or leaves an
authorization shortfall looking like a defect the model should reason about.

## Transport is a security decision

The protocol runs over two transports, and the choice is not a performance
knob. A **standard-stream** server is a child process: its identity is
established by who spawned it, its reach is one client, and its failure mode
is the spawn itself — client configuration that executes a command line is
code execution by design, so install flows carry consent obligations. A
**streamable HTTP** server is a network service: many clients, real
authentication (the protocol's authorization story is OAuth-shaped), and the
entire catalog of web-facing obligations — origin validation, audience-bound
tokens, no passthrough of tokens minted for someone else. A server that binds
to a local port "for convenience" has silently crossed from the first world
into the second, where the browser of every visited website is a potential
caller. The full decision table is
[transport-selection](./techniques/transport-selection.md); the credential
half — who may call, and with which of the caller's powers — is
[authentication-and-scoping](./techniques/authentication-and-scoping.md).

## Results are input

Everything a server returns — tool results, resource contents, even tool
*descriptions* read at listing time — enters the context of a model with the
authority to invoke further tools. That makes tool output the canonical
injection surface: an attacker who controls any upstream text a tool returns
(a web page, an issue title, an email body) is speaking directly to the
model, in the model's own working memory, with the model's tool belt within
reach. The consuming side therefore treats results as data with provenance —
fenced, attributed, never promoted to instruction — and the application
around the model enforces what the model cannot be trusted to: which tool
transitions require fresh human consent, which results may flow into which
subsequent calls. This is
[untrusted-result-handling](./techniques/untrusted-result-handling.md), and it
is the technique least optional in the set.

## What belongs on the surface changes as models improve

Which capabilities are exposed as tools is not a fixed answer. Every system
built around a model sits on a dial between **orchestration** — the pipeline
decides the sequence, constructs each context, and branches in code — and
**agency**, where the pipeline supplies capabilities and the agent decides what
to invoke. The dial's right position is derived from what the model can
reliably do, and that input keeps moving, so a pipeline built two generations
ago is usually carrying scaffolding that compensates for a limitation which has
since lifted.

The migration has a shape. Deterministic work — quantification, scoring,
indexing, anything that must be reproducible or that runs at a scale no
reasoning loop can afford — stays a computed first pass. What migrates is the
*adaptive* half: the rarely-firing conditionals hand-written to approximate
“something is unusual here”, which become tools the agent calls when it judges
it needs them. And the move is measured on a **fixed model roster**, because a
migration shipped alongside an upgrade cannot attribute its result to either —
against quality, cost per unit of output (which often *improves*, via cache
reuse), and variance, which is where the surprise usually is.
[orchestration-to-tool-migration](./techniques/orchestration-to-tool-migration.md)
owns the candidacy tells, the experiment, and the honest reverse.

## Sprawl is a quality defect, not a cosmetic one

Every tool listed is prompt space spent and a choice the model can get wrong.
Selection quality degrades as the catalog grows — similar names blur, vague
descriptions overlap, and the model starts calling the almost-right tool with
almost-right arguments. A tool catalog is therefore a curated product surface
with a budget: few tools, sharply named, at the altitude of user intent
(one *search-and-book* tool, not nine API endpoints re-exposed), with the
catalog itself as the single authority on what exists
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)).
Hosts federating many servers compound the problem and answer it with
progressive discovery — load what the task plausibly needs, not everything
that exists. Curation pressure belongs on both sides of the wire:
[server-composition](./techniques/server-composition.md) for the publisher,
[client-integration](./techniques/client-integration.md) for the host.

Progressive discovery is the host's answer, and a publisher whose host does
not implement it has no access to that answer. Some hosts instead impose a
hard ceiling on the number of tools a single request may carry — counted
across *every* connected server, so the budget is shared with servers the
publisher has never heard of and cannot see. At that point catalog size stops
being a quality gradient and becomes an admission criterion: over the line,
nothing works. The response is to publish the same capabilities at an
operator-chosen altitude rather than to delete them, which is
[catalog-projection-modes](./techniques/catalog-projection-modes.md) — and
the reason it does not simply repeal the one-tool-one-operation rule in
[tool-schema-design](./techniques/tool-schema-design.md) is that folding
operations behind a router costs selection quality and is worth paying only
when the alternative is refusal.

## Custody of the connection

A host owns the lifecycle of every connection it creates, and each end owns
what it mints ([creation-names-reaper](../../../_laws.md#creation-names-reaper)):
the host reaps the child processes it spawns; the server expires the handles
and capability tokens it issues. The classic violation in the wild is the
install flow that writes a never-expiring credential into a client
configuration file — custody discipline present inside the vault, absent one
step outside it, where the config file is now a bearer credential with no
reaper. Install and configuration are part of the protocol surface, with the
same obligations as the wire itself:
[client-integration](./techniques/client-integration.md).

## The techniques

- [transport-selection](./techniques/transport-selection.md) — child process vs
  network service: identity, reach, session semantics under statelessness,
  and the local-port trap between them.
- [authentication-and-scoping](./techniques/authentication-and-scoping.md) —
  who may call and with what: per-consumer capability tokens, scope reuse
  from an existing key registry, audience validation, the no-passthrough
  rule, and open-listing/authenticated-call policies.
- [orchestration-to-tool-migration](./techniques/orchestration-to-tool-migration.md)
  — what earns a place on the surface as capability rises, what must stay
  deterministic, and the fixed-roster experiment that proves the move.
- [tool-schema-design](./techniques/tool-schema-design.md) — the contract
  itself: naming for selection, argument design for a caller that guesses,
  result shapes for a reader that reasons, and the two error channels.
- [server-composition](./techniques/server-composition.md) — the publisher's
  spine: one registry as the single authority, one dispatch door, pagination,
  change notifications, and discovery caching.
- [client-integration](./techniques/client-integration.md) — the consumer's
  spine: config writing as code execution, consent at install and at call,
  federated catalogs, elicitation, and connection custody.
- [untrusted-result-handling](./techniques/untrusted-result-handling.md) —
  the inbound defense: results as attacker-controlled input, injection
  fencing, provenance, and the application-level gates the model cannot
  provide for itself.
- [catalog-projection-modes](./techniques/catalog-projection-modes.md) — one
  capability set published at several altitudes when the host's tool budget is
  hard, external and shared: the projections, the annotation-equality rule that
  keeps compression honest, re-checking policy at the resolved operation, and
  the price of a hand-maintained second authority.
- [tool-identity-vs-tool-name](./techniques/tool-identity-vs-tool-name.md) —
  the address a model calls is not the identity an operator correlates: a
  rename-stable identifier on the wire, what may change it, and why possession
  of one authorizes nothing.
- [sanctioned-session-state](./techniques/sanctioned-session-state.md) — when
  affinity is genuinely required: opt-in twice, degrade to nothing at one
  replica, and an owner identity regenerated per process so a restart is
  detectable rather than silently wrong.
- [egress-argument-gating](./techniques/egress-argument-gating.md) — the
  outbound defense: deciding from a call's arguments whether it hands a
  resource outside the sanctioned set, over a schema the host does not own.
- [write-freshness-gate](./techniques/write-freshness-gate.md) — the
  host-side precondition on write tools: a write to an existing artifact
  needs proof the model saw its current version, the proof is a hash on
  the read result so context loss is proof loss, writes never refresh it,
  and check-plus-write is one critical section per path.
- [caller-differentiated-capability](./techniques/caller-differentiated-capability.md)
  — one engine, a human surface and an agent surface: the agent's option set
  as a strict subset, subtraction chosen by the invariant rather than by
  feel, the refusal that names the surface, and when to split the tool
  instead.
- [fluent-syntax-bounded-grammar](./techniques/fluent-syntax-bounded-grammar.md)
  — accepting a notation the model writes fluently without granting the
  authority that notation normally implies: parse it yourself, whitelist the
  fragment the operation needs, and justify every admitted operator from the
  operation.
- [suspendable-request-classes](./techniques/suspendable-request-classes.md)
  — which calls may pause for a person and which may not: invocation verbs
  can suspend, the protocol's own metadata surface cannot, and the partition
  is total or it is a habit.
- [sealed-continuation-state](./techniques/sealed-continuation-state.md) —
  half-finished work handed to the caller to carry: a carrier is not a
  reference, so it is signed, principal-bound, operation-bound and expiring —
  and at-most-once still costs a server-side record.
- [enumeration-without-a-scope](./techniques/enumeration-without-a-scope.md)
  — a list operation whose scope nothing can define: recognising one handle
  needs no caller identity and correlating two does, so delete the operation
  rather than documenting the obligation.

## What a removed boundary was silently scoping

The three techniques above are one story told three times, and the story is
worth naming because it recurs whenever a system sheds a container. The
protocol removed sessions for good reasons — scale, resilience, the fact that
no two hosts agreed what a session *was*, so servers were designing against
an abstraction whose lifetime their callers controlled. But a session is
never only what it was for. It was also the place a half-finished operation
lived, the thing a listing was implicitly scoped to, and the channel that
made "the server asks the client a question" expressible at all.

Each of those had to be re-derived explicitly, and each landed somewhere
different: the paused operation became a result shape plus a sealed
continuation, the listing became a per-item handle check with the list
deleted, and the server's question became a value in a reply that the client
re-drives. **Ask of any boundary before removing it what it was scoping that
nobody wrote down** — the answer is rarely one thing, and the residue that
cannot be re-derived from a per-item check is the part that needs a design
decision rather than a translation.
