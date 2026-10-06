---
layer: technique
type: technique
subject: conditional-service-composition
technique: specificity-ordered-layering
status: forged
laws: [derivation-names-recomputation, one-authority-per-vocabulary]
shared_with: []
use_when: [the set of documents in a merge is discovered rather than declared, the same request produces different results on two machines, a precedence list of overlays has grown past what anyone maintains, deciding whether merge order should be written down or computed, an operator asks which fragment set a value came from and nobody can answer]
stage: multi-service
---

# Specificity-ordered layering

When the documents in a merge are **selected by condition rather than named in
a list**, nobody has stated what order they land in — and a merge is
order-dependent by definition, so an unstated order is not a missing feature but
an undefined result. This technique states the answer: **derive a total order
from the structure of the identifiers themselves, so that more specific
fragments land later and therefore win.**

The concrete form that works: order first by the number of handles the
identifier names, ascending, then lexically within each group. A fragment
conditioned on one handle is base material for that service. A fragment
conditioned on two is about a pair, and it must be able to override what either
of them said alone, because that is the only reason it exists. A fragment
conditioned on three overrides both. Arity agrees with the containment order on
the conditions wherever containment has an opinion — a superset always names
more handles, so it always lands later — and it makes the precedence outcome
derivable from the identifiers alone, which is the property the rest of this
technique is about paying for. But containment is a *partial* order and arity is
only one linear extension of it: two conditions neither of which contains the
other are ranked by arity and then by spelling, and that ranking is convention,
not meaning. The section on incomparable fragments below is its price.

## The undefined order is a per-machine defect

Take this seriously before anything else, because it is the failure that
motivates the technique and it does not look like a bug in any diff.

A discovered fragment set arrives from a directory enumeration, and enumeration
order is a property of the **host**, not of the input. Filesystems disagree on
case ordering. Locale collation reorders punctuation and non-ASCII characters.
Some listing interfaces guarantee no order at all and happen to return insertion
order until a directory is rewritten. So two machines given the identical
request and the identical fragments produce two different merges, and there is
no diff between the runs to inspect, because the difference is not in anything
either run recorded.

This is the reproduction failure in its purest form. The person who can see the
symptom cannot produce it on their own machine, and the person who can fix it
cannot see it. It is discovered months later by someone comparing two resolved
artifacts side by side and noticing that the same two documents appear in
opposite order.

So the ordering function carries an explicit **determinism guarantee**: given
the same active set and the same fragment population, the resolved order is
byte-identical on every host. Two implementation consequences follow, and both
are usually got wrong on the first attempt. Sort with an ordering that is
defined by the specification rather than by the host's locale — code-point
comparison, not the platform's default collation. This is not a theoretical
distinction. Measured on 2026-10-06, one runtime's locale-aware string compare
puts a fragment named for `chroma` *after* one named for `hollama` under a Czech
locale, where *ch* is a single letter that sorts after *h*, and *before* it under
English; code-point order puts a capitalised name ahead of both. The common form
of the defect is a sort whose comment promises determinism across filesystems
and whose body calls the locale-aware compare — or a shell pipeline that sorts
without pinning the collation — and it reproduces only on the machines whose
locale differs from the author's. And **sort the enumeration result rather than
trusting it**, even where the platform's listing is documented as sorted, because
"documented as sorted" is a claim about one platform and the guarantee is about
all of them.

## What the declared list was buying, and how to pay for it another way

There is an established discipline for merge precedence, and it says the order
must be declared, named, and singular: an ordered list of named sources, written
once, in the place resolution runs. That discipline is right, and this technique
should not be read as overturning it. What changes is the **representation of
the declaration**, not the requirement to have one. A total order function over
identifiers, written once in the assembler, is singular and named; it is simply
*intensional* rather than *extensional* — it describes the order instead of
enumerating it.

The discriminator, stated so a reader knows which side they are on:

> **Declare the order as a list when a human can hold the list. Derive it from
> the identifiers when the population is combinatorial.**

An ordered list of a dozen configuration sources is a better artifact than any
function, because it is directly readable and a reviewer can check it against
intent in ten seconds. An ordered list of several hundred fragments, regenerated
whenever anyone adds an integration, is a file that is always out of date and
that no reviewer reads — and a stale precedence list is worse than a derived
order, because it looks authoritative.

But the list was buying something real, and a derived order must pay for it
another way. What the named list gives you is that **every precedence outcome
can be explained by pointing at a name**: this value came from that source,
which sits above that other source, here is the line that says so. Lose the list
and you lose the pointer, unless two obligations are met.

**First: the identifier must be sufficient to explain any precedence outcome.**
A reader holding two fragment identifiers must be able to say which won, and
why, without running anything and without consulting a table. That is a real
constraint on the ordering function, and it rules out most of the clever ones —
an order that consults file modification time, or the order fragments were added
to a manifest, or a weight declared inside each fragment's body, all fail it.
Arity-then-lexical passes it: the answer is visible in the two names.

