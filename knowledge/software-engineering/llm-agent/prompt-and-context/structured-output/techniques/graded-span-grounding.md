---
layer: technique
type: technique
subject: structured-output
technique: graded-span-grounding
status: forged
laws: [gate-sees-target, one-authority-per-vocabulary, unknown-is-not-a-value, one-validation-door, derivation-names-recomputation]
shared_with: []
applied: code
ab_verdict: better
use_when: [a model returns quotes or extracted spans that are supposed to come from a source, verifying a citation before it awards points or enters a standing record, highlighting where in a document an extraction came from, a verbatim-quote check rejects quotes that look faithful, choosing between exact and fuzzy matching for model-cited text, the same phrase occurs several times in the source, few-shot examples show extractions the validator would reject, a claim cites two documents as agreeing and one may be generated from the other, a citation audit passes and nobody asked what the cited file was derived from]
---

# Graded span grounding

A model asked to cite its source can copy text reliably, but it cannot report
positions. Character offsets, line numbers and token indices come back wrong, because
counting is exactly the operation a generator does not do. So the workable contract
splits the job. **The model returns the text. The system computes where it is.** Every
extraction, quote or evidence item is aligned against the source after generation, and
the alignment result, not the model's word, decides what the item may do.

Once the system does the locating, three decisions sit at that one step, and each of them
is usually left to a default. What text is the quote aligned against? What happens when
the alignment is not exact? And which occurrence does a repeated phrase belong to? This
technique owns those three, plus a fourth one step earlier: whether the examples that
teach the model to quote would pass the same check.

The quote-only form of the summary-evidence gate in prompt-assembly is one consumer of
this step, a byte-exact admission check. This technique is the step in general,
including the cases where exact is the wrong bar and the cases where it is the only safe one.

## Align against the text the model was shown

The quote's coordinate system is the prompt, not the store. Between the source and the
model sits a renderer: excerpts are truncated, list items are bulleted, fences are
defused so repository content cannot close a prompt section, markers are replaced, and
newlines are folded. A model told to copy exactly copies the rendered form. A verifier
that checks the stored form rejects that copy. It fails in the one direction nobody
investigates, because a rejected quote looks like a fabrication, and a fabrication is
what the gate exists to catch
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

The measured size of this is not small. In one scoring pipeline the prompt rendered each
commit subject behind a bullet, and the verifier searched the raw history. Of 140
faithful copies of rendered subjects across ten repositories, none verified. Copies
across a defused fence did no better: 0 of 7. Checking against the rendered view moved
both to all verified. The same battery's 267 fabricated near-copies were admitted 0 times
before and after.

Two rules follow:

- **Every transport the renderer applies is either inverted by the verifier or removed
  from the render.** Invert only transports that do not change meaning: a bullet, a
  fence defusal, whitespace. Never accept a quote of text the system itself inserted,
  such as a truncation marker or a replaced boundary token. That text is not evidence
  of anything in the source.
- **The renderer and the verifier share one spelling of each transport**
  ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
  When the bullet lives only in the prompt builder and the defusal only in the security
  module, no test of either can see the other, and the mismatch outlives every review.
  Where the transport cannot be moved to one module, pin the copies together with a test
  that feeds the renderer's output to the verifier.

Chunking is the same rule at a larger scale. A document read in windows is aligned
against the window the model saw, and the window's offset is added afterwards. Never
search the whole document for a quote produced from one window. A phrase that also
occurs in another window will bind there.

## Grade the match; the grade decides what the span may do

Exact-or-nothing throws away information, and "close enough" hides it. Record a closed
set of outcomes on every item:

| Grade | Meaning |
| --- | --- |
| exact | every token of the item, contiguous, in order |
| lesser | a contiguous run of the item's tokens matched, but the item is longer than the run |
| fuzzy | enough of the item's tokens found, in order, tightly enough, under the gates below |
| none | no acceptable span; the item is kept with no position, never given a guessed one |

`none` keeps the item and marks it unlocated, rather than silently dropping it or
attaching the nearest span
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). An unlocated
extraction may still be true, and a reader deciding whether to trust it needs to know
that nobody could find it.

