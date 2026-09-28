---
layer: application
type: application
subject: automated-screening-fairness-gates
technique: fail-closed-on-an-unclassifiable-candidate
stack: node
status: forged
verified_on: 2026-09-26
verified_against: node@24
---

# The safety/copy pair in a TypeScript archetype module

The repo classifies every candidate into an archetype (`bau`, `student`,
`career_switcher`, plus any custom id an operator registers), and two kinds of consumer
ask about it. Both questions are answered in one file, `app/_lib/archetypes.ts`, and
they deliberately default in opposite directions.

## The pair, with the asymmetry written next to it

`archetypes.ts:113-115`, the safety predicate:

```ts
export function isFairnessProtected(archetype: string | null | undefined): boolean {
  return !isKnownArchetype(archetype) || FAIRNESS_PROTECTED.has(normalizeArchetype(archetype));
}
```

Its doc comment calls it "The fairness gate": shielded when the archetype is early-career
"OR an unknown one (fail closed — we never auto-reject a class we cannot classify)".

`archetypes.ts:117-123`, the copy predicate:

```ts
export function isEarlyCareer(archetype: string | null | undefined): boolean {
  return EARLY_CAREER.has(normalizeArchetype(archetype));
}
```

with the reason for the opposite default in its comment: "Unlike {@link
isFairnessProtected} this treats unknown as NOT early — it drives display grouping and
encouraging copy, not a safety gate, so it must not over-claim." That comment is the
technique's step 4 done exactly: the asymmetry reads as a decision, so no later cleanup
pass will make the two predicates consistent.

## The hole a membership check had

`isKnownArchetype` (`archetypes.ts:84-95`) is `Object.hasOwn(ARCHETYPE_LABEL,
normalizeArchetype(archetype))`. Its comment records the incident: the label map is
built with `Object.fromEntries` and inherits `Object.prototype`, so `"constructor" in
ARCHETYPE_LABEL` was true for an id the registry had never heard of, which "inverted the
fail-closed promise below — isFairnessProtected("constructor") returned false, handing
the auto-reject sweep (screen-wave.ts) a candidate it was supposed to shield". The
lesson is general: a fail-closed predicate built on membership is only as closed as its
membership test, and a prototype chain is a membership the author did not write.

## Unrouted is a named state

- `app/_lib/apply.ts:73` — `export const FALLBACK_ARCHETYPE = "unknown";` — persisted when
  intake fails or yields no archetype. The comment above it (`:60-72`) explains why the
  earlier fallback was wrong: "bau" "is a CONCRETE class ... so persisting it on a record
  that asserts nothing was read strips the early-career fairness shield".
- `app/_lib/archetype-registry.ts:48` — `const RESERVED_IDS = new Set(["unknown",
  "unrouted"]);` — the manager refuses to register either id, because registering one
  would flip every unrouted candidate "from shielded to auto-rejectable, and relabels
  them as a concrete class".
- `archetypeDisplayKey` (`archetypes.ts:105-107`) renders anything unrecognized as
  `"unrouted"`, "NEVER collapsed to a concrete class like "bau"".
- The live reader (`app/_lib/archetype-live.ts:77-85`) is the union the server decides
  with: shielded when the bundled registry shields the id, when the runtime registry
  file shields it, or when neither knows it (`return true;`). An unreadable or invalid
  file answers with the bundled gate, so a broken registry can only add protection.

## Tested with values that do not exist

`app/_lib/archetypes.test.ts:63-69` is the characteristic test the technique asks for:
it loops over `[null, undefined, "", "   ", "unknown", "unrouted", "quantum_alchemist",
"bau_v2"]` and asserts every one is shielded. `:51-56` pins `"constructor"` in three
spellings, and `:102-110` asserts, for the same garbage values, that `isEarlyCareer` is
false while `isFairnessProtected` is true — the asymmetry pinned as one assertion pair.

## Deviations

- **The Python policy pass relabels.** `pipeline/jobfit/automation.py:968` —
  `archetype = entry.get("archetype") or "bau"` — and `:976` decides the shield by
  membership (`early = archetype in _EARLY_CAREER`), so a null or unregistered archetype
  is rejectable on that path. The docstring pins it as a known caveat (`:32-34`: "The
  fail-closed reading exists only in TS"), and `pipeline/jobfit/tests/test_automation.py:1064-1067`
  includes an `"unknown-archetype"` fixture that expects the BAU behaviour. The TS
  backstop downgrades what Python proposes, so no candidate is rejected unattended, but
  every such proposal lands as a fairness refusal, and the refusal count stops meaning
  "an upstream regression" as `app/_lib/automation-pass.ts:16-19` says it does.
- **The detector's no-signal default is a concrete class.** `pipeline/jobfit/archetypes.json`
  sets `"defaultArchetype": "bau"` at `"defaultConfidence": 0.4` with the reason "no
  strong signal; defaulting to experienced", and `pipeline/jobfit/registry.py:323-326`
  returns it when no detection signal fires — for example 2.0 years of relevant
  experience and nothing else. The candidate is persisted as `bau`, which the TS gate
  reads as known and unshielded. The only mitigation is display: a low-confidence
  banner (`app/_components/results/ArchetypeBanner.tsx:133`) and a low-confidence
  finding. This is the relabel the technique calls the worst variant: a class stated
  with confidence and inferred from nothing.
- **Smaller relabels.** `pipeline/jobfit/recruiter.py:28-33` `fairness_track` returns `"experienced"` for
  any archetype outside the early-career set, including unknown.
- **No escalation on the unrouted share.** Nothing watches how many candidates are
  unrouted or defaulted, so the shield could quietly become the main path.
