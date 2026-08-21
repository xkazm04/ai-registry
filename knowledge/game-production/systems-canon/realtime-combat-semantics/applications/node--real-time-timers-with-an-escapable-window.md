---
layer: application
type: application
subject: realtime-combat-semantics
technique: real-time-timers-with-an-escapable-window
stack: node
status: forged
verified_on: 2026-08-20
---

# Keeping a cooldown from becoming a damage-over-time period

The unit defect in this technique — a cooldown read as a tick period — has a worked
instance in PoF's ability codegen pipeline, and the fix is a doctrine note carried in the
generated prompt itself.

## The incident, preserved in a comment

`src/lib/ability/effect-codegen-prompt.ts:19`, inside `describeEffect()`, the function that
renders one authored effect into a bullet for the code-generation contract:

```ts
// cooldownSec is the ABILITY cooldown (the editor's "Cooldown" field) — say
// so explicitly, or the model emits it as a GE Period and the effect's
// damage silently re-applies every N seconds as a DoT tick.
const cooldown = e.cooldownSec > 0 ? `; ability cooldown ${e.cooldownSec}s (NOT a GE Period — see the cooldown GE rule)` : '';
```

Everything the technique claims is in those four lines. Two quantities, both in seconds,
both attached to the same ability, meaning opposite things: how often the *actor* may fire,
versus how often the *target* is hurt. The generator conflated them, the emitted effect was
structurally valid, it compiled, it applied — and a single hit had become a stream. The
number was never wrong; only its basis moved.

The remedy is instructive because of what it is *not*. It is not a validation rule that
rejects the bad output after the fact. It is a disambiguation carried in the prompt at the
point the number is described, in the emitted text the model actually reads: the field is
named, its owner is named (`the editor's "Cooldown" field`), and the wrong destination is
named and negated (`NOT a GE Period`). Where a unit is ambiguous to a generator, the cheapest
correct place to fix it is in how the quantity is described, not in what is done to the
result.

## The neighbouring type distinction

The same file opens with the duration policy map that keeps the other time kinds apart:

```ts
const POLICY: Record<EditorEffect['duration'], string> = {
  instant: 'Instant',
  duration: 'HasDuration',
  infinite: 'Infinite',
};
```

and `describeEffect` renders the duration only when the policy is `duration`
(`` const dur = e.duration === 'duration' ? ` (${e.durationSec}s)` : ''; ``). An instant
effect therefore carries no duration into the contract at all — it cannot accidentally
acquire one. That is the technique's rule about never letting a bare duration default into a
period, implemented as a discriminated field rather than as review discipline.

## Where the escapability half is measured instead of authored

The unit half of the technique is enforced in the codegen prompt; the escapability half
appears elsewhere in the codebase, as a simulation. `src/lib/combat/choreography-sim.ts`
runs an encounter forward in real seconds — enemies re-arm with
`enemy.nextAttack = t + enemy.arch.attackIntervalSec * (0.8 + rng() * 0.4)`, so intervals
jitter ±20% rather than resolving on a fixed grid — and emits alerts at line 263 onward
that are pure real-time thresholds:

```ts
if (playerDied && totalDuration < 5) { /* critical: encounter is too punishing */ }
if (totalDuration > 45)              { /* warning: combat feels spongy */ }
if (!playerDied && totalDuration < 3) { /* info: trivially easy */ }
if (totalEnemyHP > playerMaxHP * tuning.playerHealthMul * 5) { /* warning: may feel tedious */ }
const bucketSize = 2; // temporal alerts: DPS spikes and damage droughts
```

These are the numbers the golden path quotes, and they are worth keeping in their measured
form: a player death inside 5 s, an encounter past 45 s, a resolution under 3 s, a combined
enemy pool over 5x the player's, and a 2 s bucket as the grain at which dead air becomes
visible.

## The deviation

The simulation resolves damage over time; it does not resolve *space*. It has no traversal
speed, so it cannot answer the escapability question the technique poses — whether the safe
point is reachable inside the window. It measures whether the fight's shape is right, not
whether any given window was leavable. That is a real gap and the standard does not move to
accommodate it: an escape window whose distance was never compared to the player's speed is
unmeasured, and it must be reported as unmeasured rather than inferred from a favourable
time-to-kill. The general practice of Monte-Carlo encounter validation is a separate
subject; what belongs here is the reminder that a temporal simulation cannot certify a
spatial guarantee.
