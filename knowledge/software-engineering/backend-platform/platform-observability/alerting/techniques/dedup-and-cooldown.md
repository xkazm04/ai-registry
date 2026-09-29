---
layer: technique
type: technique
subject: alerting
technique: dedup-and-cooldown
status: forged
laws:
  - count-carries-predicate
  - identity-survives-reuse
shared_with: []
use_when: [choosing where last-fired state lives, a failed send leaves a rule silent for its whole window, opposite-direction alerts alternate past cooldown, two evaluators each believe they own firing]
---

# Dedup and cooldown

A threshold condition that is true now will, in the overwhelmingly common
case, still be true at the next evaluation tick. Without suppression, every
persisting condition becomes a metronome of identical alerts — one per tick
until someone fixes the disk or mutes the channel, and the channel always
gets muted first. Suppression is therefore not an optimization; it is the
difference between an alerting system and a harassment system.

The general suppression shapes — cooldown, debounce, throttle, hysteresis,
and the state-predicate fifth shape — are owned by the scheduling subject
at [cooldown-and-debounce](../../../work-execution/scheduling/techniques/cooldown-and-debounce.md).
This technique covers what alerting adds: the durable substrate the
suppression must be computed from, and the one architectural failure that
no window survives.

## The substrate: persisted fire history, not process memory

Cooldown is a computation over the question *"when did this rule last
fire?"* — and the answer must come from **durable storage**, never from a
variable in the evaluator's memory. The in-memory version passes every
test and fails in production on a schedule:

- **Restart re-fire storm.** Process restarts (deploy, crash, update) clear
  in-memory last-fired times. Every rule whose condition is currently true
  fires simultaneously on the first tick after restart — a page storm at
  the exact moment the team is doing something delicate.
- **The evaluator moved.** When evaluation migrates between hosts or
  processes (failover, scale-out, the second window), memory does not
  migrate with it; history does.
- **History is the audit.** "Did this fire during the incident?" is
  answered by the fire record, and a record maintained only for suppression
  tends to be the record that exists when the audit question arrives.

So the write order is fixed: **evaluate → check history → persist the fire
→ then deliver**. A fire that was delivered but not persisted is a fire the
system will repeat; a fire persisted but not delivered is recoverable from
the record. Persist first.

## The suppression clock runs on delivery, not on detection

"Persist first" protects the *record*. It does not say which timestamp the
cooldown reads, and reading the wrong one breaks the alert the cooldown was
meant to protect. If the window is computed as "time since this rule's last
fire row", a fire whose delivery **failed** — a webhook answering 503, an
expired token, a dead relay — has already stamped it. The next tick sees a
recent fire and suppresses, and the condition goes unannounced until the
window ends, with the record saying "fired" the whole time. "Recoverable from
the record" is not recovery if the very check that would retry the fire reads
the row as done.

The record answers two questions and they need two fields: *did we detect
this?* and *did anyone get told?* The rule:

> **The suppression clock reads the last *delivered* fire — a delivery
> outcome on the record, or a separate last-notified stamp written only on
> confirmed delivery. A fire whose every channel failed leaves the window
> unspent and is retried on later ticks, with backoff and a bounded attempt
> count, the outcome written back to the record.**

There is one honest exception, and it is a design, not an omission: the clock
may stay on detection when **delivery is itself a durable queue keyed by the
fire** — an outbox row per fire, drained by a worker that retries from a
persisted position. Then the failed send is not lost, it is pending, and the
cooldown is correctly counting detections. What is never sound is the middle
case: a detection-stamped window in front of a delivery that makes one
attempt and forgets it. Mainstream alert routers land on the same split: the
group's alert state is re-flushed until a send succeeds, and the timestamp
that paces re-notification is written only after it does.

