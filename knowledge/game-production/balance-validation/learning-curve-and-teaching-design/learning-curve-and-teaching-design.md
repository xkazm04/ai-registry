---
layer: golden-path
type: golden-path
subject: learning-curve-and-teaching-design
status: forged
use_when: [a generated batch of content assumes competence nobody granted, deciding where a mechanic is introduced practised and tested, a mechanic ships and nobody uses it, players quit early without complaining, setting a bar for what onboarding must prove]
techniques:
  - skill-atom-inventory
  - introduce-practise-test-spacing
  - flow-corridor-as-two-sided-envelope
  - teaching-escalation-ladder
  - time-to-competence-measurement
  - unused-mechanic-detection
---

# Learning curve and teaching design

Ask a production line for twenty encounters and you get twenty encounters. Each is
internally coherent, each passes its fairness simulation, and each assumes a player who
already knows to interrupt the long cast, cancel out of the recovery, read the telegraph
and stand where the ground effect is not. Nobody granted that competence. Nothing in the
pipeline noticed, because the simulated player was born knowing everything and the rubric
asked whether the fight was fair rather than whether it was learnable. The content is fine.
The game is unplayable for the only population that has never played it.

This subject treats **what the player must learn** as a production artifact in its own
right: inventoried, sequenced, budgeted, sited in specific content, and acceptance-tested
like a damage table or a polygon budget. It is not "the tutorial". A tutorial is a
location; teaching is a schedule that runs the length of the game, and most of it happens
in content nobody labelled as teaching. The question this subject answers, for any demand
a game makes of a player, is: **where was that taught, how, and did it take?**

## The unit is a skill atom, not a mechanic

A mechanic is something the game *has*. A skill atom is a change in the player's *model*
of the game — a loop in which the player acts, the simulation responds, the response is
fed back legibly, and the player's understanding updates as a result. The atom is named
from the player's side, which is why an inventory of atoms never matches a feature list.

One mechanic routinely carries several atoms. A dodge is at least four: the input exists;
it grants a window of invulnerability; the window is spent rather than free; and some attacks
cannot be dodged at all, only interrupted. A player holding three of those four is not
seventy-five percent competent — they are confidently wrong, which is a worse state than
ignorance because it takes longer to leave. Conversely, several mechanics may carry one atom:
three consumables that all teach *check the pack before you engage* are one lesson taught
three times, and counting them as three over-budgets teaching for that stretch.

The reason the unit matters more than it looks: the account of fun that has held up best
holds that fun *is* the act of learning a pattern, and boredom is that pattern exhausted.
Under it the atom inventory is not bookkeeping but the ordered list of the game's actual
entertainment events, and a stretch containing no atom contains nothing to enjoy, however
handsome it is.

## The inventory is a graph with sites, or it is an aspiration

Each atom carries prerequisites, an introduction site, one or more practice sites, a test
site, and — for a combination — the atoms it combines. Prerequisites make the inventory a
directed graph, and it is a graph precisely so the ordering violation is checkable: an atom
demanded before its prerequisite was taught is a finding a machine produces without anyone
playing anything.

