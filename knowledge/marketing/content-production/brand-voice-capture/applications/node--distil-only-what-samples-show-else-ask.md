---
layer: application
type: application
subject: brand-voice-capture
technique: distil-only-what-samples-show-else-ask
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Distil only what samples show - the twin's style tool and its normaliser

The Czech-first adtech workspace (`systedo-case`, shipped as commit
`0582e186`, 2026-10-14) distils a per-channel voice in one tool,
`src/lib/ai/tools/twin-style.ts`. The prompt side already follows the
technique closely: the system prompt tells the distiller to describe only what
is visible and to say so in the summary when material is thin; the user prompt
for the empty case says the material is thin, to derive directives cautiously
from the business type and to lead with questions; the keyless fallback
returns an explicit "not distilled", the previous directives unchanged and
starter questions, never a canned profile; and the validator requires an open
question only while the voice is cold. The Node version is witnessed by the
repository's `engines` field and `.nvmrc`.

## The seam: the code kept what the prompt only asked for

The seam was chosen to falsify "the tool already honours the technique". The
prompt does; the normaliser trusted the model past its evidence in two places.

1. **Derived fields with nothing to derive from.** With no samples and no
   answers, the model's hard `constraints` (the prompt calls them rules
   "derived from the samples") and `examples` (new sentences "in this voice")
   passed through unchanged and were saved with the profile. The twin then
   obeyed them as guardrails and imitated them as exemplars. The cautious
   wording of the directives did not help; the fields were never conditional
   on evidence.
2. **Re-asking.** Only the canned starter list was filtered against answered
   questions. A question the model itself proposed, identical to one the
   owner had just answered, reached the screen.

## A and B

The model was mocked and the tool's real validate and normalise ran over a
fixed raw output (three constraints, three examples, two questions, one of
them already answered), six cases.

- **A (before):** three of six fail. No evidence: 3 constraints and 3 examples
  kept. A blank answer (the prompt's own filter does not count it) counted as
  evidence. The answered question was returned alongside the fresh one.
- **B (after):** six of six pass. No evidence: constraints and examples empty,
  cautious directives and questions kept. The answered question is dropped.
- **Target:** invented constraints and examples saved with zero evidence, A 3
  and 3, B 0 and 0; answered questions re-asked, A 1, B 0.
- **Floor:** with samples, or with non-blank answers, constraints and examples
  are kept; an unanswered model question survives; a mature voice may still
  end with no open questions; the prompt and schema are untouched, so the
  project's golden-snapshot gate holds; 296 related unit tests, the type
  check and the linter stay green.

Not measured: how often a live model returns constraints on empty input; the
fix rests on the code no longer depending on that rate.

## What the tree adds to the technique

A prompt instruction and a code path are two different guarantees. The tree
had the first complete and the second absent, and the second is the one the
saved profile obeys. The earlier application of the maturity technique cites
this file's line numbers for the maturity gate; the gate is unchanged, the
numbers moved by five lines after this commit.
