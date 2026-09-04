---
source: github:Kavex/GameDev-Resources
kind: reference index (tool-directory sub-class) + vendor-repository design read
url: https://github.com/Kavex/GameDev-Resources
title: "GameDev-Resources - A wonderful list of Game Development resources"
author: Kavex + ~50 drive-by contributors (forked from ellisonleao/magictools)
words: 4308 landing / 4245 in-tree README / 144 CONTRIBUTING / 98 PR template
commit: f7c89aae1128fe1ab5f5acaec4c1ab76ee87c7c3 (2026-04-10)
extracted: 10
accepted: 2
declined: 0
leads: 2
already_covered: 3
untriaged: 3
dispatched: 0
applied: 2
shipped: 1
run_id: gamedev-res
siblings: 0 at claim; 1 (kdenlive-0904, phase 4) by Phase 7
fetches_spent: 1 of 3
---

# GameDev-Resources - the list yielded nothing; its link checker yielded two amendments

## Class, and the expected yield said out loud before triage

A **reference index** by the Phase 2c ratio test - 356 outbound links over 4,245
words, roughly one link per twelve words, which is the inversion the lane looks
for. But the lane's machinery assumes references that can *authorize*: papers,
vendor documents, first-party accounts. Enumerated by section, this index is
**~90% product landing pages** - 56 links to 2D engines, 34 to 3D engines, ~90 to
asset and tool sites, 17 to books on a retailer. Those strip to nothing by
construction; "an engine exists and is free" is a proper noun with a price tag.

So the yield was called at **zero from the references**, before any were read, and
zero is what they produced. No wave was cut. Spending a per-reference budget on
356 product pages is the Phase 2c sampling failure wearing different clothes: the
problem is not the sample size, it is that the reference *class* cannot authorize
anything. This is a sub-class the method's table does not name, and naming it is
this run's method lesson.

**Everything below came from the other half of Phase 2b** - the four non-README
files, and twelve years of git history over them. The tree is five files. The
history is 495 commits from 2014-07-17 to 2026-04-10, and it is the source.

## Design record (Phase 2d)

One system: a hand-curated public index plus the CI link gate gnawing at it.

| # | decision | forces | corpus |
| --- | --- | --- | --- |
| 1 | liveness checked by CI on every contribution, not by periodic sweep | 50 drive-by contributors, no maintainer sweep capacity | `quality-gates/gate-liveness` |
| 2 | ambiguous HTTP statuses accepted as alive; only hard failures delete a row | bot-hostile hosts; deleting a curated row is irreversible | `health-checks/three-state-outcomes` models the states - **NONE** for the remediation gating |
| 3 | per-host exemption list, accreted one observed failure at a time, no expiry | some hosts fail even a widened accept list | `conformance-checking/checker-false-positive-discipline` - models it AND predicts its decay |
| 4 | alphabetical order enforced at contribution time | one file, 50 appenders, merge conflicts | weak map - untriaged |
| 5 | a price-tag enum required on every entry, checked in the PR template | cost is the first filter in a tool directory | weak map - untriaged |
| 6 | one flat markdown file: no site, no database | contribution must cost exactly one PR | `agent-instruction-files` neighbourhood - untriaged |
| 7 | the gate is assembled from parts the project does not own, and was decommissioned from outside | a hosted runner, a transport, an upstream checker repo | `gate-liveness` - **NONE** for the absent-observable case |

**Routing count: 2 unhomed decisions in one system, so the run stays in intake and
hands off nothing.** The two NONEs do not share a home (`health-checks` vs
`quality-gates`), so the v2.2 XL trigger does not fire either. A five-file
repository is not a forge job; the count is written here because the method
requires it written before the decision rather than after.

## What landed

**A1 - amendment to `health-checks/three-state-outcomes`: "Remediation semantics
differ per state".** The technique gives render and retry their own per-state
sections and names remediation only in passing - an enumeration one member short.
The missing member is the one with teeth: when the checked population is *content*
rather than infrastructure, `failed` authorizes **deletion of a row**, and the row
carries judgment the checker cannot regenerate. The rule: a destructive remediation
is gated on a stronger predicate than the display verdict - a definitive code
(404/410) plus persistence across runs, never merely non-2xx.

The source is the field instance of the *wrong* fix. Over twelve years this
maintainer moved 401, 403, 405, 429, 502 and 503 into the **success** class, one
commit at a time, each naming the host just wrongly flagged. Individually
reasonable, and it costs the third state: every dead link behind a bot wall is now
permanently certified alive. A source that implements a good idea badly is worth
more than one that implements it well, and this is that.

