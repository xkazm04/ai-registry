---
layer: technique
type: technique
subject: cinematic-language
technique: genre-visual-contracts
status: forged
laws: [style-is-restated-not-remembered]
shared_with: []
use_when:
  - a brief names a genre or mood and must become an ensemble of concrete choices
  - choosing the register for a piece before lighting and camera decisions
  - mixing two genres without producing mud
  - a stylized piece reads as parody when homage was intended
---

# Genre visual contracts

## The concern

A genre is not one look; it is a **contract across every layer at once**
— lighting family, camera behavior, lens and framing habits, palette and
grade, cutting rhythm, texture-era, and an *imperfection budget* — that
audiences recognize as an ensemble. Naming the genre in a prompt buys a
weak average; invoking the contract's concrete layers buys the look.
The contract is chosen first, because it constrains every other
technique in this subject: noir has already decided your lighting family
before lighting-as-dramatic-instrument tunes it.

## Procedure

1. **Carry the contract as a layer table**, not an adjective. For any
   genre the working row set is: light-source honesty (period-honest
   candle/window → available-light vérité → fully constructed studio) /
   camera intentionality (composed-static → monumental → reactive-late →
   machine-perfect) / lens & framing habits / palette & grade / pace /
   texture-era / **imperfection budget** (grain, shake, flares, focus
   hunting: prized, tolerated, or forbidden). The catalogue of thirteen
   worked contracts with prompt templates lives in this technique's
   dated application — contracts drift with the field; the axes do not.
2. **Prompt the imperfection budget explicitly.** It is the
   least-obvious row and often the one that makes generated footage read
   as the intended register: vérité prizes focus hunting and a smudged
   lens; commercial tabletop forbids noise entirely; period drama wants
   grain and halation around flames. Models default to clean; a register
   whose imperfections go unstated arrives sterile.
3. **Mix genres by layer, never by average.** The stable hybrid pattern:
   iconography, setting and props carry genre A; lighting, grade and
   camera behavior carry genre B; cutting and structure may carry a
   third. A blend requested as "A meets B" in one clause produces the
   average of both, which is neither.
4. **Calibrate commitment: homage versus parody.** Homage is accurate
   grammar carried sincerely at the genre's real intensity range. The
   parody read arises two ways: over-committing one layer past its real
   range (every trope at once, over-cranked grain), or a perfect look
   wrapped around incongruous content. To stay homage: trope density
   low, commitment high. Deliberate parody inverts the dial knowingly —
   and the straightest-faced parody duplicates the look exactly and lets
   content do the comedy.
5. **Restate the contract on every call.** A genre register is a style
   contract under style-is-restated-not-remembered: each clip's prompt
   carries the ensemble rows again, or the batch drifts back to the
   training mean.

## Decision rules

- Genre before dials: pick the contract, then let the other five
  techniques tune within it — never assemble a register bottom-up from
  free-floating style words.
- One contract owns the piece. A second genre enters only through the
  layer-split pattern, with the split stated per layer.
- When the brief has no genre, choose the register consciously anyway
  (naturalism is also a contract — available light, reactive camera,
  muted grade) rather than leaving it to the model's mean.
- Audit stylized output against the intended intensity range: if it
  reads funny and should not, find the over-committed layer and pull it
  back inside the range, rather than de-styling everything.

## Failure modes

- **The named-genre prompt** — "noir style" as one token; the model
  averages the genre into cliché wallpaper.
- **The genre smoothie** — two contracts blended per-clause instead of
  split per-layer; output belongs to neither.
- **The sterile register** — imperfection budget unstated, so vérité
  arrives polished and period drama arrives digital-clean.
- **Accidental parody** — one layer cranked past the genre's real range
  while the rest lag; the audience laughs where it should shiver.
