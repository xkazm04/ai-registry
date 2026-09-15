---
layer: technique
type: technique
subject: prompt-assembly
technique: fold-only-acknowledged-evidence
status: forged
laws: [unknown-is-not-a-value, record-precedes-effect, verdict-survives-boundary]
shared_with: []
use_when: [one long tool-running turn outgrows the window after every older turn is already gone, deciding whether a result in the current turn may be replaced by a pointer, a request failed or was interrupted and the next compaction wants to shorten what it carried, choosing what happens when nothing safe is left to remove, a provider refusal arrives after a stream has already emitted output]
---

# Fold only acknowledged evidence

[elision-to-a-refetch-pointer](./elision-to-a-refetch-pointer.md) decides
**what** may become a pointer: material still addressable at its source, from
prior units of work, never the current unit's own messages. That exemption is
correct and it is not absolute. A single turn that runs a long chain of tools
can outgrow the window on its own, after every completed turn has been folded
or evicted, and at that point the system either shortens something inside the
active turn or stops. This technique owns the question the exemption leaves
open: **when** a piece of the active turn may be shortened. The answer is a
precondition, not a threshold. A block may be folded only after a model call
that carried it has completed successfully.

## Removal runs cheapest recovery first

Pressure is relieved in the order of what the removal costs to undo, and the
active turn is the last place the pipeline reaches:

1. results from completed turns, folded to recovery pointers in one batch;
2. the middle of history, evicted to the durable record behind an index;
3. results from completed turns still live after eviction, folded one at a
   time until the pressure target is met;
4. reasoning from the active turn, omitted at request time only, with the
   live record and the durable store keeping the exact text;
5. results from the active turn, folded.

Steps 4 and 5 are the only ones this technique governs, and they are the only
ones where a wrong fold destroys the thing the current step exists to consume.
A pointer to a completed turn's output costs a round trip. A pointer in place
of a result the model has not yet read costs the step its evidence: the model
reasons over the address instead of the content, and nothing in the transcript
says the content was never seen.

## Read is an event, not a position

The tempting rule is positional: a result that appears before the most recent
model call has been read. It is wrong in exactly the cases that produce
pressure. A request that the provider rejected did not consume its inputs. A
request that was interrupted mid-stream consumed an unknown fraction of them.
A request retried after overflow recovery carried a different input from the
one that failed. In each case message order says "read" and the event says
nothing of the kind. Treating "we do not know whether it was read" as "it was
read" is the laundering move
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) forbids.

So capture and acknowledgement are two separate operations, and the separation
is the mechanism:

- **Capture** runs before the request: snapshot the identifiers of the results
  and reasoning blocks about to be sent. Capture confers nothing.
- **Acknowledge** runs on the model-call end event, and only when that event
  reports a completed call. A failure raises past it; an interruption arrives
  as an end event whose finish reason says interrupted, and is ignored. Only
  then does the snapshot join the acknowledged set.

A captured snapshot that is never acknowledged is simply discarded. The cost of
a false negative is a fold that did not happen this round; the cost of a false
positive is a step reasoning over evidence it was never shown. The asymmetry
decides the default.

Acknowledgement is necessary and not sufficient. A folded result is replaced by
a pointer into the durable record, and the pointer must resolve, so a block is
eligible only when it is both acknowledged and already persisted. The record of
the evidence precedes the removal of the evidence
([record-precedes-effect](../../../../_laws.md#record-precedes-effect)); a
pipeline whose write-through failed does not fold or evict at all that round,
because every pointer it would mint would point at a row that does not exist.

The acknowledged set is saved with session state and pruned to live blocks on
each rebuild; a resume that lost it would treat everything as unread, which is
the safe direction.

## The protected set, and failing closed

Four things are never shortened, acknowledged or not:

- the current request that opened the turn;
- pending calls whose results have not arrived;
- results no completed call has read;
- the newest few results, a fixed small count, because the next step is most
  likely to consult them.

When every eligible fold has run and the request still does not fit, the
pipeline has reached a floor, and the only honest outcome is to say so. It does
**not** run a second, lossier fallback: cutting unread results "just this once",
trimming the request, or retrying the provider in a loop. It raises a typed
"context unfit" error carrying the measured size and the effective limit. The
type is the point
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)):
the outermost consumer can branch on it and offer the real choices, which are
to narrow the tool set, start a new turn, or move to a larger window. A generic
failure, or a transcript quietly shortened into fitting, offers none of them.

