---
layer: technique
type: technique
subject: pipeline-aging-and-attention-triage
technique: aging-versus-stalled-two-tier-alerts
status: forged
laws: [no-adverse-outcome-is-solely-automated, a-candidates-process-never-stalls-on-your-constraints]
shared_with: []
use_when: [designing staleness severity, an alert means old but not what to do, an automation wants to act on a duration]
---

# Aging versus stalled: two-tier alerts

One badge that means "old" collapses two different situations into one word,
and therefore into one response — which means no response. Split the axis:

- **Aging** — past the stage's threshold. A *risk*. Somebody should look
  today. Soft tone, ordinary ranking weight.
- **Stalled** — far enough past it that "in progress" is no longer a credible
  reading. A *failure that already happened*. Assertive tone, high ranking
  weight, and usually addressed to whoever owns the process rather than only
  to the recruiter holding the row.

The two tiers exist because the actions differ. Aging is answered by doing the
next step. Stalled is answered by asking why the next step did not happen —
which is a different question, often about the process rather than the entry.

## Setting the second number

The stalled boundary is a multiple of the aging threshold, not an independent
constant, so the two move together when a stage's policy is retuned. Two to
three times is a defensible starting range and nothing more: below double the
tiers fire close enough together that the distinction is thin, and the case
against much above triple is a judgment about how long a salvage takes, not a
measurement. No published standard fixes it. Service-desk products escalate at
fractions of the time to breach, error-budget alerting derives its tiers from
how fast a budget burns, and alarm-management standards constrain how many
priority levels exist and how rarely the top one fires, not a time ratio. Take
the multiple as a prior and replace it with evidence when you have some: set
aging near the top of a stage's healthy completed dwell and stalled where the
stage's own withdrawals or lost candidates begin to rise, which a team can
read off its history once the sample discipline of the funnel-metrics
discipline is met. Whatever the multiple, state it once, per policy, and
derive both numbers from the same table that the per-stage-thresholds
technique publishes.

A multiple presumes both tiers run off the same dwell. At the offer role they
do not once the offer is sent: the second tier is the lapsed deadline, and the
multiple applies only while the offer is unsent (see the per-stage technique).

Do not set the stalled number from alert volume. If a stage produces many
stalled entries, that stage is broken; the tier is doing its job by saying so.

## Name the tiers once, for the whole system

The tiers travel across layers — a badge in the interface, a policy constant in
whatever engine computes the pipeline's daily pass, a column in a report — and
the observed failure is that the *names invert* on the way. One layer calls the
softer tier "aging" and the harder one "stalled"; another calls the softer one
"stale" and reserves "aging" for the harder. Both are internally consistent,
and together they guarantee that a conversation about "the aging alert" is
about two different populations depending on who is talking.

So: pick the ordering once, write it down where both layers can see it, and
prefer names that carry their own severity — a word that only means "old"
(aging, stale, dormant) is a bad tier name in *either* slot, because nothing in
it says which side of the pair it is. Cross-layer vocabulary drift is not a
naming quibble; it is how a policy number gets tuned against the wrong tier.

## An alert is an event: once per stint, per tier

Marking a row aging is a state that is true every day the row stays put; writing
an alert into a feed is an event. Conflating them turns the feed into a daily
repeat of "still waiting" for every row nobody has moved, which is the fastest
way to teach a recruiter to skip the feed. Write each tier's alert **once per stint
in a stage** (keyed on the moment the entry entered the stage), so the aging alert
and the stalled alert each appear once and the row's continuing state is carried by
the badge, which is recomputed and never written.

Two edges of the stint need stating. A move out of the stage ends the stint, so an
alert computed for the old stage must be dropped when the same pass advances the
entry, or the row written after the move sits inside the new stint and suppresses
that stint's own first alert. And the preview of a pass must use the same rule as the
commit through one shared function, or the forecast count and the feed disagree.
A per-day key is right only for an event that is genuinely new each day, such as a
repeated refusal, and wrong for a duration.

