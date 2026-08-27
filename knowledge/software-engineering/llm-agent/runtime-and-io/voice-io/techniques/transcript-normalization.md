---
layer: technique
type: technique
subject: voice-io
technique: transcript-normalization
status: forged
laws: [one-validation-door, verdict-survives-boundary]
shared_with: []
use_when: [dictated text lands in a message or a note and reads like speech, deciding whether a cleanup pass belongs before a model or after it, a cleanup stage returned an empty string and the pipeline called it an error]
---

# Transcript normalization

A transcript is a record of **speech**, and speech is not written text. It
carries fillers, false starts, a self-correction three words after the thing
being corrected, numbers and addresses in whatever form the mouth produced
them, and sentence boundaries that exist only as breath. Every stage before
this one has been honest about that: the capture pipeline's whole discipline
is to avoid claiming more than the engine heard. But the transcript then has
to *go* somewhere, and when where it goes is a message, a note, a ticket or a
document, speech-shaped text arrives at a destination written for the eye.

Between "the engine produced a final transcript" and "the text landed where
the user meant it to" there is a stage, and it is the stage a voice product
most often leaves to a default. This technique owns it.

## Two normalizations, pointing opposite ways

This corpus already carries a normalizer for transcripts, and it is not this
one. [spoken-intent-parsing](./spoken-intent-parsing.md) runs a normalization
ladder — case-fold, strip punctuation and filler, fold number words to digits
— and the boundary between the two is not a matter of degree:

- the parser normalizes **to discard**. Its output is a match key, never
  shown, never stored, thrown away the instant a grammar entry matches. It
  is free to be lossy because nothing downstream reads it as text;
- this stage normalizes **to keep**. Its output *is* the artifact — the
  thing a person will read, send, or find again in six months. Every loss is
  permanent and attributable to the product.

Running one where the other belongs produces both characteristic defects. A
match key shown to a user is unpunctuated lowercase mush; a readable rewrite
fed to a grammar matcher is a slow, expensive way to produce a string the
matcher immediately lowercases again. **The destination decides which stage
runs, and a pipeline that has only one of them has not noticed it needs two.**

## Normalize toward a reader, never toward a reasoner

The single decision this technique exists to make: a cleanup stage pays where
the transcript is the **artifact**, and costs where the transcript is an
**instruction to something that reasons**.

- **Destination reads it.** A dictated message, note, commit body, ticket or
  document is consumed by a human, at leisure, as text. Disfluency here is a
  defect the user will otherwise fix by hand every single time. The stage
  earns its latency.
- **Destination reasons over it.** A transcript bound for a language model
  with the conversation in front of it is a different case, and the intuition
  inverts. A small normalizer sees the utterance and nothing else; the model
  downstream holds the thread, the task, and what the user said two turns ago.
  "By Friday — no, Thursday" is resolved *better* by the thing with context
  than by the thing without it, and a rewrite in between is a lossy edit made
  by the less-informed party, applied silently, to input the better-informed
  party will never see in its original form.

The tempting framing — "clean the input so the instruction is clearer" — is
backwards whenever the consumer's context window is larger than the
normalizer's. It is a real gain only when the consumer is a parser, a search
index, a diff, or a person.

The general-purpose escape hatch fails on the other side. A capable model
asked to tidy a transcript can also summarize it, expand it, answer it, or
soften it, and nothing in the request distinguishes those from the job.
Normalization wants a component whose **range is bounded by construction**,
not one persuaded to stay in bounds — which is why this stage is specified as
a transform below, and why "send it to the big model with a careful prompt"
is the design this technique is arguing against.

## The stage is a transform, not a generator

A normalizer's contract is that meaning survives and only form changes. That
is a property of the *stage*, and it has to be enforced at the stage, because
anything with generative capacity will occasionally take the opportunity:

- **Determinism is part of the contract.** The same transcript normalizes to
  the same text. Sampling belongs to generation; here it converts a repeatable
  transform into a component whose output the user cannot predict and the
  product cannot test. Where the implementation is a model, it runs greedy.
- **The output budget derives from the input.** A transform's result is
  bounded by what went in — a small multiple of the input length plus a fixed
  allowance for punctuation and expanded forms. This is the technique's best
  runaway detector and it is nearly free: a stage that exceeds its
  input-derived ceiling **has stopped transforming and started generating**,
  and the correct response is to discard its output and pass the raw
  transcript through, not to truncate a rewrite that has already gone
  somewhere else.
- **A repurposed general component carries defaults that are wrong here, and
  they fail loudly rather than gradually.** A normalizer built by narrowing a
  general model inherits that model's settings, and the ones that matter are
  the behavioral toggles — a deliberation mode, a preamble convention, a
  refusal posture. Left at their general defaults these do not degrade the
  output; they *replace* it, and the failure surfaces as empty or structurally
  wrong results rather than as worse prose. Pin the stage's configuration
  explicitly and pin the component's version alongside it; a normalizer whose
  behavior moved under a silent upgrade is indistinguishable from one that
  broke.

## The destination's format is a typed input, not a sentence

A normalizer serving more than one destination needs to know which one it is
serving: a chat message and a formal email want different capitalization,
salutations and contraction policy; a list of items wants line structure that
prose must not acquire. The way to supply that is as **declared, enumerated
parameters** — a register, a structural shape, a destination kind — each from
a closed set the stage was built against.

