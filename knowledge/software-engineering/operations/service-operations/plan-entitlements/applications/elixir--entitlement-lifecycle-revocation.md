---
layer: application
type: application
subject: plan-entitlements
technique: entitlement-lifecycle-revocation
stack: elixir
verified_on: 2026-09-02
verified_against: elixir@1.20
---

# Lease, grace and lock in the Plausible Analytics billing path

How a hosted analytics product decides which subscription states still
entitle, what happens when a tenant outgrows a plan, and what it keeps doing
for a customer who has stopped paying. Citations are against
`plausible/analytics` commit `60e94c3` (2026-09-01), Elixir `1.20.4-otp-28`
per `.tool-versions`, under `lib/plausible/billing/`, `lib/plausible/teams/`
and `lib/workers/`. The payment provider is Paddle's classic API, whose
vocabulary is four statuses; the citations below are to the product's own
reading of that vocabulary, not to the provider's.

## 1. The closed set is written where the statuses are declared

`billing/subscription/status.ex:1-34` declares the vocabulary as a module
attribute — `@statuses [:active, :past_due, :paused, :deleted]` — and the
docstring above it states the access meaning of each, in the technique's own
shape: `active` "Can access stats"; `past_due` "Access to stats is still
granted", with the provider's retry schedule spelled out ("three retries —
after 3, 5, and 7 days"); `paused` — the state after "all the retries have
failed" — "Stats access restricted"; `deleted` "Access to stats should be
granted for the time the customer has already paid for". The `in?/2` macro
(`:45-55`) raises at compile time on any status outside the set, so a reader
cannot invent a fifth word.

`billing/subscriptions.ex:7-16` is the predicate every entitlement reader
calls: `active?` is true for `active`, true for `past_due`, true for `deleted`
only while `next_bill_date` is not before today, false for `paused` and for
`nil`. That is the technique's mapping clause for clause — including the
retries-exhausted state refusing while the paid-through cancellation still
grants — with one detail worth copying: the paid-through comparison is at
*date* granularity (`Date.before?(next_bill_date, Date.utc_today())`), which
gives the renewal boundary the rest of the day as leeway without anyone having
to write "leeway".

**Deviation.** `teams/billing.ex:713-720` (`active_subscription_query`)
selects on `status == active` alone, and `change_plan` (`:48-64`) reads
through it — so a `past_due` customer, whom `Subscriptions.active?` entitles,
cannot change plan. Two readers, two interpretations of the same vocabulary;
the technique's "a second interpretation is a second billing policy" is
exactly this, in miniature and probably harmless. The standard stays.

## 2. Ordering: a named transition is ignored, and the fetch replaces the payload

`billing/billing.ex:82-95` is the ordering incident as a code comment. When a
paused subscription is paid, the provider emits two `subscription_updated`
alerts "at the same time" — `paused → past_due` and `past_due → active` — and
"Relying on the time when the webhooks are sent has caused issues where
subscriptions have ended up `past_due` after a successful payment." The fix
is the cheaper of the two forms the technique names: the first transition is
recognized by its `old_status`/`status` pair and skipped (`irrelevant?`,
`:95-97`), so an intermediate state can no longer overwrite a final one.
Timestamps were tried and abandoned.

`handle_subscription_payment_succeeded` (`:131-154`) is the stronger form:
it does not read the next billing date from the event at all, but calls
`paddle_api().get_subscription/1` (`:135`) and writes `next_bill_date`,
`next_bill_amount` and `last_bill_date` from the provider's current object
(`:142-146`). The event is a trigger; the provider is the state.

Replay is handled where it costs. `handle_subscription_created` inserts with
`on_conflict: :nothing, conflict_target: :paddle_subscription_id` (`:63-66`)
— the provider's identifier is the idempotency key — and a duplicate is not
merely dropped: `handle_conflict` (`:276-296`) diffs the incoming changeset
against the stored row and reports to error tracking only when the replay
*differs* from what was stored (`:284-293`). Identical replays are silent;
divergent replays are a finding.

## 3. Grant time: an unknown tenant fails the delivery

`get_team!/1` (`billing.ex:156-177`) resolves the tenant from the checkout
passthrough and **raises** on anything it cannot parse (`:176`, `:189`,
`:200`). Every handler runs inside `Repo.transaction` (`:16-38`), so the raise
becomes an error tuple, and `PlausibleWeb.Api.PaddleController.webhook_response`
(`controllers/api/paddle_controller.ex:113-117`) turns that into a `400`. A
non-success response is what makes the provider retry, which is the
technique's "fail the delivery, never discard" rule realized by the stack's
default failure path rather than by a deliberate branch — the comment at
`:161-171` shows the authors were thinking about tenant resolution (a guest
who buys must not "shadow" an existing team's subscription, so a fresh team is
always created), not about early delivery, and the right behaviour fell out
of raising anyway. Worth noting because the honest form is to decide it on
purpose.

## 4. Outgrowing a plan: two cycles over, a margin, then a week

