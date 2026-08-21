---
layer: application
type: application
subject: pipeline-aging-and-attention-triage
technique: aging-versus-stalled-two-tier-alerts
stack: process
status: forged
verified_on: 2026-08-20
---

# Two tiers in the automation policy pass (process)

The daily policy pass lives in the spawned Python analysis pipeline, and its
two-tier alerting is four lines of `pipeline/jobfit/automation.py`.

## The numbers

`POLICY` (`:62-73`) is the file's single rules table — "Task 7 thresholds —
tunable per market/season (the only place rules live)". Two of its entries are
this technique's:

```
"stale_days": 21,
"aging_days": 30,
```

The ratio is 30/21 ≈ 1.43, well below the two-to-three-times separation the
standard recommends: the two tiers fire nine days apart on a three-week base,
close enough that a single week of inattention crosses both.

## The tiers only nudge

`:342-349` is the whole alerting mechanism, and it is deliberately inert:

```
alerts: list[str] = []
if days >= POLICY["aging_days"]:
    alerts.append("aging_alert")
elif days >= POLICY["stale_days"]:
    alerts.append("stale_alert")

def out(action, to_stage, reason):
    return {"action": action, "toStage": to_stage, "alerts": alerts, "reason": reason}
```

`alerts` rides *alongside* `action` and never sets it. Every `return out(...)`
below chooses its action from stage, score, archetype and approval state; no
branch anywhere in the pass reads `days` to advance, reject or close an entry.
That is the standard's hard constraint — a duration reorders and annotates,
never decides — realized as a structural separation rather than a review rule.
The surrounding fairness posture is consistent with it: `RECOMMENDATION_FALLBACK
= "hold"` (`:88-92`) because a malformed verdict must "never silently `advance`
… or `reject`", and early-career archetypes are never auto-advanced or
auto-rejected (`:74-76`).

The `elif` is also correct against the standard: an entry is in exactly one
tier, never both.

## Deviation: the vocabulary is inverted against the interface layer

Here `stale_days` (21) is the **softer** tier and `aging_days` (30) the harder
one. In the recruiter-facing layer the same pair reads the other way round:
`app/features/shared/pipelineTypes.ts:110` calls its flat legacy constant
`STALE_DAYS` and its per-stage table `STAGE_SLA_DEFAULTS` for what the board
badges call *aging*, at 3–14 days. So "aging" names the mild state in one layer
and the severe state in the other, and the two scales differ by an order of
magnitude on top of that. This is exactly the cross-layer drift the standard
warns about: a conversation about "the aging threshold" is about two different
populations depending on which layer the speaker works in.

## Deviation: one global cut, not per stage

`stale_days` and `aging_days` are workspace-wide constants applied to
`days = int(entry.get("daysInStage") or 0)` (`:337`) regardless of stage, while
the interface layer has per-stage thresholds. The pass therefore reproduces the
blunt global cut in the one place a scheduled sweep would most benefit from
stage sensitivity — an offer with 21 days of silence and an intake row with 21
days of silence emit the same alert.

## Deviation: not tunable at runtime

The header comment claims the numbers are "tunable per market/season", but
there is no override mechanism: changing one is a code deploy. The repo's own
harness review records this against a sibling rule that *is* recruiter-tunable
in the interface (`docs/harness/ambiguity-biz-2026-06-25/hiring-automation-scheduler.md:9`),
noting that "the product already establishes the expectation that recruiters set
their own gates — just not for the gates that actually drive the scheduler", and
that none of the constants carries recorded reasoning for its value. Against the
standard, a policy layer with no override path and no derivation for its numbers
is the half-tunable failure mode.

## The coercion, and the counter-example beside it

`:337` reads `days = int(entry.get("daysInStage") or 0)` — a missing duration
becomes zero and therefore never alerts. Two lines above, the same function is
explicit that the identical reflex is a defect for a *score*: `scored = score >
0`, with the docstring at `:239-245` warning that without it an unscored entry
"would collapse to `int(None or 0) == 0` and be rejected for `0 <
bau_reject_score`, silently turning a data gap into a rejection." The duration
coercion happens to land on silence, which is the posture the standard
prescribes for an advisory badge — but by accident of arithmetic rather than by
an explicit unmeasured state, and the same file demonstrates on the line above
that the authors know the difference.
