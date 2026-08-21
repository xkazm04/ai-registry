---
domain: software-engineering
last_swept: 2026-08-21
layout: nested
demand_known: false
---

# Software engineering

Coverage note for the `software-engineering` bundle. Part of [[index]]; graded against
[[standard]].

## Shape at the last sweep (2026-08-21)

| | |
| --- | --- |
| Subjects | 126 |
| Techniques | 768 |
| Applications | 311 |
| `use_when` written | 768/768 |
| Version witness (`verified_against`) | 0/311 |
| Expired applications | 0 |
| Never swept | 126/126 |
| Attention points | 520 |
| Cap breaches | none - every level is under ten |

These are a record of this sweep, not an input to the next one. Recompute with
`node scripts/librarian-scan.mjs --domain software-engineering`.

## What is owed

- an application for 2 subject(s): docs-sync, p2p-networking
- a second stack for 65 subject(s) - the transplant claim is untested at one
- a reporting installation - demand for every subject here is UNKNOWN, not zero
- a maturity signal - all 126 documents say `forged`, nothing has ever been reconciled or transplant-tested

`use_when` is no longer on this list. It was the largest gap in the bundle for two
sweeps; [[2026-08-21-2]] closed it at 768/768. What remains needs something that has
read a real codebase, which is why none of it is a bulk-model job.

## Highest attention at the last sweep

- **docs-sync** (9) - no application — never reconciled against real code; never swept by the librarian
- **p2p-networking** (9) - no application — never reconciled against real code; never swept by the librarian
- **data-access** (5) - single stack (rust); never swept by the librarian
- **embedded-db** (5) - single stack (rust); never swept by the librarian
- **migrations** (5) - single stack (rust); never swept by the librarian

## Dispatched

[[2026-08-21-2]] - 633 techniques, one systematic pass, every proposal read before it was
applied. The first bulk-model work this registry has accepted. Its four incidents are
recorded there rather than here, because three of them changed a script and one changed
a prompt, and the next run needs the scripts more than the story.

## Declined

Nothing yet.
