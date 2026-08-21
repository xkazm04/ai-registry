---
layer: technique
type: technique
subject: public-work-evidence-bounding
technique: declare-the-evidence-budget-in-the-artifact
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, a-verdict-is-bound-to-what-it-judged, say-only-what-the-record-holds]
shared_with: []
use_when: [building an automated read of a candidate's public output, writing what a recruiter sees above a public-work finding, auditing whether a review implied it inspected the work]
---

# Declare the evidence budget in the artifact

A read of someone's public work is built from a selection of a selection: some
of their items, some fields of each, some depth into each field. The budget is
that triple, fixed deliberately. Declaring it *in the artifact* means the
stored finding — the thing a recruiter reads, a candidate may later be shown,
and an auditor will open in two years — carries the bound alongside the
conclusion, in the same words the system used to build the request.

The general craft of enumerating an evidence budget and rendering honest
absence belongs to the inference-labelling subject and is not restated here.
What is specific to public work is that the budget has a **selection**
dimension nobody else has, that its most important element is a *negative* one,
and that the artifact outlives every place the scope was otherwise written
down.

## The four dimensions of a public-work budget

1. **Which items.** A person may have four public projects or four hundred.
   Something chose the ones that were read — most recent, most starred, most
   forked, alphabetical, whatever the source returned first. That choice is
   part of the evidence base and belongs in the declaration: *the ten most
   recently updated of forty-one public projects*, not *their public work*.
2. **Which fields.** Names, descriptions, introductory text, declared
   language, topic labels, dates, activity counts, the subject lines of
   changes, the names of top-level files. Each is cheap and each is a label.
3. **How deep.** Introductory text truncated at a character cap; a fixed
   number of recent changes; top-level names only, never a recursive walk.
4. **What was not read at all.** The bodies of the work. Private output.
   Anything outside the window. This is the load-bearing element, because a
   declaration that lists only what it contains is read as exhaustive.

## Procedure

1. **Fix the caps as constants and derive the declaration from them.** The
   numbers that assemble the request and the numbers in the reader-facing
   sentence must be the same values, not two hand-maintained copies. A prose
   scope line is correct on the day it is written and misleading afterwards —
   and it is always the reader's copy that drifts.
2. **Put the bound in three places, not one.** In the instructions to any
   model, so it knows what it may conclude; in the artifact, so the reader can
   price the conclusion; and adjacent to the serialized evidence itself, so
   the label sits against the data rather than only in a preamble.
3. **Declare the selection rule, not just the count.** "Ten projects" invites
   the reader to assume ten of ten. "Ten of forty-one, most recently updated"
   tells them what the sample is and lets them ask for a different one.
4. **Interrogate the ordering for bias before shipping it.** A recency
   ordering is the natural default and it is not neutral: it truncates the
   *oldest* work first, which is disproportionately the flagship, the most
   recognised, and the founding project — so the more prolific and the longer
   the career, the more of the best evidence the cap silently drops. Whatever
   the ordering, ask which candidates it systematically under-samples, and
   when the cap bites, say the portfolio was truncated rather than presenting
   the slice as the whole.
5. **Store the declaration as structured facts with their numbers as
   numbers.** A basis frozen as an English sentence inside the producing
   system is unreadable to the next reader in another language and
   indefensible in the next jurisdiction; compose the sentence at render time.
   Artifacts stored before the declaration was structured keep their frozen
   sentence and are rendered verbatim — a historical basis is re-read, never
   reinterpreted.
6. **Make truncation visible where it bit.** The eleventh project dropped, an
   introduction cut at its cap, a project with no readable text at all — each
   is a fact about this review. A silently truncated input yields a confident
   review of a partial record that looks exactly like a confident review of a
   complete one.
7. **Bound the question as well as the input.** If the read answers "which of
   these ten required capabilities are evidenced", then its negative answer is
   scoped to those ten and the artifact must say so. See
   [absent-signal-versus-unavailable-source](./absent-signal-versus-unavailable-source.md).

## Decision rules

- **When the budget excludes the bodies of the work, forbid quality,
  architecture and correctness claims structurally.** Do not rely on the model
  to hedge, and drop such claims from the output if they appear anyway. The
  budget is the authority on what may be said
  ([a-verdict-is-bound-to-what-it-judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged)).
- **When the caps change, treat existing artifacts as scoped to the old
  caps.** Widening the budget does not retroactively widen a past review, and
  the record must be able to say which budget each review ran under.
- **When cost or latency pressure argues for a smaller budget, shrink the
  claims with it.** A smaller budget is legitimate. A smaller budget with
  unchanged output confidence is a lie that got cheaper.
- **When a source offers a richer tier for a fee or a token, do not let
  availability set the scope silently.** Two candidates read under different
  budgets, for reasons of quota rather than of them, are not comparable — and
  the artifact must at minimum record which budget each got
  ([a-claim-carries-its-sample-and-its-basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)).
- **When the candidate is the reader, the declaration is owed more, not
  less.** An explanation of an adverse read is worthless if the person cannot
  tell what was looked at, and a candidate is the one reader who can correct a
  wrong selection — "you read my three forks and not the project I linked".

## Anti-patterns

- **The exhaustive-sounding summary.** "Reviewed their public work" — no
  count, no selection, no depth. Every reader supplies their own generous
  interpretation.
- **Volume instead of kind.** "Analysed 40 records" tells a reader nothing.
  "Read titles, dates and descriptions of 40 records; did not open their
  contents" tells them everything.
- **Best-effort budgets.** "As much as we could fetch within the timeout"
  makes the evidence base a function of network weather, so identical
  candidates get different reads for reasons unrelated to them.
- **Opportunistic enrichment.** One more source added because it was cheap,
  without re-deriving the declaration — the reader's mental model is now wrong
  in the most flattering direction.
- **The declaration in the tooltip.** A bound that only appears on hover, in a
  collapsed panel, or in the export footnote is not in the artifact; it is
  hidden from exactly the reader who is skimming.

## When not to use it

- **When a human chose and supplied the material themselves.** A hiring
  manager who opened three projects and wrote up what they saw does not need
  their own reading enumerated back to them. Declare what the *system* chose.
- **When the output is not a claim about a person** — summarising a role
  brief, drafting scheduling copy. The ceremony is wasted there and dilutes it
  where it matters.
- **When declaring the selection would restore material a blind screen
  deliberately removed.** Describe the categories read, not their contents.

The behavioural test: hand the artifact to a recruiter who has never seen the
system and ask what it looked at. If their answer is broader than the budget,
the declaration failed — however accurate the review itself happened to be
([say-only-what-the-record-holds](../../../_laws.md#say-only-what-the-record-holds)).
