---
layer: application
type: application
subject: adverse-impact-and-proxy-neutrality
technique: cohort-shield-is-not-a-protected-class-test
stack: node
status: forged
---

# The archetype shield, and the line it is not allowed to cross (TypeScript)

Two modules realize the shield: `app/_lib/archetypes.ts` defines who is
protected from automated rejection, and `app/_lib/automation-fairness.ts`
re-asserts that protection at the boundary where the rejection would actually be
applied. Neither claims to be a fairness test — the adverse-impact module's
header (`app/_lib/adverse-impact.ts:14-16`) states the separation from the other
side: the fairness gate is "an ARCHETYPE shield (early-career / unknown), NOT a
protected-class test".

## The gate fails closed on the unknown

`isFairnessProtected` (`archetypes.ts:78-80`) returns true for an explicitly
early-career archetype **or** any archetype the registry does not recognize:

```ts
return !isKnownArchetype(archetype) || FAIRNESS_PROTECTED.has(normalizeArchetype(archetype));
```

Its comment states the rule as the standard does — "fail closed — we never
auto-reject a class we cannot classify". The deliberate asymmetry with the
positive classifier sits right below it: `isEarlyCareer` (`:86-87`) treats
unknown as *not* early, because "it drives display grouping and encouraging
copy, not a safety gate, so it must not over-claim". One predicate resolves
unknown toward the candidate, the other resolves it away — because only one of
them can cause harm.

## The display fallback that would have stripped the shield

`archetypeDisplayKey` (`:70-72`) is the standard's laundering rule caught in the
act. An unrecognized or sentinel archetype renders as an honest "unrouted"
label, "NEVER collapsed to a concrete class like 'bau'". The comment names both
harms: it "both misinforms the recruiter AND, if that 'bau' is persisted, strips
the fail-closed shield downstream (`isFairnessProtected("bau")` is false)". The
fix keeps the wire value canonical and changes only the shown label — a
rendering decision that would otherwise have deleted a fairness protection.

## Defense in depth at the apply boundary

`automation-fairness.ts` exists because the Python policy pass decides the
rejections and the TypeScript layer used to apply them verbatim, so "any Python
regression that emitted a reject for an early-career candidate, an unscored
entry, or a score at/above the reject floor would be auto-applied" (`:1-8`).
`assertAutoRejectFair` (`:46-66`) re-derives the sole legitimate reject path
from the entry snapshot it already holds, and refuses in four ways that map
cleanly onto the standard:

- **Missing entry** → refused, "fail closed" (`:48`).
- **Fairness-protected archetype** → refused, with the reason distinguishing an
  explicit early-career shield from an unknown-archetype shield (`:52-54`).
- **Unscored entry** (`score === null || score <= 0`) → refused, because an
  absent score "means matching has not produced a genuine result (an unscored
  data gap, not a real low match)" and must never be read as a zero (`:58-61`).
- **Score at or above the floor** → refused (`:64`).

A refusal is not a silent drop: the header states the downgrade explicitly — "A
refused reject is downgraded to `hold` + an alert (never silently applied) —
`hold` routes the candidate to the human Decisions gate, which is where a
contested reject belongs."

## The mirrored constant, pinned on both sides

`BAU_REJECT_SCORE = 40` (`:31`) duplicates the Python policy floor, and the
comment turns that duplication into a governed one: it is "a backstop CEILING —
a reject at/above it is refused — so it must stay >= the Python floor", with the
drift consequence named ("if the Python floor ever rises, raise this with it or
this backstop will spuriously downgrade legitimate Python rejects") and a test
pinning it on each side (`automation-fairness.test.ts` and `test_automation.py`).

## Where it falls short of the standard

The shielded cohorts are early-career and unknown only; career-changer,
long-absence returner and non-linear-path profiles — the other cohorts a
pattern-matching screen handles worst — carry no shield. The shield's outcomes
are not reported as a reviewable audit slice (which candidates were shielded, by
which classifier version, and what the human then decided), so the standard's
auditability rule is met by the refusal reasons at the call site rather than by
a record anyone reviews. And because the platform holds no demographic data, the
shield remains the only fairness-adjacent number the product can show — exactly
the condition under which the standard requires the "this is not a protected-
class analysis" line to be loudest.
