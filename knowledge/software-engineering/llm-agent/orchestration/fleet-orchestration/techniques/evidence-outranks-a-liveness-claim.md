---
layer: technique
type: technique
subject: fleet-orchestration
technique: evidence-outranks-a-liveness-claim
status: forged
laws: [unknown-is-not-a-value, record-precedes-effect, failure-not-empty-success]
shared_with: []
use_when: [a staleness budget expired and something is about to be declared dead, a reclaim decision disagrees with a record the work itself wrote, deciding whether liveness belongs in the entry or beside it, a quiet-but-working session had its guarded section taken away]
applied: code
ab_verdict: better
proof: eight-case replay of a live coordination board, then the defect it found fixed under regression
---

# Evidence outranks a liveness claim

A fleet needs to answer *is this still running?* and there are only two places the
answer can come from. The entry can **claim** it: a state field the session writes about
itself, kept honest by a last-heard-from timestamp and a staleness budget. Or the fleet
can **derive** it: read the records the work left behind and infer what must still be
open. Both mechanisms are standard, [session-registry](./session-registry.md) carries
the first and [lifecycle-signals](./lifecycle-signals.md) backs it with the sweep, and
nothing so far has said what happens when the two disagree.

They disagree in exactly one shape, and it is the expensive one: **a session that is
working normally but has been quiet longer than the budget, holding a guarded section it
took a moment ago.** The claim says dead. The record the session wrote when it entered
the guarded section says it executed code one second ago. A design that reads the claim
first hands the guarded section to a second writer while the first is inside it.

The rule: **a stored liveness claim may never outrank a record the work itself wrote.**
An expired staleness budget is an *unknown*, not a death
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)), and unknown
does not authorize taking anything away.

## Why the quiet interval is not a tail case

The reflex is to treat it as a tuning problem — the budget was too short, widen it. It
is not, because the two quantities the budget must sit between are set by different
things and the gap between them closes on its own as the fleet gets better.

A session reports at transitions. Between transitions it does the work, and the work is
where the long pauses are: a drafting pass, a verification sweep, a full build. So the
moment a session's report looks oldest is the moment it is deepest into the work — and
the guarded sections it needs (the serialized write, the shared index, the commit) are
taken at the *end* of a long quiet stretch, not the start. The interval where the claim
is most stale and the interval where the session is most certainly alive and holding
something are the same interval. Widening the budget does not separate them; it only
moves where they overlap and makes every real crash cost longer.

This is the same asymmetry the reclaim families already name
([liveness-proof-reclaim](../../../../backend-platform/work-execution/job-coordination/techniques/liveness-proof-reclaim.md):
a false *dead* preempts live work, a false *alive* costs one more poll), applied one
layer up. There the third value protects the probe's own instrument. Here it protects
the *budget*, which is the instrument that has no third value at all until something
gives it one.

## This does not overturn the expiring lease

A renewable lease *is* a stored liveness claim with a deadline, and its expiry genuinely
is affirmative evidence of death. Nothing here weakens that, because the lease buys its
authority with two things a staleness budget over self-reports does not have. It has a
**dedicated renewal loop on a fixed cadence**, so the longest legitimate silence is the
cadence rather than the work's own duration, and the interval the deadline must fit
into actually exists. And it **fences every effectful write**, so a takeover that
turns out to have been wrong cannot corrupt anything — the superseded holder's writes
are rejected.

A report-driven budget has neither. Its cadence is the work's transition rate, which is
unbounded by construction, and the guarded sections it protects are not fenced, so a
wrong takeover is damage rather than a retried attempt. Read the two designs as one
ladder: where the holder can run a renewal loop and writes can be fenced, use the lease
and stop here. Where it cannot, the budget is a heuristic with no defensible parameter,
and a heuristic does not get to outrank a fact.

## What counts as evidence, and what does not

