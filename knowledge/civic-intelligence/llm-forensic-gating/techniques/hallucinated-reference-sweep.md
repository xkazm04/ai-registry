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
