---
layer: technique
type: technique
subject: admission-queue
technique: speculative-work-admission
status: forged
laws: [count-carries-predicate, creation-names-reaper]
shared_with: []
use_when: [admitting work whose result may never be needed, a redundant fan-out target finds the gate full, deciding whether a speculative request may wait in line]
---

# Admitting speculative work

Most of this subject assumes an arrival somebody is waiting for: the request
is the work, and refusing it is a loss. A queue also receives arrivals of a
second kind — work submitted *in case* it turns out to be useful. A prefetch
against a navigation the user has not made. One of several redundant targets
fanned out so the first good answer wins. A precomputation for a screen that
may never open. This work has a property the ordinary arrival does not:
**there is already an acceptable outcome in which it never runs**, because
something else serves the caller, or nobody ever needed it.

That property inverts the queue's default. For ordinary work, waiting is a
service — it converts a refusal into a slower success. For speculative work,
waiting is usually a loss on both sides of the ledger: the result arrives after
the moment that would have used it, so the caller gains nothing, and the
capacity it consumed was taken from work someone is actually waiting for. A
queue that treats the two identically spends its scarcest capacity, during
exactly the congestion the bound exists to relieve, on answers nobody will read.

## The rule: probe and skip, never queue

Speculative work is admitted through a **non-blocking probe** — a capacity
check with a zero wait. Capacity available, it dispatches; capacity full, it is
skipped, and the skip is the end of that submission. It does not take a
position, it does not age, and it is never promoted later.

The reasoning is worth stating because the alternative always looks kinder.
Queueing a speculative item promises to run it when the congestion clears —
but its value decayed to nothing during the wait, so the promise is honoured
into an empty room. Meanwhile the item held a position and, on promotion,
consumed exactly the capacity that the congestion made precious. The kinder
policy is strictly worse for everyone, including the speculative caller.

Two consequences follow, and both are load-bearing:

- **Release on admit.** An admitted probe releases its lease immediately
  rather than holding capacity for the duration of the work. The probe is a
  *gate*, not a reservation: its job is to refuse entry during congestion, not
  to model the occupancy of what it admits — that is already accounted for by
  whatever bound covers the dispatched work. Holding a second lease
  double-counts every speculative item and refuses ordinary callers on the
  strength of an occupancy that does not exist. The honest cost is that the
  gate is best-effort: capacity can refill between the probe and the dispatch,
  so a probe may admit into a state that is full again a moment later. That is
  the correct trade for a class of work whose whole premise is that missing
  some of it is acceptable.
- **Price the probe from the real submission.** The probe must charge what the
  work will actually occupy — its measured cost and its request class — not a
  nominal figure standing in for the family. A speculative item priced as a
  cheap representative of an expensive class is a gate that admits during the
  congestion it was installed to detect.

## Do not add a knob to make it wait

The request arrives eventually, from an operator watching speculative work get
skipped and reasoning that a short wait would recover it. The knob is the
failure mode returning under a new name: a bounded wait for redundant work is
still redundant work occupying congested capacity, and the wait's only effect
under sustained load is to convert an immediate skip into a delayed one that
cost a position. Where this has been built and removed, the removal is the
lesson.

State the absence of the knob deliberately, as a design decision with its
reasoning attached, and name the observation that would reopen it — skipped
speculation measurably degrading the caller's outcome, not merely a high skip
count. A skip count is supposed to be high under load; that is the mechanism
working.

## Ordinary work still queues, and the parent still waits

The rule is about the *class of the arrival*, not the request family it belongs
to. When a fan-out is issued on behalf of a caller who is waiting, the parent
request is ordinary work: it queues, it waits under the configured bound, it
gets the full three-verdict contract. Only the redundant *children* — the
second and subsequent targets, the panel members whose answers merely improve
the first one — are speculative. Applying the parent's wait budget to its
children reprices the whole fan-out as ordinary work; applying the children's
skip rule to the parent silently drops requests somebody is waiting for.

Where a speculative gate sits behind an opt-in mechanism, a skipped-probe path
that is a no-op when that mechanism is off matters more than it looks: if the
parent already holds a shared lease covering its children, probing them
separately double-counts against the very bound the lease represents, and the
gate refuses fan-out targets on the strength of its own accounting.

## The rule pays only under congestion, and only if the class split is real

Two boundaries are worth stating because both are measurable and one of them
inverts the technique.

**Below saturation the rule is a no-op, and adopting it there is not free.**
When capacity exceeds demand, nothing is skipped that would not have run
anyway, the waste this technique targets does not exist, and the only thing a
probe can do is skip work that had room. A system whose speculative load never
saturates its gate should leave the queue alone; the change earns nothing and
costs a code path. The precondition is worth measuring before adopting, and it
is cheap to measure: submitted-per-window against dispatch capacity per window.

**Applying the skip to the whole request family inverts the benefit.** The
distinction between speculative and ordinary arrivals is not decoration — under
congestion, a probe that skips indiscriminately drops the high-intent arrivals
first, because those are the ones that arrive during the burst. A queue that
skips only its genuinely speculative sources, and lets high-intent arrivals
take the line, keeps serving them at the same rate while shedding the waste; a
queue that skips everything sheds the waste *and* the work the user was
waiting for. The two policies look nearly identical in code and differ
completely in outcome, which is why the class of each arrival has to be a
property the gate can read rather than something inferred from load.

## Every skip names its substitute

A speculative item that is skipped must resolve into something the caller
receives ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)
applied to the speculative submission: what serves in its place is decided at
submission, not discovered at failure). A skipped prefetch resolves to a
demand fetch when the navigation actually happens. A skipped fan-out target
resolves to its siblings' answers, or to the fallback ladder. The degenerate
case has a floor: when *every* member of a redundant set is skipped, nothing
substitutes, and the parent must fail loudly with the resource-pressure reason
rather than return an empty success.

## Count the skips, and count them separately

Skipped speculation is invisible in every ordinary queue measurement. It never
appears in depth, never accrues wait time, never produces a refusal a caller
reports — so a gate that is skipping most of the speculative load looks exactly
like a gate that is never reached. Publish the skip count as its own number,
next to the admitted count and with its predicate attached
([count-carries-predicate](../../../../_laws.md#count-carries-predicate) —
"skipped: 400" is only meaningful beside "submitted: 450" and a statement of
what one unit is).

Two numbers make it diagnostic rather than decorative: the skip *rate* against
submissions, and the **usefulness rate** of the speculation that did run — how
much of it was ever read. The second is the one that decides whether the gate
is tuned correctly, and it is the number speculative systems most often do not
have. A high skip rate with a stable usefulness rate is a gate protecting the
system exactly as designed. A high skip rate with a collapsing usefulness rate
means the gate is admitting the wrong members of the set, which is a ranking
problem, not a capacity one.