The alternative, describing the destination in prose alongside the transcript,
fails twice. It puts two authorities over the same channel, so an enumerated
default and a suggestive sentence resolve into a compromise matching neither;
and it reopens the range the previous section closed, because prose in the
input is indistinguishable from prose to be normalized. A destination that is
a typed parameter can be defaulted, persisted per surface, tested exhaustively
across its combinations, and shown to the user as a setting. A destination
that is a sentence can only be hoped for.

The corollary is a scoping rule: if a destination needs a control the stage's
vocabulary does not have, extend the vocabulary. Do not smuggle it in as text.

## Cutting the transcript, and what the cut costs

Normalizers are bounded in input length, so long transcripts are cut — and the
cut is not free here in a way that is specific to this stage. **Cut at sentence
boundaries, never at a fixed length**, using the same boundary rules the output
direction already pays for in
[speech-ready-text](./speech-ready-text.md): a terminal mark followed by
whitespace, with the abbreviation, decimal, initial and ordinal-dot exceptions
that each cost an audible defect to learn. A mid-clause cut hands the stage a
fragment and gets a confidently punctuated fragment back.

The expensive consequence is structural, and it disqualifies a whole
architecture:

> A self-correction spans the correction. "By Friday — no, Thursday" is
> resolvable only by something that sees both halves.

A pipeline that normalizes **per capture segment** — each short utterance
cleaned as it arrives, on the critical path, before the next one is captured —
therefore cannot resolve self-corrections across segment boundaries, which is
the single capability that most distinguishes this stage from punctuation
restoration. Such a pipeline pays the full latency and receives a fraction of
the benefit, and the fraction shrinks as segments get shorter.

The two designs that work: normalize **once, over the assembled utterance**,
after endpointing and before disposition; or normalize per segment while
accepting that the stage is doing formatting only, and saying so, rather than
believing it is doing the harder job. Choosing the first is why this stage
sits after the capture pipeline's reassembly and not inside it.

## What the stage returns, as a typed outcome

The stage has more than two outcomes and every consumer needs to branch on
which one occurred
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).
The vocabulary:

| Outcome | Meaning | What the consumer does |
| --- | --- | --- |
| **normalized** | text changed, meaning preserved | use the normalized text |
| **unchanged** | nothing needed changing | use it; do not report a cleanup that did not happen |
| **empty-by-design** | the input was filler or noise and correctly reduces to nothing | drop the segment — this is a *success* |
| **over-budget** | output exceeded its input-derived ceiling | discard it, pass the raw transcript, record it |
| **failed** | the stage could not run | pass the raw transcript through, visibly |

Two of those arms are the ones a naive integration collapses.
**empty-by-design is not an error**, and the pipeline that treats it as one
will surface a failure every time a user clears their throat. **failed is not
empty**, and a stage that returns the empty string on both makes the two
indistinguishable at exactly the moment the distinction matters — the same
collapse the capture pipeline spent a whole technique avoiding one stage
earlier. This stage is where a voice pipeline that got
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
right at the acoustic layer usually loses it again.

Because **failed** and **over-budget** both fall back to the raw transcript,
the stage is *optional by construction*: every consumer already handles
un-normalized text, so the stage can be off, unavailable, still downloading,
or unsupported for the current language without any consumer changing. Build
it that way and the feature ships behind a flag for free; build it as a
required step and it becomes a new way for dictation to fail entirely.

## One door, and the raw transcript stays

The stage is a single pure function every transcript passes through on its way
to a destination
([one-validation-door](../../../../_laws.md#one-validation-door)), for the
same reason the output direction has one: a second copy on another surface
diverges, and the user sees the same utterance cleaned two different ways in
one product.

The normalized text is a **derived value**, and the raw transcript is the
record. Keep the raw text for as long as the normalized text lives — it is the
only ground truth a re-normalization, a bug report, or a user's objection that
this is not what they said can appeal to, and the stage's own edits are
otherwise unfalsifiable. The reviewable transcript the capture pipeline shows
the user is the raw one, or both; a product that shows only the cleaned text
has quietly made an unverifiable claim about what was heard.

## When not to apply

- **The destination is a grammar.** Use the parser's ladder; this stage adds
  latency and its output is discarded.
- **The destination is a model with more context than the normalizer.** See
  above; the rewrite is a lossy edit by the less-informed party.
- **The transcript is evidence.** Anything that will be quoted, audited, or
  used to characterize what a person said keeps its disfluencies, because they
  are data. Cleaning a transcript that will be read as a record of speech is a
  fidelity defect, not a formatting improvement.
- **The stage does not cover the user's language.** A normalizer trained on
  one language does not degrade gracefully on another; it produces confident
  output in the wrong register or nothing at all. Gate the stage on the
  language actually detected or configured for the capture, default it off
  outside its coverage, and treat coverage as a declared capability of the
  stage rather than an assumption of the pipeline. A product speaking more
  languages than its normalizer does is the common case, not the edge one.
- **The latency budget is already spent.** The capture pipeline's staged
  budget ends at "final transcript after stop, a few seconds". A non-streaming
  transform inserted before disposition spends from that same budget, and it
  spends it *after* the user has stopped talking and started waiting — the
  most expensive moment in the pipeline to add a wait.
