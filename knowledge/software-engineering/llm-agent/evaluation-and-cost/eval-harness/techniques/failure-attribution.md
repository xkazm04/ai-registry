---
layer: technique
type: technique
subject: eval-harness
technique: failure-attribution
status: forged
laws: [failure-not-empty-success, gate-sees-target, count-carries-predicate]
shared_with: []
use_when: [a suite went red and nobody knows what to change, the aggregate improved but the same failures recur, deciding whether a failing case is a defect or a bad label, an agent-based system failed and both the prompt and the model look correct, designing the change a failing class calls for, an optimizer or agent is proposing harness changes and nothing says how many at once, a model upgrade landed and the harness still carries the previous model's workarounds]
---

# Failure attribution

A harness that reports "62% pass" has told you the system's state and nothing
about what to do next. The aggregate is a summary of failures whose *causes*
it has already discarded — and the causes are the only part that converts a
score into work. Attribution is the step between them: for each failing case,
name the layer that owns it, then act on the recurring classes rather than on
the cases.

The step is missing from most harnesses for a structural reason. The suite is
built by people who assume the system under test is the thing being measured,
so a red case reads as a defect by default. It frequently is not.

## The green side was already asymmetric; this is the red side

This subject already refuses to read a pass at face value: a scenario
answerable without the material under test passes honestly and measures
nothing
([unaided-baseline-screening](./unaided-baseline-screening.md)), and an
all-green reduction run is compatible with having done nothing
([overshoot-and-restore](./overshoot-and-restore.md)). Both say the same
thing — **a verdict names a case, not a cause.**

The red side inherits that and nobody had said so. A failing case is
evidence that *something* between the scenario and the score is wrong, and
the system is only one of the candidates. Acting on a red case without
attributing it is how a team spends a week hardening a prompt against a
dataset error.

## The seven owners

Every failing case is owned by exactly one of these. Assign the *most
upstream* one that explains it — a bad label produces a wrong-looking output
downstream, and attributing that to the model is how the wrong fix gets
shipped.

- **Label.** The case's expected property is wrong, or answers a different
  question than the suite asks. The system's output was acceptable. *Tell:*
  reading the case makes you side with the output. *Response:* fix the case
  and re-baseline — never the system.
- **Dataset.** The label is right and the case is unrepresentative: a shape
  the system will not meet in production, or a region the suite over-samples
  because it was easy to collect. *Tell:* the failure is real but nobody can
  say when it would happen for a user. *Response:* re-weight or retire the
  region, and record that you did.
- **Input construction.** The case is right and the system never received
  what it needed — context truncated, a field dropped, the relevant evidence
  outside the window. *Tell:* the output is a reasonable answer to a
  different, smaller question. *Response:* fix assembly, not instructions.
- **Pipeline.** The model's output was usable and the surrounding logic
  mishandled it — a parse that silently produced a default, a threshold
  applied at the wrong step, a retry that returned a stale result. *Tell:*
  the raw output and the recorded outcome disagree. *Response:* fix the code
  around the call.
- **Tool surface.** The system acts through tools, and the case failed at
  one — the description made the wrong tool look right, the schema could
  not express the correct call, the parameter names were ambiguous enough
  to be filled plausibly and wrongly, or the tool returned a failure the
  agent could not act on and retried unchanged. *Tell:* the agent's
  reasoning is sound given what the tool told it about itself. *Response:*
  fix the tool's contract — its description, its schema, its error
  messages — not the instructions about it. Absent in single-call systems;
  in agentic ones it is where a large share of red cases actually live.
- **Prompt.** The model had everything it needed, in a usable form, and was
  not told what to do with it — an unstated constraint, an ambiguous
  instruction, a framing that makes the wrong thing salient. *Tell:* a person
  reading only the prompt would make the same mistake.
- **Model.** Everything above is clean and the output is still wrong. *Tell:*
  the residual after the other five are exhausted. *Response:* a different
  model, or an accepted limit written down as one.

The ordering is the technique. It is a strict funnel, and the last two are
the ones teams reach for first — which is why the ordering has to be
mechanical rather than intuitive.

## The tool surface was the missing owner, and it hides as the model

The first six owners describe a single-call system completely: something
is asked, assembled, sent, answered, and handled. An agent is not that
shape. It acts through a tool contract it did not write and cannot see the
implementation of, and that contract is a distinct authored artifact —
versioned separately from the prompt, frequently owned by a different
team, and injected by the harness rather than composed by the prompt
author.

The reason it needs its own row is that the funnel's own tells route tool
failures to the wrong owner. An agent that calls the right tool with wrong
arguments because a field name was ambiguous is not a **prompt** failure:
the prompt's tell is that *a person reading only the prompt would make the
same mistake*, and a person reading only the prompt would not — the prompt
was fine. It is not a **pipeline** failure either: that tell is that *the
raw output and the recorded outcome disagree*, and here they agree
perfectly, the agent genuinely did the wrong thing. Failing both tells, the
case falls through to **model** — the residual bucket, whose response is "a
different model, or an accepted limit written down as one."

So the funnel's most expensive outcome is exactly the one it was built to
prevent, and it is reached by following the technique correctly. The
correction is cheap because the fix is cheap: a rewritten tool description
or a tightened schema is a smaller change than a model migration, and it is
usually the one that was needed.

Where automated repair loops operate on this taxonomy, the split matters
for a second reason: a tool-surface fix is a change to code or contract,
while a prompt fix is text — and those are not interchangeable remedies
even when both are available. The instruction-file subject owns that
ordering from the other side.

## Two of the seven are not the system

Label and dataset failures are the reason attribution cannot be skipped.
Both produce a red case; neither is a defect; and the "fix" for either one,
applied to the system, moves the system *away* from correct while the score
improves. A suite that cannot distinguish them is gating on a proxy for
quality
([_laws: gate-sees-target_](../../../../_laws.md#gate-sees-target)), and it
is the specific proxy that rewards overfitting to the suite's own errors.

This is the same distinction the harness already makes at the outcome level —
a run that crashed is not a low-scoring run, it is a third state
([_laws: failure-not-empty-success_](../../../../_laws.md#failure-not-empty-success)).
Attribution extends it one level down: **a case that failed because the suite
is wrong is a fourth state**, and the harness that reports it as a failure is
telling the team the system regressed when the instrument did.

## Attribute a sample, act on the classes

Attribution is manual and it does not scale to the whole suite. It does not
need to:

- **Sample both tails.** Failures where the system said yes and failures
  where it said no have different causes and different owners, and a sample
  drawn only from the noisier tail finds only that tail's classes.
- **Group before deciding.** One attributed case is an anecdote. The unit of
  action is a *class* — five cases owned by input construction, all missing
  the same field — and the class is what a change is designed against and
  measured on. Report class counts with their predicate: "input construction,
  9 of a 40-case sample from the false-positive tail"
  ([_laws: count-carries-predicate_](../../../../_laws.md#count-carries-predicate)),
  never a bare tally that will be read as a rate over the suite.
- **Re-attribute after the change.** The success condition is that the class
  shrank, not that the aggregate rose. A change that moves the headline while
  the class persists moved something else, and you have not learned what.

Reviewing dozens of cases by hand is the expensive part and it is still the
cheap path. The alternative — a change per hypothesis, each costing a full
suite run — pays the same time in run cost and learns less per attempt,
because a suite result cannot tell you *why* it moved.

## The change is an experiment, and it is designed before it is run

Attribution ends with a class and an owner. Re-attribution begins after a
change. Between them sits a step this technique had left to whoever holds the
keyboard, and it is where a clean attribution gets spent badly: the fix
arrives as a bundle — a reworded instruction, a new tool, a wider context
window, all in one round — the aggregate moves, and the class count is the
only thing that can say which part did it. It cannot, because three things
changed. The round produced a number and no knowledge.

The corrective is to treat a change the way the harness already treats a
run: as an experiment whose comparability is engineered before it starts.

- **One component per round.** The system under test decomposes into named
  parts — instructions, tools and their descriptions, memory and retrieval,
  context assembly, control flow, the verifiers, the budget and stopping
  rules — and a round changes exactly one of them. Two in one round produce
  a result attributable to neither, and the second round spent untangling
  them costs a full suite run and learns less than the first would have on
  its own.
- **The model stays pinned while the harness moves.** A model version and a
  harness change confounded in one round cannot be separated afterwards, and
  the harness change is the one that was under investigation. The
  instrument discipline the golden path applies to the judge applies to the
  candidate: freeze what is not the variable.
- **Write the prediction down first.** The hypothesis is an explanation plus
  a prediction — *this class fails because the agent accepts executable
  output without checking it; an independent verification step should
  shrink that class* — and the modification is the concrete form of it:
  add the step, invoke it after execution, permit one repair. The prediction
  names the class and the direction, and it is recorded before the run, so
  that an aggregate that rose while the named class held steady is read as
  the miss it is rather than as a success nobody predicted. A mutation
  expected to move one class is not judged on the whole population's mean
  ([_laws: count-carries-predicate_](../../../../_laws.md#count-carries-predicate)).
- **Keep the parent.** The round's record is parent state, the one component
  changed, the diff, the prediction, and the measured class delta. The losing
  variant is discarded; its record is not. A second round that cannot name
  what the first one tried repeats it.

The shape holds whether the experimenter is a person or an agent. An agent
that proposes harness changes from a batch of failure traces is running this
loop at scale, and the scale is exactly why the rule has to be mechanical:
a proposer that emits three coupled changes per round can run a thousand
rounds and never learn which component was load-bearing, and its improving
headline is the same theatre as an unscreened reduction run
([_laws: gate-sees-target_](../../../../_laws.md#gate-sees-target)). The
search over harness configurations is a search, not a gradient, and a
search that cannot attribute its own steps is a random walk with a good
narrator.

## A fix at the pipeline or prompt layer names the model it was built for

Four of the six owners resolve to a change in the system, and three of those
changes — a stricter reminder, a retry that re-issues a malformed tool call, a
parser that repairs the model's near-miss output — are not corrections of a
defect in the harness. They are **compensations for a defect in the model**:
the harness grew a capability because the model that was measured lacked one.
A compensation is created state whose reason is a fact about one model
version, and the reason lapses when the version does.

This subject already says so about the other side of the instrument: a
scenario's discriminating power is a property of the scenario-*and*-candidate
pair, and a model upgrade can dissolve it without anyone touching the suite
([unaided-baseline-screening](./unaided-baseline-screening.md)). The harness
side is symmetric and had never been written down. After an upgrade, a
compensation is in one of three states, and only a run can tell which: it
still pays; it is dead weight (the model no longer produces the failure it
catches); or it is **now the failure** — an aggressive retry that resubmits
work the model completed, a repair that rewrites a tool call the model got
right, a reminder so insistent that a model which understood the goal now
argues with it. The third state is the one that hides, because attribution
funnels it to *pipeline* or *prompt* and the obvious response is to tune the
compensation rather than to ask whether it should exist.

Two disciplines, both cheap:

- **Write the model it was built against into the compensation**, at
  creation, in the shape the corpus already uses for any compensating
  capability: *this exists because model X did Y; when a model no longer
  does Y, delete it.* A retry ladder or a prompt template without that line
  is indistinguishable from a design decision six months later, which is how
  a workaround for a retired model becomes load-bearing.
- **Re-ablate on upgrade; do not carry forward.** The harness that ships with
  a new model is the *matrix* question from
  [comparison-modes](./comparison-modes.md) — model × compensation-set ×
  scenario, N trials per cell — not the previous winner with the model swapped
  in. Ablate the compensations as a set, not one at a time: the model's own
  change interacts with all of them, and a compensation that looks harmless
  alone can be the one whose removal lets the model's new capability show. A
  compensation the ablation cannot justify against the new model is deleted,
  not tuned, and the class it used to shrink is re-attributed from scratch,
  because its owner may have moved from *pipeline* to *nothing*.

The failure mode this guards against is symmetric with the suite's: a suite
that got easier reads as improvement, and a harness that got heavier reads as
robustness. Both are the instrument absorbing a change in the candidate and
reporting it as a change in the system.

## A class with no owner is a product decision

Some classes resist all seven. The recurring shape is a genuine ambiguity in
the task: cases where competent reviewers disagree about the right answer,
which means the suite is asking a question the product has not decided.

Attributing these to the model is the standing error. The response is not a
fix at any layer — it is a stated policy, and then a dedicated region of the
suite that encodes it, so the next run measures conformance to a decision
instead of re-litigating it. A recurring unattributable class is the most
valuable thing an error review produces, because it is the only one that was
invisible to everyone until the cases were laid side by side.
