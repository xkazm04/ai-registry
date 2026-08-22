---
layer: golden-path
type: golden-path
subject: long-form-reading-surface
status: forged
use_when: [building a contents panel over rendered prose, anchor links scroll nowhere or land under a fixed bar, adding a current-section highlight or reading-progress indicator, article content swaps in place without moving the reader]
techniques:
  - anchor-id-single-assigner
  - fixed-chrome-offset-budget
  - scroll-spy-reading-band
  - focus-transfer-on-in-place-navigation
  - server-parsed-once-reused
---

# Long-form reading surface

A long article is a document the reader navigates *inside*. Around it grows a
predictable set of chrome: an addressable id on every heading, a contents panel
listing those headings, a highlight that follows the reader down the page, a
progress indicator, and one or more bars that stay on screen while the prose
scrolls under them. Documentation sites, changelogs, reports and knowledge bases
all converge on this same set, and they converge because a document long enough
to need a scroll bar is long enough that "where am I and how do I get to the part
I want" becomes the reader's actual task.

Each piece looks like a small, obvious widget. Built as five small obvious
widgets, they fail as a system, and their failures come in exactly two shapes:

- **Two computations of one address space.** The contents panel turns a heading
  into a link target; the renderer turns the same heading into an id. Written
  independently — the natural order, since they live in different files and are
  usually written weeks apart — they agree on ordinary prose and disagree on
  precisely the documents that exercise them: repeated section titles, headings
  that are entirely emoji or punctuation, headings in a script the slug rule was
  never tested against. The reader clicks and the page does nothing.
- **N independent estimates of one geometry.** Every element pinned against
  fixed chrome — the contents panel, the headings the browser scrolls to, a
  sticky sub-navigation, a progress bar — needs the same number: how much of the
  top of the viewport is already spoken for. Each guesses locally, every guess is
  *nearly* right, and the surface accumulates bars that overlap each other and
  anchor jumps that land with the target heading behind the header.

Both failures are invisible in review, because both halves are individually
correct, and both are immediately obvious to a reader. That is the signature of
a missing single authority.

So the discipline of this surface is not five widgets built well. It is **three
authorities and one definition**: one assigner owns the id space, one module
owns the offset budget, one extraction owns the document's structure — and
"the section the reader is currently in" is *defined* rather than measured.

## The address space is minted by one assigner, used by both sides

Anchor ids are an address space, and an address space with two authors is two
address spaces that happen to agree most of the time
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)).
The rule is structural: **one stateful assigner instance per document**, created
once and handed to every consumer that needs a heading's address — the contents
extractor and the heading renderer at minimum. Statefulness is what makes
sharing mandatory rather than merely tidy: the assigner carries the set of ids
already issued so it can suffix a duplicate, and it carries the counter behind
the fallback name it invents when a heading slugifies to nothing. Two instances
have two sets and two counters, and the divergence starts at the first repeat.

The naive fix — extract the slug rule into a shared pure function and call it
from both sides — is the trap, because it shares the *stateless* half and leaves
the two stateful halves to drift. A slug function is deterministic and will
always agree with itself; the disagreement lives entirely in the numbering, and
the numbering is the part a shared helper does not carry. The contract, the
fallback rule, and the test that pins both consumers over one document are
[anchor-id-single-assigner](./techniques/anchor-id-single-assigner.md).

## Every offset is a withdrawal from one budget

The top of the viewport on a reading surface is not free space; it is a stack of
claims. A fixed header sits at the top; under it a sticky sub-bar may sit; under
that, a scroll-margin has to keep an anchored heading clear of both; a contents
panel pinned to the side must start below all of them and be short enough not to
run off the bottom. Every one of those numbers is derived from the same
measurement, and the *only* sustainable way to hold that is one module that
states the measurement once and hands out every derived offset, with a drawn
diagram of the band so the next reader can see what the numbers describe rather
than reverse-engineering them from a sticky rule.

