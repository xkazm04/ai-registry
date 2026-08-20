---
layer: technique
type: technique
subject: generated-mesh-acceptance
technique: structural-scorecard
status: forged
laws: [structural-proof-is-never-sufficient, unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [building an automated geometry gate, choosing fail versus warn thresholds, turning mesh metrics into a routable verdict]
---

# Structural scorecard

A deterministic, model-free function from mesh metrics to a verdict, a finding list and a
score. Pure: same metrics in, same card out, no network, no cost, no randomness. It is the
cheapest tier of asset acceptance and the one every other tier stacks on.

## The shape of the card

- `verdict` — `fail` | `warn` | `pass`. Derived, never assigned: fail if any finding is
  fail-severity, else warn if any finding is warn-severity, else pass.
- `findings` — the primary payload: an ordered list, each entry a defect code, a severity,
  and one human-readable line.
- `score` — a scalar for sorting and dashboards, derived from the findings.
- Per-property grades that are absent when their input was absent (a requested budget, a
  requested world size). Absence is a missing key, not a satisfied one.
- The metrics themselves, so a consumer can re-derive the verdict and see what it was
  computed on.

Emit findings **fails first, then warns**, and make the human lines byte-identical to the
lines in any legacy display list you also carry. Two orderings of the same content is how
consumers start disagreeing about which defect drove a verdict.

## Procedure

1. **Extract metrics with a separate tool from the one that scores.** The producer of a
   mesh may not be the authority that passes it, and the same separation applies inside the
   gate: a geometry library emits counts, the scorer never touches the file.
2. **Run the existence checks first.** Below a minimum vertex count, or zero faces: fail,
   empty mesh. Any bounding-box extent below a tiny epsilon: fail, degenerate box. These
   two dominate everything else and are the only classes where a fresh generation roll is a
   rational response.
3. **Grade component structure** by face share, never by count — see the face-share rule.
   Specks above a tolerance are a fail; specks below it are a warn; substantial parts above
   the class part budget are a *separate* fail. When no per-component histogram exists,
   fall back to the blunt count rule unchanged: do not silently loosen a rule on old data
   just because the better rule is unavailable.
4. **Grade the well-formedness properties as warns**: not watertight, inconsistent winding,
   degenerate faces present. Each of these breaks something specific downstream and none of
   them prevents import.
5. **Grade density as a warn.** High face count needs decimation for engine use; it is not
   a defect. Resist every request to make this a fail.
6. **Grade the two request-relative properties** — delivered faces against the budget that
   was *asked for*, delivered longest extent against the world size that was *asked for* —
   and only when those requests exist.
7. **Derive verdict and score.** A workable default: `100 − 50·fails − 15·warns`, clamped
   to `[0, 100]`. The constants are not physics; what matters is that a single fail cannot
   be out-voted by clean lines elsewhere.

## Decision rules

- **When a downstream stage resolves the defect as a matter of course, it is a warn.** When
  no stage resolves it and it breaks import, rigging or rendering, it is a fail. This is
  the whole fail/warn test; do not add a severity axis for "how bad it looks".
- **When two defects have different remedies, they get different codes**, even if they are
  measured from the same input. A too-many-parts fail and a too-much-debris fail come from
  one histogram and must never be one line.
- **When a threshold varies by asset class, take it as a parameter with a documented
  default set.** A part budget of 8 and a speck tolerance of 4 are sane starting points for
  characters; a prop wants different ones. Hardcode nothing that a class would want to
  move.
- **When a request-relative grade has no request, omit it.** A card that shows a satisfied
  budget for a mesh nobody gave a budget to is asserting compliance with a rule that does
  not exist. Silence about a budget must never read as compliance with one.
- **When the class ceiling and the requested budget disagree, report both.** A delivery can
  sit comfortably under the class ceiling while being well over what was actually asked
  for; only the request-relative grade can say so, and it is the one that catches a
  generator quietly ignoring a low-density request.
- **When you are tempted to fold in a fitness-for-a-later-job check, don't.** Health and
  suitability are separate axes on the same card.

## Calibrate against a real corpus, not against intuition

Before shipping thresholds, run the scorer over every mesh you actually have and read the
distribution of *which code drove each fail*. Gates acquire folklore fast — a caveat
printed beside every rejection naming a mechanism that does not exist in the code beside
it is a real and common failure. A corpus run tells you the true rejection rate and the
true dominant defect class, and it is normal for both to differ sharply from the story
everyone tells about the gate. Re-run it whenever a threshold moves, and record whether
the change moved any verdict at all; a threshold change that moves zero verdicts is a
change to nothing.

## When not to use this

- **As a quality signal.** It is structural. A perfect card is compatible with a formless
  result, and a perceptual tier over rendered views is a separate rung.
- **As a stand-alone accept decision for a hero asset.** Use it as the cheap filter that
  stops broken geometry before anything expensive looks at it.
- **On a mesh whose stage you do not know**, without saying so. The card is still valid;
  the *interpretation* of a density warn or a part-budget fail is not, and the reader needs
  to be told.
- **As a shared shape for gates whose defects have no place in its taxonomy.** Borrowing
  the verdict/score/reasons envelope for, say, an image critic is fine; filling the code
  field with invented values is not.
