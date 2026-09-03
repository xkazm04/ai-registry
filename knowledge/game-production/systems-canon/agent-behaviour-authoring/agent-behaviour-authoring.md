---
layer: golden-path
type: golden-path
subject: agent-behaviour-authoring
status: forged
use_when: [specifying what a non-player agent decides and on what information, choosing an arbitration model for an agent class, an agent looks correct in a screenshot but nothing proves it decided anything, generating agent behaviour from a spec rather than hand-crafting it]
techniques:
  - behaviour-model-selection
  - perception-before-decision
  - blackboard-as-declared-shared-state
  - commitment-and-recovery-windows
  - group-coordination-without-a-hive-mind
  - decision-trace-as-evidence
---

# Agent behaviour authoring

A behaviour looks, from outside, like one thing: the enemy circles, hesitates, then lunges.
That single visible act is the last link of a chain with four links, and the other three are
the ones that get authored badly. Before the lunge there was a decision. Before the decision
there was a body of knowledge the agent was allowed to decide on — most of which is not what
the world actually contained. And after the decision there is, or is not, a record that
anything decided at all. A production line that authors only the visible act ships agents
that are correct in every screenshot and unprovable in every build.

This subject is the craft of specifying the other three links so that a machine can do the
work: what an agent decides, on what information it is permitted to decide, what it owes the
decision once it has made it, and what evidence proves the decision happened rather than
being asserted. It is deliberately not a catalogue of arbitration structures. State machines,
behaviour trees, utility scoring and planners are four answers to one of the four links, and
a team that believes they are the subject will spend a year tuning the arbitration of an
agent that cannot see.

## The one distinction everything descends from

**An agent's competence is bounded by what it knows, not by how well it chooses.**

This is the sentence a principal practitioner keeps and a first implementation does not have.
The arbitration structure is the visible, tractable, satisfying part of the work — it draws as
a diagram, it reads as logic, and a generator can emit one from a paragraph of design intent.
The knowledge model is invisible, has no diagram, and is where every interesting behaviour and
every interesting bug actually lives. Two agents running identical arbitration produce
entirely different play if one of them sees through walls and the other does not. Every
experience a player would call *intelligent* — being flanked, being hunted, being lost track
of and then found again, being given a moment of grace because the thing looking for you
genuinely does not know where you are — is a property of the knowledge model rather than of
the structure on top of it, and every experience a player calls *cheating* is the same
property inverted: an agent that reacted to something it had no way to know.

The practical form of the rule, and the one an automated line must encode: **an agent decides
on its knowledge, never on the world.** The world is queried by senses, senses write facts
with a confidence and an age, and the arbitration layer reads only those facts. The moment a
decision node reaches past the knowledge model and asks the world a direct question, the
agent has acquired an omniscience nobody authored, nobody can tune, and nobody can grade.

## Four links, four different authoring problems

**Knowledge.** What can this agent sense, at what range, through what, with what delay, and
how long does a fact survive after the sense stops confirming it? These are numbers, they are
quoted in units, and a fact nobody has sensed is *unknown* — a distinct third value, never a
default of false. Authoring this well is what buys search behaviour, loss of contact, and
believable mistakes for free; authoring it badly is what forces a designer to fake all three
with scripting.

**Decision.** Given that knowledge, which intent wins? This is where the model families live,
and the choice among them is a real engineering decision with a stated cost on both sides:
what it costs to author, and what it costs to prove. A structure that arbitrates beautifully
and cannot answer *why did it pick that* is a structure the production line cannot grade.

**Commitment.** Having chosen, how long is the agent bound to the choice, and what does it
owe the player during that binding? An agent that re-decides every frame twitches; an agent
that never re-decides walks into walls. Between those, the binding window is also the
player's opportunity window — the interval in which the agent has spent its option and can be
punished for it — and that makes commitment a fairness quantity, not only a stability one.

