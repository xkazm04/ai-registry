---
layer: application
type: application
subject: recruiting-cost-and-automation-economics
technique: per-action-manual-minute-estimates
stack: node
status: forged
verified_on: 2026-08-20
---

# A minutes-per-kind table, and the kinds it refuses to pay for

`app/_lib/automation-roi.ts:14` is the whole model in one exported constant:
`MINUTES_SAVED_PER_KIND`, a map from recorded event kind to "minutes a
recruiter would have spent doing this by hand", each entry carrying its human
sentence in a trailing comment. The header calls the shape of the claim
exactly right — "grounded in the real event trail (the same kind counts the
auto/human rollup folds), not a vanity number" — and the module is kept pure
and import-free so the arithmetic is unit-testable in isolation.

The estimates are per kind, not blended, and the spread is the information:

| kind | minutes | the sentence |
| --- | --- | --- |
| `interview_prep_generated` | 25 | assembling a tailored prep pack by hand |
| `interview_scorecard` | 20 | writing up a structured scorecard |
| `offer_drafted` | 15 | drafting an offer from the template + terms |
| `scored` | 8 | reading a CV and scoring it against the role |
| `outreach_sent` | 6 | composing + sending a first-touch message |
| `matched` / `rematched` | 5 | shortlisting a candidate against a role |
| `auto_rejected` | 5 | reviewing + writing a considered pass |
| `acknowledgement_sent` | 2 | the application-received reply |
| `screening_hold` | 2 | flagging a borderline for human review |

Twenty-five against two is a factor of twelve. Any blended
minutes-per-action would have made the two workspaces at either end of that
range report the same saving, and the header's claim to be grounded in the
event trail would have been true of the counts and false of the values. The
sanity check the technique asks for is also present, one file over: the
per-hire baseline of ~42 manual hours (`:36-46`) is the order-of-magnitude
anchor these estimates have to stay commensurate with.

## The exclusion list is the load-bearing half

The module comment states the exclusion rule as policy, not as an omission
(`automation-roi.ts:9-11`):

> The map intentionally lists ONLY automated kinds that REPLACE recruiter
> work — failure/sentinel kinds (`rejection_comms_failed`,
> `fairness_gate_unknown_archetype`, `intake_degraded`, `observed_minted`…)
> are excluded: they aren't saved labor.

Those four are the exact category the technique's zero-list names last and
which is easiest to sweep in by accident: a failed dispatch, a guard firing on
an unrecognised archetype, a degraded-intake marker. Each of them *created*
recruiter work. A model that paid out for them would not merely be inflated,
it would pay best on the days the system worked worst.

The enforcement is structural rather than advisory. The aggregation loop
(`:94`) iterates `Object.entries(MINUTES_SAVED_PER_KIND)` and reads counts out
of the group-by map — never the reverse — so a kind absent from the table
contributes nothing and a newly added event kind defaults to zero saving until
somebody writes its estimate and its sentence. That is the technique's "never
fall back to a blended average for unknown kinds" rule realized as control
flow: there is no fallback to fall back to.

## `advanced` is absent, and the comment says why

The sharpest single line in the file is the annotation on `auto_advanced: 3`
(`:25`):

> the policy pass moving a candidate a stage on (the machine's OWN advance).
> The human `advanced` is a recruiter click — NOT saved automation labor — so
> it is deliberately absent.

Two event kinds describe the same state transition. One is the system acting;
the other is a person deciding. The distinction is invisible in a rollup of
"stage advances" and is the entire difference between a saving and a cost —
which is the companion technique's argument, discovered here empirically and
recorded as a deliberate absence rather than an oversight. `auto_rejected`
carries the mirror annotation, naming which subsystem produces it (the
screening wave, actor `system`) and noting that the automation pass never
rejects unattended — it queues a `rejection_review`, a human step that
correspondingly earns no saving.

## Where the sampled unit lands

`app/_lib/metric-pack.ts:196` publishes `recruiter_hours_saved` with
`roi.totalActions` as its `sample`, not the hire count — the pack's contract
is that every metric carries `status`, `sample` and a `basis` sentence, and
this one's basis is stated in actions. That is the correct evidence unit for
this claim: the estimate averages over actions, so the floor and the basis
belong there.

The same file's assembly comment (`:169-173`) declines the comparison this
subject also declines:

> Deliberately does NOT compute a "% improvement vs before" — [there is] no
> pre-product baseline for a customer's own process, and inventing one is
> exactly the move that makes vendor metrics untrustworthy. The pack states
> what IS, with its sample; the comparison is the customer's to make against
> their own prior numbers.

## Deviations the standard does not soften

Two gaps against the technique, both worth naming rather than excusing.

**Assist-posture residuals are not modelled.** `interview_prep_generated`,
`offer_drafted` and `scored` all produce output a recruiter reads before
acting, yet each is booked at the full task estimate. The technique's residual
rule (task minutes minus review minutes) is not implemented anywhere in the
file, and the estimates are described as "conservative" without a stated
review deduction. The comments show the *distinction* is understood — that is
how `advanced` came to be excluded — but it is applied at the level of whole
event kinds rather than within them.

**A raised estimate silently restates history.** The map is a module constant
with no date-versioning, so changing any value moves every past period's
reported saving. The technique asks for that decision to be made explicitly;
here it is made by default.
