---
layer: technique
type: technique
subject: mcp-tools
technique: tool-identity-vs-tool-name
status: forged
laws: [identity-survives-reuse, one-authority-per-vocabulary, absent-guard-is-loud]
shared_with: []
use_when: [a tool rename splits its history into a death and a birth, consent records or cost accounting keyed on a name that changed, deciding what a downstream should store to refer to a tool]
---

# Tool identity vs tool name

[tool-schema-design](./tool-schema-design.md) treats a tool's name as the
selection surface and the disambiguation load-bearer;
[server-composition](./server-composition.md) makes it the registry key.
Both are right, and together they quietly assign one string two jobs that
pull in opposite directions. **What the model addresses** wants to change:
names get sharpened when selection accuracy is measured, namespaced when a
federation collides, reworded when a description turns out to mislead.
**What an operator correlates** must never change, because everything built
on it — traces, evaluation ledgers, consent grants, per-tool cost accounting,
recorded sessions, adoption metrics — is a claim about a tool *over time*.

Give one string both jobs and every rename is a small act of destruction. The
telemetry shows a tool dying and an unrelated tool being born in the same
release. Standing consent grants keyed on the old name silently stop
applying, or worse, are re-granted under the new one by a user who thinks
they are approving something new. And the question that matters most in the
week after a rename — *did my rename help, and what did it break?* — becomes
permanently unanswerable, exactly when someone needs it.

## Publish an identifier beside the name

The mechanism is small: mint a **rename-stable identifier** for each tool at
the moment the tool is created, and carry it on the wire *beside* the
addressable name — in the response metadata of the tool definition at listing
time, and on every tool result. A rename then changes the address and leaves
the identity intact
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse) applied
to a published capability, where the "reuse" is a rename).

Both halves are required. On the definition alone, a consumer can build a
name-to-identity map at listing time but cannot attribute a result it
receives without re-listing. On the result alone, nothing can be correlated
until the tool has actually been called. Carrying it on both makes every
downstream able to store the identifier instead of the name without holding
any state of its own.

What that buys, stated as capabilities rather than tidiness:

- **Migration-free continuity.** Every ledger keyed on the identifier —
  traces, evaluations, consent records, cost per tool — spans the rename with
  no backfill and no dual-write window.
- **Renames become detectable rather than invisible.** Same identity, new
  address is a *rename event* a consumer can recognize and report. Without
  the identifier, the only observable is one series ending and another
  starting, which is indistinguishable from a removal plus an addition.
- **Blast-radius measurement.** Because the before and after are one series,
  the rename can be evaluated on the metric it was made for — selection
  accuracy — instead of defended by argument.

## When the identifier is allowed to change

Only when the tool's **semantics** change materially: the operation it
performs, the effect it has, the trust it requires. Never for a name-only
fix, never for a namespace change, never for a description rewrite. That rule
is the entire difference between an identity and a second name — an
identifier that drifts along with the name is a synonym, and a synonym buys
nothing.

The corollary is that a semantic change *should* mint a new identifier even
when the name stays the same. A tool that quietly became destructive under an
unchanged name is the one case where a downstream most needs to see a
discontinuity, and it is the case a name-keyed ledger is guaranteed to miss.

## Uniqueness is a build failure, not a review question

Duplicate identifiers destroy the property the identifier exists to provide,
and they arrive the ordinary way — a capability copied as a starting point
for a new one. So the uniqueness check runs mechanically across the whole
published surface, in the same build that produces the artifact, and a
collision fails it. The registry remains the one authority on what exists
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary));
this check is what keeps the registry's second key as trustworthy as its
first. A convention enforced only in review is enforced only as well as the
busiest reviewer.

**Enumerate from the constructed surface, not from the source text.** A check
that finds the identifiers by pattern-matching how they are *written* has its
population defined by a declaration syntax, and a refactor that moves the
identifier from one form to another — an overridden property to an attribute,
say — empties the population without failing anything. The check then reports
zero collisions across zero identifiers, in the same green it reported before,
and it will keep reporting it forever. One audited surface reached exactly that
state: the gate still searched for the abandoned form, matched nothing at all,
announced no violations, and a placeholder identifier copied from a test fixture
was shipping on a real capability underneath it. Build the list from the
registry the program actually constructs, and have the check fail when that list
is empty — an identifier gate that finds no identifiers is broken, not passing
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

## The boundary: correlation, not addressing, not authorization

State this in the documentation, because a stable opaque string beside a tool
looks like a handle and will be treated as one:

- **A caller must not be able to invoke by identifier.** Invocation goes
  through the name, which is the addressable surface the schema, the listing
  and the collision rules all govern. A second dispatch key is a second door,
  and [server-composition](./server-composition.md) allows exactly one.
- **Possession proves nothing.** The identifier is published to every client
  that lists the server; it is not secret, not scoped, and carries no claim
  about the holder. Authorization is decided from the caller's verified
  principal, never from a string the caller can read off a listing.
- **It is not a version.** It answers "is this the same tool", not "is this
  the same behavior as last month". Versioning, if the surface needs it,
  is a separate field with a separate contract.

When not to bother: a single-server surface with a handful of tools and no
persisted per-tool history has nothing downstream to protect, and the
identifier is ceremony. The moment anything *stores* a tool reference across
time — an audit trail, a spend report, a standing grant, an evaluation
suite — the name is the wrong key and the identifier earns its cost.