Three bounds keep the retry honest. It stops at a bound and says so — a
revoked webhook is a finding on the channel, surfaced where its owner will
see it, not an endless loop. Delivery is judged per reach: a fire delivered
to a quiet surface while its interrupting channel failed is not delivered.
And the retry never creates a second episode: it re-attempts the same fire,
so the suppressed-repeat count and the lifecycle record stay one. The outcome
the clock reads is the **latest attempt per channel**; the attempts themselves
stay on the record as history. A "delivered" test written as *every attempt
succeeded* reads a fire that failed once and then succeeded as undelivered
forever, and the retry never stops. The batch
channel already applies this discipline to its own claim —
[periodic-digest](./periodic-digest.md) releases the window when the send
fails — and the event channel owes the same.

## Keys and identity

Suppression is computed **per rule** — and per whatever finer key the rule's
semantics demand (per rule × source, when one rule watches many sources and
their problems are independent). The key question, "what counts as the same
occurrence?", is settled at rule design and is the semantic heart of the
technique; choosing it is covered in the owning technique. What alerting
adds is an identity discipline
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)): the
fire history is keyed by the rule's **minted identity**, never by its name
or its threshold tuple. A rename must not orphan the cooldown history, and
— the sharper edge — editing a rule's threshold poses a real question:
does the edit reset suppression? The defensible default is yes for
*material* changes (the author just declared the old firing pattern wrong)
and no for cosmetic ones; whichever is chosen, it is chosen explicitly,
because keying history on the threshold value chooses "yes" silently and
invisibly.

## Count what the cooldown ate

