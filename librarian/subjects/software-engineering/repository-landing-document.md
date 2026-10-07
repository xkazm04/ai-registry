---
subject: repository-landing-document
domain: software-engineering
last_touched: 2026-10-07
dry_streak: 0
---

# repository-landing-document

First touch: [[2026-09-01-slideops-readme]]. Class: NEW SUBJECT.

## State

Forged from zero: golden path + 7 techniques + 2 applications, in
`engineering-process/codebase-stewardship` (flat subcategory, appended as its
8th subject; link depths identical to its sibling `docs-sync`).

`research-map` returned no prior art for `readme` at all. That empty was not
trusted on its own — the four nearest neighbours were opened first, and each
turned out to own a different artifact: `docs-content-model` a docs *site*,
`docs-sync` freshness rather than form, `machine-authored-documentation`
model-authored acceptance, `markdown-vault` markdown as a database. The gap was
real and subject-sized.

## What the subject decided that the spec left open

Three of the drafter's overrides are load-bearing and should not be re-litigated:

- **A word cap is the wrong instrument.** The spec proposed one; the subject
  replaced it with a population test whose countable form is a *ratio* — the
  front page holds fewer words than the pages it routes to, both on the same
  counter, same day. This is repo-kind-independent, where a cap picked from a
  sample of one is not.
- **A figure is not mandatory.** The cadence rule asks for a non-prose
  *element* — figure, worked example, table or callout. An earlier instrument
  demanded a figure and reported six projects defective for a rule the subject
  does not make.
- **Multi-surface degradation is the subject's defining constraint, not an open
  question.** Promoted out of `input-channel-distinction` into its own technique
  because it otherwise leaks into three.

## The measurement, and the counter that produced it

Every threshold in `visual-text-cadence` was argued against a survey of seven
landing documents on 2026-09-01, on `scripts/check-readmes.mjs`.

**The break set is load-bearing and the numbers move with it.** A draft counter
admitting paragraph breaks and bare headings read the fleet's worst run at 39
lines; the rule's own closed break set reads the same documents at 96. The
subject's cited distribution (10, 19, 20, 20, 22, 90, 96) is the corrected one.
Anyone re-measuring must use the closed set or they are counting something else.

The reference repository fails this subject's rules three times — 3 of 7 badges
link to targets that cannot go red, two sections fail the population test, and
its prose run is 19 against a limit of 15. That is recorded in the subject as a
teaching surface rather than hidden. A reference that passed every rule it
inspired would be evidence the rules had been fitted to it.

## Applied

**gravity**, mode `experiment`, verdict `better` — findings 3 -> 0 on one
instrument (words 2,089 -> 581, routed 0 -> 7, prose run 90 -> 8). Capped at
`experiment` rather than `code` by foreign WIP in that tree's README, not by
authorization.

## 2026-10-07 — widened: host metadata

Caller named the subject directly for a gap it had never claimed: the
repository host's own description, topics, homepage field and social
preview image — fields a package registry, a topic page or a social unfurl
reads directly and that are never derived from the landing document at all.
Checked first against `multi-surface-degradation`'s existing "fill the
field" clause and found it insufficient on inspection: that technique
governs *degraded rendering of the landing document's own content* across
render tiers, where the About-box fields have no fallback relationship to
the README — they are blank by default and stay blank, which is
`absent-guard-is-loud` rather than a degradation.

Landed **host-metadata-is-a-second-document** (8th technique). Golden path's
`techniques:` list, "the seven walls" (now eight), and the technique index
all updated in the same change. `verified_on: 2026-10-07`. No corpus claim
was corrected — this is new-technique growth, not a repair.

Propagated: `build-knowledge-rules.mjs` + `build-registry-map.mjs` run;
8 project `.ai/registry-map.json` already joined to this subject
re-digested and committed on their own active branches (none pushed):
gravitone-gcloud `d013b6e`, goat `612f393`, politicas `e92d861`, personas
`8ee7677`, kp `fc4a24f`, personas-web `e339279`, ascent `f36116c`,
athena-everywhere `f748990`. pof, systedo-case and gigs are Wolf-only
checkouts, unreachable from this machine — their maps are stale until a
Wolf-side pass regenerates them.

No apply row: this technique's claim (keep host metadata in sync with the
README) has no code seam to exercise in any connected project — it is a
settings-panel discipline, not a behavior a test can observe. Recorded as
`unapplied`; return condition: the next time any connected project's
landing document is rewritten, check its host metadata in the same pass
rather than opening a separate finding.

## Open leads (banked, with return conditions)

- **Nobody measured what the publishing surfaces actually strip.**
  `multi-surface-degradation` names a four-tier render ladder by reasoning, not
  by observation. Return condition: a run with an unspent fetch budget whose
  source touches package-registry or marketplace rendering. One fetch, factual
  answer.
- **The instrument encodes only three of seven techniques.**
  `check-readmes.mjs` checks routing, cadence, badge evidence and captions.
  `multi-surface-degradation`, `input-channel-distinction` and
  `style-rule-ships-its-detector` have no detector — which the subject's own
  closing technique says is the state that turns a rule into decoration. Return
  condition: the next run that touches this subject.
- **The fleet is measured but unrepaired.** Six landing documents still fail; one
  project has none at all. Return condition: operator authorization to land the
  arm-B rewrites, gravity's first (it is written and measured, waiting only on
  that tree's in-flight work to be committed).
