---
layer: application
type: application
subject: skill-adjacency-and-normalization
technique: bilingual-surface-parity-and-coverage-floors
stack: process
status: forged
---

# Per-family parity and floor ratchets over a hand-maintained taxonomy

The pilot market is Czech; the product's first families are the tech ones. Both
halves of the technique's prediction held.

## The finding

`pipeline/jobfit/tests/test_tech_bilingual_parity.py:1` records it: "The pilot
hires developers with Czech-language JDs, yet the tech families were the LEAST
bilingual: `software_engineering` 57%, `data_ai` 38% by raw >=2-surface count."
Concept and abbreviation terms (`ai`, `nlp`, `analytics`, `řízení projektu`)
carried a single surface, so a Czech requirement fell through `resolve_term`
(`pipeline/jobfit/taxonomy.py:751`) to raw string equality and missed its own
term. `test_string_equality_baseline_would_have_missed` pins the mechanism: the
normalized Czech and English surfaces are different strings, so pre-repair
`skill_match_score` returned `0.0` — a false miss for a candidate who named the
requirement in their own language.

The same inversion appeared on the hierarchy side.
`PARENT_COVERAGE_FLOORS` (`pipeline/jobfit/taxonomy_check.py:124-138`): "The
three tech families used to sit at 24% / 18% / 7% while every non-tech family ran
42-85%, so the payoff had inverted: a backend engineer listing Fastify against an
Express JD scored a flat zero where an equivalent nurse or accountant earned
honest partial credit."

## Parity as a per-term property

`FamilyCoverage` (`taxonomy_check.py:513`) computes, per role family,
`skill_terms`, `total_terms`, `with_parents`, `bilingual` (terms with ≥2
normalized surface forms) and `bilingual_exempt`. `pct_parity` is
`(bilingual + bilingual_exempt) / total_terms`.

The exemption is the technique's proper-noun escape hatch, and the repo builds
both guards the standard requires. The flag is explicit per term, never inferred
— its own comment says so: "no number can be gamed by silently exempting a term
that DOES have a Czech surface." And `lint_taxonomy`
(`taxonomy_check.py:410`, the `bilingual_exempt` block) makes the flag truthful:
a term flagged exempt while carrying two or more surface forms is an **error**,
not a warning, while a genuine single-surface term merely warns. The test suite
asserts it live on shipped data
(`test_exempt_terms_are_genuinely_monolingual`), and reports the exemption count
as its own number (`test_parity_is_bilingual_plus_exempt` asserts
`software_engineering` parity relies on exemptions).

The three tech families now reach ~100% parity
(`test_tech_families_reach_full_parity`).

## The floors, gated twice

`SKILL_COVERAGE_FLOORS` (`taxonomy_check.py:104`) and `PARENT_COVERAGE_FLOORS`
(`:138`) are the two dimensions the technique asks to pin — vocabulary existence
and edge density — for all 16 families. The convention comment states the
dual-gate rule exactly:

> A NONZERO floor is an EXACT pin — it must equal the live skill count for that
> family. The `>=` gate in `test_taxonomy_coverage_gate` catches a between-commit
> REGRESSION; the `==` guard [in `test_role_family_parity`] forbids silent SLACK,
> so any commit that changes a built-out family's vocabulary must re-pin its
> floor in the SAME commit.

The comment even names the hole this closed: `finance_accounting` "sat at 46
while the live count was 54, which would have permitted silently deleting 8
finance terms." A zero floor is reserved for a not-yet-built-out family, held as
a pure minimum and exempt from the equality pin, so an empty family is visible
without gating unrelated work.

Parent-link floors were re-pinned after the repair: `software_engineering` 50
(60%, was 20 / 24%), `data_ai` 28 (74%, was 7 / 18%), `product_project` 16 (55%,
was 2 / 7%).

## No-drift on the first language

`EnglishResolutionUnchangedTest`
(`test_tech_bilingual_parity.py:76`) is the technique's no-drift assertion: a
representative slice of existing English surfaces must resolve to exactly the
same term ids after the Czech aliases land, plus a hierarchy-score slice
(`swiftui`/`swift` 0.9, reverse 0.55, `react`/`python` 0.0). And
`test_new_tech_aliases_are_collision_clean` runs every newly added alias through
`scan_corpus_collisions` — an alias is a matching change, gated as one.

## Never assume the founding domain

`app/_lib/role-families.ts:1-52` carries the deliberately-opened role-family
vocabulary — 16 slugs spanning healthcare, life sciences, skilled trades,
logistics, frontline service, legal, education, creative and more — mirroring the
Python side. `DEFAULT_ROLE_FAMILY = "general_professional"` at `:52`, with the
comment "Never assume software", is the neutral default the golden path requires;
`taxonomy.py:128` holds its Python counterpart `DEFAULT_FAMILY`, sourced from the
benchmarks file rather than hardcoded, and `classify_role_family`
(`taxonomy.py:670`) seeds `best = DEFAULT_FAMILY`.

## Verdicts

- **Confirmed.** Parity as a per-term property; per-family measurement rather
  than a global average; the proper-noun exemption with an explicit flag and a
  lint that makes it truthful; exemptions reported separately; floors on both
  vocabulary and edge density; the dual `>=` / `==` gating; the zero-floor
  convention; the no-drift assertion on the first language; the collision re-scan
  on new aliases; a neutral non-software default family.
- **Deviation.** The parity metric counts *surface forms per term* (≥2), not
  resolution rate against a real second-language corpus. A term can carry two
  surfaces and still miss the phrasing a Czech job ad actually uses, so the
  standard's corpus-measured coverage rate is stronger than what ships, and the
  sample-size disclosure the standard asks for beside every rate is absent.
  `lint_taxonomy` also checks duplicate normalized surfaces only *within* a term
  — a surface colliding across two terms is not caught — and cycle detection
  stops at self-parent. The standard stays.
- **Upward lessons taken into the technique.** The dual-comparison gate
  (`>=` for regression, `==` for slack) rather than a single floor; the
  exemption's anti-gaming lint; edge density as a second pinned dimension; the
  first-language no-drift assertion as a standing part of alias work.