The effective limit is the advertised window minus a reserve for the answer,
and the fold steps aim below it rather than at it, so the next step has
headroom and a disagreement between the local count and the provider's does
not produce a refusal one step later.

## Overflow recovery: once, only if something changed, never after output

[history-compaction](./history-compaction.md) owns the reactive path and its
once-per-turn guard. Acknowledgement-gated folding adds two conditions to it.

**Retry only when recovery changed the input.** A forced compaction that found
nothing eligible (everything left is protected or unread) has produced the same
request, and sending it again buys a second identical refusal. The recovery
reports whether it evicted or folded anything, and a no-op recovery re-raises
the original refusal.

**Never replay a stream that has already emitted meaningful output.** A refusal
can arrive after the stream began. By then a consumer has seen partial output,
and a replay produces a second, possibly different answer to the same step. The
stream wrapper tracks whether anything meaningful was emitted; if so, the error
propagates rather than triggering recovery. Recovery is for failures before
output, and only those.

## A request-time omission must prove its saving

Omitting reasoning at request time is the cheapest active-turn fold, because
the record keeps the text and only the wire representation changes. It can
also save nothing: a formatter that does not relay reasoning, or a counter that
already ignores it, yields the same size with or without the omission. So the
omission is applied, the request is recounted once, and if the count did not
fall the omission is rolled back. A recount that fails also rolls it back.
Otherwise reporting and saved state claim a fold that changed nothing, and a
later resume applies a filter nobody accepted.

## Decision rules

- When a block belongs to the active turn, fold it only if a completed model
  call acknowledged it and its durable copy exists. Everything else in the
  active turn stays verbatim.
- Capture before the request, acknowledge on the end event, and treat failed
  and interrupted calls as unread. Never infer reading from message order.
- Run the active-turn steps last, and reasoning before results, because
  reasoning is cheaper evidence and is already durable.
- When the protected set alone exceeds the limit, raise a typed unfit error
  with the measured size and limit. Do not add a lossier fallback beneath the
  safe one.
- On a provider refusal, recover once, retry only if the recovery changed the
  input, and never after the stream has emitted output.
- When a request-time omission does not reduce the recount, roll it back.
- When write-through failed this round, do not fold or evict; recount, and
  raise unfit if the live context does not fit.

## When not to use this

- **A size cap applied by the producer before the result enters the context.**
  A tool-result serializer that stops at a limit and says, in the result
  itself, that this is not the whole list has shortened nothing the model held;
  nothing unread was in the context to destroy. That is an ingest decision, and
  it belongs to
  [tool-result-economy](../../tool-result-economy/tool-result-economy.md). The
  acknowledgement precondition governs removals from a context, not the shape
  of what enters it.
- **Completed turns.** Their results are governed by elision-to-a-refetch-pointer's
  rule. Turn position is a coarser proxy for reading than acknowledgement, and
  it is acceptable there because the material is addressable and a pointer
  recovers it; it is not acceptable inside the step that is still consuming.
- **Systems with no addressable record.** Without a durable copy a fold is a
  deletion, and acknowledgement does not make a deletion safe. Keep the
  evidence or fail closed.
- **Single-shot calls with no tool loop.** There is no active turn that can
  outgrow the window by itself, and the ordinary budget ladder in
  [context-budgeting](./context-budgeting.md) is enough.
