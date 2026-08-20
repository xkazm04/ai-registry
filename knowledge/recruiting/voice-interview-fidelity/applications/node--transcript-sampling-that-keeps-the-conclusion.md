---
layer: application
type: application
subject: voice-interview-fidelity
technique: transcript-sampling-that-keeps-the-conclusion
stack: node
status: forged
---

# Head+tail sampling on the scoring path

`app/_lib/interview-transcript.ts:3` is a module whose entire header is an
argument for this technique, written after the failure it describes.

## The failure it replaced

The header records what was there before: two bare magic numbers (4000 / 6000)
"applied as silent front-slices, which meant the conclusion of the longest,
richest interviews could be dropped before the scorer ever saw it, with no marker
and no log."

That is the technique's central claim realized as a bug. The same repo's
synthesis prompt calls the closing read-back authoritative; a front slice at a
fixed character budget deletes exactly that exchange, and the corrupted earlier
occurrences of every technology name become the only version the scorer sees. Two
correct mechanisms, silently cancelled by a `.slice(...)`.

## The policy

`buildScorecardNotes` passes the transcript **whole** when it fits
`MAX_SCORECARD_NOTES_CHARS`, and above it keeps the opening and the closing,
dropping the middle and replacing it with an explicit in-band marker — so the
scorer "always sees that it is reading a sampled transcript". Cuts land on turn
boundaries; there is no mid-utterance splice for a model to complete.

The same shape is applied one layer earlier at the persistence boundary:
`capTranscriptTurns` caps at `MAX_TRANSCRIPT_TURNS` with head + one in-band system
turn + tail, "so both the recruiter's transcript modal and the scorer see that
turns were omitted instead of silently reading a front-sliced conversation". The
technique's rule that the persistence cap is the same decision one layer earlier
is implemented, not merely stated.

The header also records the alternatives and why they lost: raising the cap "only
moves the cliff", and summarize-then-score "adds a second, lossy LLM hop on the
gate path". Every consumer routes through the one function, which is what makes
the policy enforceable at all.

## Coverage that means something by its absence

`ScorecardCoverage` is persisted with the scorecard so "a recruiter can tell a
full-transcript score from a head+tail-sampled one", carrying kept turns, total
turns and dropped turns — the sample and its basis travelling with the claim. The
design detail worth copying is the one the comment states outright: *"Only
produced when sampling dropped turns; a complete score carries NO coverage
object, so its absence is the honest 'the scorer read everything' signal."* A
coverage record present on every scorecard, usually saying nothing was dropped,
would be ignored within a week.

## Confirmed and deviating

- **Confirmed** — whole below budget, head+tail above, in-band marker, turn-boundary
  cuts, structured warning on truncation, coverage propagated to the recruiter
  surface, single chokepoint, and the same policy at the persistence cap.
- **Deviation** — the split is symmetric: `headBudget = Math.ceil(budget / 2)` in
  `buildScorecardNotes`, and an even head/tail split in `capTranscriptTurns`. The
  standard asks for a tail-heavier allocation, because the closing material is
  denser in decision-relevant content and a long closing exchange — candidate
  questions, logistics, thanks — can push the read-back back out of a half-budget
  tail window. Symmetric is far better than a front slice and is a defensible
  starting point; it is not the target.
- **Deviation** — nothing anchors the window on the read-back itself. The tail is
  a fixed budget, not a search for the exchange the scoring prompt calls
  authoritative.
- **Deviation** — coverage records what was dropped, but no consumer lowers a
  competency to unassessed on the grounds that its only evidence was in the
  dropped middle. The data needed to do it is present; the rule is not wired.
