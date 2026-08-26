---
source: repo
url: https://github.com/rohitg00/ai-engineering-from-scratch
title: "AI Engineering from Scratch - 511-lesson open curriculum"
author: rohitg00
kind: curriculum-repo (511 lessons / 20 phases, CI-governed, 12-language i18n)
mined_on: 2026-08-26
commit: 39ea8a1
skill_version: 0.10.0
extracted: 7
picked: 2
accepted: 1
already_covered: 3
declined: 0
leads: 4
untriaged: 0
dispatched: 3
---

# ai-engineering-from-scratch, 2026-08-26 - a subject forged from the periphery, same-run

Run 17, seventh source of the hardening series. A curriculum repo mined
per the app-aggregator class rules (periphery over content), triaged with
the altitude column, and the first run to EXECUTE its XL finding in the
same session rather than banking a spec: the operator picked "spec plus
execution", and the spec became three parallel forge-worker briefs.

## Accepted (executed)

**New category `localization/craft`, new subject
`translation-pipeline-topology`** - the process half the localization
bundle lacked (13 language subjects own what a correct translation IS;
nothing owned where translations LIVE and how they move). Golden path by
the director; six techniques by three parallel workers, two each
(split by TECHNIQUE, not by language - the subject is language-agnostic
process craft, so language is the wrong partition axis; noted because the
operator asked):

- `canonical-and-derived-split` - a translation's storage location is a
  trust claim; machine output is committed only where a human quality
  claim stands behind it. Primary sighting: the source tree
  (machine translations never on main, derived branch, runtime fetch).
  Second sighting, OPPOSITE topology with the discriminator: the fleet's
  desktop app commits reviewed catalogs - review claim present. The
  discriminator, not either topology, is the finding.
- `source-hash-translation-cache` - derived units keyed by source digest;
  cache publishes with the store; unchanged source is never re-translated.
- `sharded-translation-ci` - shards sized so every job finishes AND
  publishes inside the runner's hard limit (the source's one-language run
  was ~27h against a 6h limit and timed out before publishing, forever);
  the unit of progress is the published shard.
- `canonical-fallback-serving` - per-unit fallback to canonical; the
  canonical path stays byte-identical; offered == served.
- `language-registry-single-source` - one registry drives build matrix,
  switcher and exports; a language missing a required field fails the run;
  adding a language is a one-line diff.
- `hand-authored-exception-contract` - the committed hand-authored pages
  as an enumerated contract with an author, a quality claim and a
  staleness obligation; a separate registry from the machine set because
  the two answer different questions.

Fleet consumer: the personas i18n programme (19k keys, review waves) runs
the reviewed-and-committed topology; personas-web is multi-locale. The
subject gives both their first process-level standard.

## Leads

- **"Comprehension is proven by reconstruction" - second sighting, law
  candidate.** The curriculum's Build It / Use It spine (rebuild from raw
  parts, then run the same operation through the production library "so
  the framework stops being a black box") shares its root with
  `media-generation/generated-output-grading/replication-as-comprehension-test`
  (2026-08-25). Two independent domains, one root. Return condition: a
  THIRD sighting from a different run or domain mints the law; do not
  mint at two.
- **Certification machinery** (program metadata with a source policy, exam
  blueprints as data, original mock assessments, reference backfill
  scripts) - engineering-assessment (ascent) and recruiting/assessment
  adjacency. Return: ascent wants exam-shaped assessment, or a second
  certification tree.
- **Quiz-per-document** as a comprehension artifact on knowledge bases -
  no owner; adjacent to consult/onboarding. Return: a consult consumer
  wants comprehension checks.
- **Bias-linting on assessment questions** (a debias script in the gate
  set) - recruiting adjacency. Return: second sighting.

## Already covered

- sha256-keyed derivation caching in general - `fingerprinting-and-cache-keys`
  + the `derivation-names-recomputation` law own the root; the
  localization-specific half went into the new subject's cache technique.
- Machine-owned README regions with stats fences - fourth sighting of
  `machine-owned-regions`; no edit.
- Curriculum invariant CI (dir patterns, quiz shape, link checks, count
  sync) - the registry's own gate family, converged independently.

## Instrument notes

- Checkout completeness check (the run-13 rule) fired usefully again: the
  clone needed `git restore --source=HEAD :/` for a handful of files.
- Class: curriculum repo behaves as the app-aggregator class predicts
  (periphery carried everything); no new class row - one line added to the
  existing row would suffice if a second curriculum repo confirms.
