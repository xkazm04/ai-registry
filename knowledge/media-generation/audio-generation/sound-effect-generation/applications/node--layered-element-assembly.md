---
layer: application
type: application
subject: sound-effect-generation
technique: layered-element-assembly
status: forged
stack: node
verified_on: 2026-10-14
verified_against: node@24
applied: task
ab_verdict: unmeasurable
---

# Node — every cue is a composite; the assembly primitive comes first

`mage-arena-vr` (branch `master`, 2026-10-14) generates its 20-cue greybox
pack one text per cue, one take per text. The multi-axis cues (a great wave
cresting into a bright burst, a perfect block that is a ring over a
splash, an explosion with embers) each ask one call for weight, definition
and size together. The only repair the tool offers is forcing the whole
cue again, which is exactly the coupled reroll the technique describes.

## What A and B were

- **A**: the seam as it is, one composite per cue, repair by whole-cue
  reroll.
- **B**: the first step of a scoped task, not the full change. A mix
  primitive trims every element take to its own attack, delays and scales
  it, sums without normalising, and hands the result to the existing
  conversion, which peak-normalises. It is covered by the tool's offline
  self-test on synthetic stems. No cue was converted to layers and no
  paid call was made.

## What was read

The seam was chosen to falsify the "aligned at the attack is ordinary mix
work" claim. The tree already trimmed leading silence, but only per
finished cue. Summed untrimmed, a low layer that begins 0.3 s into its
file offsets the whole stack: the test case measures 0.9 s instead of
0.6 s and the shared attack is lost. The technique's rule survived, with
one added step: trim per element first.

## Not measured

Whether layered takes beat the composite is a listening and cost question
the synthetic test cannot answer. Instrument that would: render one cue
(four elements) and its composite, count paid requests to an accepted
take, blind listen. Return when the owner approves a one-cue spend.
