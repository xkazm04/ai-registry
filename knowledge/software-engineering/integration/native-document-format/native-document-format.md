---
layer: golden-path
type: golden-path
subject: native-document-format
status: forged
use_when:
  - designing the file an application saves its own work into
  - a saved document opens with the wrong values or refuses to open
  - deciding whether a new release may break files the old one wrote
  - choosing what the saved file stores directly and what it only points at
techniques:
  - format-is-the-engines-input
  - one-writer-per-fact
  - serialization-is-locale-free
  - format-generations-are-declared
  - ignorable-extensions-must-be-declared
  - reference-or-embed
---

# The application's own document format

Most persistence questions are about a store the application controls: it owns
the schema, it owns every writer, and when the shape has to change it runs a
migration over rows it can see. **A document format is the case where none of
that is true.** The artifact leaves the building. It sits in a user's folder for
five years, gets copied to a colleague's machine, gets opened by a version of
the application that did not exist when it was written and by programs that
were never told the application exists. Nothing can be migrated, because nobody
knows where the documents are, and the writer of the document is frequently no
longer running when the problem is discovered.

That single asymmetry generates every rule in this subject. The file is a
**published contract with an unbounded set of readers**, and it must be designed
the way a wire protocol is designed rather than the way a table is designed: an
explicit version, a fixed machine-facing encoding, a stated extension mechanism,
and an honest declaration of what the application promises to keep reading.

The naive reading is that a save format is an implementation detail — the
serialized image of whatever objects happen to be in memory, changed freely
whenever the model changes. Its two failure modes are reliable enough to name in
advance. The first is **silent corruption**: something in the environment the
serializer was never told about — the machine's regional settings, a dependency's
process-wide state, a filesystem's path conventions — participates in the write,
and the file is well-formed, openable, and wrong. The second is **format drift
without a declaration**: each release quietly changes the meaning of a field,
old files keep opening, and their values keep being reinterpreted, so the defect
report arrives as "the effects in my old project look different now" and there
is nothing in the file that says which reading was intended.

## What this subject owns, and where it stops

This subject owns the contract between an application and the documents it
writes itself: what goes in the file and what stays derived, who is permitted to
write it, how the format evolves and how a break is declared, and what the file
promises to a reader that is not this application.

It does **not** own foreign formats arriving from elsewhere. Reading somebody
else's export is
[import-normalization](../import-normalization/import-normalization.md) — a
compiler front-end over a format learned by observation, whose whole discipline
is detection, partial mapping and honest disclosure of loss. The rule for
choosing: if the format's definition is yours to change, you are here; if it is
somebody else's and you are translating into your model, you are there. The two
meet at exactly one seam and it is worth stating: your own document format,
handed to a future version of your own application, must not be routed through
the foreign-import machinery, and the foreign-import machinery must not relax
its validation because a file claims to be one of yours.

It does not own database schema change. A
[migration](../../backend-platform/data-layer/migrations/migrations.md) rewrites
data the operator can enumerate and lock; a document format cannot, and the
difference is not one of degree. A migration is a program that runs once against
a known population; format evolution is a permanent obligation in the reader
against a population nobody has ever counted.

It does not own version history as a product feature. Whether a user can name,
restore or compare past states of their work is
[versioning-snapshots](../../operations/governance-and-records/versioning-snapshots/versioning-snapshots.md);
this subject is about what a single state is written *as*, and the two are
orthogonal — a product with no history feature still has a format generation
problem, and a product with rich history still has to decide what one snapshot
serializes to.

It does not own in-session reversibility. Undo is a model of the edit stream and
belongs to
[undo-history](../../ui-surfaces/input-and-editing/undo-history/undo-history.md);
a document format is a model of a state.

And it owns exactly one half of a boundary with localization. The user's locale
governs presentation — how a number is shown, how a date reads, which separator
appears in a field the user types into — and that half is
[locale-runtime](../../client-architecture/i18n/techniques/locale-runtime.md)'s.
The moment a value is written to a file, presentation ends and the machine-facing
contract begins, and no locale of any user may reach that far. Stated from the
other side: a localization defect makes a product feel foreign, and this one
makes a document unopenable.