The distinction is **who wrote it and why**. A claim is a session's statement about its
own condition; it is worth exactly what the writer's continued existence is worth, which
after a crash is nothing. Evidence is a record some *other* obligation forced into
existence, whose timestamp is therefore a fact about execution rather than an assertion
about health ([record-precedes-effect](../../../../_laws.md#record-precedes-effect): the
record is written before the effect, which is precisely what makes its age readable
afterwards).

Three kinds are usually already lying there unread:

- **Outstanding records.** The entry into a guarded section, the reservation of a slot,
  the intent committed before an uncertain effect. Each was stamped at the instant a
  process executed. A recent one is proof of life the claim cannot contradict.
- **Terminal records.** The settlement the work writes when its outcome lands. A
  terminal record beside a still-open entry means the work finished and the *session*
  did not — a state the claim renders as busy and will keep rendering so until the
  budget expires, while the thing it is protecting has already been released.
- **Suspension records.** A parked or awaiting-input marker, which says the absence of
  activity is by design and the budget should not be counted against it at all.

What is **not** evidence: the entry's own state field, its last-heard-from timestamp, a
stored process identifier (a re-checkable annotation, per
[durable-fleet-state](./durable-fleet-state.md)), and any value a layer that observed
nothing supplied on the entry's behalf — that last class belongs to
[absent-status-passthrough](./absent-status-passthrough.md), which keeps non-observers
quiet. This technique is the next question: once only real observers are speaking, which
of them wins.

## The split: two questions, two authorities

Collapsing *is it alive* and *may I touch this* into one boolean is what makes the
disagreement unresolvable, because one answer is serving two consumers with opposite
costs. Separate them.

**"May I touch this?" is answered by the derived predicates, and only by them.** Is
there an outstanding record with no terminal record — is the unit of work *open*? Is
there a suspension record? Is there a terminal record? These are computed from the
record set at read time and stored nowhere, so nothing can go stale and nothing can be
inherited from a writer that no longer exists. A session whose work is open is not
touchable, however old its last report is.

**"Is it alive?" is a separate, three-valued observation that authorizes reclaim and
nothing else.** *Dead* requires a positive answer: a terminal record, or a confirmed
death from a probe. *Alive* is a recent report **or** a recent outstanding record, and
the second half is the whole point — the guarded section entered a second ago outvotes
the report from an hour ago. Everything else is *unknown*, and unknown is where an
expired budget lands ([failure ≠ empty
success](../../../../_laws.md#failure-not-empty-success): a budget that ran out is an
instrument declining to answer, not an instrument reporting a clean death).

Unknown then escalates under a bounded policy rather than resolving itself: retire the
entry if you must bound the fleet's memory, but label it as unresolved rather than as a
death, and never let it be the thing that releases a guarded section. The population
that was reclaimed on an expired budget and the population that was confirmed dead have
different root causes, and only the label keeps them separable.

## The non-goal, measured

Derivation is not a general replacement for the budget, and this technique would be
lying if it implied otherwise. The crash that exposes the limit is the narrowest one:
**a process that died between writing its entry and doing anything else.** The record
set then contains exactly one record — the entry — and it holds no evidence, because
no obligation had yet forced any into existence. Derivation says *open*, which is true
and useless; the claim says *running*, which is false and useless; both block, for the
same duration, and only the budget's expiry ever clears it.

An eight-case replay against a live coordination board measured this directly. Of the
seven assertions where the stored claim is false, the unmodified board scored 0 and both
derived designs scored 4; the three it could not win are the entry-only crash and its
variants, where no design does better than waiting. So the honest scope is: derivation
wins wherever a second writer has left a record, and nowhere else. Keep the budget for
the rest.

The same replay refutes the stronger form of the rule. A design that removes the stored
claim *entirely* and derives everything scored the same 4 on the falsity assertions and
then lost two it had been getting right, because with no budget and no probe nothing can
ever say *dead*: a crashed session's entry is outstanding forever, its guarded sections
are unbreakable, and reclaim never terminates. Its total was indistinguishable from a
deliberately broken control that answered "clear" to everything. Removing the claim is
not the rule. Demoting it is.

## Decision rules

- Compute *open*, *suspended* and *terminal* from the record set at read time. Do not
  store them, and do not let a consumer read a stored state field in their place.
- Answer "may I touch this" from those predicates alone.
- Make liveness three-valued and keep it beside the entry, not inside it. Only a
  terminal record or a confirmed probe yields *dead*.
- Count a recent outstanding record as *alive*, outranking any older report.
- Never break a guarded section whose own entry record is younger than its timeout,
  whatever the holder's report says.
- Land an expired budget on *unknown*; escalate it under a named bounded policy and
  label the outcome as unresolved, not as a death.
- Keep the budget. It is the only mechanism that bounds the entry-only crash.
- Refresh the report when entering a guarded section, so the cheap evidence exists
  before the expensive disagreement can.

## When not to use it

Where the work leaves no record until it finishes — a single opaque call, an
externally-hosted step the fleet cannot see into — there is nothing to derive from and
the budget is the whole mechanism. Say so rather than shipping a derivation layer that
returns *unknown* for every entry and so never overrides anything. And where the unit of
work is one idempotent step, a false reclaim costs a retry rather than damage, and the
whole apparatus is ceremony over a timeout.
