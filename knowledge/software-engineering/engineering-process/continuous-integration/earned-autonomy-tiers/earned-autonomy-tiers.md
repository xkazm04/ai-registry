---
layer: golden-path
type: golden-path
subject: earned-autonomy-tiers
status: forged
use_when: [deciding which agent actions may land without a person reading them, designing how an agent gains or loses standing over time, a revert or reopened finding should cost an agent its autonomy, an autonomy setting is a flag someone flips by feel]
techniques:
  - effective-tier-is-the-lowest-bound
  - asymmetric-promotion-and-demotion
  - shadow-next-rung
  - recomputable-promotion-trial
  - demotion-attribution-integrity
---

# Earned autonomy tiers

An agent's autonomy is usually configured: someone decides the agent is good enough, flips a
setting, and the agent runs with less oversight from then on. The setting records a feeling at
one moment, applies to everything the agent does, and never changes again unless the same
person remembers to change it. This subject replaces that setting with a **standing** — a
position on an ordered ladder, held separately for each kind of action, climbed only on a
record anyone can recompute, and lost automatically when the record turns.

The thesis is one sentence:

> Autonomy is not granted to an agent; it is **earned by a class of action**, one rung at a
> time, on evidence the agent did not write — and it is lost faster than it is earned.

Three commitments follow, and each closes a failure the configured setting has. The unit is the
pair (agent, action class), so standing earned on dependency bumps lends nothing to schema
migrations. Promotion is a person's reviewed change to policy, made after a recomputable record
clears a stated bar, so standing never rises by itself. Demotion is mechanical and immediate, so
standing never waits for anyone to notice. Everything else in the subject is what it takes to
make those three hold under an agent fleet that produces hundreds of actions a week.

## The ladder and the two states beside it

A ladder is a closed, ordered set of rungs, and each rung is an enumerated contract — what an
action at this rung may do without a person, and what it must still wait for. A practical ladder
has three rungs. At **assisted**, the agent proposes and a person authors the change from the
proposal. At **supervised**, the agent authors the change and a person approves each one before
it lands. At **hands-off**, the change lands on its proof, and a person reviews after the fact,
in aggregate, with the power to undo. The rung names who is the fallback when the agent is wrong,
which is the same choice graded driving-automation taxonomies make: the level is defined by who
must be ready to take over, not by how capable the system is.

Two states sit off the ladder, and keeping them off it is load-bearing. **Quarantined** is where
a class goes after a serious breach: nothing the agent does in that class lands, and no record
earns its way out — leaving quarantine is a person's decision with a reason, not a rung climbed.
**Human-only** is a class the policy says no agent performs at any standing: changes to the
gate's own configuration, to credentials, to the policy itself. Modelled as the bottom rung,
either state becomes something the promotion rule can lift, and the whole point of both is that
it cannot.

The action class has to be drawn where the evidence can reach. A class is a set of actions
whose correctness one mechanical check can establish — a dependency patch whose test suite and
rescan say so, a lint fix whose diff the formatter reproduces — and its boundary is its
operational domain in the driving-automation sense: hands-off inside it means nothing outside
it. A class drawn wider than its proof ("code changes") averages a record across actions the
proof does not cover, and the standing then authorizes exactly the actions nobody measured.

## The effective tier is a minimum, computed at the gate

The rung an action runs at is not the rung its class was promoted to. It is the **lowest** of
several independent bounds: the rung the record supports, the ceiling the policy sets for the
class, and whether the standing's lease is still current. A promotion that outlives its evidence
window, a class whose ceiling was lowered after a promotion, a tripwire that fired an hour ago —
each lowers the effective tier on its own, and none needs the others to agree. The gate computes
this minimum on every action from the stored state, and anything it cannot read resolves below
the ladder, per [unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value): an unreadable
state file, an unrecognised tier name, an agent with no record, several holders with none named
— each is a refusal, not even the bottom rung, because the bottom rung is a standing too and
enrolment in it is a person's recorded act. The bounds, why the minimum is the only safe
combinator, and what a lease is for are
[effective-tier-is-the-lowest-bound](./techniques/effective-tier-is-the-lowest-bound.md).

## Up by a person, down by a wire

Promotion and demotion are different operations with different authorities, and treating them
as one adjustable number is the mistake that ruins the mechanism. Promotion is consequential —
it removes a human from a path — so it is a reviewed change to versioned policy, proposed with
the record attached, approved by a person who is not the agent, one rung at a time. The machine
may compute that the bar is cleared and draft the change; it never applies it.

Demotion is protective, so it is automatic. A **tripwire** is a model-free rule over observable
events — the change was reverted, the finding it closed reopened, a guardrail blocked it — that
lowers the standing the moment the event is seen, by an amount fixed in policy: one rung for an
ordinary regression, straight to quarantine for a high-severity breach. No model judges whether
the revert "really" counted, because a judge that can be argued with is a tripwire that can be
argued past. A demotion also starts a cooldown during which no promotion of that standing may be
proposed, so a class cannot be knocked down and waved straight back up on the record that preceded
the fall. The two rates, the reasons they differ, and why a demotion is recorded as a change
to the same state promotion edits are
[asymmetric-promotion-and-demotion](./techniques/asymmetric-promotion-and-demotion.md).

## Evidence for a rung you do not hold yet

