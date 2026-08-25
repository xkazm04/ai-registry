---
layer: technique
type: technique
subject: companion-runtime
technique: signal-economy-contract
status: forged
laws: [verdict-survives-boundary, count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [autonomous work is producing more announcements than value, deciding whether a background outcome deserves a person's attention, a companion narrates its own housekeeping, deciding where a companion's pending count is surfaced]
---

# The report-or-absorb contract

A companion that works on its own produces outcomes continuously, and the runtime
must decide the fate of each one before any delivery machinery is involved. The
decision is binary and it is made at the point of production: **report** — this
changes what the person would do — or **absorb** — this is maintenance the
companion exists to handle quietly.

The instinct is to report. The pass ran, it did something, the companion is
demonstrating value by saying so. Followed consistently, that instinct produces a
system that narrates its own housekeeping, and a person told about six
consolidations and one thing that matters will stop reading all seven. The
scarcest resource a companion spends is not tokens; it is the person's
willingness to look at what it says, and it is spent whether or not the message
was worth sending.

## Two gates in series, and this is the first

The attention policy — daily budgets, quiet windows, deduplication, per-kind
efficacy feedback — is a different subject and a different question. That
subject asks *when and how often may we contact this person*. This one asks
*is there anything here worth contacting them about*, and it must be answered
first, because a budget spent on a maintenance report is a budget not available
for something real.

The ordering has a practical consequence: an outcome that fails this gate never
becomes a candidate at all. It does not consume a slot, does not compete for a
quiet-hours bypass, and does not appear in the delivery subject's dedup index. A
system that pushes everything into the attention layer and relies on the budget
to filter has made a rationing mechanism do a relevance job, and the outcomes it
drops are chosen by arrival order rather than by worth.

## The decision belongs to the producer, typed

The cycle that produced an outcome is the only component that knows what it
means. So the decision is made there and travels as a **typed field on the
outcome**, not as a downstream heuristic over a rendered message
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).
A delivery layer that re-derives worth by matching text has lost the judgment
that was computed with full context and replaced it with a guess made without
any.

And the decision is made **before anything is minted**, not after. This is the
part that surprises teams, because the obvious repair for a noisy companion is
to keep producing the reports and filter them later. In a system whose
conversational record is append-only — which it should be, since the record is
what the companion learns from — a report that was produced has already been
written: the exchange exists, the recall it consulted was paid for, and the
"nothing to report" message is now permanently part of the history the companion
will read back to itself. Filtering afterwards removes the notification and
leaves the noise, and deleting the record is not a repair
([deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair)) — it
destroys history to hide a decision that should not have been made. The gate goes
in front of production, not behind it.

The test that decides it is behavioural, not topical: **would the person do
something differently in the next day if they knew this?** Not "is it
interesting", not "was it hard to compute", not "did it take a while". A
consolidation pass that folded forty episodes into three beliefs is a
considerable piece of work and changes nobody's afternoon. A contradiction found
between something the person told the companion last week and something they told
it today changes the next conversation.

Three families reliably belong on each side. **Report**: a contradiction or a
correction the companion cannot resolve alone, a proposal awaiting a decision, a
commitment coming due, a failure that will not self-heal. **Absorb**: routine
consolidation, decay, reorganization, successful self-repair, and every "I ran
and everything was fine". Failure is the interesting edge — a cycle that failed
transiently and recovered on the next pass is absorbed; a cycle that has failed
repeatedly is reported, because the pattern is the news and no single instance is.

## Absorbed is not discarded

An absorbed outcome is recorded, counted, and retrievable on demand. This is the
difference between a companion that is quiet and one that is opaque, and the
distinction shows up in exactly two places that matter.

A person can ask what the companion has been doing and get a real answer, with
counts that carry their predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)) — what
ran, over what window, producing what. Pull is the correct channel for
maintenance: it costs attention only when attention was volunteered.

And the operator can tell a quiet companion from a broken one. A cycle that ran
and had nothing to report and a cycle that has not run for a week look identical
from the outside unless absence and emptiness are recorded differently
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
This is the failure mode the contract most easily creates: having correctly
taught the system not to announce its maintenance, the system now has no way to
say that its maintenance stopped. The record is what closes it.

## A count is a report, and it goes where it can be cleared

Not every report is a message. The cheapest form a companion has is a **standing
count** — proposals awaiting an answer, commitments coming due — and it faces the
same gate: a number that changes nothing anybody would do is narration with a
numeral in it. But a count carries something a message does not, which is an
implied affordance. A person who sees one believes that acting on it makes it go
down.

Hence the placement rule: **a count is surfaced where the affordance that clears
it lives.** Folding a companion's pending count into a badge that already exists
is the tempting move — the badge is built, it is already read, and one more
number looks free. It is free only if the place that badge leads to can resolve
the thing being counted. Where it cannot, the number rises and never falls by any
action available from where it was shown, and the person learns to read that
badge as decoration. The predicate a count carries
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)) is not
only what was counted and how; on a surface it is also **what makes it smaller**,
and a count whose predicate has no reachable answer costs more than an absent one
because it spends attention on a dead end.

The same test governs registering a companion's work in a host's existing
approval or review taxonomy. If nothing in that taxonomy's resolution path has a
branch that can close the companion's item, joining it mints a queue entry that
only accumulates. The correct move is the one that looks smaller: put the count
on the companion's own surface, beside the accept and the decline it refers to,
and leave the host's taxonomy alone.

## The ratio is the instrument

One number tells you whether the contract is holding: the share of autonomous
outcomes that were reported. It should be small and it should be stable. A rising
ratio means the producers have started reporting for reassurance, which is the
drift this technique exists to prevent, and it is easier to see in the ratio than
in any individual decision — every single decision looks defensible to the
person who made it.

Watch it per cycle kind, not only in aggregate, because one enthusiastic producer
is the usual cause and it is invisible in a total. And read it beside the
downstream efficacy signal the attention subject already keeps: a kind that is
reported often and acted on rarely was being absorbed incorrectly at this gate,
not merely delivered badly at the next one.

## When not to do this

A companion that does no autonomous work has nothing to decide. A companion whose
autonomous work is entirely user-requested — it ran because somebody asked it to
— reports by default, because the person is already waiting for the answer. The
contract becomes necessary the moment work happens that nobody asked for, which
is the same moment the companion starts to be genuinely useful and the same
moment it starts to be capable of being ignored.
