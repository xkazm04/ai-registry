---
layer: technique
type: technique
subject: fleet-orchestration
technique: verifier-seat-capacity
status: forged
laws: [absent-guard-is-loud, count-carries-predicate, limits-are-derived, creation-names-reaper, failure-not-empty-success, silent-state-is-ungoverned]
shared_with: []
use_when: [a verification-debt cap is refusing every new claim and only the missing verifier could clear it, nothing has closed for days while producers keep finishing work, the appointed verifier also produces work and its own items sit unverified, a verdict lane almost never says no, deciding who reads the verifier's output, choosing what to measure about a verification or review queue, each producer reports owing nothing while the queue still holds a backlog]
---

# Verifier seat capacity

[completion-claim-verification](./completion-claim-verification.md) settles how a
parent decides whether one member's "done" is true, and it hands the one question no
checker can decide - whether the result is *correct* - to a reviewing seat. Fleets
that take this seriously make it structural: a producer may never close its own work.
An item it finishes moves to *awaiting verification*, and only a verifier moves it on,
to closed or back to rework. The separation works. On one practitioner fleet, the
first verifier pass over twenty-eight items their producers had submitted as finished
sent seventeen of them back for rework.

What the separation also does, and what nobody designs for, is turn verification into
**a seat with a queue**. Every finished item is now owed a verdict from that seat, and
the seat has an occupancy, a service rate and a backlog like any other capacity in the
fleet. A fleet that budgets its producers carefully and treats verification as a
property of the process - "verification happens" - has one unbudgeted resource, and it
is the one every item passes through on its way out.
[coordination-failure-triage](./coordination-failure-triage.md) tells you to audit what
a verifier reads when failures persist. This technique covers the cases that audit
assumes away: the verifier is not there, or the verifier is the producer.

## The stock the seat owes

Verification debt is a stock: items finished and not yet judged, plus, where the policy
counts them, items in progress that will join them. It is the same kind of number as
the supervisory stock in [parallel-dispatch](./parallel-dispatch.md). It does not go
down when the work finishes, only when the seat renders a verdict, and it is keyed on
the seat rather than on a person. Three measurement rules follow, and each one has a
recorded failure.

- **Count it at the seat, never per producer.** Each producer can truthfully report
  that it owes little while the seat is drowning. On the practitioner fleet, thirty
  items awaited one verifier, spread across sixteen producers at fewer than two each on
  average. On a second, single-operator fleet, two content passes in a row each closed
  their reports by stating, correctly, that they owed nothing to the verification lane.
  The lane held
  ten owed items at the time, the oldest about four weeks old. A per-producer count that
  nobody sums is a stock with no owner
  ([a count carries its predicate](../../../../_laws.md#count-carries-predicate): owed
  to which seat?).
- **Report the oldest item's age alongside throughput.** A verifier serving a queue
  chooses what to verify, and the items it reaches first tend to be the cheap ones. The
  second fleet's lane had one busy day after almost seven weeks with no verdict. It
  settled five items, all against the same target every earlier verdict had used. The
  six oldest items, owed to two other targets,
  were forty-seven days old both before that day and after it. Throughput that day
  looked like recovery. Report the owed count, the oldest owed age and verdicts per
  window together, because a throughput figure can show a working seat while its oldest
  items starve.
- **Zero verdicts means two different things.** A week with no verdicts is either an
  empty queue or an empty seat, and only the owed count tells them apart
  ([failure is not empty success](../../../../_laws.md#failure-not-empty-success)). A
  dashboard that shows verdicts rendered and leaves out verdicts owed reads both as
  calm.

## A cap without an occupancy check stops everything

The obvious control for over-production is a cap on the stock: refuse new claims while
verification debt is over a level. The practitioner fleet had exactly that. A
declarative task-state policy forbade self-close, capped work in progress, and put a
second cap, with a soft and a hard level, on in-progress plus awaiting-verification
work. The cap engaged as written. It existed to stop producers who outran their
verifier. In the week the verifier seat emptied, it stopped all production instead:

- nothing closed for five days;
- debt passed the soft level and kept rising until it hit the hard one;
- from then on the claim door refused every producer;
- the two items meant to restore trust, a re-verification of an earlier closure wave
  and a fast check lane, were themselves blocked behind an
  awaiting-verification item whose only permitted closer was the missing verifier.

The policy had no rule that reached whoever could fill the seat. The vacancy was named
by an audit written after the stall, when the oldest owed item was a month old.

The second fleet had no cap at all and failed the opposite way: content kept landing
while its verification lane went seven weeks without a verdict. The two fleets ran
opposite policies and got the same outcome. Each learned that its verifier was absent
from a later audit, because neither one measured the seat. A cap decides whether a
vacancy costs throughput or trust. It does not make the vacancy visible. An occupancy
check does.

**The occupancy check** is a clock on the seat itself, carried at the same door as the
cap: *if items are owed and no verdict has been rendered within window W, escalate.*

- **Escalate to whoever staffs the seat, not to the producers.** The producers cannot
  act on a refusal. The escalation carries the owed count, the oldest owed age and the
  time since the last verdict.
- **Derive W from the seat's own service record**, meaning the usual interval between
  verdicts while the seat was staffed, and write the derivation beside it
  ([limits are derived](../../../../_laws.md#limits-are-derived)). Both of the observed
  cap levels were literals with nothing written beside them. A window typed by feel
  repeats that mistake.
- **Escalate at the soft level, and refuse at the hard one.** A soft level that changes
  nothing leaves the cap with one effective level, and that level is a stall. This is
  the same lesson [soft-budget-under-the-hard-cap](./soft-budget-under-the-hard-cap.md)
  draws for loops: a fleet that first hears of the vacancy at the hard level hears of it
  at the stall.
- **Never resolve the escalation by closing.** A debt cap whose timeout releases owed
  items as closed is self-close on a timer. It is the auto-approve rung that
  [severity-sla-ladder](../../hitl-approval/techniques/severity-sla-ladder.md) calls a
  confession, applied to work that is unverified by definition. The honest terminal
  actions are escalate and hold, and a hold is honest only while it is visible and
  addressed to someone.
- **Ship the check switched on.** A cap that ships without one has been configured to
  fail silently ([absent guard is loud](../../../../_laws.md#absent-guard-is-loud)).

Replayed over the second fleet's ledger, which shows verdicts on only two days, seven
weeks apart, a seven-day window would have fired on the seventh day with six items
owed and kept firing for forty of the forty-eight days. A fourteen-day window would have
fired on day fourteen. What actually ran was a condition on each pass's own report, and
each pass reported that it owed nothing.

## The verifier's own work needs a second reader

Putting an agent in the seat solves the vacancy and starts a recursion: nothing
verifies the verifier. The practitioner fleet showed two shapes of it when one agent was
appointed verifier.

- **The verifier is also a producer.** The appointed agent had been a producer too.
  Its terms were the right ones: close only work it did not author, and leave its own
  items for another verifier. After its pass the debt fell from the hard level to
  twelve, and all twelve items were the verifier's own. A third of the cap was now held
  by items that nobody present was allowed to close. A verifier who also produces leaves
  a residue its own seat can never clear. The second seat for that residue has to be
  named when the role is assigned, not when someone notices the residue
  ([creation names its reaper](../../../../_laws.md#creation-names-reaper): every owed
  item names who will clear it).
- **The verifier's repairs are production.** A verification pass that fixes what it
  finds is producing code. One fix landed during that pass broke a contract that an
  item it had just closed depended on, and only a later full run caught the break. The
  verifier's own changes go through the same awaiting-verification state as anyone
  else's and are read by someone else.

The second reader can cost less than the first. It can be a sample: re-read a fraction
of the verifier's verdicts, closes and reworks both, blind to the verdict given, and
track the agreement rate. It does have to be someone other than the verifier, because
the third shape is the one where the two seats collapse into one.

## Self-grading is the degenerate seat

When the producer reads its own verdict, the seat is occupied and empty at once.
Verdicts arrive on time, the queue never ages, the occupancy check never fires, and
nothing has been verified. The producer's belief that it finished is still private
state. It has only been written down
([silent state is ungoverned](../../../../_laws.md#silent-state-is-ungoverned)). Fleets
arrive at this configuration by default whenever the verdict is a field the producing
session fills in.

Its signature is the verdict distribution. A seat that judges real work says no at some
rate, and the appointed verifier above sent most of what it read back for rework. A
seat that grades its own work almost never says no. On the second fleet, the session
that made each change also wrote its verdict. In the mode where that session wrote the
change and then judged it, *better* came back on ninety-nine of every hundred decided
verdicts. In the modes where the session measured an existing system against a
proposed one, the rate was between seven and eight in ten. An independent, blinded lane
over a different set of changes came back positive on four of ten and null on six.

Read that distribution as a prompt to test, not as a verdict. Two causes produce it, and
they look identical in the counts. One is self-grading. The other is selection: a
producer that picks the mode in which the answer is already known will honestly report
wins there. The populations above are not paired, so the comparison suggests inflation
without measuring it. Telling the two causes apart takes exactly the second reader:
re-judge a random sample of the near-unanimous lane, independently and blind. If the
sample confirms at the lane's own rate, the lane is selective rather than self-graded.
If it does not, the gap is the inflation. Either way, publish each lane's no-rate beside
who rendered the verdicts, the way the
[review-coverage measure](../../../../engineering-assessment/reporting-and-remediation/delivery-analytics/techniques/review-coverage-rate.md)
reports self-approval as its own count instead of folding it into coverage.

## Decision rules

- Separate the closer from the producer, then budget the closer. When the role is
  assigned, name the seat, its occupant, and the second seat that will judge the
  occupant's own work.
- Count verification debt at the seat, not per producer. Report the owed count, the
  oldest owed age and verdicts per window together.
- Pair every debt cap with an occupancy check. When items are owed and no verdict has
  landed within W, escalate to whoever staffs the seat and include the counts. Derive W
  from the seat's service record. Escalate at the soft level, refuse at the hard level,
  and never resolve the escalation by closing.
- Send the verifier's own production, including its earlier work and any repairs made
  during a pass, to a second reader. A residue that only the verifier could clear is a
  vacancy with someone sitting in it.
- Treat a verdict lane that almost never says no as a hypothesis of self-grading. Test
  it with a blind, independent re-read of a sample before acting on the lane or on the
  hypothesis.

## What this does not settle

The window and the cap level depend on the seat. The fleets observed here supply one
replay and one incident, not constants. A second reader measures agreement, not truth:
two readers who share a blind spot will agree on it. A reader drawn from the same model
with the same brief is a correlated reader, and how much independence the second seat
needs is the question [heterogeneous-model-panels](./heterogeneous-model-panels.md)
answers for panels. Whether the cap should count in-progress work as well as owed
verdicts is a trade the cap's author should state. Counting both is what let the
observed vacancy push new claims to zero. A cap over owed verdicts alone binds at a
different point and fails in a different way, and neither choice removes the need for
the occupancy check.
