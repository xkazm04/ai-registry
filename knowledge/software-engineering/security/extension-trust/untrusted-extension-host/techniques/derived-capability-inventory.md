---
layer: technique
type: technique
subject: untrusted-extension-host
technique: derived-capability-inventory
status: forged
laws: [gate-sees-target, failure-not-empty-success, one-authority-per-vocabulary, count-carries-predicate]
shared_with: []
use_when: [the host owns the language or interface its extensions are written against, deciding whether an extension's capability list is computed from its code or declared by its author, an operator is told to read what an extension calls before installing it, an inventory lists process execution beside other capabilities, an extension spawns a host command to answer a question a brokered call could answer]
---

# Derived capability inventory

The rest of this subject treats privilege as **declared**: the author ships a
structured declaration, a human consents to it, and the broker checks every call
against it. There is a second instrument, and it answers a different question. A
host can read an extension's own code and **derive** what it reaches, so that the
list an operator reads before installing is computed from the code that will run,
not written by the person who wants it installed.

The corpus already owns the general form of that check, in
[permission-manifest-scoping](../../../code-provenance/supply-chain/techniques/permission-manifest-scoping.md):
extract the uses, diff them against the declaration, and assert a nonzero
population, because an extractor that matches the wrong spelling finds nothing
and reports success. That rule is written for code the host does not control. A
build-time dependency spells its network calls however it likes, so the extractor
has to chase the spellings and can never prove it caught them all.

A host that owns the extension language is in a stronger position, and this
technique is the use of it. **It does not chase the spellings. It refuses every
spelling its derivation cannot read.** Then the inventory is total by
construction rather than complete by luck, and the operator can trust it to say
what the extension can and cannot reach.

## Three conditions make the inventory total

All three are needed. Drop any one and the inventory becomes a lower bound
presented as a total. That is worse than having no inventory, because a list that
reads "nothing" over a module that reaches through a side door is an empty
success ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

1. **No ambient reach.** The runtime offers no global network primitive, no
   process object, no module loader and no way to compile code from a string.
   Every effect leaves through one host interface object. This is the isolation
   the golden path already requires; the inventory adds a second reason to keep
   it. Without isolation, a derivation over the interface object measures the
   interface, not the extension.
2. **The interface is spelled literally at every call site**: the interface
   object, then a capability name, then a method. The checker refuses every other
   spelling: binding a capability to a variable, computed or optional member
   access, putting the interface object in an array, spreading it, handing it to
   a reflection call, passing it to a function not declared at the top level of
   the same file, and dynamic import. It accepts and traces the two harmless
   variants. A renamed hook parameter is still read as the interface object. A
   call through a top-level function in the same file is reported with the
   function's name beside it, so the reader sees where the call actually sits.
3. **The refusal happens where the module is loaded, not in an advisory linter.**
   The checker reads the module the same way the loader does, and a module it
   cannot read does not run. An inventory with an "unknown" row that still loads
   tells the reader nothing about the cases that matter
   ([gate-sees-target](../../../../_laws.md#gate-sees-target)).

What this buys is one authority. The derived list cannot drift from the code,
because it is recomputed from the code. The author's declaration keeps its own job
(consent and constraints, below), and the comparison
`permission-manifest-scoping` asks for (declared but unused, used but undeclared)
becomes a total check instead of a heuristic
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).

Assert the instrument before trusting it, as every extractor in this corpus must.
Two controls are needed. A module with one literal call must list exactly that
call, and a module with no calls must list nothing. Then probe each refused shape
once per host release. A single probe file per shape costs minutes, and it is the
only evidence that the third condition still holds after an upgrade.

## Read the inventory by its strongest grant

A derived inventory is **noun-granular**. It names which interface methods a
module calls. It does not name the arguments: which host it fetches, which command
it runs, which path it reads. A reader who scans it for the capability they fear
is asking the wrong question. Ask instead what the strongest thing on the list is.

One class of grant collapses every other row: **a call that starts a new
principal outside the broker.** Running a host command is the common case. The
broker checks the spawn request, and that check is all it ever sees. The child
process holds the session user's authority, and its network, filesystem and
credentials are its own. A network policy enforced on the host's fetch method
does not bind it. So an inventory that lists process execution and no network
does not describe a no-network extension. It describes an unrestricted one, and
its network use is invisible on that list.

The golden path's sentence "every request is checked against a declared grant" is
still true in this case, and it is the reason the case is easy to miss. The spawn
request was checked. What the spawn started was not, and the broker has no way to
check it.

This is the cross-category form of the wildcard rule in
[canonicalizable-privilege-declaration](./canonicalizable-privilege-declaration.md).
That rule says an allowlist entry whose effect is the absence of the allowlist is
normalized to "unrestricted", or refused. Here the same reasoning applies across
categories: a grant whose effect voids every other category's constraint is
"unrestricted" in every consumer. That includes the consent sentence, the
registry facet, the review heuristic and the "what does it call" screen. None of
them may show a per-category absence beside it.

The cheapest remedy is often on the extension's side. A spawn usually answers a
question the brokered capabilities could answer too, such as locating a
directory, reading version-control state, or listing files. Replacing it with
brokered reads removes the strongest row from the inventory at no cost to the
behaviour, and the change is visible in the inventory itself. In one measured
case, an extension in daily use spawned a version-control command only to find
its repository's shared metadata directory. Reading the files that command reads
removed process execution from its inventory. The rewrite agreed with the spawned
command in six of six locations: a primary checkout, a subdirectory, two linked
working trees, a second repository, and a directory outside any repository
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

## Decision rules

- Where the host owns the extension language, derive the capability inventory
  from the module's code, and refuse at load every spelling the derivation cannot
  read. Trace the harmless variants and show the trace.
- Keep the runtime free of ambient reach. A derivation over the interface object
  measures nothing once a second door exists.
- Assert the instrument: a literal-call positive control, an empty-module
  negative control, and one probe per refused shape on every host release.
- Rank grants before presenting them. Show any grant that starts a principal
  outside the broker as "unrestricted", never beside per-category absences.
- Prefer a brokered capability to a spawn wherever the brokered surface answers
  the same question, and confirm the narrowing in the derived inventory.
- Derive, then diff against the author's declaration. The derivation is what
  runs; the declaration is what was consented to.

## When not to use it

- **The host does not own the language.** A build-time dependency's code is
  spelled however its author likes, and refusing spellings is not available. Use
  the extractor with a nonzero assertion from `permission-manifest-scoping`.
- **The grant needs constraints.** A derived inventory cannot say which hosts,
  which collections or which paths, because those are arguments. The declaration
  stays the consent authority. The inventory complements it and never replaces
  it.
- **The interface is not the only door by design.** A host that deliberately
  grants a native tier (see [two-tier-extension-format](./two-tier-extension-format.md))
  cannot derive that tier's reach from its code. Label the tier "unrestricted"
  instead of listing its calls.