The subject's downgrade guard covers a subscription ending; this tree's most
developed path is the other direction — a customer who keeps paying but has
outgrown the tier. `workers/check_usage.ex` runs daily (`:1-6`) over
subscribers whose status is `active`, `past_due` or not-yet-expired `deleted`
(`:56-60`), on each team's billing anniversary day (`:65-66`, with a comment
handling the 31st-of-February case). A regular subscriber is over limit only
when **both** of the last two full billing cycles exceed the plan's volume
(`billing/qouta/quota.ex:135-138`) **and** the comparison is made against the
limit plus a margin (`:141-147`; the module docstring at `:188-203` states
the policy: warnings against the base figure, enforcement against a 10%
margin). Crossing it sends an email and starts a seven-day grace period
(`check_usage.ex:114-130`; `teams/grace_period.ex:34-42`). A second worker,
`workers/lock_sites.ex`, walks every team daily and calls
`SiteLocker.update_for/2` (`billing/site_locker.ex:14-49`), which sets
`locked` and ends the grace period the first time it finds it expired
(`:23-34`), distinguishing "ended now" from "ended already" so the
notification fires once.

The grace period names its reaper twice. It is removed on *any* subscription
update (`billing.ex:253`, in `after_subscription_update`) — an upgrade clears
it — and by the usage worker itself when last-cycle usage falls back under the
limit (`check_usage.ex:103-112`). Enterprise agreements get a different
object: a manual lock with no end date (`grace_period.ex:50-58`;
`check_usage.ex:132-161`), enforced by a person from the CRM, and enterprise
teams may always add sites even over limit "to avoid service disruption"
(`teams/billing.ex:170-176`). That is the technique's "contractual and
manually administered" clause given its own data shape.

## 5. What survives: the dashboard locks, the collector keeps running

This is the tree's clearest contribution to the subject, and it inverts the
ladder's first rung. When a team is locked the **read** surface closes —
`dashboard_locked` is the highest-priority notice after "trial ended"
(`quota.ex:234-239`) — but **ingestion does not stop**. Each team carries an
`accept_traffic_until` date (`teams/team.ex:45`), recomputed on every
subscription event (`billing.ex:150`, `:252`): thirty days past
`next_bill_date` for a subscriber (`team.ex:22`; `teams.ex:293-296`),
fourteen days past expiry for a trial (`team.ex:21`; `teams.ex:285-288`), and
the year 2135 for the free plan (`teams.ex:14`, `:290-291`). The only place
that reads it is the ingestion gatekeeper (`site/gate_keeper.ex:44-49`),
which refuses events after the date. So a lapsed customer's data keeps
arriving for a bounded window while the thing they would pay to see is
withheld — the reversible side is stopped, the irreversible side continues —
and nothing is deleted on either path. The technique's ladder now says this
in general terms; this tree is where it was read from.

`accept_traffic_until/1` also has an honest last branch: a team that is
neither on trial nor subscribed **raises** with "Manual intervention
required" (`teams.ex:298-299`) rather than computing a default. An
unclassifiable tenant is a loud failure, not a quiet grant.

## 6. An unknown tier value resolves in two directions at once

The subject's rule is that an unrecognized tier string on a real tenant floors.
Here two resolvers disagree. `allowed_features_for/1`
(`teams/billing.ex:687-712`) maps an unrecognized plan to `[]` plus the
always-free features (`:700-705`) — the floor. But `monthly_pageview_limit/1`
(`:315-332`) maps the same unrecognized plan to the *trial* limit, which is
`:unlimited` (`:304`, `:326-331`) — the ceiling — after reporting it. The
report is the technique's "counted" clause done right; the default is the
"hole, not floor" case it warns about, on the one limit whose enforcement
locks dashboards. Same tenant, same bad string, one resolver under-grants and
the other over-grants. The standard stays: one fallback, at the floor, in one
place.

## 7. The deployment mode is a compile-time branch, one helper at a time

The community edition never gates. `on_ee`/`on_ce` (`lib/plausible.ex:15-21`)
compile one branch or the other, and every commercial helper carries its own
pair: `site_limit` → `:unlimited` (`teams/billing.ex:223-224`),
`team_member_limit` → `:unlimited` (`:259-262`), `features_usage` → `[]`
(`:633-634`), `accept_traffic_until` → the year 2135 (`teams.ex:303-305`),
and `on_trial?` → `always(true)` (`teams.ex:64-65`). Capability access in the
community build therefore arrives through the trial branch of
`allowed_features_for` — `Feature.list() -- [SitesAPI, SSO]` (`:700-703`),
which withholds the two enterprise-only modules. That is the
deployment-mode technique's "different deployments genuinely sell different
capabilities" case, expressed as a subtraction inside a perpetual-trial
predicate rather than as a mode field the model reads. It works; it is also
the "enforced by remembering" arrangement — a new commercial helper that
forgets its `on_ee` pair gates the free build — and the standard remains a
single mode declaration read by one door.

## Reconciliation summary

Confirmed: the status-to-entitlement mapping as a closed, compile-checked
set, with paid-through cancellation granting and retries-exhausted refusing;
ordering handled by named transitions and by fetching the provider's object,
after timestamps failed in production; replay keyed on the provider's
subscription identifier, with divergent replays surfaced; grant-time unknown
tenants failing the delivery; a bounded grace window with two reapers; nothing
deleted on lapse. Read from this tree into the technique: the reversibility
rule behind the survival ladder (lock reads, keep collecting), and the
sustained-over-two-cycles-plus-margin shape of quota enforcement, which stays
here as a measured practice rather than a universal. Deviations: a second,
`active`-only reading of the vocabulary on the plan-change path; an
unrecognized plan resolving to `:unlimited` on the pageview limit while
resolving to the floor on features; the mode short-circuit repeated per
helper instead of held at one door.
