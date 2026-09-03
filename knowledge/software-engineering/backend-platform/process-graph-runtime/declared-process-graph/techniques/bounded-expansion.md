---
layer: technique
type: technique
subject: declared-process-graph
technique: bounded-expansion
status: forged
laws:
  - gate-sees-target
  - absent-guard-is-loud
shared_with: []
use_when: [a document rewrite reads further documents chosen by the author, a load step hangs or exhausts memory before validation, deciding where a composite body may be read from]
---

# Bounded expansion

Any load step that rewrites a document by reading further documents named inside
it is unbounded recursion driven by author-supplied input. It runs before
validation — that is what makes it a rewrite rather than a check — so none of the
validator's protections are in force yet, and the failures it produces are not
error messages but a hang, an exhausted heap, or a read outside the tree. The
technique is three independent bounds, each cheap, each covering a case the
others do not.

## The three bounds

**Depth.** Cap the nesting of composite inclusion at a small constant and refuse
past it with the inclusion chain in the message. Small means single digits: a
topology nested eight deep is already past the point where anyone can read it,
so the cap doubles as a design smell detector and its exact value is not load
bearing. The refusal must print the chain — the sequence of bodies that led here
— because the author's mental model of the nesting is exactly the thing that is
wrong when this fires.

**Size.** Cap the size of any single body read during expansion, and enforce the
cap **by reading no more than the cap plus one byte**, not by asking the file how
big it is. The metadata answer is not trustworthy in either direction: a stream
that is not a regular file reports zero and then yields bytes forever, and a
regular file being appended to is racy against the read that follows. A
size-first check therefore sails past the guard on exactly the inputs the guard
exists for, and the unbounded read happens anyway. A bounded read has no such
gap: take the cap plus one, and if the extra byte arrived, refuse. Refuse before
parsing, too — a parser that has to allocate to discover the input is too big has
already paid the cost.

**Containment.** A body may be read only from inside a containment root, and the
root is the **project's** root, threaded down through the recursion — not the
directory of the document doing the including. The narrower rule is the tempting
one and it is wrong: a body in one directory legitimately references a shared
body in a sibling directory by a relative path that leaves its own folder, and a
per-document containment check refuses a composition the runtime accepts and runs
correctly. Reject an absolute path, and reject any path that resolves outside the
root once symbolic links and relative segments are collapsed. Resolve first, then
compare — a check that pattern-matches the raw string is defeated by the first
path that reaches the same place by a different spelling.

The corollary is the part that is usually missed: **a checker with no root
declines the check rather than substituting a narrower one.** A lint that
examines a fragment in isolation has no project to bound against; if it invents
the fragment's own directory as the root, it reports failures on documents that
are valid in every real use, and the author learns to ignore it. Keep the checks
that hold without a root — absolute paths, existence, size, depth — and let the
containment boundary be enforced by the path that actually has the root
([gate-sees-target](../../../../_laws.md#gate-sees-target): a check run against a
substituted target answers a question nobody asked).

The reason for containment is not only security. An author who can name any file
on the machine has written a document whose expansion depends on that machine,
which is precisely the property that made the document worth having.

## Why a cycle check is not a bound

The natural first implementation tracks the set of body paths already visited on
the current branch and refuses when one repeats. It catches the case everyone
thinks of — a body that includes itself, directly or through a ring — and it is
worth having for the quality of its error message, which can name the loop.
Without it the self-including body still terminates, at the depth cap, with a
message about nesting depth that sends the author to look for a deep tree that
does not exist. The set is **per-branch**: an entry is removed on the way back
out of a successful subtree, or a diamond — two different bodies that both
include a third — is misreported as a cycle, and the author is told to break a
loop they did not write.

It is not a bound on the expansion
([gate-sees-target](../../../../_laws.md#gate-sees-target)). The check observes a
proxy — the set of paths — and the thing being bounded is the size of the
resulting graph. A finite set of distinct documents, none of which repeats on any
branch, still expands combinatorially: a body that includes two copies of the
body below it doubles at every level, so ten levels of six-line documents produce
a thousand nodes, and thirty produce a graph no machine will hold. Nothing about
"no path repeats on this branch" says anything about that, because path identity
and node count are different quantities. The check passes exactly where it
matters least.

So the cycle check answers "did the author write a loop" and the depth and size
caps answer "can this document exhaust me". Keep both; do not let the first stand
in for the second. Where the expanded node count is cheap to track, cap that too
— it is the quantity actually being defended, and the other bounds are proxies
for it.

## Decision rules

- The bounds are constants in the code, not configuration. A limit that must be
  switched on protects the examples and not the deployments
  ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) is the
  general statement); a limit an author can raise in the document they are
  submitting is not a limit at all.
- Check the bound **before** the expensive operation, not after: depth before
  descending, containment before opening, size during the read rather than after
  it. A bound enforced after the work is done is a report, not a guard.
- Count depth from the outermost document, not from each body, so a wide tree and
  a deep one are measured on the same scale.
- When a bound fires, fail the whole load. There is no partial expansion that is
  safe to hand onward — the validator would report a cascade of errors about
  wiring that only dangles because expansion stopped early.
- Reserve the identifier prefix that expansion generates and refuse an authored
  name that uses it, in the same pass. It is the same class of problem — author
  input reaching a namespace the rewrite owns — and it is cheapest to check where
  the names are being generated.
- Apply the same three bounds to every author-driven document rewrite in the
  system, not only to composites: template instantiation, import of a foreign
  format, an included fragment. Each new rewrite path that omits them reopens the
  whole class.

## When not to use this

If bodies come only from a curated, reviewed, versioned catalog and never from
the submitter, containment is already provided by the catalog and re-checking a
path is ceremony. Depth and size caps stay — they defend against a mistake as
much as against an author — but the containment rule can be replaced by the
catalog's own admission check, provided that check is the only way in.

Do not let these bounds substitute for validating the expanded result. They bound
the *work*; they say nothing about whether what came out is a topology that makes
sense, which is the validator's job and runs next.
