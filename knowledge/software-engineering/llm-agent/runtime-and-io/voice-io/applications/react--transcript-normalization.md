---
layer: application
type: application
subject: voice-io
technique: transcript-normalization
stack: react
status: forged
verified_on: 2026-08-27
verified_against: react@19.2.6
---

# The dictation pipeline that has both destinations and needs the stage at neither

An assessment, not an adoption. A local-first desktop companion (React +
Tauri) ships the full capture→transcript half of this subject and was
evaluated against `transcript-normalization` when a purpose-built open-weights
normalizer class appeared (2026-08-19). The verdict was **do not adopt**, and
the reasons are structural rather than circumstantial — which is what makes
the tree worth writing down. A negative application is still evidence about
the technique; this one turned out to confirm the technique's central decision
rule from the direction the rule predicts you will not notice.

Citations are against `src/features/plugins/companion/useLocalDictation.ts`,
`useHoldToTalk.ts`, `CompanionFooterIcon.tsx`,
`decision/parseSpokenDecision.ts`, and the Rust sidecar under
`src-tauri/src/companion/stt/` (`whisper.rs`, `catalog.rs`).

## The structural fact: both destinations sit on the "do not normalize" side

The technique's governing split is reader-versus-reasoner. This tree has
exactly two dictation destinations, and nobody arranged them — they fell out
of the product being a companion rather than a dictation app:

- **A decision grammar.** `parseSpokenDecision.ts` receives the transcript
  when an approval is pending. It case-folds, strips punctuation and filler,
  and folds number words before matching — the parser's own normalization
  ladder, per [spoken-intent-parsing](../techniques/spoken-intent-parsing.md).
  A readable rewrite inserted upstream produces punctuation and capitalization
  that this consumer's first action is to delete.
- **A turn to the assistant.** A press-and-hold on the avatar "arms dictation
  and fires a voice turn through [the assistant's] full pipeline without
  opening the panel" (`CompanionFooterIcon.tsx:30-32`), driving "hold-to-talk
  dictation → `voiceTurnRequest`" (`:43-44`) — free text to a language model
  that holds the conversation, the task, and the prior turns.

Both are the technique's *counter*-cases. The second is the interesting one,
because it is the case the popular framing gets backwards: cleaning a
self-correction before it reaches an agent sounds like it sharpens the
instruction, and in this tree it would mean a normalizer seeing one utterance
edits input for a consumer holding the whole thread. The tree contains no
destination of the kind the technique is for — no dictated note, no composed
message sent to another human, no ticket body. **The stage has no customer
here, and the absence is a property of what a companion is, not of what this
codebase happens to have built yet.**

That is the negative evidence: a mature, fully-built capture pipeline, with
both plausible transcript consumers present and neither of them qualifying, is
a stronger test of the reader/reasoner rule than a tree that simply lacked the
stage.

## The tree had already declared the latency budget exhausted

The technique warns that a non-streaming transform spends from the capture
pipeline's final-transcript budget, at the worst moment — after the user has
stopped talking and started waiting. This tree states that budget as a
constraint in code, before anyone asked about a second stage.

`catalog.rs` curates the downloadable ASR models as an allowlist and stops at
`small` (466 MB), with the ceiling written into the module comment: `small` is
"the accuracy ceiling we're willing to ship by default (medium/large are
1.5 GB+ and too slow on CPU for a snappy turn)". The product has already
traded ASR accuracy away to hold a per-turn latency target. A second
full-generate stage of comparable size, on the same CPU, on the same critical
path, spends the budget that trade was made to protect — and it buys
readability, which is not what the trade was protecting.

The related observation about the subject at large: **a curated local-model
catalog's ceiling is set by turn latency, not by accuracy.** The catalog
comment is a first-party statement of exactly that, and it is why "add another
local model to the turn" is a bigger ask in a voice pipeline than the model's
own size suggests.

## Language coverage is a live gate here, not a hypothetical

The technique's coverage rule ("a product speaking more languages than its
normalizer does is the common case") is instantiated twice over:

- the app ships 14 locales (`src/i18n/locales/`: ar, bn, cs, de, en, es, fr,
  hi, id, ja, ko, ru, vi, zh);
- the ASR wrapper is language-parameterized —
  `whisper.rs:112-117,166-167` takes an optional hint and passes `-l <lang>`
  to the CLI, with `None` meaning auto-detect — and the catalog deliberately
  carries multilingual `base`/`small` alongside the `.en` variants "for
  everyone else".

So the pipeline is genuinely multilingual at the stage that matters, and the
normalizer class evaluated is English-only in its first release. The stage
would be dark for 13 of 14 shipped locales while costing its full integration
surface. The tree makes the gate concrete: because capture already knows the
language, gating the stage on coverage is a cheap conditional rather than a
new concept — which is the argument for building the *seam* eventually even
while declining the model now.

## What this application cannot tell you

- **No latency was measured.** No normalizer was installed, run, or timed on
  this hardware. The latency argument is derived from the catalog's own stated
  trade plus the non-streaming shape of the stage, and it is a projection.
  An independent practitioner evaluating the same model class for a
  translation pipeline reached the same open question and also left it
  unmeasured, warning of seconds per segment on weak hardware — convergent
  reasoning, not a second measurement.
- **No quality comparison was run.** Whether a purpose-built normalizer beats
  the general model already in the turn, on this product's actual transcripts,
  is untested. The decision above does not depend on it: the reader/reasoner
  rule disqualifies the placement regardless of which component cleans better.
- **This is a judgment about placement, not about the component.** The
  technique's other sections — the transform contract, the input-derived
  output ceiling, the typed outcome — were read out of the component's own
  documentation and an independent evaluation, not exercised against this
  tree.

## The condition that reopens it

The stage becomes correct here the moment a dictation destination appears
whose output a **person** reads: a dictated note persisted to the companion's
own store, a message composed by voice and sent onward, a voice-authored
document. At that point the seam is cheap — capture already resolves the
language, every consumer already handles raw transcript text, and the
technique's optional-by-construction property means the stage ships behind a
flag without touching a consumer. Until then the honest position is that the
pipeline is complete and the stage would be a cost with no reader on the other
end.
