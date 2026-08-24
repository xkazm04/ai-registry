---
layer: technique
type: technique
subject: llm-forensic-gating
technique: whole-artifact-invariants
status: forged
laws: [deterministic-code-owns-numbers, disclose-never-repair, incident-anchored-doctrine]
shared_with: []
use_when:
  - a pass rewrites prose that will publish, and the source text still exists
  - every per-claim gate is green and the artifact is still wrong
  - auditing a batch of machine-edited text against the source it was edited from
---

# Whole-artifact invariants

Every other gate in this subject asks a question about a claim: does this
citation resolve, is this identifier real, is this reference shaped like a
fabrication, is this sentence in the reader's register. A whole-artifact
invariant asks a question about the *artifact*: given the text that went in
and the text that came out, did the transformation preserve what a
transformation must preserve. It has no opinion about any individual claim.
It is the only check that can catch a defect nobody's claim-level rule was
written for — and it exists because in measured practice that is the class
that ships.

The incident is worth carrying in full, because the abstract version is
unpersuasive. A four-round audit cycle over one batch found real falsehoods
in every round: a municipally-owned company presented as a private tie, a
stated amount rewritten from "a flat allowance of 15 000 CZK" into "an
earlier processing of 000 CZK" — the sweep had eaten the 15 while
substituting a phrase — two fabricated quotations of a bill, and sponsor
counts that did not sum. Through all four rounds **every code gate was
green**: schema, language, jargon regexes, citation membership. The gates
checked per-string form; the defects were whole-artifact truth. Nothing was
wrong with those gates. They were simply all of one kind.

## The four invariants

Each is cheap, deterministic, and stated as a relation between the source
artifact and the produced one.

1. **Digit multiset preservation.** A rewrite may not alter the multiset of
   digit sequences in the text. Every intended change is an explicit entry in
   an allowlist, and the allowlist distinguishes a *drop* (an internal
   identifier the rewrite legitimately removes) from a *transform* (an
   internal identifier legitimately replaced by its public equivalent, whose
   replacement digits are then *expected* on the output side). This is
   [deterministic-code-owns-numbers](../../../_laws.md#deterministic-code-owns-numbers)
   applied to editing rather than to authorship: the numbers in an artifact
   answer to the store, so a text pass may not be the thing that changes one.
2. **Relative syntax balance.** A rewrite may not *worsen* the artifact's
   structural balance: parenthesis skew must not increase, and the count of
   sentence breaks landing before a lowercase continuation must not increase.
   The comparison is between before and after, never against an absolute
   ideal.
3. **Arithmetic closure.** Any count stated in the prose — "of the twelve,
   three … the remaining nine" — must sum, and must sum against the payload
   the artifact was generated from rather than against itself. Self-consistent
   invented arithmetic is the easy half; the check that matters is closure
   against the source.
4. **Quotation locatability.** Any span the artifact presents as a quotation
   must be findable verbatim in the cached source text, after Unicode
   normalisation and whitespace collapsing and nothing else. A quotation that
   cannot be located is a fabricated quotation, whatever else is true about
   the sentence around it.

## Decision rules

- **The syntax invariant is relative or it is disabled within a week.** Real
  domain prose in a legal or administrative register is full of legitimately
  unmatched closers — enumerated sub-points cited as "point m)" carry a
  closing bracket with no opener. An absolute balance assertion fails on
  correct input constantly, and a gate that fails on correct input is a gate
  somebody turns off. Assert only that the transformation did not make it
  worse.
- **An allowlist entry is a transform, not a waiver.** "This digit may
  disappear" is a hole; "this digit disappears *because* it is replaced by
  that one, which must therefore appear" is still an invariant. Write the
  allowlist so it constrains both sides. An entry that only subtracts from the
  expected set is the beginning of the gate's decay.
- **Compare multisets, never sets.** A set comparison passes when a rewrite
  deletes one of two identical figures, which is exactly the eaten-amount
  defect the invariant exists for. The distinction has been re-learned in the
  field after a first implementation shipped with a set.
- **Assert inside the pass, before it emits.** These are the rewriting script's
  own preconditions on its own output, not a reviewer's checklist. A pass that
  writes its result and leaves verification to a later audit has already put
  the artifact somewhere a human might read it, and the audit is the thing
  that keeps coming back green.
- **A violation aborts the pass; it never trims the output to fit.** Repairing
  the artifact so the invariant holds is authorship, and authorship by the
  gate is the failure mode this whole subject is built against
  ([disclose-never-repair](../../../_laws.md#disclose-never-repair)). Refuse
  the row, name the invariant in the error, and fix the rule that produced it.
- **Match letters with Unicode classes.** Word-boundary and word-character
  shortcuts drawn from ASCII stop at the first accented letter and make the
  rule silently inert in a language that has them — no error, no match, a
  green gate over unchecked text. This has been re-learned per rule and is
  worth encoding once in the shared helpers.
- **Anchor each invariant to the defect it caught.** State the incident beside
  the assertion
  ([incident-anchored-doctrine](../../../_laws.md#incident-anchored-doctrine));
  an invariant that reads as fastidiousness is relitigated by the next author
  in a hurry, and an invariant that reads as "this is what the eaten amount
  looked like" is not.

## When not to use it

These invariants need a *before*. They apply to transformations — a sweep, a
translation post-edit, a redaction pass, a summarisation with a cited source —
and they say nothing at all about freshly authored prose, where there is no
prior artifact to preserve. Do not stretch them into general truth checks:
digit preservation says the figure was not damaged in transit, not that the
figure was right when it entered; arithmetic closure catches a count that
contradicts its payload, not a payload that is wrong. And they do not replace
a single per-claim gate. The two classes fail in disjoint ways, which is
precisely why the artifact stayed false while seven claim-level gates passed;
running the invariants and retiring a citation check would reproduce the same
incident from the other side.
