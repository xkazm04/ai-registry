---
layer: application
type: application
subject: campaign-anomaly-triage
technique: hysteresis-and-cooldown-tombstones
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Hysteresis and cooldown tombstones - a pure suppression policy shared by two alert paths

Verified against the systedo-case workspace at commit
`2893314930546ed3a314a19a155bcf2f8841a0ea` (2026-09-08), Node 24.x. The policy is
`planSuppression` in `src/lib/campaigns/alert-suppression.ts`, which its header
(`:1-13`) describes as pure - *no I/O, no firebase* - so the exact decision is
replayed in tests with synthetic sync sequences and both the campaign-critical
path and the anomaly path import one source of truth.

## The three mechanisms in code

`ALERT_COOLDOWN_MS = 6h` at `alert-suppression.ts:15-17`; convention, sized against
the hourly cron sync the anomaly path runs under (`anomaly-alerts.ts:1-6`). The
per-key state (`:20-30`) carries `lastAlertAt`, an episode `count` that drives the
inbox "xN", and an `active` flag whose false value is the tombstone: *recovered to
healthy but kept as a cooldown tombstone so a relapse still groups*.

`planSuppression` (`:74-130`) is the technique's procedure verbatim. A breaching key
with no episode fires and starts one (`:88-93`); a breaching key past cooldown
fires again only when `remindAfterCooldown` is on (`:94-101`); otherwise it is
suppressed and counted (`:102-107`). Non-breaching keys carried from the prior
state hold their episode when banded (`:115-119`), become a tombstone inside the
cooldown (`:120-125`), and drop once cooled (`:126`).

Tests: flicker across the critical boundary yields one alert per window
(`test-unit/campaigns-alert-suppression.test.mjs:38`); recovery only to warning
does not re-arm (`:51`); relapse inside cooldown groups, relapse after re-alerts
(`:60`, `:70`); a still-broken key reminds once per cooldown (`:80`).

## The structural fact: reminders are a per-kind flag, and the memory must roll on empty input

`SuppressionInput.remindAfterCooldown` (`:47-53`) is the opt-in the technique
requires. The campaign path keeps the default (true); the anomaly path passes
false (`src/lib/campaigns/anomaly-alerts.ts:111-115`) with the reasoning at
`:102-107`: each key is a discrete past `(day, metric, kind)` and *a reminder
every cooldown while the same day sits in the detection window is pure noise*.
`campaigns-alert-suppression.test.mjs:136-147` replays the same day across ten
cooldown windows and asserts exactly one alert; `:149` replays the same sequence
with reminders on and asserts it does re-fire - the behaviour is opt-in, not a
change to the campaign path.

The second structural fact is the old bug at `anomaly-alerts.ts:96-100`: a
zero-anomaly sync used to *WIPE the memory (the next sync re-alerted the very same
days)*. The policy now runs even when nothing breaches (`:117-123`), so tombstones
age out instead of being erased; `campaigns-alert-suppression.test.mjs:90-99`
replays breach, empty sync, same breach and asserts one alert.

## Write order: inbox row, then state, then channels

`anomaly-alerts.ts:150-158` writes the durable inbox row first, then commits the
suppression state, then sends webhook, outbound and mail. The comment gives the
reason exactly as the technique states it: with reminders off, an anomaly whose
delivery threw after a state-first write *would NEVER re-alert - the key just aged
out silently*; in this order a crash costs at worst a duplicate inbox row. The
anomaly key is `date|metric|kind` (`:66-69`); items are capped at `MAX_ITEMS = 5`
(`:28-29`) ranked by absolute z (`:125-127`), with the overflow counted (`:148`)
and the adverse-only money headline appended (`:138-141`).

## Grouping and the operator workflow stay outside detection

`groupAlertRecords` (`alert-suppression.ts:158-188`) groups by type plus the sorted
campaign-id set, so different campaign sets stay separate rows (`test:210`). The
workflow status is terminal on resolve and never regresses (`:204-223`, tests
`:173`, `:179`). `alertCampaignIds` (`:237-250`) skips synthetic `anomaly:` keys so
a one-click change-set never scopes to identifiers that match nothing
(`test:220`), and `isAlertActionable` (`:257-263`) admits only a fresh critical
alert that names real campaigns.

## Deviation

The hysteresis band for campaign keys is whatever the caller passes as `banded`;
the policy does not know what "warning" is. That is correct for a pure module, but
it means the band's definition lives at the call site and is not tested at the
policy level beyond the synthetic sequences here. The technique's rule - the band
is the next severity down - is a convention this tree follows by call-site
discipline rather than by type.
