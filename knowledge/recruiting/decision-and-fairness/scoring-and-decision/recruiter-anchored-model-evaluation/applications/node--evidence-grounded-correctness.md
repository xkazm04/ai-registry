---
layer: application
type: application
subject: recruiter-anchored-model-evaluation
technique: evidence-grounded-correctness
stack: node
status: forged
verified_on: 2026-09-10
verified_against: node@18
proof: structural-only
---

# Deterministic grounding checks before exporting tailored documents

Career-ops declares Node `>=18` in `package.json`. This reading resolves the
source at commit `6ddfca5aaa1a488bd55b0c1eca80d6896f855062`; execution below
used Node 24.14.0, not the minimum supported runtime.

The candidate-side task is to tailor a document without inventing experience.
The alternative, asking the generator whether its own prose is accurate,
provides no independent check. `verify-cv-facts.mjs` instead extracts metric
claims from both the generated artifact and supplied source documents, then
compares normalized claims. Explicit allowlists can admit confirmed exceptions.
The check establishes support in the supplied material, not truth about a person.

The [verification function](https://github.com/career-ops-hq/career-ops/blob/6ddfca5aaa1a488bd55b0c1eca80d6896f855062/verify-cv-facts.mjs#L779)
also checks selected non-metric assertions and delegated-versus-direct authorship.
It returns separate unsupported metrics, unsupported facts, forbidden phrases,
warnings, and coverage information. Its `invented` property is an implementation
label for absence from the supplied source set; it is not evidence of deception.

This is wired into production export paths:
[CV PDF generation](https://github.com/career-ops-hq/career-ops/blob/6ddfca5aaa1a488bd55b0c1eca80d6896f855062/generate-pdf.mjs#L1339)
and [cover-letter generation](https://github.com/career-ops-hq/career-ops/blob/6ddfca5aaa1a488bd55b0c1eca80d6896f855062/generate-cover-letter.mjs#L327)
call `assertFacts` before rendering. Blocking the owner's generated draft gives
them a repair opportunity. Transplanting that block into employer-side candidate
rejection would change its meaning and violate the screening boundary.

## What the check cannot establish

Recognition coverage limits the verdict. The
[coverage diagnostic](https://github.com/career-ops-hq/career-ops/blob/6ddfca5aaa1a488bd55b0c1eca80d6896f855062/verify-cv-facts.mjs#L672)
warns when at least two count-like spans exist but no count noun is recognized.
One recognized count suppresses that diagnostic even if other counts are unreadable;
the preceding comments also name unresolved unspaced-language coverage. A pass is
therefore not a completeness certificate. Missing source files are read as empty,
and allowlists require their own provenance discipline.

The registry's sibling rule that unverifiable is not fabricated remains necessary:
an unsupported assertion can require clarification without alleging misconduct.
Preserve the generator's exact source set, the extractor version, recognized-claim
count, and unexamined categories when adapting this gate.

## Verification

`node verify-cv-facts.mjs --self-test` passed 88 checks with zero failures on
2026-09-10. The production callers were read, but PDF rendering and a live
generation session were not run. This is source implementation evidence, not an
A/B result or a measured improvement to a managed hiring project.
