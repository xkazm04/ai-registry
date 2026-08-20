---
layer: technique
type: technique
subject: structured-output
technique: answer-coverage-gating
status: forged
laws: [failure-not-empty-success, gate-sees-target, count-carries-predicate]
shared_with: []
use_when: [the request enumerates units the model must each answer, a validated artifact may still be half-answered, deciding whether a thin response is a failure]
---

# Answer-coverage gating

A response that parses is not a response that answered. The validation door
judges the **legality of what is present**; it has no opinion about what is
*absent*, because absence is only detectable against the request, and the
request is not in the schema. This technique is the gate that closes that
hole: after validation, before use, compare **units answered against units
asked for**, and treat a response below the floor as a producer failure —
the same failure the flow already knows how to handle when the producer
throws.

The hole is specific and it is structural. When a request enumerates N items
and asks for one answer per item, the artifact's schema can express "the
collection is present" and "each entry is well formed"; it cannot express
"one entry per item asked for", because N varies per call and lives in the
caller. So an artifact naming zero of the N — an empty collection, an object
of the right shape with nothing in it, entries whose identifiers were all
unrecognized and dropped — passes every check written down and arrives at
the consumer as a completed artifact. This is
[gate-sees-target](../../_laws.md#gate-sees-target) exactly: the parse check
is a proxy, and it passes precisely when the proxy diverges from the thing
anyone cared about.

## The procedure

1. **Carry the denominator with the call.** The gate takes two inputs: the
   validated artifact and the count (or identity set) of units the producer
   was asked to answer. If that number is not available at the call site,
   the request was built somewhere the gate cannot see, and *that* is the
   defect to fix first.
2. **Count answered units after per-unit validation and de-duplication.** An
   answered unit is one whose identity was recognized, whose required
   payload was genuinely present, and which was not already counted. Counting
   raw entries lets a producer satisfy the gate with the same unit repeated,
   or with well-formed shells that carry no answer.
3. **Compare against a declared minimum coverage fraction** — a named
   constant with its reason written next to it, not a literal inside the
   comparison.
4. **Below the floor, fail the response as a whole.** It takes the producer-
   failure path: the fallback fires, the caveat is attached, the counter
   increments. Not a partial acceptance, not a warning logged beside a
   delivered artifact.

The gate is about *how much of the request was answered*, never about
whether the answers are good ones. How far a model's numbers may move what
something else computed belongs to
[judgment-guardbands](../../judgment-guardbands/judgment-guardbands.md);
this gate runs before that question is worth asking, because a band applied
to units that were never answered bands nothing.

## Decision rules

- **When the denominator is zero, coverage is satisfied.** An empty answer to
  an empty request is correct, and it is the *only* legitimate validated
  empty in an enumerated flow. This is the sharp edge: "the model had nothing
  to propose" is a real outcome for an open request and a lie for a request
  that named nine things.
- **Set the floor where a partial answer stops being able to change the
  conclusion.** If the consumer blends the answered units into a summary, ask
  how few units can still move that summary honestly; below that share the
  artifact is decoration. Where the consumer only displays units
  independently, the floor can sit lower — but it is never zero, because
  zero is the case the gate was built for.
- **Renormalization makes partial answers more dangerous, not less.** A
  consumer that averages, weights, or scales over "what arrived" converts a
  truncated answer into a confident answer about a different question, and
  the result is indistinguishable from a complete answer with a different
  shape. A half-answered set of scores looks exactly like a subject that is
  genuinely weak in the unanswered areas — same numbers, opposite meaning.
- **Never count a unit that was admitted by a coercion.** If a missing value
  was filled with a default to keep the entry parseable, that entry is a
  shell; counting it toward coverage lets the coercion defeat the gate that
  exists to catch it. Skip the unit instead, so coverage stays honest — the
  coercion and the gate must not be able to launder each other.
- **The fallback must not wear the failed producer's name.** When coverage
  fails and a deterministic or secondary path supplies the result, the output
  is labelled as that path's, with the caveat that the primary was unusable.
  Rendering a fallback under the failed producer's identity is the most
  expensive form of this failure: the operator sees a poor answer attributed
  to a producer that never produced it, and tunes the wrong thing for weeks.
- **Publish the denominator in the artifact.** An envelope that states how
  many units the document claims to cover lets a consumer who did not issue
  the request run the same check. Without it, coverage is only knowable at
  the one call site that still remembers what was asked.

## When not to use it

Open-ended requests have no denominator. "Propose improvements", "summarize
the risks", "suggest a next step" have no enumerable unit set, and inventing
one — demanding at least three suggestions — measures verbosity, not
coverage, and trains the producer to pad. There the honest gate is a
**minimum-viability check on the artifact itself** (the required narrative
field is non-empty, the proposal names a target), and the outcome set does
the rest: a validated empty from an open request is a legitimate empty.

Do not use coverage as an adjustable salvage knob either. Lowering the floor
until the failures stop is removing the instrument that reports the problem;
the floor moves only when the *consumer's* tolerance for partial answers
genuinely changes, and that change is argued in the flow's contract, not in
a hotfix.

## What to count

Coverage is a ratio and therefore carries its predicate
([count-carries-predicate](../../_laws.md#count-carries-predicate)): answered
over asked, per flow, tagged with the producer and prompt version. Two
distributions are worth keeping — the coverage ratio itself, and the
below-floor rate — because a fleet drifting from full coverage to
three-quarters coverage is a real degradation that never crosses the floor
and never fails a single call. Pair the ratio with the output-budget level
([output-budget-signal](output-budget-signal.md)): below-floor coverage with
a near-ceiling response is truncation, and the fix is to split the call;
below-floor coverage with a small response is a producer that refused,
misunderstood, or ignored the schema, and the fix is in the prompt. Same
symptom, opposite remedies, and only the second number tells them apart.