It is also where the single most confusing defect in the family lives: a scroll
container introduced anywhere between a pinned element and the viewport silently
disables the pinning entirely — no error, no warning, the element simply scrolls
away — because pinning is relative to the nearest scrolling ancestor, and the
page grew one nobody remembers adding. The budget, its recomputation rule, the
ancestor constraint, and the responsive question of when the panel stops
existing are
[fixed-chrome-offset-budget](./techniques/fixed-chrome-offset-budget.md).

## "Where am I" is a definition, not a measurement

There is no fact of the matter about which section a reader is in. A tall
viewport may show the end of one section, all of a short one and the start of a
third; "which heading is on screen" returns three answers and "which heading is
nearest the top" returns a different one each time the reader nudges the wheel.
Products that treat this as a measurement problem ship a highlight that flickers
between two entries, or one that jumps a section ahead the moment a heading
crosses the top edge of the screen.

The standard is to **carve a band out of the viewport and declare it the reading
position** — a horizontal strip whose top edge clears the fixed chrome and whose
bottom edge is well above the fold, so that the band contains, at most, the one
or two headings a reader would call "here". The current section is the topmost
heading intersecting that band; when nothing intersects, the previous answer
stands rather than clearing, because "the band happens to sit between two
headings" and "the reader has not reached the first heading yet" are different
states and must be spelled differently. The same band discipline governs a
reading-progress indicator, whose number has a predicate that is easy to get
wrong: progress through the *article body*, not through the document, or the bar
reads ninety percent while the reader is still mid-argument with a long footer
below. See [scroll-spy-reading-band](./techniques/scroll-spy-reading-band.md).

## Navigating in place must move the reader, not just the pixels

When a reader picks the next article from a panel and the content swaps without
a document load, the visual reader is already looking at the new prose and needs
nothing. Everyone else is stranded: focus is still on the link they activated,
inside a panel that now describes a document they are no longer reading, with no
announcement that anything changed. The fix is small and has to be deliberate —
move focus to the new article's heading when, and only when, the content
actually changed — and its whole difficulty is the *only when*: the same effect
fired on first mount yanks focus away from the top of the page on every cold
load, which is a worse regression than the one it fixes.

This is a specific instance of a rule the accessibility subject already owns —
in-place navigation moves focus or announces, and a surface that destroys or
replaces focused content owns the handoff. What this subject adds is the reading
surface's version of it: which element receives focus, why it must be made
programmatically focusable without becoming a tab stop, and the guard that
distinguishes a content swap from a first paint. See
[focus-transfer-on-in-place-navigation](./techniques/focus-transfer-on-in-place-navigation.md).

## Structure is parsed once, where the document is prepared

The contents panel needs a list of headings; the renderer needs the same list to
place ids; a reading-time estimate needs the body's word count. Every one of
those is derived from the document, and the document is available in full at
preparation time — before it is ever handed to a reader's device. Parsing it a
second time on arrival costs the reader time, produces the same answer, and
introduces the possibility of two answers.

