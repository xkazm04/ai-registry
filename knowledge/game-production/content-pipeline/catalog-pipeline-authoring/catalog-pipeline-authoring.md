---
layer: golden-path
type: golden-path
subject: catalog-pipeline-authoring
status: forged
use_when: [adding a new class of game content to a production system, deciding whether a content class needs a bespoke tool, designing the step vocabulary a content line draws from, making an operator's free-text steer reproducible]
techniques:
  - step-archetype-taxonomy
  - view-produce-accept-triad
  - archetype-view-coherence-ratchet
  - direction-as-first-class-produce-input
  - seed-entities-and-walker-coverage
  - packaging-exempt-two-state-rule
---

# Catalog pipeline authoring

A game needs dozens of classes of content: items, enemies, abilities, surfaces,
effects, dialogue, quests, currencies, level props, cutscenes, tutorial beats. Each
one is genuinely different. An item is a bundle of numbers and affixes; a surface is
three texture maps over a shared shader; a dialogue tree is a graph; an effect is a
budget in milliseconds. The obvious response — and the one nearly every studio makes —
is to build each class the tool it deserves. Thirty content classes, thirty tools.

That decision is defensible on day one and indefensible by month six, and the reason
is not maintenance cost. It is that **nothing can be measured across bespoke tools.**
You cannot say what fraction of the catalog is finished, because "finished" means
something different in each tool. You cannot move an operator from one class to
another, because the skill does not transfer. You cannot run one automated pass over
everything, because there is no shared shape to walk. You cannot answer "which content
has never been checked at all" — the single question a producer most needs answered —
because each tool answers it in its own vocabulary, and thirty vocabularies compose
into none.

The alternative is to define a content class not as a tool but as a **production
line**: an ordered sequence of steps, where every step is drawn from one small closed
vocabulary of step kinds, and every step presents the same three faces. A new content
class is then a short declaration — this class runs these eight steps, in this order,
of these kinds — and it inherits the rendering, the authoring, the acceptance, the
coverage walk and the operator's muscle memory from everything already in the system.

## The trade, stated honestly

A closed vocabulary buys uniformity and pays for it in expressiveness. Some content
class will want a step that is not in the vocabulary, and it will be a real want, not
a lazy one. The trade is still worth making, for a reason worth stating precisely:
**the expressiveness you lose is per-class and local; the measurability you gain is
global and compounding.** A slightly awkward rendering for one class costs that class
a little. A cross-class coverage number costs nothing and answers a question no
bespoke tool ever answers.

Three rules keep the trade honest rather than dogmatic.

**When a class truly does not fit, do not force it into the vocabulary — keep it
outside the catalog and say so.** A class jammed into the wrong step kind is worse
than one honestly outside the system, because it pollutes every cross-class
measurement with a member that is silently mis-typed. An explicit exclusion, with a
reason, is a decision. A forced fit is a lie in the corpus.

**Extend the vocabulary only on evidence of three.** One class wanting a new step kind
is a class with an unusual need; three independent classes wanting the same one is a
missing member. Requiring three keeps the vocabulary small enough to hold in a head,
which is the whole property that makes it valuable.

**Keep a bespoke escape hatch, and narrow it to what it actually does.** A vocabulary
with no escape hatch gets one anyway, informally and undetectably. A declared hatch —
one kind meaning "this class renders its own surface" — is safe as long as it is
measured like every other member. A hatch used by five steps that all turned out to
be the same shape is not an escape hatch any more; it is an unnamed member, and it
should be constrained to that shape until something genuinely different arrives.

## The step is the unit, and it has three faces

The load-bearing distinction of this whole subject is that a step is not a screen and
not a function. It is **one artifact seen three ways**: the face the operator reads
and edits, the face that creates the content, and the face that decides whether it is
done. Every step declares all three, and they must name the same data.

The naive design gives a step a screen and a button and leaves "done" to a human's
eye. That system cannot be counted. The second-order mistake — the one that survives
review and fails in production — is to declare all three faces but let them drift onto
different fields: the surface charts one number, the acceptance grades another, and
the operator watches a bar that has nothing to do with the verdict. The rule that
kills this is short and mechanical: **the displayed data is the graded data.** Derive
the fields each face touches by running them, compare the sets, and fail the
declaration when they disagree. This is cheap because a step's authoring face is a
pure function of an entity, so it can be executed with a synthetic input and observed.

The step's kind is not a label on top of these three faces; it *is* the deliverable
contract. It decides what corrective language the system offers when the step is
failing, what domain context is injected when the step is authored, and whether an
automated author may attempt the step at all. That last one is the discipline most
often skipped: **only step kinds whose deliverable is text should be routed to a text
author.** A kind whose output is a generated image, a mesh, a package or a piece of
arithmetic is produced by a different engine, and letting a language model claim it
overclaims. Declare the eligible set explicitly rather than letting it be inferred.

## Deriving the invariants instead of designing them

Once a system has a few hundred steps, it contains invariants nobody declared. Some
are near-universal — true of 340 of 344 steps — and those are the valuable ones,
because a near-universal invariant is one you can declare *and enforce* at the cost of
four corrections rather than a migration.

The method generalises far past content pipelines and is the most transplantable idea
here: **measure the corpus for the rule that is already almost true, declare it, then
ratchet.** Its power comes from the direction of derivation. A rule designed in
advance is a guess about a corpus that does not exist yet, and it will be either so
loose it forbids nothing or so tight that adopting it means a migration nobody funds.
A rule *read off* the corpus is affordable by construction, and its exceptions are
enumerable — you have them in front of you, with names.

The ratchet is what makes the declaration durable: new violations are rejected;
existing ones are listed individually, counted, and the count may only fall. Widening
the rule stays possible, but only as a recorded decision with a written reason
attached to the specific widening — never as the quiet remedy for a step that fails.

## Direction is an input, not a text box

Machine-assisted authoring needs a place for the operator to say what they want: make
the enemy read as ambush-capable, keep the palette cold, this brief should emphasise
the economy hook. Almost every system provides that box, and almost every system
throws the contents away the moment the request dispatches.

Treat the operator's free-text steer as a **first-class production input**: passed to
the thing that authors the artifact, stamped onto the artifact that comes back,
persisted with it, shown verbatim, and reused when the step is regenerated. The
difference is not ergonomic, it is epistemic. Without the stamp, a produced artifact's
provenance stops at "somebody clicked the button", and nobody can tell a result that
followed a careful instruction from one that followed none. With it, every artifact
carries what drove it, a regeneration can honestly claim to be a retry of the same
request, and an empty steer is visibly empty rather than indistinguishable from a rich
one that was dropped in transit.

Stamp the steer on **every** artifact, including those from deterministic authors
that could not have read it — an empty recorded instruction is an honest fact about a
deterministic production, and a stamp with holes in it cannot be relied on by anything
downstream. The neighbouring concern of revision history, drift detection and binding
a verdict to the content it judged is a separate subject; the seam is that this side
owns *capturing what was asked for at authoring time*, and that side owns *what
happens to it when the content later changes*.

## Proving the line works at all

A declared pipeline is a claim. The claim is that an operator can open a representative
entity of this class and walk it front to back, seeing every step render, producing at
every step, and reaching a defensible verdict at every step. Nothing about the
declaration proves that, and a class that has never been walked is a class where the
first walk will find something.

So every content class ships at least one **seeded representative entity**, and an
automated walker drives the whole registered set through the real authoring surface
end to end. Coverage is measured over the pair (class, step) — not over classes, which
hides a broken step in an otherwise healthy line. Two disciplines make the walk mean
something. It must run against a throwaway store, because acceptance is a function of
persisted state and a walk over a long-lived one measures the machine rather than the
system. And each of the several truths a step exposes — what the surface shows, what
was persisted, what a separate judgment says — is checked against the rule that governs
*it*, never against the others, since those truths are different verdicts on purpose
and asserting their equality is unsatisfiable the moment one of them is allowed to
disagree.

## Absence must never read as exemption

The last piece is a small rule with a wide blast radius. Most content classes end on a
terminal step — the one that stages what actually ships. A few legitimately do not:
their outputs land by another route, or the class is a workflow recipe rather than a
shipping row.

If the convention is "a class should end this way", then a class that does not is
ambiguous between an intentional exemption and an authoring omission, and the system
reports both as silence. Encode it as **two states and no third**: either own the
terminal step, or declare, in a machine-readable field, why one would be meaningless
here. The reason is surfaced to the operator, so an exempt class reads as a decision.
This generalises to every convention that has legitimate exceptions: a rule whose
exceptions are not themselves declared is a rule that quietly stops being measured, and
the tiering of acceptance verdicts — where absence of measurement is its own status
rather than a pass — is the same instinct applied one layer down.
