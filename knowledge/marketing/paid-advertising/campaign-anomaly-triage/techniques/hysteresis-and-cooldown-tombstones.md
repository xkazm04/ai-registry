---
layer: technique
type: technique
subject: campaign-anomaly-triage
technique: hysteresis-and-cooldown-tombstones
status: forged
laws: [a-gate-before-money-and-copy, label-convention-as-convention]
shared_with: []
use_when: [designing when an alert re-fires, stopping a campaign that flickers across a threshold from re-alerting every sync, deciding whether a past-day anomaly should ever remind]
---

# Hysteresis and cooldown tombstones

An alert is a claim on a person's attention, and attention is spent once per
episode, not once per sync. A campaign that sits at the critical boundary will
cross it several times a day; a sync that finds nothing must not forget what it
told the manager yesterday. The technique is a small, pure suppression policy
with per-key episode memory that every alert path shares.

## The three mechanisms

**Hysteresis.** An alerted key stays in its episode until it clears a recovery
band, not merely the breach threshold. A critical campaign that recovers only to
"warning" is banded: unresolved, not breaching, episode held. When it later
breaches again, that is the same episode and it does not re-alert. Only a
recovery to healthy ends the band.

**Per-key cooldown.** Within a fixed window after a key last fired (convention:
six hours), it never fires again, whatever happens. A breach inside the window is
suppressed and grouped: the episode's count increments, and the inbox shows one
row with a repeat count instead of a new row.

**Tombstones.** A key that recovered to healthy keeps a tombstone - its episode
record with an inactive flag - until its cooldown elapses. A relapse inside the
window groups against the tombstone; a relapse after the window is a fresh
episode and alerts anew. Without tombstones, a zero-breach sync wipes the memory
and the next sync re-alerts the very same condition.

## Reminders are opt-in per key kind

A live campaign that is still critical after the cooldown deserves a reminder:
"still broken, look again". A discrete past-day anomaly does not. The day is
what it was; while it keeps re-surfacing in the detector's window at every sync,
a reminder every cooldown is pure noise. So the policy takes a flag: reminders
on for campaign-state keys, off for anomaly keys, and an anomaly key alerts once
and stays suppressed until it stops breaching and ages out through the cooldown.

## Procedure

1. Key every alertable condition stably: the campaign identifier for a state
   alert; date plus metric plus kind for a day anomaly.
2. On each sync, compute the set of breaching keys and the set of banded keys.
   Anomalies have no band; pass an empty set.
3. Run the policy against the persisted state: a breaching key with no episode
   fires and starts one; a breaching key inside cooldown is suppressed and
   counted; a breaching key past cooldown fires again only if reminders are on
   for its kind. A banded key holds its episode. A recovered key inside cooldown
   becomes a tombstone; past cooldown it is dropped.
4. Run the policy even when nothing breaches, so tombstones age out. A
   zero-anomaly sync that skips the policy freezes the state.
5. Write the durable inbox row first, then commit the next state, then send the
   best-effort channels (mail, webhook). Written in this order a crash costs at
   worst a duplicate inbox row on the next sync; written state-first, an alert
   whose delivery threw is never told, and for a no-reminder key it is never told
   at all.
6. Cap what one alert spells out (convention: five items) ranked by deviation;
   say how many more there were. Price the items and add the adverse money
   headline.

## Decision rules

- When a key flickers across the breach threshold, it alerts once per cooldown
  at most; if the test suite cannot show this with a synthetic sync sequence,
  the policy is not pure enough.
- When a key recovers only into the band, it does not re-arm; when it recovers
  to healthy and relapses inside the cooldown, it groups; after the cooldown, it
  re-alerts as a new episode.
- When the key is a discrete past day, reminders are off; when it is a live
  state, reminders are on. Never one setting for both.
- When a delivery channel fails, the inbox row already exists; retry the channel,
  never the detection.
- When an alert names campaigns, only real campaign identifiers are actionable;
  synthetic anomaly keys are skipped by any one-click action that would scope a
  change to "the alerted campaigns", because they would match nothing and
  dead-end.

## What is convention here

The six-hour cooldown is convention, chosen against an hourly sync cadence so a
condition is told at most a handful of times a day and a reminder arrives within
a working shift. A daily sync would want a longer window. The five-item cap and
the choice of "warning" as the hysteresis band for a critical episode are
convention. What is not convention is the write order and the requirement that
the policy runs on empty input; both are correctness, learned from a lost alert
and a re-alert loop respectively.

## When not to use this

Do not apply cooldown to the verdict itself. Triage still badges the campaign
critical on every sync; suppression governs the notification, never the table.
A manager who opens the console must see the truth regardless of what was mailed.

Do not group across different campaign sets. Two alerts group only when they
concern the same set of identifiers; an alert about campaigns A and B and one
about A alone are different rows.

Do not let acknowledgement or resolution feed back into detection. The
workflow status - new, acknowledged, resolved - is the operator's, and
resolution is terminal: a resolved alert is never regressed to acknowledged, and
a new breach after resolution is a new episode with a new row.
