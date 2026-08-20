---
layer: application
type: application
subject: hiring-need-as-structured-brief
technique: promote-readiness-gate
stack: node
status: forged
---

# The promote gate in `app/_lib/intake-brief.ts` (TypeScript, shared server/client)

The gate that decides whether an intake brief can become a published role is
about forty lines, and every one of them is a decision the standard argues for.

## The floor

`briefPromoteBlockers` (`app/_lib/intake-brief.ts:103-113`) returns an ordered
list of what stands in the way, and `briefReadyToPromote` (`:116-118`) is
`blockers.length === 0`. The floor is exactly the standard's two clauses:

```ts
if (!brief.title?.trim()) blockers.push("title");
if (briefDealbreakerEvidence(brief).length === 0 && briefOutcomeEvidence(brief).length === 0) {
  blockers.push("substance");
}
```

The comment states the contract — *"a title plus at least one dealbreaker or a
90-day outcome, in whichever home the dialog recorded it"* (`:112-115`) — and
the blocker type is a two-value union (`"title" | "substance"`, `:101`)
*"ordered as the requestor should fix them; the UI names them on the disabled
button (UAT L2-RC-1 — a gate that refuses without saying why)"*. Nothing here
counts fields, and nothing measures volume.

## Both homes, matched by key only

`:66-76` carries the incident this file exists for, escalated *minor → major*
on its second recurrence: the dialog can put a dealbreaker or a 90-day outcome
in either the graded arrays or a facet, and live, *"the model took the facet
every time: all five recertify sessions stored their hard conditions as facet
prose with `requirements: []`, so a gate reading only the arrays refused briefs
holding nine stated facets and the recertifier had to PATCH the brief over the
API to promote at all."*

That last clause is the standard's argument for the reading half, observed:
the bypass was found and used. The fix is split across both instruments, and
the comment says so explicitly — *"the routing half is fixed in the extraction
contract (`pipeline/jobfit/intake.py`, prompt v2); this is the deterministic
half — read the substance wherever the dialog actually put it."*

The matcher is two key regexes (`:77-78`) — dealbreaker / must-have /
hard-condition / non-negotiable / requirement, and success-90 / first-90 /
90-day / outcome — applied in `facetsMatching` (`:80-85`) to `f.key` alone,
under a one-line rule that is the whole reason it stays deterministic:
*"Keys only: facet labels are free localized prose and would match by
accident."* Both evidence functions put the structured home first
(`briefDealbreakerEvidence`, `:87-90`: graded rows, then facets), so a
downstream consumer reading the list gets the real requirements at the top.

## The same brief, grounding the next stage

`briefIntentSummary` (`:49-64`) shows what the gate is protecting: the promoted
brief is injected into the candidate-interview agent as internal grounding —
success criteria, the stated dealbreakers, urgency — with the instruction to
*"weigh answers against this intent and probe the dealbreakers naturally"*. It
returns `null` when the brief carries neither musts nor success criteria,
which is the same floor expressed as a refusal to ground on nothing.

This is why a brief whose conditions live only in facet prose is not a
cosmetic problem: the interview loop reads the arrays. The gate's safety net
covers the gate; nothing covers the panel, the rubric, or this grounding line.

## Where the repo falls short of the standard

The gate is enforced at the interface (the disabled promote control) and by
these shared predicates, but there is no override path of the kind the standard
asks for — an explicit, attributed decision to open an underdefined role. In
practice the escape hatch was the API patch the recertifier reached for, which
is precisely the unattributed bypass. The standard's rule stands: give the
override a door with a name on it, so that choosing to open a thin role is a
recorded decision rather than a workaround.
