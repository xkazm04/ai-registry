---
layer: technique
type: technique
subject: compile-time-code-emission
technique: call-site-diagnostics
status: forged
laws: [failure-not-empty-success, verdict-survives-boundary]
shared_with: []
use_when: [an emitter rejects input by panicking or throwing, a macro error points at the invocation as a whole or into generated code, a user fixes one macro error per build because only the first is reported, an expansion depends on a caller-side name and fails with the compiler's generic message]
---

# Call-site diagnostics

An emitter reports every problem with its input as a compiler diagnostic
attached to the caller's own tokens - the unknown option, the misspelled
field, the unsupported shape - with a message that names what was expected.
It never crashes to report a problem, never returns an empty expansion and
lets the compiler discover the consequence, and never stops at the first
problem when the input has several.

## Why each alternative is worse

- **Crashing.** Hosts typically catch an emitter's panic or exception and turn
  it into an error, so the build fails cleanly - but the error is located at
  the invocation as a whole and its text is whatever the crash said. One
  language's own parser library says it plainly: emitting a compile-error
  item produces a better diagnostic than panicking. A crash also discards
  every other problem the emitter would have found.
- **Empty or partial expansion without a diagnostic.** The compiler then
  reports what is missing - an unresolved name, a type that does not exist -
  at a line the user did not write, and the actual cause, the input the
  emitter could not handle, is never mentioned. That is a failure spelled as
  an empty success ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
- **A located but generic message.** A diagnostic that points at the right
  token and says "invalid input" is a verdict erased at a boundary
  ([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)):
  the emitter knew it expected one of three keywords and saw a fourth, and
  the user has to rediscover that.

## Procedure

1. Carry the source location of every input piece from the parse onward.
   Every diagnostic is attached to the smallest piece that is wrong, not to the
   whole invocation.
2. Name the expected set in the message, and when the fix is mechanical,
   offer it: hosts with fix-it support let the emitter attach a replacement
   the editor can apply.
3. Collect diagnostics instead of returning on the first. Most hosts let an
   emitter combine several errors into one emission; a design that throws on
   the first is a design that reports one per build.
4. Where a partial expansion helps the compiler find the remaining errors in
   the caller's own code, emit it alongside the diagnostics. One host design
   says this directly: an emitter that reports diagnostics is still expected
   to produce an expansion unless it aborts. Where a partial expansion would
   only add noise, emit the diagnostics alone.
5. Validate what the emitter depends on at the caller, not only what it
   parses. When an expansion requires a caller-side name to exist - a
   parameter with a fixed name, a type in scope - check for it and report its
   absence in the emitter's own words. Left to the compiler, the absence is
   reported as an unresolved name inside generated code, and the user has to
   read the emitter's documentation to learn what it meant.

## Diagnostics are part of the interface

The wording and the location of an emitter's diagnostics are an interface
its users learn, and a refactor of the emitter can move them silently - the
error is still produced, now on the wrong token or with a worse message.
Pin both with compile-fail fixtures (the subject's testing technique owns
them), and treat a change to a fixture as an interface change in review.

## When the host discourages it

One generator vendor recommends that source generators *not* report
diagnostics at all, because doing so without breaking incremental caching is
hard, and directs authors to a separate analyzer for validation. The rule
survives in a different shape there: the diagnostic still exists, still
lands on the caller's tokens and still names the expectation; it is produced
by the analyzer that runs beside the generator, and the generator emits
nothing for input it cannot handle. That split is right wherever the host
caches generator output aggressively; elsewhere one emitter owning both is
simpler.
