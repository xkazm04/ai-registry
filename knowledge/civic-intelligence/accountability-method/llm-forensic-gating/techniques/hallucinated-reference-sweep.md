---
layer: technique
type: technique
subject: llm-forensic-gating
technique: hallucinated-reference-sweep
status: forged
laws: [provenance-or-nothing, disclose-never-repair]
shared_with: []
use_when:
  - model prose may contain legal or registry references outside citation slots
  - closing the gap between a clean citation list and fabricated prose
  - a reference resolves but its venue, year or imprint may be invented
---

# Hallucinated-reference sweep

Citation gates check the slots the schema labels "citation". The sweep checks
everything else: it scans the *entire* verdict — every prose field, every
nested string — for anything shaped like a formal reference (a statute number
in the national citation convention, a registry identifier), and requires each
one to resolve against the known set of real references. The gap it closes is
real and dangerous: a model can keep its citation list immaculate while
dropping a confident, fabricated statute number into a narrative sentence,
and that sentence renders verbatim to readers. A hallucinated legal reference
anywhere in prose fails the whole verdict.

## Procedure

1. **Serialize the whole object and extract references from the serialization.**
   Sweeping the flattened text of the entire verdict — rather than an
   enumerated field list — means a new prose field added to the schema next
   quarter is covered by construction, not by someone remembering to register
   it. Nothing shaped like a reference can hide in a field the sweep does not
   know about.
2. **Use the one canonical reference pattern, imported.** The extraction
   pattern for the citation convention already exists in the ingest layer,
   complete with its hard-won negative lookaheads for sibling numbering series
   that share the shape. Import it. A restated sweep-local pattern will drift
   from the ingest pattern, and then the sweep and the store will disagree
   about what a reference even is.
