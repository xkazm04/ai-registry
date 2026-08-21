---
layer: application
type: application
subject: structured-interview-scorecards
technique: role-family-axis-extension
stack: node
verified_on: 2026-08-20
---

# Industry axes and the three-case coverage enum

`pipeline/jobfit/interview-rubrics.json:86` defines `industryAxes` — extra scored
competencies keyed by role family, appended to whichever base rubric applies:

| Family | Extra axis |
| --- | --- |
| `healthcare_clinical` | Clinical judgment & patient safety |
| `skilled_trades` | Safety & hands-on competence |
| `life_sciences_research` | Scientific rigor |
| `creative_design` | Craft & portfolio depth |
| `operations_logistics` | Operational execution |
| `frontline_service` | Service orientation & reliability |

One axis per family — the standard's "keep the tail short", taken to its
minimum. Extension, not fork: `rubricForArchetype`
(`app/_lib/interview-rubric.ts`) is a concatenation,

```ts
const base = isEarlyCareer(archetype) ? INTERVIEW_RUBRICS.early_career : INTERVIEW_RUBRICS.experienced;
return [...base, ...industryAxesFor(roleFamily)];
```

so the population model (the fork axis) and the family tail (the extension axis)
compose rather than multiply. The module comment states the purpose — "a nurse is
also scored on clinical judgment, a tradesperson on safety, a scientist on rigor
— instead of every workforce getting the same generic axes" — and the additive
property: "An unmapped family contributes nothing, so this is purely additive and
backward-compatible." The Python scorer resolves the same tail from the same JSON
(`automation.rubric_for_candidate`), so what the prompt scores and what the UI
renders cannot diverge.

## The gap enum is three cases because only two are problems

`industryAxesFor` returns `[]` for an absent family, a recognised family with no
axes, and an unrecognised string alike; the empty list then concatenates "leaving
no trace." `RUBRIC_COVERAGE_GAPS` (`interview-rubric.ts:48`) is the distinction
that empty array erased:

- `no_family` — no role family at all, so which axes apply is **unknowable**. A
  genuine gap. Disclosed.
- `family_no_axes` — canonical family, no axes defined. "The base rubric IS the
  intended rubric, not a degraded fallback. Nothing is missing, so nothing is
  said." **Silent by design.**
- `family_unrecognized` — outside the canonical taxonomy: "a typo, a stale
  import, a since-renamed slug." Surfaced quietly.

The comment carries the measurement that forced the split: axes exist for six of
sixteen families, "so disclosing it fired on the MAJORITY of interviews and told
the recruiter something was missing when nothing was. A notice that cries wolf on
most rows trains people to ignore it — including on `no_family`, where it
genuinely matters."

Crucially, "the stamp still records the case (the data stays complete); only the
human-facing noise goes away." Render is a separate list —
`RUBRIC_COVERAGE_DISCLOSED_GAPS = ["no_family", "family_unrecognized"]` — and
`isDisclosedGap` gates the component on it. The message catalog is pinned to
exactly that tuple by set equality (`rubric-coverage-catalog.test.ts`), so "a gap
that must stay silent structurally cannot acquire a string to render."

And the refusal to infer is explicit: "Absent from this list, on purpose: any
notion of a GUESSED family. Nothing here ever infers or defaults a role family to
make a disclosure go away; refusing to invent is the point."

## The vocabulary is not derived from who has axes

`CANONICAL_FAMILIES` comes from `ROLE_FAMILY_SLUGS` (`app/_lib/role-families.ts`),
pinned by set equality to `data/taxonomy.json::role_families` — the same file the
Python taxonomy reads — and "deliberately NOT derived from
`Object.keys(INDUSTRY_AXES)`: that is the very conflation this split exists to fix
(having axes ≠ being a real family)." Without that, every family without a tail
would be indistinguishable from a typo.

`rubricCoverage` also reports what was actually applied rather than asking the
reader to trust it: it returns `axisKeys` — "the industry axes that were genuinely
appended, so a reader can see the coverage rather than trust it" — with
`roleFamily` "the entry's own value, trimmed — never substituted." It is kept
"deliberately SEPARATE from `rubricForArchetype` so the resolved rubric stays
byte-identical to what it has always been."

## Where it falls short of the standard

The industry axes are **description-only**: unlike the six early-career
competencies at `interview-rubrics.json:17-29`, none carries a per-level
behavioural ladder, so `_rubric_line` falls back to the generic
`1=Well below bar … 5=Exceptional` scale for them. That is weakest exactly where
the standard says anchors matter most — the low levels of a safety axis, which
exist to detect the disqualifying behaviour. Clinical judgment and jobsite safety
are currently scored on a generic degree scale.

There is also no stated gate: a family axis contributes as an ordinary rating, so
a disqualifying safety rating is not expressed as a rule about the decision.