What a grade authorizes depends on what the span is for, and this is the decision rule
that matters most:

- **Locating** (highlighting a passage, jumping a reader to a place, attaching a snippet
  to an extracted field): exact, lesser and fuzzy may all locate, each shown with its
  grade. A wrong highlight shown as fuzzy costs a reader one glance.
- **Admitting** (awarding points, entering a standing summary, licensing an action,
  counting as evidence in a verdict): only exact after the declared transports are
  inverted. A fuzzy match may be surfaced for review, never admitted. The same pipeline
  above tried a fuzzy aligner as the alternative to inverting its transports. Against the
  rendered commit block, it accepted a span that straddled two different commits at
  coverage 0.8 and density 0.36. That clears the gates as written, and it is evidence of
  nothing.

A system that uses one boolean for both jobs will be loosened for the first job's sake,
and the second job will inherit the looseness.

## Fuzzy needs two gates, and punctuation must not vote

Coverage alone ("75% of the item's tokens were found") accepts matches scattered across
a paragraph. The tokens are all present, just not together. A second gate, **density**
(matched tokens over the length of the source span), rejects the scatter. Search every
achievable match count, not only the maximum. A sparse span that matches every token can
fail density while a tight span matching all but one passes coverage, and the tight one is
the real location.

Both gates count tokens, so the tokenizer is part of the rule. When punctuation marks are
tokens, a short quote made of a bracket, a hyphen and three words can reach high coverage
from symbols that occur everywhere. That is how the straddling span above passed. Count
coverage over content tokens only, and keep a minimum content-token count below which a
fuzzy grade is not attempted. Light normalization, such as case folding and a plural
suffix, belongs in token comparison. Anything heavier is a paraphrase detector, and that
is a different instrument with a different error rate.

## Records have boundaries a match may not cross

A source is often several records joined for convenience: commit subjects, log lines,
extracted items concatenated for one alignment pass. A quote that matches across the join
is a sentence that exists in no record. Join with a separator no record can contain, and
make the matcher refuse to cross it. Fail loudly if an item contains the separator,
because silently it would corrupt every position after it. The same applies when several
extractions are aligned in one pass: each is delimited, so a match block can never be
longer than the item it belongs to.

## A repeated phrase has more than one home

Existence checks do not care which occurrence a quote came from. Locating does. A
substring search binds every quote to its **first** occurrence. When a model extracts
the same drug name four times from a discharge note, or quotes the same error line from
a log that retried three times, every item lands on the first mention. The later ones
vanish from any view that highlights by position.

The better rule is **order-preserving assignment**. The model emits items in reading
order, so choose one occurrence per item such that the chosen positions increase in item
order and do not overlap, maximizing total matched tokens. Break ties toward the chain
that ends earliest, so repeated mentions fall on successive occurrences. It is a small
dynamic program over each item's occurrence list, cheap because most items occur once.
Items it cannot place fall through to the lesser and fuzzy grades. Where the output order
is not reading order (a schema grouped by class, a list sorted by importance), say so. The
assumption the assignment rests on is gone, and first-occurrence binding is the honest
fallback, recorded as such.

## The examples face the gate before the first call

