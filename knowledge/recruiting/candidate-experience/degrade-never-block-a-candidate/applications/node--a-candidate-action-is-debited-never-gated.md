---
layer: application
type: application
subject: degrade-never-block-a-candidate
technique: a-candidate-action-is-debited-never-gated
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
applied: simulation
ab_verdict: unmeasurable
---

# The two outcome meters, gated differently — TypeScript/Next.js

KP prices outcomes, not compute. `app/_lib/billing/plans.ts:31` declares the meters as
`["job_posts", "hires", "ai_candidates", "case_designs", "interview_minutes"]` — the
headline units are "a role taken to market" and "a person hired", with `ai_candidates`
deliberately demoted to a safety net that bounds a runaway (`plans.ts:18-23`).

The spine of this subject is the comment at `plans.ts:25-30`, which states the
asymmetry as load-bearing rather than incidental:

> The two outcome meters are gated DIFFERENTLY, and the difference is load-bearing:
> `job_posts` is a RECRUITER action, so it gates (402) […] `hires` is a CANDIDATE
> action. It is DEBITED BUT NEVER GATED: a candidate accepting an offer must not fail
> because the recruiter is over quota. Overage is billed, never blocked.

## Two enforcement shapes, not three

`app/_lib/billing/enforce.ts:1-13` defines exactly two, keyed to what the action costs
and who initiated it: HARD GATE (402) for actions that create new metered work, and
DEGRADE (`--no-llm`) for per-candidate garnish. There is no third, softer shape.

- **Gate:** `meterGate()` (`enforce.ts:73`) returns `null` to proceed or a
  `QuotaVerdict` the route turns into a 402 carrying a registered refusal code,
  `QUOTA_CODE = "BILLING_QUOTA_EXCEEDED"` (`enforce.ts:28`; it replaced the bare
  `"quota_exceeded"` string on 2026-09-04). `jobPostGate()` (`enforce.ts:131`) is its
  only outcome-meter caller, invoked at `app/api/jobs/[id]/publish/route.ts:143` inside
  the transaction opened at `:119`, and only when the transition is billable.
- **Debit:** `recordMeterUsage("hires", 1, …)` at `app/_lib/offer-finalize.ts:132`,
  on the candidate's own accept — with a comment that spells out the prohibition:
  "There is no meterGate before it and there must not be."

`app/_lib/billing-gate.test.ts:327` ("hires debit past the included allowance rather
than refusing") pins the behaviour end to end: two hires recorded on a Free plan that
includes one, `"both hires are recorded, neither is refused"` (`:333`),
while `meterAllowance("hires", …).allowed` goes false so Billing can see the org is
over. The overage is visible; the candidate is not blocked.

## The debit is subordinate to the acceptance

Three details in `offer-finalize.ts` are what make "never gated" true in
practice rather than in principle:

1. **Idempotent by construction.** `markOfferResponded` (`:76`) is a DB compare-and-swap, so
   only the first responder gets `claimed`; the meter fires exactly once per hire even
   if the candidate double-clicks or the link is opened twice.
2. **Best-effort.** The `recordMeterUsage` call sits in a `try/catch` that logs
   `"hired … but the hire meter did not record"` (`:135`) — a metering fault must not turn a
   successful acceptance into an error.
3. **Conditional on the real hire.** The debit runs only when
   `actOnPipelineEntry(…, "accept", … { actor: "system" })` (`:88`) advanced the entry
   *onto the terminal stage by role*: `hired = advanced && !wasTerminal &&
   stageHasRole(advanced.stage, "terminal", axis)` (`:104-106`). A stale offer link
   accepted after the candidate was closed elsewhere records an `offer_accept_blocked`
   event (`:113`) instead of resurrecting them and billing for it. A board with a
   column after the offer step is the case that forced the role test: accepting there
   moves the candidate one stage, onto something like a background check, and no hire
   is debited until they reach the terminal column (`offer-lifecycle.test.ts:274`).
   That is also where the golden path now puts an identity control: after the
   acceptance, which is recorded and never refused, and before the start.

## Gate and debit resolve through one function

The technique's "reserve the worst case, single-sourced" rule is realized by
`resolvedLimit()` (`app/_lib/billing/entitlements.ts:212-214`, contract at `:199-211`), which both the read
path and the write path go through so "the amount gated and the amount debited can
never diverge" — pinned by `app/_lib/billing/meter-attribution.test.ts:62`. The
interview-minutes case is the concrete bug this closed:
`maxBillableInterviewMin()` (`enforce.ts:103`) is the 2× ceiling `/complete` debits,
and `meterGate`'s `minUnits` parameter (`enforce.ts:52-58`) requires the create-time
gate to reserve that same number rather than the booked-length constant it used to.

`meterGate`'s `inFlight` parameter (`enforce.ts:60-67`) closes the check-then-act
window: queued analyze tasks that each debit at delivery are subtracted from
`remaining`, and callers must leave no `await` between counting them and inserting the
task row.

## Unidentifiable scope falls to the floor as itself

`billingOrgForWorkspace()` (`entitlements.ts:35`) maps an anonymous demo workspace with
no org link to **itself** as a billing scope — fail-closed on purpose
(`entitlements.ts:25-34`): it reads no `billing_state` row, so it gets the free plan,
and its usage rows can never pollute or spend a real org's meters.

## Deviations from the standard

- The golden path asks that overage be **surfaced to the operator as an account-level
  signal at the moment it happens**. Here it is observable through `meterAllowance` and
  the Billing panel, but nothing pushes a notification when a hire debits past the
  allowance. The standard stays: silent overage is a billing surprise.
- The standard's "cap by contract, suspend operator capabilities" lever is not
  implemented — there is no bounded-overage suspension path, only unbounded billing.

## The fraud-hold condition, tried here (2026-09-29)

The technique used to say a deadline-bearing candidate action is never gated "under any
circumstance, including fraud holds". It now says billing state never gates it, and an
identity control holds it through a person, with the deadline extended, and preferably
after acceptance. The only real placement KP has is the post-offer column above: the
acceptance is recorded, the check sits between it and the hire, and the hire meter
waits. Both wordings accept that placement, and KP has no control *before*
acceptance for them to disagree on. Unmeasurable here; the return condition is a project
that holds an acceptance for identity review.
