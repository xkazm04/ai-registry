---
layer: technique
type: technique
subject: native-document-format
technique: ignorable-extensions-must-be-declared
status: forged
laws: [gate-sees-target, absent-guard-is-loud]
shared_with: []
use_when:
  - adding application-specific data to a document in a format somebody else defines
  - outside tools reject documents that the application and its consumer both accept
  - relying on a reader to skip what it does not understand
  - deciding what proves a written document is valid
---

# An extension is only ignorable if the document stays valid

Riding application-specific state in a region a downstream reader ignores is the
move that makes a shared document format workable. It rests on a promise the
format itself makes — *a conforming reader skips what it does not
understand* — and that promise is only extended to an artifact that is **valid
under the format's own rules**. An extension that breaks validity is not
ignorable; it is a defect that two lenient readers happen not to notice.

## The failure, and why nothing inside the system detects it

The shape recurs across every extensible document syntax. The format offers an
extension mechanism, and the mechanism has a **declaration requirement**: before
an extended vocabulary may be used, the document must announce it — a declaration
that binds the extension's prefix to its owner, a registration entry in the
document's own preamble, a flag in a block header that tells a reader whether the
block may be skipped or must be understood.

An application that writes the extended vocabulary and omits the declaration
produces documents that are, by the format's rules, invalid. What happens next is
the trap:

- The application reads them, because its own parser was written against its own
  output and never checks the requirement.
- The downstream consumer reads them, because it is lenient by design and
  extension data is exactly what it was going to skip anyway.
- **Every conforming tool in the world rejects them.** Validators, transformers,
  generic editors, other people's scripts — everything that implements the
  format's rules rather than the application's habits.

And nothing internal ever reports it, because the two readers that could report
it are the two that accept the files. Defects of this shape are typically found
by an outsider trying to process the documents with ordinary tooling, and they
have usually been shipping for years. The workaround an outsider is forced into —
injecting the missing declaration before processing — is diagnostic: when other
people must repair your files before reading them, the files are invalid,
regardless of what your own software says.

## The rule

**An extension mechanism that relies on a reader ignoring what it does not
understand is only safe when the artifact remains valid under the format's own
rules. "Our reader accepts it" is not validity. The check is a conforming
validator run over documents the application actually produced, not the
application's own parser.**

The application's parser is a proxy for conformance, and it agrees with the
target exactly until the moment they diverge — which is the moment the check
existed for
([gate-sees-target](../../../../_laws.md#gate-sees-target)). A validator that is
part of the format's ecosystem rather than the application's is the only
instrument that observes the actual property.

## The procedure

1. **Read the extension mechanism's requirements before using it**, not after.
   Every mechanism of this kind has a small number of obligations — declare the
   vocabulary, place the declaration in scope, mark whether the region is
   skippable, keep the region where a reader is permitted to skip it. They are
   short, and they are the whole contract.
2. **Emit the declaration from the writer, once, structurally.** Not per element,
   not "wherever we remember" — in the one place the document's preamble is
   built, so that it is impossible to write the extended vocabulary without it.
3. **Validate output in continuous integration.** Take documents the application
   produced during its own tests — not hand-written fixtures, which are written
   by someone who knows the rules — and run the conforming validator over them.
   Failure is a red build.
4. **Validate on the input side too, at least in development builds.** A reader
   that accepts invalid documents is how the writer's defect stays hidden; a
   strict mode in test builds finds it the day it appears.
5. **Fix it as a declared change, and expect it to be cheap.** Adding a missing
   declaration usually leaves every existing document readable by every existing
   reader, so it is one of the rare corrections that does not need a generation
   break — verify that before assuming it, and if the fix does change the
   documents' meaning to a conforming reader, declare it per
   [format-generations-are-declared](./format-generations-are-declared.md).

## Why this is not solved by care

The validator has to be wired into the required set of the build, and a check
that must be switched on is a check that mostly is not
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)). A validation
step that exists in a script nobody runs, or in a lane that is allowed to fail,
protects nothing — and this defect's whole character is that it is silent from
the inside, so an unrun validator produces exactly the same experience as no
validator at all. Either the gate engages on its own for every build, or its
absence is a recorded decision somebody made on purpose.

## Costs

- **A conforming validator is a dependency in the build**, with its own version
  and its own upgrade noise. Accept it; the alternative is being told by a user.
- **Validation over produced documents needs produced documents**, which means
  the test suite must actually save files rather than assert against in-memory
  structures. That is worth building for other reasons, but it is not free.
- **Strict reading in development will reject documents the field accepts.**
  Keep the strictness in test builds and keep the shipped reader lenient about
  other people's extensions — being strict about your own output and lenient
  about your input is the correct asymmetry.

## Prohibitions

- **Never treat acceptance by your own parser as conformance.** It is the one
  reader guaranteed to share the writer's misunderstanding.
- **Never use an extension mechanism you have not read the rules of.** The rules
  are short and the cost of guessing is measured in years.
- **Never leave a known validity defect standing because "everything works".**
  Everything that you built works; the point of a shared format is the things you
  did not build.
- **Never put load-bearing meaning in a region readers are told to skip.** If the
  document is wrong without it, it is not ignorable data, and expressing it that
  way lies to every conforming reader — see
  [format-is-the-engines-input](./format-is-the-engines-input.md).
