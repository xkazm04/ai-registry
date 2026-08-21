---
layer: technique
type: technique
subject: executive-reporting
technique: grounded-narrative-generation
status: forged
laws: [gate-sees-target, failure-not-empty-success, one-validation-door]
shared_with: []
use_when: [a model writes the summary paragraph of a stakeholder document, deciding what a generator may see, handling a generation failure in a document that must still render]
---

# Grounded narrative generation

A paragraph of generated prose at the top of a report is the highest-leverage
and highest-risk element in the document. Leverage, because a stakeholder who
skips a table reads a sentence, and because prose can name a cross-dimension
pattern no single tile shows. Risk, because it is **the surface most likely to
leave the building unedited** — forwarded verbatim, quoted in a meeting,
pasted into a deck — with the document's authority and none of its
checkability.

The technique is three guarantees. All three are enforced in code around the
model, not requested inside the prompt, because a prompt is a preference and
these must be properties. A model asked not to invent numbers will mostly
comply; "mostly" is not a contract you can forward to a board.

## Guarantee 1 — grounded by construction

The generator receives **the document's own serialization and nothing else**.
No data-store access, no repository or artifact contents, no prior editions,
no retrieval. The closed world is the point: a generator that cannot reach
anything beyond the facts payload cannot mention anything beyond it, so the
entire class of "plausible detail the model knows about this kind of
organization in general" never reaches the page. Grounding by input
restriction is a structural property; grounding by instruction is a hope.

This also fixes what "correct" means for the review of the prose. A reviewer
does not need domain knowledge — only the payload. Any claim not traceable to
it is out, regardless of whether it happens to be true.

One subtlety that only appears once the serialization is shared: **strip
instruction-shaped content from the grounding payload.** If the document's own
text ends with a block addressed to a downstream reader-agent — "here is what
to do with this report" — that block is an instruction, not a fact about the
period, and including it hands the generator a second, competing task. The
payload is the facts region of the document and nothing else.

## Guarantee 2 — no new numbers, and violation discards

**Every numeric token in the returned prose must already appear in the facts
payload.** After generation, extract the numeric tokens from the output and
test membership against the allowed set. One token that fails, and **the
entire narrative is discarded** and replaced by the deterministic fallback.

Two construction details decide whether this check is real:

- **Build the allowed set from the data, not only from the prompt text.** The
  union of the numeric tokens in the underlying facts *object* and the tokens
  the serializer actually *printed* is the right set: some figures exist in the
  data but are not printed, and a few are display-only sums computed by the
  serializer. Sourcing from both is what makes the claim "no number that is not
  already in this report's data" literally true rather than approximately so.
- **Compare literal tokens, not parsed values.** Matching on numeric value lets
  a narrative saying "4.5" be satisfied by a "4" somewhere in the payload.
  Token equality after a declared normalization (separators, percent signs) is
  the whole test; anything looser is a threshold pretending to be a gate.

Run cheap **shape checks before the grounding gate**: reject output that is
empty, that exceeds a length past which it is no longer an executive summary
(reject rather than truncate — a truncated paragraph ends mid-claim), that
carries structural markup where the renderer expects plain prose, or that
contains angle brackets, the cheap tell for leaked internal tags. Separately,
the serializer embedding prose into a structured document must neutralize the
characters that would let a sentence break out of its cell: grounding is about
truth, escaping is about structure, and both are the assembler's job.

Discard rather than edit. Repairing a hallucinated figure requires knowing
which figure was meant, and you do not know that — the model built a sentence
around the wrong quantity, and substituting the right one frequently yields a
sentence false in a new way ("a modest increase" rewritten around a decline).
A single invented figure is evidence about the whole generation, not about one
token; partial acceptance of an output that demonstrably left the grounded
world is the exact move that makes the guarantee unverifiable.

The check runs over the *returned prose*, never over a model-reported
self-check — [gate-sees-target](../../../../_laws.md#gate-sees-target) — and at one
place all generated copy passes through
([one-validation-door](../../../../_laws.md#one-validation-door)); a second
generation site added later without the check is how this guarantee is lost,
silently.

The division of labour is worth stating: **the model may choose emphasis and
wording, never a quantity.** Which of four true facts leads, whether a change
is called "modest" or "sharp" (within the bounds the verdict stage assigned),
how two dimensions are related in one sentence — all legitimate. Arithmetic,
projection, rounding to a different precision, or "roughly a third" derived
from a printed fraction — all forbidden, the last one included: a derived
quantity is a new quantity.

This is the seam with `judgment-guardbands`. That technique family bounds a
model's judgment *over a number* — the model may produce or adjust a value,
and a declared band is the safety property. Here the model has **no** quantity
authority at all, so the safety property is a membership test rather than a
tolerance test. If your design finds itself widening a tolerance for
report prose, the design has drifted into the wrong subject.

## Guarantee 3 — degradation the caller cannot distinguish

When generation is unavailable, over budget, too slow, or rejected by the
numeric check, the slot renders **deterministic template copy assembled from
the same facts**, in the same shape, through the same return type. The caller
cannot structurally tell which path produced it — no error flag to branch on,
no empty string to guard, no partial result.

The reason is specific to this genre: **there is no error state to render in a
stakeholder document.** A banner reading "summary generation failed" is worse
than a plainer sentence — it damages confidence in numbers that are entirely
sound, and it is meaningless to the reader, who cannot act on it. The
degradation is presentation-layer, and the asymmetry in
[provenance-caveats](./provenance-caveats.md) applies: data degradation is
always disclosed, presentation degradation never is. Observability of the
fallback belongs in telemetry, where the people who can fix it are looking.

Two constraints keep this honest. The fallback must be *good* — a real
sentence over the real facts, not a placeholder — because a fallback nobody
would ship is one that gets bypassed under pressure; the strongest version
makes the deterministic path the default and generation the opt-in, so the
fallback is exercised continuously rather than only in incidents. And it must
never render empty: [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
applies to the pipeline itself, and a blank summary reads as "nothing
happened".

## Decision rules

- **When the generator would benefit from context outside the payload, put the
  context in the payload.** Never widen the generator's reach; widen the
  serialization, where the added facts are visible, reviewable, and covered by
  the numeric check.
- **When the check flags a token that is genuinely in the data but formatted
  differently, fix the normalizer, not the threshold.** Loosening the
  membership test to "close enough" reintroduces the failure it prevents.
- **When a report has several generated slots, run them through one checked
  path.** Per-slot ad-hoc generation is how the second slot ships unchecked.
- **When the same serialization can serve the copy affordance and a
  programmatic endpoint, use it.** One serialization means what the model saw,
  what the reader copied, and what a downstream tool ingested are provably the
  same document — a dispute about what the report said then has one arbiter.

## When not to use it

- **Where no prose is needed.** A well-labelled table with named denominators
  is a complete report. Generation is an addition, never a prerequisite.
- **Where the model is meant to produce a value** — an estimate, a score, a
  forecast. That is a judgment problem with a tolerance, not a narration
  problem with a membership test.
- **Where the output is machine-consumed.** A program wants fields; see
  [structured-output](../../../../llm-agent/prompt-and-context/structured-output/structured-output.md).

## Smells

- The no-new-numbers rule stated in the prompt and nowhere in the code.
- A repair step that rewrites offending numbers in generated text.
- The generator holding a database handle, a file reader, or retrieval access.
- A summary slot that can render empty, or an error banner in a document meant
  for people outside the team.
- Two generation call sites, one of which predates the validator.
