---
layer: technique
type: technique
subject: prompt-assembly
technique: elision-to-a-refetch-pointer
status: forged
laws: [derivation-names-recomputation, unknown-is-not-a-value, limits-are-derived]
shared_with: []
use_when: [historic tool results dominate a context window that summarizing would not fix, deciding what to do with images and captured frames from earlier turns, a compaction step is proposed for material that is still addressable at its source, keeping a composed prefix byte-stable while shrinking it, choosing which kinds of output a size threshold is allowed to touch]
---

# Elision to a re-fetch pointer

[History compaction](./history-compaction.md) spends a transcript down by
summarizing it, and [tiered history projection](./tiered-history-projection.md)
renders an immutable log at chosen resolution. Both answer the same
question — how does a growing history fit a fixed window — and both answer
it with **a smaller version of the content**. There is a third answer, and
it applies to a specific and very large class of transcript material: the
part that is still addressable at its source.

A tool result is the standard case. The model called a tool, the tool
returned forty kilobytes, and that output sits in the transcript forever
after. But the tool is still there, and calling it again is cheap. So the
transcript does not need a summary of the output. It needs a **pointer that
tells the model the output is gone and how to get it back**:

> *(earlier output omitted — re-run the tool if you need it)*

That is not compaction, because nothing was compressed and nothing was
judged. It is not truncation, because nothing was silently cut. It is a
deliberate trade of **information for a round trip**, and it is available
whenever the material's source outlives the message that carried it.

## The three material classes this reaches

- **Tool results above a size threshold, from prior units of work.** The
  threshold is policy, not judgment; a small result costs less to keep than
  the sentence replacing it.
- **Inline binary parts** — captured frames, screenshots, attached images.
  These are the most expensive content per unit of meaning in any
  transcript, and they are almost never re-read. The replacement is a text
  part **stating how many of each kind were dropped**, because the count is
  what the model needs to reason about the gap
  ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) —
  "three frames omitted" is a fact, and an image silently missing is a
  transcript that quietly lies about what the model was shown).
- **Snapshots of a file or document the user attached.** These keep their
  identity and their address and lose their body: the model is told which
  file, and that the file is still readable.

The shared property is the one to test for before elising anything: **is
the material recoverable by an action the model can still take?** If yes,
elision is correct and summarizing it is strictly worse. If no — a
deliberation, a user's instruction, a result from a tool that has since
changed the world — elision destroys it and compaction is the right tool.

## Where size stops being the right axis

"The threshold is policy, not judgment" holds while the material is
homogeneous — one kind of output, one re-read probability, and size is the
only thing that separates one instance from another. It stops holding the
moment the material has **classes with different re-read probabilities**,
because size and importance are correlated: the largest outputs are frequently
the information-dense ones, so a pure size rule reaches first for exactly the
material most likely to be wanted again. The rule fires hardest where it is
most wrong, and it looks efficient the whole time.

The corrective is to class by **what produced the output** and let size act
only inside a class:

- **Source-like and arbitrary output, returned unchanged** — file contents,
  change diffs, revision displays, the output of scripts the system did not
  write. This class is re-read by construction: the consumer asked for the
  bytes because it intends to reason over the bytes. It is not compressible at
  any size, only elidable to a pointer, and only once the unit that asked for
  it is done.
- **Structured result sets** — search matches, listings, enumerations. These
  admit a third option beside *keep* and *elide*: **reorganise into a more
  compact grouping while dropping no entry**. Lossless re-presentation costs
  nothing in recoverability, because nothing was lost — which is why it should
  be exhausted before either of the other two is considered.
- **Predictable repetitive noise** — dependency installs, build logs, test and
  lint runs, progress output. This is the class compression is actually for,
  and even here it earns its place only when the saving is substantial;
  compressing a short log is the same bad trade as summarizing a result that
  already fit.

A 2026-09 first-party account of one coding agent (n=1) makes the failure
concrete rather than theoretical: an early version of such a compressor
included revision-diff output in its compressible set, benchmark tasks showed
agents reopening the preserved original to recover what had been removed, and
the filter was removed. The account states its shipped policy "is conservative
not because the goal was to build a conservative compressor, but because that
is what the evaluations supported."

That sentence is the transferable part, and it is worth more than the class
list above. **The conservatism was an output of measurement, not a design
stance** — which means the classes are a starting hypothesis to be tested
locally, never a threshold to borrow
([limits-are-derived](../../../../_laws.md#limits-are-derived)). What tests it
is the recovery behaviour the policy provokes; how to count that, and why a
near-zero count does not by itself license taking more, is
[the recovery path as loss signal](./recovery-path-as-loss-signal.md).

One stage difference decides which of the two lanes a given policy belongs in:
this technique operates on **history** — material from prior turns, already
read once, still addressable at its source — while a classed compressor
operates at **ingest**, on a payload the consumer has never seen, where nothing
can yet be said about whether it was needed; the two compose, ingest deciding
what enters the record and in what shape, elision deciding what a later
composed prefix still transmits of it.

## Elision is a decorator, and the record never sees it

The transformation belongs **outside** the thing that resolves a prefix,
wrapping it. The resolver's job is to produce the true prefix from the
durable record; elision's job is to decide what this one call transmits.
Keeping them separate buys three things, and collapsing them loses all
three at once: the durable record stays complete, every consumer that is
not a model call (an inspector, an export, a later re-render) sees the real
history, and the policy can change without rewriting anything.

Two properties the decorator must have:

- **It is a pure function of each message.** Not of the transcript, not of
  the remaining budget, not of the call index. A per-message rule composes
  the same prefix bytes every time, so a provider prefix cache keeps
  hitting; a rule that spends a budget across the transcript produces
  different bytes on every call and turns a cache into a bill.
- **The current unit's own messages never pass through it.** The tool
  result the model just received and the frame just captured are the
  material it is actively reasoning about. Elising those is not an
  optimization, it is amnesia in the exact moment the work depends on
  memory.

## The caveat that has to be written down

Elision makes the transmitted bytes a function of the durable record **plus
the policy in effect when the prefix was composed**. That is a real
exception to the property that a prompt is recomputable from the record
alone ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)),
and it is worth taking deliberately rather than discovering later.

Within one unit of work it is harmless: policy is read once, at the start.
Across time it is not — inspecting an old unit after a policy change shows
a prefix that differs from what was actually sent, and a debugging session
that does not know this will chase a phantom. Two obligations follow.
**Any tool that renders a historic prefix composes through the same
decorator and prints the policy it applied**, so the divergence is visible
rather than silent. And if exact-byte replay ever becomes a requirement
rather than a convenience, the applied policy is recorded on the unit and
composition reads it from there — at which point the exception closes.

## Decision rules

When material is addressable at its source, elide to a pointer naming the
way back; when it is not, compact it or keep it. When dropping binary
parts, replace them with a count by kind, never with nothing. When siting
the transform, wrap the resolver rather than editing it, and keep the
durable record untouched. When writing the rule, make it per message.
When exposing an inspector, compose through the same decorator and print
the policy. When the threshold is chosen, put it in configuration beside
the other context policy, because it is the number that will be tuned.
When the material has classes that differ in how likely they are to be read
again, class it before sizing it, and let a size rule operate only within a
class. When a policy is inherited from somewhere else, treat its numbers as a
hypothesis and re-derive them from local measurement before defending them.
