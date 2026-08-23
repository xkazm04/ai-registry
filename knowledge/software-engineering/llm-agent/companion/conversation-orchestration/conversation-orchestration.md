---
layer: golden-path
type: golden-path
subject: conversation-orchestration
status: forged
use_when: [a companion turn runs for minutes with nothing on screen, deciding what the ambient presence may say versus the full chat, teaching a model to narrate its own progress, a companion that should show rather than tell]
techniques:
  - progress-beat-grammar
  - narration-promote-on-finish
  - recall-transparency
  - model-proposed-quick-replies
  - two-surface-doctrine
  - show-dont-tell-walkthrough
  - layered-avatar-state-machine
---

# Conversation orchestration for a resident companion

A resident companion is not a chat feature. It is a presence the user lives
beside: always on screen somewhere, holding memory across sessions, capable of
taking a request that runs for four minutes while the user does something else.
That single fact — **the turn outlives the user's attention** — is what makes
this a subject rather than a styling exercise. A request-response assistant can
be honest by being fast; a companion has to be honest while being slow, on a
surface the user may not be looking at, about work the runtime frequently cannot
observe. So the turn must narrate itself, because nobody else can; that narration
must survive into the record, because the user was elsewhere while it happened;
the memory a turn spends must be visible before it is spent, because silently
recalling the wrong thing is indistinguishable from misunderstanding; the next
move must be a bounded offer, or the user does the orchestrating; and the
conversation must exist at two altitudes at once, because a companion that lives
in one window is a window.

## The boundary

The transcript subject owns the transcript **as a rendered document**: the turn as
its unit of identity, structured events as rows, the live narration thread and its
collapse into a trail, scroll as a contract, the quiet metadata strip. This
subject owns the **conversation that document records** — where narration comes
from when nothing observable is happening, what the model is taught to propose,
what the user is shown about the memory a turn is about to spend, and where a
companion may speak when the transcript is not on screen. The rule for picking:
if the question can be answered without knowing that the other participant is a
model with a prompt, it belongs to the transcript; if answering it means changing
what the model is told, or deciding which of two surfaces the user should be
looking at, it belongs here. Two borders behind that one are easy to cross by
accident. The transport — chunk framing, run attribution, finalization — is the
streaming subject's, consumed here rather than restated. And extraction of
machine-actionable artifacts from settled model text is the structured-output
subject's, operating on the settled record by design; the live-tail line sieve
below is deliberately *not* that pipeline, because one of them is allowed to be
wrong about an incomplete input and the other is not.

## The model narrates itself, because the runtime cannot

The naive architecture derives narration from observed events: a capability was
invoked, a source read, a phase changed. That works for an agent whose work *is*
events, and produces nothing at all for the case a companion hits daily — one long
generation, no capability calls, minutes of silence, then a wall of text. The
user's read of that is not "it is thinking", it is "it is broken", and they say so
by pressing the button again.

So the companion **teaches the model to report on itself**. A short, always-on
prompt addendum establishes a line grammar — a distinctly-marked line, short,
emitted as the model moves from one part of the work to the next — and the
runtime lifts those lines out of the token stream before anything is painted. It
is the cheapest honest progress signal in the design space, and it costs one
paragraph of standing prompt.

It is also, precisely because the model authors it, the easiest place in the
product to ship theater. Four failures recur: the beat that is a **plan** rather
than a report, emitted as a batch before any of it happened; the beat that is
**stale**, still on screen two minutes after the last token; the beat that
**leaks** into displayed prose because the sieve ran on settled text instead of
the live tail; and the beat that is **unbounded**, a model that discovers
narration and produces forty lines of it — all of it owned by
[progress-beat-grammar](./techniques/progress-beat-grammar.md).

Those beats arrive on a channel the next turn will clear, while the trail a user
reads a week later lives in the conversation record, and nothing joins the two by
default. So **settlement promotes the beat stream into the turn's durable record,
as an explicit, idempotent write**. It is not a change of presentation over one
record — that framing belongs to the transcript's collapse, which presupposes the
record exists. Here the record is created at settlement, which brings a write's
obligations: exactly once even when settlement is observed twice; on the
interrupted and failed paths as well as the successful one, since an interrupted
turn's account of what it got through is the most valuable trail in the product;
and a turn whose beats were never promoted renders as a turn with no trail, never
as one that did nothing. The handoff, its idempotency and the summary it derives
are [narration-promote-on-finish](./techniques/narration-promote-on-finish.md).

