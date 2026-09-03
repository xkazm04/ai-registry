---
layer: golden-path
type: golden-path
subject: branching-narrative-graph-validation
status: forged
use_when: [accepting an authored or generated branching conversation, a scene reads beautifully and softlocks in play, deciding whether a choice is a real choice, budgeting the text and localization surface of a dialogue tree, re-validating a graph after a revision]
techniques:
  - reachability-and-orphan-detection
  - state-variable-declaration-contract
  - dead-end-versus-authored-ending
  - false-choice-and-convergence-audit
  - node-text-budget-and-localization-surface
  - graph-revision-diffing
---

# Branching narrative graph validation

A branching conversation is two artifacts wearing one skin. One of them is writing —
voice, subtext, the line that lands. The other is a directed graph with guarded edges and
variables in its conditions, and a runtime has to walk it without falling off. The first
artifact gets reviewed constantly, by people who are good at reviewing it. The second gets
reviewed almost never, because every surface that displays a conversation — a node canvas,
a passage list, a script — is built for reading the writing.

This subject owns the second artifact: the proof that a graph is **playable**. Every node
reachable from a state a player can actually be in; every declared ending attainable; every
state variable written before it is read on every path that can reach the read; every
terminal either an authored ending or a defect; and every choice a choice in something more
than name. Prose quality is not in scope here, and it is not a substitute for any of it.

## The defects are topological, which is why the eye misses them

A reviewer reading a graph reads it as a story. They trace the paths they can hold in their
head, which are the paths the author intended, and each of those works — that is what
"intended" means. The defects live in the paths nobody traced: the third option on the
second beat, taken by a player who refused the earlier offer, arriving at a node whose
condition reads a flag that only the accepted branch sets.

Three properties make this class distinctively hard. It is **combinatorial** — a scene with
twenty binary decisions has a state space nobody will walk by hand, and defect density is
highest exactly where traffic is lowest. It is **silent at author time** — the graph loads,
the editor is happy, every node has valid content. And it is **catastrophic at play time**,
because the player-visible symptom of most of these defects is not a wrong line; it is a
conversation that will not advance, in a scene the player cannot leave.

Machine authorship raises the stakes rather than changing the shape. A capable language
model asked for a branching scene returns one that is well written, tonally consistent,
correctly formatted, and structurally broken in exactly these ways: two branches that read
completely differently and set identical state, a condition that reads a flag no reachable
predecessor sets, an ending named in the summary and wired to nothing. It produces these
because it is optimising the artifact a reader will judge, and every prose rubric in
existence scores that artifact highly. A generation line that gates narrative on writing
quality alone is not merely under-testing its graphs; it is selecting for graphs whose only
remaining defects are the ones its gate cannot see.

## The graph a runtime walks is not the graph an author drew

This is the load-bearing distinction, and nearly every naive validator fails by not holding
it.

The authored graph has nodes and edges. The runtime graph has **(node, state) pairs**: the
same node entered with the quest flag set and entered without it is two different runtime
situations, offering different options and going different places. An edge in the authored
graph is a *possible* transition; whether it exists at runtime depends on whether its guard
can be satisfied by any state that can reach its source.

Everything expensive about this subject follows from that gap. A node with three outgoing
edges is not a node with three exits — it is a node with between zero and three exits
depending on state, and the case that matters is zero. **A softlock is not a node with no
edges; it is a reachable (node, state) pair from which no guard evaluates true.** A
validator that only looks at the authored graph will report that graph as fully connected
and clean, and be wrong about the only question anyone asked it.

