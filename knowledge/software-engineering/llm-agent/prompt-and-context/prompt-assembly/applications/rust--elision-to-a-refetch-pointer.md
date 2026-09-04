---
layer: application
type: application
subject: prompt-assembly
technique: elision-to-a-refetch-pointer
stack: rust
verified_on: 2026-09-04
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

## 2026-09-04: the classing amendment, tested against this same seam

The technique later gained a section arguing that a pure size rule reaches
first for the material most likely to be re-read, and that the corrective is
to class by what produced the output and let size act **only inside a
class**. All citations below were re-resolved on 2026-09-04 against the same
tree at `rust@1.96.1` (`rust-toolchain.toml`); the paired test above was
re-run and still prints `arm A 206644 -> arm B 43628`.

Two of the amendment's claims do not hold here, and the third holds hard.

**The lossless-first rule has no purchase — `not-better`.** The amendment
says lossless re-presentation should be exhausted before either keeping or
eliding. This tree looks like it skips that step: compact serialization is
applied only together with elision, never on its own
(`crates/mcp/src/resources.rs:104-116`). It is not skipping it. The trigger
already tests the **compact** length (`:106`), so "compact alone fits" and
"the trigger does not fire" are the same predicate, and there is no body for
which the shipped policy is lossy though a lossless re-serialization would
have fit. Swept over 1–200 spans at 400 bytes per field, the set of such
bodies is empty. The rule is structurally already satisfied and offers this
seam nothing.

**The stage test reclassifies the seam.** The amendment's own paragraph on
lanes puts elision on *history* — material from prior turns, already read
once — and a classed compressor at *ingest*, on a payload the consumer has
never seen. This transform runs at ingest: it caps a resource read the
consumer just asked for. So the technique's decorator properties, including
"the current unit's own messages never pass through it", do not bind it. The
brief that sent this measurement assumed a history-lane seam; the
amendment's own text says otherwise, and the amendment is right.

**The classing claim holds, in a form the amendment does not state —
`better`.** The transform has a class (payload fields under an event) and a
size rule, but the size rule is on the **whole body** and there is none
*inside* the class: once the trigger fires, every field in the class is
elided regardless of its own size. The marker is 43–46 bytes encoded, so
there is a crossover.

| payload per field | encoded item | marker | net per field |
| --- | --- | --- | --- |
| 4 B | 6 | 43 | **+37** |
| 16 B | 18 | 44 | **+26** |
| 32 B | 34 | 44 | **+10** |
| 40 B | 42 | 44 | **+2** |
| 48 B | 50 | 44 | −6 |
| 400 B | 402 | 45 | −357 |

Below 48 bytes the elision **grows** the field it was invoked to shrink, and
still reports the content gone. Paired arms on the crate's own 200-span
fixture — arm A the shipped pure-body-size trigger, arm B the same plus a
64-byte per-field floor, a declared step above the 43-byte marker:

| payload per field | arm A | arm B | delta | arm A vs the un-elided compact body |
| --- | --- | --- | --- | --- |
| 2 B | 42,828 | 27,228 | −15,600 | 15,600 B **bigger** |
| 4 B | 42,828 | 28,028 | −14,800 | 14,800 B **bigger** |
| 8 B | 43,228 | 29,628 | −13,600 | 13,600 B bigger |
| 16 B | 43,228 | 32,828 | −10,400 | 10,400 B bigger |
| 32 B | 43,228 | 39,228 | −4,000 | 4,000 B bigger |
| 64 B | 43,228 | 43,228 | 0 | 8,800 B smaller |
| 400 B | 43,628 | 43,628 | 0 | 142,800 B smaller |

The mid-state is the whole result. The arms are identical at 64 bytes and
above, and identical below the trigger where neither fires — they tie at
both endpoints and diverge by up to 36% across the entire middle. A test
reporting only the endpoints would have called this a wash. Arm B strictly
dominates in the band and loses nothing: no field it leaves whole was ever
recoverable-but-removed, because it was never removed.

Neither the crate's tests nor its two blocking gates catch arm A's
inversion, because nothing compares the elided output against the
un-elided compact form. The existing fixture sits at 400 bytes per field,
which is 8x past the crossover.

**The exact diff**, four lines inside `elide_payloads` (`:122-148`):

```rust
const MIN_ELIDABLE: usize = 64; // > the ~44-byte marker, with headroom
...
let bytes = serde_json::to_string(v).map(|s| s.len()).unwrap_or(0);
if bytes < MIN_ELIDABLE { continue; }   // <- added
*v = Value::String(format!("<elided: {bytes} bytes — fetch via ..."));
```

### Shipped, and the model's numbers were low

The arms above were measured on a byte-faithful reimplementation calibrated
against the crate's own test at a single point. Before shipping, both arms
were re-run **in the implementation itself**, as a new test pairing the
rendered output against the un-elided *compact* form — the honest control,
because this branch already serializes compact and pretty-printing arm A
would credit elision with an indentation saving it never made.

The real implementation is worse than the model predicted. On a 400-span
trace of 4-byte payloads: un-elided compact **56,228** bytes, shipped
renderer **85,828** — elision grows the body by **29,600 bytes, +52.6%**,
while reporting the content gone and costing the caller a re-fetch to
discover it was four bytes. With the floor: **56,228 -> 56,228, +0**.

The control matters as much as the result: the case the elision was built
for is unchanged at **206,644 -> 43,628** (21.1% of arm A), still past the
4x floor its own test asserts. 59 crate tests pass; `clippy -D warnings` and
`fmt --check` are clean. Landed as `7c746eb`, direct to the project's default
branch with a pathspec, not pushed.

Two things this sequence demonstrates about the method rather than the code.
The defect was **invisible at both endpoints** — the arms are byte-identical
at >=64 bytes per field and byte-identical below the trigger, and diverge only
across the middle, which is the case the mid-state rule exists to catch. And
a reimplementation calibrated at one point is a hypothesis, not a
measurement: it got the direction right and the magnitude wrong, so the
paired run in the real language was what earned the commit.

## A second, smaller defect the same sweep surfaced

The budget is decided on one serialization and paid in another. `:106`
compares `compact.len()` to the threshold and `:107` returns
`to_string_pretty` — so a body that passes the check is emitted in a longer
form than the check measured:

| spans | compact (decides) | pretty (emitted) | over the 24,576-byte budget as emitted |
| --- | --- | --- | --- |
| 23 | 21,441 | 23,780 | no |
| 24 | 22,372 | 24,812 | by 236 B (1.0%) |
| 25 | 23,303 | 25,844 | by 1,268 B (5.2%) |
| 26 | 24,234 | 26,876 | by 2,300 B (9.4%) |

The overshoot is bounded here only because indentation growth and the
trigger cross close together; nothing enforces that, and a shape with deeper
nesting would widen it. The gate reads a proxy it does not emit.

## What this second realization cannot do

Both tables come from a harness reimplementing the transform, asserted
against the crate's live output on five positive and four negative cases —
it is not the crate, and a serializer change would invalidate it silently.
The 64-byte floor is a declared step, not a derived limit: nothing here
measures whether 48, 64 or 128 is right, only that zero is wrong. And the
fixture is synthetic in its *distribution* — it is the crate's own fixture,
but real traces carrying many sub-48-byte payloads are a shape this
measurement asserts is possible, not one it has observed in production.
