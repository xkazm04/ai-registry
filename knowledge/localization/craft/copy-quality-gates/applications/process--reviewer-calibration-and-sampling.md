---
layer: application
type: application
subject: copy-quality-gates
technique: reviewer-calibration-and-sampling
stack: process
status: forged
verified_on: 2026-10-14
applied: simulation
ab_verdict: unmeasurable
---

# A native-triage queue that was specified, referenced three times and never created (personas)

The technique is staged `team` and its own "when not to use" says a single-author stage gets more from
the mechanical gate and anchored model review. The seam hunt (bounded) asked whether the tree has the
precondition at all: several reviewers whose verdicts feed one catalog.

## What the tree showed

- The translation skill sends every ambiguous string to `docs/i18n/review-<locale>.md` "so a native
  speaker can triage" and lists the file in its done-checklist. `git log --all -- 'docs/i18n/review-*'`
  returns nothing: across 13 locales the queue has never existed. Per-locale style, exemplar and
  glossary files exist; the reviewer-role artifact does not.
- The locale catalogs have two committing identities (448 and 831 commits on one locale file) and no
  record of which role either performed. A nativeness pass cannot be told from a fidelity pass.
- No surface weights are declared in `contract.md`, so there is no "money page" list to review in full
  and no random reserve to estimate the catalog.

## A and B, three cases (simulation, labelled as my reasoning)

Policy A: today, ambiguous strings are fixed in place and the review file is skipped. Policy B: the
technique applied minimally, a review file per locale whose lines each carry a rule identifier, role
and strings-assigned versus strings-read.
1. A pun or domain-term string in a high-visibility surface (nav, empty state): A leaves it silently
   decided; B records it with an anchor and a role, so the next pass can rule once.
2. A locale with a returning contributor after a gap: A cannot say what they covered; B would require
   the coverage line.
3. A reviewer who edits approved strings: A has no clean-set edit rate to restrict them; B would need a
   seeded set first.

Falsifier: if a review file were created and stayed empty across two translation runs, the queue is not
the bottleneck and the technique is premature here, which is what the single-author clause predicts.

## Verdict

Target (recall and clean-set edit rate per reviewer) and floor (gate verdicts unchanged) cannot be
read: there is exactly zero reviewer data. `unmeasurable`; the instrument that would make it measurable
is one seeded planted-defect set per locale plus a second named reviewer. Return condition: when a
second reviewer's corrections reach a locale catalog. The finding held in the negative: the precondition
the technique's stage clause names is absent, and the tree's own specified queue shows it.
