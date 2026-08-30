---
layer: technique
type: technique
subject: prompt-assembly
technique: history-compaction
status: forged
laws: [identity-survives-reuse, count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [a cut tail orphans a result from the call it answers, the provider rejects a prompt the budget said fits, resuming a session whose last turn died mid-call]
---

# History compaction

Every layer in the golden path's table is *authored*: someone writes the
identity, derives the capability roster, selects what goes in the context
window. A multi-turn tool-using conversation adds a layer nobody writes and
nobody sized — **the transcript of what has already happened** — and it is the
only layer that grows on its own, monotonically, as a consequence of the system
working correctly. Compaction is the discipline of spending that layer down.

It looks like a truncation problem and it is not, which is why it is a
technique of its own rather than a rung on
[context-budgeting](./context-budgeting.md)'s ladder. Every other elastic
section can be cut anywhere a reader would accept a cut, because its validity
is a question of meaning. The transcript's validity is a question of
**protocol**: the message list has structural rules the provider enforces, the
system's own size arithmetic is an estimate of a number someone else owns, and
a turn that died leaves the record malformed in a way no amount of budgeting
notices. Three invariants follow, and all three fail in the same silent
direction — a request that is well-formed by local accounting and rejected, or
worse accepted and wrong, by the party that decides.

## The pairing invariant: a cut must not orphan a result

In a tool-using transcript, a result message refers to a call announced in an
earlier message by an identifier. The pair is the unit; each half alone is
malformed. A window that keeps a recent tail therefore cannot cut at an
arbitrary message boundary, because the most natural tail — "the last N
messages" — begins with a result whose call was in message N+1 and is now gone.
That tail reads perfectly as prose and is rejected as protocol, and the
rejection arrives as an opaque provider error at the top of the next turn,
several layers from the code that chose N.

The rule is one line and belongs in the cut itself, not in a validation pass
after it: **a tail that begins with a result walks backwards to the message
that announced its call, and starts there.** Cutting is thereby defined over
call/result groups rather than messages — the semantic boundary
[context-budgeting](./context-budgeting.md) already demands, with the boundary
supplied by the protocol rather than by the reader's judgment. And because the
identifiers are what bind the halves, they must survive every rewrite the
compactor performs
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)); a
summarizer that renumbers or re-mints call ids has broken every pair it kept.

The same invariant governs what compaction may summarize *into*. The summary
replaces turns; it must not be inserted between a call and its result, which is
the second way an otherwise careful implementation orphans a pair.

## The resume invariant: an interrupted turn leaves the record malformed

The continuation problem has a third regime beyond the two in
[continuation-prompts](./continuation-prompts.md). The session did not survive
in the platform's sense and it was not lost either: the durable record is
intact and **structurally broken**, because the process died between announcing
a call and recording its result. Nothing in the store is missing. What is
missing is the other half of a pair, and it will never arrive, because the
execution that would have produced it died with the turn.

Resuming such a session by replaying its record sends a call with no result and
fails on the first request. The repair is cheap and must happen before
assembly, not during it: **every dangling call gets a synthesized result saying
the execution did not complete before the turn ended.** That sentence is doing
two jobs. It restores the pairing invariant, and it tells the model something
true that it would otherwise infer wrongly — a call whose result never appears
reads, to a model, like a call that succeeded silently. Per
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success), the
interrupted execution gets its own spelling rather than borrowing the spelling
of a successful one.

The repair is also the cheapest available crash detector. A resume that
synthesizes nothing is a clean shutdown; a resume that synthesizes results is
reporting that the last turn died, and that is worth surfacing to the operator
rather than swallowing as routine.

## The size invariant: the window is advertised, the verdict is theirs

Budgeting assumes the assembler knows the ceiling. For a transcript it knows
two estimates of it. The window figure comes from the provider's own catalog
and describes a model's nominal input limit, not what this request will be
measured against — reserved output, provider-side additions, and per-account
variation all sit between the two. And the size figure is a local count, made
by a tokenizer that may not be the one the provider runs. Two estimates,
multiplied, compared against each other
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)): the
margin the budgeting technique reserves for counting error is a hedge against
this, and a hedge is not a guarantee.

So the transcript needs a compaction path on both sides of the request:

- **Proactive**, before the call: once the estimated size crosses a stated
  fraction of the advertised window, compact and proceed. The fraction is a
  configured number with a real trade behind it — low values pay summarization
  cost the conversation may never have needed, high values leave no room for
  the estimate to be wrong — and it belongs in configuration precisely because
  the right value depends on how badly the local counter and the provider's
  disagree for a given model.
- **Reactive**, on the provider's refusal: a rejection naming a context limit
  is not a failure to report to the user, it is the ceiling being announced by
  the only party that knows it. Compact once and retry the same turn.

The reactive path needs exactly one guard and fails badly without it: **a flag
recording that this turn has already compacted reactively, checked before the
retry.** Without it, a rejection whose cause is something other than size — a
malformed request misclassified, a limit the summary cannot get under — turns
into a compact/retry loop that shrinks the conversation to nothing while
burning a summarization call per iteration. One retry converts an unrecoverable
error into a recovered turn; unbounded retries convert it into a bill.

## The summarizer is a cheaper model with an expensive output

Compaction is the one place in prompt assembly where model-generated text is
promoted into a standing layer of every subsequent prompt, and it stays there,
re-billed and re-read, for the rest of the conversation. That makes routing the
summarization call to a cheaper model the obvious economy and worth one
caution: the summary's errors are not transient. A dropped constraint or an
invented decision does not produce one bad answer, it produces a conversation
that has silently changed its mind about what it is doing, with no artifact
showing where.

Two disciplines contain that, and neither is expensive. The summary announces
itself as a summary of N prior turns, so the model reads it at summary strength
rather than as remembered fact — the same rule the elastic ladder applies to
every other compressed section. And the material the conversation cannot afford
to lose is not left to the summarizer's judgment: standing instructions live in
the layers above, which compaction never touches, and durable facts the run
established belong in the memory store, which has its own retention discipline.
Anything load-bearing that exists *only* in the transcript is one compaction
away from being gone, and the fix is to move it out rather than to write a
better summarizer prompt.

## Decision rules

- Define the cut over call/result groups, never over messages; a tail that
  opens with a result walks back to the call that announced it.
- Never insert the summary between a call and its result.
- Repair dangling calls with synthesized "did not complete" results at resume,
  before assembly, and treat a non-empty repair as a crash report.
- Implement both compaction paths. Proactive alone trusts two estimates;
  reactive alone lets every long conversation take one rejection first.
- Guard the reactive retry with a once-per-turn flag. The unguarded version is
  a loop that pays per iteration.
- Keep nothing load-bearing exclusively in the transcript. Compaction is
  lossy by construction and it will eventually run.
- These rules govern the regime where the message list is itself the durable
  record. When the record is an append-only store the prompt is rebuilt from
  per call, compaction becomes a rendering choice and
  [tiered-history-projection](./tiered-history-projection.md) applies
  instead.
