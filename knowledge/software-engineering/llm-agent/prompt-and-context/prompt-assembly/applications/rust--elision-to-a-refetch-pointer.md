---
layer: application
type: application
subject: prompt-assembly
technique: elision-to-a-refetch-pointer
stack: rust
verified_on: 2026-09-03
verified_against: rust@1.96.1
applied: code
ab_verdict: better
proof: ab-paired
---

# A tool-server resource that shipped the whole body twice

An LLM-observability service whose agent-facing server resolves an entity
URI to its contents. The read returned two content items for one entity: a
rendered document, and the same body pretty-printed as JSON. The second one
had no bound of any kind.

This is the technique's regime with its precondition unusually clean. The
expensive fields are the prompt and completion recorded on each span's
event, and **every span carries the event id that a separate read tool
takes as an argument** — so the bytes are one tool call away, by an action
the model can still perform. Summarizing them would lose them; truncating
them would misrepresent what is present; eliding them to a pointer costs a
round trip and nothing else.

## The measured arms

Same input through both arms on one instrument, a fixture of 200 spans
carrying 400-byte inputs and outputs:

| Arm | Behaviour | Bytes |
| --- | --- | --- |
| A | previous: whole body, pretty-printed | 206,644 |
| B | current: payloads elided, output compact | 43,628 |

A 4.7x reduction, with the structural view intact — all 200 spans present,
model, tokens and cost readable, each payload replaced by
`<elided: 402 bytes — fetch via ...>` carrying its own size.

An intermediate measurement is the useful one and was nearly not taken.
Eliding while still pretty-printing gave **63,844 bytes** — 30.9% of A.
Indentation over a few hundred spans is worth twenty kilobytes on its own,
so compact serialization is not a style preference here but a load-bearing
half of the change. A team adopting this technique against a structured
payload should measure the two independently; the elision gets the credit
and the serializer is doing a third of the work.

## The negative result, which is the more useful half

**Elision did not reach the threshold that triggers it.** Arm B is 43,628
bytes against a 24,576-byte trigger. The reason generalizes and the
technique should be read with it in hand: eliding bounds the payload **per
item**, and it cannot bound a collection whose **item count** is unbounded.
Two hundred spans of pure structure — ids, names, model, tokens, cost — is
43KB before any payload is considered.

So the threshold in this tree is a trigger, not a ceiling, and the code now
says so in those words. The change that would make it a ceiling is a cap on
the number of spans with a `…n spans elided…` marker — a second application
of the same technique at a different granularity, which the project's own
harness specifies elsewhere and has not built either. A test pins the
residual at 43,628 so that change has to tighten the assertion deliberately
rather than discovering it.

## What the tree says about the standard

The project had **already written this technique down**, in a performance
document dated seven weeks before this application, including the marker's
exact wording and the compact-serialization half. It was never implemented,
and the resource path had no cap at all. That gap between a specified rule
and an enforced one is the structural fact worth recording: the document
that names a rule is not the instrument that applies it, and here the two
had drifted far enough that the unbounded path was the shipping one.
