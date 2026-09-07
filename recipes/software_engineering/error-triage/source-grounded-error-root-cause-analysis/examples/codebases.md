# A registered local checkout as the `source_control` connector

What was learned mapping this recipe onto a set of local checkouts registered with the
agent. Nothing here is part of the recipe: swap the connector and this file stops
applying while the recipe does not change.

## What the mapping has to decide

**A local checkout is at whatever revision somebody last left it at, and that is the
single largest source of quietly wrong reports.** It may be a feature branch, it may be
weeks behind the deployed release, it may have uncommitted edits in the file the trace
points at. The recipe's alignment step is not satisfied by "the file exists here": it
needs the revision the checkout is on, compared against the release the failure came
from. Where the two differ and the checkout can be read at the failing revision, read it
there. Where it cannot, the report says which revision it read and that the comparison
was not made.

**Cross-project search is the capability that makes this recipe work and the one that
makes it lie.** Searching a function name across every registered project finds the
caller in another repository, which is the whole point, and it also finds three
same-named functions that have nothing to do with the failure. Constrain the search to
the projects the trace's own frames name before widening, and when a match is found by
name alone rather than by a frame, say so in the report.

**The connector's category list includes `desktop`, and that entry is dropped rather than
carried into the recipe.** Every agent has desktop access, so it binds to nothing;
`source_control` is the legal type here and is what adoption resolves.

**Reading a file is cheap and reading a repository is not.** The useful bound is the
trace: the failing frame, its file, and the callers that reach it. Widening to a whole
package produces a longer report that is not a better one, and the triager reads the
first paragraph either way.

## What transfers to any source_control connector

- Ask what revision you are reading before claiming it is the code that ran.
- A name match is not a call-site match; say which one the report is built on.
- The trace is the search bound. Widening past it trades confidence for length.
