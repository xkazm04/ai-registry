---
subject: alerting
domain: software-engineering
last_touched: 2026-09-29
dry_streak: 0
---

# alerting

First sweep: `dp-alr-0929`, dispatched by the registry's attention scan ("never swept by the
librarian"). Seven techniques and two applications, all forged 2026-08-18 to 08-21 and never
re-read. The golden path held; the gaps were in what its rules quietly assumed.

## 2026-09-29 - dp-alr-0929 (deepen)

Four lanes: primary-source counter-evidence on delivery, reminders and sustain; a survey of
absence-of-signal handling; a blind training-data lane; a read-only fleet-code lane over the
five joined projects.

- `dedup-and-cooldown` gained the delivery clock (a failed send must not spend the window
  unless delivery is a durable retried queue), the latest-attempt-per-channel outcome, and
  reminders as a distinct object from fires.
- `flap-control` was reconciled with it, its "single highest-value" sustain claim conditioned,
  and recovery holds given their reset-time cost.
- `absence-as-a-condition` is new: reached independently by the blind lane and the primary
  lane, sourced across four alerting systems and three heartbeat monitors.
- Applications: `rust--dedup-and-cooldown` (tracklight, personas, plus ascent and
  systedo-case as contrasts) and `next--absence-as-a-condition`; the two personas applications
  re-read at `df3c51ef71` (all seven deviations still true, two details corrected).

### Applied

1 experiment `better` (tracklight: a failed send burned the window; the retry found a trap in
the delivered predicate), 1 simulation `better` (reminders, personas), 1 `unapplied` (absence,
ascent: needs real observation rows).

### Impact

None stale. All 15 `alerting` pairs in the fleet map are `unknown` (never judged): tracklight 3,
pof 5, personas 3, pumper 1, kp 1, systedo-case 1, ascent 1. Nothing was judged against this
subject, so nothing went stale; the 15 pairs are `/conform` work.

## Open leads (banked, convergence rule applies)

- **Grouping and inhibition of correlated fires** (one dependency down, forty rules page). The
  blind lane ranked it fourth of five omissions; no primary lane ran. Return condition: a
  lane on the alert routers' grouping and inhibition semantics, or a fleet tree that grows a
  second correlated rule. `breach-alerting-and-attribution` already holds an inhibition layer
  for one class, which is where a cross-subject check should start.
- **Ack with an expiry.** An acknowledgment that never lapses parks a live problem. Recalled
  from paging tools' ack timeouts and one escalation-policy page that lets a repeat revert the
  ack; not verified on a primary page. Return condition: one primary read of a paging tool's
  ack-timeout semantics.
- **One evaluator versus HA pairs.** The golden path says exactly one evaluator; a widely
  deployed router runs identical evaluators and deduplicates downstream on a stable identity.
  That may be a second valid shape and the current wording may be too strict. Return
  condition: a primary read of that router's clustering documentation.
- **Actionability rate has no miss-rate partner** and the term looks registry-coined. Return
  condition: a source, or a rename.

## Decline-why

- The 8-of-10 quorum has no source anywhere in the lanes. It is given as an example in the
  technique, not as a rule, so it was left alone rather than deleted.
- "Three or four levels is the ceiling of human discrimination" is an unsourced claim; the
  rule that follows it (merge severities with the same reach) does not depend on it. Left.
