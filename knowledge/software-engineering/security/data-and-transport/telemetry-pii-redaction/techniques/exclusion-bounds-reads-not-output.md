---
layer: technique
type: technique
subject: telemetry-pii-redaction
technique: exclusion-bounds-reads-not-output
status: forged
laws: [gate-sees-target, unknown-is-not-a-value]
shared_with: []
use_when: [an ignore list is being read as a promise about what ships, a generated artifact may describe an area nobody let the generator read, deciding whether an input filter satisfies a confidentiality requirement, absence assertions pass and the sensitive topic is still described]
---

# Exclusion bounds reads, not output

Every other technique in this subject rests on one assumption so basic it is
rarely stated: **the sensitive value passes through the pipeline.** It exists,
as a value, inside a payload. That is what lets a keyed drop find it, a pattern
pass rewrite it, a cap discard the subtree holding it, and an absence assertion
prove it did not leave. Take the assumption away and every one of those
controls becomes inapplicable at once — not weakened, inapplicable.

A generative emitter takes it away. When the artifact that ships is *composed*
rather than *copied* — a written summary, a generated report, a synthesized
description of a system — the sensitive fact was never a value in a field. It
was reconstructed from other material, and there is no string for the scrubber
to match because the scrubber's input never contained one.

## An exclusion list is a read control

The instinctive control for this shape is an exclusion list: name the paths,
records or areas the generator may not read, and it never sees them. This is
worth having and it does what it says. What it does not do is bound the output,
and the gap is not an implementation weakness that a more thorough
implementation closes:

> A fact withheld at the read boundary remains derivable from the material that
> stayed.

The excluded area is described by everything around it — the tests that
exercise it, the configuration that names it, the interfaces that call into it,
the change history that references it, the public-facing documentation that
explains its effects. A generator with a competent view of the remainder can
characterize the hole accurately without ever having read what fills it, and it
will, because describing the system it was pointed at is the job.

This is [gate-sees-target](../../../../_laws.md#gate-sees-target) in its purest
form: the control is applied to the *inputs*, the thing anyone actually cares
about is the *artifact*, and the gate never observes the artifact at all. A
read control that has never seen an output cannot have bounded one.

## State which of the two guarantees you are making

The practical failure is almost never that someone believed something absurd.
It is that an exclusion list's name and its documentation both invite the wrong
reading, and nobody wrote the distinction down. So write it down, in the
configuration's own reference, in the vocabulary the reader will apply:

- **"this material was not read"** — what an exclusion list delivers.
  Enforceable, testable, and a real reduction in exposure;
- **"this material is not described"** — what the reader assumes it delivers.
  A different claim, requiring a different control, at a different boundary.

Two guarantees, one of which is being made. A configuration that lets the
reader supply the second from context has made its most consequential
disclosure by omission.

## The absence assertion cannot carry this one

[redaction-invariants-as-tests](./redaction-invariants-as-tests.md) proves a
known string did not leave. That method has no analogue here, and the reason is
worth being precise about rather than treating as a gap in coverage: an
absence assertion needs a *value* to assert the absence of, and the whole
premise of a generative emitter is that the value is not known in advance —
it is whatever the generator happened to compose.

A test suite that pins a handful of known secrets and passes therefore reports
something much narrower than it appears to. It says *these specific strings did
not appear*, and a reader takes it as *nothing sensitive appeared*
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) — the
laundering point is the summary line, where an assertion over a known set is
rendered as a property of the whole output).

## The control moves to the publish boundary, and changes shape

This subject's stance still holds — there is exactly one moment of unilateral
authority, immediately before the artifact leaves — but at that moment, for a
composed artifact, there is no value to match. There is a document to judge.
The check becomes: *does this artifact describe an excluded area at all?*

That question is answered by a classifier or a reviewer, not by a pattern, and
the consequences of the change deserve stating plainly rather than being
discovered in an incident:

- it is a **sampling control with a false-negative rate**, not a proof, so it
  is reported as coverage-and-confidence, never as a clean bill;
- it is **far more expensive per artifact** than a scrub, which is what makes
  the read-side exclusion still worth having: it shrinks the population the
  expensive check must judge;
- it needs the exclusion list as its **input**, since "an excluded area" is
  only definable against the list — which makes the two controls a pair rather
  than alternatives, and makes an exclusion list with no publish-side check a
  half-built control that looks finished.

Where the requirement is genuinely *must never be described* — not *must not be
read* — and no publish-side judgement is affordable, the honest engineering
answer is that the generator must not be pointed at the system at all.
