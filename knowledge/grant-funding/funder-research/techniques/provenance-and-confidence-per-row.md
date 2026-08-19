---
layer: technique
type: technique
subject: funder-research
technique: provenance-and-confidence-per-row
status: forged
laws: [provenance-per-field]
shared_with: []
use_when: [staging discovered candidates for review, designing a confidence score reviewers can trust, deciding what metadata a research row must carry]
---

# Provenance and confidence per row

A staged candidate is a claim, and a claim without its history cannot be
reviewed — only re-researched, which forfeits everything the pipeline did.
The technique: every candidate carries, as first-class fields, **where it came
from** and **how much the pipeline trusts it**, so that human review is triage
over sourced, ranked claims instead of archaeology over anonymous rows.

## Provenance: enough to re-derive the row

The provenance record answers, without recourse to logs: which run produced
this row, when, researching what — the jurisdiction, the sector or need, the
instruction context. Plus the row's own evidentiary trail: the claimed source
address, whether the reachability probe succeeded, and the verification
verdict *with its stated reason*. The test for sufficiency is re-derivability:
a reviewer holding only the row should be able to retrace how it came to
exist and check every claim themselves. Anything less turns review into
trust-by-default, which is the failure the human gate exists to prevent.

Provenance also has a lifetime beyond review. Once promoted, the row's origin
("research-discovered, verified on date X, approved by a person") is what
distinguishes it from feed-loaded rows in every later quality question —
which rows to re-verify when they age, which source families fabricate most,
whether research-origin rows underperform feed rows in application outcomes.
Strip provenance at promotion and those questions become unanswerable.

## Confidence: deterministic, or it is decoration

The confidence score's consumer is a reviewer deciding what to read first and
where to focus skepticism. That purpose dictates the design constraint:
**deterministic and inspectable**. The same row must always score the same,
and a reviewer must be able to see why a row scored as it did. A score from a
model's self-assessment fails both tests — it varies across runs and explains
nothing — and reviewers learn quickly to ignore scores they cannot interrogate,
after which the score is dead weight.

The workable shape is a small additive formula over observable facts:

- **A base** reflecting that the row survived validation at all — meaningful,
  since structurally broken rows never reach staging.
- **Completeness increments** — a stated source address, a stated deadline, a
  stated ceiling amount, a summary, eligibility terms each add a little. Not
  because complete rows are true, but because each stated field is one more
  independently checkable claim; a row that asserts almost nothing offers
  almost nothing to verify.
- **Evidence increments and decrements** — probe reachability adds modestly;
  probe failure subtracts modestly (weak evidence, since real funder pages
  block probes); the adversarial verdict moves the score most, with
  confirmed-real-and-open worth several times any completeness signal, and
  confirmed-real-but-not-open worth a fraction of that.

The weights encode an epistemic ordering — independent verification outranks
reachability outranks self-reported completeness — and that ordering is the
actual content of the formula; the specific decimals are tuning. One
interaction deserves care: a probe failure later contradicted by an
adversarial confirmation should net out positive, because the pass that
browsed like a person outranks the probe that got blocked.

## Decision rules

- When review capacity is short, review descending by confidence but *sample*
  the low tail every cycle — the tail is where systematic pipeline errors
  hide, and never reading it means never finding them.
- When two candidates duplicate each other across runs, keep the higher-
  confidence row but merge provenance — the fact that two independent runs
  found the program is itself evidence, and discarding it wastes it.
- When the score and the verdict reason disagree in spirit (high score, but
  the verifier's reason is lukewarm), trust the prose — the score compresses,
  the reason explains.
- When adding a new signal to the formula, re-rank a graded historical batch
  first and confirm the ordering improves; never tune weights against
  intuition alone.

## When not to use

Do not surface pipeline confidence to *applicants* — it encodes discovery
trust, not fit or eligibility, and end users will read any number as "my
chances." Its audience is reviewers and operators. Do not use confidence as
an auto-promotion threshold ("above 0.9 skips review") — the score ranks the
queue, the human clears it; the moment a threshold promotes, the formula's
weights become the corpus's admission policy, unreviewed. And resist per-field
confidence at this stage: staging-level trust is about the row's existence,
and field-level provenance becomes load-bearing later, at extraction and
drafting, where individual values get consumed.
