---
layer: golden-path
type: golden-path
subject: model-composed-workspace
status: forged
use_when: [letting a model open, arrange or filter views across a product's modules, deciding whether an answer is prose, a card, a pane or a composed workspace, a model-arranged screen that users stop trusting over a session, measuring whether the model chose the right view]
techniques:
  - answer-form-routing
  - composition-region
  - arrangement-memory
  - reversible-screen-ops
  - conductor-turn-flow
  - composition-motion
  - view-choice-evaluation
---

# The model-composed workspace

A product with several feature modules eventually wants its assistant to do more
than talk. The user asks "what changed in my spending since the trip, and is
anything about to bounce?" and the honest answer lives in three modules at once:
a ledger, a schedule of upcoming charges, a balance forecast. A conversational
surface can describe them; a navigational one can send the user to each in turn.
The model-composed workspace does the third thing: **the model does the heavy
lifting and takes control of part of the screen** to put what the user needs from
many modules in one sight, conducted from a chat or command surface that stays
beside it.

An AI-driven experience has two tiers, and this subject is the inside one. The
outside tier is how a product presents itself to agents it does not control -
a handful of journey-shaped operations, small views where seeing beats reading,
and a handoff back to the product for depth and consent - and it is
[agent-host-experience](../agent-host-experience/agent-host-experience.md). The
inside tier is the product's own screen, where the product controls everything
and therefore owes the user everything: a place that keeps its shape while
something else moves the furniture.

The subject in one sentence: **the model is the conductor of a screen that keeps
its shape.** It chooses the form an answer takes, including no interface at all;
it composes into a region set aside for it and never moves what the user relies
on; it treats the user's own arrangement as a standing instruction; every change
it makes is a closed verb with an undo and a line saying what changed; it narrates
the work it is really doing; its motion marks what it changed and then rests; and
nobody knows whether any of this works until the view choices are measured,
including the times it should have chosen none.

Reach for it when the composer of the screen is a model and the screen is a real
product with modules people already use by hand. Do not reach for it when the
product has one module (a composed view of one thing is that thing's own screen,
reached by navigation), when the answers are overwhelmingly facts and how-tos
(prose wins those, and the workspace is cost with nothing to carry), or when the
team cannot yet afford the evaluation - a model driving a screen without a measure
of its view choices is a demo that degrades in production without anyone noticing.

## The form of the answer follows what the answer is

The first decision of every turn is not which component to show. It is whether to
show anything. A fact or a how-to is prose: extra structure around a one-line
answer is extra reading, and the most consistent finding in the comparisons of
generated interfaces against plain conversation is that conversation wins the
simple questions. An inline card carries one decision or a small structured set.
A persistent pane holds what will be edited, reused, referred back to, or what
runs longer than a screen. A composed workspace is for work that is comparative,
quantitative or explorable across modules - the case where a generated interface
earns its preference. And when the destination already exists as a module screen,
the right answer is navigation to it, not a copy of it.

Two shape rules keep the categories honest. A card that would need more than two
actions, or any navigation of its own, is a pane; the card was the wrong vessel.
And the cost side is real: a composed view takes longer to generate than a
sentence, can be inaccurate in ways a sentence cannot, and a surface that
re-forms itself every turn makes the user relearn it. The routing rules, the
thresholds, and the counter-evidence are
[answer-form-routing](./techniques/answer-form-routing.md).

## Copy, do not move

The oldest evidence in this field comes from adaptive menus, and it is
unambiguous about one thing: interfaces that rearrange the familiar parts to save
clicks lose in practice, and interfaces that **copy** the likely-needed functions
into a clearly designated, spatially stable area win. A user's knowledge of where
things are is the most expensive asset the screen holds, and a layout the model
re-forms destroys it at exactly the moment the user was about to act.

So navigation, module chrome and primary actions are fixed, and the model composes
only into a **composition region** set aside for it. Inside that region it places
views in the slots and spans of a declared grid, never in coordinates - a
coordinate is an invitation to overlap, clip and drift. "Open the ledger" creates
a view of the ledger in the region and leaves the ledger module exactly where it
was, so the old path always works and the user is never stranded by a
composition they did not ask for.

What the model places are **module views**: composable units each module publishes
with its own data binding, its own empty state and its own error state. The model
selects them and binds their parameters; it never writes their numbers. A balance
the model typed into a heading is a hallucination that renders like a report; a
balance the ledger's own view fetched is the product speaking. The rule is sharp
enough to enforce mechanically: a model-authored title or caption that carries a
figure is refused at the validation door, and a binding to an identity the model
was never shown is dropped there too.

The region is also stable in time. It re-forms when the user asks, or when the
shape of what exists changes - a kind of item appears or the last one goes - and
at a bounded rate; a change in values updates the views in place and never
re-forms the region. A composition that fails keeps the last good one on screen,
and a fixed default layout stands before the first. Stability is half the answer
(the tensions below give the other half). The region, the grid, the module-view
contract and the numbers rule are
[composition-region](./techniques/composition-region.md).

## The user's arrangement is a standing instruction

The moment the user pins a view, resizes it, sorts a column, groups by account or
dismisses a panel, they have told the model something it must not forget on the
next turn. A system that regenerates the region from scratch each turn discards
that instruction - and in a session-long study, approval of model-chosen structure
that was re-decided every turn fell from about seven in ten in the first half of
the session to one in three in the second, while structure that persisted the
user's choices started near three in four and held near six in ten.

The same study found the limit, and it is the half that is easy to skip:
persistence degraded at sub-task transitions and when rules piled up beyond their
relevance. So the user's actions become **task-scoped standing rules**: carried
into the next composition, visible as rules the user can read and remove, and
expired at a task boundary rather than accumulated forever. User beats model,
always; a pinned view survives recomposition. Where the task boundary falls is the
unsolved part of the problem, and the honest design names its own heuristic and
shows it. The rules are told to the model when the prompt is built and enforced
again when the composition is committed, so a pin set while the model was
thinking still holds. That is [arrangement-memory](./techniques/arrangement-memory.md).

## Every change is a closed verb with an undo

The model changes the screen only through a closed set of operations - show,
focus, filter, navigate, highlight, propose - validated at one door, applied one
step at a time, each with a one-step undo and a visible line that says what
changed. A screen that moves without saying why teaches the user that it moves
for no reason, and an operation without an undo makes every model mistake the
user's job to repair by hand. Focus and filter change emphasis, never presence -
a filter dims what it excludes and leaves it drawn and clickable - and the undo is
the product's own control, never a verb the model can emit.

Three rules sit beside the vocabulary. **Stop halts at once and restores** the
arrangement the user last saw, because disengaging means stepping back, not
freezing half-way. **Ambiguity gets a question or a smaller view**, never a
rearrangement: an unsure model that reshapes the screen has made its uncertainty
the user's problem. And **the user's own hand supersedes a pending model
operation** - a click that lands while the model's change is in flight wins, and
the stale operation is dropped and said to be dropped. Anything that would change
data rather than the view is a proposal, armed only through consent. That is
[reversible-screen-ops](./techniques/reversible-screen-ops.md).

## The turn the user lives

The conductor turn has a flow, and most of its failures are timing. The user's
message is acknowledged in well under a second, because silence reads as failure.
While the model works, the surface narrates the steps it is really taking -
"reading the ledger", "checking scheduled charges" - instead of a wordless
spinner, and it never adds delay to seem more thoughtful: one latency study found
fast answers were rated less thoughtful while people's behaviour did not change at
all, and its authors flagged slowing a system down to look deliberate as a
deception risk. The essential answer comes first, in short paragraphs; text and
components appear in the order the model emitted them; two or three specific
follow-ups sit below the answer; a refusal diverts - what is out of scope, plus
the nearest thing the product can do. And the composer stays present in the
workspace, so the conversation keeps driving the view rather than being replaced
by it. Narrate what is being done, not what is being "thought". That is
[conductor-turn-flow](./techniques/conductor-turn-flow.md).

## Motion marks what the model changed, then rests

A model-driven surface changes more often than a hand-driven one, so its motion
has two jobs a product's ordinary motion system does not: to make
**model-originated change** legible as one thing becoming another, and to stay
calm enough that a constantly changing screen still rests. Text arrives by word or
phrase with a short fade, segmented by the reader's locale, and the animation is
removed when the message settles. A component whose arguments are still streaming
reserves its final footprint and fills in place, so nothing below it jumps. A
model-made rearrangement animates only what moved, one shared transition per
moved view, and cuts or cross-fades under reduced motion. Model-originated content
carries a labelled marker with an explanation - never an icon alone, which people
do not read as meaning what the designer meant - and returns to the ordinary style
once a person edits it. That is
[composition-motion](./techniques/composition-motion.md).

## You know it works only from a view-choice evaluation

A model that composes screens is making a classification every turn - which form,
which views, which bindings - and a classification is measured against labelled
cases, not admired in a demo. The set pairs an intent and a data shape with the
expected form, including navigation and including **no interface at all**, because
a model that always draws something scores perfectly on a set with no negatives.
Each case scores schema validity, the exact choice and the relevance of the bound
fields, with a judge calibrated against people for the last of those. False
triggers and missed triggers are reported separately, because they have opposite
fixes. Whole sessions are scored for drift, since the failure that matters most
appears only in the second half of one. And seeded wrong outputs measure whether
people catch errors, because explanations and cited sources inflate trust whether
or not the answer is right. That is
[view-choice-evaluation](./techniques/view-choice-evaluation.md).

## Three tensions this standard holds rather than resolves

**Stability against accuracy.** The copy-not-move evidence says keep the layout
still; later adaptive-interface work found that the accuracy of an adaptation
mattered more to performance and satisfaction than its predictability. The
standard splits the screen: what the user navigates by never moves, and the
region the model owns is judged on accuracy.

**Persistence against fresh generation.** Remembering the user's arrangement
prevents session drift; remembering it too long leaks a finished task's rules
into the next. Neither "always regenerate" nor "always persist" survives a real
session; task-scoped rules with a visible expiry are the current best answer, and
the boundary heuristic is a design decision to be measured, not a solved problem.

**Showing the work against inflating trust.** Narration answers "is it doing
anything?" and is what keeps a slow turn honest; visible deliberation also shifts
how competent and how human the system seems, independent of whether it is right,
and so makes a wrong answer more convincing. Narrate actions, label model content, and measure
reliance with seeded errors rather than assuming transparency is free.

## Where this ends

This subject owns the composition decisions; the mechanics belong to neighbours.
The closed vocabulary, its registry, the one validation door and consent-armed
actions are [schema-driven-ui](../../../ui-surfaces/input-and-editing/schema-driven-ui/schema-driven-ui.md);
extracting a spec from a model turn is
[structured-output](../../prompt-and-context/structured-output/structured-output.md).
The transcript as a document - turns, rows, narration, scroll, the composer queue -
is [chat-transcript](../../../ui-surfaces/shell-and-navigation/chat-transcript/chat-transcript.md),
and buffering, phases and steering a turn in flight are
[streaming-output](../../runtime-and-io/streaming-output/streaming-output.md).
The motion system itself - presets, budgets, reduced-motion mechanics - is
[motion](../../../ui-surfaces/feedback-and-style/motion/motion.md). A resident
companion's two surfaces, quick replies and the structured blocks it draws inside
its own conversation are
[conversation-orchestration](../../companion/conversation-orchestration/conversation-orchestration.md).
Approval of what a machine wants to do is
[hitl-approval](../../orchestration/hitl-approval/hitl-approval.md), and the
harness a view-choice set runs in is
[eval-harness](../../evaluation-and-cost/eval-harness/eval-harness.md).

## The techniques

- [answer-form-routing](./techniques/answer-form-routing.md) - the form, chosen by what the answer is.
- [composition-region](./techniques/composition-region.md) - copy, do not move; views own their numbers.
- [arrangement-memory](./techniques/arrangement-memory.md) - task-scoped, inspectable, expiring rules.
- [reversible-screen-ops](./techniques/reversible-screen-ops.md) - closed verbs, undo, stop restores.
- [conductor-turn-flow](./techniques/conductor-turn-flow.md) - the order of one turn as the user lives it.
- [composition-motion](./techniques/composition-motion.md) - motion and provenance for model-made change.
- [view-choice-evaluation](./techniques/view-choice-evaluation.md) - negatives, trigger rates, session drift.
