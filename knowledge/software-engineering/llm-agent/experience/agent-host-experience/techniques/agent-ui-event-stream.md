---
layer: technique
type: technique
subject: agent-host-experience
technique: agent-ui-event-stream
status: forged
laws: [verdict-survives-boundary, unknown-is-not-a-value]
shared_with: []
use_when: [the product hosts its own agent front end across several windows or devices, designing the event contract between an agent backend and its interface, a second window or a phone shows a different story of the same run]
---

# Agent-to-interface event stream

When the product hosts its own agent front end there is no outside host to render
anything: the product's main window, a second window, a phone page and a notification
surface each need a live view of a run, and each was usually wired to the backend by a
different hand. The result, left alone, is several partial stories of one run — text in
one place, tool activity in another, consent requests polled from a third. The
standard is **one typed event stream per run**, and every surface the product owns is a
reader of it.

This is not how a product appears inside someone else's agent host. Those hosts speak
the tool protocol and render what it returns
([journey-shaped-tool-surface](./journey-shaped-tool-surface.md),
[in-host-views](./in-host-views.md)). The event stream is the product talking to
itself.

## The vocabulary

A stream that serves every surface carries, in the order they happened:

- **Run lifecycle:** started (with the run's identity and what is running it), steps
  started and finished, finished (with whether anything is left waiting for a person),
  and failed with a typed reason.
- **Text** as start, deltas and end per message, so a reader can tell a finished
  message from one still arriving.
- **Tool calls** as start, arguments (streamed or whole), and **outcome** — succeeded,
  refused with its code, failed, or unknown. A line that appears only after a tool has
  finished hides the slow call the user is waiting on; a line with no outcome renders
  every refusal as a success.
- **State** as snapshots that replace and deltas that patch, in a standard patch format,
  so a surface that joins late takes the last snapshot and applies what followed.
- **Consent requests** as their own event, carrying the pending item's identity, so
  every surface can show the decision and none needs to poll for it.
- **Activity** — the narrated step the run is on — kept apart from text, so a surface
  can show progress without inserting it into the answer.

Prefer a cross-vendor event format to one tied to a single agent toolkit when the
backend may change, and either way keep the product's own definition as the single
authority with both sides of any language boundary pinned to it by a test. Parsing,
framing and the treatment of unknown event types are
[stream-parsing](../../../runtime-and-io/streaming-output/techniques/stream-parsing.md).

## Every surface reads the same story

Each surface attaches to a run by its identity and receives the same events. A second
window that only learns "the turn finished" and reloads the settled record has a correct
end state and no live state: it cannot show the tool the run is waiting on or the
consent request that just arrived. Make the stream joinable instead:

- **Number every event within its run** and let a reader resume from the count it has.
  A reconnecting reader replays what it missed rather than starting over or skipping
  ahead.
- **Bound the buffer and count the overflow.** A run's retained events have a ceiling;
  past it the rest are counted, and the reader is told how many it cannot replay.
- **End a quiet stream deliberately.** A stream that has carried nothing for a set
  interval closes with an instruction to come back from its count, so idle connections
  do not accumulate and a dead reader is distinguishable from a quiet run.

Ownership of a run's output by one surface, and attribution of late events to the run
that produced them, are
[run-attribution](../../../runtime-and-io/streaming-output/techniques/run-attribution.md).

## Projections must not launder

A narrower surface often reads a narrower vocabulary — a phone page with five kinds of
event instead of twelve. Build that vocabulary as **one projection function** from the
full stream, and hold it to two rules. It may drop an event kind the surface cannot
draw, but it counts what it dropped. And it never fills a field it does not know: a
projected tool line whose outcome is set to "ok" because the source event carried no
outcome has turned unknown into success
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). A typed refusal
that reaches the narrow surface as generic text has lost its verdict
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).

## Failures before the stream, failures inside it

Once a stream has started, the transport has already said success, and every failure
after that point must be an event. So decide everything that can be decided **before
the stream opens** — no engine available, the project already running a turn, the
caller over its limit — and answer those as ordinary refusals with their status, by
taking the run's slot before the first byte is written. What remains are failures only
the run can discover, and they arrive as typed failure events, never as a stream that
simply stops.

## A run that asks a person ends

A run that files a consent request finishes with "waiting" set, rather than holding the
stream open until the person answers. The decision arrives on its own channel, from
whichever surface the person uses, and resumes or continues the work as a new run.
Holding a stream open on a person couples the connection's lifetime to someone's
attention span; resumption after a decision is
[resume-after-decision](../../../orchestration/hitl-approval/techniques/resume-after-decision.md).

## Outside engines write into the same stream

When the product runs its turn on an engine that calls tools itself — a command-line
agent given the product's tool door — the tool lines and consent requests that engine
causes must still appear in the product's stream, in order with its words. Mint a
credential for that run alone, distinct from the product's own client credential,
scoped to the operations the turn may use and expiring with the run, and attach to it a
sink that writes each tool line and consent request into the run's stream. The stream
then records what happened regardless of which engine made it happen.

## A trusted server sits between every client and the agent

The event protocol has no authorization model of its own, and its clients can send far
more than text: messages, tool definitions, state, context, a thread identifier,
forwarded properties. Never expose the agent endpoint to a client directly. A server the
product trusts terminates every client connection and accepts **only the user's own
words** (and the scope they apply to) as input; tools come from the product's catalog,
state from the product's store, and a client-supplied thread identifier is a
continuation name that is re-authorized on every request, never a credential. A stream
credential carried in a URL, because a browser stream reader cannot set headers, is
written into every access log on the way; make it short-lived and single-purpose.

## When not to use this

- When the product appears only inside other people's hosts; it has no front end to
  stream to.
- When a run is a single request and response with no tool activity, a plain reply is
  enough; the stream earns its cost at the first tool call or second surface.
- When two surfaces never show the same run, they may each keep a simpler contract —
  until the day one of them needs to.
