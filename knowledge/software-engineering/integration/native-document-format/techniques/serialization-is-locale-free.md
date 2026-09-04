---
layer: technique
type: technique
subject: native-document-format
technique: serialization-is-locale-free
status: forged
laws: [absent-guard-is-loud, gate-sees-target]
shared_with: []
use_when:
  - documents saved in one region fail to open in another
  - numbers in a saved file appear with an unexpected decimal separator
  - a dependency sets a process-wide regional convention at startup
  - deciding what a test suite must run under before a format ships
---

# Machine-facing serialization is locale-free

A file passed between programs must mean the same thing everywhere it is opened.
That forbids any dependence on the regional conventions of the person who saved
it — and the reason this rule needs a technique rather than a sentence is that
the mechanism which violates it is not in the serializer, is not visible at the
call site, and is frequently not even in the application's own code.

## The trap: a process-global set by somebody else

Number-to-text conversion in most runtimes consults a **process-wide regional
setting**. It is established once, early, often by a framework's initialization,
sometimes by a library the application merely links against, and thereafter it
reaches every conversion in the process, including the ones inside the
serializer, including the ones inside dependencies the serializer calls.

So the failure looks like this. A user whose regional convention writes a decimal
fraction with a comma opens the application. Every numeric property written to
their saved document is converted using that convention. The document is now
unreadable by a parser expecting the machine-facing form: values are truncated at
the separator, or rejected, or split into two tokens. The document does not
degrade gracefully — it is corrupt, and the failures downstream of the corruption
are crashes rather than wrong values, because the structures being built are
missing fields the code assumed were there.

Two properties make it survive into release. It is **invisible to the
development team**, because their own convention is the one the machine-facing
form matches. And it is **not fixable at the call site**: a serializer written
with perfect care still calls a conversion whose behaviour a global changed
underneath it, and a dependency's own conversions are not the application's to
audit.

## The rule

**Every machine-facing write uses a fixed, locale-independent representation for
numbers, dates and separators. The user's regional convention is applied at
exactly one boundary — presenting a value to a person, and reading one they
typed — and nowhere deeper.**

Stated as a place rather than a policy: the presentation layer converts in both
directions at the edge of the interface, and everything below it, including
everything that reaches a file, a wire or a log, speaks the fixed form. The
widget layer of any mature interface toolkit already does exactly this
conversion, which means the correct implementation is usually *less* code, not
more — the defect is normally an extra conversion someone added, not a missing
one.

## How the property is actually achieved

Care at the call site is not the mechanism. Three things are.

1. **Pin the global explicitly and early.** Set the process-wide regional
   convention to the neutral one at startup, before any dependency has a chance
   to set it, and treat any code that changes it later as a defect. A downstream
   consumer that requires the neutral setting is doing exactly this and is
   depending on it; discovering that requirement from a crash report is the
   expensive route to the same conclusion.
2. **Parse with the locale-independent reader, always.** The rule is symmetric
   and the read half is forgotten more often than the write half. Data being
   parsed — by the application or by any library it hands the data to — is read
   with the fixed representation, because a document that was written correctly
   and read under a user's convention fails in exactly the same way.
3. **Run the suite under a hostile convention.** This is the technique's
   instrument, and everything else is a belief without it.

## The negative test is the instrument

A test suite that runs only under the conventions the developers use is observing
a proxy for the property it claims to check, and it passes precisely when the
proxy and the target diverge — which is
[gate-sees-target](../../../_laws.md#gate-sees-target) in its purest form. The
suite must execute at least one full pass under a regional convention whose
decimal separator differs from the neutral one, and the assertions that matter
are: a document saved under it is byte-identical to one saved under the neutral
convention, and a document written under the neutral convention parses correctly
under it.

That check is a guard that must be switched on, which makes it the kind of guard
that quietly is not:
[absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud). A hostile-locale
job that exists but is not wired into the required set of a build protects the
example and not the product. Either it runs on every build, or its absence is a
recorded, visible decision.

## Boundary with presentation-side localization

The presentation half of this — which language paints first, how a switch feels,
how layout survives a longer language — belongs to
[locale-runtime](../../../client-architecture/i18n/techniques/locale-runtime.md),
and the two techniques share one seam and no ground. The rule for choosing: if
the value is on its way to a person's eyes, it is a localization concern and the
user's convention governs; if it is on its way to a file, a wire or another
program, it is this technique's and the user's convention must not reach it. The
consequences of getting each wrong are different in kind, which is the strongest
argument for keeping them separate: a localization defect makes the product feel
foreign to some users; this defect makes their work unopenable.

## Costs

- **The fix is frequently not backwards compatible.** Documents already written
  in a user's convention exist, and they are corrupt in a way that cannot always
  be repaired without knowing which convention wrote them. Reading them may
  require a heuristic, and a heuristic on ambiguous numeric text is a guess. The
  honest path is a declared generation break plus a best-effort repair that says
  what it assumed — see
  [format-generations-are-declared](./format-generations-are-declared.md).
- **Pinning a process-wide global is a decision imposed on every dependency in
  the process,** including ones that wanted the user's convention for their own
  presentation. Those must be routed through explicit per-conversion formatting
  at the presentation boundary, which is where they should have been anyway.
- **The hostile-locale run costs a build lane.** It is the cheapest insurance in
  this subject.

## Prohibitions

- **Never use the process-wide convention to write a file, a wire message, a log
  line or a key.** Not "usually not" — never; the exception is what gets copied.
- **Never repair a corrupted document silently.** A value recovered by guessing
  which convention wrote it is a guess and must be surfaced as one.
- **Never rely on a code review to hold this property.** The violating call is in
  a dependency and the reviewer cannot see it.
- **Never test only the write path.** The reader is half the contract and the
  half more often left locale-sensitive.
