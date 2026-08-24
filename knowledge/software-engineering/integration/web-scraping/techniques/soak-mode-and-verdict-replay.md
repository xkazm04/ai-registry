---
layer: technique
type: technique
subject: web-scraping
technique: soak-mode-and-verdict-replay
status: forged
laws: [absent-guard-is-loud, gate-sees-target, verdict-survives-boundary, unknown-is-not-a-value]
shared_with: []
use_when: [a detector is built but nobody trusts it enough to let it act, deciding whether enforcement is safe to turn on, a source has too little history to be judged]
---

# Soak mode and verdict replay

A detector is *finished* when it judges correctly. It is *adopted* when its
verdicts are allowed to change what the pipeline does, and the distance between
those two moments is where most detectors die. Flip enforcement on the day the
code lands and the first false quarantine — on an unattended box, at three in
the morning, stopping a working pipeline — buys a permanent reputation the
detector never recovers from. Leave it off and it becomes a dashboard nobody
wires up, judging into a table nobody reads. This technique is the lifecycle
between the two: how the detector ships un-armed without becoming decoration,
and what evidence licenses arming it.

## The flag changes consequences, never evidence

One switch decides whether verdicts may gate anything, and the no-op it
produces sits **strictly downstream of judging**. Every run is judged. The
source's state advances. The verdict, the score, and the self-explaining
per-signal reasons are written to the run history — all of it, regardless of
the flag. The single thing the flag changes is that the consumers which gate on
the state read the neutral value instead of the real one.

The naive reading places the switch at the top, and there are two spellings of
that mistake. Gating the detector itself produces no evidence at all, so the
soak period measures nothing and the flip is as blind on day ninety as on day
one. Gating everything but a log line is subtler and just as bad: without a
persisted state history the hysteretic ladder starts from zero the moment
enforcement is enabled, so the first enforced week is the first week again, with
consequences attached.

The test for whether the split sits in the right place is mechanical: **turning
the flag on must not change a single row that would be written for the same
run.** If it does, evidence is downstream of the flag and the soak period is
measuring a different system from the one that will run.

Structurally this wants two accessors, not one. One answers *what is this
source's state* — used by reporting, by the operator, by the preview. The other
answers *what state governs enforcement*, and returns the neutral value while
soaking. Consumers of the second are the enumerable set of things enforcement
changes, and that enumeration is a contract the next section depends on.

## Soak has an exit, or it is a waiver

A guard that ships off is off in every installation, because a deployed fleet
converges on the default and the default is off. Soak mode is the deliberate,
temporary form of that, and it is legitimate only when the exit is named where
the flag is defined: what evidence, over what window, licenses the flip. "We
ship it observing first" without that sentence is the polite spelling of
shipping it never.

The un-armed state must also be visible in the product's own reporting. A
system that answers *healthy* while its health gate is switched off, and does
not say the gate is off, has published a confident claim about a check it is not
applying. Every surface that reports a state during soak carries the fact that
nothing is being enforced.

## The rollout gate replays stored verdicts; it does not re-judge history

This is the load-bearing move, and it is the one most implementations get
backwards. The operator's question before flipping the flag is *what would
enforcement have done to my fleet?* — a question about decisions that were
actually made. The tempting implementation re-runs the detector over retained
history and tabulates the results. That answers a different question: *what
would today's rules say about these pages?* — which is a fine question about the
detector and worthless as a rollout gate.

Two reasons the difference is not academic. **Rules move.** Thresholds get
tuned, signals get added, a baseline window gets widened. A re-judging preview
reports on the detector as it stands this minute, so a fleet that looks clean
may look clean because a threshold was loosened yesterday — the gate has
observed a proxy for the thing it gates, and it passes exactly when the proxy
and the target diverge. **State is path-dependent.** A hysteretic ladder's
position is a function of the *sequence* of verdicts, each judged against the
baseline as it stood at the time. Recomputing from today's baseline reconstructs
a path the source never walked, and the states it lands on are fiction.

So the discipline is: verdict, score, reasons, and the state the run left the
source in are all written at judge time, and the preview reads them back
verbatim. Replay computes nothing. Its output is a readiness answer with names
attached — which sources currently gate something, what each of them would
gate, and the recorded transition that put them there — rather than a
percentage.

Two requirements follow. First, the run row must carry enough to reconstruct
the decision: the verdict as a typed value, the score, the per-signal reasons
with the thresholds they were measured against, and the resulting state. A row
that stored a boolean has already made replay impossible; a classified outcome
has to reach the boundary that acts on it as a value, not as prose in a log.
Second, **the preview is read-only by construction, and that is asserted rather
than intended** — the entire appeal of previewing a gate evaporates if the
preview can advance the state it is previewing.

Replay must also be honest about what it cannot attribute. A state change that
straddles a run nobody judged, a run that retention has since pruned, or an
operator's manual override is reported as caused by something outside the
replayed window — never credited to the nearest run. Crediting an unjudged run
with a move it did not make is exactly the tidy lie that makes a rollout gate
untrustworthy the first time an operator checks it by hand. For the same
reason the replayed state is reported *beside* the source's live state rather
than instead of it: when an override or a pruned run has moved the row out from
under the replay, the two disagree, and an operator who spots that disagreement
in the preview learns something real — whereas a preview that shows only its own
reconstruction quietly contradicts the source listing and loses the argument.

