---
layer: technique
type: technique
subject: game-economy-tuning
technique: feedback-loop-topology-and-polarity
status: forged
laws: [structural-proof-is-never-sufficient, unmeasured-is-not-a-pass]
shared_with: []
use_when: [an economy or match runs away from the leader or never resolves, deciding whether a system needs a balancing or a reinforcing mechanism, characterising the loops in a node map before tuning any of them]
---

# Feedback loops: enumerate, then sign, weigh and time them

The named concern: **the closed paths in an economy, and what each one does to the game
over time.** A node map says where resource can flow. A loop is a path that returns to
where it started, so that the amount flowing determines the amount that will flow next
time. Loops are the only structures in an economy that can amplify, and every runaway,
every stalemate and every match that was decided in its first minute is a loop with the
wrong sign, the wrong strength or the wrong delay.

Each loop carries three properties, and all three are needed before anything can be said
about it.

**Polarity.** A loop is *positive* — reinforcing — when a change propagates around it and
returns amplified in the same direction: more income buys more efficiency, which produces
more income. It is *negative* — balancing — when the change returns opposed: more wealth
raises prices, which reduces wealth. These are the only two signs, and a loop with an
unresolved sign is unresolved, not neutral.

**Strength**, stated as gain: the multiple by which one full traversal amplifies a
perturbation. A reinforcing loop with a gain of 1.02 and one with a gain of 1.6 are
different systems; the first is a texture, the second decides the game. Gain is a
number, and it carries its basis — measured over which traversal, at which progression
point, under which stance.

**Latency**, stated in the game's own steps: how long a change takes to come back around.
A balancing loop with a latency of one second is felt as the system fighting the player;
the same loop at a latency of one session is felt as fairness. Latency is what converts a
correct polarity into a hated mechanic, and it is the property teams argue about in
adjectives and never write down.

## The naive reading, and why it costs a season

**Positive does not mean good and negative does not mean bad.** The words are directions,
not values, and reading them as praise and blame produces two symmetrical disasters. A
team that hears "negative feedback" as a defect strips out its balancing loops and ships
a game where the first player to gain an advantage cannot be caught — every session is
decided early and played out long. A team that hears "positive feedback" as a defect
strips out its reinforcing loops and ships a game that never ends: nothing a player does
compounds, no advantage converts into victory, and matches run until someone gets bored.

Both loops are load-bearing and both must be deliberately authored. **A competitive
encounter needs at least one reinforcing loop so that it terminates, and at least one
balancing loop so that it stays worth playing until it does.** A progression economy
needs the same pair for a different reason: a reinforcing loop is what makes power feel
like it accumulates, and a balancing loop is what stops the accumulation from outrunning
the content. The design question is never whether to have them; it is which one, how
strong, and how fast.

The failure that is specific to an economy rather than a match is the *cross-currency*
reinforcing loop. Income buys equipment, equipment raises clear speed, clear speed raises
income. Every currency in that loop can pass its own balance band, because each band is
computed per currency over a fixed window and the loop's amplification lives between
them. This is the structure that no amount of per-currency tuning reaches, and the only
way to see it is to have enumerated the loop.

## Procedure

1. **Take the node map as given.** Loops are found on the node graph, so the functional
   naming pass comes first; a loop through an unclassified node is a loop you cannot
   sign.
2. **Enumerate the closed paths.** Walk from each pool along its outflows and follow
   where the resulting resource influences a rate, until a path returns to the pool it
   started from. Include the indirect ones — a path through the player's capability, not
   only through resource, is still a loop, and it is usually the strongest one.
3. **Sign each loop** by pushing a small increase around it once and reading whether it
   comes back larger or smaller in the same direction. Do this on the structure, not in
   your head; the sign of a loop with an odd number of inverting links is not obvious
   after the third link.
4. **Estimate gain and latency** for each loop, with provenance recorded the way any
   estimate is: measured, simulated, or guessed. **A loop whose gain and latency nobody
   has estimated reports as uncharacterised, never as weak and never as benign.** The
   loop that ate the last game was uncharacterised, not known-small.
5. **State each loop's intended job in one sentence** — what it is there to do to session
   length, to comeback probability, to the feeling of accumulation. A loop nobody can
   state a job for is either an accident or a design decision nobody has taken.
6. **Report the topology as a finding in its own right**: how many loops, their signs,
   the strongest reinforcing one and the fastest balancing one. That report is what makes
   the numeric work afterwards interpretable, and it is not itself a verdict on health —
   an enumerated, signed topology is a structural proof, and structural proof is never
   sufficient. What the loops actually do is settled by walking them.

## Reading the combinations

A strong reinforcing loop with short latency ends sessions fast and rewards the early
lead; it is what a design wants when matches must resolve, and what it must never have
alone. A strong reinforcing loop with long latency is the dangerous one: it is invisible
in a short playtest and dominant over a campaign, so it ships. A strong balancing loop
with short latency is felt as the game refusing the player's success, and it removes
agency however fair the arithmetic is. A strong balancing loop with long latency is the
usual right answer for keeping a long game alive, because the correction arrives after
the player has been allowed to enjoy the advantage.

Comeback probability is set almost entirely by the balancing loops, and leader runaway
almost entirely by the reinforcing ones — but session length is set by their *ratio*, and
that is why neither can be tuned alone. Adding a balancing loop to fix runaway lengthens
every session; the honest fix is usually to add the balancing loop and strengthen the
reinforcing one so the game still ends.

## Decision rules

- **When a game runs away from the leader, look for a missing balancing loop before
  lowering any reward.** Lowering rewards slows the runaway and slows everything else
  with it; the structure is still divergent and will be discovered again at the next
  content tier.
- **When a game never resolves, add or strengthen a reinforcing loop.** A stalemate is
  not a tuning problem; it is a topology with no amplifier in it.
- **When a balancing loop is resented, shorten nothing and lengthen its latency.**
  Players accept correction they do not feel arriving. A correction that lands inside the
  moment of success reads as the system cheating.
- **When a reinforcing loop's gain exceeds one and its latency is longer than the test
  session, treat it as a critical finding regardless of the current numbers.** That is
  the exact profile of the loop that passes every playtest and ruins the live game.
- **When two loops share a node, do not tune them independently.** A change to the shared
  node moves both, and an attribution of the result to either is fiction.
- **When a loop's polarity is disputed by two people who both know the system, walk it.**
  The dispute means the path has an inverting link somebody is counting differently, and
  that is decided by tracing, not by seniority.
- **When a loop is deliberately absent, record the absence with its reason.** A design
  that has decided against a comeback mechanic is different from a design that forgot
  one, and only the written record can tell them apart a year later.

## When not to use this

- **On an economy with no closed paths.** A strictly linear chain of sources, converters
  and drains has no loops to enumerate; the flow band and the curve shape tests own it
  completely, and hunting for loops produces a report about the hunt.
- **On a content dependency graph.** Quest prerequisites and unlock trees contain cycles
  that are authoring defects, not feedback loops; a cycle detector belongs there, and
  polarity means nothing.
- **As a substitute for walking the structure.** Enumeration and signing tell you which
  loops exist and which direction they push. Whether their combination converges,
  oscillates or diverges is behaviour, and behaviour is observed, not deduced from a
  list.