A cooldown window that suppresses nine evaluations of a still-true
condition holds information: *nine*. The suppressed occurrences are
counted against the fire record they deduplicate into
([count-carries-predicate](../../../../_laws.md#count-carries-predicate) — the
count travels with what was counted: this rule, this window, this
condition), and the next allowed reminder says "still failing; 9 suppressed
since last notice". Without the count, a condition that flapped once and a
condition that hammered through an entire cooldown window read identically
in history, and the fatigue analysis that decides which rules to retune
loses its best column.

## A repeat while open is a reminder, not a fire

Two sentences elsewhere in this subject look like a contradiction and are
not. [Flap-control](./flap-control.md) says a rule fires on the transition
into breach and never on remaining in breach; this file says the next allowed
send after a cooldown reads "still failing". Both hold once the second is
named for what it is: a **reminder** — a declared re-notification of an
episode that is still open and unacknowledged.

- A reminder has its own interval, set per severity, and it is data.
- It stops the moment the episode is acknowledged or resolved
  ([alert-lifecycle](./alert-lifecycle.md)); a reminder to someone who already
  owns the problem is noise, and one after resolution is a false alarm.
- It is recorded against the *episode*, not as a new fire, so reminders do
  not inflate the fire count or the actionability rate they are meant to help.
- It carries the suppressed count.

Mainstream routers and paging tools re-notify by design — repeat intervals
measured in hours, escalation policies that repeat when nobody acknowledges —
so "never re-notify" would be the wrong lesson. What flap-control rules out is
narrower: a **level-triggered rule with a cooldown standing in for edge
detection**. That design has no episode, no owner and no ending; it re-fires
whether or not anyone has the problem, counts each re-fire as a new
occurrence, and gives the window a job — marking where one incident stops and
the next starts — that a timer cannot do. A cooldown that paces reminders of
a tracked episode is the same window doing an honest job.

## Opposite directions across one boundary share one pool

A subject oscillating across a band edge does not only repeat itself — it
**alternates**. The crossing down fires the regression; the crossing back up
fires the good news; the next evaluation fires the regression again. If the
two directions hold separate suppression state, every one of those messages
is individually inside its own window and individually correct, and the
channel is unreadable. Separate pools do not merely fail to stop this
pattern; they are the mechanism that permits it.

The rule, therefore:

> **Opposite-direction news about the same subject, delivered at the same
> reach, shares one claim pool — and claiming *consumes* it.** Checking
> without stamping lets the two directions double-fire inside a single
> window; a shared pool that both directions stamp cannot.

"At the same reach" is the load-bearing qualifier and the reason this does
not contradict the asymmetry in [flap-control](./flap-control.md). There are
exactly two coherent designs for the second direction. Either it is *quiet*
— a state-resolving notice at reduced reach that costs the reader almost
nothing, in which case it needs no share of the loud pool — or it is a
**push in its own right**, as loud as the alarm and equally forwardable, in
which case it is spending the same attention and draws from the same pool.
What is never coherent is a second direction that pushes at full volume out
of its own untouched budget.

The cost of the shared pool is real, and naming it is part of choosing it: a
*genuine* reversal shortly after a *genuine* move in the other direction is
suppressed. That cost is acceptable only because of where the suppression
sits — and this is the discipline that makes the whole trade honest:

> **Suppression applies to the push, never to the record.** The detection,
> the durable record, and any derived history are written *before* the claim
> is attempted; the claim gates delivery alone. Nothing is lost from the
> record, only from the pager, and the suppressed occurrence is recorded as
> suppressed with its reason.

That ordering is what lets a team answer "did we know?" with yes even for
the messages nobody received, and it is why the reason for non-delivery
(no channel configured, inside cooldown, delivery failed) belongs on the
record as a distinguishable value rather than collapsing into a bare "not
sent".

Finally, distinct *classes* do not share a pool with the general one. A
rarely-fired, specific class — the security-shaped alert, the quota-shaped
alert — keyed into the same pool as the routine push will be starved by it:
the routine alert consumes the window and the specific one never lands,
which is the opposite of the intended priority. Same subject, same reach,
opposite directions: one pool. Different class: its own key.

## The two-evaluator double-fire

The failure that no cooldown window survives: **two evaluators, each
correct, each with its own history view or its own timing**. Two loops that
both see rule R and both believe they own firing will double-page even with
perfect per-loop cooldowns — their windows interleave, and the effective
suppression becomes the phase gap between two schedules that nobody
designed. This arises innocently: a lightweight in-app evaluator ships
first; a deeper backend evaluator arrives later with better data; both stay
enabled because each is individually useful.

The remedy is an **explicit authority rule**, written where both evaluators
can be read: exactly one component may write fire records and trigger
delivery for a given rule (or rule class). The non-authoritative evaluator
is explicitly demoted — it may render live status, it may pre-compute, but
it does not fire. Sharing the persisted history helps (a fire written by
one suppresses the other's window check) but is not sufficient alone, for
two reasons. First, the race: two writers consulting the same history
within one tick interval still double-fire at the boundary. Second — the
insidious one — **a shared cooldown converts disagreement into silencing.**
Two evaluators never compute *exactly* the same predicate for long (their
data windows, scopes, or refresh timing drift apart), and once they share
suppression state, whichever fires first suppresses the other for the full
window — including when the first one fired on the *wrong* data. A demoted
evaluator that still writes fires is not a harmless redundancy; it is a
component that can silence the authority's correct alert with its own
incorrect one. Authority is the invariant; shared history is the mechanism
that makes the demoted evaluator's *display* truthful — never a license to
keep two fire paths alive.

## Decision rules

- Persist the fire before delivering it; recover from "persisted but not
  delivered", never from "delivered but not persisted".
- The cooldown reads delivered fires (or a delivery-backed outbox), never
  merely detected ones; a failed delivery leaves the window unspent.
- A repeat while the episode is open is a reminder with its own per-severity
  interval, stopped by acknowledgment or resolution.
- Cooldown windows are rule data, not code constants — the first noisy rule
  will need its own window, and that must not require a deploy.
- On restart, the first tick consults history like any other tick; there is
  no special-case grace period, because the history makes one unnecessary.
- If two evaluators exist, the code of each names the authority — a comment
  in one file is a start; a runtime assertion or a capability the demoted
  one lacks is better.
- Recovery notifications (condition cleared) have their own, separate
  suppression state — a flapping condition must not bypass cooldown by
  alternating fire and recovery; see [flap-control](./flap-control.md).
