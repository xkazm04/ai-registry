---
layer: technique
type: technique
subject: crash-forensics-attribution
technique: engine-crash-vocabulary
status: forged
laws: [one-authority-per-quantity]
use_when: [writing a diagnostic report for someone who did not write the crashing code, building a glossary for engine crash terms, a triage output keeps getting escalated for translation]
shared_with: []
---

# Engine crash vocabulary

The concern: a diagnostic tool whose users are not the authors of the thing it diagnoses owes
them a translation layer. Engine crash output is a dialect — precise, compressed, written by
engine engineers for engine engineers — and the designer, producer or automated agent who has
to act on it cannot read it. An untranslated diagnosis gets escalated to somebody who can read
it, which erases every minute the tool saved.

Treat translation as a general obligation of diagnostics, not a courtesy specific to one
engine. The same rule binds a build-system error surfaced to an artist and a database fault
surfaced to an analyst.

## What a glossary entry contains

Four fields, and dropping any one of them breaks the entry:

- **The raw term, verbatim.** Exactly as the runtime emits it, so it is searchable both ways:
  a reader arriving from the log finds the entry, and a reader arriving from the gloss can
  find the log line. Never paraphrase the key.
- **What actually happened**, in one or two sentences of plain language, describing the
  mechanism rather than restating the term in longer words. "The code asked for something at
  a memory location that no longer holds a valid object" is a translation; "an access
  violation occurred" is not.
- **What usually causes it** — the class or two of mistake that produce this term in practice.
  This is the field that carries real value, because it is the bridge from the term to a
  question the reader can act on.
- **What it does not mean.** Every common term has a common misreading, and the misreading is
  what generates wasted investigation. An out-of-memory report on a machine with free memory
  usually means an address-space or pool exhaustion, not a full machine; saying so in the
  entry saves an afternoon.

Add a fifth field where it is honest: **who typically owns it**. Keep it advisory and keep it
out of the attribution scorer — a glossary that quietly becomes a second source of ownership
verdicts is a second authority for a quantity that already has one.

## Which terms earn an entry

Not every term. A glossary that tries to cover the engine becomes unmaintained within a
quarter and then actively misleads. Include a term when it satisfies all three:

1. It appears in real crash reports your users actually receive.
2. Its plain meaning to a non-engine-engineer is absent or, worse, misleading.
3. Knowing what it means changes what the reader does next.

That yields a working glossary of roughly twenty to forty entries for a large engine — fatal
assertion phrasing, memory access faults, garbage-collection and object-lifetime terms, handle
staleness, serialisation and archive-version mismatches, stack exhaustion, shader and resource
compilation failures, thread-affinity violations. Add an entry when a term is asked about
twice; that is the honest signal, and it costs nothing to wait for it.

## Two layers: terms, and a whole-report translation

A term glossary alone still hands the reader a call stack. Build a second layer keyed on the
**fault class** rather than on vocabulary: for each class, a short human label, one sentence of
*what happened*, and one sentence of *what to do about it*. That triple is what lets a report
open with a legible story — "freed object reused: the game used an object that had already been
cleaned up; hold it with a tracked reference instead of a raw pointer" — before any frame is
shown. Offer it as a mode, so the same report serves both audiences from one source.

Both layers live in **one** module and every surface reads them through it — the crash view, the
pattern library, the error history. A second inline copy of a gloss is a second authority for
the same text, and the copies diverge in the direction of whoever edited last.

## Admitting terms without admitting noise

Glossaries get layered: a crash-specific term map on top of a general dictionary for the
engine's wider vocabulary. That fallback is useful and it is also the trap, because a general
dictionary holds everyday words — `add`, `move`, `remove`, `none` — and any process that scans a
call stack against it turns every stack into a bag of meaningless terms.

Admit tokens by **shape plus an explicit exception list**, in that order:

- Accept a token that is structurally an engine identifier: it contains an underscore, or it
  carries two or more capitals — which covers the engine's type vocabulary while rejecting
  single-capital jargon keys that are ordinary words.
- Try the token again with a known one-letter type prefix stripped, and again lowercased, so a
  prefixed type name still resolves.
- Accept a small, deliberately-listed set of plain words that are genuinely crash vocabulary in
  context.

The governing property: **a crash word missing from the list simply contributes no term — it
never contributes a wrong one.** Under-admission is a quiet loss of signal; over-admission is
noise that degrades everything downstream that consumes the term set.

## Presentation rules

- **Preserve the raw text and put the gloss beside it, never instead of it.** The engine
  engineer who eventually reads the report needs the exact string, and a translated-only
  report is a lossy report. Raw first, gloss second, visually subordinate.
- **Gloss on first occurrence in a report**, not on every occurrence — repeated inline
  explanation makes a report unreadable to both audiences.
- **Never invent a gloss.** An unknown term is reported untranslated with the fact that it is
  unknown stated explicitly. A confident-sounding wrong translation is worse than none: it is
  a wrong diagnosis handed to someone with no way to check it.
- **Write for the least technical reader who must act**, not for the average one. The engine
  engineer loses nothing from a plain-English line; the producer loses everything without one.

## Maintenance

Own the glossary in one place, version it with the tool, and review it whenever the engine
version moves — terminology changes across major versions and a stale gloss is a confident
lie. When a term's gloss is corrected, that correction is worth broadcasting; people carry
wrong mental models of crash terms for years.

## Decision rules

- When a term is unrecognised, say so and pass the raw text through. Silence about the gap is
  the failure mode; an explicit "no gloss available for this term" is survivable.
- When a gloss would require three paragraphs, the entry is really a pointer to a defect class
  rather than a vocabulary item. Keep the two-sentence version here and let the class
  catalogue carry the depth.
- When the audience is exclusively engine engineers, keep the raw output and skip the gloss
  layer — translation for an audience that does not need it adds noise and invites the
  precision loss it was meant to prevent.

## When not to use

Do not use the glossary as a diagnosis. Recognising the term is not the same as knowing the
cause; "this is a use-after-collection" narrows the class but does not name the subsystem, and
a report that presents a gloss where a verdict belongs will be read as a verdict.

Do not build a translation layer over output your users never see. If the raw record is
already hidden behind a structured report, translate the report's fields instead — glossing
strings nobody encounters is maintenance cost with no reader.
