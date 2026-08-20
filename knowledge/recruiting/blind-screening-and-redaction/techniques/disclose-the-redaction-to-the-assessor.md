---
layer: technique
type: technique
subject: blind-screening-and-redaction
technique: disclose-the-redaction-to-the-assessor
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, inference-must-look-like-inference, say-only-what-the-record-holds]
shared_with: []
use_when: [handing a masked assessment to a recruiter, writing a blind-mode prompt clause, deciding how a masked verdict is rendered]
---

# Disclose the redaction to the assessor

A masked assessment that does not say it was masked is read at full fidelity —
including its silences. That is the whole harm, and it is quiet. "No leadership
evidence found" means one thing against a complete document and something else
entirely against one whose organisational context was removed before the
assessment ran. Without disclosure the reader over-trusts a document with holes
in it, and the redaction has silently converted an *unknown* into an apparent
*finding*.

The assessor here is both parties who consume the masked document: the automated
reader that produces the assessment, and the human who acts on it. Each needs a
different disclosure, and both are required.

## To the automated reader: an instruction, not a label

A capable reader handed a masked document will reconstruct. It will guess a
gender from a hobby or a grammatical agreement, a nationality from a language, a
generation from a technology, an institution from a phrasing. Reconstruction
defeats masking completely and does so invisibly, because the guess renders in
the same voice as a reading.

The blind-mode instruction therefore states three things explicitly:

1. **The document has been redacted** — the reader is not looking at an
   omission-free original, and gaps are not the candidate's.
2. **Do not infer, guess, or reconstruct anything that was redacted** — not the
   name, not the employers, not any protected attribute, and not "for
   context".
3. **Leave identity-bearing output fields empty.** Not a placeholder, not a
   best guess, not "likely". Empty.

The third point is the enforceable one. An instruction not to infer is a request;
a field that must come back empty is a contract you can check. Where a blind run
returns a populated identity field, the run is void — the mask held on the page
and failed at the output.

[Inference must look like
inference](../../_laws.md#inference-must-look-like-inference) is the underlying
rule, and the blind case is its strictest form: here the correct rendering of an
inference about identity is *no rendering at all*. And
[say only what the record holds](../../_laws.md#say-only-what-the-record-holds)
binds the wording of every masked finding — where a category was removed, the
assessment reports unknown, never absent, because the record holds *masked*.

## To the human reader: the manifest travels with the verdict

The recruiter-facing disclosure is specific, not a badge. It carries:

- **That the assessment was produced blind**, stated where the verdict is read
  rather than in a settings page.
- **Which categories were masked**, from the inventory's vocabulary — names,
  contact details, links, gendered terms, age markers, and whatever tier-3
  categories this role's policy included.
- **How much was removed** — counts per category, and the share of the document
  replaced. A recruiter reading a verdict on a document that lost a fifth of its
  text is entitled to know that before acting.
- **Which of the three states this run reached** — masked, partially masked, or
  refused. The middle state is the one worth wording carefully, because it is
  the only place a system is tempted to lie by rounding up. A run that masked
  contact details and gendered terms but never located a personal name has *not*
  produced a blind assessment, and the note must say so in those terms — the
  identity may have reached the assessor; verify manually — rather than reciting
  the categories it did manage and letting the reader infer success from the
  list. The distinction also protects the reader's other reading: a missing name
  on the result should not be mistaken for an anonymous candidate when it is
  really a redaction miss.
- **Which findings are therefore bounded.** Where the mask removed a whole
  category, the areas of the assessment that depended on it are named as
  not-assessable rather than left to read as negative.

This is [a claim carries its sample and its
basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis) applied to a
verdict: the basis of a blind assessment is a *reduced* document, and a verdict
that does not state what it was computed over is decoration. The manifest is the
sample statement.

## Decision rules

- **When the manifest is unavailable, do not render the verdict as blind.** An
  unlabelled blind assessment and an unlabelled unblinded one are
  indistinguishable to a reader, which destroys the only claim the practice
  reliably supports.
- **When the assessment reports an absence in a masked category, rewrite it as
  unknown before it reaches a human.** This is a rendering rule, enforced on the
  output, not a hope about the model's phrasing.
- **When the removed share exceeds the threshold set from your own corpus,
  surface a warning alongside the verdict, not only a count.** Readers do not
  compute proportions from counts.
- **When a reader asks "what was behind the redaction?", the answer is no.**
  Disclosure is about the *shape* of what was removed, never its content. A
  disclosure that lets the reader reconstruct is an unblinding with extra steps.
- **When a blind verdict is exported, forwarded, or summarised, the disclosure
  travels with it.** A verdict separated from its manifest reverts to being read
  at full fidelity the moment it lands in another surface.

## When not to use this

Do not attach a disclosure to an assessment that was not actually produced
blind — a decorative badge is worse than no badge, because it is a false
procedural claim and the whole value of blind screening is that its procedural
claim is true. And do not let disclosure substitute for the preservation
discipline: telling the reader that a third of the document is gone does not
make an assessment of the remaining two-thirds useful.
