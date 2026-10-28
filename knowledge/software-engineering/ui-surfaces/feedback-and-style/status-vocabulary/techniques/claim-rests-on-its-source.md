---
layer: technique
type: technique
subject: status-vocabulary
technique: claim-rests-on-its-source
status: forged
laws: [claimant-does-not-adjudicate, unknown-is-not-a-value]
shared_with: []
use_when: [a status chip asserts more than its input can know, a stored verdict word disagrees with the evidence beside it, naming the members of a state vocabulary]
---

# A claim rests on its source

A status chip is a sentence the product says in its own voice — "mergeable",
"passing", "healthy" — and the reader takes it with the product's full
authority. The failure this technique exists for is a chip that says more than
the input it was computed from can know. A run record that ended "mergeable"
says nothing about whether the branch was merged since or deleted; a stored
verdict word says what somebody wrote, not what the evidence shows. Both
render as confident status, and both are wrong precisely in the cases the
reader looks at the chip for.

The rule: **every member of a state vocabulary is named by what it rests on**,
and a member exists for each basis the product can actually have — including
the basis "we have not asked yet".

## Members are named by their basis

Design the vocabulary by asking, for each state the product wants to show,
*which source must have answered for this word to be true*. When the honest
answer is "two sources, and the second may not have been read", the
vocabulary needs a member for each outcome of the second read, not one word
that assumes it:

- the claim, when the authoritative source confirms it ("mergeable": the run
  ended mergeable **and** the repository says the branch is not in its base);
- the claim **not asked yet**, when the authoritative source was not read or
  could not be ("mergeable, not checked yet");
- the claim **overtaken**, when the authoritative source contradicts the
  first one ("already in its base, or branch gone").

"Not asked yet" is a member, not a missing value: it has a label, a tone and a
tooltip, and it is never folded into the confirmed member to make the screen
look settled
([_laws: unknown-is-not-a-value_](../../../../_laws.md#unknown-is-not-a-value)).
The derivation function reads the sources in order and returns the member
whose basis it actually holds; when an input is absent it says so with the
"not asked" member, never with a guess.

## The tooltip states the basis

Every member carries, beside its label, a sentence that says **what it rests
on** — "ended mergeable, and the repository says its branch is not in its base
yet". Keep those sentences in the vocabulary's one presentation table, keyed by
the same union as the labels ([status-color-mapping](./status-color-mapping.md)),
so a new member cannot ship without its basis. The tooltip is how a reader who
doubts the chip can check it without opening the code, and it is how the next
author learns which source the member requires.

## A verdict is derived; a stored word is only compared

Where a status is a **verdict** over evidence — checks passed, findings
cleared — the displayed word is computed from the evidence by the one
derivation every consumer shares, and **never read from a stored verdict
field**. The stored word was written by whoever assembled the record, and it
may have been written by the party whose work is being judged; it does not
decide what the screen says
([_laws: claimant-does-not-adjudicate_](../../../../_laws.md#claimant-does-not-adjudicate)).

The stored word still has a use: **compare it with the derived one and surface
the mismatch**. A record whose stored "pass" disagrees with checks that fail is
a fact worth showing — either the record was tampered with or the derivation
changed — and it is only visible if the stored word is kept beside the derived
one rather than discarded. A stored "unknown" is no claim at all and never
counts as a disagreement.

Apply the same split to inputs a person decides rather than the engine: a check
that is a person's call is shown as such and weighs as neither a pass nor a
fail in the derived verdict, because the derivation adjudicates only what it
can re-derive.

## What this technique refuses

- A member whose word claims more than its inputs can establish.
- Folding "not asked yet" into the confirmed member.
- A member with no stated basis in the presentation table.
- A displayed verdict read from a stored field rather than derived.
- Discarding the stored word, which hides the mismatch the comparison exists
  to catch.

## When not to use it

A vocabulary whose single source is authoritative — a state machine whose
current state is the record — needs no basis members; its word is its source.
The technique starts when a chip's word depends on a second source the product
may not have read, or on a record written by someone other than the judge.