3. **Normalize before membership.** Strip leading zeros, collapse whitespace,
   reduce each match to the canonical `number/year` form — so formatting
   variants of one real instrument do not read as an unknown one. Then check
   the normalized form against the known set assembled at payload time (the
   store's instruments plus the official consolidated registry, merged).
4. **Reject with the accusation named.** The error message should say exactly
   what it means: this cited reference is not a real instrument in scope — a
   fabricated legal citation. Gate messages are read by the people tuning the
   pipeline; a message that names the failure class keeps the severity of
   this class culturally visible.

## Decision rules

- **When a swept reference fails membership, fail the verdict — never repair
  it.** The nearest real number is one digit away from the fabricated one,
  and "correcting" to it authors a claim about a real instrument the model
  never analyzed. A repaired reference is an invented reference.
- **When the known set has a coverage boundary, widen the set before
  tightening the sweep.** If real, verifiable instruments fail because the
  known set only covers one collection or era, merging the authoritative
  registry is the fix; teaching the model to avoid citing real law to pass a
  gate is the anti-fix.
- **When the model is unsure of a number, the doctrine is describe, don't
  cite.** The analyst contract must offer this exit explicitly — "when in
  doubt, describe the instrument without a number" — because a gate without a
  legitimate escape route trains illegitimate ones.
- **When prose references and citation slots disagree in count, that is
  signal, not noise.** Prose rich in references that never appear as typed
  citations means claims are being grounded rhetorically instead of
  checkably; feed that pattern back into the contract's next revision.

## Identity and attributes fabricate at different rates

The sweep above settles one question: does this reference exist. That is
necessary, and it is not where invention concentrates. A citation is a
compound object — an identifier that addresses a document, and the attributes
that describe its standing: where it appeared, in what year, under whose
imprint. The two halves have different verification costs, and the cheap half
is the one the membership check already covers.

The measured shape, from a generated research corpus whose references were
extracted and then checked twice against outside authorities: of the resolvable
identifiers, effectively all resolved and none were invented. Of the
venue-and-year attributes carried by those same references, well under half
verified, a substantial minority were judged fabricated outright, and the rest
could not be resolved either way. Identity was clean. Standing was not.

The mechanism defeats the sweep by construction: **the generator attaches a
plausible, prestigious venue and an earlier year to a real, resolving
identifier.** Membership passes, because the document is genuinely there. The
prose-level checks find nothing, because this is not a bare fabricated fact.
What was invented is the claim's *authority* — precisely the part a reader uses
to decide how much weight it carries. A preprint dressed as a proceedings paper
misrepresents the one thing the citation was included to establish.

### The contradiction is usually already inside the citation

Where an identifier encodes its own issuance date — and many registry, docket
and preprint conventions do — a claimed year earlier than that date is not
suspicious, it is **impossible**, and the refutation is arithmetic. No network
call, no known set, no authority to consult: the citation refutes itself from
two of its own fields. In the corpus above, the fabricated attributions were
dominated by exactly this shape, a venue-year pair predating the identifier's
own existence.

That makes the strongest attribute check also the cheapest one, which inverts
the usual order of work. Run the intrinsic cross-field comparison first,
offline, over every citation; spend external lookups only on the residue it
cannot decide.

### Where the arithmetic does not transfer, and why

The check was run against two corpora and the result split, which is the more
useful outcome. Over generated research prose citing preprints it found real
contradictions and produced none against the hand-written half of the same
repository — the signal is clean, because a preprint citation carries at most
one year and that year is the claim.

Over **legislative** prose it collapsed: of its flags, all but one were correct
prose. The reason is structural and worth stating, because it decides whether
this check is worth wiring anywhere. A statute's identifier encodes its
*enactment* year, but the years standing beside a statute in prose are
overwhelmingly **process dates** — when the bill was submitted, read, returned
by the upper chamber, signed. A bill submitted one year and enacted the next
makes "an earlier year beside a later identifier" the normal case rather than
the impossible one, so the predicate that is decisive for a bibliography is
merely descriptive here.

The rule that generalises: **the intrinsic check is only decisive where the
identifier's date and the claimed date answer the same question.** Before
wiring it, name what the nearby year means in that corpus. Where a document
has one date, the contradiction is real; where its subject has a lifecycle,
the nearby years are stages of that lifecycle and the check must be given the
one field that carries the claim, or not run at all.

That is not a reason to drop the attribute half in such a domain — the failure
it targets was found there by hand, and it is the worst case the membership
check can produce: **a real identifier standing where a different real
identifier was meant.** One digit apart, both genuine, so membership passes and
the citation now points at a law nobody analysed. Where the intrinsic
arithmetic cannot decide, that class needs the attributes compared against the
register entry the identifier resolves to, which costs a lookup — and it is the
lookup worth spending, because a swapped-but-real reference is invisible to
every cheaper check.

### Decision rules for the attribute half

- **Gate identity and attributes separately, with separate verdicts.** A single
  pass/fail over "the citation is good" collapses a clean identifier and an
  invented venue into one number that hides which half failed — and the two
  failures have different remedies, one fatal and one editorial.
- **Prefer the intrinsic contradiction to the external lookup.** It is free,
  deterministic and offline, so it runs over every citation on every commit
  rather than over a sample in a periodic audit.
- **Unresolvable is not fabricated.** The residue left after the arithmetic
  check is large and mostly innocent: attributes no reachable authority
  indexes. Folding it into the fabrication count destroys the number's meaning
  — carry it as its own verdict, the way
  [three-verdict-vocabulary](../../claim-verification-and-provenance/techniques/three-verdict-vocabulary.md)
  separates a failed check from an unrunnable one.
- **When an attribute cannot be verified, drop it — never guess it.** The
  citation then stands as a bare identifier and title, which is checkable,
  rather than as a decorated one, which is not. This is
  [disclose-never-repair](../../../_laws.md#disclose-never-repair) applied to
  the descriptive half: an attribute invented to round out a citation is the
  same act as a repaired reference number, and it is likelier, because it feels
  like formatting rather than like a claim.

## When not to use it

The sweep is a reality check on formal references, not a truth check on prose.
It cannot catch a fabricated *fact* stated without a reference shape — a made-up
quotation, an invented event — and pretending otherwise inflates trust in the
gate; those classes belong to citation-per-claim binding and human review. Do
not extend the sweep pattern beyond conventions with a decidable shape:
loosening it to catch "anything that might be a reference" floods the gate
with false positives from dates, monetary amounts and document numbers, and a
gate that cries wolf gets bypassed. Precision is what makes the hard-fail
posture sustainable.

The attribute check has its own blind spot, and it is the mirror of the
sweep's: it catches an attribute that contradicts the identifier, never one
that is merely wrong while staying consistent with it. A fabricated venue
bearing a year the identifier permits survives the arithmetic untouched, and
only an external lookup or a human who knows the field will catch it. Report
the arithmetic check's coverage as what it is — the impossible subset — so a
green result is not read as a verified bibliography.
