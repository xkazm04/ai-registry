---
layer: technique
type: technique
subject: native-document-format
technique: format-generations-are-declared
status: forged
laws: [unknown-is-not-a-value, verdict-survives-boundary]
shared_with: []
use_when:
  - a saved document must open in a version of the application that did not exist when it was written
  - deciding whether a release may stop reading files an older release wrote
  - a reader has to guess a document's vintage from which fields are present
  - moving properties between containers as the model grows a new level
---

# Format generations are declared

A format that has shipped for years has generations whether or not anybody named
them. Naming them converts an archaeology problem — *which release wrote this,
and what did that release mean by this field?* — into a lookup, and it is the
only way a reader can branch on a document's vintage instead of inferring it.

## What a generation is

A generation is a numbered, closed description of the document's shape, and it
carries three things: the **number**, the **range of application versions that
produce it**, and the **differences from the previous generation stated as
changes a reader must handle**. The list lives in the format's documentation and
is written when the change ships, not reconstructed afterwards — reconstruction
is guesswork over release notes and it is always incomplete.

The version stamp goes **in the document**. A generation that can only be
identified by which fields happen to be present is not declared; it is detected,
and detection over a shape is exactly as reliable as the assumption that no two
generations ever produced the same field set. Older documents from before the
stamp existed are their own case and the reader must handle them, which is
precisely the cost of having started without one.

## The rule

**A document declares its own generation as an explicit value. A reader
dispatches on that value and never on the presence or absence of fields. A
document with no stamp is a distinct, named case — never the current generation
by default.**

The last clause is
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value): an absent
stamp means *we do not know what wrote this*, and reading it as the newest
generation converts that into a confident claim at the exact moment confidence
misleads. Handle it as the pre-stamp generation, say so, and be conservative
about what it is assumed to mean.

## What earns a break

A subject that treats backwards compatibility as absolute will be ignored by the
person who needs to break it, so state the standard plainly.

**A backwards-incompatible break is earned when continuing to accept the old
shape means continuing to produce wrong results.** A format that corrupts
documents under a common condition, a duplicated projection that makes the
rendered result disagree with the parameters set, a field whose meaning was
genuinely ambiguous and has been silently interpreted two ways — for each, the
alternative to breaking is shipping corruption, and the break is the correct fix.

**A break is not earned by** a cleaner structure, a better field name, an
internal refactor that would be tidier to persist directly, or a wish to delete
reader code. Those are paid for by keeping the reader for the old generation,
which is the ongoing cost of having published a format.

Moving properties between containers is the common shape of a legitimate
structural break: state that used to be global becomes per-container when the
model grows a second container. The old document put everything in one list
because there was only one; the new one keeps in the global list only what is
genuinely global and moves the rest inside each container. A reader for the old
generation performs that redistribution on load, and it can, because the old
document had exactly one container to redistribute into.

## What a declared break looks like in practice

1. **Increment the generation and record the application versions** that produce
   it, at the moment the change lands.
2. **Keep a reader for every generation you still claim to support**, and be
   explicit about which those are. "We open anything we ever wrote" is a
   commitment; "we open the last three generations" is also a commitment; having
   never decided is not.
3. **Upgrade on load, write the current generation on save.** An in-place
   silent upgrade of the user's file is not acceptable — a document opened from
   an older generation is converted in memory, and the conversion becomes
   permanent only when the user saves, having been told that saving will make the
   document unreadable by the version they came from.
4. **Refuse what you cannot read, as a typed outcome.** A document from a
   generation newer than the reader understands is a refusal that names the
   situation — this file was written by a newer version — and that verdict must
   reach the user's screen intact rather than being flattened into a parse error
   at the outermost boundary
   ([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).
   The three outcomes a reader can produce — *read it*, *read it as an older
   generation and upgraded*, *refused, and why* — are distinguishable all the way
   out, or the user is left with "could not open file" and no next step.
5. **Never partially open.** A reader that understands two thirds of a newer
   document and presents the result as the user's work has silently deleted a
   third of it, and the user will save over the original.

## Costs

- **Every supported generation is reader code that must keep working**, which
  means a corpus of real documents from each generation, opened on every build.
  Without the corpus the support claim is a belief, and it will be wrong at the
  first refactor of the loader.
- **A break splits the user population** across versions that can and cannot open
  each other's work, for as long as both are in use. That cost is paid in support
  load and it is the reason a break must be earned rather than chosen.
- **The upgrade path is code that will never be deleted.** Budget for it as a
  permanent liability rather than a transitional one.

## Prohibitions

- **Never infer a generation from a shape** when a stamp exists, and never write
  a document without one.
- **Never rewrite a user's file on open.** Upgrade in memory; the user's save is
  the consent.
- **Never let a break happen without a number.** An undeclared incompatibility
  reaches the user as a file that will not open, with nothing to say why, and it
  destroys more trust than the defect it was fixing.
- **Never claim support for a generation you do not test.** Drop it explicitly
  instead; a stated limit is honest and an untested claim is not.
