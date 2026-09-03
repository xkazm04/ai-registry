---
layer: technique
type: technique
subject: prompt-assembly
technique: endpoint-sealed-continuation-metadata
status: forged
laws: [identity-survives-reuse, unknown-is-not-a-value, failure-not-empty-success]
shared_with: []
use_when: [a conversation may change model or provider partway through, replaying a stored assistant turn is rejected by the provider that did not produce it, deciding what part of a transcript is portable and what is sealed, a reasoning-capable model loses its chain when the history is reused]
---

# Endpoint-sealed continuation metadata

A transcript looks portable. It is a list of messages, each with a role and
some text, and every instinct built on that shape says the history can be
handed to whichever model is serving the next call. That instinct is now
wrong for the part of the history that matters most to a reasoning model.
Providers attach **opaque continuation metadata** to assistant turns —
signatures over a thinking block, an encrypted reasoning payload, a
per-part token that proves the segment was produced by that endpoint — and
that metadata is sealed to the exact endpoint that minted it. Replayed
anywhere else it is not ignored; it is *rejected*, and the call fails with
an error about the payload rather than about the conversation.

So a transcript has two kinds of content, and only one of them is portable.
The text is a fact about the conversation. The metadata is a fact about
**where the conversation happened**, and it stops being true the moment the
next call goes somewhere else.

## The unit of decision is a segment, not the transcript

The naive corrections both fail. Stripping metadata globally is safe and
expensive: it discards the continuity the provider requires within a
model's own chain, which is exactly the case the metadata exists to serve,
and it breaks the byte-stability a prefix cache depends on. Keeping it
globally fails on the first switch.

The unit that actually carries the property is the **segment** — the run of
messages produced by one resolved model in one completed unit of work. Walk
the materialized prefix segment by segment and ask of each, against the
model the assembled prompt is about to be sent to:

- **Was this segment produced by that same endpoint?** Equality here is
  strict and has two terms, not one: the provider instance *and* the model
  identifier. A same-named model reached through a different route is a
  different endpoint, and the seal is on the route.
- **Did the unit of work that produced it close cleanly?** A failed or
  cancelled unit's metadata describes a chain that was never finished. It
  is not evidence of anything the next call can continue from.

A segment answering yes to both replays verbatim, metadata included. Every
other segment — a different producing model, an unclean close, and always
the inline base of the chain, whose origin is simply unrecorded — passes
through a strip.

**The base case is the one that gets missed.** A prefix whose provenance
was never recorded is not a prefix known to be clean; it is a prefix whose
producer is unknown, and [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)
puts it on the strip side. A migrated conversation carrying foreign metadata
is the concrete failure: it looks like ordinary history and it poisons the
first call that trusts it.

## What a strip removes, and what it must preserve

A strip is not a deletion of the segment. It is the removal of the sealed
half and a **demotion** of the rest:

- Message-level and part-level metadata is dropped.
- A reasoning part that carries visible text is demoted to a plain text
  part. The continuing model keeps the information and loses only the
  opaque blob — which is the correct trade, because the reasoning was
  content and the signature was custody.
- A reasoning part that carries *only* a signature is dropped whole. There
  is nothing under it to keep.

The distinction between those last two is what separates a strip from a
lobotomy. An implementation that drops every reasoning part because some of
them are signature-only throws away the model's own account of its work at
precisely the moment — a provider switch, usually a fallback — when the
next model has the least context.

## Strip at materialization; never in the record

The strip is a **transmit-time** transformation. The durable record keeps
full fidelity, always, and the strip is applied when the prefix is composed
for one specific call. Two properties follow, and both are load-bearing:

- **Switching back restores verbatim replay.** A conversation that moved to
  a second model and returned to the first finds the first model's segments
  intact, because nothing was ever destroyed — only withheld from a call
  that could not use them.
- **The strip is deterministic per message.** The same segment composed for
  the same target model yields the same bytes every time, so a provider's
  prefix cache continues to hit
  ([cache-breakpoint-allocation](./cache-breakpoint-allocation.md) is
  measuring a prefix this rule must not make unstable). A strip that
  depended on when it ran, or on how many segments preceded it, would
  invalidate the cache on every call and the cost would show up as a bill
  rather than as an error.

## The in-flight loop is exempt, by construction

There is one place providers hard-require the metadata: between the tool
calls of a single unit of work in progress. That prefix is not history and
must never be routed through the same path as the history — the messages
the current unit has produced are appended directly, unstripped, because
the model is mid-chain and the seal is still valid. Build the exemption
structurally, by keeping the in-flight messages out of the resolver, rather
than as a condition inside it. A conditional that has to recognise "this
segment is the current one" is a conditional that will eventually be wrong
about a resumed unit.

## Decision rules

When composing a prefix, carry the target model as an input to composition —
a composer that does not know where the prompt is going cannot apply this
rule at all, and that is the commonest way it is missed. When comparing
producer to target, compare provider instance and model identifier, never
the model name alone. When a segment's producing unit did not close cleanly,
strip it. When provenance is absent, strip it. When stripping, demote
reasoning that has text and drop reasoning that has none. When the current
unit's own messages are being appended, do not send them through the
resolver at all.

## When this does not apply

A single-model deployment that has never fallen back pays only the cost of
the walk, and can carry the rule as an assertion instead of a transform.
Say so explicitly rather than omitting the rule — the assertion is what
fails loudly on the day a fallback is added, and the alternative is a
silent provider error in the one path nobody exercised.
