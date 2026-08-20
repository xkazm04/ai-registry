---
layer: application
type: application
subject: realtime-combat-semantics
technique: telegraph-or-homing-for-area-effects
stack: process
status: forged
---

# Encoding the telegraph-or-homing obligation as a reviewer instruction

A prompt-pipeline realization: PoF's module evaluator carries a per-module review context,
and the `arpg-combat` module's context in `src/lib/evaluator/module-eval-prompts.ts:135` is
where the real-time obligations of this subject are written down as instructions a model
must apply to a live Unreal Engine project.

## Where the rule lives

The context is a record keyed by module, each with `focus`, `structureChecks`,
`qualityChecks`, `performanceChecks` and — for `arpg-combat` — a `tracePass`. The
telegraph obligation sits inside `qualityChecks`, under a heading that names the whole
subject:

> `Additionally — real-time design semantics (this is a real-time ARPG; flag turn-based
> rules ported unchanged):`

and then, as the first bullet:

> `Every AoE or ranged targeted ability must define its moving-target behavior: either a
> ground-marked telegraph resolved where it was aimed (it CAN whiff when the target moves —
> compensate with radius/power) or a homing projectile that tracks the target after launch.
> A cast that resolves against a target picked earlier with neither telegraph nor tracking
> is a turn-based rule leaking into real time.`

Three things this realization gets right and that are worth copying into any review
pipeline:

1. **The rule is stated as an exclusive disjunction with a named forbidden third case.** The
   model is not asked whether the ability "feels fair"; it is asked which of two structures
   the ability has, and told what the absence of both means. That is checkable.
2. **The whiff is pre-authorized.** `it CAN whiff when the target moves — compensate with
   radius/power` closes the loophole where an author, seeing telegraphed casts miss, re-aims
   the region at resolution time and destroys the contract. The compensation lever is named
   so the reviewer does not have to invent one.
3. **The diagnosis is named, not just the defect.** `a turn-based rule leaking into real
   time` gives the finding a category, which is what lets a reviewer generalize from one
   ability to the roster.

## Why it is attached to a review pass rather than a validator

Nothing here is statically checkable. The neighbouring `structureChecks` in the same record
are: `Melee attack should be a GameplayAbility, not raw code`, `Hit detection should use
anim notify state windows`, `Damage should flow through GAS (GE application), not direct
attribute set`. Those are structural and a linter could approximate them. Whether an area
effect is perceivable in time is not in that class — it is the rung above, which is why it
is phrased for a reader of the code and of the content rather than for a parser.

The same file backs that up with `tracePass`, which demands a numbered end-to-end call
graph of one hit — activation and how, the activation tag and entry point, the damage path
branch taken, the effect applied and its execution calculation, the attributes read and
written, and the delegates broadcast — and then requires the reviewer to
`FLAG any step that needs a binary asset (montage, AnimNotify in a montage, BT, .umap) that
cannot be authored from code`. That last clause is the honest admission that a telegraph is
usually an asset, not a line of code: a review that can only read source will find the
ability and never find out whether it was readable on screen. The pipeline handles that by
making the gap explicit rather than by scoring the ability as passing.

## Deviation kept as a standard

The repo's instruction stops at *defining* moving-target behaviour. It does not require a
lead time measured against traversal speed, and it does not require two sensory channels for
the cue. Those stay in the technique at full strength: a telegraph whose lead time was never
compared with how far the player can run is unverified, and the correct verdict for an
unmeasured lead time is *unmeasured*, not *adequate*. The prompt is a good encoding of the
obligation; it is not yet an encoding of the measurement.

## The complementary anchor

`docs/catalog/ARPG-LAWS.md` §8 supplies the exchange rate the prompt leaves implicit:

> `the biggest single non-boss hit at area level L should deal < 33% of a capped-resist
> character's EHP (no 3-hit-without-counterplay deaths). Boss telegraphed slams may exceed
> this only with a clear, dodgeable tell`

Read together, the two documents say the same thing from opposite ends: the survivability
canon caps how hard a hit may be, and readability is the only currency that buys an
exemption. The cap belongs to the systems canon; the exemption clause is a real-time rule.