The word doing the work is **site**. An atom whose introduction names a real piece of
content is scheduled; an atom that names no site is an intention, and it must render as
*untaught*, never as taught-by-default
([unmeasured-is-not-a-pass](../../_laws.md#unmeasured-is-not-a-pass)). Most inventories die
here: written as a design document, never bound to content, and within one milestone the
levels and the list disagree with nobody able to say which is right. The list that authoring
reads and the list the checker reads are the same list
([one-authority-per-quantity](../../_laws.md#one-authority-per-quantity)), or the drift is
guaranteed and invisible.

Two properties make the binding hold up under machine authoring. Every artifact that
teaches an atom — the flag recording that it was taught, the cue identifiers, the metric
name, the text keys — derives from **one identity token**, so two atoms cannot overwrite
each other's teaching and a site traces back to its atom by name alone. And the taught set
is **durable, queryable state on the player**, granted the first time the atom is
demonstrated, so one query answers whether to teach, whether to skip, and whether a demand
is permitted — at authoring time and at runtime alike.

Prerequisite edges are the expensive part, and they are the part that gets guessed. A
designer's hypothesised chain and the chain players actually climb diverge, and the
divergence runs almost entirely in one direction: the hypothesis is **missing atoms**, and
very rarely carries extra ones. The mechanism is worth naming because it recurs everywhere
in this subject — expertise erases its own history. Someone who has executed a timing for
six months cannot recall that it had to be learned, cannot articulate it when asked, and
will not write it down. Every atom missing from an inventory is missing for that reason, and
the more experienced the author, the more of them are missing.

## Introduce, practise, test — and the spacing is the design

The durable teaching pattern has four beats, and generations of level designers converged
on it independently because it is what works.

**Introduce** the atom in isolation, under conditions where failing costs nothing and the
correct action is nearly the only one available. **Practise** it under repetition where
failure is still cheap, enough times that the execution stops being deliberate. **Test**
it where it is load-bearing and failure costs something real. **Combine** it with an atom
already learned — and that combination is a *new atom*, with its own three beats, not a
harder repetition of either parent.

Two rules govern the beats. Introduce one atom at a time, because an atom introduced
alongside another is two experiments in one trial and neither result can be read — not by
the player and not by the telemetry. And space them: an introduction and a test with nothing
between is a demonstration followed by an exam, which teaches recognition and not execution.

Both omissions have signatures. **Introduce and never test** is the more common and far the
more expensive — the atom is shown, is never afterwards required, and the player correctly
infers it is optional, which is the single largest producer of mechanics nobody uses and a
teaching defect wearing a balance costume. **Test with no practice** produces the difficulty
complaint no difficulty lever fixes: the player is not under-powered, they are
under-rehearsed.

Spacing also decays. An atom introduced and not required again inside a stated interval is
cold; reintroducing it costs close to what the first introduction cost, and content
authored after a long gap should assume nothing. A schedule that never revisits is not a
schedule, it is a sequence.

## The corridor has two walls, and the naive reading builds only one

The channel between anxiety and boredom is the oldest frame in this subject and the most
often half-applied: demand more than the player can do and they are anxious, demand less for
long enough and they are bored, and the designed experience lives in the corridor between.

The reframing that makes it usable in production is that **the corridor is drawn against the
taught set, not against the population's ability**. A demand above what the game has taught
is not a hard fight but an unfair one, and no difficulty setting converts it, because every
setting on the dial asks for a skill the game never handed over. A demand comfortably below
the taught set, sustained, is not a kindness but the pattern exhausted, and it produces the
failure that generates no complaints at all.

That asymmetry is why almost every production line encodes the ceiling and omits the floor.
The ceiling generates loud, well-attributed feedback; the floor generates silent departure,
and silence read as a pass is the exact collapse
[unmeasured-is-not-a-pass](../../_laws.md#unmeasured-is-not-a-pass) forbids, applied to a
population rather than a metric. An envelope with one wall is not an envelope.

Both walls move, because the taught set grows: a stretch correctly pitched at hour one is
under-demanding at hour ten with every one of its numbers untouched. Content ageing is the
floor moving, not a content defect, and it is why a learning-curve check is evaluated at the
position in the schedule where the content sits rather than in isolation.

## How a thing is taught is a ladder, and the rungs are not equivalent

There is a preference order over teaching methods, cheapest and most durable first: an
affordance built into the object so its use is self-evident; a situation constructed so the
correct action is the only one available while the stakes are nil; a consequence the player
suffers and survives; a demonstration performed by something in the world; a contextual
prompt on screen; plain instructional text; and, at the top, a modal interruption that takes
control until the player complies.

The rule that makes this a ladder rather than a menu: **climb only when the rung below has
been measured to fail.** Each rung upward buys reliability and pays in attention, immersion
and pace, and the payments compound — a game that has climbed to the top rung for every
atom has taught the player that the world will stop and tell them what to do, which is
itself a lesson, and it is the one that makes the rest of the teaching inert.

A mechanic taught only at the top of the ladder was **announced**, not taught, and the
distinction is not stylistic: a system reporting that a prompt was displayed is reporting its
own output, which is an input to a verdict about learning and never the verdict
([no-gate-self-certifies](../../_laws.md#no-gate-self-certifies)).

## Competence is a measured observable, not a completed step

Every atom carries a stated competence criterion: an observable performance, under stated
conditions, at a stated rate, without prompting. *Interrupts the long cast in three of four
opportunities, unprompted, in live combat* is a criterion; *completed the interrupt tutorial*
is not, and the difference decides whether any of the measurement is worth collecting.

Tutorial completion is the wrong metric for a structural reason: a modal step's completion
event is guaranteed by construction, so it measures the tutorial's ability to detain the
player. Reaching the criterion where nobody is detained is the observation that carries
information, a rung higher precisely because nothing below it implies it
([structural-proof-is-never-sufficient](../../_laws.md#structural-proof-is-never-sufficient)).

The headline quantity is **time to competence** per atom: play time, attempts or
opportunities until a stated fraction of the population meets the criterion. It carries its
basis or it is not information — which population, which percentile, which build
([a-number-carries-its-unit-and-basis](../../_laws.md#a-number-carries-its-unit-and-basis))
— and it belongs to the teaching that produced it, so a change to the introduction site
turns it into a statement about the past.

## Detecting, by machine, that a mechanic was never taught

Two families of signal, and the cheap one needs no players: an atom with no introduction
site, an atom demanded before its prerequisite is introduced, a mechanic in the content that
appears in no atom — each a graph query that fires before anyone plays. The other family
comes from play, and its readings are usage at the floor, first use far downstream of the
introduction site, and competence never reached.

The inversion that saves the most wasted work: **an unused mechanic is a teaching defect
until proven a balance defect.** The reflex is to buff it, which makes the few who already
know it stronger, changes nothing for everyone else, and manufactures a balance problem on
top of the teaching one. Telemetry names the symptom and cannot name the cause; the inventory
can, because it knows whether the atom ever had a test site. And a mechanic that is granted,
registered, reachable and never taught is, in the only sense that matters, not wired
([compiling-is-not-wiring](../../_laws.md#compiling-is-not-wiring)) — the player is the last
hop, and a pipeline that stops at reachability stops one hop short.

## Failure modes of the naive reading

- **"We have a tutorial, therefore we teach."** A tutorial is a location and teaching is a
  schedule. The atoms taught in the first ten minutes are the easy ones; the atoms that
  decide whether the player stays are taught, or not taught, in hour three.
- **Expert amnesia, in three flavours.** The design team, the test team and the headless
  harness all know everything, and they agree with each other, which is what makes the error
  durable. The harness is the most dangerous because its agreement looks like evidence: a
  simulated player is competent at every atom by construction, so a fairness pass is silent
  about learnability by design rather than by oversight.
- **Counting mechanics instead of atoms.** A feature list re-labelled as a teaching plan
  under-counts by a large factor, always in the direction of optimism.
- **"Players will figure it out."** Discovery is legitimate and often superior, but a
  *designed* discovery states its guarantee that the discovery happens and its fallback when
  it does not. Hoping is not designing, and a game whose atoms are all discovered by hope has
  a learnability that varies by more than any number in it.
- **Treating the learning curve as one line.** It is many curves, one per atom, staggered and
  overlapping; the aggregate is a mean over the batch and hides both walls, for the same
  reason an averaged tension curve is smooth.
- **Teaching everything.** An over-generous teaching budget is not safety: a process spends
  what it is given, and a line told to explain every atom narrates itself continuously and
  trusts the player with nothing
  ([a-budget-shapes-the-output](../../_laws.md#a-budget-shapes-the-output)).

## The path, in order

1. **Inventory the atoms**, from the player's side, and connect their prerequisites.
2. **Site every atom** — introduction, practice, test — in real content, and render an atom
   with no site as untaught.
3. **Check the ordering**: nothing is demanded before its prerequisite is introduced, and no
   combination is demanded before both parents were tested.
4. **Assign each atom a rung** on the teaching ladder, starting at the bottom, and record
   what failed before any atom is moved up.
5. **State a competence criterion per atom** and measure time to competence against it,
   with its basis.
6. **Run the two-sided corridor check** at the atom's position in the schedule, treating a
   floor breach as seriously as a ceiling breach.
7. **Sweep for atoms with no test site and mechanics in no atom** before reaching for a
   balance lever.

## Where this subject stops

The neighbour that shares the most ground is difficulty design, and the line is worth
drawing precisely, because a reader holding a complaint has to pick one of us in a sentence.
That subject owns *how hard the game is* — what difficulty is made of, which of its terms
an author can set, whether a tier raises numbers or behaviour, who chooses the setting, and
what a system may adjust while the player is watching. This subject owns *whether the player
was ever taught the thing being made harder*. The picker: if the question is "should this be
harder or easier, and who decides", it is difficulty; if the question is "does the player
know how to do the thing we are making harder", it is here. There is one genuine
disagreement at the seam, and it is productive rather than duplicative. The difficulty model
treats player skill as the one term that arrives with the player and cannot be authored —
correct about the *population's* skill, and incomplete about the game's contribution to it,
because the taught floor beneath that term is authored, is this subject's whole object, and
is the only lever that moves the term difficulty must otherwise leave alone. Both systems may
exist in one game and must not be one component: lowering enemy health when the player
struggles is difficulty, detecting an atom nobody learned and reteaching it is teaching, and
merging them produces a live value nobody authored.

Encounter pacing is the second neighbour, and the seam is scale together with subject
matter. That craft owns the shape of a *single* engagement over time — the tension curve,
its beats, its breathers and dead zones, its duration envelope, and the report that makes the
shape actionable — describing what a fight does to a player already able to fight. This
subject owns the axis running across many encounters, on which each fight is one site in a
schedule. The two touch at one point: a fight can be flat because it demands nothing new,
which pacing detects as absent variance and this subject explains as a pattern exhausted. When
a curve comes back flat, ask pacing what shape it has and ask here whether there was anything
left to learn.

Level planning is the third, and the seam is the artifact. That craft owns turning a world
description into a generated placement plan — the room graph, its parameters, its seed
contract, and the linting of that graph before anything is built, pacing and landmark rules
included. It owns *where things go*. This subject supplies one of the constraints planning
consumes: the schedule says which competences a region may assume, so a plan placing the test
for an atom introduced two zones later is a violation the planner can catch without knowing
anything about learning. The plan is the consumer and the schedule is the input. A room graph
is not where you store what the game teaches, and a teaching inventory is not where you
decide which room is largest.
