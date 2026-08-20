---
layer: technique
type: technique
subject: structured-output
technique: schema-validation-and-repair
status: forged
laws: [one-validation-door, failure-not-empty-success, one-authority-per-vocabulary]
shared_with: []
---

# Schema validation and repair

Extraction hands over a candidate structure; this technique decides whether
it becomes an artifact. The decision is made **once, at one door, with total
strictness** — and when the answer is no, the same technique owns the one
sanctioned second chance: a bounded, model-assisted repair loop whose
exhaustion is a first-class outcome.

## One door

Every candidate artifact of a given type passes through the same validator —
the interactive flow, the batch path, the retry, the import, the test
harness. The door is a function with a name, and the set of callers is
enumerable ([one-validation-door](../../_laws.md#one-validation-door)).
What the door enforces, in order of increasing depth:

1. **Shape** — required fields present, no type mismatches, unknown fields
   handled by stated policy (usually: ignored and counted; tolerant in shape,
   strict in meaning).
2. **Domain** — enums drawn from their closed vocabularies, numbers in
   range, strings within length caps, collections within count caps. The
   vocabularies are the same single-authority definitions the prompt was
   rendered from ([one-authority-per-vocabulary](../../_laws.md#one-authority-per-vocabulary)).
3. **References** — every id the artifact names resolves to a live entity of
   the right kind within the caller's scope. Reference policy is per-field
   and explicit: a dangling reference in an *advisory* field is reported and
   carried (the artifact survives, annotated); a dangling reference in an
   *operative* field — one something will act on — rejects the candidate.
   One policy for both is always wrong in one direction.
4. **Invariants** — the cross-field rules no type system expresses: totals
   that must sum, ranges whose ends must order, steps whose dependencies
   must be acyclic.

The door's output is binary and typed: an artifact, or a **list of
path-addressed errors** — each naming the field path, the violated rule, and
the observed value. Free-text error prose is useless twice over: the repair
loop cannot feed it back precisely, and observability cannot categorize it.

What the door **cannot** enforce is completeness against the request. Every
check above reads the artifact; none of them knows how many units the
producer was asked to answer, because that number lives in the call, not in
the schema. A legal, empty, fully validated artifact is the predictable
result — and it is a separate gate's job
([answer-coverage-gating](answer-coverage-gating.md)), run after this door
and before use.

## Declared, absent, invalid: three inputs, three answers

Where the artifact carries a **self-describing metadata block** — a
declaration the document makes about itself, which later readers will trust
as authored — the door's answer depends on which of three states the block
is in, and collapsing any two of them is a distinct defect:

1. **Declared and valid → the declaration wins** over whatever the caller
   passed alongside it, and the caller's stored copies are synced *from* it.
   The document is what a later reader actually reads; making the caller's
   parameters authoritative creates a record that disagrees with the file
   describing it.
2. **Declared and invalid → reject the write with the specific errors.**
   Never silently repair a broken declaration: the author never learns the
   block is broken, keeps writing it that way, and the repair becomes an
   undocumented dialect the next reader does not implement. A declaration is
   a claim, and a claim that is wrong is corrected by its author.
3. **Absent → inject one from explicitly supplied fields.** Injection is
   legitimate — a document without a declaration is not making a false
   claim — but the fields must be *demanded*, not invented. Fabricating a
   plausible description and writing it into a block that later readers
   treat as authored is manufacturing authority; if the required fields are
   not supplied, that write is rejected too.

The asymmetry is the whole rule: **repair what was never claimed, reject
what was claimed wrongly.**

## What the door never does

- **Silently coerce.** Rounding a float into an int field, truncating an
  over-long string, dropping the invalid half of a collection — every silent
  coercion is a small lie the system tells itself, discovered months later
  as data nobody can explain. Coercions either appear in the enumerated
  tolerant-repair list (deterministic, meaning-preserving, counted) or they
  are rejections. The worst-behaved coercions are the ones whose *failure*
  mode is a legal value: a missing number run through a conversion that
  yields a non-number and then through a fallback that maps non-numbers to
  zero produces a confident zero, in range, indistinguishable from a real
  answer, and it is exactly the field the model never filled. **Absent must
  be representable distinctly from every value the field may legitimately
  hold** — admit only a genuine value of the right type, and drop the
  containing unit otherwise, so a downstream completeness check sees an
  omission rather than a fabricated answer.
- **Partially accept.** "Store the valid fields, null the invalid ones"
  converts one detectable failure into N latent ones. The unit of acceptance
  is the artifact, except where the schema *explicitly* declares a
  collection's items independently acceptable — and then the accepted/
  rejected split is reported, never silent.
- **Vary by caller.** A relaxed mode for the batch path is a second door
  wearing the first one's name.

## The repair loop

The producer that emitted a near-miss is the cheapest tool for fixing it —
it holds the full context that produced the candidate. The loop:

1. Validate. On failure, render the path-addressed errors into a repair
   prompt: the original instruction, the rejected candidate, the errors,
   and the demand for a corrected complete artifact (never a diff — models
   apply diffs badly, and diff application is a second parser you now own).
2. Re-extract and re-validate **at the same door**. A repair attempt is a
   full pipeline pass, not a privileged side entrance.
3. Stop at the budget. One or two attempts; the budget is stated in the
   flow's contract, and each attempt's cost (latency, tokens) is attributed
   to the flow's observability.

Three disciplines keep the loop honest:

- **Repair fixes the artifact, not the standard.** If repair attempts
  routinely succeed by the model *removing* the offending content rather
  than correcting it, the loop is optimizing for the validator instead of
  the user — watch the artifact-size delta across repair turns.
- **Deterministic pre-repair comes first.** Anything the enumerated tolerant
  fixes can solve must never spend a model turn; the loop is for semantic
  near-misses only.
- **Feedback must be actionable by the model.** "Field plan.steps[3].kind:
  value 'analyze' not in allowed set [a, b, c]" repairs; "validation failed"
  re-rolls the dice.

## Give-up semantics

Budget exhausted, the loop produces the **extraction-failed outcome** — not
an exception, not a null, not an empty artifact, and above all **not a
default-constructed one**
([failure-not-empty-success](../../_laws.md#failure-not-empty-success)).
Filling a failed parse with a default value manufactures a fully *legal*
artifact out of a failure — it validates, so nothing downstream can ever
flag it, and the system proceeds to act on a value the model never said.
Where an artifact type derives a default for other reasons, the give-up
path must be structurally unable to reach it. The
outcome carries: the final candidate, the final error list, the attempt
count, and the strategy trace from extraction. Downstream renders it as its
own state with its own affordances (retry, edit manually, report) — distinct
from "the model proposed nothing", which is a *validated empty*, and
distinct from "the run itself failed", which never reached this technique.

## Schema evolution

The schema will grow, and every growth event is a coordinated edit to the
prompt rendering, the validator, and the consumers — which is why the fewer
authoritative definitions exist, the safer the growth. Two rules from
production scars: **new fields arrive optional** (the producer's outputs and
the validator's demands cannot be upgraded atomically, so the window where
old-shape outputs meet new-shape validation must be survivable), and **a
schema change resets the observability baseline** — the failure-rate step
change it causes is signal, not noise, and comparing across it without
marking the boundary manufactures phantom drift.