**Second: the resolved order is a derived value and must name its
recomputation** ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
Concretely, a **first-class command that prints, for a given request, the active
set, the fragments selected, and the exact order they will be merged in** —
before anything starts, without starting anything. Not a debug flag. Not a trace
level. A supported command with a stable output, because it is the entire
diagnostic surface for a stage that otherwise produces no artifact a human can
read. Its absence is the single failure that makes derived ordering worse than a
list, and its presence is what makes it better: the list tells you the order the
author intended, and the dump tells you the order that actually happened.

## Incomparable fragments are ordered, not ranked

Arity-then-lexical is a total order, so every pair of fragments has a winner. For
a pair where one condition contains the other, the winner is meaningful: the
fragment about a pair overrides what either service said alone. For a pair where
neither contains the other — one fragment conditioned on `{a, b}`, another on
`{a, c}` — the winner is whichever name sorts later. If both can be active
together and both set the same key, the alphabet has decided a semantic
conflict, deterministically and arbitrarily, and a rename flips it.

Determinism does not rescue this; it only makes the wrong answer reproducible.
Systems that select configuration by condition and care about the outcome refuse
the case outright: one build system's configurable attributes treat several
matching conditions as an error unless they resolve to the same value or one is a
strict superset — a *specialization* — of the others. That is the containment
order enforced, with the incomparable case made loud instead of alphabetised.

The equivalent here is a build gate, and it can be written without making the
composition layer an authority on merge semantics. For every pair of fragments
whose conditions are incomparable and **co-activatable** — the union of their
handle sets is a legal active set — resolve that union twice through the real
engine, once with the pair in each relative order, and fail when the two resolved
artifacts differ. A difference means the order, not the conditions, is deciding a
value; a pair writing disjoint keys resolves identically both ways, which is the
negative control the gate's own test needs. Collections the engine concatenates
can differ in order alone, so normalise their order before comparing or accept
that false positive knowingly. The fix stays inside this technique's vocabulary: add a fragment
conditioned on the union, which lands later by arity and wins by containment, or
move the key so only one of the two writes it. Never a weight field. The check is
pairwise over fragments, not combinatorial over requests.

Its cost is real and is the argument against it: every co-activatable pair that
genuinely contends for a key needs a resolving fragment, and where most fragments
touch a shared default the gate becomes noise. Apply it where values matter —
endpoints, credentials, resource limits — and where it is not run, say so
next to the ordering function, so a reader knows the lexical tie-break is
standing in for a decision nobody made.

## The ordering function is an authority, not a helper

There is exactly one implementation of the order and everything consults it
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
This sounds obvious and is violated constantly, because the order is easy to
re-derive and the second site always starts as a convenience: the dump command
sorts its own copy for display, or a test fixture sorts its expectations, or a
documentation generator lists fragments "in precedence order." Each of those is
a second authority on precedence, and each will drift — and the way it drifts is
that the diagnostic tool prints a different order from the one the assembler
uses, which converts the only instrument for this stage into a source of
confident wrong answers.

The corollary for tests: a test that asserts the resolved order by comparing
against a hand-written expected list is testing the order. A test that asserts
it by re-deriving the order with the same function is testing nothing. And a
determinism test that runs on one platform proves determinism on one platform;
what it can prove everywhere is that the sort does not consult the host — which
is asserted by feeding the sorter a deliberately perverse input order and
requiring the same output.

## Decision rules

- Derive the order from identifier structure — arity ascending, then lexical by
  code point — so specificity implies precedence and both are visible in the
  names.
- Sort the enumeration result. Never inherit the host's listing order, however
  sorted it appears.
- Compare by a specification-defined ordering, never by the host's locale
  collation.
- Publish the derivation in prose where fragments are documented, and expose a
  supported command that dumps the active set, the selection and the resolved
  order for a given request without starting anything.
- One implementation of the order. The dump, the tests and the documentation all
  call it; none of them re-derives it.
- If a fragment needs to win for a reason its identifier does not express, the
  identifier is wrong. Do not add a weight field.
- Two co-activatable fragments whose conditions neither contain the other must
  not decide a value by spelling. Gate it by resolving their union in both
  relative orders; resolve a conflict with a fragment over the union.

## When not to use this

- **A human-holdable source list.** A handful of named configuration sources
  with a fixed precedence is better served by the declared, named, singular list
  — it is directly readable and directly reviewable, and a function is ceremony
  over five entries.
- **An author-declared graph.** When a document names the documents it inherits
  from, the order is the author's and the resolver must honour it; deriving an
  order there would silently overrule an author who wrote one down.
- **Order that depends on content.** If which fragment wins depends on what a
  fragment says rather than on what it is, the outcome is no longer predictable
  from the request, the identifier can no longer explain it, and both obligations
  above have failed. That is a policy engine wearing a merge's clothes.
