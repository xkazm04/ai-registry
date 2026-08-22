---
domain: software-engineering
last_swept: 2026-08-22
layout: nested
demand_known: false
---

# Software engineering

Coverage note for the `software-engineering` bundle. Part of [[index]]; graded against
[[standard]].

## Shape at the last sweep (2026-08-22)

| | |
| --- | --- |
| Subjects | 142 |
| Techniques | 876 |
| Applications | 351 |
| `use_when` written | 876/876 |
| Version witness (`verified_against`) | 36/351 |
| Expired applications | 0 |
| At-risk applications | 0 |
| Never swept | 121/142 |
| Attention points | 521 |
| Cap breaches | none - every level is under ten, top level still at nine |

These are a record of this sweep, not an input to the next one. Recompute with
`node scripts/librarian-scan.mjs --domain software-engineering`.

## What changed

[[2026-08-22-2]] was a harvest wave: 10 read-only scouts over one repository's 56
contexts, then 20 subject-workers - 14 new subjects and 6 extensions. It added a
fifth subcategory under `ui-surfaces` (`published-surfaces`, five founding subjects)
and left the top level at nine categories, deliberately, so the bundle keeps its
headroom for a genuinely new category later.

**Version witness moved 0 -> 36.** That line had read zero since the bundle was
founded. Every application this wave wrote carries the runtime major it was checked
against, except two `sql` applications whose author declined to guess one.

## What is owed

- **a second stack for 79 subject(s) - up from 67, and the wave is why.** A founding
  wave necessarily manufactures this debt: a subject reconciled against one tree has
  one stack, and 14 new subjects arrived with exactly one each. Two were retired in
  the same wave (`motion` react -> +node, `hitl-approval` rust -> +react), so the
  net is +12. This is arithmetic, not a regression, but it is the bundle's largest
  structural debt and a harvest makes it larger. The next pass that reduces it is a
  transplant pass, not another harvest.
- a reporting installation - demand for every subject here is UNKNOWN, not zero
- a maturity signal - all 142 documents say `forged`; nothing has ever been
  reconciled or transplant-tested, and nothing may self-promote
- 121 subjects have never been swept by the librarian

## Instrument repair, this sweep

The `neverSwept` clause read `last_swept` from subject notes. Subject notes are
written with `last_touched` (the vault's own documented shape), and nothing anywhere
wrote `last_swept` into one. So the clause scored every subject in the registry, and
could never stop: 3 points x the whole corpus, dominating the ranking it existed to
inform. Twenty fresh subject notes moved the count by zero, which is what exposed it.

Fixed in `scripts/librarian-scan.mjs` to accept either spelling. Effect: never-swept
142 -> 121, attention 584 -> 521, and `retry-backoff` - swept by the pilot two days
earlier and carrying a note ever since - registered as swept for the first time.

Same failure family as the `use_when` counter that once reported 0/267 over a corpus
at 267/267: a reader asking for a shape no writer emits, answering plausibly and
wrongly, with nobody able to tell from the number alone.

## Highest attention at the last sweep

Every subject at the top is there for the same two reasons, and both are structural
rather than qualitative:

- **data-access**, **embedded-db**, **migrations**, **sync-replication**,
  **observability-telemetry**, **self-healing** (5 each) - single stack (rust), never
  swept.

Nothing scored for an expired clock, a missing `use_when`, or a thin technique set.

## Dispatched

[[2026-08-22-2]] - the harvest wave above. 14 new subjects, 6 extensions, 97 new
techniques, 34 new applications, all gate-clean.

[[2026-08-22-1]] - one subject reconciled against an external world-class tree; the
pilot of that lane.

[[2026-08-21-2]] - 633 techniques, one systematic pass, every proposal read before it
was applied. The first bulk-model work this registry has accepted.

## Declined

- **Ten proposed laws, all banked, none minted.** Every one of the twenty workers
  proposed at least one, and three cited sightings in subjects outside their own.
  The bar is cross-domain recurrence; every sighting was inside this one domain.
  They are recorded per subject with their evidence.
- **Widening `count-carries-predicate` from counts to claims.** The statement change
  is defensible and well-evidenced. The anchor's NAME would then be narrower than its
  scope, and that anchor is cited by 282 files - renaming it is a deliberate change
  with its own review, not a wave-end edit.
- **Extending `agent-memory`.** It was proposed as a debt retirement on the strength
  of the 2026-08-21 domain note. The scan showed it already carried two stacks and
  already stood at nine techniques, the observed house ceiling. Dropped from the wave
  and re-banked as a NEW subject candidate instead; the slot went to `hitl-approval`,
  which the scan confirmed genuinely was single-stack.
- **`machine-enforced-house-rules`** (an extension to `quality-gates`). Strong
  material, declined for concurrency: another session was writing that subject in the
  main checkout while this wave ran. Two workers on one subject folder is the
  collision the one-worker-per-subject rule exists to prevent.
