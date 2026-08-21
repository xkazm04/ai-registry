---
layer: technique
type: technique
subject: cv-parsing-and-career-reading
technique: text-extraction-damage-and-repair
status: forged
laws: [absence-of-evidence-is-not-evidence, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [candidate text comes back garbled or empty, adding a new document format to intake, auditing why a cohort scores unexpectedly low]
---

# Text extraction damage and repair

Getting characters out of a career document is not a solved problem that a library
hides from you. Every format loses something, each loses something different, and the
losses are silent: what comes back is text, so the pipeline proceeds. This technique is
the catalogue of damage, the repairs that are safe to make, and the boundary past which
repair becomes invention.

## The damage catalogue

**Encoding corruption.** Text encoded in one byte scheme and decoded as another
produces the characteristic garbled sequences where accented and non-Latin characters
used to be. The damage is not uniform: it destroys exactly the diacritic-heavy names,
cities and institutions of candidates outside the pipeline's home language, and leaves
plain ASCII résumés untouched. A team that only reads its own language's files will not
see it, and the affected cohort will look uniformly like weak matches because every
proper noun in their file is now unsearchable noise.

**Letter-spaced text.** Design tools and some export paths encode tracking by placing
each glyph separately or by interleaving spaces, so a heading renders on screen as
`EXPERIENCE` and extracts as `E X P E R I E N C E`. Section detection then fails
completely, which reroutes the document's most important region into an unparsed
remainder. It is one of the highest-value repairs available because the failure is
total rather than partial.

**Reading order.** Fixed-layout formats store positioned glyphs, not sentences. Two- and
three-column templates, sidebars, and skill tables interleave on extraction: a job title
lands beside an unrelated date, and a skills column is spliced through the middle of a
role description. This corrupts association rather than characters, so it survives every
spell-shaped sanity check.

**Structure held outside the text flow.** Headers, footers, text boxes, comments and
table cells are skipped by some extractors and duplicated by others; a page footer
repeated fourteen times inflates every term-frequency measure over the document.

**Typographic artefacts.** Ligatures decoding to a single codepoint, soft hyphens
splitting words at line breaks, non-breaking and zero-width spaces inside otherwise
matchable terms, smart quotes that break literal matching.

**No text at all.** Scans and image-only exports — a different failure, and it must be
recognised as one rather than treated as an empty document.

## The repair order

Repairs are not commutative. Run them in this order and re-measure after each:

1. **Detect the failure class before repairing.** Decide first whether you are holding
   corrupted text, positionally scrambled text, or no text. Repairs applied to the wrong
   class make things worse.
2. **Fix encoding, then normalise.** Repair mis-decoded byte sequences first; apply
   Unicode normalisation, ligature decomposition and whitespace canonicalisation after,
   so normalisation does not freeze corruption in place.

   The strongest form of this repair is a **scored competition, not a fix**. Cheap
   detection markers decide whether to attempt anything at all; then produce every
   plausible reading — the original text, a substitution-table repair, and a full
   re-encode-and-re-decode through the suspected byte scheme — score each with a
   language-plausibility measure such as the density of the target language's
   diacritics or its stopwords, and keep the winner. This is strictly better than a
   fix-in-place because the original is always in the candidate set: a repair that
   makes things worse loses, and the pass is therefore safe to run on documents it does
   not understand. It also degrades gracefully when the re-decode throws, falling back
   to the substitution reading rather than to nothing.
3. **Reconstruct letter-spaced runs.** Detect runs where single characters alternate
   with separators above a threshold, and rejoin them. Bound the repair: apply it to
   runs long enough to be statistically unambiguous, and never across a token that could
   legitimately be single characters — an initials block, a spaced acronym, a
   character-per-cell table.
4. **Repair layout only where you can prove it.** Column de-interleaving is a heuristic;
   gate it on a measurable signal, and prefer leaving text in its extracted order over a
   confident wrong reconstruction. A misordered document is recoverable by a human
   reader; a reordered one may not be.
5. **Measure the result.** A recovered-text quality score — character-class
   distribution, dictionary hit rate against expected languages, ratio of recognised
   section headings, alphanumeric-to-noise ratio, residual damage counts — is the gate
   for everything downstream.

**Single-source the definition a repair and its metric share.** The pass that *fixes*
letter-spacing and the pass that *counts* it must derive from one character-class
definition in one place, differing only in an explicit threshold — repair aggressively,
count conservatively. Two independently written patterns for "the same" damage drift
within a release, and the symptom is a quality metric that reports clean documents the
repair is still mangling, or vice versa. The same rule applies to any repair/measure
pair.

**Bound the repair itself, not only the parse.** A character-level repair is typically a
linear scan with a per-match callback, which means the pathology it exists to fix is
also its denial-of-service vector: a crafted multi-megabyte buffer of exactly the
damage pattern will pin a worker on a public upload path. Cap the repaired window and
the number of substitutions, let the unrepaired tail pass through verbatim, and size the
caps off the real distribution — genuine career documents are orders of magnitude
smaller than the cap, so the bound never fires on a real candidate.

## The threshold rule

**Below a measured quality floor, the document is degraded intake, not thin input.**

This is the whole point of measuring. A file that yields two hundred characters of
noise must not proceed to scoring as a candidate with little to say; it routes to the
visible degraded queue with its reason. [Absence of evidence is not
evidence](../../_laws.md#absence-of-evidence-is-not-evidence) fails here first and
hardest, because the pipeline's own damage is the thing being read as the candidate's
lack of experience.

Set the floor from measurement, not intuition: sample real intake, plot recovered
quality, and put the line where human review confirms unusability. Keep the distribution
on a dashboard — a shift in it is how you learn that a format, an export tool or a locale
has started failing.

## Hostile documents

Career documents are attacker-controlled uploads from a party with an interest in the
outcome, and modern document formats are archive containers with declarative expansion
features. Extraction runs under limits — on-disk size, *declared* decompressed size
checked before decompressing, page count, cumulative text budget, entity resolution
disabled, external references not fetched, wall-clock bounded — and a document that trips
one is a *rejected* upload with a reason, never a partial extraction quietly continued.
Hardening a parser is general engineering practice; what belongs here is that the refusal
surfaces as a candidate-visible intake state rather than an error swallowed by a worker,
and that a limit relaxed at one layer is re-asserted at the next.

## Repair versus invention

The line is: **a repair is reversible reasoning about the encoding; an invention is
reasoning about the content.**

Restoring a mis-decoded character sequence is repair — the original bytes determine the
answer. Rejoining letter-spaced glyphs is repair. Guessing which column a date belonged
to, filling a truncated employer name, or correcting an apparent typo in a certification
number are inventions — the last a damaging one, because identifiers must never be
synthesised. When you cannot repair, record the region as unrecoverable and let the
honest gap travel.

[Meaning does not live in a label](../../_laws.md#meaning-does-not-live-in-a-label)
applies to headings in particular: never derive structure from a display string you had
to guess at, and key sections off a stable internal vocabulary that many surface strings
in many languages may map onto.

## When not to use this

Do not build repair machinery for a format you can refuse. If image-only scans are a
fraction of a percent of intake, routing them to a human is cheaper and more honest than
a recognition stage whose errors are invisible. Do not apply aggressive repair to text
that arrived structured — a typed application form, a parsed profile feed — because
repairing already-clean text only introduces damage. And never repair *after* the
personal-data and injection screens have run: those screens must see the same text the
model will.
