---
domain: software-engineering
last_swept: 2026-08-22
layout: nested
demand_known: false
---

# Software engineering

Coverage note for the `software-engineering` bundle. Part of [[index]]; graded against
[[standard]].

## Shape at the last sweep (2026-08-22, after the harvest merge)

| | |
| --- | --- |
| Subjects | 143 |
| Techniques | 890 |
| Applications | 357 |
| `use_when` written | 890/890 |
| Version witness (`verified_against`) | 37/357 |
| Expired applications | 0 |
| At-risk applications | 0 |
| Never swept | 112/143 |
| Attention points | 488 |
| Cap breaches | none - every level is under ten, top level still at nine |

These are a record of this sweep, not an input to the next one. Recompute with
`node scripts/librarian-scan.mjs --domain software-engineering`.

**These numbers are the merged tree, not either lane's own.** Two waves ran against this
bundle on the same day from different branches - an external-reconcile wave [[2026-08-22-2]]
and a harvest [[2026-08-22-4]] - and each measured a shape the other could not see. A
figure taken from either branch alone is wrong now.

## What changed

[[2026-08-22-4]] was a harvest: 10 read-only scouts over one repository's 56 contexts,
then 20 subject-workers - 14 new subjects and 6 extensions. It added a fifth subcategory
under `ui-surfaces` (`published-surfaces`, five founding subjects) and left the top level
at nine categories, deliberately, so the bundle keeps headroom for a genuinely new one.

[[2026-08-22-2]] and [[2026-08-22-3]] ran the external-reconcile and research lanes
alongside it, clearing four single-stack subjects against world-class trees and adding
`module-design`.

**Version witness moved 0/311 -> 37/357.** That line had read zero since the bundle was
founded. The harvest wrote the runtime major for every application it produced except two
`sql` ones whose author declined to guess; the reconcile lane contributed the rest.

## What is owed

- **a second stack for 76 subject(s).** Two forces ran against each other this day: the
  external-reconcile lane retired four, and the harvest manufactured fourteen, because a
  subject reconciled against one tree has one stack. Net across both lanes the figure
  moved from 60 to 76. **A harvest grows this debt and only a transplant pass pays it
  down** - worth stating plainly rather than netting away, because the two lanes pull in
  opposite directions and the arithmetic is invisible from either lane's own report.
- a reporting installation - demand for every subject here is UNKNOWN, not zero
- a maturity signal - all 143 documents say `forged`; nothing has ever been reconciled or
  transplant-tested, and nothing may self-promote
- 112 subjects have never been swept by the librarian

## Structure finding: three subjects are over the observed ceiling

`rate-limiting`, `hitl-approval` and `agent-memory` now carry **ten** techniques each. No
gate checks this, and none of the waves was wrong: each respected the observed house
maximum of nine in isolation, and two of the three were extended by two different waves on
the same day that could not see each other.

That is the finding, and it is structural rather than qualitative. The next structure pass
should decide whether nine is a real bar worth enforcing in `check-bundles.mjs` or an
observation that has been overtaken - and if it is real, which technique in each of the
three is a section of another rather than a technique of its own. Deciding by attrition,
one wave at a time, is how a ceiling stops meaning anything.

## Instrument repair, this sweep

The `neverSwept` clause read `last_swept` from subject notes. Subject notes are written
with `last_touched` (the vault's own documented shape), and nothing anywhere wrote
`last_swept` into one. So the clause scored every subject in the registry and could never
stop: 3 points x the whole corpus, dominating the ranking it existed to inform. Twenty
fresh subject notes moved the count by zero, which is what exposed it.

Fixed in `scripts/librarian-scan.mjs` to accept either spelling. Effect on the merged
tree: never-swept 143 -> 112, attention 604 -> 488, and every subject note either wave
wrote - including `retry-backoff`, carried since the pilot - registered for the first
time.

Same failure family as the `use_when` counter that once reported 0/267 over a corpus at
267/267: a reader asking for a shape no writer emits, answering plausibly and wrongly,
with nobody able to tell from the number alone.

## Highest attention at the last sweep

Every subject at the top is there for the same two reasons, both structural:

- **observability-telemetry**, **self-healing**, **webhook-ingestion**,
  **admission-queue**, **concurrency-guards**, **job-coordination** (5 each) - single
  stack (rust), never swept.

Nothing scored for an expired clock, a missing `use_when`, or a thin technique set.

## Dispatched

[[2026-08-22-4]] - the harvest. 14 new subjects, 6 extensions, 97 new techniques, 34 new
applications, all gate-clean.

[[2026-08-22-3]] - the research lane.

[[2026-08-22-2]] - four subjects reconciled in parallel against golang-migrate, SQLite,
Litestream and Prisma; the reconcile lane's first wave.

[[2026-08-22-1]] - one subject reconciled against an external world-class tree; the pilot
of that lane.

[[2026-08-21-2]] - 633 techniques, one systematic pass, every proposal read before it was
applied. The first bulk-model work this registry has accepted.

## Declined

- **Ten proposed laws, all banked, none minted.** Every one of the harvest's twenty
  workers proposed at least one, and three cited sightings in subjects outside their own.
  The bar is cross-domain recurrence; every sighting was inside this one domain. They are
  recorded per subject with their evidence.
- **Widening `count-carries-predicate` from counts to claims.** The statement change is
  defensible and well-evidenced. The anchor's NAME would then be narrower than its scope,
  and that anchor is cited by 282 files - renaming it is a deliberate change with its own
  review, not a wave-end edit.
- **Extending `agent-memory`.** Proposed as a debt retirement on the strength of the
  2026-08-21 note; the scan showed it already carried two stacks and stood at the ceiling.
  Dropped and re-banked as a NEW subject candidate. The merge vindicates the call - another
  lane added to it the same day, and it now stands at ten.
- **`machine-enforced-house-rules`** (an extension to `quality-gates`). Strong material,
  declined for concurrency alone: another session held that subject in the main checkout
  for the harvest's duration.
