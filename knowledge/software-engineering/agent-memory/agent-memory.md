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

## Provenance is the trust anchor

A consolidated belief is a derived value: derived from episodes, by a
distillation pass, at a point in time. Like every stored derivation, it must
name how it was produced — which episodes ground it, when it was distilled,
what confidence the distiller assigned, and what superseded or reinforced it
since. This is the [derivation-names-recomputation](../_laws.md#derivation-names-recomputation)
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
trust, per-kind age decay, and a sub-linear bonus for proven usefulness —
compose so that no single property can order the store alone, and its
consequences reach further than ranking. Because the decay term and the usage
term are in the same product, a modestly trusted, old item that is *still
being recalled* keeps its score above any retirement floor: **usage becomes a
veto on forgetting**, not by a special case, but by arithmetic.

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

## The techniques

- [working-memory](techniques/working-memory.md) — operative state inside a
  session: synthesized not accumulated, bounded, expiring, promoted
  explicitly or not at all.
- [episodic-capture](techniques/episodic-capture.md) — what becomes a record:
  episode boundaries, distilled bodies with pointers to raw evidence,
  identity minted at creation.
- [consolidation](techniques/consolidation.md) — the distillation pass:
  batched judgment, fact/procedure outputs, supersedence and contradiction,
  provenance rows, the one validation door.
- [decay-and-forgetting](techniques/decay-and-forgetting.md) — importance
  scoring, demotion tiers, caps, and pruning that never silently loses
  provenance.
- [recall-injection](techniques/recall-injection.md) — spending the scarcest
  budget: always-include vs relevance vs recency tiers, labeling recalled
  material as memory, distinguishing empty recall from failed recall.
- [memory-governance](techniques/memory-governance.md) — write lanes by
  stakes, proposal-gated commits, human authority over identity, and the
  audit answer every belief owes.
- [memory-value-model](techniques/memory-value-model.md) — the one score both
  recall and forgetting read: trust, per-kind half-lives, sub-linear usage,
  and why a threshold is only safe inside a conjunction.
- [rollup-compaction](techniques/rollup-compaction.md) — collapsing families
  of redundant items into one superseding summary: the symmetric measure,
  the minimum family size, silence over invention, and the confidence
  ceiling.
- [coverage-instrumentation](techniques/coverage-instrumentation.md) — the
  absence-first instrument: the denominator is the tracked population, and
  honest zeros over flattering ones.
