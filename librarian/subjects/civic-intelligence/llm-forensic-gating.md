---
subject: llm-forensic-gating
domain: civic-intelligence
last_touched: 2026-09-09
touched_by: architecture-review
dry_streak: 0
---

# llm-forensic-gating

First touch: [[2026-08-31-awesome-agentic-patterns]], intake of a curated agentic
pattern catalogue whose real yield was its own citation-verification artifacts.
`hallucinated-reference-sweep` gained two sections and a `use_when` case.

## What the gap actually was

Not a missing opinion — a **missing half of a compound object**. The technique swept
prose for reference-shaped strings and checked each against a known set, which
settles whether a reference *exists*. The source shipped a measurement saying that
is the clean half: 413 identifiers checked, zero fabricated. The dirty half is the
attributes riding on those same identifiers — 617 venue-and-year claims, 277
verified, 36 fabricated — and the dominant shape is a real, resolving identifier
wearing a prestige venue and a year predating the document's own existence.

The technique could not see it because membership is a property of the identifier
alone, and it had explicitly bounded itself at "not a truth check on prose", which
denied one class too many: between "the reference exists" and "a bare fabricated
fact" sits a resolving reference with an invented standing. That is the enumeration
question from Phase 6 paying out — the file declared its own completeness and the
denial was slightly too wide.

The cheap corrective is intrinsic. Where an identifier encodes its issuance date, a
claimed earlier year is impossible rather than suspicious, and the citation refutes
itself from two of its own fields with no lookup.

## What the apply step actually showed

The A/B split, and the split is the useful part. Against generated research prose
citing preprints the check found 24 real contradictions and produced **zero** against
the hand-written half of the same repository — a clean discriminator. Against the
connected civic project's legislative corpus it collapsed: 114 flags, all but one
correct prose, because a statute's nearby years are *process* dates (submitted,
read, signed) and a bill submitted one year and enacted the next makes "earlier
year, later identifier" the normal case.

So the technique holds and its instrument does not transfer. That condition is now
written into the technique itself, along with the class the domain genuinely has and
the arithmetic cannot reach: **a real identifier standing where a different real
identifier was meant** — one digit apart, both genuine, membership passes. The
project's own analysts had already found one by hand and recorded it.

## Still open

- The connected project's gate is membership-only at its statute check and has no
  attribute comparison at all. The lookup that would catch a swapped-but-real
  reference (compare the citation's attributes against the register entry the
  identifier resolves to) is unbuilt and is the one lookup worth spending here.
- `plausible-date` in the same tree bounds each date globally (1993..today) and
  refuses to repair — the law arrived independently. Nothing joins a date to another
  field of the same record, which is where this whole class lives.

## Architecture review - 2026-09-09

Retain all eight techniques with bounded guarantees. All four applications require re-verification; the process survey now separates checked primary evidence from withdrawn, unverified numerical claims. No consumer runtime, benchmark or historical incident replay was performed.

The earlier intake's date-arithmetic conclusion is now narrowed: a publication
year can precede a repository deposit year. Only dates with the same documented
meaning support an intrinsic contradiction. The prior intake counts remain a
historical account, not a newly verified measurement.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/llm-forensic-gating",
  "date": "2026-09-09",
  "baseline": "a3dbf888",
  "digest": "sha256:31916ec0c4085bd0",
  "disposition": "clarify",
  "coverage": "All 13 owned documents read and assessed with explicit counterexamples. External checks are scoped in sources. No consumer runtime, historical incident replay, or application witness refresh.",
  "counterexamples": [
    "An empty allowlist rejects every nonempty ID; absent configuration can accidentally bypass the check.",
    "The correct digits are assigned to the wrong person or have a changed unit.",
    "A valid URL resolves to no supporting document.",
    "A quotation is absent because OCR failed.",
    "A chain is rewritten and all hashes recomputed by its writer.",
    "A changed prompt shares the analyst model's errors.",
    "A journal publication predates a later repository deposit."
  ],
  "sources": [
    {
      "url": "https://json-schema.org/understanding-json-schema/reference/object",
      "result": "Object closure and required-field distinctions checked."
    },
    {
      "url": "https://info.arxiv.org/help/jref.html",
      "result": "Journal-reference metadata distinguished from submission history."
    },
    {
      "url": "https://arxiv.org/abs/2501.10868v3",
      "result": "Abstract checked for benchmark scope; not rerun."
    },
    {
      "url": "https://arxiv.org/abs/2408.02442v3",
      "result": "Abstract checked; performance finding limited to studied settings."
    },
    {
      "url": "https://www.ap.org/the-definitive-source/behind-the-news/standards-around-generative-ai/",
      "result": "Primary 2023 policy checked; does not establish a 2026 update."
    }
  ],
  "documents": {
    "llm-forensic-gating.md": {
      "disposition": "clarify",
      "reason": "State residual risk, untrusted sources and exact-version publication checks."
    },
    "techniques/entity-id-membership-gates.md": {
      "disposition": "clarify",
      "reason": "Separate unknown scope, out-of-scope identifiers and semantic support."
    },
    "techniques/citation-required-per-claim.md": {
      "disposition": "clarify",
      "reason": "Require actual retrieval, support context and bounded negative evidence."
    },
    "techniques/hallucinated-reference-sweep.md": {
      "disposition": "clarify",
      "reason": "Bound serialization and date-contradiction claims."
    },
    "techniques/groundedness-scoring-triage.md": {
      "disposition": "clarify",
      "reason": "Qualify independence and calibrate against support-specific labels."
    },
    "techniques/human-review-doors.md": {
      "disposition": "clarify",
      "reason": "Require authorization, concurrency and exact-version approval."
    },
    "techniques/prose-register-gates.md": {
      "disposition": "clarify",
      "reason": "Scope lexical heuristics and preserve public coverage disclosures."
    },
    "techniques/structured-verdict-schemas.md": {
      "disposition": "clarify",
      "reason": "Require schema/validator parity, truthful no-evidence outcomes and current gate checks."
    },
    "techniques/whole-artifact-invariants.md": {
      "disposition": "clarify",
      "reason": "Expose quantity, quotation, syntax and population counterexamples."
    },
    "applications/node--prose-register-gates.md": {
      "disposition": "reverify",
      "reason": "Reverify short, mixed-language and quoted text; regex coverage does not prove publishability. Preserve population caveats and report false positives. Historical leak counts and current consumer gates were not rerun."
    },
    "applications/node--structured-verdict-schemas.md": {
      "disposition": "reverify",
      "reason": "An https prefix is syntax validation, not retrieval. A JSON.stringify sweep may hide literal whitespace behind escapes; validate decoded string traversal. Shared constants do not prove validator parity or benchmark comparability. Runtime completion/refusal paths and historical incidents were not rerun."
    },
    "applications/node--whole-artifact-invariants.md": {
      "disposition": "reverify",
      "reason": "Digit multisets miss reassigned amounts, sign changes and unit changes; located text can still be misattributed. The account already discloses absent automated arithmetic closure. Archived scripts, the cited repair commit and consumer runtime were not re-executed."
    },
    "applications/process--groundedness-scoring-triage.md": {
      "disposition": "reverify",
      "reason": "Literature checked at abstract/policy level; no implementation calibration performed."
    }
  }
}
```
