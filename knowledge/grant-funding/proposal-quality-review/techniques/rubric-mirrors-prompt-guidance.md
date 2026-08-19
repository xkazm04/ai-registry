---
layer: technique
type: technique
subject: proposal-quality-review
technique: rubric-mirrors-prompt-guidance
status: forged
laws: [the-funder-sets-the-form]
shared_with: []
use_when: [building a critic for machine-generated drafts, generation guidance and review checks disagree, adding a new funder-family section type to a drafting pipeline]
---

# Rubric mirrors prompt guidance

When the text under review was generated from an instruction, the review
rubric and the instruction are two projections of one standard — and they
must be maintained as one. The generator is told "400–600 words, quantify
the need, avoid 'leverage', plain prose, no headings"; the critic must check
word band, quantification, the banned term, prose shape, and leading
headings — the same list, per section type. Any divergence manufactures one
of two defects: a draft that follows its instructions and fails review (the
pipeline punishes obedience), or a draft that ignores its instructions and
passes (the review certifies drift).

## The mirror is per section, per funder family

[The funder sets the form](../../_laws.md#the-funder-sets-the-form), so both
projections vary together along the funder-family axis. The rubric map is a
keyed table: section type → gate list, where each entry mirrors that
section's generation guidance:

- A research funder's *excellence* section is prompted toward objectives,
  methodology, and state-of-the-art positioning — so its rubric checks that
  those concepts appear.
- A federal *need* section is prompted toward evidence — so its rubric
  requires a figure, because that is how federal reviewers score need.
- An arts *artistic-quality* section is prompted to name the actual work and
  artists, not adjectives — so its rubric checks for work-naming vocabulary
  and bans the superlative filler arts panels see most.
- An organizing *strategy* section is prompted toward theory of change,
  tactics, and targets — and checked for exactly those.

Concept checks at this layer are deliberately shallow keyword-presence
tests: they assert the section *engages* its required dimensions, not that it
argues them well. That modesty is correct — deeper judgment belongs to the
human tier, and a shallow check that pretends to depth is a score nobody
should trust.

Alongside the per-section mirror sits a universal floor every section gets
regardless of type: non-empty, no meta-narration, no leading self-heading,
no table where prose was asked for, real prose rather than a refusal. These
mirror the universal clauses of every generation instruction ("output only
the section text").

## Keeping the mirror true

- **Single source of truth where possible.** Derive both projections from
  one table — targets, bands, banned terms, required concepts as data; the
  prompt renders it as guidance, the critic renders it as gates. Where the
  codebases genuinely cannot share, a comment in each naming the other and a
  fixture test that fails on divergence is the minimum.
- **Widen, don't copy, the numeric tolerances.** The one sanctioned
  asymmetry: the critic's word band is wider than the prompt's stated target
  so only genuinely off-length output fires (steer with the target, catch
  with the band).
- **Unknown section types get the universal floor plus a generous default**,
  never a guess at a specific rubric. A wrong specific rubric on a new
  section type fails obedient drafts on day one.
- **Every parallel reviewing surface inherits the same map.** If a separate
  proofreading pass also measures these sections, it reads the same bounds —
  a second independently tuned table recreates the divergence this technique
  exists to kill.
- **When guidance changes, the change lands in the table first**, and both
  projections update in the same change. A prompt edited in place while the
  rubric sleeps is the standard drift path.

## When not to use it

The mirror applies to machine-generated drafts. For purely human-written
text there is no prompt to mirror — the rubric derives directly from the
funder family's published scoring dimensions, and "guidance drift" findings
(banned-term usage, band misses) soften toward advisory, because the human
never agreed to the instruction. And do not mirror *everything*: instructions
that exist to shape model behavior ("do not apologize", "output no
commentary") are checked by the universal floor, not duplicated per section.
