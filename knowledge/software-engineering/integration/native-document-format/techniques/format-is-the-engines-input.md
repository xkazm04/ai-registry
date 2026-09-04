---
layer: technique
type: technique
subject: native-document-format
technique: format-is-the-engines-input
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
use_when:
  - designing a save format for an application whose output another program consumes
  - an export step keeps producing something different from what the editor showed
  - deciding whether editor-only state needs a format of its own
  - a user asks why they cannot open the program's own output as a document
---

# The saved document as the consumer's input

When an application's work is ultimately handed to another program — an engine
that renders it, a runtime that executes it, a service that publishes it — there
are two ways to persist it, and teams usually take the first without registering
that a decision was made.

**The private format with an export step.** The application saves its own
serialized model, and a separate translation stage converts that model into
whatever the downstream consumer accepts. Two representations, one translator
between them.

**The document that is already the consumer's input.** The saved file is a valid
artifact for the downstream consumer as it stands. Everything the consumer needs
is in the form it defines; everything only the editor cares about — selections,
collapsed groups, the user's zoom level, the metadata that produced a computed
element — rides in a region the consumer's format designates as ignorable.

## The decision rule

**If a downstream consumer will read the artifact, extend that consumer's format
with an ignorable region rather than inventing a format and translating into
it — unless the consumer's model cannot represent a concept the application's
model requires, and no ignorable region can carry it.**

The rule is a preference and not an absolute, so it has a stated escape. If the
downstream format has no extension mechanism at all, if using it would produce
artifacts that are invalid to the format's own rules, or if the editor's model is
so much richer that the majority of the document would live in the ignorable
region, the private format wins and the translator is honest work. What is not
acceptable is arriving at the private format by default, because the first
version of the editor's model was easier to serialize directly.

## What the choice buys

- **No export step.** The artifact the user saved is the artifact the consumer
  reads. A step that does not exist cannot be slow, cannot be forgotten, and
  cannot be skipped in a batch pipeline.
- **No editor/consumer divergence.** The translation layer is where "what I saw
  is not what I got" defects live, because it is a second implementation of the
  document's meaning maintained by people who are not looking at both sides at
  once. Removing it removes the class. This is
  [one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)
  applied to a document: the consumer's format is the single authoritative
  definition of the shared vocabulary, and the editor derives from it rather
  than keeping a parallel definition it must reconcile.
- **Third-party tooling for free.** Every validator, viewer, diff tool, batch
  processor and script that exists for the downstream format now works on the
  application's documents, and the application did not write any of it.
- **The consumer's own outputs become documents.** Anything the downstream
  program produces in its own format can be opened by the application as an
  ordinary document, because that is what a document is here. The asset library,
  the intermediate artifacts, the outputs of other tools in the same ecosystem —
  all of them become first-class inputs with no importer.

## What the choice costs

- **The editor's model is constrained by the consumer's.** A concept the
  downstream format cannot express must be expressed in the ignorable region,
  where it is inert to the consumer. If the feature's whole point is that the
  consumer acts on it, the ignorable region will not save you.
- **The consumer's evolution is now your compatibility problem.** When the
  downstream format changes, the application's document format changed with it.
  This is a real coupling and it must be a deliberate acceptance, not a
  discovery.
- **The ignorable region has a sharp failure mode.** An extension is only
  ignorable if the artifact stays valid under the format's own rules; the
  boundary case has its own technique, and it must be read before this one is
  adopted, in
  [ignorable-extensions-must-be-declared](./ignorable-extensions-must-be-declared.md).
- **Editor state is now legible to strangers.** Anything in the ignorable region
  travels with every copy of the document. Treat it as published, and keep
  anything that is not the user's own work — machine identifiers, absolute
  locations, credentials of any kind — out of it entirely.

## What the ignorable region may carry

The region carries **editor state that is not the document's meaning**: view and
selection state, grouping, per-element authoring metadata, the parameters that
generated a computed element, the application's own generation stamp. The test is
whether removing the region changes what the downstream consumer produces. If it
does, the value belongs in the consumer's own vocabulary, expressed in its terms,
and the region has been used to smuggle meaning past the format's contract.

That test also names the boundary with the next technique. A value expressed in
both places — once in the consumer's vocabulary and once in the ignorable region
"for the editor's convenience" — is a projection, and projections drift. See
[one-writer-per-fact](./one-writer-per-fact.md).

## Prohibitions

- **Never write the same fact into both regions.** That is the drift defect, and
  it will be reported as the rendered result disagreeing with the parameters the
  user set.
- **Never depend on the consumer preserving the ignorable region on
  round-trip.** Most do not promise it. If the application must survive a trip
  through the consumer, verify that the region comes back, or accept that a
  consumer-processed document has lost its editor state and say so to the user.
- **Never treat "the consumer opens it" as validity.** Acceptance by one lenient
  reader is not conformance; see the boundary technique.
- **Never put anything secret, host-specific or machine-specific in the
  document** on the grounds that the consumer ignores it. Ignored is not
  invisible.
