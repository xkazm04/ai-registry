---
layer: technique
type: technique
subject: analytics-store-design
technique: capability-flags-and-refusal
status: forged
laws: [never-present-absence-as-an-answer]
shared_with: []
use_when: [a backend cannot serve a query surface, adding a filter some backends have not ported, wiring a caller that must adapt to backend capabilities]
---

# Capability flags and refusal

A store that fronts heterogeneous backends will always have surfaces some
backend cannot serve: a document store without server-side aggregation
cannot compute a grouped rollup with aggregate predicates inside a bounded
read; a backend nobody has ported the newest filter to cannot honor it. The
technique is how the store *says so* — loudly, mechanically, and at the
right moment — instead of shipping the two catastrophic alternatives: the
unfiltered page presented as filtered, or the empty page presented as "you
have no data". Both are the same sin under
[never-present-absence-as-an-answer](../../../_laws.md#never-present-absence-as-an-answer):
absence of capability laundered into a value.

## Refusal is a typed outcome, not an error string

The store interface carries an explicit "unsupported" variant in its error
type, distinct from "failed". The distinction matters at every layer:

- **At the interface**: an unimplemented method returns unsupported — a
  deliberate, permanent, per-backend fact — while a down database returns a
  failure. Callers retry failures; they must never retry refusals.
- **At the protocol**: refusal maps to its own status code (the "not
  implemented" family, not the generic server-error family) with a machine
  answer that **names the missing capability** — which filter, which
  surface. "This backend does not serve the trace listing" is actionable;
  a bare 500 is a support ticket.
- **Per predicate, not per endpoint**: a backend that serves the listing but
  not one exotic filter refuses only requests that *use* that filter. The
  granularity of refusal is the granularity of the capability, or every gap
  disables a whole surface.

The naming clause carries the technique's honesty: a refusal that says
*what* is missing lets the caller drop the filter knowingly; a silent
best-effort makes the choice for them, invisibly, and every screen rendered
from it is a lie wearing the filter's label.

## Capability flags: discovery before collision

Refusal at request time is correct but late. Pair it with declared
capability flags — interface methods like "serves traces?" that a backend
answers statically — so:

- **Callers adapt up front**: a UI hides the trace tab instead of rendering
  a tab that always errors; an integration checks the flag instead of
  probing with a throwaway request.
- **Operators learn at startup**: the backend announces its gaps on the
  diagnostic channel when it connects, so the person who chose this backend
  for this deployment reads the trade-off at deploy time, not from a user
  report.
- **The flag and the behavior stay one fact**: the flag's value and the
  method's refusal must derive from the same place. A flag saying "yes"
  above a method saying "unsupported" is worse than no flag.

Keep the flag vocabulary coarse — per surface, not per micro-feature. A
capability matrix with forty booleans is documentation pretending to be an
API; three or four flags marking the genuinely divergent surfaces is a
contract callers actually check.

## The refusal is under test

The subtle decay mode: a backend refuses correctly today; next quarter a
refactor gives the method a default implementation that returns an empty
list, and the refusal silently becomes an empty success. Nothing fails —
except every user of that backend now sees "no traces" instead of "traces
not served here".

So the conformance suite — the shared test battery every backend runs —
**asserts the refusal itself**: for each declared gap, the suite calls the
method and requires the unsupported outcome, not an empty page. A refusal
under test is a contract; a refusal by convention is one refactor from a
lie. This is the single highest-leverage clause in the technique: it makes
honesty a property the build enforces rather than a virtue the team
remembers.

## When not to use this

- When the capability could be implemented in an afternoon — refusal is for
  genuine physics (a backend that *cannot* aggregate) or deliberate
  sequencing, not for skipping work on the hot path of a shipped product.
  Prefer implementing.
- For enforcement-adjacent surfaces, refusal may not be enough: a backend
  that cannot serve the usage-window read cannot host limit enforcement *at
  all*, and the honest answer is refusing the deployment shape, not the
  query.
- Do not use capability flags to fork the logical schema. Flags mark which
  *queries* a backend serves; the data model stays identical everywhere, or
  portability — the reason the heterogeneous fleet exists — is already
  gone.
