# A registered local checkout as the `source_control` connector

What was learned mapping this recipe onto a local working checkout specifically. Nothing
here is part of the recipe: swap the connector and this file stops applying while the
recipe does not change.

## What the mapping has to decide

**A checkout is the only binding where "not found" is a real claim.** The whole tree is
present, so an exhaustive search that comes back empty means the code is not there. A
hosted search API caps its results and ranks them, so an empty answer there is
indistinguishable from a truncated one, and the recipe's honest unknown quietly becomes
an artefact of a result limit. When the binding is a remote search, say which of the two
kinds of empty you got.

**Text search approximates the dependency graph badly, and it fails in exactly the places
the estimate goes wrong.** Dynamic imports, dependency injection, string keyed registries,
reflection and generated call sites are invisible to a search over source text, and they
are the reason a change that looked like three files becomes forty at review. Where the
project uses any of them, the traced surface is a floor and the record should say so
rather than presenting it as the answer.

**Generated files, lockfiles and vendored trees dominate every count.** A reference count
that includes a lockfile is worse than no count, because it is precise and wrong. The
exclusion set is an adoption fact about this repository and has to be settled before the
first estimate, not discovered from a rejected one.

**A checkout can tell you a symbol exists and cannot tell you the change compiles.** There
is no build in this binding, so the verdict is about surface and cost, never about
correctness. An analysis that starts asserting the change will work has left what the
connector can support.

**Search depth is a real cost, and a repository large enough to time out is a reason to
narrow deliberately.** Narrow by area and record where you narrowed. A search widened
until it succeeded produces matches from everywhere, which reads as a large blast radius
and is really a bad query.

## What transfers to any source_control connector

- Establish whether an empty result means absent or means truncated, before treating it
  as evidence.
- A traced surface is a floor whenever the project resolves anything at runtime.
- The excluded directories are an adoption fact, and getting them wrong makes an estimate
  confidently worse rather than merely vague.
