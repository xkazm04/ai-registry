---
layer: application
type: application
subject: prompt-assembly
technique: consumer-coupled-decoration
stack: rust
verified_on: 2026-09-04
verified_against: rust@1.96.1
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Two decorations on one tool server: one that outweighs its item, one whose reader collapses it

An LLM-observability service whose agent-facing tool server returns every
result twice — as rendered Markdown and as raw JSON — through a shared
rendering crate. Both surfaces attach per-item markup, and one of them is
also read by a command-line client. The version witness is
`rust-toolchain.toml`, which pins `channel = "1.96.1"` and is the file every
CI job resolves the toolchain through; no version here is inferred.

The technique's audit is a form, not an experiment, and it was run as one on
five candidate decorations. Two are findings, one is a clean pass worth
recording as a control, and three are out of the technique's reach for a
reason worth stating.

## Decoration one: a marker that outweighs the item it replaces

`crates/mcp/src/resources.rs:126-134` replaces each span's recorded prompt
and completion with `<elided: {n} bytes — fetch via ...>` when a payload is
over budget. That is a per-item decoration on every element of the payload,
argued for at the unit of one item, billed at items times payloads times
sessions — 400 markers on the crate's own 200-span fixture.

The audit's three questions all answer:

1. **Current consumer** — the model. Named at the site.
2. **What it does with it** — decides whether to fetch. The comment at
   `resources.rs:100-103` says so in words: the byte count is carried
   "because 'how much is missing' is the fact a caller needs to decide
   whether to fetch."
3. **What fails without it** — the model cannot tell a four-byte payload
   from a sixty-kilobyte one, and cannot price the round trip.

So it is **not residue**. The technique's decision rule "record the consumer
where the decoration is attached" is already satisfied, unprompted. What
fails is the technique's other bound — *the wrong granularity, not a wrong
idea*. The marker is attached to every field in the class regardless of that
field's own size, and it is 43–46 bytes encoded:

| payload per field | encoded item | marker | net per field |
| --- | --- | --- | --- |
| 4 B | 6 | 43 | **+37** |
| 16 B | 18 | 44 | **+26** |
| 32 B | 34 | 44 | **+10** |
| 48 B | 50 | 44 | −6 |
| 400 B | 402 | 45 | −357 |

Paired arms on the crate's own fixture, arm A shipped and arm B the same
plus a 64-byte per-field floor:

| payload per field | arm A | arm B | delta |
| --- | --- | --- | --- |
| 2 B | 42,828 | 27,228 | −15,600 |
| 4 B | 42,828 | 28,028 | −14,800 |
| 8 B | 43,228 | 29,628 | −13,600 |
| 16 B | 43,228 | 32,828 | −10,400 |
| 32 B | 43,228 | 39,228 | −4,000 |
| 64 B | 43,228 | 43,228 | 0 |
| 400 B | 43,628 | 43,628 | 0 |

The mid-state carries the result: the arms tie at 64 bytes and above, tie
again below the trigger where neither fires, and diverge by up to 36% across
the whole band between. On a four-byte-payload body the decoration is
roughly 16,400 bytes of markup standing in for 2,400 bytes of content — the
markup outweighs the thing it decorates by about seven to one, inside a
transform whose stated purpose is to make the payload smaller. The
technique's multiplier, computed for the first time on this payload, is
negative.

The corrective is the technique's own: re-site before deleting. The floor
narrows the decoration to the surface whose consumer benefits — a caller
deciding whether to spend a round trip on a four-byte string was never going
to spend it. The exact diff is four lines and is recorded in this directory's
`rust--elision-to-a-refetch-pointer` document, because the classing amendment
independently demands the same change. **That convergence is the transferable
part.** Two techniques from different sides of the subject — one asking
whether the payload should be smaller, one asking whether part of what is
being counted has a reader — arrived at one line of code. The technique
predicts they are orthogonal audits; here they are orthogonal audits with a
shared answer, which is stronger evidence for the ordering rule ("audit the
decorations before commissioning a compressor for the same payload") than
either finding alone.

## Decoration two: padding whose reader collapses it

`crates/render/src/md.rs:110-116` pads every table cell to its column width
with spaces, on every row of every table this crate renders. That is a
per-item decoration in the purest form the technique describes, and it is
attached in a shared primitive rather than at a surface.

The audit's first question is answered at the site, and the answer names two
consumers (`md.rs:17-19`): "the raw text (the MCP tool-output panel, or a
piped CLI run)". The second question is answered too — they render it as
aligned monospace. The third is where it stops. Nine lines above, the same
module concedes the rest (`md.rs:4-6`): cells containing wide glyphs "can be
a column off in the *raw* text view — Markdown renderers re-align it".

