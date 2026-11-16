---
layer: technique
type: technique
subject: agent-host-experience
technique: peer-agent-delegation
status: forged
laws: [claimant-does-not-adjudicate]
shared_with: []
use_when: [deciding whether a product should be a peer agent or a tool capability, another organization's agent wants to delegate long-running work to the product, a proposal to ship an agent endpoint so general assistants can reach the product]
---

# Peer-agent delegation

There are two ways for a product to be reachable by an outside agent. As a
**capability**, it publishes operations and the caller's agent stays in control: it
decides what to call, reads every result, and composes the journey. As a **peer
agent**, it accepts a whole task from another agent and works on it with its own
reasoning and policy, reporting progress through a task lifecycle — submitted, working,
input required, auth required, completed, failed, canceled, rejected — and returning
artifacts at the end. The caller sees the task, not the steps.

The capability is the default, and the peer agent is the exception that needs a reason.

## When the peer form is right

All of these, not one of them:

- **The work is long-running** — hours or days, not a request — and outlives any
  sensible tool call even with a durable handle.
- **The work needs the product's own reasoning and policy**, which the product will not
  or may not expose step by step: underwriting, a compliance review, a negotiation under
  rules the counterparty must not see.
- **The delegation crosses an organization**, so the caller cannot be given the
  product's operations directly and should not see its interior.
- **The task genuinely pauses for the delegating side** — it needs more input, or a
  sign-in on the caller's side — and the lifecycle's input-required and auth-required
  states carry that pause honestly.

### Long-running and paused no longer point to the peer form

Amended 2026-11-16. The first and last conditions above were written when the tool
protocol had no durable task of its own. Both now have a tool-side carrier, so on their
own they no longer argue for the peer form.

- **Long-running work.** The tool protocol's 2026-07-28 revision moved tasks into an
  official extension. A task is polled for its state and can be sent input while it
  runs. A tool call that answers with a task handle carries hours of work.
- **A pause for the caller.** The same revision lets an interim result say that input
  is required and name what it needs, and the caller answers and retries. That carries
  the "needs more input" pause. A sign-in on the caller's side was already the
  protocol's authorization flow.

What the tool surface does not replace is the other pair: **the caller hands over the
whole task and does not drive its steps**, and the reasoning that runs it sits under
policy the caller must not see, across an organization boundary. A multi-turn exchange
is not the line on its own. A negotiation under a counterparty's hidden rules runs fine
over tools when the caller's agent wants to place each offer itself: it reads the
table, sends, and reads again, and the counterparty's policy stays on the server. The
peer form is earned when the caller wants to say "get this done within these limits"
and come back for the result. A delegated job that runs long, pauses once and returns a
result is a tool with a task handle, even across organizations. So the test is now two
conditions, not four: does the caller want to delegate the steps and not only the
work, and does the delegation cross a trust boundary that rules out exposing the
operations?
The tool protocol becoming stateless in the same revision sharpens the session-smuggling
point below: a tool call no longer has a protocol session to smuggle through, and a peer
session still does.

When the caller's agent can finish the journey with a handful of operations, it should:
it keeps control, sees every step, and the user's own assistant stays accountable for
the outcome. That is [journey-shaped-tool-surface](./journey-shaped-tool-surface.md).

## Never a peer agent instead of tools

General assistants and coding agents call tools. A product that ships a peer-agent
endpoint to reach them reaches almost none of them: a 2026 survey for this subject found
peer-agent support in enterprise agent runtimes and no evidence of it in consumer chat
hosts. Peer delegation is shipped beside a tool surface, for a named consumer that needs
it, never in place of one.

## What the peer form costs

The honest counter-evidence is that it often is not worth it. At least one practitioner
retrospective concluded that the implementation burden — agent descriptions, task state
machines, streaming and push notification, artifact handling, cross-organization
authentication — outweighed the benefit, and that the tool protocol already covered most
of what was needed; adoption outside enterprise runtimes is thin. Re-read 2026-11-16:
the retrospective is dated March 2026 and also argues that a tool server holding
context behind a task identifier already gives statefulness. A July 2026 comparison
that built the same multi-agent task both ways found the tool protocol the lighter
implementation and the peer lifecycle the more complex one. The other side of the
ledger: the peer protocol reached its first stable release in March 2026, under a
neutral foundation, and had a patch release two months later. It is real and
maintained. What remains thin is adoption by consumer assistants. Treat that as the
prior to beat, not as a verdict. Before building, name the consumer, the task,
and the reason the tool surface cannot carry it. If any of the three is missing, build
tools.

## When it is right, build it with these

- **A signed description.** The agent description that names the product's skills,
  endpoint and accepted security schemes is signed, so a caller can verify it came from
  the product and was not substituted on the way.
- **Human approval for critical acts.** A peer agent acting under another organization's
  instruction still completes irreversible and money-bearing acts only through the
  product's own consent, exactly as a handoff would
  ([depth-handoff](./depth-handoff.md)). The delegating agent's statement that its user
  approved is a claim, not the approval
  ([claimant-does-not-adjudicate](../../../../_laws.md#claimant-does-not-adjudicate)).
- **Session-smuggling awareness.** A stateful peer session is a channel through which a
  malicious or compromised remote agent can inject instructions across many turns, in
  either direction. It is not a protocol bug; it is what a conversation between agents
  is. Treat every message from the peer as untrusted input, bound what one session can
  cause, and prefer stateless exchanges where the task allows — a stateless tool call
  gives an injection one turn to work with, a long session gives it many.
- **The result is checked, not believed.** A peer agent's "completed" is its own claim
  about its own work. The caller verifies artifacts against what was asked, and the
  product, when it is the caller, does the same to any agent it delegates to.
- **Authorization at the task, not the session.** Each task carries its own grant; a
  long session does not accumulate authority. The token and audience rules are the
  tool protocol's, unchanged
  ([authentication-and-scoping](../../../runtime-and-io/mcp-tools/techniques/authentication-and-scoping.md)).

## The product as the delegating side

The same rules bind the product when it delegates to someone else's peer agent: the
remote agent's messages are untrusted input, its completion is a claim to verify, and
nothing it returns arms an action without the product's consent. Delegating to a peer
does not delegate accountability for what the product then does with the result.

## When not to use this

- When the outside caller is a general assistant or a coding agent: they call tools.
- When the work fits a request plus a durable handle; a long-running tool operation is
  simpler than a peer lifecycle.
- When the delegation stays inside one organization and one trust domain; an internal
  job queue does the same work without the protocol surface.
