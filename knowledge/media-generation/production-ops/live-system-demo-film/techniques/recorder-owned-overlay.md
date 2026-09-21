---
layer: technique
type: technique
subject: live-system-demo-film
technique: recorder-owned-overlay
status: forged
laws: [output-never-outruns-evidence]
shared_with: []
use_when: [a demo needs explanatory chrome the product does not have, deciding where demo-only UI should live, chrome disappears partway through a captured take, judging how much motion a demo's overlay may have]
---

# The recorder-owned overlay

A film about a working system usually needs to show things the system's own
surface does not: what is being commanded right now, which capability is being
called, what is waiting on a human decision. Without that chrome the audience
watches a cursor move and a page change and learns the *what* while missing the
*mechanism*, which is normally the entire reason the film exists.

The rule: **that chrome belongs to the recorder, not to the system under test.**
It is injected over the page from the outside, it is isolated in both
directions, it is re-applied after every navigation, and its state is mirrored
outside the page.

## The two wrong homes

**In the product.** The chrome is built as a demo mode inside the application.
It is the path of least resistance and it costs twice: the product now ships
code that exists for a film, and — worse — the film's needs start constraining
the product's surface, because changing the real UI breaks the demo mode. A
demo should be able to go stale against the product. It should never be able to
hold the product still.

**In an editing session.** The chrome is added afterwards as titles and
callouts over the recording. This produces the nicest-looking result and
destroys the property the whole subject is built on: every re-shoot now requires
an editor, so the film stops being re-shot.

The recorder is the third home and the only one that keeps both properties. It
already knows what is happening — it is the thing making it happen — so the
chrome is a projection of the run's own record onto the picture, which also
means it inherits the rule that what it says must trace to that record. An
overlay that announces a call the system did not make is a lie with production
values, in the one place the audience is most inclined to trust.

## The four mechanics

1. **Injected from outside.** The page is not modified at source; the chrome is
   added over it by the driving harness. The system under test has no knowledge
   of it and ships nothing for it.

2. **Isolated in both directions.** The page's styling must not reach the
   overlay, or a routine restyle of the product silently restyles the chrome
   mid-film. And — the direction people implement second and regret first — the
   overlay's styling must not reach the page: chrome that alters the layout,
   focus, scroll position or type of the thing being demonstrated produces a
   film of a system that does not exist. Mutual isolation is the requirement;
   one-way isolation is a bug waiting for a stylesheet.

3. **Re-applied at document start, after every navigation.** A new document is a
   new overlay. The failure is characteristic and embarrassing: the chrome works
   beautifully for the first two minutes, the demo navigates, and the remaining
   eighteen minutes have none. Nobody catches it during the run, because during
   the run everyone is watching the system, not the recording. Registering the
   injection to fire on every document — rather than calling it once after the
   first load — is a two-line difference and the whole difference.

4. **State mirrored outside the page.** What the overlay currently says lives in
   the recorder as well as in the document, for two reasons: the document keeps
   being replaced and would otherwise lose it, and the recorder needs to reason
   about — and assert on — what the audience is presently seeing. Chrome whose
   state exists only in the page is chrome the run cannot verify.

## Motion discipline

**Nothing animates except what the audience must follow.** A demo whose chrome
moves is a demo about the chrome. In practice that rules out entrance
animations on every label, anything that pulses or breathes continuously, and
counters that tick for effect. It leaves exactly one legitimate use: a
transition that carries meaning — a pending decision resolving, a call
completing — where the movement *is* the information.

The reason is not taste. The viewer's attention is a fixed budget and the
picture is evidence; every moving element spends attention that the evidence
needed. It is also a recording concern: continuous animation makes frames
differ for no informational reason, which costs bitrate and makes the picture
softer exactly where the text is.

## Graduation, and the test it provides

When the product grows the surface the overlay was standing in for, the same
script runs and the overlay is simply **not injected**. That switch is the test
of whether the chrome was standing in for something or inventing it: if removing
it breaks the script, the chrome was load-bearing, the film was about the chrome,
and the demo has been demonstrating the recorder. This is the same test the
staged-boundary discipline applies to fixtures, which is not a coincidence — the
overlay is a staged element and belongs in the film's declared boundary as one.

## Decision rules

- When a demo needs chrome the product lacks, put it in the recorder; when the
  product genuinely needs it too, that is a product change with its own
  justification, and the film should not be the argument for it.
- When isolating, isolate both ways, and verify by restyling one side and
  re-running — the direction you did not test is the direction that breaks.
- When the chrome vanishes partway through a take, look at navigation before
  anything else; it is almost always injection that ran once.
- When something in the overlay wants to animate, require it to name what the
  audience would miss without the motion; if the answer is "it looks better", it
  does not animate.
- When the overlay states something about the system, source it from the run's
  record — chrome is the easiest place in the film to make an unbacked claim,
  because nobody thinks of it as content.

## When not to use it

A product whose own surface already narrates its mechanism does not need an
overlay, and adding one duplicates the interface and dates the film against it.
A film whose subject is not the mechanism — an atmosphere piece, a brand film —
does not need one either; the chrome would be answering a question nobody in the
audience is asking. And where the explanation is genuinely narrative rather than
positional — background, consequences, comparisons — it belongs in the
narration, which costs no pixels and no maintenance.
