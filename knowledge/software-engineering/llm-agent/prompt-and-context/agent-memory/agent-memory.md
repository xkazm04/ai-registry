---
layer: golden-path
type: golden-path
subject: agent-memory
status: forged
techniques:
  - working-memory
  - episodic-capture
  - consolidation
  - decay-and-forgetting
  - recall-injection
  - memory-governance
  - memory-value-model
  - rollup-compaction
  - coverage-instrumentation
  - procedure-promotion
  - baseline-ladder
  - lane-reconciliation
  - probe-without-write-back
---

# Agent memory

A long-lived agent is distinguished from a stateless function by exactly one
thing: what it carries forward. Memory is that carrying — and it is a
*discipline*, not a storage feature. The naive reading ("persist things, look
them up later") produces systems that hoard everything, recall the wrong
things, and end up believing statements nobody vouched for. The principal
reading is that memory is a pipeline of **deliberate transformations** — from
what is happening, to what happened, to what is believed — where every
transition is a judgment call with a budget, and every surviving item can
answer for itself.

The subject covers the whole pipeline: operative state inside a session,
capture of what occurred, distillation into durable beliefs and procedures,
decay of what stopped mattering, and the injection of the survivors back into
the agent's context. Cutting any one stage out does not simplify the system;
it relocates that stage's judgment into whichever stage is left, where it is
done badly.

## The hierarchy: three layers with different physics

Memory is not one store with one policy. It is three layers whose write rates,
lifetimes, trust levels, and recall costs differ by orders of magnitude —
which is why one policy cannot govern them.

| Layer | Holds | Write rate | Lifetime | Trust |
| --- | --- | --- | --- | --- |
| **Working** | operative state of the current task: the goal, constraints discovered, decisions made, open threads | continuous | the session or task, then gone | ephemeral — never quoted as durable truth |
| **Episodic** | records of what happened: exchanges, task runs, outcomes, corrections | per meaningful event | bounded — months, not forever | high as *record*, low as *belief* |
| **Consolidated** | what the agent believes and knows how to do: distilled facts, preferences, procedures, self-knowledge | slow, batched, judged | long, under decay | the only layer allowed to speak as knowledge — and only with provenance |

The transitions between layers are the design surface. Working state does not
*leak* into the episodic record; it is **captured** at meaningful boundaries
(episodic-capture). Episodes do not *accumulate* into beliefs; they are
**consolidated** by an explicit distillation pass (consolidation). Beliefs do
not live forever; they **decay** under an importance model that never loses
its audit trail (decay-and-forgetting). And nothing reaches the agent's
attention by residence alone; it is **recalled** under a budget
(recall-injection). Each arrow is a place where a judgment is made once,
explicitly — instead of being made implicitly, forever, by whatever happens
to be lying around.

One implementation seat the hierarchy deliberately does not fix: the
consolidated store's **shape** — flat, indexed, or graph. The measured
record now carries two independent results pointing the same way: a
first-party study found hybrid graph-plus-index recall tying a flat index,
and a graph-memory vendor's own ablation found its graph variant worth
about two points over its non-graph base. Meanwhile the parts of the
"temporal knowledge graph" designs that demonstrably carry value —
supersedence with validity windows, invalidation instead of deletion — are
obligations this subject already imposes on *any* shape (see
consolidation). Choose the store's shape for operational reasons — query
patterns, tooling, scale; expect recall quality to come from the
transitions, not the topology.

That hedge has a scope condition, and every measurement behind it sits inside
it: **the topology was consumed through a retrieval call.** A shape the
consumer never sees, queried by an index on its behalf, is an operational
choice and the hedge holds. A shape the consumer can *survey* — browse, list
the siblings of, and know how much it has not looked at — is a different
object, and there the shape has been measured to carry recall quality further
than the transitions do, against a control given the same summarization budget.
The discriminator is not tree-versus-flat; it is whether the organization is an
interface or an implementation detail. Where it is an interface, expect a
second cost the hedge never had to price: such a structure is compiled, and a
compiled structure over a store that captures and forgets continuously is
stale by construction rather than by failure.

That hedge has since survived a direct attempt to overturn it, and came back
better grounded. Graph-structured designs reporting real gains have, in their
own ablations, attributed the primary factor to **multi-step reasoning at
recall time** rather than to the structure — the same transitions-over-
topology reading, arrived at from the pro-graph side. And the wider reason to
distrust any shape verdict is now measurable: when the confounds are
controlled one at a time, a single uncontrolled variable — the embedding
model, the consuming model — moves the result further than the architectures
under comparison differ from each other, which means most published
shape comparisons are not evidence about shape (baseline-ladder). A tie is
not the finding; the finding is that the instrument is not sharp enough to
report the difference anyone is arguing about.

## Raw transcripts are not memory

The most common failure of agent memory is to declare the conversation log
"the memory" and bolt retrieval onto it. This fails structurally, not
incidentally:

- **Wrong altitude.** A transcript stores utterances; memory needs claims.
  "The operator said the deadline moved" and "the deadline is the 14th" are
  different objects — the second has a truth value, a scope, and a shelf
  life; the first is just evidence for it. Retrieval over utterances
  retrieves phrasing, not knowledge.
- **No supersedence.** A log can only append. When Tuesday's fact reverses
  Monday's, a transcript contains both with equal standing, and the retriever
  — not the memory system — inherits the job of adjudicating, at recall
  time, every time, with no record of the verdict.
- **Unbounded growth against a bounded recall.** The context an agent can
  attend to is finite and priced. A store that grows linearly with usage
  while its consumer stays constant guarantees that recall precision decays
  with age — the system gets *worse* at remembering the more it has lived.
- **No correction surface.** A recorded mistake is replayed as faithfully as
  a recorded fact. Memory must be correctable; history must not be. Those
  are two different stores.

Transcripts are the *raw material* — the evidence layer that episodes excerpt
and consolidation cites. Keeping them (bounded, archived) is good practice.
Calling them memory is the original sin of the domain.

Two things that sin is *not*, and the distinction has been measured. It is not
a prediction that the pipeline wins a benchmark: every objection above is a
claim about what happens past the window and past a reversal, and on a
fixed-size question set where the history still fits and nothing was ever
corrected, the raw record in context is a strong incumbent that
purpose-built memory systems frequently lose to. And it is not permission to
skip the comparison: the transcript route is the baseline this whole standard
is obliged to beat, on the tasks and the consumer at hand, before its costs
are worth paying (baseline-ladder). Treat rungs 2 and 3 of that ladder as the
incumbent and the pipeline as the challenger; the argument here says the
challenger wins *eventually and for structural reasons*, which is exactly the
claim a short benchmark cannot settle in either direction.

## Provenance is the trust anchor

A consolidated belief is a derived value: derived from episodes, by a
distillation pass, at a point in time. Like every stored derivation, it must
name how it was produced — which episodes ground it, when it was distilled,
what confidence the distiller assigned, and what superseded or reinforced it
since. This is the [derivation-names-recomputation](../../../_laws.md#derivation-names-recomputation)
law wearing its most consequential costume, because here the derived value is
not a cached count — it is something the agent will *assert as true*.

Provenance is what makes every other operation safe:

- **Contradiction handling** needs to compare the grounds of two competing
  claims, not just their timestamps.
- **Audit** — "why do you believe this?" — must terminate at real events, in
  bounded steps. An agent that cannot answer that question is not
  remembering; it is confabulating with persistence.
- **Forgetting** must know what a deletion orphans. Removing an episode that
  grounds a live belief silently converts that belief into a confabulation.
- **Human trust** is calibrated by inspection. An operator shown a belief
  with its sources can correct the belief *or the reading of the sources*;
  shown a bare assertion, they can only veto blind.

The rule is absolute at the consolidated layer: **a belief without provenance
is not stored knowledge, it is a rumor with a database row.**

## Memory is a budgeted resource

Every stage of the pipeline has a budget, and a memory system is honest only
if all of them are explicit:

- **Write pressure.** Not every event deserves an episode, and not every
  episode deserves consolidation. Capture criteria are cheap and generous
  (recording is cheap; judgment can come later); consolidation criteria are
  expensive and strict (a belief costs recall space for the rest of its
  life).
- **Retention.** Every category of memory has a cap and a decay curve chosen
  on purpose. A store without caps has chosen its failure date and not
  written it down.
- **Recall.** The injection budget — how much of the agent's finite context
  memory may occupy — is the scarcest resource in the system, because it is
  paid on *every single invocation*. Everything upstream exists to make this
  spend precise: the point of forgetting is that recall stays sharp; the
  point of consolidation is that one distilled line does the work of forty
  raw ones.

When these budgets are implicit, the system still has them — they are just
enforced by failure: recall that returns noise, contexts that overflow,
stores that grow until someone deletes in panic (and panic deletion never
preserves provenance).

## One value model, or two policies that disagree

Spending a budget requires an ordering, and two of the stages need one: recall
must rank what to inject, and forgetting must rank what to retire. These look
like separate concerns and are not — they are the same question, *what is this
item worth right now*, asked by two callers. A system that answers it twice
(a "relevance" score for the read path, an "importance" score for the janitor)
has built a store that retires items its own recall path was actively serving,
with nothing in either component looking wrong when read alone.

The standard is one shared, explicitly-argued value model
(memory-value-model), imported by the read path and by the janitor. Its axes —
trust, per-kind age decay, and a sub-linear bonus for repeated retrieval —
compose so that no single property can order the store alone, and its
consequences reach further than ranking.

Name the third axis for what it counts. Unless something flows back from the
consumer, it counts *deliveries*: an item packed into fifty contexts and
ignored scores exactly like one that answered fifty questions. Calling it
proven usefulness is the first error, because it licenses the second — leaving
the term unbounded. Delivery is caused by rank, and rank is caused by score,
so an unbounded term feeds its own input; and because the retirement sweep
scores with the same model, that loop is an unbounded stay of execution. A
stale, barely-trusted item that happens to keep matching queries then holds
itself above the floor forever, for free, and the store's own janitor is what
keeps it alive.

So bound the retrieval bonus, and pick the bound so the arithmetic terminates:
a low-trust item must fall under the floor after a stated number of half-lives
*regardless* of how often it was delivered. Retrieval then buys a bounded
reprieve rather than a veto — enough to outrank an ordinary trust gap, which
is why the term exists, and never enough to make forgetting unreachable.

## The store's third failure: accretion

Two of the ways a memory store degrades are well known — it fills with
irrelevance (answered by decay) and it drifts out of date (answered by
supersedence). The third is quieter. Items accumulate that are each
individually true, each individually worth keeping, and that *together say one
thing*. Nothing is stale, nothing is wrong, and the recall budget is being
spent six times over on one piece of knowledge.

This needs its own pass — rollup-compaction — because the other two cannot
see it: decay finds nothing low-value, and supersedence finds no
contradiction. And it needs a companion instrument for the inverse defect,
because a store can be simultaneously redundant where it is used and blind
where it is not. That instrument is not a listing surface, however good:
**a list can only show what is there; it structurally cannot show an
absence** (coverage-instrumentation).

## Below the pipeline: the store is machinery, and machinery drifts

Everything above is about judgment — what to capture, what to believe, what to
retire. Underneath it sits plumbing that makes no judgments at all, and it fails
in ways no amount of judgment can detect.

The store is not one backend. A record owns identity and provenance; the
retrieval lanes over it are separate engines with no shared transaction, so the
write fans out and can half-succeed. The item that results is correct by every
measure this subject defines and unreachable through the door the agent uses —
and the coverage instrument, which joins the record, reports it present
(lane-reconciliation). Absence from a lane is invisible to every technique that
reads the store's contents, because the item *is* in the store's contents.

And the read path is not read-only. Recall increments the usage term the value
model ranks on, which makes every scheduled machine caller of recall a writer to
the ranking — including whatever was installed to measure recall. A probe
replaying a fixed question set through the production retriever inflates its own
expected answers on a schedule, forever, and its rising numbers are the loop
closing rather than the store improving (probe-without-write-back).

Both defects share a shape worth naming: they are produced by components that
are individually correct. Nothing is misconfigured, no judgment was wrong, and
reading any one file explains nothing. They are found only by asking two
questions the pipeline never asks — *do the stores still agree*, and *who else
calls this*.

## The human's role: what an agent is allowed to believe

An agent's memory is not merely its own affair. Beliefs about the operator,
about standing instructions, and above all about the agent's *own identity
and rules* have blast radius: they shape every future action. The write path
must therefore be tiered by stakes, not uniform:

- Low-stakes observations may commit autonomously — subject to the same
  provenance and decay rules as everything else.
- Claims about the operator's preferences and intentions earn a review lane:
  proposed by the agent, visible to the human, adoptable or rejectable.
- Changes to the agent's self-model and standing rules are **human-gated,
  always**. A system that lets an agent silently rewrite what it believes
  itself to be has built identity drift with a persistence layer.

Corrections flowing the other way carry maximum authority: when the human
overrides a belief, that correction supersedes immediately and is itself
remembered — with provenance marking it as operator-issued, the highest
grade of evidence the system knows.

## When a procedure stops being a memory

Consolidation produces facts, preferences and **procedures**, and the first two
have found their destination once they can be recalled. A procedure has not. A
recalled procedure is advisory text the model re-interprets every time, so the
agent re-derives its most common work forever, slightly differently on each
run.

Promotion is the boundary where a remembered procedure becomes a named,
invocable, versioned capability — something the agent *runs* rather than
*reads*. The bar is higher than consolidation's because the output executes:
counted recurrence, a step sequence that varies only in its inputs, a stateable
outcome, and either bounded consequence or an approval gate. Capture comes from
observation (real, but silent about which steps were essential) or from a human
demonstration (intentional, but silent about generality); neither is sufficient
alone. Promotion goes through one door, mints its own identity, keeps its
provenance, re-promotes as a new version rather than an overwrite, and — being
created state — names its reaper. The source memory survives: it is the
evidence the capability exists for.
[procedure-promotion](./techniques/procedure-promotion.md) owns the boundary.

## What this standard assumes

Every obligation above rests on two assumptions. Both were safe when they went
unstated and neither is any longer, so they are stated here — as a boundary,
not as a retraction.

**One: the reader is frozen.** This standard is written for a consumer whose
weights do not change. The bank is a separate artifact the consumer reads;
every transition between layers is a judgment made at design time, written
down in prose, and enforced in code — which is precisely why it can be
argued with, audited, and corrected. A second architecture is now established:
train the memory operations *into the policy*. Which entries to add, update,
delete or leave alone on the write side; which retrieved items to keep,
reconcile against the present state, and act on at the read side — optimized
end-to-end against task outcome rather than specified. Multiple independent
groups now report working systems of this shape across several benchmark
families, which is what turns it from a single result into a boundary this
subject has to name.

Where memory behavior lives in weights, the three parts of this standard
separate:

- **Unchanged.** Everything about the store *as a record*: provenance,
  supersedence with validity, the governance tiering over identity and
  standing rules, the audit answer every belief owes. A learned reader does
  not turn a rumor with a database row into knowledge — it only makes the
  rumor harder to spot.
- **Stayed designed.** The budget *partition* does not move, and the systems
  built to learn everything are the evidence. In one reference implementation
  of the learned architecture, the always-include tier and the selective tier's
  depth are both design-time constants sitting in code, and the ablation puts
  the largest single loss on removing the designed working-memory tier — larger
  than removing any learned operation. What went into weights was *selection
  within a tier*, not the tiers. Ablate the partition before ablating the
  policy, and do not concede this row in advance.
- **Relocated.** The read-path stages this subject specifies as designed
  steps — labeling recalled material, checking whether a recalled item applies
  before acting on it — become behavior with no prose to inspect. The operator's question degrades from "why was this recalled and
  that not", which the omitted-and-ranked list answers in one step, to "why
  did the policy do that", which nothing answers cheaply.
- **Newly expensive.** The gains are bought with training on a distribution,
  and the reported failure mode is accuracy that holds on that distribution
  and drops on held-out ones. Worse for this subject specifically: a *learned*
  forgetting policy is a reward function with delete authority, which reopens
  by optimization the exact door the governance tier holds shut by design.

So the boundary is not that frozen readers are obsolete. It is that these
obligations are stated as design-time judgments because they assume somebody
can read and change them; where they move into weights, the obligations
survive and their **enforcement surface** moves — from prose and code review
to reward design, held-out evaluation, and an explicit ladder of baselines.

One of those obligations inverts on the way across, and it is the one this
subject ranks first. Provenance reads as a cost the learned architecture must
keep paying for auditability's sake. It is better understood as **the substrate
that architecture is missing.** A policy trained on whether the whole run
succeeded cannot attribute that outcome to any single entry; the credit signal
it needs is exactly the entry-to-use-to-outcome record this subject already
demands for audit, and one such system names per-entry credit assignment as its
open problem while storing entries that carry an id and nothing else. The
instrument is already specified here, in the usage feedback the recall path is
told to close: increment on the selected set, after packing, at the boundary
where material crosses into context. Written for value-model hygiene; it is the
same edge. A learned store that discards provenance has not shed overhead, it
has capped what it can learn.

**Two: the history outgrows its budget.** The whole pipeline is an answer to
material that will not fit and beliefs that must be correctable. Below that
point it is overhead, and the raw record in context is the incumbent it has to
beat rather than a strawman it may assume away — see
[baseline-ladder](./techniques/baseline-ladder.md), which exists to make that
comparison a stated result instead of an unexamined premise.

## Failure modes this standard exists to prevent

- **Confabulation with persistence** — beliefs stored without provenance,
  asserted with the confidence of memory.
- **The hoard** — capture without decay; recall precision falls monotonically
  with system age.
- **Amnesia by panic** — no principled forgetting, so pruning eventually
  happens as an unaudited purge that destroys provenance along with bulk.
- **The transcript-as-memory shortcut** — retrieval over raw logs, replaying
  stale phrasing as current truth.
- **Identity drift** — the agent's self-model mutating through the same
  ungated door as its weather observations.
- **The silent second writer** — some code path that inserts "memories"
  without passing the distillation judgment, producing beliefs of a
  different (and unmarked) grade.
- **The invisible gap** — a store that is inspected only through its own
  contents, so the subjects it holds nothing about are never noticed by
  anyone.
- **The self-poisoning summary** — a compaction or rollup pass that falls
  back to a mechanical stand-in when its judgment is unavailable, minting an
  item that supersedes several real ones and speaks for all of them.
- **The unfindable memory** — a record that survived every quality gate and is
  absent from the retrieval lane that was its only door, because the fan-out
  half-failed and nothing ever compares the stores.
- **The instrument on the drip** — a scheduled measurement running through the
  production read path, entrenching the very items it uses as ground truth, so
  the metric climbs while the store decays.

## The techniques

- [working-memory](./techniques/working-memory.md) — operative state inside a
  session: synthesized not accumulated, bounded, expiring, promoted
  explicitly or not at all.
- [episodic-capture](./techniques/episodic-capture.md) — what becomes a record:
  episode boundaries, distilled bodies with pointers to raw evidence,
  identity minted at creation.
- [consolidation](./techniques/consolidation.md) — the distillation pass:
  batched judgment, fact/procedure outputs, supersedence and contradiction,
  provenance rows, the one validation door.
- [decay-and-forgetting](./techniques/decay-and-forgetting.md) — importance
  scoring, demotion tiers, caps, and pruning that never silently loses
  provenance.
- [recall-injection](./techniques/recall-injection.md) — spending the scarcest
  budget: always-include vs relevance vs recency tiers, labeling recalled
  material as memory, distinguishing empty recall from failed recall.
- [memory-governance](./techniques/memory-governance.md) — write lanes by
  stakes, proposal-gated commits, human authority over identity, and the
  audit answer every belief owes.
- [memory-value-model](./techniques/memory-value-model.md) — the one score both
  recall and forgetting read: trust, per-kind half-lives, sub-linear usage,
  and why a threshold is only safe inside a conjunction.
- [rollup-compaction](./techniques/rollup-compaction.md) — collapsing families
  of redundant items into one superseding summary: the symmetric measure,
  the minimum family size, silence over invention, and the confidence
  ceiling.
- [procedure-promotion](./techniques/procedure-promotion.md) — the memory-to-
  capability boundary: promotion bar, demonstration versus observation, one
  door, versioning, retirement.
- [coverage-instrumentation](./techniques/coverage-instrumentation.md) — the
  absence-first instrument: the denominator is the tracked population, and
  honest zeros over flattering ones.
- [baseline-ladder](./techniques/baseline-ladder.md) — what the pipeline is
  measured against: no memory, the whole history in context, retrieval over
  the raw record, then the pipeline — with the consumer, the index and the
  write cost carried as the score's predicate.
- [lane-reconciliation](./techniques/lane-reconciliation.md) — whether the
  retrieval lanes still agree with the record: declared lane membership,
  absence versus pollution, and why an absence claim needs a complete scan.
- [probe-without-write-back](./techniques/probe-without-write-back.md) — the
  read path is not read-only, so a scheduled measurement through it entrenches
  its own fixtures: suppress the feedback write, per caller.