## What the turn is about to spend is disclosed before it spends it

A companion with memory grounds every turn in things the user said days ago. When
the grounding is right it is the product; when it is wrong the model answers a
question nobody asked, confidently, with no visible cause — and the transcript's
metadata strip discloses recall *after* settlement, which is correct for cost and
duration and too late for correction.

So a companion also discloses recall **forward**: a preview of what was pulled
into context for this turn, available while it runs, openable to the items
themselves, with a door to say "not that one". As a badge it is useless —
"grounded in 3 memories" asks for trust while withholding the evidence. The
mirror disclosure is what the turn *leaves behind*: a chip naming the memory it
will be compressed into and the side effects it caused, while the user can still
disagree with both. Both directions are
[recall-transparency](./techniques/recall-transparency.md); what is stored and
consolidated is the memory subject's.

## Next moves are proposed, bounded, and never self-executing

A turn that ends in an empty input box hands the orchestration back to the user.
So the model proposes a small set of next actions in the same in-band grammar as
the beats — two to four, short, phrased as things the user would say — which the
surface renders as chips. Three rules keep that from becoming a menu. A chip
**sends a message; it never performs an action** — the moment a chip can commit
something, an unreviewed model proposal has become a one-click write and the
approval discipline has been routed around. A chip set **belongs to the turn that
proposed it and goes stale with it**. And chips are **an accelerator, never the
only path**: a surface where the chips are the interface has replaced a
conversation with a wizard. The grammar, the bounds and the staleness rule are
[model-proposed-quick-replies](./techniques/model-proposed-quick-replies.md).

## One companion, two surfaces, one routing rule

The companion exists in two places and they are not one place at two sizes. The
**full conversation** carries complete information: the whole answer, the
reasoning, the structured rows, the history, the record. The **ambient presence**
— a small persistent element the user sees while working elsewhere — carries
quick information and decisions: a sentence, a number, a choice.

The routing rule is about *the user's posture*, not content length. When the user
must read to proceed, the content belongs in the conversation and the ambient
surface's job is to say there is something to read. When the user must only
choose, the choice belongs in the ambient surface, and dragging them into the
conversation to click one of three options is a context switch charged for
nothing. What this prevents is the ambient surface becoming a small, bad chat
window — the most common way the architecture rots, because every individual
"just show a bit more here" is reasonable.

An ambient decision is answerable **without leaving the keyboard or the work**:
options are numbered, a leader key arms the surface, a digit answers, and one
reserved option always means *explain this and recommend one*, because the honest
answer to a decision the user does not understand is neither a guess nor a
dismissal. Two consequences hold the doctrine together under pressure. **There is
no third surface** — a companion that also raises toasts and corner pop-ups has
three places to look and no rule for which; every such surface becomes either a
state change on the presence or a durable entry in the conversation. And
**neither surface may be the only place a decision can be answered**: when one is
not on screen, the same pending decision renders in the other, under exactly the
complementary condition, from the same state. The routing rule, the ambient
content contract and the numbered-option interaction are
[two-surface-doctrine](./techniques/two-surface-doctrine.md).

## Showing beats telling, and it is not the onboarding overlay

Asked where something is, a companion can answer in prose, or it can go there.
The second is dramatically better, and it is a different mechanism from the
product's onboarding tour, which the naive reading reaches for and should not.
A tour dims the world to isolate one control, runs its content through a step
lifecycle, and owns the user's attention until dismissed. A companion walkthrough
is **invoked** by the current turn, conversationally, in the middle of an
unrelated exchange, and its premise is that the product stays usable: the presence
travels to the target, a ring tracks the element as it moves and scrolls, a
caption rail narrates, and **nothing is dimmed** — the user may ignore it and keep
working, which is the point of being guided by a companion rather than
interrupted by a tour.

