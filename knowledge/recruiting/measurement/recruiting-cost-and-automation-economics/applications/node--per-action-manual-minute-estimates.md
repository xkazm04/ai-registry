---
layer: application
type: application
subject: recruiting-cost-and-automation-economics
technique: per-action-manual-minute-estimates
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
---

# A minutes-per-kind table, and the kinds it refuses to pay for

`app/_lib/automation-roi.ts:14` (kp at its committed `0c6c9e39c`, read 2026-09-29; the
file is unchanged since 2026-08-18) is the whole model in one exported constant:
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
| `rejection_sent` / `interview_invite_sent` | 4 | composing + sending the note or the invite + link |
| `auto_advanced` | 3 | the policy pass moving a candidate a stage on |
| `acknowledgement_sent` / `interview_reminder_sent` | 2 | the application-received reply; the nudge before a screen |
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
(`:25`, which now ends with a pointer to the UI scan finding that raised it):

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

`app/_lib/metric-pack.ts:265-273` publishes `recruiter_hours_saved` with
`roi.totalActions` as its `sample`, not the hire count — the pack's contract
is that every metric carries `status`, `sample` and a `basis` sentence, and
this one's basis is stated in actions. That is the correct evidence unit for
this claim: the estimate averages over actions, so the floor and the basis
belong there.

The floor is set in actions too (`MIN_SAMPLE * 5`, with a comment that a team
can accumulate hundreds of actions before its first hire closes). The same file's
assembly comment (`:231-236`) declines the comparison this
subject also declines:

> Deliberately does NOT compute a "% improvement vs before" — [there is] no
> pre-product baseline for a customer's own process, and inventing one is
> exactly the move that makes vendor metrics untrustworthy. The pack states
> what IS, with its sample; the comparison is the customer's to make against
> their own prior numbers.

## Deviations the standard does not soften

Four gaps against the technique, each worth naming rather than excusing.

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

**A bulk approval books a full considered pass per item.** `auto_rejected` is
booked at 5 minutes, "reviewing + writing a considered pass", and its own
annotation says it is produced by the screen-wave bulk reject
(`screen-wave.ts`), not by the unattended pass. In that flow a reviewer approves
a wave and may spare individuals in the preview; the spare is recorded as a human
act (`screen_wave_recruiter_spared`, `screen-wave.ts:425-435`, actor
`human:<approver>`) and earns no minutes, which is the technique's own rule for
a click. But the approval that lets every unspared rejection through is one
gesture, and the technique says the per-item review time of a bulk approval is
close to nothing and is a review-quality observation, not a saving to book. The
5 minutes is therefore the *writing* of the pass valued as if the wave were
read item by item, and nothing in the trail records that it was.

**The vocabulary has grown and the table has held.** Six event kinds were added
to the catalogue after 2026-08-20 (`approval_set`, `interview_failover`,
`offer_comms_failed`, `outreach_opted_out`, `screen_wave_holdout_unsealed`,
`screen_wave_recruiter_spared`; `rejection_drafted` is likewise absent). None is in the
table, so each earns zero. That is the unknown-kind rule holding by control flow
rather than by anyone's review, and it is the safe outcome for these: by name none reads as work a
recruiter would otherwise have done (the emitters were not each opened).

**Whether the kinds add up is unasked.** The table pays `scored` (8),
`matched` (5) and `auto_rejected` (5) as separate kinds, and the sentences
describe overlapping human work on one candidate: read and score against a role,
shortlist against a role, review and pass. Whether one candidate's pass emits
all three, and whether a person would have done three separate tasks, was not
resolved from the tree (`scored` is emitted at `automation-pass.ts:349`; the
others come from other paths). The technique's overlap rule makes it a question
to answer from the recorded trail before the sum is quoted.
