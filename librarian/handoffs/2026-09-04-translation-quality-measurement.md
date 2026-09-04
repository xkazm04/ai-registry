# XL spec — `localization/craft/translation-quality-measurement`

status: EXECUTED (forged in-session, 2026-09-04, run `intake-transl-01`)
source: `librarian/sources/2026-09-04-authority-hacker-writing-models.md`
origin: the source ORIGINATED this gap; it does not authorize a word of it.

## Why XL and not a technique

The localization bundle is 146 files in two halves that do not meet:

- **13 per-language subjects** answer *what a correct translation is* — register,
  script, agreement, classifiers, the rules a native reviewer holds a string to.
- **`craft/translation-pipeline-topology`** answers *where translations live and
  what may claim to be source* — canonical vs derived, fallback serving, the
  trust-class laundering it exists to prevent.

Its own golden path states the boundary in those exact terms. Between them sits a
decision neither makes and both depend on: **which machine produced the derived
store, and how anyone would know it got worse.** `derived-and-served` is defined
as "machine translations, keyed to the source, regenerable at will" — the engine
is a free variable in the topology that the topology never constrains. Swap it and
every string changes; nothing in the bundle notices.

Three mechanisms share that one home, which is the v2 trigger for a subject
rather than an amendment:

1. choosing an engine per language pair, where the ranking is not global;
2. measuring output quality without a reference translation, which is the case
   the derived-and-served topology is *always* in;
3. detecting regression when the engine moves under a pipeline that is defined as
   regenerable.

## Placement (verified against the authority, not a count)

`knowledge/localization/taxonomy.json` — `craft` is a **flat** category holding one
subject (`translation-pipeline-topology`), so it is at 1 of `MAX_CHILD_DIRS` 10 and
holds no subcategories. The new subject is a sibling at the same depth: laws
resolve at `../../_laws.md`, the neighbour at
`../translation-pipeline-topology/translation-pipeline-topology.md`.

## Boundaries it must NOT absorb

- **Per-language correctness.** Whether a Czech plural agrees is the language
  subject's. This subject owns the *measurement apparatus*, and must cite the
  language subjects as where the error taxonomy's categories get their content.
- **Storage and trust class.** `translation-pipeline-topology` owns what may claim
  review. This subject may say a score is *evidence*, never that it is a review.
- **Generic eval machinery.** `software-engineering/llm-agent/evaluation-and-cost/eval-harness`
  owns pinned judges, declared aggregation, comparison modes. Cross-bundle links
  are forbidden: state the translation-specific discriminator in prose and do not
  re-derive the general standard.
- **Composite score arithmetic** belongs to `operations/service-operations/scoring-rubrics`.

## Proposed techniques, each with the decision rule it must carry

- `reference-free-quality-estimation` — the derived store has no human reference by
  construction, so any metric requiring one is unavailable exactly where it is
  needed. Rule: what may be asserted from a reference-free estimate, and the
  floor below which it is a flag for review rather than a verdict.
- `error-typology-over-a-single-score` — one number cannot distinguish a mistranslation
  from an awkward register, and the two have opposite remediation. Rule: severity ×
  category, with the categories drawn from the language subjects.
- `per-pair-engine-selection` — engine ranking does not transfer across language
  pairs; a global winner is an average over pairs that hides the pair you serve.
  Rule: rank per pair, and state the pair a claim was measured on.
- `regression-detection-under-a-moving-engine` — the topology defines the store as
  regenerable, which makes silent engine drift the native failure. Rule: what is
  pinned, and what a regeneration must re-prove.
- `human-review-sampling-under-a-budget` — full review is not on offer (that is the
  premise of derived-and-served). Rule: how the sample is drawn so the estimate
  is about the corpus and not about what was easy to check.

## Open questions the drafter decides, not discovers

1. Does the subject own **post-edit distance** as a quality signal, or is that the
   hand-authored-exception contract's business? Argue the boundary either way.
2. Is `per-pair-engine-selection` one technique or two (selection vs. the ranking
   instrument)? Fold if the second has no independent decision rule.
3. Whether a sixth technique on **glossary/termbase adherence as a measurable** is
   earned, or whether that is per-language terminology work already owned.

## Instance a reader can open

`localization/craft/translation-pipeline-topology/techniques/source-identical-value-audit.md`
already proves a catalog was *translated* (values differ from source) while saying
nothing about whether the translation is *good* — the exact seam this subject fills,
in a file that exists today.

## Web budget for the drafter

Primary and standards-tier only, and this is where the subject's authority comes
from, since the originating source is a video about English marketing copy:
the WMT shared-task findings papers on evaluation, the MQM error typology, and the
literature on reference-free quality estimation. Expert-first draft, then harden.