So on the tool-server surface, where the payload is Markdown read by a model
through a Markdown-rendering client, the decoration has **no nameable
consumer**: by the crate's own statement the reader collapses it, and the
crate accepts a known misalignment on the strength of that. The decoration is
correct, is produced on every row of every result, and on that surface is
read by nothing. This is the technique's silent expiry exactly — no error, no
failing test, no drift in any count — except that here the peer never even
changed method; the second surface was added underneath a decoration built
for the first.

The corrective is again re-siting, not deletion: the padding earns its place
in a piped command-line run, and the fix is to pad at that client rather than
in the builder both surfaces render through.

## The clean pass, recorded as a control

`crates/render/src/labels.rs:50-52` formats a subject as `{kind}:{id}` and
the doc comment names its consumer at the attachment site: "the same form the
API's `subject=` filter accepts, so a row can be copied straight back into a
query." Consumer named, use named, failure named. The audit is cheap
precisely because a tree that already does this answers it in one read, and
recording the pass matters — an audit that only ever finds defects is not
being run as a form.

## Three sites the technique does not reach

`crates/api/src/http.rs:88-99` (`t.truncate(MAX_BODY); t.push_str("…(truncated)")`),
`crates/agent/src/connect.rs:139-149`, and
`crates/api/src/alerts/channels.rs:131-142` all append a truncation marker to
a captured response body. They look like decorations and they are not: each
fires **once per payload**, not once per item. The technique's multiplier —
width times item count times payloads times sessions — collapses to width
times payloads, which is an ordinary bounded string that `context-budgeting`
already owns.

Saying so is the useful part. A per-payload truncation marker and a per-item
decoration are visually the same construct, and the multiplier is the only
thing that separates them. An audit that swept these three in would have
spent the form's credibility on three non-findings.

## Mode, and why not the one above

`experiment`, not `code`. The measured decoration's fix is the same four-line
diff the classing amendment produces, and one change cannot serve as two
independent code arms. The padding — the genuinely separate `code`
candidate, and a *pure* removal in the technique's sense, since nothing is
lost and no consumer must recover anything — has no gate that can see it: the
render crate's tests assert on content and on row counts, never on length
(`md.rs:283`, `:296` count lines; there is no byte assertion anywhere in the
crate), and neither blocking gate the toolchain file pins measures output
size. A code arm would have been unobservable to the project.

**The instrument that would make it observable**, and it is small: one test in
the render crate that renders a fixture table and asserts its byte length,
with and without `pad`. That is the whole apparatus — the removal is pure, so
per the technique there is nothing to design first and no recovery path to
instrument. Sizing it properly needs realistic column-width spread, which the
crate's own two-cell test tables do not have; a captured real listing would.

## What these realizations cannot do

The byte tables come from a harness reimplementing the elision transform,
asserted against the crate's live output on five positive and four negative
cases — it is not the crate. The padding finding is **structural only**: it
establishes that nothing on the tool-server surface consumes the alignment,
not what that costs, and this document does not claim a number for it. The
64-byte floor is a declared step, not a derived limit. And the audit reaches
only decorations whose consumer is a program or a stated surface; the first
decoration's consumer is the model, and whether the model *demonstrably uses*
the byte count — the technique's own counter-signal — cannot be settled by
reading code, only by withholding the field and watching, which is a
different technique's instrument and was not run here.
