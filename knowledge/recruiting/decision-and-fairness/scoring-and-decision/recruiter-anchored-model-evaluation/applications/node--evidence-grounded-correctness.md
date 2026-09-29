---
layer: application
type: application
subject: recruiter-anchored-model-evaluation
technique: evidence-grounded-correctness
stack: node
status: forged
verified_on: 2026-09-29
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

## Since the pinned commit

Re-read on 2026-09-29 against upstream `main` (`5118d3555`); the verify file has
grown from 1273 to 1458 lines and the pinned links above still resolve at the pinned
commit. Five changes bear on this reading:

- **Default sources moved to the data root.** A fix on 2026-09-17 (#4208) records
  that the gate had resolved its default source files and its config from the code
  checkout, so under a configured data root it read no sources and reported claims
  copied verbatim from the owner's own `cv.md` as absent. That is the empty-source
  hazard named above, observed in the field; `readIfExists` still returns an empty
  string for a missing file, so a wrong path still fails as a wrong block, not as an
  error.
- **The result has a verdict.** `verifyFacts` now returns `pass`, `warn` or
  `block`. A recognition-coverage gap turns a would-be pass into `warn` and never
  creates or removes a block, and `configMissing` rides along outside the verdict so
  a caller can say the phrase lists never loaded.
- **The export callers do not print the coverage reason.** `assertFacts` throws
  only on `block`. In `generate-cover-letter.mjs` (line 371 on `main`) and
  `generate-pdf.mjs` (line 1441) a `warn` prints its header and then only the
  advisory phrases; `coverage.message` is printed only by the command-line path
  (verify-cv-facts.mjs:1426). A document whose only finding is a coverage gap
  therefore renders after a warning line that names no reason.
- **False-positive classes were narrowed.** Fixes on 2026-09-25 stop a cited posting
  requirement being read as a personal metric (#3917) and a CV's own reworded prose
  being read as a tool claim (#4006), and the source comments say a plan horizon such
  as "the first 90 days" was once flagged and cannot be evidenced by any source. An
  `invented` result is a statement about extraction, as the label caveat above says.
- **The coverage rule is unchanged.** It still fires only with two or more count-like
  spans and no recognised count, and the two blind spots (a coincidental English
  noun, spaceless scripts) are still documented in the source.

The self-test was not re-run for this reading, so the 88-check figure below is
the 2026-09-10 one and describes the pinned commit only.

## Verification

`node verify-cv-facts.mjs --self-test` passed 88 checks with zero failures on
2026-09-10. The production callers were read, but PDF rendering and a live
generation session were not run. This is source implementation evidence, not an
A/B result or a measured improvement to a managed hiring project.
