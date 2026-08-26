---
layer: technique
type: technique
subject: generated-music-acceptance
technique: generated-audio-defect-taxonomy
status: forged
laws: [cost-per-usable-output, edit-do-not-regenerate]
shared_with: []
use_when: [a generated track fails and nobody can say how, deciding whether to repair a take or re-render a section or reroll, the same failure keeps recurring across takes, pricing what usable audio actually costs]
---

# Generated-audio defect taxonomy

"It sounds off" is not a verdict anyone can act on. Generated audio fails
in characteristic, nameable ways, and the name does two jobs: it routes
the remedy — repair, section re-render, or condemn — and it accumulates
into the production's real economics, because cost per usable output is
only computable when failures are classified enough to price. An
acceptance record that classifies its fails also teaches the brief: several
defects have brief-side causes, and the taxonomy is where the pattern
becomes visible.

## The classes

| Defect | What it sounds like | Typical cause | Remedy |
|---|---|---|---|
| **Smeared transients** | drums without edges, mush where attack should be | model limitation, dense arrangement briefed | thin the arrangement in the brief and re-render; not post-repairable |
| **Vocal garble** | syllables melt, words invented mid-line | lyric density at tempo, rare words | cut syllables, re-render the section (the singability craft owns prevention) |
| **Section bleed** | chorus elements leak into the verse before it | weak section separation in the plan | raise the sections' contrast in styles; re-render the boundary section |
| **Tempo instability** | the grid drifts, a bar hiccups | long takes, rubato-adjacent styles | re-render; condemn if picture-locked accents depend on the grid |
| **Broken ending** | abrupt stop that was not briefed, or a fade where a hard out was | ending shape left unstated | state the ending in the brief; re-render the final section only |
| **Loop seam** | audible joint when material repeats | loop intent not declared | regenerate with loop intent declared; a post crossfade is the fallback repair |
| **Spectral hole / imbalance** | no low end, harsh 3–5k, hollow mids | model tendency per style | post EQ is a legitimate repair; re-render if structural |
| **Phase / width artifacts** | swimmy stereo, vanishes in mono | model tendency | check the mono fold-down; post repair rarely holds — re-render |
| **The confident hallucination** | an instrument or voice nobody briefed, mixed as if intended | underspecified brief, empty exclude list | extend the exclude list; re-render |

## Routing: repair, re-render, condemn

The remedy column is the point, and it obeys the bundle's edit law in
audio-specific form:

- **Repair in post** (EQ, a crossfade, a trim) when the defect is
  spectral or at an edge — repairs are cheap, reviewable, and leave the
  reviewed material otherwise intact.
- **Re-render the failing section** when the defect is localized and the
  brief was plan-shaped — this is the smallest generation-side operation,
  and it is only available because the plan made sections addressable.
- **Condemn the take** when the defect is global (tempo instability,
  pervasive smear) — and record *what* condemned it, because a condemned
  take with a classified cause improves the next brief, and one without
  is pure spend.

The wrong routing is the expensive one in both directions: post-repairing
a structural defect buys an audible scar and the defect back next take,
while re-rolling a whole piece for an EQ-shaped problem voids review
capital a filter would have preserved.

## The recurrence rule

A defect class that appears in consecutive takes from the same brief has
stopped being generation noise and become a property of the brief–model
pair. Stop re-rolling: the same request will keep buying the same defect.
Change the brief along the causal axis the class names, or route the cue
to different tooling, and record the pair — the accumulating record of
which styles buy which defects is the production's own, portable, and
worth more than any one cue.

## When not to use this

Taste is not a defect: "I wanted it sadder" routes to the brief and the
conformance listen, not the taxonomy. And do not taxonomize exploration
noise — candidates thrown off during identity search fail freely and
uninterestingly; classification starts when takes are being paid for
against a committed brief.