What is improvised is the invocation, not the content: the steps live in a
registry the model selects from, and any effect a step has on the interface comes
from a closed allow-list resolved in one auditable place, because a walkthrough
whose steps are free text from the model is arbitrary application control wearing
the costume of help. The two subjects share the anchor contract and the tracker
that keeps its geometry current — borrowing both is correct, inheriting the
dimming, the step lifecycle and the attention lock is not. The tracking overlay,
the caption rail, keyboard control and the degradation when a target cannot be
found are [show-dont-tell-walkthrough](./techniques/show-dont-tell-walkthrough.md).

## The presence has a face, and a face is an architecture

A companion on screen permanently is looked at permanently, and a static glyph
reads as switched off. The standard is a **layered** presence: a few pre-rendered
ambient loops carrying the expensive character, one cheap reactive overlay driven
by live state, and ordinary chrome on top for anything that must be legible. The
layering exists so the expressive layer can be dropped whole — reduced motion, a
constrained device, a failed asset — while the layer carrying information keeps
working; a presence whose only channel for "I am working" is an animation has no
fallback when animation is off.

Which loop plays is a **state machine driven by turn events**, not by
component-local flags held by whoever happened to know something was happening.
States are few and named for what the user is being told — resting, listening,
working, speaking, blocked — and they are driven by the same turn lifecycle the
transcript renders, so the face and the conversation cannot disagree.
Disagreement destroys the illusion faster than a missing frame ever could. The
layering, the state set and the degradation floor are
[layered-avatar-state-machine](./techniques/layered-avatar-state-machine.md).

## Conversing while busy: one mind, many threads

A companion that can only do one thing at a time is a tool with a queue. The
UX-level contract for concurrency is small and unforgiving:

- **A turn holds a lock on its own thread, not on the companion.** Another
  conversation answers immediately while the first still runs; what is forbidden
  is two turns writing into one thread, whose order is then a lie.
- **The composer is never disabled, and a mid-turn message is routed by what it
  says.** One that redirects or says stop **interrupts**; one that adds to the
  request **queues** and drains in order. Classifying beats one policy for both,
  because the user expressed which. Never acceptable is the third outcome —
  silently discarding it, the most common one, because the input cleared and the
  user believes it was sent. Whichever happens, the surface shows it.
- **Interrupt is always available and always honest.** Stopping keeps what
  arrived, marks the turn interrupted rather than failed or complete, and promotes
  the partial trail.
- **Voice affordances share the same locks.** Hold-to-talk composes into the same
  thread under the same busy rule; read-aloud attaches to a turn and obeys the
  speech arbiter. Engines, consent and mute are the voice subject's.

## Accessibility posture

The ambient surface is a live region announced at the level of *a decision is
waiting*, never per beat — beat-granular announcement is the firehose the
transcript already refuses. Every numbered option is reachable by tab as well as
by digit, and the leader key never captures a key the product needs. The
walkthrough's ring carries a caption naming the element, because a ring
communicates nothing to a reader who cannot see it. And the presence's state is
exposed as text somewhere, so "working" survives the loss of the animation.

## The techniques

- [progress-beat-grammar](./techniques/progress-beat-grammar.md) — addendum, line
  grammar, live-tail sieve, budgets, staleness.
- [narration-promote-on-finish](./techniques/narration-promote-on-finish.md) — the
  idempotent write, the terminal paths, the derived summary.
- [recall-transparency](./techniques/recall-transparency.md) — forward preview,
  correction door, turn-summary chip.
- [model-proposed-quick-replies](./techniques/model-proposed-quick-replies.md) —
  proposal grammar, bounds, send-never-execute, staleness.
- [two-surface-doctrine](./techniques/two-surface-doctrine.md) — routing rule,
  ambient content contract, numbered options and the reserved zero.
- [show-dont-tell-walkthrough](./techniques/show-dont-tell-walkthrough.md) —
  tracking overlay, caption rail, keyboard control, degradation.
- [layered-avatar-state-machine](./techniques/layered-avatar-state-machine.md) —
  loops, reactive overlay, chrome, the turn-event machine, legibility.
