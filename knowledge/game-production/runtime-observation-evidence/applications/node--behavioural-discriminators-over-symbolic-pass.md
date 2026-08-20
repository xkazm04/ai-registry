---
layer: application
type: application
subject: runtime-observation-evidence
technique: behavioural-discriminators-over-symbolic-pass
stack: node
status: forged
---

# The test-gate-runner's assertion vocabulary

Realized in the PoF repo's deferred-gate drain path — `src/lib/test-gate-runner/` over the
shared observation spine in `src/types/observation.ts`. Node/TypeScript side; the sampling
itself happens in a headless Unreal process that writes `observations.json`.

## The sample stream is the evidence

`src/types/observation.ts:22` documents the row the runtime `UScenarioController` writes per
sampled tick, and names the discriminator outright:

> `droopL`/`droopR` (per-arm droop angle in degrees) are the walk-cycle signature — their
> variance across samples is the calibration-proven discriminator between an animating pawn
> and a T-posing one.

`ObsSample` (`src/types/observation.ts:28-40`) carries `t`, `loc_x/y/z`, `speed`, `droopL`,
`droopR`, and optional `anim_speed`, `montage_playing`, `health`, `stamina`, `mana`. Every
field is a measured scalar per tick — no verdicts in the stream, which is what lets the
verdict layer be re-derived later from the bounded evidence.

## The closed assertion vocabulary

`src/lib/test-gate-runner/types.ts:26` states the doctrine in a comment before the type:

> Discriminators are the calibration-proven ones (arm-droop variance = animation,
> displacement = movement) — not symbolic "test returned PASS".

`GateAssertion` (`types.ts:29-38`) is exactly the closed vocabulary with calibrated
defaults the technique prescribes:

- `animated` — arm-droop varies across samples, default ≥ 10°
- `static` — arm-droop ~constant (the deliberate "should be still" assertion), default ≤ 5°
- `moved` — displacement ≥ `minDist`, default ≥ 50 (2D by default, `hypot3` when `in3D`)
- `min-speed` — peak observed speed ≥ 50 by default
- `vertical-displacement` — max `|loc_z − startZ|` ≥ 50, "a jump/knockback lifts the pawn
  (previously unobservable)"
- `montage-playing` — a montage played in ≥ 1 sample
- `attribute-drop` — a resource pool's `max − min ≥ minDelta`, default 1
- `ability-activated` — montage played OR any resource dropped

Each carries a default that a specific `GateScenario` may raise — the "named kind with an
overridable default" rule, realized.

## Upward lesson: disambiguating the negative

`src/types/observation.ts:41-51` adds `ability_found?: boolean` — set true when the requested
gameplay-ability tag was actually found on the pawn's ability system component *before*
activation. The comment is the lesson:

> Lets the `ability-activated` verdict tell "the ability tag doesn't exist" apart from "the
> ability ran but produced no observable effect" — two very different failures that
> otherwise both read as "no montage and no resource".

The field is deliberately optional and additive: "absent in older UE emissions (the verdict
degrades to the effect-only check)". That is the graceful-degradation rule the technique
states — emitter and consumer ship on different clocks, and a required new field would turn
every older run into a false failure. This pairing (a disambiguating fact plus optional
degradation) was an upward lesson from the repo, not something the expert draft had.

## Confounder isolation on the scenario

`GateScenario` (`types.ts:45-58`) carries two named, default-off isolations, both confirming
the golden path's rule:

- `playAnim` — "force-play an anim asset at Begin (single-node) — isolates mesh vs ABP"
- `disableAI` — "Destroy AI-possessed pawns at scenario start so combat can't interfere with
  the observed behaviour (e.g. isolate locomotion — enemies otherwise stagger the player)"

## Attribution is the false-verdict path

`docs/catalog/L3-L4-RUNNER.md` (plugin-contract section) records the only way this machinery
can produce an actively wrong answer: UE registers map-placed tests under the map/actor
label, so one requested leaf name can be a substring of several registered paths, and
"crediting an arbitrary one of them would attribute ANOTHER test's pass or fail to this
gate (the only false-verdict path in the runner)". Uniqueness is decided by a shared
`attributeUniquely` in `@/lib/ue-automation/abslog` — the same rule both correlation paths
use, so they cannot drift — and a collision is **terminal deferred with the colliding ids
named**, "never a pass and never a fail". Upward lesson; the draft treated ambiguity only as
a reporting concern, not as a distinct terminal outcome.
