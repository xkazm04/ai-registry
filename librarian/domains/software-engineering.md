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
| Techniques | 893 |
| Applications | 361 |
| `use_when` written | 893/893 |
| Version witness (`verified_against`) | 37/361 |
| Expired applications | 0 |
| At-risk applications | 0 |
| Never swept | 112/143 |
| Attention points | 488 |
| Cap breaches | none - every level is under ten, top level still at nine |

These are a record of this sweep, not an input to the next one. Recompute with
`node scripts/librarian-scan.mjs --domain software-engineering`.

**These numbers are the merged tree, not any one lane's own.** Several waves ran against
this bundle on the same day from different branches - an external-reconcile wave
[[2026-08-22-2]], a research pass [[2026-08-22-3]], a harvest [[2026-08-22-4]] and a
backend-refactor harvest that landed while the harvest branch was open - and each measured
a shape the others could not see. A figure taken from any single branch is wrong now, and
the count moved three times between this note being written and the merge landing. That is
the argument for the vault's standing rule in one day's evidence: **record what a run DID,
and recompute every number from the scan.**

## What changed

[[2026-08-22-4]] was a harvest: 10 read-only scouts over one repository's 56 contexts,
then 20 subject-workers - 14 new subjects and 6 extensions. It added a fifth subcategory
under `ui-surfaces` (`published-surfaces`, five founding subjects) and left the top level
at nine categories, deliberately, so the bundle keeps headroom for a genuinely new one.

The external-reconcile and research lanes ran alongside it, clearing single-stack
subjects against world-class trees and adding `module-design`. (Correction, same
day: the run ids in this paragraph's first draft pointed at the wrong notes -
`runs/2026-08-22-2` through `-8` are the reconcile lane's waves and cycles, and
the harvest described above carries no run note of its own yet. Corrected rather
than left, because a vault whose links misattribute its own history is worse
than one with a visible patch.)

**Version witness moved 0/311 -> 37/357.** That line had read zero since the bundle was
founded. The harvest wrote the runtime major for every application it produced except two
`sql` ones whose author declined to guess; the reconcile lane contributed the rest.

[[2026-08-22-9]] - the fifth reconcile wave: Tailscale (peer-state-honesty),
Argo Workflows (conditional-edges), OPA (failure-direction) and containerd
(termination-and-reaping). Twenty-one single-stack debts cleared across the
lane's six runs; two law questions triggered in one wave (opt-in-guard at four
sightings, unknown-is-not-a-value at four).

[[2026-08-22-11]] - the sixth reconcile wave, and the lane's pivot: with the
rust backlog nearly drained, react subjects now earn their second stack from
framework-agnostic cores (TanStack query-core, Style Dictionary) beside two go
trees (restic, n8n's agent module). Twenty-five single-stack debts cleared
across seven runs; the one-mechanism-or-two-that-agree family reached three
sightings.

## What is owed

- a second stack for the ~44 single-stack subjects the last scan showed - the
  lane has cleared twenty-one; the harvest added new single-stack subjects, so
  recompute before the next wave
- a reporting installation - demand is still UNKNOWN, not zero
- the maturity ladder - everything still says `forged`
