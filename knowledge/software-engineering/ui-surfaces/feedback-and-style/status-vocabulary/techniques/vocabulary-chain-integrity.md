---
layer: technique
type: technique
subject: status-vocabulary
technique: vocabulary-chain-integrity
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [deciding whether a vocabulary is a type or a constraint, a new member renders as a raw unlabeled token, a green registry gate over members minted elsewhere]
---

# Vocabulary chain integrity

A closed display vocabulary is **one artifact with four obligations**, and
a change discharges all four in the same commit or it has shipped a bug.
The four layers — storage constraint, wire token, label catalog, rendered
presentation — are not four definitions of the vocabulary; they are one
definition and three derivations, and every defect in this area lives at a
joint where a derivation was hand-maintained instead.

## The authority is the typed definition at the source of writes

Define the member set **once**, as a closed type in the language that
writes the values — not as a free string guarded by a storage constraint.
The distinction is load-bearing:

- **A storage constraint is a write guard, not a contract.** It stops bad
  rows and teaches consumers *nothing*: no layer above it can enumerate
  the members, so nothing above it can be checked against them. A
  vocabulary that exists only as a constraint is safe in the database and
  broken on screen — measured in one repo at 49 of 66 storage-level
  vocabularies with **zero** label coverage, invisible because a member
  list embedded in a migration string is unreadable by every layer above.
- **A closed type is enumerable**, so the wire artifact can be generated
  from it, the label table can be keyed by it, and a missing case can be
  a compile error instead of a grey pill.

Mirror the authority into the storage constraint anyway (defense in
depth: the database rejects what the type forbids), and validate **at the
door** before the write, so a bad token from an external payload becomes
a structured validation error naming the allowed members — not a raw
constraint violation nobody can act on.

## The wire type is the chain's real contract

The generated wire artifact — a string-literal closed type derived from
the authority — is the only artifact producer and consumer can *both*
typecheck. Skipping the generation step is the root deviation from which
every downstream one grows: once the field crosses the boundary typed as
a bare string, `Record<string, …>` is the only lookup that compiles, the
exhaustiveness the union would have given is silently off, and the
runtime fallback (`?? token`) buys back what the type lost — which is
exactly how the tokens someone forgot become the tokens users see raw.
One repo measured 155 status-shaped fields crossing as bare strings
against 88 that crossed as closed types; a sibling with a full contract
generation pipeline defeated it identically by declaring the fields as
plain strings server-side, so its generated contract contained zero
enums. **The seam breaks at serialization in every stack measured; guard
that joint first.**

## Drift gates between the layers

Each adjacent pair of layers can drift, and each needs its own gate —
keyed on the authority, per
[gate-sees-target](../../../../_laws.md#gate-sees-target):

- **Authority ↔ storage constraint.** Mirrored by convention in every
  repo measured, verified by none. The gate is a test that parses the
  storage definition and diffs it against the type's members.
- **Authority ↔ label catalog.** The strongest form is a compile-time
  coverage check: a small conditional type asserting that the label
  table's key set covers the wire union, so the build error **names the
  missing members**. It fires at the keystroke that adds the variant —
  not in CI, not at test time — and one line per vocabulary is also the
  missing declaration of *which* catalog section labels *which* union,
  a link that otherwise exists nowhere and must be inferred by member
  overlap. Hand-maintained parity tests (a literal mirror of the member
  list inside a test) are the fallback where no type system spans the
  boundary — they work, and they do not scale, and they catch drift at
  test time rather than at the keystroke.
- **Catalog ↔ locales.** A label absent for a token is absent
  *identically in every locale*, so no locale-parity board can see it —
  the domain-coverage blind spot; see the owning subject's
  [completeness-gates](../../../../client-architecture/i18n/techniques/completeness-gates.md).
- **Presentation table ↔ union.** Key the table by the union and a new
  member is a compile error; key it by string and a new member is
  `undefined` at runtime — a badge with no classes and no label.
- **Union ↔ map, when the map *is* the enumeration.** Sometimes the
  hand-written table is the only place the members are written down, and
  the running program also wants the member list. The derivation may then
  run the other way — but the gate may not vanish with it. Assert the map
  **against** the vocabulary with a conformance check that verifies the
  literal covers the type without widening it (the *satisfies*-style
  operator where a typed language has one; a total-match at the definition
  otherwise), and take the runtime enumeration from the **gated** map's
  keys. The key-list cast that step needs is a **derivation, never a
  gate**, and the failure is letting it stand in for one — asserting an
  *ungated* map's keys into the vocabulary type, or minting the vocabulary
  as "the keys of this map" and calling that a definition. That cast is
  unchecked by design: a structurally typed value may carry keys its
  declared type never mentions, which is exactly why the key list arrives
  typed as plain strings in the first place. Over an ungated literal it
  makes an incomplete map emit a confidently typed, silently short
  enumeration — the drift signal is not weakened, it is **deleted**. Gate
  first, derive second. And watch for the near-miss that reads as a gate
  and is not one: a conformance check whose key side is left open to any
  string constrains the *values* and asserts nothing about coverage.
- **Ordering ↔ union.** A vocabulary that carries an *order* — severity
  rank, lifecycle precedence, sort priority — needs the same totality, and
  an array of members is the wrong container to hold it in. An array typed
  as members-of-the-union checks each **entry** and never the **count**:
  omit a member and it still compiles, still reads as the vocabulary. Then
  the position lookup answers the omitted member with the not-found
  sentinel — a value *smaller than every real rank* — so the unknown
  member does not degrade toward the attention-demanding end and does not
  raise anything; it sorts silently to the front and reads as the most
  urgent row on the page
  ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
  Hold the order as a **total map from the vocabulary to its rank**, so a
  new member is a compile error at the keystroke and a lookup miss is
  distinguishable from a rank that happens to be zero.

These gates share one decision rule, and it is a rule about
*direction*: **every derived container over a closed vocabulary must be
total by construction, and totality must be checked in the direction the
derivation actually runs.** Keyed by the union where the union is the
authority; gated against the union where the map is the authority. A
container whose type constrains only its contents — an array of members, a
string-keyed lookup — offers no direction to check and therefore checks
nothing, and a cast that manufactures the union out of the container
converts the one remaining signal into a confident answer.

## Registries that do not see their writers

The chain's failure generalizes beyond status columns: any closed
vocabulary with a registry (event names, alert scopes, metric ids) drifts
the moment members can be **minted outside it**. Measured instances of
the class: an event vocabulary with six members created as literals in a
producer module, invisible to the registry's own checker, which scanned
only the registry files — a green gate over a proxy; and one alert
vocabulary consumed by two evaluators honoring different scope fields, so
the same rule fired differently depending on which consumer saw it first.
The rule: enumerate the writers, and point the gate at the population of
*written* members, not at the registry's self-description
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success) —
a registry check that finds nothing must be distinguishable from one
that looked at the wrong files).

## The unknown-token path runs in production

Version skew guarantees a consumer will eventually receive a member it
has no label for. The resolution function is total by policy — an honest
degradation, never a crash or an empty string — **and the miss is
reported in production**, not only in development builds, because skew is
a production phenomenon. A dev-only warning on the unknown path means the
one environment where the defect matters is the one environment where it
is silent. The reported miss names the category and token: a mapping gap
with a timestamp, fixable as a one-line catalog addition instead of a bug
hunt. (The display *direction* of the degradation belongs to
[status-color-mapping](./status-color-mapping.md); the token/label boundary
itself to
[token-label-separation](../../../../client-architecture/i18n/techniques/token-label-separation.md).)