## The consequences are enumerated, and the enumeration is enforced

A preview is only as complete as its list of consequences, and the list decays
the ordinary way: a fifth consumer starts gating on the state, nobody adds it,
and the preview is now quietly wrong in the optimistic direction. Hold the list
as a declared constant in which each entry names the call site that applies it,
and make a check fail when a consumer exists that is not on the list. The
enumeration is what lets the preview claim *flipping the flag today would change
nothing about the next run* and be believed.

## The ladder: hysteresis, a cheap first rung, and recovery that is earned

Enforcement without hysteresis is unadoptable: a single tripped run is dominated
by transient causes, and a system that quarantines on one bad run spends its
life quarantining. The general noise-band and hysteresis mechanics belong to
`noise-band-and-hysteresis` in the measurement-honesty subject; what is specific
here is the shape of the ladder that enforcement climbs.

- **The first rung down is inert.** A *suspect* state that gates nothing is
  cheap to enter and one clean run leaves it. It exists to be the thing a single
  bad run moves, so that the rungs which do gate something are never one run
  away from healthy.
- **Descent accelerates on severity or repetition.** Two tripped runs in the
  last three earns the degraded rung; severity, or a third consecutive trip,
  earns quarantine. Both predicates read *judged* runs only.
- **Recovery is earned, stepwise, and never lands on full trust.** A rung back
  up costs N consecutive clean judged runs, and the rung above quarantine is a
  watched state that still marks its output provisional — so a premature release
  is visible in the data rather than silent. From there another full streak buys
  the healthy rung, and a single trip drops straight back, because this source
  has already proven it can break.
- **A streak, not a total.** Counting clean runs in aggregate lets a source that
  fails every other run accumulate its way out of quarantine. The count stops at
  the first tripped run, newest backwards.
- **Only judged runs count toward recovery.** A source must not be able to heal
  on evidence nobody looked at.
- **Terminal quarantine is a bug on unattended systems.** "Quarantined until an
  operator clears it" means a source that broke at 03:00 and recovered at 04:00
  stays gated — writes diverted, pushes stopped — until a person happens to
  notice. That single property is usually the largest reason enforcement never
  gets turned on at all.

## Honest states: unmonitored, and cohort adequacy

Distributional signals need a cohort. A run with too few items, or a source with
too little history, cannot be judged — and *not judged* must not be recorded as
clean, because unknown rendering as a definite value is how a confident green
gets attached to a source nobody has ever measured.

Four consequences, in order of how often they are missed. The unjudgeable run
gets **its own verdict**, distinct from pass and from fail; it moves no state
and, critically, **it does not enter the baseline** — recording it as clean lets
a chronically thin source assemble its expectation window out of runs nobody
judged. The source listing reports such a source as **unmonitored** rather than
healthy. The *kind* of small is reported too: a source that has cleared the
floor before and shrank today is a finding worth a human's attention, while one
that has never cleared it is structurally unmonitorable, and one fleet-wide
floor with per-source interpretation is what tells them apart. And the rollout
gate **counts unjudged runs separately and names the unmonitored sources**,
because a preview over a source nobody could judge is weak evidence wearing the
clothes of a clean bill.

The floor never *lowers* under pressure. A thin source does not become easier to
trip by being chronically thin; it becomes honestly labelled.

## Boundary

[shape-change-detection](./shape-change-detection.md) owns the signals and the
immediate response: which measurements distinguish a redesign from a quiet day,
what thresholds they carry, and what happens to the harvest the moment a run is
judged suspect — quarantine, alarm, route into re-authoring. It answers *is this
run bad*. This technique starts one question later and answers *may that verdict
act yet* — the observe/enforce split, the evidence that licenses arming it, the
ladder the verdicts walk, and the states a source occupies while nobody can
judge it. [dry-run-preview](./dry-run-preview.md) is a preview of a different
subject at a different time: it gates an author's unsaved rule edit against a
live page before it is written, an authoring-time experiment run forwards. The
preview here fetches nothing, judges nothing, and touches no rule — it replays
what the deployed detector already decided, so that a *configuration* change can
be gated. Both are read-only, and that is the whole of the resemblance. The
ladder's rungs are graded evidence rather than graded maturity, so
`present-vs-enforced` in the maturity-ladders subject is a cousin: it insists a
rung claim distinguish a control that exists from a control that is applied,
which is the same distinction soak mode makes about itself.

## When not to soak

A detector whose only consequence is a notification has nothing to soak — the
consequence is already reversible and human-mediated, and gating it behind a
flag adds a switch and no safety. Soak is for consequences that change stored
data, stop traffic, or withhold work: diverted writes, suppressed pushes,
blocked reconciliation. A single target watched by the person who wrote the
rules does not need the lifecycle either; the operator *is* the ladder. And do
not soak past the exit criterion. A detector left observing after its evidence
is in has stopped being cautious and started being unmaintained — at which point
the honest move is to arm it or delete it, because a judgment nothing acts on
decays without anyone noticing.
