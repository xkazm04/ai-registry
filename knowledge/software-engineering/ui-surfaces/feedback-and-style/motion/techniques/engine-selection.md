---
layer: technique
type: technique
subject: motion
technique: engine-selection
status: forged
laws: []
shared_with: []
use_when: [choosing the engine for each gesture, deciding whether a gesture can be interrupted mid-flight, entrances stop playing with nothing erroring, a gesture is getting too complex to keep writing in code]
---

# Engine selection

Every gesture in the vocabulary runs on one of four engines: the style
layer's **declarative keyframes**, a **scripted frame loop** you own, an
**animation library** someone else owns, or an **authored timeline played
back as data** that no one writes in code at all. Teams usually compare
them on expressiveness. The comparison that decides architectures is
different: **who owns the gesture, what can turn it off, and what happens
when it is interrupted.**

## The ownership question

For every preset, the system must be able to answer: *what runs this, and
what can disable it?* The four engines answer very differently.

**Declarative keyframes** are owned by the platform. Nothing in application
code can globally disable them short of an explicit universal style rule —
which is grep-visible, reviewable, and yours. They run off the main thread
for compositor-friendly properties, cost nothing when idle, and survive
scripting stalls. Their limits: interruption is crude (a keyframe animation
cannot be smoothly retargeted mid-flight; restarting it snaps), and they
cannot react to values computed per frame.

**A scripted frame loop you own** is owned by you, entirely. Every line
between the clock tick and the style write is in your tree; there is no
upstream default to change under you. It buys real interruption — springs
retarget from current position *and velocity*, so a gesture redirected
mid-flight bends instead of snapping — at the price that every performance
mistake is now available to you (see
[performance-discipline](./performance-discipline.md)) and the engine is code
you maintain.

**An animation library** trades ownership for expressiveness. The hazard
worth naming is not bundle size; it is **global configuration as a silent
kill switch**. Motion libraries commonly expose a provider- or context-level
setting that reduces or disables animation for an entire subtree —
genuinely useful, and precisely the risk: one ancestor, one changed default
in an upgrade, one well-meaning "reduce motion here" wrapper, and every
reveal beneath it stops playing. Nothing errors. Nothing logs. Entrances
simply never happen, and the absence is discovered by a person, not a test
— animation presence is the kind of thing almost no suite asserts. A
library-run vocabulary must treat that switch as part of its threat model:
know it exists, know every place it is set, and decide deliberately whether
any code outside the motion system may touch it.

The scoping of such switches cuts both ways. Every global switch —
library-level, stylesheet-level — governs only its own engine: the
library's reduce setting does not touch platform keyframes, and a
universal stylesheet reset does not reach scripted frame writes. That
asymmetry is a coverage gap when you forget it and an escape hatch when
you need it: a gesture that must survive an aggressive global switch can
be moved to the engine the switch cannot see. Using the hatch is
legitimate — *provided the move is documented at the preset*, with its own
reduction story intact, or the escape quietly becomes an accessibility
hole (the coverage discipline is
[reduced-motion-mechanics](./reduced-motion-mechanics.md)).

**An authored timeline played back as data** inverts every answer above.
The gesture is not written in code at all: it is built in a motion-design
tool, exported as a document of keyframes (or as rendered footage), and
shipped as an asset that a small runtime plays. Ownership moves to whoever
owns the source file — which is usually the designer, and which is the
point. Nothing in the product can retune it, no global switch reduces it
because it is not animation as far as the platform is concerned, and its
reduced-motion story must be authored as a **second exported variant** or
it has none. Its cost is fixed and front-loaded: an asset to download and
decode, versioned outside the code review that catches everything else.

## The interruption story

Interruption is the sharpest *behavioral* difference and worth choosing on:

- A user closes a panel that is still opening. Keyframes: the close either
  waits or snaps. A spring: the panel reverses from exactly where it is, at
  the velocity it had, and the interruption reads as physical.
- A value being animated changes again mid-animation. Declarative
  transitions handle simple retargets acceptably; anything choreographed
  needs script.

The honest rule: **interruption-heavy, user-steered motion earns a scripted
engine; fire-and-forget gestures do not.** An entrance, a success settle, a
one-shot reveal is born, plays, and dies — nothing retargets it. Spending a
scripted spring on a gesture that is never interrupted buys nothing and
costs main-thread frames.

## The line where code stops paying

The fourth engine exists because the first three stop being the cheaper
option at a knowable point, and teams pass it without noticing — a gesture
that "just needs a few more keyframes" becomes a thousand-line choreography
module maintained by whoever touched it last. Three shapes are past the
line: **character movement** (anything that reads as a body moving rather
than a property changing), **shape morphing** between forms that are not
interpolations of each other, and **many-layer set pieces** where a dozen
elements are timed against each other to the frame.

The discriminator is one question, and it is not about complexity:

> **Does this gesture have to respond to input while it is running?**

If it does, it must be code, because an exported timeline can only be
scrubbed or played — it cannot recompute itself against a value that did not
exist when it was authored. That is precisely the strength of the first
three engines, and it is why the expensive scripted machinery is worth
maintaining for drags, cursor-linked motion and retargetable springs.

If it does not — if the gesture plays the same way every time — then
complexity is no longer an argument for code. It is an argument against it.
An exported timeline is authored where the craft is, reviewed by looking at
it, and costs the product a decoder rather than a maintainer. Rebuilding it
in code buys nothing but ownership of a thing nobody on the team wants to
own.

The trap worth naming: a gesture past the line usually **does** have a
trigger, and a trigger is not an input. Playing a set piece when a step
completes is still fire-and-forget. Only motion that must read a changing
value *during* playback is disqualified from export.

## A default worth defending

A defensible allocation for a product-sized vocabulary:

- **Presets run on declarative keyframes** — fire-and-forget by nature,
  platform-owned, immune to any library's global switch, and off-thread for
  free. The vocabulary's availability then depends on nothing installable.
- **One shared scripted engine** exists for the genuinely continuous cases:
  physics-feeling drags, retargetable springs, values that must be computed
  per frame. One engine, not one per component.
- **A full animation library is adopted only when** the scripted needs
  outgrow what a small owned engine can carry — and its global switches are
  then inventoried and fenced on day one.
- **Exported timelines carry the set pieces**, and are inventoried like any
  other asset: each one paired with its reduced variant, and each one
  answerable for why it is not code.

Mixed engines are fine; *unknown* ownership is not. The failure mode this
technique exists to prevent is discovering, in production, that your motion
vocabulary had an off switch you never installed and someone flipped it.
