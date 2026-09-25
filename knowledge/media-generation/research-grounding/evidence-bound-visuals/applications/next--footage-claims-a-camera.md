---
layer: application
type: application
subject: evidence-bound-visuals
technique: footage-claims-a-camera
stack: next
status: forged
applied: experiment
ab_verdict: not-better
proof: structural-only
verified_on: 2026-09-22
verified_against: next@16.3.3
---

# A trailer that cannot reach the register, and the one line that keeps it so

*Verified against the Gravitone studio tree at commit `f65b1f0`, 2026-09-22.
The version is witnessed by the tree's own `package.json` dependency pin.*

The technique says a generated clip in a capture register claims a camera,
a filmer and an event. The studio's trailer path makes a stronger claim
about itself than the technique would allow by default. The shot compiler's
header says, of trailer plates:

> `app/_phases/frames/shotPrompt.ts:59` "A trailer shot asserts nothing a viewer can check."

That sentence is exactly what this technique can falsify. A trailer plate in
a phone's register, showing a photoreal event, asserts a great deal that a
viewer would check. So the seam was chosen to kill the sentence, not to
confirm the technique: a caught outcome — any compiled prompt reaching a
capture register over photoreal subject matter — would have made the
header false and made the technique's labelling rule a change this tree
owes.

## The experiment

Arm A is the tree as it stands. Every prompt literal of three words or more
in the three files that compile a plate prompt — the trailer shot compiler,
the six style presets, and the style compiler — was extracted and scanned
against a capture-register lexicon (handheld, phone, selfie, found footage,
amateur, dashcam, doorbell, filmed by, shaky, auto-exposure, film grain,
compression artefacts, documentary, behind the camera, off-screen voice)
and a photoreal lexicon. The scanner asserted itself first: a positive
control paraphrasing the source's own ranking brief was caught on three
register terms and one photoreal term, and a negative control (a vector
preset's technique line) was caught on neither.

| file | literals | register hits | photoreal hits |
| --- | --- | --- | --- |
| trailer shot compiler | 37 | 0 | 0 |
| style presets | 33 | 0 | 2 |
| style compiler | 12 | 0 | 1 |

**0 of 82 literals carry a capture register.** The three photoreal hits
are the reason why:

> `lib/stylePrompt.ts:50` "photorealistic, photograph, 3D render, gradient, glow, bevel, drop shadow, noise texture, "

The photoreal term sits in the negative prompt, which every plate carries.
The other two hits are one stylised collage preset:

> `app/library/presets.ts:92` "paper collage — grayscale photographic cutouts on flat colour fields"

Photographic material inside a declared collage is a produced register
and not a captured one, which is the technique's own "when not to use"
boundary. The preset's grain is a declared finish, not concealment:

> `app/library/presets.ts:99` "paper grain, hard offset shadows, halftone at 30%"

## Verdict: not-better, because the precondition is absent by construction

Target: compiled prompts that reach the capture register over photoreal
subject matter, each of which the technique would route to a label or a
re-brief. Floor: no change to what the studio renders. The target is
already zero, so applying the technique moves nothing. The header's
sentence holds.

The structural fact is the useful half. **The sentence is true because of
one line, not because of the genre.** A trailer is not claim-free by
nature — the technique's whole argument is that a register can make a claim
with no text at all. This trailer is claim-free because the style compiler
welds a photoreal exclusion into every call, and because the preset
library offers only stylised techniques. The header credits the genre for
something the negative prompt does. Two conditions would reverse the
verdict, and both are cheap to trip:

- **A photoreal preset.** The style library is the one place the register
  could enter. A preset built from a sample (the onboarding path in
  `visual-style-locking`) whose technique is photographic would remove the
  exclusion's reason to exist.
- **A vendor that takes no negative prompt.** The negative prompt's own
  comment says one adapter folds it into an exclusion clause instead
  (`lib/stylePrompt.ts:46` "Leonardo does; Google does not"). An exclusion clause is a request, and a
  request the model does not honour leaves the register reachable with no
  code change at all.

## What this realization cannot do

It scans literals, not the operator. The studio's subject text is derived
from a recipe table rather than typed per shot, which is why a literal scan
covers the trailer path. A product that accepts a free-text prompt — the
common case for a marketing image tool — puts the register in the user's
hands at brief time, and no literal scan sees it. There the technique's
brief-time rule needs a check on the submitted prompt, not on the source.

**Return condition:** re-run when a photoreal preset lands, or when a
video adapter without a negative prompt reaches a provider.
