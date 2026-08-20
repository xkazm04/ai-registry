---
layer: golden-path
type: golden-path
subject: pipeline-aging-and-attention-triage
status: forged
use_when: [deciding what a recruiter sees first, designing staleness or aging badges, building an attention or to-do surface, choosing alert thresholds for a pipeline]
techniques:
  - per-stage-aging-thresholds-not-one-global-cut
  - terminal-stages-never-age
  - aging-versus-stalled-two-tier-alerts
  - attention-queue-ordering-and-rationale
  - badges-degrade-rather-than-error
  - overridable-defaults-with-a-server-side-approximation
---

# Pipeline aging and attention triage

A pipeline that is full is not a pipeline that is working. Every hiring system
past its first week holds more open entries than any human will look at today,
and the only real question the software answers is **which ones, and why those**.
This subject is that question: how a workspace decides what a recruiter should
look at next, and what it costs a person when nobody looks at all.

The naive reading treats this as a productivity feature — a dashboard, a
counter, a nudge to keep the funnel moving. That reading produces surfaces that
are technically correct and operationally useless: badges that fire on every
row, a to-do list ordered by whatever the query returned, an alert that means
"this is old" without ever meaning "do something". The principal reading is
narrower and much harder: **an aging threshold is a promise with a clock on it.**
Somewhere there is a person who applied, or interviewed, or accepted an
invitation to talk, and who cannot see your queue, cannot see your headcount
freeze, and cannot tell the difference between "we are still deliberating" and
"we forgot". The threshold is the operational form of your commitment to that
person — the point at which your silence stops being process and starts being
neglect. Efficiency is a side effect of keeping it; it is not the reason.

That reframing changes the design in a way nothing else does. If aging is an
efficiency metric, the correct response to too many alerts is to raise the
threshold. If aging is a promise, the correct response is to *fix the promise*
— either work the queue or admit that your commitment at that stage was never
seven days. A team that quietly raises its thresholds until the board is green
has not improved anything; it has renegotiated a contract with the candidate
without telling them.

## The pipeline never stalls on your constraints