The honest response is not to enumerate the whole state space, which is exponential and
mostly uninteresting. It is to validate at two altitudes and to say which altitude a finding
came from. Structural findings — an orphan, an undeclared variable, an unwired ending — are
cheap, total, and run on every save. State findings — a guard no reachable state can
satisfy, an exit set that empties — cost a search, and are bounded by the variables the
graph declares rather than by everything the runtime could theoretically hold. This is the
local reading of
[structural proof is necessary and never sufficient](../../_laws.md#structural-proof-is-never-sufficient):
the structural pass is genuinely necessary, it is cheap enough to be continuous, and it
never entitles anyone to say the graph is playable.

## Reachability runs in two directions and teams only ever build one

Forward reachability — walk from the declared entry points, mark what you touch, report what
you did not — is the check everyone writes first, and it finds orphans: nodes stranded by a
rewrite, a re-parenting, a deleted edge.

Backward reachability is the one that gets skipped, and it answers the more important
question. From every terminal the author *declared* as an ending, walk the edges backwards.
An ending the backward walk cannot connect to an entry is an ending the game promises and
cannot deliver — the defect a player meets as an achievement they cannot earn, and a writer
meets as a scene that was cut without anyone deciding to cut it. Run in reverse over every
node, the same walk yields co-reachability: a node from which no ending is reachable leads
nowhere, and it is reachable, which is worse than an orphan, because players get there.
Forward-only validation reports it as fine. See
[reachability-and-orphan-detection](./techniques/reachability-and-orphan-detection.md).

## A variable is a contract, and the contract is graph-wide

The single most productive check in this subject is also the most boring: **no expression
may read a variable that some path reaching it does not write.** It is the narrative form of
definite assignment, and it fails where definite assignment always fails — not at the write
and not at the read, but at the join, where one predecessor sets the flag and another does
not and both arrive at the same condition.

Untyped state makes this unenforceable, so the declaration comes first: every variable named
once, with its type, its permitted range or value set, its initial value, and the nodes
allowed to write it. Three checks then fall out at no extra cost — a read with no reaching
write, a write outside the declared domain, and a name that appears exactly once in the
whole graph, which is almost always a misspelling of a name that appears forty times. The
last is the highest-yield check in the family and the one most teams discover by shipping.
Naming an owning writer for each variable is
[one authority per quantity](../../_laws.md#one-authority-per-quantity) applied to narrative
state, and it is what stops two scenes maintaining private, divergent notions of whether the
player was rude to the innkeeper. See
[state-variable-declaration-contract](./techniques/state-variable-declaration-contract.md).

## Every terminal is a claim, and most of them are unexamined

A node with no outgoing edge is a claim that the story ends there. The claim is occasionally
true. The naive validator either flags every terminal — producing a warning list as long as
the ending list, so the team turns it off — or flags none, which is worse.

The rule is a declaration, not a heuristic: **a terminal is legitimate only where the author
declared an ending, and every other terminal is a defect.** That converts an unanswerable
aesthetic question into a set difference a script computes in milliseconds, and it means an
accidental terminal can no longer be mistaken for a laconic one. Silence about a terminal
must never render as approval, which is
[unmeasured is not a pass](../../_laws.md#unmeasured-is-not-a-pass) at node scale. The harder
half is the *guarded* terminal, which has edges and still ends the game for a player in the
wrong state, and which only the state-level pass finds. See
[dead-end-versus-authored-ending](./techniques/dead-end-versus-authored-ending.md).

## A choice is what the successor states do, not what the options say

The most interesting failure in this subject is not a broken graph at all. It is a graph
that validates perfectly and offers a choice that is not one: two options, distinct and
well written, whose selection changes nothing about where the player goes, what they carry,
or what anyone later says about it.

Convergence is not the defect. Convergence is the craft — paths that diverge at a decision
and rejoin at a resolution are how a branching story stays affordable, and the technique is
old, deliberate and correct. What separates honest convergence from a false choice is
entirely the **state at the join**: an honest convergence rejoins with the world changed, so
the same downstream node plays differently; a false choice rejoins identical, and the branch
was decoration. So the audit is mechanical — compute, for each option, the set of state
writes it performs and the node it lands on, and flag options whose pair is identical. State
it as an acceptance criterion rather than a note, because a false choice is precisely the
artifact a craft rubric rewards:
[grade against what ships, not on a curve](../../_laws.md#grade-against-what-ships-not-on-a-curve)
means a competently written choice that does nothing is placeholder work, not a pass. The
adjacent cases the same pass catches are a choice presented with only one option enabled in
every reachable state, and an option whose guard no reachable state satisfies — a choice the
player is never actually offered. See
[false-choice-and-convergence-audit](./techniques/false-choice-and-convergence-audit.md).

## The text budget is a design input, not a cap discovered afterwards

A conversation graph is the only content class whose production cost multiplies by its own
topology. A node is a line; a line is a translation unit in every shipping language; and if
it is voiced it is a recording session, an asset, a lip-sync pass and a re-record when a
writer changes one word. Add a branch and the cost of the whole subtree duplicates.

Handing a generator a node count and no length budget therefore produces what an
over-generous allowance always produces — long nodes, spent to the limit, in the one place
where the limit multiplies. State the budget per node class as the intended size of the
line, and derive a branch's allowance from the scene's rather than repeating the scene's
allowance for each branch, which is
[a budget shapes the output, it does not only cap it](../../_laws.md#a-budget-shapes-the-output).
Then state the surface in a declared unit with its basis — characters, or words, per
language, with the branch multiplicity and the voiced fraction named — because a
"700-line" scene means four incompatible things depending on whether that counts nodes,
options, translation units or recorded assets. See
[node-text-budget-and-localization-surface](./techniques/node-text-budget-and-localization-surface.md).

## A graph is edited far more often than it is written

The first validation of a graph is the easy one. Every validation after it happens against a
graph that already carries verdicts, translations, recordings and possibly a save file
pointing into it, and the question is no longer "is this graph valid" but "what did this
edit invalidate".

That needs a diff which speaks the graph's own language. Node identity must be stable across
edits, so that a rename is a rename and not a delete plus an add, and a change must be
classified by what it costs downstream: a cosmetic edit invalidates one translation unit; a
topological edit invalidates every reachability, terminal and false-choice finding; a change
to the state contract invalidates all of it, including verdicts recorded against branches
that no longer exist. Reporting that as one undifferentiated "modified" is how a team
re-records a whole scene for a comma and ships a stale verdict on a rewired branch. See
[graph-revision-diffing](./techniques/graph-revision-diffing.md).

## Validate on save, not at milestone

A cadence rule, because the value of the whole instrument collapses without it. The
structural passes are graph walks over a few hundred nodes; they cost milliseconds, and
anything that cheap should run every time the artifact is written, with each finding
attached to the node that caused it rather than to a report nobody opens.

The reason is not tidiness. A structural defect found the second it is authored costs the
author a fix while the intent is still in their head. The same defect found at a milestone
costs an investigation, because by then it is one of two hundred and nobody remembers which
branch was supposed to set the flag. This is the economics that governs any wiring check,
and it is why validation belongs to authoring rather than to acceptance — the gate still
exists, and the gate should be catching residue.

The corollary is that a validator's own findings are subject to
[no gate self-certifies](../../_laws.md#no-gate-self-certifies). A generator that emits a
graph and declares it valid has produced a self-report; the validation that counts is a
separate reader of the stored artifact, and where a graph is generated and checked in one
pass, the check is an input to the verdict and never the verdict.

## What this cannot decide

- **Whether the writing is good.** Every check here passes on a graph of placeholder text.
- **Whether the choices are meaningful.** The audit proves a choice has consequence in
  state. It says nothing about whether the consequence matters to a player, whether they had
  enough information to choose, or whether the branch was worth what it cost.
- **Whether the pacing works.** A perfectly connected graph can be a flat one. Pacing is a
  neighbouring concern with its own instrument.
- **Whether an exhaustive walker's verdict is trustworthy.** Automated traversal over a
  state space reliably declares unwinnable what is merely long or resource-gated. A softlock
  report is a lead to reproduce, not a finding to ship, and it must carry the state under
  which the walker got stuck so that the claim stays falsifiable.
- **Anything about the running game.** A graph that validates in a tool has not been walked
  by the runtime that will walk it, and the two disagree exactly where a condition is
  evaluated by engine code rather than by the validator.

## Boundaries

**Against judgeable-spec-authoring.** That subject owns the authoring craft that carries a
document past a strict automated reviewer — closure of enumerations, register, recomputed
derivations, one field asking one question — and it applies to a narrative design document
exactly as to any other. This subject begins where the artifact stops being a document and
starts being a machine. The rule for picking: anything a careful reader could verify *by
reading* belongs to the neighbour, and anything that requires walking edges belongs here. A
grader that reads a graph as text will score its prose and its self-consistency
competently, and it still cannot tell you that the fourth ending is unreachable.

**Against wiring-contract-doctrine.** The neighbour owns the general declaration that a
produced artifact is granted, activated, depended upon and verified — the discipline that
stops a catalog filling with finished-looking, unreachable content of every class. A
conversation is one of those artifacts, and its wiring contract is the outward-facing one:
what triggers this conversation, which character carries it, what quest state it advances.
This subject owns the *inward* graph: reachability among the nodes of one conversation and
the state contract those nodes share. If the question is "can a player ever get to this
conversation", it is the neighbour's; if it is "once inside, can a player get to this node",
it is this one's. A conversation can be perfectly wired externally and softlocked
internally, which is why neither check substitutes for the other.

**Against content-drift-and-revision.** That subject owns what happens when a regenerating
line produces new content under a stable identity — bounded history, content fingerprints,
the dangerous quadrant where content moved and status did not, orphaned rows, leases over a
contended tool. All of it applies to graphs and none of it is restated here. What is
specific to a graph is that its diff is *topological*: the neighbour answers "did the
content change", and this subject answers "which of the graph's proven properties did that
change invalidate", which cannot be read off a fingerprint. Use the neighbour's machinery to
detect that a graph moved; use this one to decide what the movement cost.

**Against the generative-media territory.** Narrative craft as generative media — dramatic
structure, character voice, the shape of a scene, prompt composition for prose, grading a
written passage as a finished piece — belongs to the neighbouring media bundle and is not
duplicated here. The seam is the runtime. The moment a story acquires guarded edges, state
variables and endings a machine must be able to walk to, it stops being prose with structure
and becomes a graph with a correctness property, and correctness is what this subject
proves. A scene can be the neighbour's best work and this subject's worst artifact at the
same time. That combination is the normal case rather than an edge case, and the two
judgments must never be allowed to stand in for each other.
