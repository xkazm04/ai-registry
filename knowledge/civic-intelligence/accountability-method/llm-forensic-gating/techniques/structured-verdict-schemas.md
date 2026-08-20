---
layer: technique
type: technique
subject: llm-forensic-gating
technique: structured-verdict-schemas
status: forged
laws: [deterministic-code-owns-numbers, one-definition-one-import]
shared_with: []
use_when:
  - defining what an analyst model may return for one unit of work
  - a model's outputs drift in shape or invent fields across a batch
---

# Structured verdict schemas

A verdict schema is the contract between an analyst model and the pipeline: one
structured object per unit of analysis, with a closed key set, enumerated
categories, bounded numeric fields, and required non-empty prose slots. Its
purpose is not tidiness. It converts the model's dominant failure mode —
drifting into a shape the pipeline half-understands — from a subtle downstream
corruption into an immediate, mechanical rejection. In an evidentiary domain
the schema is also where authority is drawn: interpretation gets fields,
assertion gets fields, and nothing else exists.

## Procedure

1. **Design the object around the claim taxonomy, not the prose flow.** Give
   each epistemically distinct thing its own field: the faithful summary of
   what the source *says* about itself, the independently researched context,
   the hypothesized effects (each an object pairing the effect with who
   benefits and its evidence), the conflict assessment, a severity from a
   closed enum, a bounded integer confidence, and a citations array. When
   interpretation and fact share a field, no later gate can tell them apart.
2. **Close every dimension that can be closed.** `additionalProperties: false`
   at every level is the load-bearing constraint — the documented failure mode
   of an unsupervised analytical sweep is invented dimensions, and an open
   object accepts them silently. Enumerate categories; bound scores with
   integer minimum/maximum; require minimum length on prose fields so an
   empty-string dodge fails shape.
3. **Publish the schema in the machine-enforceable form and the readable form
   from one definition.** The enum constants, the JSON-schema object built from
   them, and the hand-written validator must all derive from the same module —
   the constants are declared once and spread into the schema, never restated.
   Two copies of an enum will drift, and a drifted enum means the validator
   and the model disagree about what is legal.
4. **Enforce twice: at the tool layer and at the gate.** Where the model
   runtime supports structured output, pass the schema verbatim so the model
   physically cannot return a drifted shape. Then run the deterministic
   validator anyway, on every returned object — the plain-agent path has no
   schema parameter, extraction from a fenced block can pick up garbage, and a
   validator you always run is a validator you can also re-run later over
   stored artifacts.
5. **Reject whole, re-run, never patch.** A shape failure discards the
   verdict. Filling a missing field, coercing a type, or dropping an invented
   key turns a detected model error into a silent pipeline authorship — the
   store would hold an object nobody produced.

## Decision rules

- **When a score, count or rank appears in the schema, decide who computes
  it.** A model may echo an identifier code gave it and may score its own
  bounded confidence; it never authors a figure the product will display as a
  measurement. If a field looks like a metric, it belongs to deterministic
  code and the schema should not ask the model for it.
- **When the model keeps failing one field, fix the field before the prompt.**
  Chronic drift on a field usually means the field conflates two things or
  asks for something the model cannot know; split it or move it to code.
- **When comparability across corpora matters, freeze the criteria set.**
  Quality dimensions reused across products must be identical by import, so
  scores stay comparable — a per-corpus tweak to a criterion silently breaks
  every cross-corpus comparison that cites it.
- **Version the contract.** Stamp a schema version constant; archived verdicts
  are re-validated against the contract they were written under, with any
  since-tightened options explicitly relaxed — never silently passed through
  the current gate as if they had cleared it.

## When not to use it

Do not schema-bind the model's *research process* — which sources it consults,
in what order, how it reasons. That is where the model earns its keep, and
over-constraining it produces compliant, shallow work. The schema binds what
comes out, not how it was found. And do not mistake a passing schema for a
passing verdict: shape is the first gate only. An object can be perfectly
formed and still cite a fabricated reference, assert beyond its evidence, or
carry unpublishable register — which is why the other gates in this subject
run after this one, never instead of it.
