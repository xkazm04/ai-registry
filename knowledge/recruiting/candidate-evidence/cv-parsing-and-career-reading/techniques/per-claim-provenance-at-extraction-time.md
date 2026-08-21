---
layer: technique
type: technique
subject: cv-parsing-and-career-reading
technique: per-claim-provenance-at-extraction-time
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, absence-of-evidence-is-not-evidence, inference-must-look-like-inference]
shared_with: []
use_when: [designing the extracted claim record, adding a new evidence kind, reviewing why an unevidenced skill scored highly]
---

# Per-claim provenance at extraction time

A claim minted from a career document must carry, from birth, what part of the document
produced it. Not the document's overall quality, not the candidate's overall
credibility — the basis of *this* assertion. The technique is about *when*: provenance
is assigned at the moment the span becomes a claim, and never reconstructed afterwards.

## Why the timing is the technique

At mint time the extractor holds the thing that determines provenance: the section, the
surrounding entry, the date range, the verbs, whether an artifact was named. One second
later that context is gone. A résumé yields, from a single file, an employment entry
that demonstrates two skills, a thesis that demonstrates a third, a certificate that
attests a fourth, and a header bar that merely asserts eleven more. No per-document
score can express that, and no post-hoc pass can recover it.

Reconstruction is not merely lossy, it is *biased*. A later pass looking at a finished
skill list infers origin from the skill's own character — inferring "professional" for
things that sound like jobs and "coursework" for things that sound academic. It
therefore guesses worst exactly where the document was ambiguous, which is where the
answer mattered, and it systematically flatters candidates whose lists are written in
confident professional register. [A claim carries its sample and its
basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis) is a statement about the
record's structure, and a basis attached afterwards is a decoration, not a basis.

## The procedure

1. **Define the evidence kinds as a closed vocabulary**, held in one place: the kinds a
   document can distinguish, not the kinds you wish it could. Typical: paid employment,
   contributed or open work, structured placement, thesis or research output, academic
   project, personal project, formal certification, coursework, portfolio artifact, and
   bare self-assertion.
2. **Map each kind to a default basis**, and cross-validate that map at load time in
   *both* directions: every kind has a mapping, and every mapped basis is a real rung
   carrying a weight. A one-sided check passes while a renamed rung silently scores
   zero. Fail startup loudly rather than discovering it as a wrong score deep inside
   matching — a taxonomy and its weighting map that *can* drift apart will drift apart.
   Extend the same discipline to consumers: generate the intake dropdowns, the schema
   and the validation vocabulary from the one list, so no surface can offer a kind the
   scorer does not know.
3. **At mint time, stamp every claim** with its kind, the section it came from, and the
   span or entry that supports it. Make the field non-optional at the type level — a
   writer that *can* omit provenance eventually will, on the path added under deadline.
4. **Give the unrecognised case a name.** A section the extractor could not classify
   yields claims marked as unrecognised-origin, which resolves to the floor. It must not
   resolve to the middle of the ladder and must never resolve to the top.
5. **Keep the span.** A claim that can point back at the text that produced it can be
   shown to a recruiter, re-validated after a parser upgrade, and defended in a
   challenge. A claim that cannot is unauditable no matter how well typed.

## Decision rules

- **When a claim is minted, its basis is set in the same statement.** No two-phase
  "extract now, enrich later" for provenance. Enrichment is for meaning; provenance is a
  fact about extraction.
- **When one skill appears in several sections, keep every instance with its own
  basis.** Consolidating early destroys the strongest-basis decision that the scoring
  layer needs to make later, and the naive collapse keeps whichever instance was seen
  first.
- **When a model rather than the deterministic pass produced the claim, the provenance
  record says so.** A model-asserted claim with no supporting span is an inference; it
  renders as one, and [inference must look like
  inference](../../../_laws.md#inference-must-look-like-inference) forbids giving it the
  grammar of an extracted fact.
- **When the pipeline runs degraded**, claims minted on the fallback path carry a
  downgraded basis truthfully, rather than inheriting the label the full path would have
  produced.
- **When a field is added to the claim record later, "never extracted" and "extracted,
  found nothing" are different values.** Old records predate the field and must read as
  unknown; new records that found nothing must read as empty. Collapsing them means
  every historical record silently asserts the absence of credentials, publications or
  portfolio work that the extractor of the day never looked for. Stamp the extractor
  version on the record so the pre-field cohort stays selectable for reprocessing.

## The seam with weighting

This technique produces the basis; it does not decide what the basis is worth. The
ladder, its discounts, its consolidation rule and its fail-safe default belong to the
provenance-weighting practice. Keeping the seam clean matters in one specific way: the
extractor must not skip minting a low-basis claim on the grounds that it will be
discounted anyway. A self-asserted skill is real information — the candidate said it —
and dropping it converts a discountable claim into [absence of
evidence](../../../_laws.md#absence-of-evidence-is-not-evidence), which is the wrong state
and the harder one to detect.

## When not to use this

Where claims arrive already typed by a structured channel — a form the candidate filled
in with explicit fields, a verified credential feed — the channel *is* the provenance,
and re-deriving it from the text is a downgrade. Where a pipeline holds no weighting
layer at all, per-claim provenance is still worth minting for auditability, but do not
pretend it is doing scoring work it is not wired into: an unused field is a claim about
rigour that the system does not honour.
