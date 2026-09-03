---
layer: technique
type: technique
subject: model-routing
technique: effort-calibration
status: forged
laws:
  - count-carries-predicate
  - gate-sees-target
shared_with: []
use_when: [raising effort because bigger feels safer, output capped but effort set high, all tiers fail the same requirement, a point release replaced the model an entry was calibrated against, the bill moved but the rate table did not]
---

# Effort calibration

Model tier and reasoning effort are the two dials the routing table sets, and both
invite the same intuition: more is better, bigger is safer, when in doubt turn it
up. **The measured reality inverts that intuition often enough that the inversions
are the norm, not the anomaly.** Effort calibration is the discipline of setting
the dials from measurement — and of recording each measurement with enough
predicate that it cannot be reused for a claim it does not support.

## The three inversions

These are the findings that recur whenever anyone actually benchmarks the dials
instead of trusting them:

1. **More effort is not automatically better.** On long-form design and writing
   work, quality can *invert* above the middle of the effort range: the
   highest-effort run produces the longest output, drifts its own internal
   cross-references, and is the likeliest to violate its brief. Length is not
   insight; past a point, extra reasoning budget buys elaboration, not
   correctness. Raising effort for prose and design deliverables is spending in
   the direction the quality gradient points away from.
2. **The bigger model is not automatically the safer default.** When output
   quality across tiers is judged by model judges, the judges disagree with each
   other — and each tends to rank its own family first. A tier preference that
   does not survive a cross-judge check is not a quality signal; it is an
   artifact of who was asked. Where the signal does not separate the tiers,
   choose on cost, and say that is what you did.
3. **A hard output cap nullifies effort.** When the response is capped to a
   short output, raising reasoning effort produces no measurable change in what
   comes back — you are paying for reasoning whose product cannot fit through
   the aperture. The headless micro-call class, which lives under tight caps by
   design, should be pinned to minimal effort *structurally*, not left to
   goodwill.

A fourth finding disciplines the other three: **when every configuration fails
the same way, the problem is the framing, not the capacity.** If all runs at
every tier and effort miss the same requirement, no escalation would have found
it — a sharper problem statement would have. Re-read the request before reaching
for a bigger model; escalation is the correct response to *capacity* failures
only, and most disappointments are framing failures.

## Measurements carry their predicate

A calibration result is a number that will travel — into the routing table, into
a budget argument, into a doc read two years later. It travels safely only with
its predicate attached (law: count-carries-predicate): the task shape it was
measured on, the sample size per cell, the judging method, and the date. The
honest form is often uncomfortable — "one sample per cell, one problem shape,
one judging pass" — and writing it down is what prevents a weak prior from
being cited later as a rule. A routing-table entry citing such a measurement
inherits its scope: calibrated for long-form design work is *not* calibrated
for code review, and the table should not pretend otherwise.

Two instrument warnings:

- **You cannot introspect effort from inside a run.** A session has no reliable
  signal for how hard it is reasoning; "this feels hard" is not a trigger.
  Calibration triggers on observable task properties — output length class,
  interactivity, cap — checked once when scope is clear, never on felt
  difficulty.
- **A judge is an instrument that needs its own calibration.** A gate built on
  judge scores sees the judge, not the work (law: gate-sees-target). Before a
  judged benchmark sets a routing-table entry, check cross-judge agreement, and
  check whether high scores coexist with the judge's own logged complaints —
  confident scores over visibly broken output is a documented failure mode.
  Scoring-rubrics owns the judging discipline; calibration consumes it.

## Re-measure cadence

Calibration decays. Model rosters turn over; a tier's capability at a fixed
price point moves; the task mix shifts. Every routing-table entry therefore
carries its measurement *date*, and the table as a whole carries a re-measure
trigger: on roster change affecting the entry's tier, on a quality regression
reported against the class, or on a staleness horizon, whichever first. An
entry whose measurement predates the models it now routes to is an opinion
again — the table should make that visible rather than letting green age into
gospel.

## The successor moves the dial without touching it

The cadence above triggers on a roster change "affecting the entry's tier", which
reads as: a tier gained or lost a model. It misses the substitution that is now the
most frequent one in practice — **a point release replacing its predecessor in the
same tier, at the same published price, under an unchanged dial setting.** Nothing
in the routing table changes, so nothing in the table asks to be re-measured; and
the entry keeps citing a measurement taken against a different model.

That would be a bookkeeping nuisance if effort were only a dial. It is not. **How
hard a model reasons is a property of the model as much as of the setting**, and
vendors move it deliberately between versions — shipping a successor that takes more
reasoning steps and calls tools more times for the same request, and saying so in
the release note as a feature. The dial reads the same on both sides; the token
count does not.

Three consequences, and the third is the one that surprises people:

- **Same price per token is not same price per task.** The unit a per-token rate
  prices is not the unit anyone budgets in. When the successor spends more tokens
  reaching the same answer, an unchanged rate table reports an unchanged cost basis
  while the bill rises, and every dashboard built on the table agrees with itself
  and with nothing else. Cost per completed task is the comparison; cost per token
  is an input to it.
- **Reasoning tokens are where this lands, and they are usually billed as output.**
  The reasoning is not in the visible answer and is easy to leave out of an
  estimate; measured, it routinely dominates. A tree that metered them found the
  hidden reasoning running an order of magnitude past the visible answer on a
  mid-tier model and twice that on a larger one — so a successor that reasons more
  moves the term that was already the largest.
- **The predecessor is not necessarily deprecated, and the vendor may say so.** A
  release that positions its successor as the more diligent model often keeps the
  prior version on the roster as the efficiency-first option, in the same
  announcement. Where that is true the version ladder is **not** an upgrade path
  but a second tier axis, and taking the newest by default silently opts every
  cost-sensitive class into the dearer engine. The routing table already knows how
  to hold two tiers; a version successor may be one.

So: **a version successor is a re-measure trigger in its own right**, on the same
footing as a tier change, even when tier, price and dial are all unchanged. What it
triggers is cheap — the same calibration the entry already carries, re-run against
the new id, with tokens-per-task recorded beside quality. Until that runs, the entry
is an opinion about a model nobody measured, which is the state this technique
exists to make visible.

And the dial's **default** deserves reading once per version, not once. Where the
effort parameter defaults to its top setting, an adopter who never sets it inherits
the most expensive configuration of a model that was already described as spending
more — two compounding steps, neither of them a decision anybody made.

## Decision rules

- **Calibrate per class, not globally.** The inversions are task-shape
  dependent; a single "best effort setting" across classes is guaranteed wrong
  for at least one of them.
- **Default the dial to the middle, and move it only on evidence.** Both ends
  of the effort range are the ends that measurement keeps embarrassing.
- **Never raise effort where output is capped.** Structural rule, enforceable
  at the routing layer: cap below a threshold → effort pinned to minimum.
- **When quality signals tie, cost decides — and the record says so.** "Chosen
  on cost, quality signal did not separate" is a legitimate, auditable reason;
  an unrecorded tie-break is indistinguishable from vibes.
- **Treat a version successor as a re-measure trigger, and record tokens per task
  beside quality.** Same tier, same price and same dial do not make it the same
  model, and the term that moves is usually the reasoning that never appears in
  the answer.
- **Escalation advice to humans is one sentence, once.** When the system (or an
  operator playbook) suggests raising tier or effort, it names the observable
  property that triggered the suggestion, offers it once, and drops it if
  declined. Repeated escalation nagging trains people to ignore the one time
  it matters.
