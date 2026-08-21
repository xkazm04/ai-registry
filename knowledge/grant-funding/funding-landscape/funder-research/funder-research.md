---
layer: golden-path
type: golden-path
subject: funder-research
status: forged
use_when: [building discovery for funders with no machine-readable feed, designing an agentic research pipeline over untrusted web findings, deciding when a discovered opportunity may enter a live corpus, planning which jurisdictions and sectors to research next]
techniques:
  - coverage-gap-driven-planning
  - discovery-with-omit-if-unsure
  - adversarial-verification-pass
  - schema-validation-at-boundary
  - provenance-and-confidence-per-row
  - human-review-before-promotion
---

# Funder research

Most of the world's funders publish no feed. A minority of jurisdictions expose
structured open-call data; everywhere else — and for foundations nearly
everywhere — live opportunities exist only as prose on funder websites,
newsletters and program pages. Funder research is the discipline of turning
that unstructured landscape into corpus rows an applicant can act on, and its
cardinal risk is unique in the funding domain: **the research instrument itself
can invent funders.** A scraper that breaks returns nothing; a language model
asked to "find grants" returns something every time, and the something is
fluent, well-formatted, and possibly fictional. A fabricated program in a
funding corpus is worse than an empty cell — it routes a real applicant's
scarce writing hours toward money that does not exist.

The principal practitioner therefore designs funder research not as a search
problem but as a **trust pipeline**: a sequence of stages, each of which is
allowed to trust the previous stage only in specific, checked ways, ending in a
human decision. The naive reading — "prompt a capable model, parse the JSON,
insert the rows" — fails at every stage boundary at once, and fails silently,
which is the worst way to fail in this domain.

## The pipeline shape

The stages are fixed even when the implementations vary:

**Plan → discover → validate → verify → stage → promote.**

1. **Plan** decides *what to research*, and the decision is driven by the
   corpus, not by habit: research effort flows to the cells — jurisdiction ×
   sector — that are emptiest and stalest, because that is where a marginal
   research run adds the most value
   ([coverage-gap-driven-planning](./techniques/coverage-gap-driven-planning.md)).
2. **Discover** asks a research agent for real, currently-open programs — with
   the instruction set built so that *silence is always an acceptable answer*.
   The single highest-leverage sentence in the whole pipeline is the one that
   makes an empty result legitimate
   ([discovery-with-omit-if-unsure](./techniques/discovery-with-omit-if-unsure.md)).
3. **Validate** treats the discovery output as untrusted text and admits
   nothing past the boundary without structural and plausibility checks —
   parseable, complete where completeness is mandatory, plausible where
   plausibility is checkable
   ([schema-validation-at-boundary](./techniques/schema-validation-at-boundary.md)).
4. **Verify** runs an *independent adversarial pass*: a second agent, with its
   own web access, whose job is to refute the candidate — fetch the claimed
   source, confirm the funder exists, confirm the window is open, and default
   to refuted on any doubt
   ([adversarial-verification-pass](./techniques/adversarial-verification-pass.md)).
5. **Stage** records survivors as *candidates*, each carrying its provenance
   and a deterministic confidence score so a reviewer can triage by trust
   rather than by reading order
   ([provenance-and-confidence-per-row](./techniques/provenance-and-confidence-per-row.md)).
6. **Promote** is a human decision. Nothing the pipeline discovers enters the
   live corpus on the pipeline's own authority; a person approves candidates,
   and promotion is idempotent so review and re-runs cannot double-write or
   lose approvals
   ([human-review-before-promotion](./techniques/human-review-before-promotion.md)).

Two properties of this shape matter more than any stage's internals. First,
**checks run cheap-to-expensive**: structural validation and duplicate
detection cost nothing and run before the verification pass, which costs a web
session per candidate. A candidate already present in the corpus is dropped
before anyone spends verification effort on it. Second, **every drop is
recorded with its reason**. A pipeline that discards candidates silently
cannot be debugged, tuned, or audited; the run log of what was dropped and why
is as much a product of the run as the candidates themselves.

## What "verified" means here

Fundraising practice long predates automation, and its verification doctrine
transplants directly. A professional prospect researcher never treats a
directory listing as ground truth: the funder's own surface is the authority
for whether a program is real and open *today*, while third-party and
tax-filing-derived data — which lags a year or more — supports behavioral
inference (what this funder tends to fund, at what size, in what geography),
never deadline claims. The automated pipeline inherits both halves of that
rule: the adversarial pass must reach the funder's own page, and giving-history
signals may raise a candidate's ranking but may never substitute for
confirming the window is open. A third rule from the same practice:
*whether the funder accepts unsolicited applications at all* is a hard
disqualifier that listings routinely omit — an "invitation only" funder is not
an opportunity, however perfect the fit, and the research instruction set
should say so.

## Localization is part of correctness

Funder research crosses jurisdictions, and a pipeline designed against one
jurisdiction's assumptions fabricates by accident in another. The research
instruction carries the jurisdiction's language (titles and summaries in the
language applicants will recognize), its currency (amounts as plain numbers in
the local currency, not converted), and hints toward that jurisdiction's
authoritative sources — because "prefer authoritative funder pages" is only
actionable when the agent knows which pages are authoritative *here*.
Deduplication must also fold locale: the same program discovered fresh and
already present via another source will differ in diacritics, punctuation and
casing, and a byte-exact key manufactures duplicates precisely in the
jurisdictions where research-grade discovery matters most.

## Failure modes of the naive reading

- **The confident fabrication.** A fluent, complete, well-structured program
  that does not exist. Caught only by independent verification against the
  live web; never by inspecting the discovery output, which is optimized to
  look right.
- **The stale truth.** A real program whose window closed. Structural checks
  catch a past date when one is stated; the adversarial pass catches the page
  that says "applications closed" under an unchanged listing.
- **The silent empty run.** Discovery that finds nothing, reported as success
  — indistinguishable from a healthy run over a genuinely empty cell unless
  volume is tracked across runs and collapses are flagged.
- **The re-researched cell.** Effort repeatedly spent on the sector a feed
  already fills, because planning never consulted the corpus it was feeding.
- **The trusted pipeline.** Auto-promotion "because verification passed."
  Verification reduces the review burden; it does not replace the reviewer.
  The pipeline's precision is unknown until humans have graded enough of its
  output, and the graded stream is also the only calibration signal the
  pipeline will ever get.

## The techniques

- [coverage-gap-driven-planning](./techniques/coverage-gap-driven-planning.md) —
  target research where the corpus is emptiest and stalest, and watch run
  volume for silent decay.
- [discovery-with-omit-if-unsure](./techniques/discovery-with-omit-if-unsure.md) —
  instruction design that makes omission and emptiness legitimate, removing
  the pressure to fabricate.
- [adversarial-verification-pass](./techniques/adversarial-verification-pass.md) —
  an independent, fail-closed second pass that must affirm existence and
  openness against the live web.
- [schema-validation-at-boundary](./techniques/schema-validation-at-boundary.md) —
  structural and plausibility validation of untrusted agent output, with
  reasons recorded for every rejection.
- [provenance-and-confidence-per-row](./techniques/provenance-and-confidence-per-row.md) —
  deterministic per-candidate confidence and per-row provenance, so review is
  triage rather than archaeology.
- [human-review-before-promotion](./techniques/human-review-before-promotion.md) —
  the staging queue, the human gate, and idempotent promotion into the live
  corpus.