## Prefer extending a format a downstream consumer already reads

If the application's output is consumed by an engine, a renderer, a runtime or
any other downstream program, there is a design fork most teams take without
noticing: invent a private save format and translate to the consumer's format on
export, or make the saved document **itself a valid input to that consumer**,
with the editor's own state riding in a region the consumer is required to
ignore.

The second is stronger than it looks, and the reasons compound. There is no
export step to be slow, to be forgotten, or to diverge from what the editor
showed. The consumer's own outputs become openable documents, because they are
in the same format the application saves. Any tooling that exists for the
consumer's format works on the application's documents for free. And the
translation layer — the single largest source of "what I saw is not what I got"
defects in this class of product — never exists to be wrong.

The costs are real and must be paid consciously: the application's model is
constrained by the consumer's, an editor concept with no representation there
has to be expressed in the ignorable region rather than natively, and the
ignorable region has a specific failure mode severe enough to have its own
technique below. Owned by
[format-is-the-engines-input](./techniques/format-is-the-engines-input.md).

## One writer per fact, and the remedy for a drift is deletion

The characteristic defect of a document format that serves two audiences is a
**projection**: the document's real state lives in the editor's own structures,
and a second copy is written into the shape the downstream consumer understands
so that consumer can act on it. Both copies are written by the same save
routine, so the duplication looks harmless on the day it is introduced.

It is not harmless, and the symptom is always the same shape: the result the
downstream consumer produces stops matching the parameters the user set. Every
edit path that updates one copy and not the other is a defect, the set of edit
paths grows monotonically, and nothing in the file records which copy was
intended to win. The instinctive fix — a better synchroniser, a save-time
reconciliation, a test that compares the copies — buys a release or two and then
loses, because it adds a third thing to keep correct.

**The remedy for a drifting projection is to delete the projection.** Write all
state through the single serializer the downstream consumer already defines, so
there is one writer and one reading. Where a consumer genuinely needs a different
shape, it derives that shape at read time. Removing a duplicate is a
compatibility break and it is worth one: the observed result is not "slightly
fewer sync defects" but a class of behaviour disappearing. A second benefit is
usually unearned and always welcome — a file with one representation of each
fact becomes editable and generatable by hand, and by other programs, which is
the property that makes automation around the application possible at all.
Owned by [one-writer-per-fact](./techniques/one-writer-per-fact.md).

## Machine-facing serialization is locale-free by construction

A file passed between programs must mean the same thing everywhere it is opened,
which forbids any dependence on where the person who saved it lives. The rule is
easy to state and routinely violated anyway, because the mechanism that violates
it is **process-global and usually set by somebody else**: a regional setting
established once at startup, sometimes by a framework, sometimes by a library the
application merely links against, silently reaching every number-to-text
conversion in the process.

The observed failure is severe and asymmetric. A user whose regional convention
writes a decimal fraction with a comma saves a project; every numeric property in
the file is written in that convention; the file is now unparseable by the
application, by the downstream consumer, and by every other tool — it does not
degrade, it corrupts, and it takes the crash reports with it. Users with the
convention the developers happen to use never see it, which is why it survives
into release.

Three consequences follow. The write path uses a fixed, locale-independent
representation for numbers, dates and separators, and so does every library it
delegates to. The user's locale is applied at exactly one boundary — presenting a
value to a person and reading one they typed — which is already the widget
layer's job. And the property is not achieved by careful coding at call sites: it
is achieved by pinning the global and by running the suite under a **hostile
locale**, because a test that runs only under the developers' own conventions is
reading a proxy for the property it claims to check. Owned by
[serialization-is-locale-free](./techniques/serialization-is-locale-free.md).

## Generations are numbered, and a break is announced

