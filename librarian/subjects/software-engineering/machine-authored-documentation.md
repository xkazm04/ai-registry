---
subject: machine-authored-documentation
domain: software-engineering
last_touched: 2026-08-31
dry_streak: 0
---

# machine-authored-documentation

First touch: [[../../sources/2026-08-31-archify]] — forged whole from one
practitioner build-walkthrough in repository form (`github:tt-a1i/archify` @
`5de7275`), in-session, no dispatched worker. Golden path + 7 techniques + 1
application, 0 of 3 fetches spent. Placed as the 6th subject in
`engineering-process/codebase-stewardship` (cap 10).

## Why it is a subject and not a seam in `docs-sync` or `codegen`

The discriminator is **determinism**, and it was verified against both
neighbours' own boundary statements before the subject was minted:

- `codegen` owns derived *source*, and its whole discipline stands on
  `derivation-names-recomputation` — commit the output, regenerate in the gate,
  fail on the diff. A regeneration diff over a model author is noise: red on
  every run for reasons unrelated to correctness, and therefore switched off
  within the month.
- `docs-sync` owns the standing claim a published document makes — it asks
  whether a document is *still* true. This subject asks whether it was *ever*
  admissible. **Authorship ends where the standing claim begins**, and a
  document that fails here should never reach that subject's coupling map.

Both boundaries are stated in the new golden path. `docs-sync` was not edited to
state the reverse — worth doing on a later touch, so the seam reads from both
sides rather than one.

## Cross-bundle boundary (stated, not linked)

Regression gating for model quality lives in an observability bundle and assumes
a **fixed grader**. This subject owns the case that discipline assumes away —
the verifier moved between the runs being compared, usually because building the
fix taught the team what the criteria should have said. `rescored-baseline-uplift`
is arithmetic, not statistics; where the grader is stable, the other vocabulary
is the better tool. Recorded here so a later run recognises the shape instead of
re-litigating it.

## Open leads (banked, convergence rule applies)

- **Canonical bytes vs. reader state** — a generated artifact separating what it
  exports from the reader's exploration state (focus, camera, highlight,
  evidence markers), so an export is what was authored. Plausible 8th technique.
  Return: a second independent source, or a managed project shipping an artifact
  with a reader runtime.
- **Remote copy is never relayed.** A self-updating package renders only
  locally-fixed text about an available update; the remote manifest's summary is
  never quoted, summarised or translated, and silence is never consent. A
  prompt-injection boundary in release-notes clothing. Return: a second source,
  or a managed project shipping a self-updating skill. May belong in
  `agent-instruction-files` or `packaging` rather than here.
- **Failure-gated progressive disclosure of reference files** — the source's
  skill forbids reading renderer, validator, test and benchmark sources before
  the first candidate, and unlocks them only after two focused repairs fail.
  Near-adjacent to `agent-instruction-files/line-earning` but not identical
  (that one governs line admission to an always-loaded file; this governs when a
  *reference* file may be opened). Recorded as a catch this run; revisit if a
  second source draws the same staging.

## Applications

- `node--evidence-without-verdict` — `politicas`, mode `code`, verdict `better`,
  proof `ab-paired`, **shipped** (3 files, +92/-9, unpushed). Both arms run the
  real exported caller over one stubbed page: real findings 2 vs 2 and
  byte-identical, unmeasured candidates visible 0 → 3, coverage matching ground
  truth. **The structural facts outrank the A/B** and there are three: the
  report had no skipped record type (so the conflation was forced, not chosen);
  the vocabulary already existed one layer up and died at a module boundary; and
  the same repository implements `checked-vs-skipped-denominators` exemplarily
  in a *different* gate. That last one is the reusable finding — a discipline is
  adopted by a gate, not by a codebase.
- Single-stack (`node`). Single-source debt: the whole subject is forged from
  one repository. Both are real debts and both are the obvious next work — a
  reconcile wave against a second generator would be the highest-value touch.

## Owed on the next touch

- A second stack and a second source; this subject is single-everything.
- `docs-sync`'s side of the authorship/standing-claim seam.
- The live-page rate the change makes measurable but does not supply: how often
  a contrast candidate actually goes unresolved on a real page. Returns when
  `puppeteer` is in that tree.
- 31 of the detector's 39 conflation sites sit in four untouched engines, and
  `--no-advisory` can still suppress the denominator the change added.
