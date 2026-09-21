---
layer: technique
type: technique
subject: translation-pipeline-topology
technique: serialization-transport-safety
status: forged
laws: [format-skeleton-is-inviolable]
shared_with: []
use_when: [choosing the wire format for a batch machine-translation request, a batch response fails to parse or returns truncated values, the target language's mandated quotation marks share a code point with the transport's delimiter]
---

# Serialization transport safety

A pipeline can be defeated by a translation that is *right*. The model returns
the correct target sentence with the correct target punctuation — the low-high
quotation pair the target's typography requires — and the batch fails to parse,
or worse, parses into a value quietly shorter than the one that was sent. The
defect lives in the seam, where a character that is *data* to the language is
*structure* to the transport. This bundle makes the collision more likely, not
less: it requires the machine-readable skeleton byte-identical
([the format skeleton is inviolable](../../../_laws.md#format-skeleton-is-inviolable))
and it requires each target's own quote glyphs. Those two requirements meet
inside the wire format, so the wire format is what has to move.

## Why it is invisible

Both halves are individually correct and every instrument sees only one: a
native reviewer sees good German, a schema validator sees malformed input and
blames the model, a retry sees a transient failure. No role owns the seam:

- **It presents as flakiness, not a bug.** One item ruins a batch of hundreds,
  and the same source re-rolled produces the same glyph, so the run fails
  "sometimes" in proportion to how many quoted strings the batch held.
- **The silent outcome is worse than the loud one.** A parse failure costs a
  batch; a parser that closes the string at the stray terminator and recovers
  keeps everything before it — a short, grammatical, plausible value that
  survives every human read, is keyed as the translation of that source
  ([source-hash-translation-cache](./source-hash-translation-cache.md)), and is
  served until the source text changes.

## The mechanism, precisely

A text transport ends a string at the first unescaped occurrence of one specific
code point; for the object-notation family that is the ASCII straight double
quote. The pairs this bundle mandates do not use it — the low-high pair of Czech
and German opens at one code point and closes at another, the guillemets are two
more, the CJK corner brackets two more again — so on their own they are inert.

The break is **asymmetric-pair degradation**. The opener is emitted as the
correct distinct glyph and the closer degrades to the ASCII straight quote — the
glyph a generator reaches for to close what it opened, and the one every plain
keyboard, copy-edit pass and quote-folding normalizer produces. The value then
reads `„{title}" anhängen?`: an opener the transport ignores, followed by a
closer it obeys. The string ends there, and the placeholder brace that follows
arrives where the parser expects its next structural token. Three rules follow:

- **Escaping the opener buys nothing.** Only the terminator matters; stripping
  or escaping the low quote leaves the defect exactly where it was.
- **A typographically perfect generator does not remove the risk**, because any
  later normalization to ASCII quotes re-introduces it. This is a property of
  the transport, not the model, which is why prompting cannot fix it.
- **Termination is not the only route.** The guillemet pair's no-break space is
  whitespace a serializer may fold, damaging a value without breaking the parse.
  Any transport that reads characters as framing will eventually be handed a
  target-language glyph that agrees with it.

## Three answers, in order of strength

1. **Choose a transport the target's punctuation cannot terminate** — a
   tag-delimited envelope framed by angle brackets, a length-prefixed field, or
   a line-delimited record carrying its own item identity. One production
   implementation arrived here only after repeated rounds of repairing the
   object-notation form; it moved to a tag-delimited envelope and the class
   stopped occurring. Prefer a delimiter no target language's punctuation
   contains; failing that, a length prefix, which has no delimiter at all.
2. **Address every item by an identity token carried in request and response**,
   so a damaged item is *identified*, dropped and re-requested. Under positional
   association one broken item shifts every later value by one, so each
   translation lands under the wrong key while staying individually plausible —
   a corruption no format check can see. Identity also makes partial success
   expressible: one item fails, not the batch.
3. **A bounded repair pass, declared as the heuristic it is.** Re-escape a
   terminator only where the next non-space character cannot legally follow a
   closed string — a guess, because a value that legitimately ends there is
   indistinguishable, so say so where the pass is written. Two constraints are
   not negotiable: the repair is **idempotent** (twice equals once; a pass that
   re-escapes its own escape doubles the backslash), and it **never alters the
   placeholder set** — a repair that changes the multiset has crossed into the
   skeleton, and the batch fails there instead.

## The gate after transport

Before anything is written, assert per value against its source: the placeholder
multiset, the rich-tag set, that every requested identity came back, and that no
value is empty. This is the skeleton law with a new reason — the transport is now
a suspect alongside the translator. The orphaned placeholder is what truncation
drops, which is why the multiset check catches the common case; it misses a
truncated value with no placeholder after the quote, which is what the identity
and non-empty checks are for. Then fail the batch rather than write a
repaired-but-unverified value: a failed batch costs one increment of compute, a
written truncation costs a wrong string that reads correctly and that nobody
re-verifies.

## When not to use it

- **Single-string interactive calls.** One value, one response, a failure the
  caller sees at once; identity tokens and repair passes are batch bookkeeping.
- **Transports that are already structural** — a binary or columnar protocol
  framing its fields out of band. The class cannot arise, and a repair pass
  there is only a new way to corrupt a correct value.

One hard boundary: this is never an argument for stripping native punctuation or
asking for ASCII quotes in the target. That trades a deterministic, caught
transport bug for a permanent typography defect in every shipped string, which
no gate will fire on again. The quotation marks belong to the language; the fix
belongs to the transport.

## Failure modes

- **Retrying without changing the transport.** The same source yields the same
  glyph; the pipeline pays per attempt and calls the result flaky.
- **Positional association.** One broken item silently re-keys every value after
  it, each plausible on its own.
- **Repairing and writing in one step, or repairing non-idempotently.** The
  assertion must run after the repair, on the repaired value, or the heuristic's
  mistakes publish; and escapes that accumulate across runs become permanent.
- **Filing it as a translation defect.** A reviewer confirms the target text is
  correct and closes the finding; the transport keeps breaking.
