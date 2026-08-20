---
layer: technique
type: technique
subject: inference-labelling-and-refusal
technique: enumerate-the-evidence-budget
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, say-only-what-the-record-holds, a-verdict-is-bound-to-what-it-judged]
shared_with: []
use_when: [designing what a model may read about a person, writing the scope line a reviewer sees, auditing whether a review implied more depth than it had]
---

# Enumerate the evidence budget

An evidence budget is the exact, closed list of inputs placed in front of a model
before it says anything about a person. Enumerating it means two things at once:
the list is *bounded on purpose* rather than "whatever we could fetch", and the
list is *published to the reader* in the same words the system used to build it.

The concern this addresses is implied depth. A reviewer reading a fluent paragraph
about someone's work assumes the substance was inspected. If in fact only titles,
counts, dates and short descriptions were supplied, every sentence in that
paragraph is a pattern-match over labels — and the reviewer has no way to know,
because fluency is uncorrelated with depth of evidence.

## Procedure

1. **Fix the budget as a declared quantity, not an emergent one.** Decide which
   inputs a given review is built from, and cap the volume of each: how many items,
   how many characters of each field, how far back in time, which fields of a
   record. A budget that is "everything available" has no scope statement to
   publish and no ceiling on cost, latency or leakage.
2. **Derive the ceiling and the description from one source.** The caps used to
   assemble the request and the caps stated in the scope line must come from the
   same constants. Two hand-maintained copies of a scope statement drift within one
   quarter, and the copy the reader sees is always the one that drifts.
3. **State the negative space explicitly.** The useful half of a scope statement is
   what was *not* read: the bodies of the work, the private record, anything below
   the depth limit, anything outside the time window. A budget that lists only its
   contents is read as exhaustive.
4. **Put the scope statement in both places.** In the instructions, so the model
   knows what it is entitled to conclude; and on the surface, so the reader knows
   what to price the output at. One without the other fails: instructions alone
   leave the reader over-trusting; a surface note alone leaves the model
   over-claiming.
5. **Make truncation visible.** When a cap bites — the eleventh item dropped, a
   description cut at its limit — the record says so. A silently truncated input
   produces a confident review of a partial record that reads exactly like a
   confident review of a complete one.
6. **Store the enumeration as structured facts, not as a frozen sentence.** A scope
   statement persisted as prose is frozen in one language and one product's phrasing,
   and it is re-read years later by someone in another jurisdiction. Persist the
   basis as typed items with their numbers as numbers, and compose the sentence at
   render time. Meaning does not live in a frozen label — and that applies to the
   system's statements about itself as much as to a candidate's stage name.
7. **Re-derive per review, never per template.** Two candidates rarely present the
   same evidence. The budget is a policy; the enumeration is a fact about *this*
   review and belongs with *this* verdict, per
   [a-claim-carries-its-sample-and-its-basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis).

## Decision rules

- **When the budget excludes the substance of the work, forbid quality and
  architecture claims outright.** Do not rely on the model to hedge; state the
  refusal (see the companion technique) and drop such claims structurally if they
  appear anyway.
- **When an input is optional and sometimes absent, record which state occurred.**
  "Included and empty" and "not requested" are different budgets and produce
  different reviews; storing both as absent destroys the ability to audit later.
- **When a cap changes, treat historical outputs as scoped to the old cap.** A
  verdict is bound to what it judged
  ([a-verdict-is-bound-to-what-it-judged](../../_laws.md#a-verdict-is-bound-to-what-it-judged));
  widening the budget does not retroactively widen an old review, and the record
  must be able to say which budget each review ran under.
- **When cost pressure argues for shrinking the budget, shrink the claims with
  it.** A smaller budget is legitimate; a smaller budget with unchanged output
  confidence is not.
- **When the reader is the candidate rather than the recruiter, the enumeration is
  still owed** — arguably more so, since an explanation of an adverse read is worth
  nothing if the person cannot tell what was looked at.

## Anti-patterns

- **The prose scope line.** A hand-written sentence describing what the system
  reads, maintained separately from the code that reads it. It is correct on the
  day it is written and misleading thereafter.
- **Opportunistic enrichment.** Adding one more source because it was cheap, without
  re-deriving the scope statement — the reader's mental model is now wrong in the
  most flattering direction.
- **Best-effort budgets.** "We fetch what we can within the timeout" means the
  evidence base varies with network weather, so two candidates get different
  reviews for reasons unrelated to them. Cap deterministically; on failure to fill
  the budget, say the budget was not filled rather than proceeding quietly.
- **Enumerating volume instead of kind.** "Reviewed 40 records" tells the reader
  nothing. "Reviewed titles, dates and short descriptions of up to 40 records; did
  not read their contents" tells them everything.

## When not to use it

- **When a human supplied the evidence directly and knows exactly what they
  supplied** — a reviewer who pasted one document does not need that document
  enumerated back. Enumerate anything the *system* chose to add.
- **When enumeration would itself leak something the reader should not see.** In a
  deliberately blind screen, the scope statement must describe the budget without
  restoring the redacted material through the back door; describe categories, not
  contents.
- **When the output is not a claim about a person.** Summarising a role brief or
  drafting scheduling copy carries no epistemic risk of this kind; the ceremony is
  wasted there and dilutes it where it matters.

The test of a good enumeration is behavioural: hand the scope statement and the
review to a recruiter who has never seen the system, and ask what the system
looked at. If their answer is broader than the budget, the enumeration failed —
regardless of how accurate the review itself was. Say only what the record holds
([say-only-what-the-record-holds](../../_laws.md#say-only-what-the-record-holds)),
and let the reader see the size of the record.
</content>
