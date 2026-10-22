---
layer: application
type: application
subject: tool-result-economy
technique: compressibility-follows-the-producer
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@20
applied: experiment
ab_verdict: unmeasurable
proof: structural-only
---

# A lossy rung keyed on set membership instead of on the noise's shape

The tree is this registry's own source-ingest script, read at the commit that
last touched it, `153124e2`. The version is the one CI pins for every gate job,
`.github/workflows/knowledge.yml:62 "node-version: '20'"`; the interpreter that
ran the experiment was Node 24, so the reading is of the code and the numbers
are from a newer runtime than the witness. The script is a tool-output producer
in the sense the technique means: it turns an external source into the text a
model reads, and it applies a different transform per producer.

## The classification is already by producer

The script branches on what produced the bytes before it transforms anything.
A video's caption track is cleaned, a local file is passed through untouched
unless its name says it is a caption track, a pasted stream is untouched, a web
page is reduced to prose, and a document container is decoded and then
refused if the decoder found no structure. That is the technique's ordering,
reached without a size rule: nothing here keys on how many bytes arrived, and
the only transform that removes words is attached to the one producer whose
noise has a known form.

## The one lossy rung removes more than the noise

The caption cleaner states its reason as a shape, not a size,
`scripts/research-ingest.mjs:126 "the same sentence arrives three or four times with one new word each. Dedupe on"`.
The shape is a rolling window: a line repeats in the cue that follows it.
Locality is the whole of that noise. The rule that implements it is wider than
the shape in two statements,
`scripts/research-ingest.mjs:149 "if (!txt || txt === last) continue;"` removes
the adjacent repeat, which is the noise, and
`scripts/research-ingest.mjs:152 "if (seen.has(key)) continue;"` removes any line
equal to one seen **anywhere earlier**, which is not noise. A speaker who says
"right" twice, asks a question twice, or answers "yes" at three points in a
talk loses every occurrence after the first, and the output says nothing about
it. The word count the gate asserts is taken over the thinned text, so the loss
also lowers the number the thin-source floor reads.

## The experiment

Both arms read one caption file in the rolling-window layout (each cue holds the
previous line and the new one, then a short cue repeating the new one), built
from a script of 20 spoken lines in which 7 are legitimate repeats (a one-word
reply, two repeated questions with their answers, a repeated instruction). The
fixture is constructed, because a real track could not be fetched in this run
(the host answered 429 to the one request made).

- **Arm A**, the script unchanged: 13 lines out, 13 of 20 spoken lines retained.
  Seven spoken lines were deleted, all of them repeats.
- **Arm B**, adjacency only (the cleaner without the seen-set): 20 lines out,
  20 of 20 retained. No rolling-window duplicate survived, because on this
  layout the noise is adjacent by construction.

Target, spoken lines retained: 13/20 to 20/20. Floor, rolling-window noise left
in the output: 0 in both arms. The target moved over a floor that held, on a
fixture whose layout was written to match the one the script's own comment
describes. That is not `better`, because the floor was measured only on the
layout the author wrote down; a real track that interleaves a third line, or
re-emits an earlier line after a gap, would put noise back that the seen-set
was catching, and no real track was read.

## What this adds to the technique

The technique requires that a lossy transform act on a known output form and
remove most of the output. Both hold here. The case it does not state is a
transform whose **key is wider than the noise**: the shape is local, the key is
global, and the difference is content deleted without a signal. The threshold
rule cannot see it, because the transform still removes most of the output on
a real track, so it passes the fraction test while failing the narrower one.
The boundary is that the lossy rung's removal key must be the noise's own
locality, and the output should carry a count of what was removed so a reader
can tell thinning from absence. Scored as a boundary candidate, gain 1 and
risk 1 (one constructed fixture); not written into the technique.

## What the realization cannot do

It cannot say how often real caption tracks carry non-local noise, which is the
only figure that decides whether the wider key earns its loss. It does not
count what the cleaner removed, so a transcript thinned by 35 percent and one
that never repeated look the same to the reader. It is also not an agent
harness: the cleaner runs once at ingest, before any transcript exists, so the
recovery signal the sibling technique measures has nothing to count here.
