---
layer: application
type: application
subject: hiring-need-as-structured-brief
technique: promote-readiness-gate
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
---

# The promote gate in `app/_lib/intake-brief.ts` (TypeScript, shared server/client)

The gate that decides whether an intake brief can become a published role is
about forty lines, and every one of them is a decision the standard argues for.
Re-read on 2026-09-29 against kp `8a44493f7`; every line citation below moved
since the 2026-08-20 reading.

## The floor

`briefPromoteBlockers` (`app/_lib/intake-brief.ts:147-155`) returns an ordered
list of what stands in the way, and `briefReadyToPromote` (`:160-162`) is
`brief !== null && briefPromoteBlockers(brief).length === 0`. The floor is
exactly the standard's two clauses:

```ts
if (!brief.title?.trim()) blockers.push("title");
if (briefDealbreakerEvidence(brief).length === 0 && briefOutcomeEvidence(brief).length === 0) {
  blockers.push("substance");
}
```

The comment states the contract — *"a title plus at least one dealbreaker or a
90-day outcome, in whichever home the dialog recorded it"* (`:157-159`) — and
the blocker type is a two-value union (`"title" | "substance"`, `:142-145`)
*"ordered as the requestor should fix them; the UI names them on the disabled
button (UAT L2-RC-1 — a gate that refuses without saying why)"*. Nothing here
counts fields, and nothing measures volume.

The gate is enforced on the server as well as the interface:
`app/api/intake/[id]/promote/route.ts:34` refuses with
`INTAKE_BRIEF_NOT_READY` before anything is built.

## Both homes, matched by key only

`:110-120` carries the incident this file exists for, escalated *minor → major*
on its second recurrence: the dialog can put a dealbreaker or a 90-day outcome
in either the graded arrays or a facet, and live, *"the model took the facet
every time"*, so a gate reading only the arrays refused briefs holding nine
stated facets and *"the recertifier had to PATCH the brief over the API to
promote at all."*

That last clause is the standard's argument for the reading half, observed:
the bypass was found and used. The fix is split across both instruments, the
routing half in the extraction contract and this deterministic half, which
reads the substance wherever the dialog actually put it.

The matcher is two key regexes (`:121-122`) — dealbreaker / must-have /
hard-condition / non-negotiable / requirement, and success-90 / first-90 /
90-day / outcome — applied in `facetsMatching` (`:124-128`) to `f.key` alone,
under the rule that keeps it deterministic: *"Keys only: facet labels are free
localized prose and would match by accident."* Both evidence functions put the
structured home first (`briefDealbreakerEvidence`, `:131-134`), so a
downstream consumer reading the list gets the real requirements at the top.

## The same brief, grounding the next stage

`briefIntentSummary` (`:93-108`) injects the promoted brief into the
candidate-interview agent as grounding. Since 2026-08-21 (`31a287e95`) it
reads the same two-home evidence functions as the gate (`:95-96`), so the
interviewer, like the gate, now sees conditions that landed as facets. The
2026-08-20 reading said the interview loop read only the arrays. That is no
longer true.

The role rubric added on 2026-09-14 (`app/_lib/role-rubric.ts`, frozen at
promotion) reads the arrays plus `core` facets. A dealbreaker stored as a
non-core facet satisfies the gate and still gives the rubric no axis. The
technique's "structured entry still wins and still must exist" is the rule
that protects this consumer.

## Where the repo falls short of the standard

- **The gate does not read the basis.** `briefMustSkills` filters on
  `r.kind === "must_have"` alone (`:12`), and `facetsMatching` on a value and a
  key (`:126`). An unreviewed `inferred` dealbreaker facet satisfies the floor,
  and so does a `default`-basis row. The technique says "the gate counts
  `stated` content, and inferred content only where a human has reviewed it."
- **The rubric's blocking cell does not read it either.** `blocking` is
  `r.kind === "must_have" && r.hardness === "prerequisite"`
  (`role-rubric.ts:147`, mirrored at `pipeline/jobfit/rolerubric.py:212`),
  and a blocking axis may end a candidacy on its own. The coercers filled a
  missing or off-vocabulary hardness with `prerequisite`, so every ungraded
  row became a blocking axis nobody chose. **Fixed in kp `8a44493f7`** (local,
  not pushed): the fallback is now `learnable` on both the model path and the
  edit path. A red-first test turned 3 of 3 blocking rows into 1 of 3, the
  explicitly graded one. Provenance-aware blocking was simulated, not changed.
  It would re-version every derived rubric (ADR-0012), and the choice belongs
  to the owner.
- **No attributed override, and the PATCH door is still open.** The server
  enforces the gate, but `promote/route.ts:40-41` documents the path
  *"POST /api/intake → PATCH /brief (a client-supplied brief passes the
  ready-to-promote gate) → POST /promote"*. An API PATCH can add a facet
  claiming `stated`, which the edit rule honours unless it would regress a
  stored `stated` (`brief-edit.ts:89`). Nothing records who did it:
  `role_intakes` has no actor column. The `intake_promoted` and
  `intake_brief_changed` event kinds are declared, but only `intake_round` is
  ever written. The standard's rule stands: give the override a door with a
  name on it.
- **Promotion has a window.** `markIntakePromoted` updates with no status
  check. The route awaits between reading the brief and marking it promoted,
  so a PATCH landing in that window would be frozen while the job description
  and rubric are built from the older copy. This is read from the code; the
  race was not executed.
