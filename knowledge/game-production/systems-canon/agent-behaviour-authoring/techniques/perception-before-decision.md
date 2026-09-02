---
layer: technique
type: technique
subject: agent-behaviour-authoring
technique: perception-before-decision
status: forged
laws: [unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis]
use_when: [authoring what an agent is allowed to know, an agent reacts to something it could not have seen, an agent never reacts at all, search and loss-of-contact behaviour is being faked with scripting]
shared_with: []
---

# Perception before decision

The named concern: author the agent's knowledge model as a first-class artifact — senses with
stated ranges, latencies and confidences, writing facts that age and expire — and forbid the
decision layer from reading anything else. Perception is authored first because the decision
layer is a function of it, and a function authored against an unspecified domain is authored
against a guess.

Two properties fall out of doing this at all, and both are otherwise faked at ten times the
cost. **Believable mistakes**: an agent that acts on a stale last-known position will search
the wrong room, which is the behaviour a designer would otherwise script. **A fairness
surface**: every complaint that an agent cheated is a claim about its knowledge, and a model
that does not exist cannot be inspected, defended or tuned.

## The procedure

**Enumerate the senses.** For each, name the stimulus class it detects and write down its
parameters with units: a distance in metres, a cone in degrees, a latency in seconds, an
occlusion rule, and a detection condition against a stated reference target. A sight range
without a reference target size is not a number
([a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis));
a crouched, unlit target at thirty metres and a running, lit one at thirty metres are not the
same detection problem, and a single scalar range silently asserts they are.

**Decide the fact schema the senses write into.** A fact is not a boolean. At minimum it
carries what was perceived, where, when, and with what confidence. The timestamp is what makes
staleness expressible; the confidence is what makes partial detection expressible; and without
both, the model degrades to a set of flags and every interesting behaviour above it becomes
impossible.

**Give every fact a decay.** Detection raises confidence over an accumulation window rather
than instantly, and loss of stimulus lowers it over a decay window rather than instantly. Two
windows, two numbers, both in seconds, both per sense. This one pair is what produces the
entire vocabulary of *noticing*, *becoming sure*, *losing track* and *forgetting* — and a
model without it produces an agent that flips between omniscient and blind at a range
boundary, which players read as a bug even when they cannot name it.

**Add a reaction delay between the fact and the decision.** Perception latency and reaction
delay are different quantities: the first is how long the world takes to reach the knowledge
model, the second is how long the agent sits on new knowledge before acting on it. Both need
to exist, because collapsing them into one means the only way to make an agent slower to react
is to make it blinder, which changes what it can find as a side effect of changing how fast it
responds.

**Route every decision read through the model.** This is the enforcement step and the one that
decays first. A condition that queries the world directly compiles, works, and passes every
check, and it hands the agent knowledge the tuning surface does not contain. The rule is
mechanical and worth enforcing mechanically: the decision layer's only input is the knowledge
model plus the agent's own internal state.

## Three values, not two

The most consequential rule in the technique is about the absent case. For any fact an agent
might hold, there are three states and not two: *known true*, *known false*, and *unknown*.
Collapsing unknown into false is the standard shortcut and it is the standard defect
([unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass)).

The two states differ in what they license. An agent that knows the player is not in this room
may skip it. An agent that has never looked in this room must consider it — that is what
searching *is*. Collapse the two and the agent behaves as though it has already cleared
everywhere it has not been, and the resulting play is an enemy that walks confidently past the
place you are hiding.

The same distinction, applied to a stale fact, produces the whole of loss-of-contact
behaviour: a fact whose confidence has decayed below the acting threshold is not a fact that
became false, it is a fact that became unknown, and the correct response to unknown is to go
and look.

## Decision rules

- **When a behaviour needs a fact, check the sense set can produce it.** An intent conditioned
  on knowledge no sense writes is unreachable, and it will pass every structural check while
  never once firing. This is a static check over the spec and it is the highest-yield rubric
  criterion in the subject.
- **When an agent must react faster, lower the reaction delay, not the sense parameters.**
  Sense parameters govern what can be found; reaction delay governs how quickly it is used.
  Tuning the wrong one changes the agent's whole search competence to fix a responsiveness
  complaint.
- **When an agent seems to cheat, look for a direct world read before touching any number.**
  In practice the overwhelming majority of *it saw me through a wall* reports are not a range
  that is too generous; they are a decision that never consulted the model.
- **Attribute every fact to the sense that wrote it.** Without attribution, a knowledge state
  cannot be explained and the trace above it degrades to *the agent believed this*, which is
  unactionable. With attribution, *heard at eight metres, confidence 0.4, aged 2.1 seconds*
  is a finding.
- **State every sense parameter against its reference condition**, and refuse to render a
  detection range whose reference target is unstated. Two agents whose sight ranges are the
  same number against different reference targets are not comparable, and a roster review that
  compares them is comparing nothing.
- **Where a sense has not been authored for an agent class, render it as unspecified**, never
  as a default. An unspecified sense set silently inherits whatever the runtime does by
  default, which is the definition of a competence nobody chose.

## When not to use this

- **Ambient and non-adversarial agents.** A crowd character that reacts to nothing does not
  need a knowledge model, and giving it one costs runtime for no play. Say so explicitly in
  the class spec, so the absence is a decision rather than an omission.
- **Deliberately omniscient opposition.** Some designs want an agent that always knows — a
  pursuing presence, a director-level system that places pressure. That is legitimate, and
  the requirement is only that omniscience is declared in the spec as the agent's knowledge
  model rather than arrived at by an unrouted world read. Declared omniscience is tunable and
  reviewable; accidental omniscience is neither.
- **When perception cost dominates the frame and the behaviour does not need it.** Simulated
  senses are not free, and a hundred agents each running several sense queries per second is a
  real budget. Where the play does not depend on the agent's information being limited, a
  cheap scripted trigger is the honest choice — but it is a scripted trigger, and it must not
  be described in the spec as perception.
- **Not as a substitute for the model choice above it.** A rich knowledge model attached to an
  arbitration structure with three intents produces an agent that knows a great deal and can
  express almost none of it. Perception is authored first; it is not authored alone.
