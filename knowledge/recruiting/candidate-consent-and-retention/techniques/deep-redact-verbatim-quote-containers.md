---
layer: technique
type: technique
subject: candidate-consent-and-retention
technique: deep-redact-verbatim-quote-containers
status: forged
laws: [uncertainty-resolves-toward-the-candidate, a-verdict-is-bound-to-what-it-judged]
shared_with: []
use_when: [scrubbing derived artifacts, redacting reasoning traces, deciding which fields hold personal data]
---

# Deep-redact verbatim quote containers

## The concern

The person is not only in the person table. Automated hiring systems generate
artifacts *about* the candidate that quote the candidate: a reasoning trace
that cites the sentence it drew a conclusion from, an evidence array holding
the exact phrases that supported a score, a provenance dossier assembled for
explainability, a cached comparison that inlines a summary. These are the
system's honesty machinery — they exist so a claim can be traced to its
grounds — and they are, for exactly that reason, full of verbatim text from the
document you were asked to destroy.

A scrub that clears the columns it recognises and leaves these containers alone
produces the characteristic incident of this domain: the source document is
gone, the person's name is masked, and a quarter later an explainability export
reproduces three paragraphs of their résumé verbatim, correctly attributed to
their surrogate id. The erasure was reported complete at the time.

## The taxonomy: three shapes, three rules

Classify every field in the graph, once, and act on the class rather than on
the field name:

**Direct identifier keys.** Name, email, phone, address, links to profiles,
government identifiers, date of birth, photograph. Rule: destroy or replace
with the de-identified surrogate. These are the easy ones and they are the ones
every implementation already handles.

**Free-text and quote-bearing fields.** Summaries, rationales, notes,
transcripts, cover letters, and any field whose value was produced by
summarising or quoting the candidate's own material. Rule: destroy the content.
Do not attempt to strip names out of prose and keep the rest — a rationale that
says "ten years at the same manufacturer in a town of four thousand" identifies
a person with no name in it at all, and partial redaction of prose is a
best-effort guess presented as a guarantee.

**Containers — arrays, nested objects, blobs.** Evidence arrays, trace
structures, dossier payloads, cached derivatives, structured logs of model
input and output. Rule: **recurse**. Walk the structure to its leaves and apply
the first two rules at every level. A container is not safe because its
top-level keys are innocuous; the person is three levels down in an element of
an array of citations.

## Recursion is the default, not the optimisation

The instinct is to enumerate the known paths inside each container and redact
those. That inverts the safe default: it protects what someone remembered and
exposes everything added since. Recursive redaction over a class-based
classifier fails in the safe direction — an unknown key that looks like free
text gets destroyed, costing a little retained detail nobody was relying on.

**Decision rule.** When walking a container and encountering a key or shape the
classifier does not recognise, redact it. Do not keep it.
[Uncertainty resolves toward the candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate)
here means the burden of proof sits on retention: a field is kept only because
someone established it holds no personal content, never because nobody has
established that it does.

Guard the recursion for cycles and for depth, and log a hard failure — not a
silent truncation — if a structure exceeds the depth limit. A truncated walk is
a partial scrub wearing a completion message.

Preserve structure while destroying content: strings become empty, arrays
become empty, numbers and booleans and nulls stay. The payload still parses,
downstream readers still find the shape they expect, and nothing that was
candidate-authored survives. A redaction that deletes keys instead of blanking
them breaks every consumer and tempts someone to skip it.

**When a container cannot be parsed, destroy it wholesale.** A corrupt or
unrecognised blob cannot be selectively scrubbed, and the two tempting
alternatives are both wrong: skipping it leaves un-scrubbed personal data, and
aborting the erasure fails the request over one bad row. Replace it with an
empty structure and continue. Losing an unreadable artifact costs nothing that
was readable anyway.

## What the redacted artifact becomes

A reasoning trace whose quotes are gone is no longer an explanation. Do not
leave it in place looking like one. Two acceptable outcomes:

- **Destroy the artifact entirely.** Correct when its only purpose was to
  explain a conclusion to a human who can no longer be shown the grounds.
- **Reduce it to a stub that states its own state**: this trace existed,
  produced this conclusion, on this date, and its grounds were destroyed under
  an erasure request. That is honest, it preserves the audit fact that a
  decision was explained at the time, and it does not pretend to still be an
  explanation.

What is never acceptable is a trace with holes that still renders as reasoning,
because it invites readers to fill the holes.
[A verdict is bound to what it judged](../../_laws.md#a-verdict-is-bound-to-what-it-judged)
— once the judged content is destroyed, the verdict's binding is broken and the
artifact must say so rather than carry on as though the grounds were still
behind it.

## Find the containers before you need them

The containers are discoverable ahead of the incident. Two cheap sweeps:

1. **Follow the writers.** Every code path that persists model output, or that
   copies a field from a document into a derived record, is a candidate
   container. The set is small and mostly known to whoever built the analysis
   pipeline.
2. **Grep the store for a canary.** Insert a synthetic candidate with a
   distinctive nonsense string in every input field, run the full pipeline,
   then search the entire store for that string. Every place it appears is a
   container the scrub must reach. Run this as a test, not as an exercise —
   it is the only method that finds the container somebody added last month.

## When not to use this

- **Do not deep-redact the enumerated carve-out records.** The sealed decision
  record survives on the legal-claims ground precisely because its content is
  the evidence; recursing into it defeats the exemption.
- **Do not deep-redact aggregates that have already been reduced past
  identification.** A count, a rate, a distribution bucket holds no verbatim
  content and destroying it damages the historical series for no privacy gain.
  The dividing line is whether a leaf holds candidate-authored text or a
  quantity.
- **Do not use recursive redaction as a substitute for not storing the quote.**
  The cheapest verbatim container to scrub is the one that stores a pointer and
  an offset instead of the sentence. Where the pipeline can cite by reference
  into the source document, deleting the document deletes the quote for free.