Once is a rule about the feed, not about visibility, and the other half has
to be built. Alerting tools default to re-notifying an unresolved alert (a
four-hour repeat interval is one common default), and a controlled trial of
appointment reminders found two beat one and one beat none, with diminishing
returns; those are reminders to a person, not evidence about a recruiter's
feed, but they say a single message to someone who was away or busy is lost.
A single write is safe only because the row stays in the state view every day
until it moves, so the badge, the queue and the count carry what the feed no
longer repeats. The stalled tier is the escalation: it is the second write,
addressed to whoever owns the process. Where a row stays stalled for a
further interval nobody chose, surface it to that owner again by a rule you
state; do not raise the cadence on the recruiter's feed.

## Both tiers nudge; neither acts

This is the hard constraint and it is not negotiable. An aging surface may
colour, rank, count, sort and nag. It may not advance, reject, close, archive
or auto-decline anything on the strength of a duration —
[no adverse outcome is solely automated](../../../_laws.md#no-adverse-outcome-is-solely-automated).

The reasoning is worth stating because the temptation is strong and looks like
hygiene. A dwell duration is a fact about *your* operation: your team's
capacity, your calendar, your approval chain. It is not evidence about the
candidate. Converting it into an adverse outcome — auto-rejecting entries that
sat too long, auto-archiving a "cold" pipeline — takes a failure that is yours
and charges it to them, and it does so at exactly the moment nobody was paying
attention, which is why nobody catches it. The same holds for the reverse
direction: an entry does not become urgent enough to skip a step because it
aged. Duration reorders the queue; it never changes the decision.

The one automated action a stalled tier may legitimately take is **notifying a
human** — and even that belongs to the communication discipline, which owns
whether the notification reached anyone and whether the candidate was told
anything.

## Tone belongs to the tier

Because the tiers mean different things, they should not look alike.

- Aging renders as an advisory: a neutral marker with the dwell in plain
  units. "Twelve days at this stage."
- Stalled renders as an assertion of failure, phrased about the process, not
  the person: "no movement in five weeks". Never phrase either tier in a way
  that reads as a judgment of the candidate — the row is a record of *your*
  silence.

Neither tier ever states a consequence it cannot deliver ("will be
auto-archived in 3 days" is only acceptable if that is both true and something
a human has approved, which per the law above it usually must not be).

## The clock does not pause for your reasons

Internal blockers do not downgrade a tier.
[A candidate's process never stalls on your constraints](../../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)
— a freeze, an outage, a vacation and a stuck approval are all reasons the wait
is happening, not reasons it is not. If a hold is genuine, express it as an
explicit hold with an owner and an expiry, visible on the row, and keep
counting underneath it so the hold itself can age. A suppression with no expiry
is how an entry vanishes for a quarter and reappears as a complaint.

## Decision rules

- When dwell exceeds the stage's aging threshold, mark aging.
- When dwell exceeds the stalled multiple of that threshold, mark stalled and
  replace the aging mark — an entry is in exactly one tier, never both.
- When an entry is stalled, rank it above ordinary aging entries and below
  anything blocked on a known human approval gate.
- When a tier's population for a stage exceeds a small share of that stage, do
  not retune the tier; escalate the stage.
- Write each tier's alert once per stint in the stage, drop it when the entry
  moves, and compute the preview through the same function as the commit.
- Never let either tier be an input to an advance, reject or close.

## When not to use this

- **Do not add a third and fourth tier.** Severity ladders past two levels
  stop mapping to distinct actions, and a tier with no distinct action is
  decoration.
- **Do not use tiers as a metric.** "Percentage stalled" is a tempting KPI and
  a bad one: it is a function of your thresholds, so it moves when you retune
  and reports progress you did not make. Measurement of dwell belongs to the
  funnel-metrics discipline, with its own sample rules.
- **Do not apply tiers to terminal entries at all** — see
  terminal-stages-never-age.
