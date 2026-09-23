---
layer: technique
type: technique
subject: shared-research-record
technique: resolution-bounded-leaders
status: draft
laws: []
shared_with: []
use_when: [deciding when a new contribution replaces the leader of a shared frontier, a shared leaderboard keeps moving by tiny margins, every component of a result was selected on one development evaluator]
---

# Resolution-bounded leaders

The concern: in a shared record the leader is not only a report of the best number. It
is where the community's attention goes next. The exploit slot refines it, other
sessions branch from it, and the credit score flows towards it. A leader that moved by
less than the evaluator can resolve has redirected the whole community onto noise.
**Promote a contribution to leader only when it beats the current leader by more than
the evaluator's measured resolution; below that margin record it as a tie, and route the
tie to exploration.**

## What resolution means here

Two quantities bound what a single evaluator reading can distinguish, and a shared
record usually knows only the first.

- **Reproduction spread.** The same code, re-run on the machines the participants
  actually use. A deterministic evaluator may be bit-identical on one machine type and
  still differ in a late decimal place across machine types, from numeric kernels and
  reduction order. Measure it from the record's own cross-machine verifications, which
  are already the data needed. Do not assume it from same-machine determinism.
- **Adaptive reuse of one holdout.** When every step of a long search is selected on the
  same fixed development set, the search itself fits that set. Each participant's choice
  is a query, and a community makes thousands. The gain that shows up on the development
  set and would not on fresh data grows with the number of adaptive choices, and no
  number of reproductions reveals it, because reproductions re-run the same set. The
  leaderboard literature built an answer for competitions: move the displayed best only
  when a submission beats it by more than a fixed step, and report the score coarsened
  to that step. The board then leaks too little to be overfit by its participants.

A third quantity applies whenever the evaluator is a fixed set of pass/fail cases that
every contribution is scored on, and it costs no re-run to measure.

- **Paired case sampling.** Two contributions scored on the same cases differ only on
  the *discordant* ones, where one passes and the other fails. The accuracy gap is the
  net of those cases, and an exact sign test over them says whether the net could be a
  coin. A gap of two points on two hundred cases is four cases. Against thirty cases
  disagreeing both ways, four is nothing. Reproduction spread cannot see this: a
  deterministic grader reproduces a sampling accident perfectly. One measured ladder of
  memory designs on 194 shared probes bolded three successive leaders at 0.89, 0.90 and
  0.92. Paired, every step from 0.86 to 0.92 was a tie (+1 net of 27 discordant, p=1.0;
  +6 of 22, p=0.29). A known-separated pair from the same ladder resolved at +40 of 64,
  which is what showed the test could still resolve.

The first quantity is the floor. The second says the true floor is higher, by an amount
that grows with the length of the search. A record that knows neither should not claim
a leader change finer than its coarsest known spread.

## The rule

1. **Measure the reproduction spread** from cross-machine verifications of the same code.
   Write it into the record's policy as one named value, with the date and the machine
   set it was measured on.
2. **Promote only on a margin.** A contribution becomes the leader when it beats the
   current leader by more than that value. Store its number exactly. Only the promotion
   is gated, never the stored value.
3. **Record sub-margin improvements as ties.** A tie is visible, carries its own number,
   and is credited as a result. It does not move the frontier's head.
4. **Route a tie at the top to exploration.** Several contributions within the margin of
   the leader are what the bunching trigger in
   [explicit-explore-slots](./explicit-explore-slots.md) measures. Refinement has
   stopped discriminating, and the community's effort is worth more elsewhere. This rule
   and that trigger are one mechanism seen from two sides.
5. **Hold out what the search never touched.** For any claim that leaves the community,
   such as a published best or a method handed to another team, score the final
   candidate once on data no participant selected against. Report both numbers.

## Why this lives in the record and not in the instrument

Reporting a changed metric only when the change clears its measured noise band is
general measurement craft, and it belongs to whoever owns the instrument. What is
specific here is the consequence. On a shared frontier a sub-band promotion is not a
false announcement to one reader. It re-points every participant at once, and the
adaptive-reuse term does not exist for a single observer at all. It is produced by many
readers querying one holdout. The rule belongs where the leader is used as an
allocation.

## Decision rules

- **When the last several leader changes are each smaller than the reproduction spread,
  stop announcing leaders and declare a plateau**, because the community is now selecting
  on machine noise.
- **When every component of a result was selected on one development set, report the
  result as a development score**, not a capability, until it has been scored once on
  held-out data.
- **When contributions share a fixed pass/fail case set, promote only on a paired sign
  test over the discordant cases**, because the accuracy gap hides how many cases
  disagreed in each direction, and the test needs no re-run.
- **When verifications are all same-machine, the spread is unmeasured, not zero.** Get one
  cross-machine reproduction before setting the margin.

## When not to use it

- **A search whose evaluator is exact AND whose claim is about exactly what it
  evaluated**, such as a proof checker or a count of the cases in hand. There is no
  spread to clear, and any improvement is real. A pass rate over a sample of cases is
  exact about that sample and not about the capability, so the paired case-sampling
  margin still applies the moment the leader is read as "better".
- **Before the spread is measured.** A guessed margin is a censorship policy with no
  evidence behind it. It can swallow a real step as easily as it blocks a fake one.
