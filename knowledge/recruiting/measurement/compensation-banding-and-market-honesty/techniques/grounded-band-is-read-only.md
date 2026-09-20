---
layer: technique
type: technique
subject: compensation-banding-and-market-honesty
technique: grounded-band-is-read-only
status: forged
laws: [inference-must-look-like-inference, every-decision-names-its-actor, say-only-what-the-record-holds]
shared_with: []
use_when: [a derived pay band is about to become an editable field, someone asks for a manual override on a sourced number, designing how a grounded figure is labelled in an interface]
---

# A grounded band is read-only

A band derived by a documented procedure from named sources can wear a label
that says so — sourced, market-grounded, high confidence. That label is the
whole reason the number is worth more than a guess. The moment a human can type
into the same field, the label becomes a lie about an unknown fraction of the
rows, and no consumer can tell which.

The rule: **a field whose value carries a groundedness label has no manual
override.** Not a discouraged one. Not one that logs. None.

## Why the obvious compromise fails

The instinctive design is an editable field that clears or downgrades its label
when a human touches it. It fails in practice for reasons that are worth
stating, because this compromise will be proposed in every review:

- **The label is what people read; the provenance is what they don't.** A
  downgraded label is a subtle visual difference against a number that looks
  identical. Downstream, the number is copied into a document and the label is
  not.
- **Edits propagate; labels do not survive the copy.** The band leaves the
  system in a requisition, an advert, a message to a hiring manager. Whatever
  care the interface took is lost at the first copy-paste.
- **The edit has no owner.** A typed number has no source, no year, no sample —
  it has an author, and unless the system records who and why, it does not even
  have that ([every decision names its actor](../../../_laws.md#every-decision-names-its-actor)).
- **It removes the pressure that fixes the corpus.** Every override is a report
  that the derivation is wrong for that cell. Absorbed silently into a field,
  it teaches nobody. Refused, it becomes a request to fix the benchmark, which
  is the correction that actually compounds.

## The invariant lives on the writers, not on the field

"No manual override" is almost always implemented as an interface fact: the
field renders read-only, the form will not submit it, the surface explains why.
That closes the door a person walks through and leaves open the one the *system*
walks through — and the second door is wider, because it is opened by routine
maintenance rather than by intent.

The leak has a recognisable shape: a **re-derivation**. The record was produced
once by the documented procedure and its band was pinned. Later, something
re-runs an earlier stage of the pipeline over an *edited* input — the prose was
corrected, the advertisement rewritten, the description re-imported — and the
re-derived record is written back over the pinned one. The human's number was
refused at the field and arrives anyway, laundered through a parser: they typed
a figure into the text, and the re-parse read it as data. Every guarantee the
label makes is now false for exactly the rows somebody cared enough to edit.

The sibling case is worse, because nobody typed anything at all. Where the
re-derivation includes a normaliser that supplies a value for a missing field,
the second pass replaces a sourced band with a placeholder the source never
asserted — and the field still carries the grounded label, now attached to an
anchor rather than to research.

So state the invariant on the writers rather than on the field:

> **Every path that writes the field pins it from the same provenance-fixed
> source, through exactly one shared helper.** A writer that does not call the
> helper is the defect, whether or not it currently produces a wrong value.

Three consequences that are not obvious until the second ingest exists:

- **A re-sync is not a fresh ingest.** The first pass establishes provenance;
  every later pass inherits it and may recompute only what provenance does not
  govern. Treating the two as one code path is a natural mistake, because they
  share nearly all of their work and differ only in which fields are already
  spoken for.
- **One helper, every call site, pinned by a test that names them.** The test
  worth writing is not "the helper is correct" but "every writer uses the
  helper" — two writers implementing the same rule independently is the same
  defect one release later.
- **Where nothing is grounded, the derivation stands.** A record with no usable
  sourced value has nothing to protect, and pinning an absent band over a parsed
  one would delete the only figure there is. The pin applies where provenance
  exists and nowhere else, which is also what stops the rule from freezing
  records it was never meant to govern.

## What to do with the human's number instead

The human is usually right and must not be blocked from acting. They are simply
not allowed to put their number in the *derived* field. Three legitimate homes:

1. **A separate, differently-labelled field** — the approved range, the
   requisition budget, the offer. These are organisational decisions with an
   owner and a date, and they are the fields that actually govern hiring. The
   derived band sits beside them as a comparator, not as their default value.
2. **A correction to the corpus** — a proposed row, with a source, a year and a
   sample, going through whatever review admits rows. Slower, and it fixes the
   problem for everyone.
3. **An override at the *market configuration* level** — a clamp, a modifier, a
   calibration for a whole market — which is a governed change with a reviewer,
   not a per-row edit made in passing.

All three keep the invariant intact: **anything wearing the grounded label was
produced by the documented procedure, without exception**, so a consumer can
trust the label without knowing the row's history ([say only what the record
holds](../../../_laws.md#say-only-what-the-record-holds)).

## Reading the band correctly at the surface

The read-only rule pairs with two presentation rules that are part of the same
discipline:

- **Show the basis with the number, always.** Source, year, sample and the
  derivation applied. If the surface has no room, cut the precision of the
  number before cutting the basis.
- **Show it as an inference.** A derived band is an estimate about a market,
  not a fact about this role. The wording carries that — "comparable roles in
  this market, from this source" — rather than "this role pays"
  ([inference must look like inference](../../../_laws.md#inference-must-look-like-inference)).

And one interaction rule that follows directly: **a derived band never gets a
one-click apply into an approved range or an advert.** Writing the derived
number into a human-owned field with a single click launders the provenance in
the other direction — a hand-approved range that inherits a computed number's
authority without inheriting its scope. Show the band; let the human type the
figure they are prepared to defend.

## Decision rules

- When someone asks for an override on a grounded field, ask **which of the
  three homes** their number belongs in. There is always one; there is never a
  fourth.
- Before shipping any path that regenerates a derived record from edited
  source, **enumerate the fields whose provenance is fixed**. The fields you
  refused an override on at the surface are precisely the fields the re-parse
  will overwrite, and the refusal is what guarantees nobody is watching them.
- When a derived value and a human value must coexist, they are **two fields,
  two labels, two owners** — never one field with a mode.
- When the derivation is wrong often enough that overrides are being demanded
  routinely, **the corpus is the defect**. Overrides would have hidden it; count
  the demands instead and fix the cell.
- When a surface cannot display provenance at all — a plain-text export, a
  message body — emit a **range with its source named in words**, not a bare
  midpoint.

## When not to use this

- **Fields that were never grounded.** An internally approved range, a budget,
  a negotiated offer — these are decisions, they should be editable, and they
  should record who set them and when. Applying read-only here helps nobody.
- **A market with no derivation available.** There is nothing to protect; the
  correct behaviour is refusal and a human-owned field, not a read-only empty
  one.
- **Experimental or advisory surfaces explicitly framed as unsourced.** If
  nothing claims groundedness, the invariant is not at risk — but check that the
  framing survives export, because it usually does not.
