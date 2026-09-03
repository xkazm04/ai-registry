---
layer: technique
type: technique
subject: untrusted-extension-host
technique: canonicalizable-privilege-declaration
status: forged
laws: [one-authority-per-vocabulary, derivation-names-recomputation, unknown-is-not-a-value]
shared_with: []
use_when: [designing the privilege set an extension declares, a privilege must be shown to a human and checked by a broker, an allowlist entry is empty or absent and the meanings differ]
---

# Canonicalizable privilege declaration

An extension's privilege has four consumers and they want different things.
The broker wants a token it can test in constant time on every call. The
consent dialog wants a sentence a human can refuse. The registry wants
something it can index and search. The update path wants something it can diff.
A host that lets each consumer read its own copy has built a race with a delay
fuse ([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)).
This technique owns the single form that serves all four, and the derivation
rule that keeps it single.

## Structured is the authority; flat is derived

The declaration an extension ships is **structured**: a category, an operation
within it, and an open constraint object. `network` / `fetch` / hosts:
`["api.example.test"]`. `content` / `read` / collections: `["posts"]`. The
constraint object is open because constraints are where the interesting
narrowing lives and the set of useful ones is not knowable in advance — a host
that fixed the constraint shape at design time will be adding a fifth optional
field to it forever.

The runtime's enforcement currency is **flat**: one string per granted
capability, in a canonical spelling, so a broker call is a set membership test
and not a structure walk. Both forms exist. The rule that makes them one
authority is directional and absolute: **the flat set is re-derived from the
structured declaration at every parse site, and never the reverse.** The
derivation is a named, invokable function
([derivation-names-recomputation](../../../_laws.md#derivation-names-recomputation)),
not a transformation each call site performs its own way.

The reverse direction is the failure. Deriving structure from flat tokens means
inventing the constraints that the flattening threw away, and there is exactly
one available invention: the unconstrained form. A host that round-trips a
declaration through its flat set has silently widened every constrained grant
in it — and the widening happens in a code path named something like
"normalize", reviewed by nobody, on the update path where it matters most.

## Canonical means comparable

A declaration that can be diffed, hashed, signed and shown twice with the same
words has to have exactly one spelling per meaning. Canonicalization is three
operations, applied on parse:

- **Sort** — categories, operations, and every list inside a constraint, by a
  stable rule. Two authors listing the same two hosts in different orders
  declared the same privilege.
- **Deduplicate** — after sorting, adjacent equals collapse. Two entries
  granting the same operation are one grant, and a duplicate that survives
  parsing will survive into a diff as a change.
- **Close under implication** — when the vocabulary has entailments (a write
  grant that implies read, a category-wide grant that implies each of its
  operations), apply them once, at parse, so that comparison never has to
  reason about entailment. A comparator that has to know the implication graph
  is a second authority on the vocabulary.

What canonicalization buys is that the declaration becomes a *value*. It can be
hashed into a consent record, so the host can prove later exactly what the
administrator agreed to. It can be signed by a publisher. It can be compared
byte-for-byte to decide whether an update changed anything at all — which is
the cheap fast path that makes the expensive comparison affordable.

## Absent and empty are different, and the strictest spelling must not grant most

This is the rule hosts get wrong, and it is worth stating as a general law of
optional allowlists rather than as a detail. Consider a network grant with an
optional host list:

- **The field is absent.** The extension declared network access and named no
  restriction. That is *unrestricted* — it must be, because a host that read
  absence as deny-all would break every extension that predates the field, and
  because the author who wrote nothing asked for nothing in particular.
- **The field is present and empty.** The extension declared network access and
  then explicitly named zero permitted hosts. That is *deny-all*. The author
  wrote a restriction; the restriction permits nothing.

The two spellings are one keystroke apart and their meanings are opposite.
The failure — the one that shows up in every host that has not thought about
it — is a normalizer that treats an empty list as "nothing was specified" and
widens it to unrestricted. The most restrictive thing an author can write then
grants the most, which is exactly the shape
[unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value) names: an
unset sentinel colliding with the strictest legitimate setting. **Never widen
empty to unrestricted.** If the distinction is genuinely too subtle to expose
to authors, then make the field required and forbid absence — but do not
resolve it by making the safe spelling dangerous.

## A wildcard is a non-empty allowlist that grants everything

The same problem in its second costume. A refinement rule that says "a network
grant must declare its hosts" is satisfied by a list containing one wildcard
entry. The list is non-empty; the rule passes; the grant is unrestricted. Every
downstream reader that trusted the refinement — the consent dialog that says
"this extension may contact 1 host", the registry facet that files it under
*restricted network access*, the escalation diff that sees a non-empty list on
both sides — is now wrong in the same direction.

Two acceptable answers, and the choice is the host's:

1. **Reject the wildcard at schema time.** The allowlist accepts host names
   only; a pattern that matches everything is a parse error with a message
   telling the author to declare unrestricted access explicitly if that is what
   they mean. This is the better default because it makes the declaration's
   surface honest for every consumer at once.
2. **Route it to the unrestricted path.** The parser recognizes a
   grants-everything pattern and normalizes it to the same internal
   representation as an explicitly-unrestricted grant, so the consent language,
   the registry facet and the diff all treat it as what it is.

What is not acceptable is accepting it as an ordinary entry. The rule
generalizes past wildcards: **any allowlist entry whose effect is the absence
of the allowlist must be normalized to the absence of the allowlist, or
refused.** Prefix patterns, a bare top-level domain, an entry that is just a
separator — the test is what the matcher does with it, not what it looks like.

## Decision rules

- Ship the structured form; derive the flat enforcement set from it at every
  parse site through one named function; never reconstruct structure from flat
  tokens.
- Canonicalize on parse: sort, deduplicate, close under implication. Compare
  and hash only canonical forms.
- Keep the constraint object open; fix the category and operation vocabularies
  closed, in one definition both tiers derive from.
- Distinguish absent from present-and-empty in every optional constraint list,
  and document which is which at the field. Never widen empty to unrestricted.
- Reject or normalize every allowlist entry whose match set is universal;
  test the matcher, not the spelling.
- Hash the canonical form into the consent record, so what was agreed to can be
  proved rather than reconstructed.

## When not to use it

A host with a fixed handful of boolean capabilities and no constraints — three
switches, no hosts, no collections, no paths — does not need canonicalization,
because a set of three booleans has one spelling already. The structure earns
its cost the moment a grant can be *narrowed*, because that is the moment two
declarations can mean the same thing in different words, and the moment a diff
has to decide which direction a change went.
