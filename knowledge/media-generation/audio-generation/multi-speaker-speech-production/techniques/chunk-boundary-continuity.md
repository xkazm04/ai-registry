---
layer: technique
type: technique
subject: multi-speaker-speech-production
technique: chunk-boundary-continuity
status: forged
laws: [unmeasured-is-not-pass, output-never-outruns-evidence]
shared_with: []
use_when: [a script exceeds the engine's character limit for one generation, a long read has an audible change of energy at a join, choosing where to cut a script, joining rendered pieces of one scene]
---

# Chunk-boundary continuity

Every engine caps the characters in one generation. The cap differs by engine
generation (a newer generation's limit may be double the previous one's, and a
fast, low-latency engine's much larger), so it is a value read from the engine's
current model list, pinned in the production's configuration and re-read on an
engine change; it is never a constant in the script tooling. When the script is
longer than the cap it is cut, and the cut is where synthetic long-form audio
betrays itself: energy resets, breath and room tone jump, and a sentence begins
as though the speaker had never said anything before.

## Rules for the cut

- **Cut at speaker turns.** A turn boundary is already a change of voice, so a
  small discontinuity there is expected and masked. If a single turn is longer
  than the cap, cut it at a paragraph, then a sentence boundary. Never cut
  inside a sentence; a clause split across two generations gets two independent
  intonation contours and no listener can fix that in the edit.
- **Cut short of the limit.** Leave headroom (a fifth of the cap is a working
  figure, not a measured one) so a lexicon expansion or a direction tag added
  later does not push a chunk over and force a re-cut, which re-renders lines
  that had been accepted.
- **Keep the cut points stable.** A cut computed from the text is recomputed
  when the text changes, moving every later cut. Anchor chunks to line
  addresses so that a revision changes one chunk and not the tail of the script.

## Carry context; do not re-prime

Engines that support it accept the text that came before, the text that follows
and the identifiers of previously generated samples as continuity input for a
new generation. Using these is the engine's own continuity mechanism: the
model conditions the read on what surrounds it. Three rules:

1. **Pass preceding text**, and following text where the engine takes it, on
   every chunk after the first. The following-context input matters most when
   regenerating a middle chunk, because the accepted successor is already on
   disk and the new take must land into it.
2. **Prefer the engine's continuity mechanism over re-priming.** Re-priming
   means pasting the previous chunk's last sentences into the new text and
   trimming the audio afterwards. It spends characters against the cap, voices
   text twice, and the trim point is a guess. Context inputs give the
   conditioning without the duplicate speech.
3. **Treat the continuity mechanism as bounded and perishable.** It accepts a
   small fixed number of prior samples; it depends on the engine keeping request
   history, so a zero-retention or privacy mode disables it; and support varies
   by engine generation. Each of those is a fact to read from the current
   documentation for the engine actually in use, and a production run in a
   privacy mode gets no continuity from it. Verify by listening: unsupported
   context inputs may be ignored without error.

Concatenating independently rendered files is not continuity. It is the
absence of it, and a gap or crossfade cannot restore a shared contour.

## Audit the seam, not the chunk

Each chunk can pass every check in isolation and the join still fail, because a
seam defect exists only across two clips. The audit unit is a **window** of a
few seconds on each side of every join:

- Assemble the window from the accepted clips as delivered, not from a fresh
  render, and play it as one piece.
- Listen for four things: level and tone change, breath or room-tone jump,
  a pause length that is neither the script's nor natural, and a sentence
  opening that ignores what preceded it.
- Include the seams in the listening board as their own items
  ([listening-board](../../generated-speech-acceptance/techniques/listening-board.md)),
  so a listener decides on the seam and not on the two chunk scores.
- Report seams checked against seams present. A production with forty joins and
  eight audited is unmeasured on thirty-two
  ([unmeasured-is-not-pass](../../../_laws.md#unmeasured-is-not-pass)); do not
  describe it as passed.

## Decision rules

- The script fits the cap: one generation per line, no chunking, no seam audit
  beyond turn boundaries.
- A turn exceeds the cap: cut at sentences, pass context, audit each seam.
- The seam audit fails: try more context (following text, an extra prior sample),
  then a different cut point, then a different engine setting, in that order;
  re-render the neighbouring chunk rather than editing audio, and do not paper
  over a bad contour with a crossfade.
- The engine has no continuity mechanism: cut only at turns, accept a visible
  reset there, and say so in the record; do not fake continuity by re-priming.

## When not to use it

A scene of short lines, each spoken by different voices and each under the cap,
never meets this problem and only needs the line addressing in the sibling
technique. Real-time streaming of a reply chunks for latency, a runtime concern
owned elsewhere; the forces here are offline and the seam is audited by a person.
