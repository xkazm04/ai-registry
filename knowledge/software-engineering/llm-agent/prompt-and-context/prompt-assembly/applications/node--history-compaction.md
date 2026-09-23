---
layer: application
type: application
subject: prompt-assembly
technique: history-compaction
stack: node
verified_on: 2026-09-05
verified_against: node@24
applied: simulation
ab_verdict: not-better
proof: structural-only
---

# A voice-intake thread with a turn cap and nothing to elide

A self-hostable hiring workspace whose voice intake runs a fast thread: a
transport delivers one transcribed utterance, the engine produces the next
spoken reply, and the exchange persists before the reply is handed back to be
spoken. Version witness `engines.node >=24 <25` (`package.json:11-13`) and the
CI's `node-version: 24`. The tree is a client-held, stateless seam: the whole
transcript window is rendered into every prompt.

This application tests the technique's two 2026-09-05 amendments, the
lossless lane's lower trigger and the provider-anchored count, against a seam
class they were not written from.

## Three cases from the tree, under both policies

Policy A is the tree as it stands. Policy B applies the amended technique: a
lower trigger for an elision lane ahead of the lossy step, and a count
anchored on the provider's last reported input.

1. **The cap is the whole ladder.** `capTranscript`
   (`app/_lib/intake-transcript.ts:14-40`) keeps the newest 48 turns and, when
   anything was dropped, one leading system turn carrying the running count
   of dropped turns, absorbed idempotently on the next cap. The 48 is derived
   from the engine's own render window and pinned equal to it so the brief's
   turn citations stay aligned (`intake-run.ts:45-58`). Under B the elision
   lane would look for re-fetchable bulk to point at and find none: the
   transcript is utterances, which have no source to re-fetch, and the fast
   thread carries no tool results. The lane fires on nothing; the cap with its
   announced drop count is already the notice rung the budgeting ladder
   demands. Prediction: no change in bytes or behaviour; falsifier: a turn
   whose content is re-fetchable (an attachment quoted into the transcript).
2. **The rolling summary lives off the fast path.** The brief is extracted by
   a periodic thread that runs *without* turns (`voice-complete` route,
   `:15`, `:65`), not by the turn that speaks, so the lossy step is already
   amortized and never stalls a spoken reply. Under B the lower trigger would
   place elision ahead of a step that does not run on this path at all.
3. **The count is in turns, not tokens.** The window is `MAX_STORED_TURNS`
   and the per-utterance bound is 4,000 characters
   (`app/api/intake/[id]/voice-turn/route.ts:12`), so the worst-case prompt
   is derived arithmetic, not an estimate that a provider's report could
   correct. The anchoring amendment has no local estimator to displace.

## Verdict

**Not-better**, and the row improved the amendment. A short-utterance voice
thread with a fixed turn cap, no tool results and no attachments in the
transcript is a seam class where the lossless lane has no material, and the
amendment now carries that precondition in its own text. The anchoring half
is unmeasurable here: the instrument that would make it measurable is a
token-denominated trigger, which this seam does not have and, at 48 turns of
4,000 characters, does not need.

## What the tree says about the standard

The confirming fact is the cap's derivation: it is equal to the engine's
render window by construction, with the equality argued in a comment beside
each constant, so the stored transcript and the rendered one number their
turns identically. That is a budget derived from a real limit and enforced
where the whole artifact is visible, which the golden path asks for and most
transcripts do not have.

## What this realization cannot do

It cannot tell the model how many turns a compaction marker stands for in
the model's own reading: the marker is a wire token resolved into the
reader's language by the panel, and the engine that renders the prompt is
the one that interprets it for the model; whether it does was not read here.
