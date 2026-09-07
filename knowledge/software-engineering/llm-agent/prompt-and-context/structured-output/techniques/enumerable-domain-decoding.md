---
layer: technique
type: technique
subject: structured-output
technique: enumerable-domain-decoding
status: forged
laws: [one-validation-door, unknown-is-not-a-value, limits-are-derived]
shared_with: []
use_when: [a numeric field keeps arriving out of range despite a schema, deciding whether constrained decoding can carry a value domain or only a shape, a repair step exists solely to clamp or reject one field, the same field is validated in three places and still gets through, choosing which of a payload's fields deserve decoder-level enforcement]
---

# Enumerable-domain decoding

The golden path's summary of constrained decoding is that it buys **syntax**
and nothing else, so the validation door stays. The conclusion is right and
the reason is too coarse. A constrained decoder enforces whatever the token
mask can express, and a token mask can express far more than well-formedness:
it can express **membership in a value domain**, provided the domain is finite
and can be compiled to a prefix tree over the tokens that will actually carry
it.

That splits the golden path's list of well-formed-but-wrong payloads into two
classes that behave nothing alike:

- **An entity that does not exist** is not enforceable at decode time at any
  price. Membership depends on state the decoder cannot consult, and it will
  change between the mask's construction and the object's use. This case is
  why the validation door is permanent.
- **A quantity out of range, and a value outside a closed allowlist**, are
  enforceable. Their domains are finite, knowable before the request, and
  independent of anything the decoder would have to look up.

Reading the first case as the rule and the second as an instance of it leaves
a repair step in the pipeline whose entire job is to reject a value the
decoder was capable of never emitting.

## Enumerate the set; do not compute the predicate

The tempting implementation is arithmetic: track the digits emitted so far,
and at each step allow the digits that keep the running value inside the
bound. It is wrong in a way that is invisible in testing against short
integers and then produces impossible values.

The predicate `30 <= n <= 300` is a statement about a *number*. What the mask
constrains is a *token*, and the relationship between the two is neither
per-character nor stable: a tokenizer may emit `300` as one token, `3`+`00`,
or `30`+`0`, and the mask has to allow exactly the continuations that reach a
member of the set. Arithmetic on a partially decoded integer cannot answer
that, because a legal prefix of a legal value is not itself a legal value —
`3` is a permitted prefix of `300` and a forbidden value in its own right.

So enumerate. Materialise every member of the domain as a string, tokenize
each one, and build a tree whose keys are **token-ID sequences** and whose
values are the sets of tokens that may follow. At each step the mask is a
lookup: the children of the prefix emitted so far. A domain of a few hundred
members costs a few hundred tokenizer calls once, at construction.

Three consequences of keying on token IDs rather than on characters:

- **The tree is tokenizer-specific and must be rebuilt with it.** It encodes
  one tokenizer's segmentation decisions. A model swap that changes the
  tokenizer invalidates every tree, silently, in the permissive direction —
  the prefix lookup misses and the mask degrades to allowing everything. Key
  the cached trees by tokenizer identity, and treat a miss as a fault rather
  than as an empty constraint
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
- **A tree built over the bare value is the wrong tree.** See below.
- **The domain must be derived, not typed twice.** The enumeration comes from
  the same declared bound the validation door reads
  ([limits-are-derived](../../../../_laws.md#limits-are-derived)); a hand-typed
  list of members is a fourth copy of the contract and the one nobody updates.

## Tokenize in the context the value will be emitted in

This is the failure that makes an otherwise correct implementation
intermittent, and it has nothing to do with the domain. **Tokenization is
context-dependent.** The characters `30` do not necessarily tokenize the same
way alone as they do following `"bpm: "`, because most tokenizers merge a
leading space into the following token and may merge across the delimiter.

A tree built from the bare members therefore has keys that never occur in
generation: the model emits the field name, then a token that begins with a
space, and the lookup misses on the first step. The mask then allows
everything for that field — which reads in testing as "constrained decoding
does not work here" and in production as an unconstrained field.

Build each entry from **the field's own preamble concatenated with the value**,
tokenize that whole string, then strip the preamble's tokens to recover the
value's tokens in situ. Two distinct strings are needed and conflating them
is the bug: the preamble as the state machine *emits* it (`bpm:`), which is
what the running prefix will match against, and the preamble as the tokenizer
*sees* it (`bpm: `, with the delimiter), which is what produces the correct
segmentation. Where the preamble's token sequence cannot be located inside the
full tokenization, that member is unrepresentable in this tokenizer — record
it and fail construction, rather than dropping it into a set that is now
quietly missing legal values.

## What this does not buy, and the door that stays

The validation door does not move. Three things survive decoder-level
enforcement, and each is a reason the door is load-bearing rather than
ceremonial:

- **Referential claims**, per above — the case that cannot be enumerated.
- **Cross-field consistency.** Each field's tree knows its own domain and
  nothing else. A duration and a section plan that cannot sum to it are both
  individually in range.
- **Truncation.** A generation that stops mid-value has emitted a legal
  *prefix*, and a prefix satisfies the mask at every step it took. The mask
  guarantees "no illegal continuation", never "the value is complete", so
  completeness is the door's to check
  ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

What changes is the door's job. It stops being the only thing standing between
the model and a corrupt field, and becomes the check on the classes the
decoder provably cannot reach — which is a smaller, statable set, and a door
whose failures are now interesting rather than routine.

## Which fields earn a tree

The obligation is graded by whether the domain is enumerable at all, and the
grades are three:

- **A closed set** — an enum, a small allowlist, a fixed pattern with bounded
  parts — *must* carry a tree. It is the cheapest correctness this surface
  offers, and every member is already written down somewhere.
- **A bounded numeric range** *should* carry one, up to the point where
  materialising the members stops being free. A few hundred members is a
  construction-time cost measured in milliseconds; a range of millions is a
  different technique and probably a different field design.
- **Free text** is *exempt* and must be, but its terminator is not. A caption
  is unconstrained in content and still owes a mask on how it ends, because
  the state machine's next transition depends on recognising that the field
  closed.

Publish the obligation per class, so "does this field need a tree?" is
answered by looking up its domain's shape rather than by each author deciding
whether their own field is worth the trouble.
