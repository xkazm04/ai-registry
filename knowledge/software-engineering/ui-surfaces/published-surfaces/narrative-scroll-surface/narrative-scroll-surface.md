---
layer: golden-path
type: golden-path
subject: narrative-scroll-surface
status: forged
use_when: [building a product tour or a how-it-works page, a marketing page has become a stack of unrelated bands, deciding what an illustration on an explanatory page must prove, animating a page against the reader's scroll instead of a timer, an explanatory page must survive being read without scrolling]
techniques:
  - sequence-as-spine
  - illustration-carries-the-claim
  - scroll-bound-progression
  - no-orientation-tax
  - reveal-without-loss
---

# Narrative scroll surface

Some pages exist to explain something to a reader who has not yet decided to
care. A product tour, a how-it-works page, a walkthrough of a pipeline, the
long explanatory page a company writes once and then argues about for two
years — all of them share one situation and it is unlike either of the two
situations interface craft usually assumes.

A **document** has a reader who already wants the content and whose problem is
finding the part of it they need. An **app surface** has a reader with a task,
who will tolerate a great deal of friction because they came to accomplish
something. A narrative surface has neither. Its reader arrived from a link, a
search result, a nav item they clicked out of mild curiosity; they have no
task to complete and no intention of reading; their attention is *borrowed*,
not given, and it is revoked without notice and without a signal the page can
observe. Everything difficult about this surface follows from that one fact.

The naive reading is that this makes the surface easy — nothing has to work,
nothing has to be correct, it is "just marketing". The opposite is true. A
document may ask its reader to navigate, because the reader wants what is
there. A narrative surface may ask for nothing at all. Every decision it
delegates to the reader — how to read this, where to start, which of these
three paths is mine — is a decision the reader answers by leaving, and leaving
is cheaper than deciding.

So the discipline of this surface is: **the page must be consumable without
the reader ever deciding how to read it.** It supplies its own intent, it
carries the reader forward on the one gesture the reader is already making,
and it earns the next screen with each screen it spends.

## The content is a sequence, and the sequence must be one object

Almost every page of this kind has, underneath whatever it looks like, a
sequence: a process with steps, a story with a beginning, a set of stages that
happen in an order. That order is the page's only inherent structure and it is
what makes the page explicable at all — "and then" is the cheapest transition
in language, and it is free here because the content already has one.

Pages throw it away by default. The band is the unit almost every explanatory
page is built from: a full-width strip with a heading, some copy, an image,
alternating background colours to prove the strips are different. Six of them
stacked is a page that has a sequence in its *content* and no sequence in its
*form*, and a reader scrolling it experiences six unrelated advertisements
rather than one argument. Nothing is broken; the page simply does not
accumulate. Each band has to re-establish what it is talking about, so each
band opens with the context the previous one already built, and the page is
long without being cumulative.

The standard is that the sequence is **rendered as a single continuous
object** — one visual spine the reader follows from the first station to the
last, with the stations hung off it. The spine does the work the reader would
otherwise have to do: it says *this is one thing, you are inside it, there is
more of it below, and you are this far along*. It is the difference between a
page you scroll and a page that scrolls you.

This is not a decoration rule and it is not universal. A page whose content is
genuinely a *set* — parallel features, unranked options, a comparison — has no
sequence, and forcing a spine onto it invents an order that is not true and
that the reader will try to interpret. The test, the station structure, and
the numbering discipline are
[sequence-as-spine](./techniques/sequence-as-spine.md).

## Illustration either carries a claim or is furniture

An explanatory page makes claims. "The system reads your document and pulls
the requirements out of it" is a claim, and the reader's honest response to it
is *prove it*. On a page like this the proof is almost always visual, because
the reader will look at a picture before they will read a paragraph, and
because the artifact being described is itself a visual thing.

The failure is a whole industry's default: the claim is made in prose and
illustrated with an abstract shape — a gradient blob, a floating card with
lorem lines, three circles connected by a curve. This art is not wrong, it is
*empty*: it decorates the claim without evidencing it, so the reader has spent
a second of borrowed attention and learned nothing the heading had not already
told them. Repeat that six times and the page is expensive and weightless.

The standard splits illustration into two populations with different
obligations. **Informative art is a faithful reduced mockup of the real
artifact** — the actual screen, the actual record, the actual transcript,
simplified but not falsified — and it therefore ages with the product, a cost
the page accepts deliberately rather than a defect. **Decorative art carries
no claim**, is inert to assistive technology, and is spent sparingly, because
a flourish that appears once is a signature and one that appears six times is
a texture nobody sees. The litmus, the type-scale problem mockup art has
beside display copy, and the rationing rule are
[illustration-carries-the-claim](./techniques/illustration-carries-the-claim.md).

## Motion is bound to the reader, because a clock does not know where they are

Explanatory pages animate. The reason is sound: a sequence is about change
over time, and motion is the only medium that shows change directly rather
than describing it.

The reason it usually fails is that the motion is driven by a clock. An
entrance that plays on a timer, a loop that runs whether or not anyone is
looking, a sequence that starts when the page loads — every one of these is
*always at the wrong moment*, because the only moment that is right is the
moment the reader arrives at that part of the page, and the clock has no
access to that. The reader scrolls past a station whose animation finished
four seconds ago, or scrolls into one whose animation has not started, and the
page's most expensive craft is spent on an empty room.

The reader is, however, continuously producing a signal that says exactly
where their attention is: their scroll position. Binding the motion to that
signal makes the page's motion correct by construction — the peak of a
station's gesture happens at the moment the station is at the reading
position, because the peak is *defined* as that position. It also gives the
reader something no timed animation can: agency. Scrolling back replays;
scrolling slowly slows it; stopping stops it. The reader is operating the
page, and a reader operating something is a reader who has not left.

Scroll-bound motion has its own hazards, and they are not the hazards of timed
motion. Raw scroll offset is noisy and strobes on a fast wheel. A gesture that
peaks above its resting size can paint outside the column it was measured in
and collide with its neighbour. And an envelope with no exit — enter, peak,
and stay — leaves every passed station shouting at full volume behind the
reader. The envelope, the smoothing, the collision rule and the reduced-motion
collapse are
[scroll-bound-progression](./techniques/scroll-bound-progression.md).

## Every choice the page offers is an opportunity to leave

The orientation tax is the attention a reader spends working out *how to read
this* before they have read any of it. On a document it is a small tax and
worth paying, because the reader wants the content. Here it is fatal, because
the reader has not yet decided the content is worth anything, and the first
thing the page asked them to do was work.

The tax is levied by things that feel generous: a choice of entry points, two
columns that could be read in either order, a "jump to the part you care
about" control offered to a reader who does not yet know which part that is, a
navigation element whose entries are unreadable and therefore not a choice but
a puzzle. Each of these was added to help. Each replaces a reader who was
being carried with a reader who has been handed a decision.

The standard is that the page has **one reading direction, always available,
never required to be chosen** — and that any navigation it offers is primarily
a *you-are-here readout* and only secondarily a set of destinations. That
inversion is the whole rule: a reader who is being told where they are is
being reassured; a reader who is being asked where to go is being taxed. It
also settles a question that otherwise gets decided by aesthetics, which is
whether the entries may be dots. They may not: a destination you cannot read
is not a destination, so an unreadable index is a progress indicator wearing a
navigation's clothes. The readout contract, the legibility rule, the
deep-link landing and the small-viewport substitution are
[no-orientation-tax](./techniques/no-orientation-tax.md).

## Revealed is not the same as present

Everything above assumes a reader who scrolls. Several important readers never
do, and the page owes them the same content.

A crawler renders the page and takes what is there. A link preview takes the
first screen. A reader printing the page, capturing it to a document, or
screenshotting it for a slide takes one static frame. A reader with reduced
motion turned on has asked the page not to move. A reader whose script did not
run — a bad network, a blocked bundle, an old device — gets whatever the
served markup contains. For each of them, "it appears when you scroll to it"
means "it does not exist".

So the reveal is an *appearance* change over content that is already present,
never a mounting decision. Text that fades in is text that was in the served
document; a station that grows to full size was always laid out. This costs
nothing and removes an entire failure class — and it is the discipline that
the convenient implementation of scroll reveal violates first, because
mounting on approach is easier than styling on approach and looks identical
in a browser.

It also has a consequence for how the page is *checked*, and this one is
routinely missed with expensive results. Automated review of such a page —
a whole-page capture, an accessibility sweep — runs at the top of the page by
default, where none of the revealed content has been revealed and none of the
scroll-dependent chrome exists yet. The instrument reports on a page nobody
will ever see: empty colour blocks in the capture, a clean audit of an
element set that is missing most of the page. A review that does not scroll is
not a review of this surface
([gate-sees-target](../../../_laws.md#gate-sees-target)). The reveal
mechanism, the static-frame obligations and the scrolled-capture rule are
[reveal-without-loss](./techniques/reveal-without-loss.md).

## How you can tell it is working

The failure modes of this surface are specific enough to be checked, and each
has a symptom that does not look like a bug:

- **A stack of bands.** Symptom: any single band can be deleted without the
  page reading as broken. If the sequence were real, removing a station would
  leave a hole.
- **Decorative art on a load-bearing claim.** Symptom: the illustration would
  serve equally well beside a different claim. Swap two stations' art; if
  nobody notices, neither piece was evidence.
- **Timed motion.** Symptom: the page looks different depending on how fast
  you scroll it, in the sense of *missing things*, not in the sense of
  responding.
- **An orientation tax.** Symptom: the page's first screen contains a
  decision. Or, measurably: the navigation's entries cannot be read at rest.
- **Reveal that removed.** Symptom: a whole-page capture is mostly empty, or
  the served markup does not contain the page's own argument.

## Where this subject stops

Three neighbours border this one closely, and the seams are worth stating so
that a reader picks the right document rather than the nearest one.

[long-form-reading-surface](../long-form-reading-surface/long-form-reading-surface.md)
owns navigating *inside* a document the reader already wants: the contents
panel, the scroll-spy reading band, the offset budget every pinned element
withdraws from. Both subjects put an index down the side of a scrolling
column, and they are not the same object. There it is a table of contents for
a reader deciding which part to read; here it is a progress readout for a
reader who must not be asked to decide anything. When the reader wants the
content and needs a part of it, that subject is right. Its offset budget,
though, is a debt rather than a boundary: a deep link into a station lands
under fixed chrome for exactly the same reason and takes exactly the same
answer, and this subject does not restate it.

[lazy-section-addressability](../lazy-section-addressability/lazy-section-addressability.md)
owns the address space of a page whose sections are not present when their
names are used. The relationship here is a constraint rather than an overlap:
this subject's reveal rule *forbids* the situation that one exists to manage,
because content styled-in rather than mounted-in was never absent. A narrative
surface that has grown genuinely deferred sections — a heavy embedded
artifact, a code-split subtree — has acquired that subject's problem in
addition to this one's, and its wrapper discipline applies unchanged.

[motion](../../feedback-and-style/motion/motion.md) owns the movement
vocabulary: what a gesture is made of, which engine runs it, what a preset may
cost, and the lifecycle obligations of motion nobody asked for. It explicitly
declines the choreography question — *when* a gesture may play — and that is
the half this subject answers for an explanatory page: bound to the reader's
position, peaking at their reading moment, showing a revisited station as it
was rather than replaying it. Vocabulary decisions stay there; a page
inventing easing families has wandered off this subject's ground.

Further away, and worth naming because the confusion is common: the front page
of a code repository is also an artifact whose reader has not decided to care,
and it is a different subject
([repository-landing-document](../../../engineering-process/codebase-stewardship/repository-landing-document/repository-landing-document.md)).
Its medium cannot animate or bind to scroll and is re-rendered by hosts that
strip its formatting; its reader wants a route onward rather than an
explanation. Composition rules travel between the two — a figure earns its
place, a caption states what to notice — and mechanics do not.

## Accessibility posture

- **The reveal is cosmetic and the content is not.** Reduced motion collapses
  every gesture to its resolved end state — full size, full opacity, final
  position — and never to nothing. A surface that renders blank for a reader
  who asked it to stop moving has deleted its content as a motion setting.
- **The spine is decoration and says so.** A drawn line, a connector, a
  station marker carries no information a non-visual reader needs, because the
  order is already carried by the reading order of the stations themselves.
  Left unmarked, it is a stream of meaningless graphic announcements between
  every pair of stations.
- **The station's number is in its text, not only in its art.** A numeral
  painted into an illustration is invisible to anyone not looking at it, and
  the number is part of the content: it is what makes the station a step.
- **The index is a named navigation region with a stated current entry.** If
  it exists at all it is one of the page's two or three navigation landmarks,
  and its highlight is announced rather than only painted.
- **A jump moves focus, not only scroll.** A reader who activates an index
  entry and receives only a scroll is left with their focus in the index,
  reading a list, while the visual reader is looking at the station.
- **Motion driven by the reader is exempt from the stop-control obligation
  that self-starting motion carries** — it stops when the reader stops — but
  it is not exempt from the preference. Scroll-bound and self-starting are
  different lifecycles, and only one of them owes a visible pause.

## The techniques

- [sequence-as-spine](./techniques/sequence-as-spine.md) — the continuous
  visual spine that makes a sequence one object, the station triad, the
  alternation rhythm, and the rule that numbering is derived from page order
  rather than parsed out of copy.
- [illustration-carries-the-claim](./techniques/illustration-carries-the-claim.md)
  — the informative/decorative split, the litmus for which population an
  element belongs to, the type-scale lift mockup art needs beside display
  copy, and the once-per-page rationing of flourish.
- [scroll-bound-progression](./techniques/scroll-bound-progression.md) —
  per-station progress, the in-then-out envelope peaking at the reading
  moment, spring smoothing over raw offset, per-column curves, the
  paint-collision check for peaks above rest, and the reduced-motion collapse.
- [no-orientation-tax](./techniques/no-orientation-tax.md) — the index as a
  you-are-here readout, legibility at rest as the test of whether entries are
  destinations, one reading direction, deep links that land on a station, and
  the substitution where the rail cannot fit.
- [reveal-without-loss](./techniques/reveal-without-loss.md) — reveal as
  appearance over present content, the readers who never scroll and what each
  is owed, why a capture or an audit taken at the top of the page is an
  instrument pointed at the wrong thing, and why the remedy that fixes a
  latching reveal does nothing for a scroll-bound one.
