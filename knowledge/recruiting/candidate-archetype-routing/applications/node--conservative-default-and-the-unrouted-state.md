---
layer: application
type: application
subject: candidate-archetype-routing
technique: conservative-default-and-the-unrouted-state
stack: node
status: forged
---

# The `unknown` sentinel, and the two safe directions kept apart

This repo separates the standard's two answers exactly: an unclassifiable candidate keeps
an honest **`unknown`** archetype on the wire and is scored on the **neutral experienced**
weights. The class is never rewritten to match the rubric.

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
weights, the *record* stays `unknown`, and the knockout filter fails closed. Two
consumers, two different safe directions, one honest value.

`app/_lib/candidate-pool.ts:73` repeats it for legacy analyses with no v2 profile —
`archetype: "unknown"`, with the comment "a legacy analysis with no v2 profile was never
routed to a real archetype. 'bau' ('Experienced') both mislabels the candidate and —
being NOT fairness-protected — strips the fail-closed shield downstream." Its test
(`app/_lib/candidate-pool-tenancy.test.ts:76`) asserts the value with the reason in the
message: "the fallback is the honest sentinel, not 'bau'".

## Display renders the unknown as unrouted, and never as a class

`app/_lib/archetypes.ts:62-72` is the display boundary:

```ts
/** The archetype key to DISPLAY for a candidate. Any value the registry doesn't
 *  recognize — a missing archetype, or the "unknown" fail-closed sentinel the
 *  matcher stamps when routing couldn't classify a candidate — renders as the
 *  honest "unrouted" label, NEVER collapsed to a concrete class like "bau"
 *  ("Experienced"). Mislabeling an unrouted (fairness-protected) candidate as
 *  "bau" both misinforms the recruiter AND, if that "bau" is persisted, strips the
 *  fail-closed shield downstream (isFairnessProtected("bau") is false). The wire
 *  value stays canonical; only the shown label changes. */
export function archetypeDisplayKey(archetype: string | null | undefined): string {
  return isKnownArchetype(archetype) ? normalizeArchetype(archetype) : "unrouted";
}
```

"The wire value stays canonical; only the shown label changes" is the rule the standard
states as *widen the type, do not narrow the value* — the display gets a friendly name
for the unrouted state without the stored class being touched.

## The safety/copy asymmetry, written down as a decision

The two predicates sit adjacent in the same module with their opposite defaults
documented as deliberate. `archetypes.ts:74-80`:

```ts
/** The fairness gate. True when a candidate must be shielded from AUTOMATED
 *  rejection: either an explicit early-career archetype, OR an unknown one
 *  (fail closed — we never auto-reject a class we cannot classify). */
export function isFairnessProtected(archetype: string | null | undefined): boolean {
  return !isKnownArchetype(archetype) || FAIRNESS_PROTECTED.has(normalizeArchetype(archetype));
}
```

and `archetypes.ts:82-88`:

```ts
/** Positive classification: true only for archetypes scored on the early-career
 *  (potential) model. Unlike {@link isFairnessProtected} this treats unknown as
 *  NOT early — it drives display grouping and encouraging copy, not a safety
 *  gate, so it must not over-claim. */
export function isEarlyCareer(archetype: string | null | undefined): boolean {
  return EARLY_CAREER.has(normalizeArchetype(archetype));
}
```

Both key off a canonicalized value: `normalizeArchetype` (`archetypes.ts:51-53`) trims and
lower-cases, so `"Student"`, `" student "` and `"STUDENT"` resolve identically and a case
variant cannot accidentally look unregistered.

`app/_lib/archetype-display.test.ts` is the enforcement, and it tests the standard's
characteristic case rather than the easy one: it iterates `null`, `undefined`, `""`,
`"unknown"`, `"not_a_real_archetype"` and `"  UNKNOWN  "`, asserting each displays as
`unrouted`, never as `bau`, **and** that `isFairnessProtected` returns `true` for every
one — "everything shown as unrouted is shielded". Values that do not exist in the
taxonomy at all, not just the sentinel.

## The confidence side: the unguided default trips review by construction

The Python detector never returns an `unknown` id — `registry.py:200-203` returns the
registry's `defaultArchetype` (`bau`) at `defaultConfidence` (0.4) when no signal fires.
Two mechanisms keep that honest.

`registry.py:89-94` documents the ordering invariant the standard asks for:

> "Archetype-routing confidence below which the routing is an unsettled guess a human
> should verify, not a decision to trust. The unguided default (`defaultConfidence`) sits
> below it by construction, so a silent fallback always trips it."

With `defaultConfidence: 0.4` and `lowConfidenceThreshold: 0.55`
(`archetypes.json:63-64`), a routing no evidence produced is always flagged for manual
review.

And `registry.py:97-103` gives the unguided fallback its own marker, distinguishing the
two things that hide inside a low number:

```python
def signals_absent(reasons: list[str]) -> bool:
    """True when :func:`detect` fired NO signal and fell back to the registry
    default. ``detect`` appends ``defaultReason`` only on that no-signal branch, so
    its presence in the returned reasons is the precise marker of an unguided
    default — distinguishing a defaulted routing from one a low score merely made
    uncertain."""
```

A contested career and a broken parse both score low; only one of them says "no strong
signal; defaulting to experienced" in its reasons.

## Where this falls short of the standard

- **A degraded intake persists a concrete class.** `app/_lib/apply.ts:60-68` sets
  `FALLBACK_ARCHETYPE = "bau"` for an entry created when intake fails, reasoning that the
  system "must not GUESS a fairness-shielded archetype ... from a broken intake". The
  first half is right and the standard agrees; the second half is where it diverges — the
  honest value for a broken intake is the `unrouted` sentinel the rest of the codebase
  already standardized on, which is protective *and* asserts nothing. The mitigation is
  real (the entry is flagged intake-degraded for manual capture, "at which point the real
  archetype is recovered") but it is a follow-up task rather than a shield, and this is
  the one place in the repo where an unclassified candidate is written down as
  Experienced.
- **Nothing alarms on the unrouted rate.** The standard asks for an alert when unrouted
  exceeds a small share of intake, because fail-closed is a handling of a rare case and
  not a viable main path. `signals_absent` makes the measurement available and no monitor
  consumes it.