**Evidence.** What can be read back afterwards that proves the agent perceived, chose and
acted, in that order? A behaviour that exists, loads, validates and is assigned to a running
character, and about which nothing else can be said, has passed only the structural rungs
([structural-proof-is-never-sufficient](../../_laws.md#structural-proof-is-never-sufficient)).
The canonical failure here is an agent whose whole decision apparatus is present and correct
and which stands motionless in the level — hard to find precisely because every check that ran
was a check on the first rung.

Read the six techniques as six obligations across those four links, not as six features.

## What a machine needs that a human author did not

The traditional craft was written for a person who would author one agent, watch it, and fix
it. An automated production line does not watch. Everything the human did with their eyes has
to become a budget, a rubric criterion, an acceptance rule or a generation constraint, and
naming which of those four each piece of craft becomes is most of the work of adapting it.

- **Budgets.** A decision cadence in real time, not in frames; a sense range in metres against
  a stated target size; a knowledge-decay half-life in seconds; a minimum and maximum dwell on
  a chosen intent; a cap on how many agents may hold an engagement claim at once. Each is an
  instruction about the intended size of the behaviour and not merely a ceiling: hand a
  generator an unbounded intent count and it produces an agent with nineteen intents of which
  four ever fire ([a-budget-shapes-the-output](../../_laws.md#a-budget-shapes-the-output)).
- **Rubric criteria.** *Is every intent reachable from some knowledge state the senses can
  actually produce?* *Does any decision read a fact the sense set cannot supply?* *Does the
  agent commit for at least the stated minimum before re-deciding?* All three are checkable
  against the spec without running anything, and they catch the largest class of
  generated-behaviour defects before a build.
- **Acceptance rules.** The rungs above structure: the agent perceived a stimulus it should
  have, did not perceive one it should not have, chose an intent, and the chosen intent
  produced the act. Each is a separate observation, and a claim of completion names its rung.
- **Generation constraints.** The declared vocabulary a generator may emit into — sense set,
  fact schema, intent set, model family. A generator handed free text invents a fact key per
  agent, and a roster of forty then shares nothing, compares with nothing, and is gradable
  only one agent at a time.

## Competence is a dial, and it is a mechanism dial

An agent that reacts within a frame, aims exactly, and never loses track of anything is not a
hard agent. It is a broken one, and the brokenness is not a difficulty setting. This subject
owns the *mechanisms* through which competence becomes numbers a human could plausibly match:
perception latency between a stimulus becoming available and the fact appearing in knowledge;
a reaction delay before the decision layer may act on a new fact; an aim or execution error
distribution; a knowledge decay that makes the agent forget; a cap on how many intents it may
consider per decision.

What those numbers *should be* — how hard this agent is meant to be, and whether the next tier
raises them or grants a new intent — is a difficulty decision, owned next door. What belongs
here is the insistence that the dial exists at all, that it is a named quantity per agent class
with a unit, and that leaving it undialled ships whatever competence the implementation
happened to be capable of, which is a number nobody chose.

## Coordination is a resource problem, not a command problem

Put four agents in a room with the same knowledge and the same arbitration and they will all
make the same decision at the same instant, because they are the same function over nearly
the same inputs. That is the hive-mind signature, and players read it instantly: four
attackers lunging in unison, four flankers taking the same flank.

The instinct is to add a commander that hands out orders. It works, and it costs more than it
looks: a second decision layer with its own knowledge model, its own failure modes and its own
proof burden; a defect in it disables every agent under it; and it produces exactly the
puppet-like coordination it was added to avoid, because the units stop deciding.

The construction that keeps local decision and still breaks the symmetry is to make
coordination a matter of **scarce claimable resources**. There are three engagement slots
around the player, not four; a flank position is claimed and the claim is visible; a
suppression role is a token that one agent holds. Every agent still decides entirely locally —
it simply decides against a world in which some options are already taken, and what emerges is
staggered attacks and a formation nobody authored.

The detail that decides whether this survives a real encounter is *where the claim table
lives*. The instinct is to hang it off the group, and that is wrong in a way that only shows
up later, because agents change groups, retarget, and contend across group boundaries.
**The registry belongs to the contested resource itself.** A ring of melee positions around a
defender is owned by the defender and sized to its silhouette, which makes it correct by
construction when two groups converge, when an attacker switches target, and when the defender
stops existing — at which point the whole claim set is cancelled at once and every dispossessed
holder falls back to a stated alternative rather than swinging at nothing.

## The failure modes of the naive reading

The naive reading is that a behaviour is the arbitration structure, and it produces five
recognizable pathologies.

**The omniscient agent.** A decision reads the world directly rather than the knowledge model,
so the agent responds to things it cannot see. It is rarely visible as a bug; it is visible as
play that feels unfair and cannot be argued with, and the usual first fix — reducing the
agent's damage — makes the game blander without touching the cause.

**The blind agent.** The mirror failure, and the more common one on a generated line. Senses
were never authored, so the knowledge model is empty, so every decision falls through to the
default branch and the agent idles. Everything validates. Nothing moves. This is the failure
that motivates the evidence link: the difference between an agent with no stimulus and an
agent with no wiring is invisible from outside and obvious in a trace.

**The twitching agent.** No commitment window, so the arbitration re-runs each tick and two
near-equal intents alternate. The visible symptom is an agent that stutters between two
animations; the actual defect is a missing dwell time and missing hysteresis, and adding
smoothing to the animation layer hides it without fixing the decision layer.

**The junk-drawer shared state.** One key per agent per author, untyped, undeclared, several
writers apiece. It works until two behaviours disagree about what a key means, and then the
disagreement is silent
([one-authority-per-quantity](../../_laws.md#one-authority-per-quantity)).

**The unprovable agent.** Everything exists, everything is assigned, nothing is observed. The
producer's own report that the behaviour ran is an input to a verdict and not the verdict
([no-gate-self-certifies](../../_laws.md#no-gate-self-certifies)), and an agent nobody has
observed deciding is *untraced*, which is a different value from *working*.

## Where this subject stops, and what stands next to it

**Against real-time combat semantics.** That subject owns what an attack *is* and how it
resolves: what an area effect owes a moving player before it may land, what a duration means
in wall-clock seconds, how an active defence is scored, how a sweeping volume keeps its
identity so a target is hit once, who owns a combatant's remaining health, and what death
means to a system that is still running. This subject owns none of that and consumes all of
it. The clean way to pick between them: if the question is *what happens when this lands*, it
is combat semantics; if the question is *why did this agent throw it, at whom, knowing what,
and what is it now bound to*, it is here. The two meet at exactly one seam and it is worth
naming precisely — combat semantics sets the wind-up and recovery bands an action must
occupy, and this subject's obligation is that the decision layer *honours* them: an agent may
not cancel out of the recovery its own action declared, may not re-target inside a
commitment, and may not begin a second decision while the first is still resolving. An agent
that ignores its own recovery window has not made a combat-semantics error; it has made a
commitment error about a combat-semantics number.

**Against difficulty design and adaptation.** That subject owns *how hard*, and owns the lever
question — whether a harder tier raises the opposition's numbers or improves how it is played,
and what human-plausible ceiling any behavioural lever must be capped at. It is explicit that
the fourth term, player skill, is estimated rather than set, and that every enemy-skill lever
needs a stated ceiling. This subject is where those ceilings are *implemented*: the ceiling is
a number, and perception latency, reaction delay, execution error and consideration count are
the quantities it is a ceiling on. So the boundary reads as a handoff. The neighbour decides
that this tier should be harder by behaviour rather than by coefficient, and decides what a
plausible human bound is; this subject supplies the named, unit-carrying dials that decision
turns, and refuses to ship an agent whose dials were never set. Neither subject may state the
other's half: a competence number with no design rationale is arbitrary, and a design
rationale with no dial to move is a wish.

**Against encounter balance simulation.** That subject owns running the fight many times and
reporting whether it is fair — seeded and reproducible, one shared resolution kernel, outcome
with its spread, attribution of who caused the result, and compliance with floors it does not
itself define. It consumes agents; it does not author them. The seam is the direction of the
claim. Simulation tells you that this agent wins seven fights in ten and holds a third of the
kills; it cannot tell you whether it did so because it flanked or because it walked in a
straight line and out-damaged everyone, and it will report an identical win rate for an agent
whose senses are switched off if the resulting behaviour happens to be effective. That
question — *what did it actually decide, and on what* — is answered from the trace, which is
this subject's output and the simulation's input. Stated as a rule: a simulation verdict is
about outcomes and a trace is about decisions, and a roster tuned only on outcomes converges
on agents that are statistically fine and behaviourally empty.

## The path, in order

1. **Write the agent's knowledge model before its decision model.** Name every sense, its
   range and its unit, its latency, and the half-life of what it writes. If this step is
   hard, the difficulty is the finding: an agent whose information sources cannot be
   enumerated cannot be authored, only tuned.
2. **Declare the shared state as a schema** — key, type, unit, scope, owner, lifetime — before
   any behaviour writes to it.
3. **Choose the arbitration model per agent class from a declared menu**, against the intent
   count and the reactivity the class needs, and record the choice with its reason.
4. **State the commitment windows** in seconds: minimum dwell per intent, re-evaluation
   points, hysteresis margin on target switching, and the recovery the decision layer must
   honour.
5. **Make coordination a claim on a scarce resource**, with the registry owned by the
   contested resource, one holder per claim, and a lease that expires — rather than a
   commander that issues orders.
6. **Emit a decision trace and grade the agent on it**, naming the rung each claim was proven
   at — perceived, decided, acted — and rendering an agent nobody observed as untraced rather
   than as passing.