**A2 - amendment to `quality-gates/gate-liveness`: "When the observable is absence
rather than green".** The trigger section closes "the observable, in every case, is
green." This is the case where it is *nothing*. Three third-party decommissionings
- the runner's free tier, the transport the install line uses, and the checker's own
upstream repository (404 on fetch, 2026-09-04) - produced no commit and no diff. The
config is six years old, well-formed, coherent, and describes a gate that cannot
run. **65 further content commits** were accepted under it. There is no badge and
no required check, so a gate that never runs and a gate that always passes are the
same experience. The technique's standing metric (*time since last red, per gate*)
cannot fire: this gate did not age within the inventory, it left it.

The structural fact nobody designed: the only surviving in-repo evidence the gate
ever ran is its **tuning** - the accept list and the exemption list, both accreted
from real diagnosed failures. Years of careful, specific, hard-won tuning is the
most convincing gate-health signal a reader can find here, and it is configuration
for a program that can no longer be installed.

**Three applications** - two against the source tree (v2), one against this
registry carrying the A/B.

## Already covered (catches)

- **"Distinguish gone from refused"** - owned twice: `three-state-outcomes`
  (verified/failed/unverifiable, naming rate-limiting explicitly) and
  `recruiting/.../node--absent-signal-versus-unavailable-source`, which types
  404-vs-403/429 at a fetch boundary. Only the *remediation* half was missing.
- **The exemption path's design** - `checker-false-positive-discipline` prescribes
  it exactly as built (declared in-repo, stated reason, narrow, reviewable) and
  warns about the missing half. The tree confirms the warning rather than extending
  it.
- **Trigger liveness** - `gate-liveness` already covers uninstalled hooks and
  conditions that never match. Only the administratively decommissioned case, where
  there is no verdict left to audit, was outside it.

## Untriaged (nobody verified these; anchors kept so a later run need not re-derive)

- **Alphabetical order as merge-conflict control.** `CONTRIBUTING.md` and the PR
  template both require it. In a one-file corpus with 50 appenders, alphabetical
  order gives every insertion a deterministic position, which localises conflicts
  instead of piling them all at end-of-file. Plausibly a real mechanism about
  append-only shared files; it maps only weakly and nobody checked it.
- **A required cost enum on every row** (four price glyphs, enforced by the PR
  checklist). A closed vocabulary made mandatory at contribution time so the field
  can never be absent - adjacent to
  `repo-manifest-standard/capability-not-tool-vocabulary`.
- **Flat-file-as-the-whole-product** - no site, no database, no build; plausibly the
  reason 495 commits arrived from 50 people who each showed up once.

## Leads

- **`IGNORECHECK.md` existed for one day** (2016-11-02, added and removed in two
  commits) - a file-based exemption mechanism tried and abandoned in favour of CI
  flags. *Return when* a second source shows a project choosing between in-repo and
  in-config suppression lists; the trade (reviewable in the diff versus co-located
  with the invocation) looks real, and one instance is not enough.
- **The curator's boundary as a stated opinion.** This index admits engines, assets
  and tools and admits almost no *design* material - one link under "Mechanics",
  one under "Story Design", against 90 under engines. *Return when* a second
  game-development index is mined: if the boundary repeats it is corroboration for
  where `game-production`'s craft lane sits, and if it does not, the gap is worth
  more than the references.

## Fetch budget

**1 of 3 spent** - the checker's upstream repository, which returned 404 and is the
load-bearing fact in A2. The ~350 requests the citation sweep made are the
experiment's instrument, not source corroboration.

## Parallel-run notes

Claimed at 0 siblings; `kdenlive-0904` was live at phase 4 by Phase 7, holding
`integration/native-document-format`, `ui-surfaces/undo-history` and
`engineering-process/test-input-generation` - no overlap with the three subjects
this run claimed, and `run-board check` was clear on all targets.

`check-bundles.mjs` is **red in this checkout on 23 problems, all in that sibling's
uncommitted files**, and none in this run's. Per the Phase 7 rule the breakage is
theirs to fix and mine to name. **The index and catalog were deliberately NOT
regenerated**: a regeneration reads the whole working tree, so it would have baked
their half-written subjects into an artifact committed under this run's name. A
stale index is the documented self-correcting state; a committed hash over
somebody's WIP is not.
