---
layer: application
type: application
subject: recruiting-cost-and-automation-economics
technique: per-action-manual-minute-estimates
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
applied: simulation
ab_verdict: not-better
---

# A minutes-per-kind table, and the kinds it refuses to pay for

`app/_lib/automation-roi.ts:14` is the whole model in one exported constant:
`MINUTES_SAVED_PER_KIND`, a map from recorded event kind to "minutes a
recruiter would have spent doing this by hand", each entry carrying its human
sentence in a trailing comment. The header calls the shape of the claim
exactly right — "grounded in the real event trail (the same kind counts the
auto/human rollup folds), not a vanity number" — and the module is kept pure
and import-free so the arithmetic is unit-testable in isolation.

The estimates are per kind, not blended, and the spread is the information. The
table below shows ten of the
fourteen kinds the constant now holds; the other four are `rejection_sent` (4),
`interview_invite_sent` (4), `auto_advanced` (3, discussed below) and
`interview_reminder_sent` (2):

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

`app/_lib/metric-pack.ts:266-270` publishes `recruiter_hours_saved` with
`roi.totalActions` as its `sample`, not the hire count — the pack's contract
is that every metric carries `status`, `sample` and a `basis` sentence, and
this one's basis is stated in actions. That is the correct evidence unit for
this claim: the estimate averages over actions, so the floor and the basis
belong there.

The same file's assembly comment (`:231-235`) declines the comparison this
subject also declines:

> Deliberately does NOT compute a "% improvement vs before" — kp has no
> pre-kp baseline for a customer's own process, and inventing one is
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

Re-read 2026-09-29 against kp at f63450548 (Node 24): both deviations above
still stand, the file's estimates are unchanged, and three further findings
belong to the standard, not to a preference.

**The default baseline has no source.** `automation-roi.ts:36-46` calls 42 hours
a "research anchor" (~40-51 h, about 23 h screening, about 13 h sourcing).
Neither of two independent lanes could name a study, a year or a population for
it; the web lane found the only "42" in the benchmarking literature to be a
time-to-fill in days. The override is genuine (the panel exposes both the rate
and the baseline as editable inputs), but the panel prints the effective number
with no mark of whether it is the default or the team's own, and the input
component carries no default marker or editing actor. The seed the technique
asks to be cited is uncited.

**The headline converts hours to currency.** The panel's headline is "about {hours}
recruiter-hours, about {czk} CZK" (`messages/en.json`, `insights.roi.headline`),
with the rate stated in the basis line. The golden path's rule is hours as
hours, because conversion asserts a reallocation; the editable rate is an
owner for the rate, not for the reallocation.

**Simulation: gross versus net (`applied: simulation`, `not-better`).** The golden
path now says a saving printed under the name ROI is gross until the cost of
the automation stands beside it. Three real cases from the tree, walked with
the tree's own `automationRoi` at the pinned commit, the FX rate bounded at
15-30 CZK per USD purely as a stated assumption (the product converts nothing):

1. The KAT-ANA-4 reproduction in `db/analytics.ts`: 6 closed hires, 31% of the
   baseline, so 13.0 h and 7,812 CZK per hire, against $10.40 compute per hire.
   Cost is 2-4% of the gross saving.
2. The `automation-roi.test.ts` fixture (100 `scored` and 50 `matched` over 5
   hires): 3.5 h and 2,100 CZK per hire. At the ledger fixture's $0.01-0.02
   per call the cost is 0.2-0.9% of gross.
3. The ledger fixture in `compute-cost.test.ts`: one of three rows is NULL-cost,
   so any net computed from it subtracts an understated cost. Netting is not
   computable there; the panel already counts `unpricedCalls`.

A boundary probe, not a case: one fixture row is priced at $5 (an analyze call).
Priced that way, the same 150 calls cost 107-214% of the gross. Per action the
break-even is `minutes x 600 / 60` CZK: 80 CZK (about $2.7-5.3) for `scored`,
50 CZK for `matched`.

Verdict `not-better`: at the prices the tree records, netting moves the headline
by under five per cent, so it is not what makes this panel honest, and the
technique gains its materiality condition instead. The falsifier is a single
per-action price at or above the row above; the panel has no such check today.
The ROI panel is titled "ROI: what the automation saved" and the cost panel is a
separate section in another currency, which is the golden path's recommended
shape.
