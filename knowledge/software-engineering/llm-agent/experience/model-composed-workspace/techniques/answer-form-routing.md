---
layer: technique
type: technique
subject: model-composed-workspace
technique: answer-form-routing
status: forged
laws: [failure-not-empty-success]
shared_with: []
use_when: [deciding whether an answer is prose, a card, a pane, a composed workspace or navigation, a model that draws a widget around a one-line answer, a card that keeps growing actions and tabs]
---

# Answer-form routing

A model that has learned to compose views will compose them for everything. The
first symptom is a card wrapped around a one-line answer: a bordered box with a
title, an icon and a single sentence the user could have read in the time the
box took to render. The second is the opposite failure, a long comparative answer
delivered as four paragraphs of numbers nobody can compare. Both come from the
same missing decision. Before the model chooses *which* view, it has to choose
*whether* a view, and of which kind - and that choice follows what the answer is,
not what the system is able to draw.

## The forms, and what each is for

There are six forms, and the list is closed so that the model is choosing among
them rather than inventing a seventh.

- **Prose.** A fact, a definition, a how-to, a yes or no with a reason. Extra
  structure around a short answer is extra load, and in comparisons of generated
  interfaces against plain conversation, conversation wins the easy and basic
  questions because the added interface imposes reading without adding anything
  to read.
- **Inline card.** One decision, or a small structured set the user glances at -
  a single transaction, a confirmation of what is about to happen, three or four
  data points. It lives in the conversation at the turn that produced it.
- **Persistent pane.** Anything the user is likely to edit, reuse, return to, or
  that stands on its own and runs longer than about a screen. It lives beside the
  conversation, survives the next turn, and is the place a draft or a long table
  belongs.
- **Composed workspace.** Work that is comparative, quantitative or explorable,
  drawing on more than one module - the case generated interfaces were built for,
  and the one where people prefer them most clearly. It lives in the composition
  region.
- **Navigation.** The destination already exists as a module screen that does the
  job better than anything composed. Take the user there; do not draw a copy.
- **Nothing.** The model asks a question, or answers in a sentence, or declines.
  This is a form, not the absence of one, and it is the one most often missed.

## The routing rules

State them as rules the model is taught and the evaluation checks, never as
adjectives like "use visuals when helpful".

- **When the answer fits in two sentences, answer in prose**, even if a component
  could show it. The composition costs generation time and reading time and buys
  nothing.
- **When the answer is three or more comparable things, do not enumerate them in
  prose.** Two compare fine in a sentence; three or more need a table or a chart,
  either inline or in the region depending on the next rule.
- **When the answer draws on one module and the user will act there, navigate.**
  A composed copy of a module screen is a second, weaker version of a screen the
  product already maintains.
- **When the answer draws on several modules, compose.** That is the case
  navigation cannot serve, because no single destination holds the answer.
- **When the user will edit, reuse or return to it, use a pane or the region, not
  the transcript.** Content the user refers back to should not scroll away with
  the conversation.
- **When intent is ambiguous, choose the smaller form.** A short answer plus a
  question costs one turn; a wrong composition costs the user's place on the
  screen and a turn spent undoing it.

## The card limit

A card is a sentence with structure, not an application. When a card would need
**more than two actions, any internal navigation (tabs, drill-ins, a second level),
or a scroller of its own**, it is the wrong vessel and the answer is a pane or a
navigated view. The limit is not arbitrary taste: an embedded card competes with
the conversation for the same column, and every action added to it is a decision
surface the user must evaluate inside a message. Published guidance from an agent
host that renders cards inside conversations sets the same ceiling for the same
reason. Text after a card suggests what to do next; it never restates what the
card already shows.

## The counter-evidence, carried

Preference for generated interfaces is real and narrow. In one preference study
of generated interfaces against plain conversation, raters favoured the generated
form most for data analysis and visualisation and for interactive tasks, and
favoured conversation for simple how-to questions. Three caveats travel with that
finding:

- The comparisons rarely priced **generation time**. A composed view that takes
  many seconds against a sentence that takes one is a different trade from the
  one raters were shown.
- Generated interfaces are **sometimes wrong** in ways prose is not - a chart with
  a mislabelled axis is more convincing than a sentence with the same error.
- A surface that **re-forms itself each turn** makes the user relearn it. The
  routing decision is therefore also a stability decision: a model that oscillates
  between forms for similar questions is worse than one that is consistently a
  little suboptimal.

So the routing default is conservative: prose unless the answer's shape demands
more, and the same form for the same shape of question across a session.

## No form is a recorded outcome

When the model chooses nothing - a sentence, a question, a decline - record that
choice as a choice. A turn that produced no view because the router decided
against one and a turn that produced no view because the composition failed
validation look identical on screen and are entirely different facts
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)). The
evaluation needs the first to score correct non-triggers; the product needs the
second to disclose a loss. Both need the turn's record to say which happened.

## Where this ends

How a resident companion draws a small table or chart inside its own reply - the
register, the caps, the width rule - is
[structured-visual-replies](../../../companion/conversation-orchestration/techniques/structured-visual-replies.md);
this technique decides when that inline form is the right one at all and when the
answer belongs in a pane, the region, or another screen. Typed rows for things
that *happened* during a turn (a tool call, an approval, an error) are not answer
forms; they are
[inline-structured-rows](../../../../ui-surfaces/shell-and-navigation/chat-transcript/techniques/inline-structured-rows.md).

## When not to use this

- **A product with one module.** Every routing decision collapses to prose or
  navigation; the workspace form has nothing to compose.
- **A pure command surface.** When the user types commands, not questions, the
  form is fixed by the command and routing is overhead.
- **Before there is an evaluation.** Routing rules taught to a model and never
  measured drift toward drawing everything, because drawn answers look like
  progress in review. Ship the set of labelled intents with the rules.
