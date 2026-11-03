---
layer: technique
type: technique
subject: model-composed-workspace
technique: conductor-turn-flow
status: forged
laws: [failure-not-empty-success, silent-state-is-ungoverned]
shared_with: []
use_when: [a model-driven screen sits behind a wordless spinner until the whole reply is ready, answers bury the point under preamble and caveats, the conversation disappears once the workspace opens, a refusal leaves the user with nowhere to go]
---

# The conductor turn flow

A turn on a model-composed screen is lived by the user as a sequence of moments,
and most of what goes wrong is timing: a pause with nothing on screen, an answer
that arrives as one block after a long wait, a point buried under three
paragraphs, a refusal that ends the conversation. This technique is the order of
those moments as the user should experience them. It does not own the mechanics -
the narration row, the composer queue, steering a turn in flight - which belong to
the transcript and stream subjects it links to. It owns the sequence.

## 1. Acknowledge at once

The user's message is acknowledged in **well under a second**: the message lands
in the transcript, the composer clears, and something visibly takes the turn.
Silence after submit reads as failure, and a user who doubts the submit sends it
again. The acknowledgement is not an answer and must not pretend to be one - no
"Great question!", no model-generated filler that costs a round trip to produce.

## 2. Narrate real work, never manufactured delay

While the model works, the surface says **what it is actually doing**, in the
terms of the product: "reading the ledger", "checking scheduled charges for next
week", "building the comparison". A wordless spinner answers "is it alive?" and
nothing else; a narrated step answers "is it doing the right thing?", and a user
who sees "reading the savings account" when they asked about the joint one can
interrupt before the answer is built on the wrong data. The narration's live and
settled forms are
[progress-narration](../../../../ui-surfaces/shell-and-navigation/chat-transcript/techniques/progress-narration.md),
and deriving a human phase from the event stream is
[phase-derivation](../../../runtime-and-io/streaming-output/techniques/phase-derivation.md).

Narrate actions, not deliberation. Visible "thinking" shifts how competent and how
human a system seems independently of whether it is right, which raises trust and
overtrust together; a list of steps taken raises the first without manufacturing
the second.

**Never add delay to seem thoughtful.** In one latency study, fast answers were
rated less thoughtful and less useful than the same answers delivered slowly,
while people's actual behaviour did not change - and the study's authors flagged
deliberately slowing a system as a deception risk. A product that pads its
latency is lying about its own state to buy a rating
([silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned) is
the law the honest version obeys: the user sees the state the system is really
in).

## 3. The essential answer first

When the answer arrives, its first sentence is the answer. Not a restatement of
the question, not a summary of what the model is about to do, not a caveat. Then
short paragraphs, each carrying one thing. In one usability study of a range of
assistants, a longer answer was not a better answer, and streaming a long reply
intensified the sense of overload rather than relieving it - so the reply that
streams is also the reply that should be short.

When a composition accompanies the answer, the prose says what the composition is
*for* in a line and does not recite it. The view is already on screen.

## 4. Parts in the order they were emitted

A reply may mix text, components and operations. Render them **in the order the
model emitted them**, each where it belongs: a sentence, then the view it
introduces, then the next sentence. Gathering all components to the end, or all
text to the top, breaks the model's own sequencing - "here is the forecast;
notice the dip on the 14th" makes sense only with the forecast between the two
clauses. A component whose arguments are still streaming takes its place in the
order immediately, as a placeholder that reserves its final size, and fills in
place (the motion half of that is the motion technique of this subject).

## 5. Two or three specific follow-ups, below the answer

Offer **two or three** next moves, beneath the answer, specific to what was just
shown: "Compare with last March", "Show only recurring charges". Generic
follow-ups ("Tell me more") are ignored, and follow-ups placed above or beside the
answer compete with it. How a model proposes them and how they render as chips is
[model-proposed-quick-replies](../../../companion/conversation-orchestration/techniques/model-proposed-quick-replies.md).
Clarifying questions are a separate instrument and are used sparingly: ask when
the routing would otherwise guess at a composition, not as a reflex.

## 6. Refuse by diverting

When the product cannot help, the reply says **what is out of scope and the
nearest thing it can do**: "I can't move money from here - I can show you the
transfer screen with these amounts filled in." In one study comparing styles of
denial, the bare refusal was the most frustrating, and the style that diverted to
something else the system could do was the one participants generally
appreciated. Do not pad the gap with general advice the product has no
grounding for. And keep refusal distinguishable from failure
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)): "I
won't" and "I couldn't" are different facts with different next steps, and a turn
that silently produced nothing is neither.

The same honesty covers **who answered**. When the live model fails and a
fallback - a scripted engine, a cached answer, a default layout - answers in its
place, the turn says so in one line. A fallback presented as the model's own
answer is the turn lying about its state, and the user who notices once will
discount every answer after it.

## 7. The composer stays

The composer remains present and usable while the workspace is open and while a
turn is running. The conversation is what drives the view; a workspace that
replaces the composer, or a full-screen composition the user must close to speak
again, turns the conductor into a slideshow. Submitting while a turn runs is
accepted and resolved by the surface - steer the running turn or queue the next -
per [composer-turn-queue](../../../../ui-surfaces/shell-and-navigation/chat-transcript/techniques/composer-turn-queue.md)
and [mid-turn-steering](../../../runtime-and-io/streaming-output/techniques/mid-turn-steering.md).

## Decision rules

- **When nothing has rendered within about a second of submit, the surface is
  broken**, whatever the model is doing.
- **When the narration would say only "thinking", say what is being read or built
  instead**, or show nothing but the acknowledgement.
- **When the first sentence of the reply is not the answer, the register is wrong**;
  fix it in the composer's standing instruction, not per reply.
- **When a component is emitted mid-reply, render it there**, not at the end.
- **When declining, name the nearest capability.** A refusal with no next step is
  a dead end the user has to route around alone.

## When not to use this

- **Long delegated tasks.** When the user hands over work that runs for minutes
  and leaves, the flow is a resident companion's narrated, promoted-on-finish
  turn, not a conductor's live sequence; see the companion subject.
- **Pure command palettes.** A command that runs and reports needs acknowledgement
  and a result line, not follow-ups or a diverting register.
