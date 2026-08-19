---
layer: technique
type: technique
subject: frame-direction
technique: visual-function-vocabulary
status: forged
laws: [output-never-outruns-evidence, causality-over-sequence]
shared_with: []
use_when: [assigning what each beat's picture must do, designing a script-to-frames handoff schema, deciding whether a video is image-led or narration-led]
---

# Visual function vocabulary

Label every beat with what its picture **does**, drawn from a closed
vocabulary of functions — before anyone decides what the picture depicts. The
function is the obligation handed downstream; the depiction is downstream's
freedom. A vocabulary of functions is what lets a script step direct without
describing appearance, and what lets budgets and derived properties be
computed over a cut before a single frame exists.

## The admission test for a function

A candidate function earns a place in the vocabulary only if labelling a beat
with it **changes what the rendering step must produce**. A category that does
not change the downstream obligation is description, not design, and is cut.
This test is the whole discipline: it keeps the vocabulary small, closed, and
enforceable.

A working seven-function vocabulary that passes the test:

| Function | The picture's job | Removing it costs |
|---|---|---|
| **evidence** | the picture *is* the proof — a document, a series, a photograph | the claim degrades to assertion |
| **comparison** | two quantities or states side by side so the relation is *seen* | the number stays abstract |
| **mechanism** | a process with parts, drawn so the viewer can follow it | the viewer is told a verdict instead of shown a derivation |
| **metaphor** | a physical stand-in for an abstraction | the abstraction stays abstract |
| **reveal** | the picture withholds, then delivers; the turn is *seen* | the reversal lands only in the voice |
| **state-change** | the *same* picture, modified — imposes continuity downstream | the change reads as a new subject |
| **texture** | the picture is not arguing; it holds the screen | nothing — and saying so is the value |

Mechanism and metaphor are kept distinct deliberately: a mechanism diagram is
built from the *subject's real parts*, a metaphor from something else
entirely. They cost different work and they fail differently; folding one
into the other loses the distinction that matters most in production.

## Modifiers, not new functions

Rhetorical properties ride as flags on a function rather than becoming
functions themselves. An absence ("the reserve that isn't there") is
evidence-shaped — you show the empty ledger, the unfilled column — so it is
`evidence` with a `negates` flag, not a top-level "absence" function. A
generously-drawn opposing view is `evidence` with a `generous` flag: if the
chart for the position you are about to overturn looks foolish, the turn is
unearned — a strawman picture produces a strawman argument. Flags earn their
place the same way functions do: an absence is the visual most likely to be
silently dropped by a downstream step that cannot render it, so it must be
marked.

## Texture carries a mandatory sub-role

Texture is the function that would otherwise become a dumping ground, so it
requires a sub-role, and the sub-roles are not interchangeable:

- **hold** — *do not change the picture.* A negative instruction and a real
  one: the most important sentences in a cut are often best served by a frame
  on which nothing competes.
- **navigation** — where the viewer is in the structure; the act architecture
  made visible.
- **atmosphere** — persona, digression, b-roll. The only sub-role with a
  budget (a ceiling around a tenth of the beats), because it is the one that
  grows unbounded when unpriced.

**The anti-shape: texture as a default.** A generator that assigns
atmosphere to any beat it cannot picture produces stock footage, silently.
Texture must be *chosen*; a beat with no picture and no choice is recorded as
unresolved — a state that demands an answer — never as texture.

## What the function mix buys you

Because functions are machine-readable, video-level properties stop being
opinions and become derivations:

- **Image-led vs narration-led** is computed, not chosen: the fraction of
  beats whose function is load-bearing (everything except texture) determines
  the mode, and the mode constrains the word budget per beat. A property
  decided by the material should be computed and shown, not offered as a dial.
- **Budgets become enforceable.** A cap on metaphor visuals can only be
  checked by something that can see every beat's function; a renderer working
  one beat at a time cannot. The cap counts metaphor *visuals*, not verbal
  analogies — a beat with no spoken analogy whose picture is a metaphor has
  spent from the same budget.
- **Confidence caps rendering.** For evidence and comparison beats, the
  assigned confidence may not exceed the weakest fact the picture rests on,
  and it travels with the function so the drawing can honour it — a diagram
  must not look more settled than its source.

## When not to use this

Do not extend the vocabulary casually — every addition must pass the
admission test, and a vocabulary that grows toward one-function-per-beat-kind
has become the template failure wearing a schema. And do not push the
vocabulary downstream of its purpose: functions constrain *what the picture
must do*, never shot size, palette, or composition. A function statement that
has grown appearance adjectives is a generation prompt in disguise and will
not survive a change of rendering model.