So the structure travels **with** the body, extracted once by the same authority
that assigns ids, and the receiving side re-derives only when it can see that
the body it holds is not the body the structure describes — a divergence check,
not a habit. That check is the interesting part: a derived value shipped
alongside its source needs a stated recomputation path
([derivation-names-recomputation](../../../_laws.md#derivation-names-recomputation)),
or the first time an editing surface renders an unsaved draft the contents panel
confidently describes the previous version. The extraction contract, the
divergence rule, and the honesty rules for derived reading numbers are
[server-parsed-once-reused](./techniques/server-parsed-once-reused.md).

## What this subject owns, and where it stops

This subject owns the chrome around **one document**: its addresses, its
contents, its position tracking, and the geometry the pinned pieces share. The
frame around whole *routes* — primary navigation, section vocabulary, the
never-unmounting host and its services — belongs to
[app-shell](../../shell-and-navigation/app-shell/app-shell.md), and the two meet at
exactly one place: the shell's fixed chrome is the measurement this subject's
offset budget is derived from. A reading surface that starts modelling which
product section is active, or that mounts session-scoped machinery because it
happens to be on screen everywhere, has drifted into the shell's ground.

The seam with [chat-transcript](../../shell-and-navigation/chat-transcript/chat-transcript.md)
is worth stating precisely, because both subjects own a long scrolling column
and their scroll contracts are **inverted**. A transcript is written while it is
read: it grows at the bottom, its default posture is to follow the tail, and its
central discipline is not yanking a reader who has scrolled away — the
append-and-follow problem, owned by that subject's
[transcript-scroll](../../shell-and-navigation/chat-transcript/techniques/transcript-scroll.md).
An article is finished before it is read: it does not grow, it has no tail to
follow, and its default posture is the top or a requested address. Its central
discipline is the opposite one — moving the viewport *accurately on demand*,
landing a requested heading in the right place under the chrome, which is the
read-and-locate problem. When the column you are building has a bottom that
moves, you are on the transcript's ground; when it has a shape known before
render, you are on this one's.

With [accessibility](../../feedback-and-style/accessibility/accessibility.md) the
relationship is not a boundary but a debt. That subject owns the app-wide
contracts — keyboard models, focus handoff, name computation, live regions — and
holds this surface to them; this surface owns only its local mechanics, and
where the two overlap the general rule wins. The focus-transfer technique here
is an *instance*, cited as such, not a restatement: when it and
[keyboard-navigation-models](../../feedback-and-style/accessibility/techniques/keyboard-navigation-models.md)
disagree, the accessibility subject is right.

Finally, this subject assumes a document that is wholly present once rendered.
A page assembled from sections that load independently and may not be mounted
when a link into them resolves has a genuinely different address problem —
addresses that must survive being requested before their target exists — and it
is not this subject's.

## Accessibility posture

- **The contents panel is a navigation landmark with a name**, not a styled
  list. It is one of two or three navigation regions on a reading page, so an
  unnamed one is indistinguishable from the shell's.
- **The current entry is stated, not only painted.** The scroll-spy highlight
  carries the current semantic in the accessibility tree; a color change alone
  says nothing to a non-visual reader, and the highlight is the only feedback
  the surface gives about position.
- **Headings are the real navigation.** The contents panel is a convenience over
  a heading structure that must be correct on its own — one top-level heading,
  no skipped levels — because heading-jump navigation is how a screen-reader
  reader traverses a long article, and it works without any of this chrome.
  Progress and reading-time indicators, by contrast, are decoration on that
  traversal: labelled and quiet, and never live regions, or every scroll event
  becomes an announcement.
- **Anchoring must not steal the tab order.** Headings made programmatically
  focusable so navigation can land on them are focus destinations, never tab
  stops — a heading that consumes a tab press does nothing when activated, which
  is the false affordance the accessibility subject bans outright.

## The techniques

- [anchor-id-single-assigner](./techniques/anchor-id-single-assigner.md) — one
  stateful assigner per document, shared by extractor and renderer;
  slugification, duplicate suffixing, the unslugifiable fallback, and the test
  that renders both consumers.
- [fixed-chrome-offset-budget](./techniques/fixed-chrome-offset-budget.md) — one
  module owning every offset against fixed chrome: the measured constants, the
  band diagram, the scrolling-ancestor constraint, and how each pinned element
  derives.
- [scroll-spy-reading-band](./techniques/scroll-spy-reading-band.md) — the
  reading band carved from the viewport, topmost-intersecting wins, the
  no-intersection rule, and honest progress numbers.
- [focus-transfer-on-in-place-navigation](./techniques/focus-transfer-on-in-place-navigation.md)
  — moving focus to the new heading on a client-side content swap, the
  first-mount guard, and what to assert.
- [server-parsed-once-reused](./techniques/server-parsed-once-reused.md) —
  extracting structure once where the document is prepared, passing it with the
  body, and re-parsing only on measured divergence.
