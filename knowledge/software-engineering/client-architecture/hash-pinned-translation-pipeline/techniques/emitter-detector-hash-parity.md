---
layer: technique
type: technique
subject: hash-pinned-translation-pipeline
technique: emitter-detector-hash-parity
status: forged
stage: team
laws: [one-authority-per-vocabulary, gate-sees-target]
shared_with: []
use_when: [two programs computing the same content hash, a run reporting the entire corpus stale at once, a comment instructing a future maintainer to keep two functions in sync]
---

# Emitter/detector hash parity

The pin's hash is computed **twice, by two programs, at two different times**.
The emitter computes it when a translation is produced and writes it into the
record. The detector computes it when freshness is checked, months later, in a
different process, often in a different lifecycle stage — a build step versus a
release gate, a script versus a service. Everything the subject claims rests on
those two computations agreeing byte for byte, forever.

They are, in the strict sense, **two implementations of one closed vocabulary**
([one authority per vocabulary](../../../_laws.md#one-authority-per-vocabulary))
— and the vocabulary here is not "which digest algorithm" but the entire
mapping from a source unit to a digest string.

## The failure, and why it is undiagnostic

When the two drift, the detector reports that **the whole corpus is stale**.
Every unit, every locale, at once. Somebody changed the trimming rule on one
side, added a field to one input assembly, altered a separator, upgraded an
algorithm, or normalized line endings in the emitter to fix an unrelated bug.

What makes this expensive is not the loudness — it is that the report is
*indistinguishable from a genuine event*. A mass source import, a bulk content
migration, or a corpus-wide copy edit produce exactly the same shape of output.
A team that trusts its detector will read "everything is stale" and start
spending; a team that has been burned once will read it and ignore the
detector, including on the day it is right. Both outcomes end the practice, and
the corpus was fine the whole time. **The instrument moved, and nothing in the
report said so.**

## The fix, in preference order

**One implementation, imported by both.** There is one function, in one place,
and both programs call it. The parity question ceases to exist rather than
being managed. This costs a shared module, and where the emitter and detector
run in the same language and runtime — which is the common case, because both
are usually build-time tooling — there is no defensible reason to do anything
else. Reach for this first and stop.

**A specification with a shared test vector**, where the two genuinely cannot
share code: a build step in one language, a service in another; an emitter that
runs where the detector cannot. Then the mapping is *written down* — field
list, order, separator, normalization, encoding, algorithm, truncation — and
that written form is accompanied by a **fixed vector: one known input and its
expected digest, asserted by both sides** in their own tests. The vector is the
mechanism; the prose is documentation of the mechanism. A drifted
implementation now fails its own test suite the moment it drifts, on the side
that drifted, with a message naming what happened — which is the entire
difference between this rung and the next one down.

**Never: two implementations kept in sync by a comment.** A comment reading
"the hash function here must stay byte-identical to the one in the checker —
if you change it here, change it there too" is an honest, well-intentioned
artifact and it is not a mechanism. It states the invariant precisely and
enforces nothing: it is read by whoever opens the file, and the person who
breaks parity is very often editing the *other* file, or a shared helper
underneath both, or a serialization default two layers down. Where such a
comment already exists, treat it as a correct specification missing its
enforcement — the cheapest possible upgrade is to lift the function into one
shared place and delete the comment, and the second cheapest is to add the test
vector the comment implies.

## The input assembly is part of the contract

A frequent and subtle version of the failure: both programs call the same
digest primitive, and they are still not sharing a hash function, because they
**assemble the input differently**. One joins title and body with a newline;
the other with an empty string. One serializes the record and digests the
serialization; the other digests the concatenated fields. One reads the source
file raw; the other reads it through a parser that strips a byte-order mark or
re-encodes.

So the shared unit is not the digest call. It is the whole path from *source
unit* to *digest string*: read, decode, select fields, order, join, normalize,
digest, format. Share that path, or specify and test it end to end. A shared
helper that begins after the fields have been selected has left the two most
drift-prone steps — selection and reading — on the outside.

## Parity is necessary and not sufficient

The failure this technique is named for is *divergence*, and the fix is
sharing. But sharing buys agreement, not correctness, and the two are easy to
confuse once the comment at the top of the file has been obeyed. **Two programs
running a byte-identical extraction can be identically blind**, and then every
guarantee the parity discipline offers is intact while the pin measures a
fraction of the content it claims to measure. The report is internally
consistent, the vector passes, both sides agree — and units whose changes fall
outside the shared blind spot report fresh forever.

That failure is invisible to every check parity provides, because parity checks
the two programs against *each other* and never against the source. So the
contract needs a second clause pointing outward: alongside "the two sides agree",
assert that **the extraction covers what it claims to cover** — the captured
length against the field's true length, the terminator against the real end of
the field. The shared test vector proves the function is stable; only a
coverage assertion proves it is looking at the whole unit. A team that has
achieved perfect parity and stopped there has built a very reliable instrument
without ever checking where it is pointed
([gate-sees-target](../../../_laws.md#gate-sees-target) again, one level in:
the check must observe the content, not a prefix of it).

## Make the detector able to suspect itself

Given that the failure's signature is *everything reclassifying at once*, the
detector can watch for it cheaply. When the stale fraction of the corpus
exceeds a high threshold — most of it — the honest report is not a work order.
It is a warning that the result is **more likely an instrument change than a
content event**, stated as such, with the recommendation to compare the hash
function against its vector before spending anything.

This is [gate-sees-target](../../../_laws.md#gate-sees-target) turned inward:
before trusting a green result you ask what the check actually read, and before
trusting a catastrophic red one you ask whether the check still means what it
meant last week. Carrying both hashes in every finding (see
[drift-classification](./drift-classification.md)) is what makes the check
possible by hand as well — in an instrument-drift event, recorded and current
differ for every unit, and the *recorded* values are all internally consistent
with each other.

## Changing the function on purpose

The function will eventually need to change — a stronger algorithm, a
normalization the corpus genuinely needs, a field added to the scope. Make it a
**visible format event** rather than a silent reinterpretation:

- Stamp the algorithm, and where relevant the scope version, into the stored
  value, so old records are *recognizable* rather than merely unequal.
- Teach the detector to classify an old-format record explicitly — as
  needing migration, not as stale — so the two populations never merge.
- Announce the reclassification before it lands, with a fan-out audit sized
  under the new function, so the cost is a number somebody approved rather than
  a surprise in a report.

The rule underneath all three: a hash function change and a corpus change must
never produce the same output. When they do, the detector has stopped being an
instrument and become a coin flip with a large budget attached.

## When this does not apply

If one program both emits and detects — a single tool that translates and
checks, with no second reader anywhere — there is no parity problem to solve
today. There will be: the checker is the part that gets extracted first, into a
gate, into a report, into a different language. Keep the mapping in a function
with a name and a test vector from the start, and the extraction is a move
rather than a rewrite.