A record earned at supervised says the agent's proposals were approved. It does not say what
would have happened had nobody been asked, which is the only question promotion to hands-off
needs answered. The way to get that evidence without paying for it is to **shadow the next
rung**: for every action, compute and record what the gate would have decided one rung up, and
later score that counterfactual against what actually happened — did the person approve
unchanged, did it stick, was it reverted. The shadow is written into the decision record at the
moment of decision, before any outcome exists, which makes it a **pre-registered** trial: nobody
can choose afterwards which counterfactuals to count. Shadow decisions never act, and they live
where the standing computation never reads them. How to run the shadow, what to compare, and why
disagreement is the most valuable output are [shadow-next-rung](./techniques/shadow-next-rung.md).

## The record is something anyone can recompute

The bar for promotion is only as honest as the number it reads. A success rate the agent's own
service reports, a dashboard figure nobody can rederive, a count whose predicate drifted between
weeks — each lets standing rise on a figure no reviewer could check. The record is therefore
**append-only, built from facts outside the agent** (proof verdicts, merges, reverts, reopens),
and the promotion figure is recomputed from it by a deterministic procedure any reviewer can run
and get the same answer, per
[derivation-names-recomputation](../../../_laws.md#derivation-names-recomputation). The bar names
its window, its minimum count, its predicate and its tolerance, per
[count-carries-predicate](../../../_laws.md#count-carries-predicate), and is read as a bound rather than a raw rate, because twelve clean actions are not evidence of
reliability. Only actions the gate itself decided enter the record — work that reached the branch
some other way says nothing about the gate's rung — and the reviewer recomputes against the same
cut of the record the proposal states, anchored so a rewritten history fails to verify rather than
quietly yielding a better number. The trial procedure is
[recomputable-promotion-trial](./techniques/recomputable-promotion-trial.md).

## Demote the right party

A tripwire that fires on the wrong (agent, class) pair is worse than one that does not fire: it
punishes a class that did nothing and leaves the one that failed at full standing. The tempting
attribution source is metadata the action carried — a trailer naming the agent and the class, a
label on the change — and every such field was written by the party being judged. Per
[claimant-does-not-adjudicate](../../../_laws.md#claimant-does-not-adjudicate), the class to
demote is read from the gate's own record of what it decided, keyed by an identity minted at the
gate. The link a revert draws to the change it undoes is itself text its author wrote, so a
revert one agent carries against another agent's work demotes nobody automatically — a person's
revert counts, and so does an agent's revert of its own work, but a rival's word is not evidence.
An event that cannot be tied to a gate record demotes nobody and is surfaced as unattributed, and
a sweep that could not see every event fails rather than reporting none. The attribution rules are
[demotion-attribution-integrity](./techniques/demotion-attribution-integrity.md).

## The gate fails closed

Every path through this mechanism has a failure branch, and every failure branch resolves to the
lower standing. The state cannot be read: refuse. The record cannot be recomputed, or falls short
of its minimum count: no promotion — short is inconclusive, never a pass. A tripwire's event
source is down: the sweep goes red and the lease stops renewing, so the class drifts down rather
than holding a standing nobody is still checking. An unknown action class: human-only. The
asymmetry is deliberate — a wrongly low tier costs a person some review; a wrongly high one lands
a change nobody read, and that cost is unbounded.

One change resets standing that no tripwire would catch: **a material change to the agent
itself** — a different model, a rewritten instruction set, a new tool grant. The record measured
the previous agent. A standing carried across that change is a standing nobody earned, so the
change either opens a fresh record or drops the affected classes a rung until a shadow run
re-qualifies them.

## What this subject does not own

The gate for a single action — how a pause is presented, recorded, timed out and resumed, and
the person-set autonomy dial an operator turns — is
[hitl-approval](../../../llm-agent/orchestration/hitl-approval/hitl-approval.md); this subject
owns the *standing* that decides which of those gates an action meets, and how that standing
moves on evidence rather than on a person's sense of the agent. The rule that a merge decision
stays human, and the arithmetic of how fast a person can make them, is
[machine-paced-delivery](../machine-paced-delivery/machine-paced-delivery.md); a hands-off class
is the measured exception to that rule, bounded to classes whose correctness a mechanical proof
establishes, and it exists here because its admission is a record, not a preference. What
counts as a proof — the evidence an action must carry, and the model-free job that re-derives it
— belongs to
[proof-carrying-agent-actions](../../../llm-agent/evaluation-and-cost/proof-carrying-agent-actions/proof-carrying-agent-actions.md);
this subject consumes
its verdicts and owns what an accumulated record of them earns. The rule a reader uses to pick:
one action's checkpoint is the gate's; one action's evidence is the proof's; the standing that
moves across many actions is here.

## The techniques

- [effective-tier-is-the-lowest-bound](./techniques/effective-tier-is-the-lowest-bound.md) — the
  rung an action runs at is the minimum of record, class ceiling and lease, computed at the gate,
  unknown below the ladder.
- [asymmetric-promotion-and-demotion](./techniques/asymmetric-promotion-and-demotion.md) — up
  one rung by a person's reviewed policy change, down automatically by a model-free tripwire.
- [shadow-next-rung](./techniques/shadow-next-rung.md) — record what the gate would have decided
  one rung up, score it later, never let it act.
- [recomputable-promotion-trial](./techniques/recomputable-promotion-trial.md) — the promotion
  figure rederived from an append-only record of outside facts, against a bar that names its
  window, count and bound.
- [demotion-attribution-integrity](./techniques/demotion-attribution-integrity.md) — the class
  demoted is the one the gate decided, never the one the action's metadata claims.
