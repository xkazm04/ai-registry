---
layer: technique
type: technique
subject: document-text-extraction
technique: recognition-boundary-and-escalation
status: forged
laws: [absent-guard-is-loud, verdict-survives-boundary]
shared_with: []
use_when: [callers keep asking why scanned documents come back short, adding an expensive recognition path behind a cheap extractor, deciding whether an expensive fallback should be on by default]
---

# Recognition boundary and escalation

An extractor that reads text layers and does not perform optical recognition
has drawn a sensible boundary. Reading text a producer already stored is
deterministic, fast, exact and local; turning pixels into characters is
probabilistic, slow, expensive and — for most teams — remote. Putting both
behind one function makes every caller pay the second one's cost, latency and
failure modes for the overwhelming majority of documents that never needed it.

The boundary is fine. What fails is leaving it **implicit**.

## The boundary is a published property or it is a surprise

A caller integrating an extractor forms a model of what it does from what it
returns. If scanned regions come back short, the model that forms is "this is
what the document contained", and it forms silently, in a codebase that will be
maintained by someone else. State the boundary in every place a caller looks
before deciding what to send:

- **the contract** — the documented behaviour, in the same paragraph as what the
  component *does* do, not in a limitations appendix nobody reaches;
- **the error vocabulary** — a distinct, stably-named variant meaning *this
  needs recognition and I do not do recognition*, separate from "unsupported"
  and separate from "malformed", because those three route to three different
  responses;
- **the instructions an automated caller reads** — where an agent or a script
  decides which tool to invoke, the boundary belongs in the tool's own
  description, because a caller that cannot read your documentation will
  otherwise learn it by producing a wrong answer.

The test for whether you have published it: **can a caller distinguish "this
document has no text" from "this document has text I will not read" without
opening your source?** If not, the boundary is not a boundary — it is a defect
you have decided to keep.

## Escalate the refusals, never the format

When a recognition path does exist, its input set is defined by one rule:
**it receives what the cheap path refused, and only that.**

The instinct is to route by format or by producer — send every fixed-layout
document to the expensive engine, or every upload from this source. That
routing is wrong on both sides. It pays the expensive price for born-digital
documents that the cheap path would have read exactly, at a cost multiple that
is typically two or three orders of magnitude; and it silently *stops* covering
the cases that the cheap path fails for reasons the format label does not
predict.

Routing by refusal is strictly better and costs nothing extra to build, because
the refusal is already a typed value carrying the region identities. The
escalation's trigger is a verdict rather than a guess about the input — which is
the practical dividend of having made the refusal survive its boundaries in the
first place
([verdict-survives-boundary](../../../_laws.md#verdict-survives-boundary)). Where
the refusal carries region identities and the recognition path can be scoped to
regions, scope it: recognizing three pages of a hundred-page document is not a
cost optimization, it is a different order of expense.

## Which way it defaults, and why that is not the usual answer

The general guidance about protections is that an optional guard is an absent
guard: a check that must be switched on protects the examples and not the
installations, because a deployed fleet converges on the default
([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud)). Applied
carelessly here it argues for recognition on by default, and that is the wrong
conclusion — reached by mistaking which component is the guard.

**The guard is the refusal, not the recognition.** The refusal is what prevents
silent loss, it must be non-optional, it must engage on its own, and it must
never be behind a flag. Recognition is an expensive *remedy* whose failure mode
is a bill and a latency cliff, not silence. So:

> The refusal defaults on and cannot be disabled. The escalation defaults off
> and is opted into per call.

An installation that opts into nothing still gets a named error identifying the
regions — the loud outcome the law demands — and pays nothing it did not ask
for. The inversion is what fails: recognition on by default with the refusal
optional means an unconfigured install silently absorbs both the loss *and* the
cost, and neither is visible until an invoice or an audit surfaces it. If you
find yourself making exactly one of the two configurable, it is never the
refusal.

## The escalation is single-purpose, and its output is labelled

Two obligations remain once the escalation exists.

**It gets its own failure vocabulary.** A recognition attempt that fails must
not surface as the original refusal, because the two are different states with
different responses: *we did not try* is a configuration decision, *we tried and
the engine failed* is an incident, and *we tried and the pages genuinely hold no
characters* is a fact about the document. Collapsing them makes the escalation
unmeasurable — you cannot compute a success rate for a path whose failures are
indistinguishable from never having run it.

**Its output is a different evidential class, and the record says so.**
Recognized text is a probabilistic reconstruction; extracted text is a copy.
Mark the provenance on the region, durably, because downstream consumers have
legitimate reasons to treat them differently — a citation, an exact-match
search, a legal quotation, a figure a person will act on. A pipeline that
merges recognized and extracted text into one undifferentiated blob has thrown
away the distinction at the only place it could have been recorded, and the
distinction is not recoverable afterward by inspection.

## When not to use this

If recognition is genuinely part of your product's promise — the input is
expected to be scanned, always, and there is no cheap path worth attempting —
do not build a boundary and an escalation around it. Build one pipeline that
recognizes, and spend the design effort on the confidence and correction
problems that pipeline actually has. The boundary earns its keep only when the
cheap path serves the common case.