A format that has existed for years has generations whether or not anybody
declared them. Declaring them is what converts an archaeology problem into a
lookup: each generation is numbered, each names the application versions that
produce it, and — this is the part that must be in the file rather than in the
documentation — the document carries its own generation number, so a reader can
branch on it instead of guessing from which fields happen to be present.

A backwards-incompatible break is sometimes the correct engineering decision, and
a subject that pretends otherwise will be ignored by the person who genuinely
needs one. A break is earned when continuing to accept the old shape means
continuing to produce wrong results — when the alternative to breaking is
corrupting. It is not earned by a tidier structure, a nicer field name, or an
internal refactor. What distinguishes a professional break from an amateur one is
that it is declared: the generation number increments, the reader recognizes the
old generation and says so in a way the user can act on, and a file the
application cannot read produces a refusal rather than a partial open. Owned by
[format-generations-are-declared](./techniques/format-generations-are-declared.md).

## An extension is only ignorable if it is valid

The ignorable-region trick that makes the previous decisions possible rests on a
promise the format itself must make: a reader that encounters something it does
not understand skips it and continues. That promise is only available to an
artifact that is **valid under the format's own rules**, and the most common way
to lose it is to use an extension mechanism without performing the declaration
the mechanism requires. The result is the worst kind of defect: the application
writes the files, the application reads them, the downstream consumer reads them,
and every conforming tool in the world rejects them — for years, because nothing
inside the system is capable of noticing.

"Our reader accepts it" is not validity, and the application's own parser is
therefore the one instrument that cannot be used to check. The check is a
conforming validator, run in continuous integration over documents the
application actually produced. Owned by
[ignorable-extensions-must-be-declared](./techniques/ignorable-extensions-must-be-declared.md).

## What stays out of the file

The last decision is what the document contains rather than points at. Content
the application authored — generated elements, computed fills, anything with no
existence outside the document — is stored inline, because a reference to it
would point at nothing. Content the user brought — large media, assets that
belong to other documents too — is stored as a reference, because inlining it
multiplies file size by the number of documents that use it and severs the copy
from its original.

The reference is the interesting half, because it is a promise about something
the application does not control. Files move, get renamed, live on volumes that
are not mounted, and travel to machines where the path means nothing. A format
that stores a bare location and nothing else has no way to recognize the file
again when it moves; a format that stores enough identity beside the location can
relink, and a format that stores neither has to ask the user. Owned by
[reference-or-embed](./techniques/reference-or-embed.md).

## Operator posture

A document format decays where nobody is looking, so the instruments belong in
the build rather than in the support queue. Three of them are close to
non-negotiable once a format has shipped: a corpus of documents from **every**
generation, opened by the current reader on every build, so that "we still open
old files" is a measurement rather than a belief; the full suite executed under
at least one hostile regional convention; and a conforming validator over freshly
written documents. Beside them, a save-then-load equality check on the
application's own state is the cheapest test in this subject and catches the
entire class of asymmetric serializer defects where the writer and the reader
disagree about one field.

## The techniques

- [format-is-the-engines-input](./techniques/format-is-the-engines-input.md) —
  extending a downstream consumer's format instead of inventing one, what the
  ignorable region may carry, and what the choice costs.
- [one-writer-per-fact](./techniques/one-writer-per-fact.md) — why a projection
  of document state drifts, why the remedy is deletion rather than
  synchronisation, and what "derive it at read time" requires.
- [serialization-is-locale-free](./techniques/serialization-is-locale-free.md) —
  the process-global trap, the presentation boundary, and the hostile-locale run
  that is the technique's instrument.
- [format-generations-are-declared](./techniques/format-generations-are-declared.md)
  — numbered generations, the version stamp in the file, what earns a break, and
  how a refusal is spelled.
- [ignorable-extensions-must-be-declared](./techniques/ignorable-extensions-must-be-declared.md)
  — validity versus acceptance, the declaration an extension mechanism requires,
  and the validator that must not be the application's own parser.
- [reference-or-embed](./techniques/reference-or-embed.md) — what the document
  carries and what it points at, path forms, identity beside the location, and
  the relink protocol.
