---
layer: technique
type: technique
subject: fleet-orchestration
technique: delegate-by-net-benefit
status: forged
applied: simulation
ab_verdict: better
laws: []
shared_with: []
use_when: [deciding whether to hand a step to a worker or do it in the current session, a plan splits work into one worker per item by habit, workers fanned out on a contract or schema that turned out incomplete, two delegates were given the same tree or the same file, writing a supervisor's policy for when it may spawn, a long-running director is filling its own context with work a worker could carry]
---

# Delegate by net benefit

[parallel-dispatch](./parallel-dispatch.md) answers how many sessions may run and
where each may write. It assumes the decision to delegate was already made, and
nothing in this subject makes it. Left unmade, it defaults to "spawn": one worker
per item, because the plan had items. This technique is that decision.

## The default is to do it here

Delegation is a purchase, and the current session doing the step itself is the
price-free baseline. The step goes to a worker only when what it buys exceeds what
it costs, and a session that cannot name the benefit does the step itself.

**What a delegate costs**, each one real on every dispatch:

- **The brief.** Everything the worker does not inherit has to be written down
  ([brief-carries-the-session](./brief-carries-the-session.md)). For a small step
  the brief is longer than the work.
- **The return.** A worker's "done" has to be checked against the artifact
  ([completion-claim-verification](./completion-claim-verification.md)), and its
  summary carries less than the parent would have seen doing it.
- **Steering.** A dispatched worker usually cannot be corrected mid-run, and some
  cannot be stopped. Every bound it needs (scope, budget, the paths it may not
  touch) has to be settled before dispatch, because no later chance comes.
- **The supervisor's reading.** Each return takes a decision from whoever reads
  it, and that reader does not scale with the worker cap (parallel-dispatch > "The
  third number is the supervisor's").

**What a delegate buys**, at least one of which must be present and named:

- **Wall-clock**, from work that is truly independent and runs at once.
- **The parent's context.** A session that has to stay coherent for hours keeps
  its context for decisions. For such a director, routing nearly every scan,
  read and build through workers that answer with a file path and one line is
  this rule applied correctly. Its context is the scarce resource, and each
  delegation saves it. "Do it here" is the default for a session whose horizon
  is the task in front of it.
- **A capability the parent lacks**: a different tool grant, model, workspace,
  or a reader with no stake in the answer, as in review or test-first
  specification by someone other than the builder.

## Two vetoes are not weighed

These forbid *parallel* delegation outright, whatever the benefit:

1. **One worker needs another's output.** A step that consumes another step's
   result cannot run beside it. Finish the producing step, check that its output
   holds everything the consumers will read, and fan out after. Disjoint write sets
   do not clear this: workers editing different files still all read the one
   contract, and an incomplete contract makes each of them find the gap mid-build
   and patch it in its own way.
2. **Workers would share mutable state.** Same tree, same index, same file, same
   record: parallel-dispatch's write-set rejection. The repair is one worker
   taking the items serially, or isolated workspaces. Splitting the same shared
   tree more finely is not a repair.

A veto does not forbid delegating a step *serially*. Whether one worker should
carry a dependent step is still a net-benefit question.

## The decision, in order

1. Is there a named benefit: wall-clock, the parent's context, a capability? If
   not, do it here.
2. Does any parallel member consume another's output? Then serialize that edge
   and check the produced output before the fan-out.
3. Do any members share mutable state? Then use one worker or isolate them.
4. Does the benefit exceed brief + return check + lost steering + the reading?
   Delegate. Otherwise do it here.

## When not to use it

A program that dispatches jobs with no context of its own, such as a queue
consumer or a build farm, has no "do it here" option, and this is not its
question. Its questions are capacity and assignment, which are parallel-dispatch's.

## Evidence

`applied: simulation`. Three recorded decisions from one managed project's agent
loop were walked with and without this rule, against the corpus as it stood
(parallel-dispatch alone):

- Per-item test-writing workers in one shared worktree fought over the index and
  a spec file, and the fix was one worker per cycle. Both policies predict this,
  so the case shows the second veto is right but not that it is new.
- Builders fanned out on a contract a director had just committed, with disjoint
  write sets. The contract was incomplete, and the builders found the missing
  fields mid-build. It happened twice on consecutive days. Write-set disjointness
  admits the fan-out. The first veto forbids it until the contract is checked.
- An eight-hour director that delegates every step, beside a runner that wrote a
  single-item spec itself and saw it red first. The corpus says nothing about
  either. A bare "default to direct" would call the director's design wrong. With
  the parent's context counted as a benefit, the rule predicts both. This was the
  falsifying case, and it is why the context term is in the rule.

Target (rule matches the recorded outcome in 2 of 3 cases where the baseline does
not) held: 3 of 3 against 1 of 3. Floor (no recorded success forbidden, no recorded
failure admitted) held: 0 mispredictions. The weakest part is that the director's
all-delegate doctrine is a design choice, not a measured outcome. Its only outcome
evidence is that the loop ran its cycles.
