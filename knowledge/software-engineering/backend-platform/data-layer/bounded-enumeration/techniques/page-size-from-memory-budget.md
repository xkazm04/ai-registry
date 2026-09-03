---
layer: technique
type: technique
subject: bounded-enumeration
technique: page-size-from-memory-budget
status: forged
laws: [derivation-names-recomputation, count-carries-predicate]
shared_with: []
use_when: [choosing a default page size, a list endpoint is exhausting server memory, reviewing a page-size constant with no stated origin, sizing a listing over keys with a known maximum length]
---

# Page size from a memory budget

The default page size is the number most list APIs choose by feel — a
hundred, five hundred, a thousand — and the feeling is right often enough
that nobody derives it until an operator's collection is large enough that
the feeling was wrong. This technique replaces the feeling with two
multiplications, and insists that the multiplications be written where the
number lives.

## The arithmetic

A page pins memory on the server for the duration of the request: the keys
themselves, plus whatever per-key overhead the language and the serializer
add. The quantity an operator can reason about is bytes per request, and
the inputs are two: the worst-case length of one key, and the number of
keys one request may hold. Key length in a hierarchical store has a known
ceiling — the store enforces a maximum path length, or the transport does,
or a key longer than some bound is refused at write time — and that ceiling
is the number to use, not the average. Under adversarial load the average is
whatever the writer wants it to be. Where no ceiling is enforced anywhere,
the derivation states the ceiling it assumes and labels it an assumption,
because a number derived from an unenforced bound is only as good as the
writer population's manners.

So: pick the memory a single list request may pin — a target the operator
sets from the server's headroom, and a target that says what it is for.
Divide by the worst-case key length times the per-key overhead — the string
header, the slice slot, the serializer's copy — and the quotient is the
page size. The overhead factor is a real input and it is the one most often
omitted: a derivation that says "two megabytes over four hundred bytes per
key" and lands on a page half that quotient has silently applied a factor
of two, and the next operator who substitutes new inputs into the stated
formula gets a different number from the one in the code, with no way to
tell which of them is wrong. State the factor. A
concrete shape of the derivation, in the units a reviewer can check: a key
ceiling in the low kilobytes and a per-request target in the low tens of
megabytes yields a page in the low thousands; a key ceiling in the tens of
bytes with the same target yields a page in the hundreds of thousands, and
at that size the page is no longer bounded by memory but by the time the
client will wait, which is a second derivation with a different input. The
technique is not the specific numbers; it is that the numbers have a
formula, and the formula has named inputs that the next operator can
substitute into ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).

The naive reading — "a thousand is fine, nobody lists more than that" — is
a statement about the collections the author has seen, and the predicate
is missing ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)):
a thousand keys of what length, pinning how many bytes, against a server of
what size. A page-size constant that cannot answer those three questions
was not derived; it was liked.

## Where the budget binds and where it does not

The memory budget is the ceiling for the default. Two other quantities bound
a page and are derived separately, and confusing them produces a default
that is right for one and wrong for the others.

**The policy ceiling** is not a memory statement; it is a statement about
how much work one caller may cause, and it may be far below the memory
default for a low-trust caller and never above it. The default is what a
request gets when it asks for nothing; the policy ceiling is what a request
may ask for at most; the store's hard maximum, if one exists, is the number
neither may exceed. Three numbers, three owners: the operator derives the
default, the policy author sets the ceiling per path (see
deny-absorbs-and-lowest-limit-wins), and the store declares its maximum.

**The filtering cost** is a multiplier on the page, not a bound on it: a
filtered page costs one authorization evaluation per key, so the memory
budget's page size becomes an evaluation budget the moment filtering is
switched on, and the operator who derived the page for memory must re-derive
it for evaluation time if the filter is expensive. This is why
filter-after-return-under-limit admits filtering only under a limit.

## A store that cannot seek pays its list cost regardless

The memory budget bounds what the request returns. It does not bound what
the store reads to produce it. A backend that pages natively reads one page;
a backend on the list-plus-binary-search fallback reads the whole prefix and
then slices — so on such a backend the page size bounds the response and the
serialization, but not the peak memory of the listing itself. Say so in the
derivation: the page size protects the response path on every backend and
the read path only on backends that seek. An operator running the fallback
backend over a large collection has a memory problem the page size cannot
fix, and the honest number tells them which problem they have.

## Write it beside the number

The page size is a configuration value with its arithmetic in the comment
above it: the key ceiling, the memory target, the quotient, and the
statement of what the page does not bound. When the key ceiling changes —
a store raises its path limit, a new key scheme lands — the recomputation
is substitution. When an operator wants a different number, the override
is a deploy-time setting, not a release, because the input the operator
knows best is the server's memory and that is not a build-time constant.

## When not to derive from memory

A page whose purpose is interactive — a screen of results for a person —
is sized by what fits on the screen, and the memory budget is a ceiling it
never approaches. Say which kind a page size is. And a page over a
collection with a hard, small maximum (a fixed set of configuration
entries) needs no derivation; it needs the maximum stated so a reviewer
knows the collection cannot grow.

## Decision rules

When choosing a default page size, divide the per-request memory target by
the worst-case key length and write both inputs beside the result, because
a number with no inputs is recomputed by guessing.

When a page-size constant has no stated origin, derive it before raising
it, because raising an underived number moves the cliff to a size nobody
has measured either.

When the store's key ceiling changes, recompute the page, because the
default was a function of it and the function did not change.

When a backend cannot seek, state that the page size bounds the response
and not the listing's peak memory on that backend, because an operator
sizing a server needs to know which number the page protects.
