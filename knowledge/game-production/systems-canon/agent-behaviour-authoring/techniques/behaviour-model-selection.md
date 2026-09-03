---
layer: technique
type: technique
subject: agent-behaviour-authoring
technique: behaviour-model-selection
status: forged
laws: [a-budget-shapes-the-output]
use_when: [starting a new agent class and reaching for the structure the last one used, an agent's decision logic has outgrown its structure, deciding what an automated line is allowed to emit]
shared_with: []
---

# Behaviour model selection

The named concern: choose the arbitration structure for an agent class deliberately, from a
declared menu, against stated criteria — and record the choice with its reason, so that the
next author and the next generator inherit a decision rather than a habit.

The failure this prevents is not picking the wrong model. It is picking no model: adopting
whatever the previous agent used, then bending every subsequent agent into it. A roster in
which a two-intent ambient character and a twelve-intent boss run the same structure has one
of them paying for machinery it does not need and the other fighting machinery that cannot
express what it needs, and both defects present as "the AI is hard to work on".

## The menu, and what each entry actually buys

**A finite state machine.** States with explicit transitions. Buys: total legibility — the
whole behaviour is readable as a diagram, every transition is a named condition, and a
decision is explicable by pointing at an edge. Costs: transition count grows as roughly the
square of the state count, so the structure collapses into unreadability somewhere between
six and ten states. Correct for agents whose life is a small number of clearly separated
modes.

**A hierarchical structure with fallback ordering** — the family a behaviour-tree runtime
implements. Buys: composition and reuse. Subtrees are authored once and shared, priority is
expressed as ordering, and the whole thing is inspectable as a tree at runtime. This is the
default for a reason: it is the only family in the menu where an ordinary designer can read
an agent's intent order off the structure without simulating it. Costs: priority is
positional, so expressing "usually flee, but not while the ally I am covering is alive"
requires either a condition in the wrong place or a duplicated subtree; and long trees make
reactivity expensive, because reacting to something means aborting work already in progress.

**Utility scoring.** Every candidate action scores itself against the current knowledge, and
the highest score wins. Buys: continuous reprioritization and graceful behaviour under many
simultaneously-relevant options — the family that produces agents which seem to weigh things.
It is also the only family that scales to many candidate *targets* without a combinatorial
structure, because scoring a hundred targets is a hundred evaluations of one function. Costs:
the ordering is emergent, which means nobody can read the intent priority off the authored
artifact, and a designer's question — why did it pick that — is answerable only by dumping
every score. Tuning is by curve shape rather than by structure, which some designers find
liberating and others find unfalsifiable.

**A planner over goals and preconditions.** Actions declare what they require and what they
achieve; a search finds a chain that reaches a goal. Buys: genuine novelty — the agent
composes an action sequence nobody authored, and the behaviour surprises its own author.
Costs: the highest of all four, in every direction. Search cost is real per agent per replan;
authoring cost moves from writing behaviour to writing a world-state representation, which is
harder and less forgiving; and explicability collapses, because the answer to why did it do
that is a plan and the answer to why that plan is a search trace.

## The criteria, in the order they decide

1. **Distinct intent count.** Under about four intents, a state machine is not a compromise —
   it is the correct structure, and anything richer is machinery with no work to do. Above
   roughly ten, a flat structure of any family is unmaintainable and the answer is hierarchy.
2. **Reactivity pressure.** How often must the agent abandon what it is doing because the
   world changed? Low reactivity favours structure that runs to completion; high reactivity
   favours continuous scoring, because in a hierarchical structure high reactivity is
   implemented as aborts, and aborts are the least legible part of that family.
3. **Target multiplicity.** One obvious target favours structure; scoring many comparable
   targets favours utility, because in a hierarchical structure target selection becomes a
   node that hides the whole interesting decision inside itself.
4. **Explicability requirement.** If the production line must answer *why this intent* from an
   artifact rather than from a runtime dump, structure beats scoring. This criterion is
   usually decided by who reviews the agent, and it is the one teams forget to ask.
5. **Proof cost.** What does it take to demonstrate that each intent is reachable? In a
   structure, reachability is a static property of the graph. In a scoring system it is a
   claim about a function over an unbounded input space, and the honest answer is a coverage
   measurement over observed decisions rather than a proof.
6. **Emittability.** Can the production line actually author this family's artifact? This
   criterion does not appear in the traditional literature at all, because a human with an
   editor can author anything the editor supports. A generation pipeline cannot: an
   arbitration graph stored as an opaque binary artifact is unwritable by a text-emitting
   generator, so on such a line the hierarchical family is available only as hand-authored
   content with generated leaf nodes, and a purely generated agent must use a family whose
   whole definition is text. This turns model selection into a *joint* decision between the
   agent's needs and the pipeline's reach, and it is the criterion that most often decides.

## Decision rules

- **When the agent has four or fewer clearly separated modes, use a state machine**, because
  every richer family costs authoring and proof effort that the agent has no work for.
- **When intents compose and reuse across a roster, use a hierarchical structure**, because
  sharing a subtree across twelve agents is the single largest authoring saving available on
  a production line.
- **When the agent must continuously reprioritize among many comparable options, use utility
  scoring** — but write the score as a small table of named, weighted considerations rather
  than one expression, because the review question is *which consideration dominated*, and a
  fitted expression cannot answer it.
- **When the interesting behaviour is a sequence nobody wants to author, use a planner** —
  and only then, because a planner adopted for a fixed sequence is a search that always
  returns the same plan.
- **Hybridize along the hierarchy, never inside one node.** The construction that holds in
  practice is a scoring layer choosing the intent and a structural layer executing it: the
  score answers *what*, the structure answers *how*, and each remains separately reviewable.
  Two families interleaved at the same level produce an artifact where neither family's
  reasoning tools apply.
- **State the decision budget per agent class before choosing**, in real time per decision and
  in intents per agent, and treat it as the intended size rather than a ceiling
  ([a-budget-shapes-the-output](../../../_laws.md#a-budget-shapes-the-output)). A generator
  handed no intent budget produces an agent with nineteen intents of which four ever fire,
  and every one of the fifteen must still be reviewed, graded and maintained.
- **Record the chosen model and the criterion that chose it in the agent's spec**, because the
  next revision will be made by someone who was not in the conversation, and an unrecorded
  choice is re-litigated as a preference.

## When not to use this

- **Not per agent instance.** Model selection is a decision per agent *class*. A roster where
  each of forty agents chose its own family has forty debugging surfaces and no shared
  tooling, and the review cost swamps whatever the per-agent fit bought.
- **Not as a migration trigger.** An agent whose structure has grown awkward is usually a
  scoping problem, not a family problem; splitting one twelve-intent agent into two
  six-intent classes is cheaper and safer than porting it to a planner, and it is the move
  that is skipped.
- **Not for a scripted set piece.** A one-off sequence that must happen the same way every
  time is authored as a sequence. Expressing it as an agent decision buys nothing and adds a
  decision layer that can, on some future build, decide otherwise.
- **Not on a line that can only emit one family.** If the generation pipeline has exactly one
  template, selection is theatre. The honest output is to say so and to record the resulting
  mismatch per agent class as a known deviation, rather than to publish a choice nobody could
  have made differently.
