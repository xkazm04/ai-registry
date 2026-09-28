---
layer: application
type: application
subject: candidate-archetype-routing
technique: conservative-default-and-the-unrouted-state
stack: node
status: forged
verified_on: 2026-09-26
verified_against: node@24
applied: simulation
ab_verdict: better
---

# The `unknown` sentinel, and the two safe directions kept apart

This repo separates the standard's two answers exactly: an unclassifiable candidate keeps
an honest **`unknown`** archetype on the wire and is scored on the **neutral experienced**
weights. The class is never rewritten to match the rubric.

Re-verified 2026-09-26 against the tree's main at `cf9a4b81c`. Line numbers moved since
the 2026-08-20 reading, and one shortfall recorded then has since been fixed (below).

## The sentinel is stamped where the class is missing, not resolved away

`app/_lib/match-candidate.ts:71-77` builds the candidate payload for the Python matcher.
Where the analysis produced no routed archetype, it passes a sentinel rather than a guess:

```ts
// Real archetype from the v2 profile when present. When it's missing
// (v2Profile.archetype is best-effort and can be null), pass an explicit
// "unknown" sentinel rather than silently collapsing to "bau" — "bau"
// would apply the seniority KO floor and strip the fairness shield from a
// student/switcher. The Python ko_filter fails closed on "unknown"
// (no seniority auto-KO) and weights_for falls back to neutral BAU weights.
archetype: payload?.v2Profile?.archetype ?? "unknown",
```

That comment is the technique in five lines: the *scorer* falls back to the experienced
weights (`pipeline/jobfit/matching.py:923-924`,
`WEIGHTS.get(archetype, WEIGHTS["bau"])`), the *record* stays `unknown`, and the knockout
filter fails closed. Two consumers, two different safe directions, one honest value.

`app/_lib/candidate-pool.ts:73` repeats it for legacy analyses with no v2 profile —
`archetype: "unknown"`, with a comment at 68-72 explaining that "bau" ("Experienced")
"both mislabels the candidate and — being NOT fairness-protected — strips the fail-closed
shield downstream". Its test (`app/_lib/candidate-pool-tenancy.test.ts:77`) asserts the
value with the reason in the message: "the fallback is the honest sentinel, not 'bau'".

The degraded-intake path now agrees. `app/_lib/apply.ts:73` is
`export const FALLBACK_ARCHETYPE = "unknown";`, changed from `"bau"` on 2026-08-21, the
day after the first reading, with a docstring at 60-72 that states the standard's
argument in the tree's own words: "bau" "was never the neutral choice it looked like: it
is a CONCRETE class ... persisting it on a record that asserts nothing was read strips
the early-career fairness shield".

## Display renders the unknown as unrouted, and never as a class

`app/_lib/archetypes.ts:97-107` is the display boundary:

```ts
export function archetypeDisplayKey(archetype: string | null | undefined): string {
  return isKnownArchetype(archetype) ? normalizeArchetype(archetype) : "unrouted";
}
```

Its docstring ends "The wire value stays canonical; only the shown label changes". That
is the standard's *widen the type, do not narrow the value*.

The two predicates sit adjacent with their opposite defaults documented as deliberate:
`isFairnessProtected` at 109-115 ("an unknown one (fail closed — we never auto-reject a
class we cannot classify)") and `isEarlyCareer` at 117-123 ("this treats unknown as NOT
early — it drives display grouping and encouraging copy, not a safety gate, so it must
not over-claim"). Both key off `normalizeArchetype` (77-79), which trims and lower-cases.

`app/_lib/archetype-display.test.ts:43` iterates `null`, `undefined`, `""`, `"unknown"`,
`"not_a_real_archetype"` and `"  UNKNOWN  "` and asserts each displays as `unrouted`.
The shield assertion is narrower than the 08-20 reading said: the test at 55-62 checks
`isFairnessProtected` for `null`, `"unknown"` and `"mystery_class"` only, not all six.

## The confidence side: the unguided default trips review by construction

The Python detector never returns an `unknown` id — `pipeline/jobfit/registry.py:323-327`
returns the registry's `defaultArchetype` (`bau`) at `defaultConfidence` (0.4) with the
`default` reason code when no signal fires. With `lowConfidenceThreshold: 0.55`
(`archetypes.json:63-64`), that routing is always flagged, and `signals_absent`
(`registry.py:154-160`) marks the no-signal branch distinctly from a contested one. Its
one consumer, `pipeline.py:1625`, turns it into a per-candidate warning.

## Where this falls short of the standard

- **The Python policy pass collapses a missing archetype into the experienced class.**
  `pipeline/jobfit/automation.py:968` reads `archetype = entry.get("archetype") or "bau"`,
  and 976 keys the shield on `archetype in _EARLY_CAREER`. So the pass can emit a reject
  for a null or `unknown` archetype below the reject score. It is caught one layer up:
  `app/_lib/automation-fairness.ts:52` re-checks every reject with `isFairnessProtected`
  and refuses it, failing closed. That is the defence in depth the standard asks for, and
  it is also the exact shape the standard warns about: a convenience default at a read
  site that is harmless only while the second layer runs.
- **The fallback score enters every mixed ordering as though it were routed.** An
  `unknown` candidate is scored on the experienced weights and then sorted with everyone
  else: in the recruiter list (`pipeline/jobfit/recruiter.py:129`, one flat sort), against
  the shared pool-fit floor (`app/features/library/jobs/jobsRecruiterCandidatesLogic.ts:158`,
  `c.result.total >= FIT_PROMISING_FLOOR`), and in the screening wave's worst-first sort
  (`app/_lib/screen-wave.ts:188`). The wave's reject is shielded, but a placeholder score
  that understates the candidate still decides whether the rediscovery floor surfaces
  them at all.
- **Nothing alarms on the unrouted rate.** `signals_absent` feeds a per-candidate warning
  and no aggregate.

## Applied

Simulation, 2026-09-26, against the corrected step 3 (the fallback score is a
placeholder that stays out of every ranking, floor and cut). The three real surfaces
above, walked for one `unknown` candidate under both rules:

- **A**, "understates, the honest direction", is satisfied by all three. Nothing is owed.
- **B** names a defect in two of the three: the flat sort shows a placeholder as a rank,
  and the floor silently hides a candidate on it. The third, the wave, is shielded
  already, so B only asks that the placeholder not count toward the cohort's size.

**Verdict: better.** B finds the floor exclusion, which A calls safe. Falsifier: a pool
where unrouted candidates' placeholder scores match the scores they get once routed. If
that holds, the understatement is not happening, and the floor loses no one.
