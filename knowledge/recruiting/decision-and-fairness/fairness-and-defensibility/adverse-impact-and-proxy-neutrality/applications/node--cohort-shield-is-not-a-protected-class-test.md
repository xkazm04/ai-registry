---
layer: application
type: application
subject: adverse-impact-and-proxy-neutrality
technique: cohort-shield-is-not-a-protected-class-test
stack: node
status: forged
verified_on: 2026-09-26
verified_against: node@24
---

# The archetype shield, and the line it is not allowed to cross (TypeScript)

Three modules realize the shield:

- `app/_lib/archetypes.ts` defines who is protected from automated rejection.
- `app/_lib/archetype-live.ts` answers that question from the registry file as
  it stands now, not as it stood at build time.
- `app/_lib/automation-fairness.ts` re-asserts the protection at the boundary
  where the rejection would actually be applied.

None of them claims to be a fairness test. The adverse-impact module's header
(`app/_lib/adverse-impact.ts:14-16`) states the separation from the other side:
the fairness gate is "an ARCHETYPE shield (early-career / unknown), NOT a
protected-class test".

## One registry, two readers, one rule

The cohorts are no longer hand-copied constants. `archetypes.ts` derives them
from `pipeline/jobfit/archetypes.json`, the same file the Python pipeline reads
(`:1-7`), and "the TS<->Python desync this module used to guard against by
hand … is now structurally impossible". At the time of reading, the registry
had three archetypes. Two are shielded: `student`, and `career_switcher`, the
career-changer cohort the technique names.

`shieldsFromAutoReject` (`:65-67`) is the one rule both readers share. It
shields an entry that is flagged `fairnessProtected` **or** scored on the
early-career model, because the Python policy pass keys its never-auto-reject
lever on the scoring model. A gate that read the flag alone "would be looser
than the engine it backstops". The file is edited at runtime (custom archetypes,
shield flips), so the live reader (`archetype-live.ts:30-36`) makes the shield a
**union**: an id is shielded when the bundled registry shields it, when the live
file shields it, or when neither knows it. The union can only add protection
for an id the bundle knows. An unreadable file never throws; the
bundled gate answers, and a live-only id is treated as unknown, so it is
shielded.

## The gate fails closed on the unknown

`isFairnessProtected` (`archetypes.ts:113-115`) returns true for a shielded
archetype **or** any archetype the registry does not recognize. Its comment
states the rule as the standard does: "fail closed — we never auto-reject a
class we cannot classify". The deliberate asymmetry with the positive classifier
sits right below it. `isEarlyCareer` (`:121-123`) treats unknown as *not*
early-career, because "it drives display grouping and encouraging copy, not a
safety gate, so it must not over-claim". One predicate resolves unknown toward
the candidate and the other resolves it away, because only one of them can
cause harm.

Recognition itself had a hole that inverted the promise. `isKnownArchetype`
(`:84-95`) now uses `Object.hasOwn`, not `in`. The label map comes from
`Object.fromEntries`, so `"constructor" in ARCHETYPE_LABEL` was true for an id
the registry had never heard of. `isFairnessProtected("constructor")` therefore
returned false and "handed the auto-reject sweep … a candidate it was supposed
to shield". The fail-closed rule is only as strong as the membership test under
it.

## The display fallback that would have stripped the shield

`archetypeDisplayKey` (`:105-107`) is the standard's laundering rule caught in
the act. An unrecognized or sentinel archetype renders as an honest "unrouted"
label, "NEVER collapsed to a concrete class like 'bau'". The comment names both
harms: it "both misinforms the recruiter AND, if that 'bau' is persisted, strips
the fail-closed shield downstream (isFairnessProtected("bau") is false)". The
fix keeps the wire value canonical and changes only the shown label. Without
it, a rendering decision would have deleted a fairness protection.

## Defense in depth at the apply boundary

`automation-fairness.ts` exists because the Python policy pass decides the
rejections, and the TypeScript layer used to apply them verbatim. So "any Python
regression that emitted a reject for an early-career candidate, an unscored
entry, or a score at/above the reject floor would be auto-applied" (`:1-8`).
`assertAutoRejectFair` (`:47-69`) re-derives the sole legitimate reject path
from the entry snapshot it already holds. It reads the archetype half through
the live reader (`:51`), and it refuses in four ways that map cleanly onto the
standard:

- **Missing entry**: refused, "fail closed" (`:48-50`).
- **Shielded archetype**: refused, with a reason that distinguishes a known
  shielded archetype from an unknown one (`:52-57`).
- **Unscored entry** (`score === null || score <= 0`): refused. An absent score
  "means matching has not produced a genuine result (an unscored data gap, not a
  real low match)" and is never read as a zero (`:59-64`).
- **Score at or above the floor**: refused (`:65-67`).

A refusal is not a silent drop. The header states the downgrade explicitly: "A
refused reject is downgraded to `hold` + an alert (never silently applied) —
`hold` routes the candidate to the human Decisions gate, which is where a
contested reject belongs."

## The mirrored constant, pinned on both sides

`BAU_REJECT_SCORE = 40` (`:32`) duplicates the Python policy floor, and the
comment turns that duplication into a governed one. It is "a backstop CEILING —
a reject at/above it is refused — so it must stay >= the Python floor". The
comment names the drift consequence: "if the Python floor ever rises, raise this
with it or this backstop will spuriously downgrade legitimate Python rejects".
A test pins the value on each side (`automation-fairness.test.ts`,
`test_automation.py`).

## Where it falls short of the standard

The shield now covers the early-career and career-changer cohorts and anything
unknown. Two cohorts a pattern-matching screen handles worst still have no
shield: long-absence returners and non-linear-path profiles. The registry holds
no archetype for either.

The shield's outcomes are not reported as a reviewable audit slice: which
candidates were shielded, by which registry digest, and what the human then
decided. The standard's auditability rule is met by the refusal reasons at the
call site, not by a record anyone reviews.

A built-in archetype's shield cannot be edited away. `updateArchetype`
(`archetype-registry.ts:330-349`) refuses a change to `fairnessProtected` or
`scoringModel` on a built-in. A custom archetype's shield is different: an
operator can switch it at runtime (the route is operator-gated,
`app/api/archetypes/[id]/route.ts:6-15`). That switch changes who is protected,
and no audit record or review stands behind it as a fairness event.

The platform holds no demographic data, so the shield remains the only
fairness-adjacent number the product can show. That is exactly the condition
under which the standard requires the "this is not a protected-class analysis"
line to be loudest.
