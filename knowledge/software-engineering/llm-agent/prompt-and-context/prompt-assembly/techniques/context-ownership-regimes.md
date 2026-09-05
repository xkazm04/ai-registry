---
layer: technique
type: technique
subject: prompt-assembly
technique: context-ownership-regimes
status: forged
laws: [limits-are-derived, silent-state-is-ungoverned, derivation-names-recomputation]
shared_with: []
use_when: [a provider offers context editing or compaction on its side beside the client's own, a stateful agent protocol holds the conversation and the client sends only new messages, a transcript was edited or compacted twice in one turn, deciding which client-side context operations still run when the window is managed elsewhere, a client rewrite would orphan an opaque continuation block the provider returned, the same threshold has to be expressed to two different owners]
---

# Context ownership regimes

[history-compaction](./history-compaction.md) and
[elision-to-a-refetch-pointer](./elision-to-a-refetch-pointer.md) assume one
party owns the transcript: the client composes the message list, measures it,
edits it, summarizes it, and sends the result. That assumption held while every
call was stateless and every provider was a completion endpoint. It no longer
holds in two directions at once. Providers now offer to edit and compact the
context **on their side**, inside the request, on triggers the client names.
And agent protocols now hold the conversation **on the agent's side**, so the
client sends only what is new and never sees the whole list. A client that keeps
running its own editing and compaction in either of those settings does not get
belt and braces. It gets a transcript rewritten twice by parties that cannot see
each other's rewrite, and the second rewrite orphans what the first one minted.

The technique is one question asked once per adapter, and the consequences
that follow from the answer:

> **Between turns, who holds the transcript, and who is allowed to rewrite it?**

## Three regimes

| Regime | Who holds the list | Client editing | Client compaction | Client's remaining lever |
| --- | --- | --- | --- | --- |
| **Client-held, stateless calls** | the client, sent whole every call | runs, on the lower trigger | runs, on the upper trigger | everything: both lanes, both thresholds |
| **Client-held, provider-managed window** | the client sends the list; the provider edits and compacts it inside the request | **off**: the threshold is *passed through* as the provider's edit trigger | **off**: the threshold is passed through as the provider's compact trigger, floored at the provider's stated minimum | the bytes it transmits; the block the provider returns must be replayed verbatim |
| **Agent-held, stateful protocol** | the agent process; the client sends deltas | none: there is no list to edit | none: the agent compacts on its own schedule | the per-turn prefix it composes, and the agent's own session list and load for resume |

Two of the three columns say **off**, and the reason is not politeness toward
the provider. It is a pairing hazard the client cannot see from its side.

## Why the client switches off rather than doubling up

In the provider-managed regime the provider's compaction returns an **opaque
block**: a summary sealed to the endpoint that minted it, carried inside the
assistant message, and required verbatim on the next request, or the provider
rejects the continuation. That is the same object
[endpoint-sealed-continuation-metadata](./endpoint-sealed-continuation-metadata.md)
governs for reasoning parts, and the same rule applies: the client stores it,
replays it in the position the provider expects, and does not rewrite around
it. A client-side compaction that replaces the message history with its own
summary drops the block; a client-side edit that clears the tool result the
provider's summary refers to leaves the provider re-summarizing a hole. The
first-party record of this is a fix titled *prevent double context management*:
the client had been editing what the provider was about to compact, and the
repair was to make the ownership exclusive.

The other half of the trade has to be written down, because it is real and it
is the half the client gives up. Server-side editing removes cleared tool
results from the model's *window*; it does not remove them from the *wire*.
The client still transmits the full list, so the bytes per request stay large
while the billed context shrinks. A client could keep its own editing lane
for the wire savings alone, and one first-party operating document described
exactly that intent, but the code that shipped chose exclusivity, because a
client edit ahead of a provider compaction is the double-management hazard
above wearing a cheaper hat. **Ownership is exclusive or it is a race**; the
wire cost is the price of the exclusivity, and a system that wants the wire
savings back moves them into the provider's edit trigger rather than running a
second editor.

In the agent-held regime there is nothing to argue about: the client never has
the list. What it has is the **prefix it composes for each turn** (identity,
rules, recalled memory, scene), and that becomes the whole of its context
discipline. The health signal moves with it: a cache-creation count that
tracks the whole prefix turn after turn, against a flat read count, says the
client is rewriting the one thing it still owns
([silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)).
Resume is the agent's session listing and load, not the client's message list.

## The switch is per adapter and per model, resolved at request time

The regime is not a property of the vendor. One vendor serves models that
manage their own context and models that do not, behind one endpoint, and the
capability is a fact about the **model in use**, resolved when the request is
built, from a cached capability table that may need a refresh, with the
refresh's failure read as *does not manage* rather than as *manages*
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
Three consequences:

- **An operator flag that turns the provider's management off hands ownership
  back to the client**, in the same request cycle, with the client's lanes
  re-armed. The regime table is evaluated per request, not per session.
- **The threshold is a property of the window, not of the owner.** The
  client's proactive fraction is the same number whichever side enforces it;
  passing it through is the honest encoding, and a provider that states a
  minimum trigger gets the maximum of the two
  ([limits-are-derived](../../../../_laws.md#limits-are-derived)). A client
  that keeps one number for itself and invents another for the provider has
  two windows nobody derived.
- **The stateful-protocol regime is decided by the adapter's type**, before any
  capability lookup: a protocol that holds the conversation on its side is
  never in the client-held column, whatever its model advertises.

## Decision rules

- Ask, per adapter and per request, who holds the transcript between turns;
  route to exactly one of the three regimes.
- Client editing and client compaction run only in the client-held, stateless
  regime. In the provider-managed regime both are off and both thresholds are
  passed through; in the agent-held regime both are off and resume is the
  agent's.
- Replay a provider-returned compaction block verbatim, in position; never
  compact or edit across it.
- Record the wire cost the exclusivity buys; if it matters, tune the provider's
  edit trigger rather than adding a second editor.
- Treat a failed capability lookup as *client-held*: the recoverable error is
  a client compaction the provider would also have done, not a transcript
  nobody compacted.
- In the agent-held regime, the client's discipline is the prefix it composes;
  measure it by cache creation against cache reads per turn.
