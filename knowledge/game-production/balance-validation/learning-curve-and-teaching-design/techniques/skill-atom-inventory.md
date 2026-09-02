---
layer: technique
type: technique
subject: learning-curve-and-teaching-design
technique: skill-atom-inventory
status: forged
laws: [unmeasured-is-not-a-pass, one-authority-per-quantity]
shared_with: []
use_when: [building the list of what a game teaches, a feature list is being used as a teaching plan, checking whether generated content assumes an untaught competence]
---

# Skill atom inventory

The named concern: produce and maintain the enumerated, prerequisite-linked list of every
distinct thing the player must learn, with each entry bound to the content where it is
introduced, practised and tested — so that "was this taught?" is a query rather than an
opinion.

## What an entry is

An atom is one loop: the player acts, the simulation responds, the response is fed back
legibly, and the player's model updates. Four parts, and an entry that cannot name all four
is not an atom yet — most often the missing part is the feedback, which is exactly the part
whose absence makes a mechanic unlearnable no matter how well it is introduced.

Each entry carries:

- **A player-side name.** *Knows the heavy attack can be cancelled during windup*, not
  *heavy attack cancel window*. The phrasing test is whether the sentence describes a state
  of the player. If it describes a state of the build, it is a feature, not an atom.
- **Prerequisites.** Other atoms that must be held before this one can be learned. These
  are edges, and they make the inventory a directed graph.
- **An introduction site**, one or more **practice sites**, and a **test site** — each
  naming a real piece of content.
- **A competence criterion**: the observable that says the atom is held.
- **A teaching rung**: how it is taught, from the escalation ladder.
- **A decay interval**: how long the atom survives without being demanded before it must be
  reintroduced.

## Procedure

1. **Enumerate from play, not from the build.** Walk the game as a novice would and write
   down every moment the player has to know something. Enumerating from a feature list
   produces one atom per mechanic, which is the characteristic under-count.
2. **Split until each entry is single.** If an entry can be half-learned — the player does
   the thing but for the wrong reason, or in the wrong situation — it is two atoms. The
   dodge that grants invulnerability and the dodge whose invulnerability is *spent* are
   different lessons and fail differently.
3. **Merge duplicates by lesson, not by mechanic.** Several mechanics teaching one thing are
   one atom with several sites. Counting them separately over-budgets teaching for that
   stretch and leaves a later stretch under-taught.
4. **Draw prerequisite edges, then attack them.** For every edge, ask what happens to a
   player who lacks the parent. If the answer is "they cope", the edge is decorative and
   should come out; if the answer is "they cannot even attempt it", the edge is real.
5. **Give the atom one identity token and derive every teaching artifact from it** — the
   state flag that records it was taught, the cue identifiers, the metric name, the text
   keys, the asset keys. One token means two atoms cannot collide in the namespace, a site
   can be traced back to its atom by name alone, and a machine authoring the teaching
   cannot accidentally write another atom's artifacts.
6. **Bind sites.** Each site names content that exists. An unbound entry is an intention,
   and it renders as untaught
   ([unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass)) rather than as
   satisfied-elsewhere.
7. **Elicit the missing atoms from someone who does not know the game.** This is the only
   step that recovers what expertise erased, and it cannot be skipped by thinking harder.
8. **Sweep both directions.** Atoms with no site, and content demanding something that is in
   no atom. Both are findings; the second is usually the larger pile.

## Decision rules

- **When an entry names a build object rather than a player state, rewrite it or delete
  it.** Build-side entries are the ones that never get sited, because there is nothing to
  site them against.
- **When a designer and a novice disagree about whether something needs teaching, the novice
  is right.** Expertise erases its own history: the person who executes a timing without
  thinking is the person least able to report that the timing was ever learned, and the
  error runs one way — the expert's chain is missing atoms, essentially never carrying spare
  ones.
- **When two lists of what the game teaches exist, delete one.** A design document and a
  content-side annotation will disagree within a milestone and the disagreement is silent.
  One list is authoritative and everything else reads from it
  ([one-authority-per-quantity](../../../_laws.md#one-authority-per-quantity)).
- **When an atom has no test site, treat it as not taught, regardless of how well it is
  introduced.** An atom never required is an atom the player was told about.
- **When the graph has a cycle, the atoms are wrong, not the ordering.** A cycle means two
  entries are describing the same lesson from different sides; merge them.
- **When a generated batch of content is authored against the inventory, hand the generator
  the taught set at that position and forbid demands outside it.** The inventory is an
  input to authoring, not only a checklist afterwards — a constraint applied at generation
  costs nothing and a violation found after generation costs a regeneration.
- **When an atom's prerequisites are unknown, record them as unknown.** An empty
  prerequisite list means *nothing is required*, which is a strong claim; absent it, the
  entry is under-specified and must say so.

## When not to use this

- **Games with a single atom.** Some games genuinely teach one thing and then vary it. An
  inventory of one entry is honest and takes an afternoon; a formal graph around it is
  ceremony.
- **A tuning pass on a game already shipped and understood.** If the population is known to
  be competent at every atom — a competitive title with a returning audience, a sequel to
  something the audience finished — the inventory is not where the next problem is. Build it
  when a new-player population exists or is wanted.
- **As a substitute for watching someone play.** The inventory's most valuable entries come
  from observing a novice fail at something nobody wrote down. A graph assembled entirely
  from design intent reproduces the design intent, including its blind spots, in a more
  authoritative-looking format.
- **As a content schedule.** It constrains order; it does not decide what content exists,
  how large a region is, or which fight goes where. Those decisions consume the inventory
  and are owned elsewhere.
