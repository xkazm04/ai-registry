---
layer: technique
type: technique
subject: standards-layered-runtime
technique: status-header-per-api
status: forged
laws: [unknown-is-not-a-value, count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [adding an API module to a standard package that is not yet complete, answering how much of a standard a runtime version implements, reviewing a module that lives in the extras layer but belongs to a standard]
---

# Status header per API

A package named after a standard is a promise. Between the day the package is
created and the day its last required API lands, the promise is partly kept,
and the package must say which part. The instrument is a header on every API
module stating two facts: **which standard requires this module**, cited by
the clause or section that names it, and **where the module currently lives
relative to where it belongs** — landed in the standard's package, or still in
the extras layer with a marker saying it is destined to move.

The header is the smallest thing that keeps a partial package from lying. An
embedder reading the package name assumes the whole standard; the headers,
read together, are the true inventory, and a reader who wants to know "does
this version give me the baseline's timer API" opens one file and finds either
a clause citation or a marker. A package with no headers offers the reader
nothing between "trust the name" and "read the implementation", and the name
is exactly what cannot be trusted while the work is in progress.

## What the header states

Three lines, at the top of the module, before any code:

- **The requiring authority and clause.** "Required by the cross-runtime
  baseline, section such-and-such" or "required by the language
  specification, clause such-and-such". A module required by nothing says
  "non-standard, host extension" — the absence of an authority is itself the
  fact, stated, not left blank
  ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value): a
  missing header reads as "probably standard" to whoever needs it to be, and
  that is a confident claim manufactured from silence).
- **The placement marker.** Either nothing, for a module in its final home,
  or a marker naming the destination: "lives in the extras layer pending the
  move to the baseline package". The marker is what makes the inventory
  computable — a search for the marker string across the tree lists every
  API the standard package still lacks.
- **The known gaps.** Where the module implements the API partially — a
  method missing, an option ignored, a behaviour approximated — the header
  says so in one line each, because a module that is present but incomplete
  is the case a name-level reader cannot detect at all.

## Decision rules

**When a module is added to a standard package, its header cites the clause
that requires it, because a module nobody required is in the wrong package.**
The act of looking up the clause is the check. A contributor who cannot find
the clause has found a non-standard API and should place it in the extras
layer with the non-standard line instead.

**When a module is built in the extras layer for a standard that has not yet
adopted it, the marker is written the day the module is created, not the day
someone plans the move**, because the marker is the only record that the
module is temporary, and an unmarked temporary module becomes permanent by
default.

**When the standard package is created before its APIs have moved, give every
required API a stub module in the package, with the header and a marker
naming where the implementation currently lives**, because a stub at the
destination makes the package's inventory complete from the package alone —
a search over one tree lists every required API and every one still owed —
whereas a marker only on the extras-layer module leaves the standard package
looking smaller than its promise and forces a reader to know which upper
module to open. The two placements are not exclusive; the destination stub is
the one that must exist.

**A stub's registrar never returns success.** Either it is left out of the
package's entry point until the implementation moves, or it returns an error
naming the missing API. A stub that registers nothing and reports success
lets the package's entry point succeed while the baseline is absent, which is
the empty success
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
forbids: an embedder depending on the package for the baseline gets a green
registration and a missing global, and discovers it from a program's
reference error rather than from the registrar.

**When the runtime reports what fraction of a standard it implements, the
number is computed from the headers and carries the marker count beside it**
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)). "Nine
of the baseline's fourteen API groups landed, three more present in the extras
layer under marker, two absent" is an honest statement; "sixty-four percent
conformant" is not, because a reader cannot tell whether the missing part is
the one their program needs.

**When every API in a standard package has landed and no marker remains in the
extras layer, the package's own top-level documentation drops its "in
progress" line in the same change that removes the last marker**, because a
package that reached completion and still says "skeleton" misleads in the
opposite direction, and it misleads the embedders the runtime most wants.

## The registrar signature is part of the header's promise

A standard package registers its APIs through one entry point that takes the
same context arguments for every module — typically the guest context and the
realm the APIs are installed into. **When one module's registration function
takes a different argument set from its siblings, the header records that as
a known gap**, because the composition mechanism above
([baseline-plus-extension-tuple](./baseline-plus-extension-tuple.md)) assumes
uniformity, and a registrar that omits the realm argument installs its API
into whichever realm happens to be current rather than the one the caller
named. That is a conformance bug with a header's shape: the API is present, it
is required, it is landed, and it still does not behave as the standard's
multi-realm semantics require. Recording it in the header is how the gap
survives until someone fixes it rather than being rediscovered by the first
embedder to use two realms.

## When not to use it

A package that is complete and has been complete for several releases does not
need the placement marker line on every module, though the clause citation
remains useful as a reader's index into the standard. And a header is not a
changelog: it says what the module is and where it is, never what changed. A
header that grows a history section has stopped being read.