Few-shot examples are the strongest instruction a model gets about what "extract" means.
An example whose extracted text is a paraphrase ("elevated blood pressure" shown against a
passage reading "BP was high") teaches paraphrase, and every production item that learns
from it fails alignment. So the examples run through **the same aligner, with the same
policy**, before any document is processed. Each example extraction is aligned against its
own example text, and every non-exact grade is reported with the example and the span.
Default to warning; offer a strict mode that refuses to run on any failed example and,
optionally, on any non-exact one. Copy the examples before aligning, because the check
must never rewrite the caller's examples with computed positions. This is the
[one-validation-door](../../../../_laws.md#one-validation-door) applied to the prompt's
own inputs: a check the outputs face and the examples skip lets the prompt contradict the
validator.

## Decision rules

- The model returns text; the system computes positions. Never ask for offsets.
- Align against the rendered view the model was shown, per window, then add the window
  offset. Invert meaning-preserving transports; never accept text the system inserted.
- Keep one spelling of every renderer transport, or pin the copies with a test that runs
  the renderer's output through the verifier.
- Record a closed grade on every item: exact, lesser, fuzzy, none. Keep `none` items
  with no position.
- Grades locate; only exact (after transport inversion) admits. Surface fuzzy for review.
- Fuzzy requires coverage and density, searched across match counts, counted over
  content tokens with a minimum length.
- Delimit records and items with a separator the matcher cannot cross.
- Assign repeated phrases by order-preserving, non-overlapping assignment when output
  order is reading order; otherwise record first-occurrence binding as the fallback.
- Validate few-shot examples through the same aligner and policy before the first call.
- Classify every cited location as primary or derived before it awards anything. A
  derived location may locate a claim but never corroborate one, and a claim that two
  documents agree is rejected when one is derived from the other.

## What grounding does not prove

A located span proves the text exists where the item says. It does not prove the model
read it correctly. A real line can still be misread, a drug can be real and attributed to
the wrong patient, a command can be quoted from a file that deprecates it. Grounding
narrows fabrication to misinterpretation, and misinterpretation is auditable only because
the span can now be shown next to the claim. Show it.

## A resolved citation is only as primary as the file it lands on

Grounding answers *is this text where the item says*. It is silent on a second question
that decides whether the answer means anything: **is the place it points at a source, or
something derived from one?** A generated summary, a projected copy of another document, an
index page rendered from a digest of a truncated read - every one of these is text the
system holds, every quote from it aligns exactly, and a citation audit over them passes
completely while the chain of evidence behind it is empty. Each derivation layer is also a
loss: a summary of a prefix of a flattened copy has already discarded what the audit would
need, and nothing in the resolved pointer says so.

The failure has a sharp form wherever a claim is *relational*. A claim that two documents
agree needs two citations, and a verifier that checks each one independently will accept
a document and its own generated projection: both quotes resolve, both are verbatim, and
the pair proves only that the copy step ran once. The agreement is a property of the
generator, not evidence about the thing being judged. A projection that has since drifted
elsewhere still carries every line it inherited, so "only byte-identical copies are
excluded" is not enough.

The rule for the verifier:

- **Classify the cited location by tier before it may award anything.** Primary means
  authored where it stands; derived means produced from another location (it names its
  source in a header, it is byte-identical to another file's body, it lives in a
  directory the system itself generates). Derivation that names its origin
  ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)) is exactly
  what makes the tier checkable.
- **A derived location may locate; it may not corroborate.** It can be shown to a reader
  as where the claim was found. It cannot satisfy an evidence requirement, and it can
  never be the second witness to its own source.
- **Reject a relational claim whose citations share an origin**, with its own closed
  reason (a derived-citation rejection, distinct from quote-not-found), so the rejection
  rate is readable rather than folded into fabrication.
- **Keep the exclusion to agreement.** A disagreement between a source and its own
  projection is real evidence - the copy drifted - and is still admitted.
- **Keep the deterministic path and the model path on one rule.** A detector that already
  refuses to count a copy as a second author, beside a claim verifier that does not, pays
  the model for exactly the evidence the detector declined
  ([gate-sees-target](../../../../_laws.md#gate-sees-target)).

Measured on a scoring engine that awards points for model claims verified by verbatim
quote: before the rule, a claim citing a guidance document and its generated projection
as two files that agree verified and awarded the facet's full points on an in-sync
projection and on a drifted one, and the deterministic detector counted the drifted
projection as an independent agreeing document although its own comment called that
agreement a tautology. After the rule, all three awarded nothing, two independently
written documents that agree still awarded the full points, and the project's whole
test suite and typecheck stayed green.

## When not to use this

- **The output is not supposed to be in the source.** Summaries, classifications and
  judgments are derived, not copied. Ground their supporting quotes, not the derivation.
- **The source is not text the system holds.** A span cannot be aligned against a
  document the verifier cannot read at check time. Store the evidence first, or accept
  that the citation is testimony.
- **Normalized or structured values.** A date rewritten to a standard format or a unit
  converted is no longer a quote. Keep the source span and the normalized value as two
  fields, and ground only the first.
