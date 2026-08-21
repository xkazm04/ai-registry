---
layer: technique
type: technique
subject: wiring-contract-doctrine
technique: no-gray-box-rule
status: forged
laws: [compiling-is-not-wiring, structural-proof-is-never-sufficient, no-gate-self-certifies]
shared_with: []
use_when: [defining what counts as done, a status board that is all green before anyone has played, review pressure to accept a compiling artifact]
---

# The no-gray-box rule

**Compiling is not config-complete.** An artifact that builds, loads and validates
is not thereby done, and "it builds" may never be written into any field that a
rollup reads as a pass.

The name comes from the canonical shape of the failure in a real-time 3D game
engine: a spawned entity that exists, has its class assigned, passes every
existence and compile check, and appears in the world as an untextured grey box —
or stands motionless where it should be animating, with its ability set empty and
its behaviour tree unassigned. Nothing structural was wrong. Everything structural
was checked. The rule is a stated refusal to let that state be called complete.

## Why a rule and not just a check

The other techniques in this doctrine are mechanisms. This one is a piece of
vocabulary, and it is here because mechanisms get argued away in review and
vocabulary does not.

Under schedule pressure, "it compiles" is the cheapest available claim of
progress. It is true, it is verifiable in seconds, and it is the claim that will
be made unless the language of completion structurally forbids it. So the refusal
has to be encoded in three places at once, or it will be encoded in none:

- **In the status vocabulary**, so that there is no value an author can select
  that means "compiles" and reads as done. If the enum offers only *unwired*,
  *declared*, *resolved*, *observed*, then "it compiles" has nowhere to go.
- **In the authoring instruction**, as an explicit line naming the failure — *do
  not stop at "it compiles"* — because the author is otherwise most likely to
  produce exactly that.
- **In review language**, as a named rule people can cite without re-arguing the
  principle each time. A rule with a name is a one-word veto; a rule without one
  is a discussion.

## The procedure

1. **Enumerate what "structurally valid" actually covers in your project** —
   parses, loads, required properties set, references typed correctly — and write
   it down as a single named rung. Everything on that list is one claim, not
   several, and it is a low one.
2. **Enumerate what it does not cover**, concretely and in the project's own
   terms: has a visual representation assigned, has a behaviour assigned, has an
   ability set populated, is granted by something, is triggered by something,
   appears when played. The value of this list is that it is specific; a generic
   "and also it should work" is not citable in a review.
3. **Bar the low rung from producing a completion status.** A structural pass is
   an *input* to a verdict, never the verdict. The producer's own report that its
   output is valid gets recorded and labelled as self-reported, and the authority
   is a separate observer reading real state.
4. **Make the gray-box case a standing test, not a memory.** The most valuable
   check in this family is trivially cheap and almost never written: for each
   spawnable entity, does it have a visual representation and a behaviour
   assigned? That single query catches the archetypal failure before anyone loads
   a level.
5. **When the rule blocks something, record what was missing**, so the list in
   step 2 grows from real incidents rather than from imagination.

## Decision rules

- **When a status board is entirely green and nobody has played the content, the
  board is measuring compilation.** Treat uniform green as a symptom, not an
  achievement. Real content at real scale has a distribution of states.
- **When a reviewer asks "is it done" and the answer starts with "it builds",
  the answer is no.** Name the rule and ask for the granting path.
- **When the low rung is genuinely all the evidence there is, say exactly that.**
  *Structurally valid, unobserved* is a true, useful, publishable state. The rule
  forbids laundering it into "complete"; it does not forbid reporting it.
- **When a deadline forces shipping structurally-valid-only content, ship it with
  the state visible.** A known unobserved artifact is survivable. An unobserved
  artifact counted as observed is what produces the milestone-day discovery.

## The failure the rule protects against

It is worth being precise about the asymmetry. Structural checks have excellent
precision and terrible recall for the question anyone actually cares about. They
almost never fail on a working artifact — so a failure is real information — and
they very often pass on a broken one. A metric with that shape is safe to use as a
*filter* and catastrophic to use as a *score*, because aggregating it produces a
number that rises smoothly toward one hundred percent while the underlying quantity
it appears to describe stays flat.

That is the whole mechanism of the six-month surprise: the dashboard was correct
about the thing it measured, and the thing it measured was not the thing anyone
read it as.

## When not to use it

- **Not as an argument against structural checks.** They are necessary, cheap, and
  the fastest feedback in the pipeline. The rule is about what may be *concluded*
  from them, not about whether to run them.
- **Not on throwaway prototypes.** Grey boxes are the correct output of a
  blockout, and a project deliberately in that phase should not be spending the
  ceremony. The rule applies from the point where content is being produced to
  ship, and stating that boundary explicitly is what keeps it credible when it
  does apply.
