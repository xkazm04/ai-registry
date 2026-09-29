---
layer: application
type: application
subject: executive-reporting
technique: denominator-naming
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
---

# When the denominator is zero the average is a division guard, not a grade

`ascent`'s executive briefing had already been through one round of
denominator repair (the subset-beside-superset lines in the
[bad-news-labelling application](./process--bad-news-labelling.md)). The next
round, in September 2026, found the same failure one level down: the
*average itself* was computed over a narrower population than the count printed
beside it, and when that population was empty the average still printed.

## The defect, from the commit that fixed it

The org rollup's average scores are means over the **live-scored** repositories
(`realScoredCount`); a repository whose only score is a mock placeholder is
scanned but not scored. The rollup documents that when that denominator is 0
the average is *"a division guard (0), NOT a grade, and every renderer must
land on its no-score path."* Nothing downstream honoured it. The briefing
guarded on the scanned count alone, so an all-mock fleet produced an overall
of 0, mapped to level L1, and four surfaces printed a confident grade — the PDF
tile, the tab, the markdown (*"0/100 (L1 Ad-hoc)"*) and the generated
narrative (*"stands at 0/100 overall"*) — for a fleet that had never been
measured. Every basis clause beside those numbers quoted the scanned count, so
the denominator was also overstated by exactly the mock count.

## What the fix does

- **The basis travels as fields.** `ExecBriefing` carries `realScoredCount`
  and `mockCount` straight from the rollup, and `priorPeriod` carries the prior
  window's own denominator — technique step 1, made structural.
- **One definition per clause.** `briefingHasScore` (`briefing-format.ts:181`)
  is `realScoredCount > 0`; `scoreValue` (`:186`), `briefingLevelCaption`
  (`:192`), `noScoreLine` (`:198`), `scoreBasisLine` (`:206`), `mockDisclosure`
  (`:219`) and `coverageLine` (`:227`) are the only places that phrase it, so
  the PDF, the tab, the markdown and the narrative cannot disagree. Where no
  score exists the page says *"No live-scored repositories in this period —
  every scanned repository's latest score is a mock placeholder, so no fleet
  average can be stated."* — a reason in place of the number.
- **A comparison against a guard is not a comparison.** A prior window with
  nothing live-scored yields no delta at all: *"a delta against a division
  guard is a fabricated movement."* A sibling fix (`92129579`) stopped
  fabricating a 0 prior for individual dimensions the last window never scored,
  and a goal fix (`fb0c8ccd`) made an unmeasured goal metric read `null` with
  a third `unmeasured` progress basis and a *"not measured yet, target N"* line
  — previously a goal on a dimension never scored read as standing at 0, drew
  an empty meter, and flipped an achieved goal back to active.
- **The clause names the set the figure is drawn from — not a uniform set.**
  `valueRealizedLine` and `movementLine` were re-based to *"across N
  live-scored repos"* and *"(of N live-scored)"*. `nextMoveLine` deliberately
  was **not**: a recommendation's `repoCount` is counted over every scanned
  repository, mock-floored ones included, so re-basing it would print
  *"6 of the 4 live-scored repositories"*, arithmetically impossible copy. The
  rule is per-figure provenance, and a blanket "use the live denominator"
  refactor would have introduced the very error it was meant to remove.

## Mapping to the technique

Confirms *carry the basis as fields, render it in the same unit*, *two
populations on one page say so at each*, and *a suppressed comparison prints its
reason*. It adds the two conditions the technique's decision rules now state:
an average over an empty population is a guard value that needs its own render
path (the failure survives review because the number is a legal score), and the
denominator of each figure is the one *that figure* was computed over.

The same digest that fingerprints a shared briefing includes both counts
(see the [share-link application](./node--expiring-share-links.md)), which is
this technique applied to the *equality claim* "figures unchanged": a changed
denominator with an unchanged headline is a changed report.
