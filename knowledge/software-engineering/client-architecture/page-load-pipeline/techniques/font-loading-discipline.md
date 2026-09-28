---
layer: technique
type: technique
subject: page-load-pipeline
technique: font-loading-discipline
status: forged
laws: []
shared_with: []
use_when: [adding a web font family or weight, text flashes invisible or reflows when a font arrives, loading fonts for several writing systems or locales]
---

# Font loading discipline

A web font is not render-blocking in the way a stylesheet is. The page paints
without it; what the font holds back is **text**. Until the font arrives, the
browser must do one of three things with every run of text that uses it: draw
nothing, draw a fallback it will replace, or draw a fallback it will keep. Each
choice has a failure — invisible text, a visible reflow when the font swaps in,
or a design that never shows its intended face — and the page does not get to
avoid all three. It chooses which one to risk, and then shrinks the window in
which the risk can happen.

The font's *declarations* are another matter. A font stylesheet in the head is
a render-blocking stylesheet like any other, and when it is served from a
foreign origin it puts a connection and a handshake on the critical path before
any text can be laid out. Much of what is called font performance is that
stylesheet, not the font files.

## The display strategy is a chosen failure

The display descriptor sets two periods: a **block** period in which text is
drawn invisibly, and a **swap** period in which a fallback is drawn and replaced
if the font arrives.

- **Block** — invisible for up to a few seconds, then swap whenever it arrives.
  For a face without which the text is unreadable, such as an icon font. Almost
  never right for body text.
- **Swap** — no block period; fallback at once, replaced whenever the font
  arrives. Text is never invisible, and every late arrival is a reflow. Right
  when the face matters and the fallback is metric-matched.
- **Fallback** — a very short block, a few seconds of swap, then the fallback
  stays. A compromise that bounds the late reflow.
- **Optional** — a very short block and no swap: the font is used only if it is
  already available almost immediately, typically from cache on a repeat visit.
  No reflow from fonts at all, at the price of first visits often showing the
  fallback.

Pick per family, with the reason written beside it. A brand display face in a
headline and a body face in paragraphs have different answers.

## Shrink the window

- **Count families and weights as a budget.** Every weight is a file. Two
  families in three weights is six requests on a cold visit; a variable font can
  collapse a range of weights into one file. A family added for one heading is a
  cost every page pays.
- **Subset to the content.** Split a face by character range and declare the
  range, so the browser downloads a subset only when the page contains a
  character in it. A face that covers several writing systems should never
  arrive whole to a reader using one of them.
- **Use the most compressed web font format** and drop older formats that no
  supported browser needs.
- **Serve declarations from the document's origin.** Inline the face
  declarations or serve them same-origin, so the text does not wait on a
  foreign stylesheet. Self-hosting the files is not automatically faster —
  a well-provisioned font host can beat a poorly provisioned origin — so the
  decision is measured; what is not negotiable is that a foreign font
  stylesheet on the critical path has its connections warmed, one for the
  stylesheet origin and one, in anonymous cross-origin mode, for the file origin.
- **Preload sparingly.** Preloading a font file gets it early but bypasses the
  range negotiation that subsetting depends on; preload only the one file the
  first screen certainly uses, never a range-split family.

## Match the fallback's metrics

The reflow on swap happens because the fallback and the web font disagree about
glyph widths, ascent, descent and line gap. Face declarations can override the
fallback's size and vertical metrics so that it occupies nearly the same space;
with a matched fallback, a swap changes the glyph shapes and moves almost
nothing. This is what makes the swap strategy compatible with
[layout-stability-by-reservation](./layout-stability-by-reservation.md), and it
is the step most often skipped.

## Decision rules

- Choose the display strategy per family and write the reason; default body
  text to swap with a matched fallback, or to optional where the face is not
  essential.
- Budget families and weights; when adding one, name what it replaces or why the
  page may pay for it everywhere.
- Split any multi-script face by character range; never load a writing system's
  glyphs for a page that does not contain them.
- Keep font declarations off foreign origins on the critical path; when they
  cannot move, warm both connections.
- Preload at most the one font file the first screen certainly draws.

## When not to use this

- **System font stacks.** A page set in the platform's own faces has no font
  loading to discipline.
- **Packaged shells.** Fonts bundled with the application load from disk; the
  display strategy still matters on a cold start, the origin rules do not.

## How to test for the property

- Load each key route cold with font requests delayed and measure layout shift
  when they arrive: with matched fallbacks it stays near zero.
- Count font requests on a page in one writing system and assert none are for
  another system's subsets.
- Assert no font stylesheet from a foreign origin blocks the first render
  without warmed connections to both origins.
