---
layer: application
type: application
subject: spatial-audio-scene-authoring
technique: event-priority-concurrency-cooldown
stack: process
status: forged
verified_on: 2026-08-20
---

# An event catalog that carries its own playback budget

PoF's audio event catalog seeds every project with a taxonomy in which each row carries
its budget alongside its trigger. The seed lives at
`src/components/modules/content/audio/AudioEventCatalog/constants.ts:55-73`
(`DEFAULT_EVENTS: AudioEvent[]`), with the priority scale at lines 46-51.

## The row

`{ id, name, category, trigger, priority, spatial, concurrency, cooldownMs, tags }` — the
six budget-relevant fields of the technique's catalog row, present per class rather than
configured centrally. `PRIORITY_CONFIG` gives four bands with numeric weights
(`low: 0, normal: 1, high: 2, critical: 3`), matching the technique's "four bands with an
explicit weight" rule.

## The seeded values

| Class | Category | Priority | Spatial | Concurrency | Cooldown |
| --- | --- | --- | --- | --- | --- |
| Melee Hit | combat | high | 3d | 4 | 50 ms |
| Player Death | combat | critical | 3d | 1 | 0 |
| Dodge Roll | combat | normal | 3d | 1 | 200 ms |
| Ability Cast | combat | high | 3d | 2 | 100 ms |
| Footstep | environment | low | 3d | 2 | 100 ms |
| Door Open | environment | normal | 3d | 1 | 500 ms |
| Ambient Loop | environment | low | 3d | 3 | 0 |
| Button Click | ui | normal | 2d | 1 | 50 ms |
| Menu Open | ui | normal | 2d | 1 | 0 |
| Notification | ui | high | 2d | 2 | 300 ms |
| Combat Layer | music | high | 2d | 1 | 0 |
| Exploration Layer | music | normal | 2d | 1 | 0 |
| Boss Theme | music | critical | 2d | 1 | 0 |

Every number in the techniques' "typical" ranges came from reading this table against
practice, and the table confirms both budget rules independently: concurrency of 4 for the
one class that genuinely swarms (melee hits from multiple attackers), 1 for everything
singular, and a cooldown ladder of 50 / 100-200 / 300-500 ms across impacts, movement and
interface alerts.

It is also a clean confirmation of the spatialization rule with no exceptions: all four
`ui` classes and all three `music` classes are `2d`; all seven world classes are `3d`. The
split is by category, not per class, which is what makes it teachable as a rule.

## Deviations, standards not lowered

- **No reservation or stealing policy.** The catalog has priority but no per-category voice
  reservation and no stated stealing behaviour, so nothing in the data prevents an abundant
  low-priority class from starving a rare critical one. The technique keeps the requirement.
- **Footsteps are `3d` with no distinction for the player's own.** The row covers every
  footstep including the listener's, which is the ambiguous case the technique names.
  A shipped taxonomy needs the player's own footsteps split out.
- **No dialogue category.** Combat / environment / ui / music (`CATEGORIES`, line 53) has no
  place for spoken lines, so the ducking-versus-reservation decision the technique demands
  has nowhere to be recorded.
- **Nothing is exercised.** The budget is authored and never measured under load; no field
  records whether a class was ever suppressed in a crowded encounter. Under
  `unmeasured-is-not-a-pass`, every row is *not measured* rather than *validated*, and the
  technique's worst-case exercise pass remains the missing step.

## Why `process` and not `react`

The catalog surface is a React module, but nothing transplantable lives in its rendering.
What transplants is the convention — one row per event class, budget fields adjacent to the
trigger, priority as four weighted bands, spatialization by category — which is a production
methodology any team can adopt against any middleware.