The bluntest expression of this is the invariant that
[a candidate's process never stalls on your constraints](../_laws.md#a-candidates-process-never-stalls-on-your-constraints).
Your hiring manager's holiday, your budget review, your outage — these are
yours. They are legitimate reasons for a delay and never reasons to stop
counting one. A well-built aging surface counts through every internal excuse,
precisely because the excuses are what make a candidate's wait invisible to the
people responsible for it. You honour a real internal blocker by *telling the
candidate* — neighbouring craft — not by pausing the clock.

## Four objects, not one

Sloppy versions of this subject collapse four distinct things into one number.
Keep them apart:

- **Dwell** — how long an entry has been at its current stage. A raw duration.
  A fact, not a judgment.
- **Aging** — dwell that has passed a threshold appropriate to *that* stage.
  A soft state: this deserves a look.
- **Stalled** — dwell far enough past the threshold that the entry is best
  read as forgotten rather than in progress. A hard state: this is a failure
  already, not a risk.
- **Attention** — the ranked, reasoned list of things a human should act on
  now, of which aging is only one contributor. Waiting-on-a-human-approval,
  an interview tomorrow, a role that never got published, a brand-new arrival
  nobody has touched: none of these are aging, and all of them outrank most
  aging entries on a given morning.

Dwell as a *measurement* — median time-in-stage, cohort comparisons, funnel
throughput — belongs to recruiting funnel metrics, a sibling discipline. The
seam is sharp and worth stating: metrics answer "how is our process
performing"; triage answers "what should this person do in the next ten
minutes". The same duration feeds both, and they want opposite things from it.
A metric wants stability, cohorts, and a stated sample. An alert wants a single
row, a threshold, and an action. Building one on top of the other's
requirements produces an alert nobody trusts and a metric nobody can compute.

## Thresholds belong to stages, not to pipelines

The single most common defect in this subject is one global staleness cut —
fourteen days, say — applied to every entry in the workspace. It is wrong in
both directions simultaneously, and the worked contrast makes it obvious:
**ten days in an offer stage is a stall; ten days at intake is normal.** An
offer with no answer for a week and a half means something has gone wrong that
somebody must chase today. An application sitting in a fresh-arrivals column
for ten days in a high-volume funnel is unremarkable, and flagging it trains
recruiters to ignore the badge — which then fails to fire when it matters.

So thresholds are per stage, and specifically per stage *role* — entry,
screening, interview, offer, terminal — never per stage *name*. The stage-role
vocabulary itself is owned by the sibling subject on pipeline stage modelling;
this subject only consumes it, and does so for one hard-won reason.
[Meaning does not live in a label](../_laws.md#meaning-does-not-live-in-a-label):
teams rename their columns constantly, and any rule keyed off a display string
silently changes what it means the moment somebody edits a board. The failure
mode is not a crash. It is a badge that quietly stops firing, or starts firing
on the wrong column, with nothing in the interface admitting the change. That
is worse than an error, because the surface still looks confident.

## Terminal stages do not age

The corollary that catches every implementation the first time: an entry in a
terminal stage — hired, rejected, withdrawn — has no clock. It is not waiting.
Yet the naive query says "where dwell exceeds threshold", and a candidate
rejected four months ago satisfies it forever, so the surface's worst offenders
sit permanently at the top and can never be cleared. A queue that cannot reach
empty is not a queue; it is decoration. Terminal exclusion is what makes the
whole surface actionable.

## Two tiers, because "old" and "abandoned" are different actions

One badge that means "old" collapses two responses that are not the same. The
mature shape is two tiers with distinct policy numbers: an **aging** tier that
nudges and stays soft, and a **stalled** tier that asserts a failure has
already occurred. They differ in tone, in ranking weight, and in who they are
addressed to — aging speaks to the recruiter, stalled usually speaks to whoever
owns the process. Neither of them acts. This is not a hedge; it is the same
law that governs the rest of hiring automation:
[no adverse outcome is solely automated](../_laws.md#no-adverse-outcome-is-solely-automated).
An aging surface may surface, rank, colour and nag. It may not advance,
reject, close, or auto-archive anything, however confident the duration is. The
number of days a person has waited is a fact about your operation; it is not
evidence about them, and it may never become a reason to reject them.

## An attention queue is a set of queues, each carrying its reason

The strongest version of this surface is not one blended relevance score. It is
a small, closed set of named queues — each with a written rationale for why its
members earn a human's attention — merged into one ranked strip. Waiting on a
recognised human approval gate. Active and past its stage's threshold.
Interview confirmed and imminent. Ingested but never published. Arrived and
untouched. Each entry can answer "why am I here" in one sentence that a
recruiter would accept, and that sentence is the entry's own, not a global
explanation of the algorithm.

This matters beyond usability. A queue ordered by a tuned opaque score cannot be
argued with, audited, or corrected when it is wrong — and it is wrong
constantly, because its inputs are operational proxies for human urgency. Named
queues with stated rationales are reviewable by a recruiting lead who has never
read the code, which is the only review that ever actually happens. It also
keeps the surface honest per
[say only what the record holds](../_laws.md#say-only-what-the-record-holds):
the reason shown is the condition that put the row there, not a generated
explanation of it.

Ranking between queues is a policy decision, not a technical one, and it should
be stated as such. The defensible default puts a waiting-on-a-human gate first
(somebody is blocked on a decision that is already known to be needed), then
stalled entries, then imminent interviews, then aging, then the housekeeping
queues. And the attention strip as a whole outranks workspace setup and
onboarding checklists on the screen — because a stalled application is a person
waiting, and finishing your workspace configuration is not.

## Badges degrade; they do not fail

The aging badge sits on a list that renders whether or not the badge can be
computed. Treat its computation as best-effort by construction: if the stage
role cannot be resolved, if the timestamp is missing, if the policy table has
no entry for that role, the badge renders as absent — not as zero days, not as
"fresh", and never as a failed list. This is
[absence of evidence is not evidence](../_laws.md#absence-of-evidence-is-not-evidence)
applied to an operational surface: a green badge computed from a null timestamp
is a lie that flatters the team.

## Defaults are overridable, and the shared surface says it approximates

A high-volume graduate funnel and an executive search do not share a definition
of "too long", and a system that refuses per-board overrides gets worked around
with spreadsheets. But a local override lives with the board that set it, while
a shared surface — a workspace counter, a badge computed once for everybody —
often cannot see it. The mature answer is neither to pretend nor to abandon the
shared surface: compute it from the published defaults, declare it an
**approximation**, and let the per-board view be the authority. This is the
shape of
[a claim carries its sample and its basis](../_laws.md#a-claim-carries-its-sample-and-its-basis)
for an operational counter: the number states what policy it was computed
under, so the recruiter who tuned their own board is never confused about why
the two disagree.

## Seams with the neighbours

State these boundaries explicitly, because triage is the surface every other
pipeline discipline wants to borrow:

- **Stage modelling** owns the stage-role vocabulary and the mapping from a
  team's named columns onto it. This subject consumes those roles and adds a
  duration policy per role. If you find yourself defining what "screening"
  means, you have crossed the seam.
- **Interview calendar integrity** and **candidate self-scheduling** own
  scheduling lifecycles — invitation states, grace windows, confirmation and
  no-show handling. Triage may surface an imminent interview and may surface an
  invitation that nobody responded to, and it must take the lifecycle bucket
  from the scheduling discipline rather than recomputing one. A second,
  private notion of "is this interview still live" is how the same interview
  shows as confirmed in one place and vanished in another.
- **Candidate communication integrity** owns whether a nudge actually reached
  anyone. Triage's job ends at surfacing the row; it may not claim a candidate
  was chased because a reminder was generated.
- **Funnel metrics** own dwell as a measurement — medians, cohorts,
  bottleneck analysis, and the sample discipline that goes with them. Triage
  owns dwell as an alert.

## The failure modes, named

- **The green board.** Thresholds tuned upward until nothing fires. The
  surface reports health it does not have, and the promise to waiting people
  was silently renegotiated.
- **The permanent top row.** Terminal entries that age forever, so the queue
  never empties and stops being read.
- **The renamed column.** A rule keyed off a stage's display name, working
  perfectly until someone edits a board, then wrong with no signal.
- **The blended score.** One opaque urgency number that nobody can argue with,
  audit, or fix.
- **The alert that acts.** Automation that closes, archives or rejects on a
  duration, converting an operational fact about your team into an adverse
  outcome for a person.
- **The confident null.** A badge computed from a missing timestamp rendering
  as fresh, which is the only badge state worse than no badge at all.
- **The inverted vocabulary.** Two layers of the same system using "aging" and
  "stale" for opposite tiers, so a threshold gets tuned against the wrong
  population and nobody notices for a quarter.
- **The incomplete partition.** Queues written as a list of interesting cases
  rather than a total partition, so a live item satisfying none of them
  disappears from the surface at exactly the moment it mattered.
- **The half-tunable policy.** Thresholds adjustable in the interface layer but
  frozen in the engine that runs the daily pass — two policies, one of them
  unarguable by the people who own the process.

The discipline in one line: **count honestly, per stage, never on terminal
rows, in two tiers, ranked with reasons, degrading to silence rather than to
comfort — and remember that the clock belongs to the person waiting, not to
your dashboard.**
