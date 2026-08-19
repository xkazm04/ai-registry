---
layer: technique
type: technique
subject: beneficial-ownership-resolution
technique: officer-record-reading
status: forged
laws: [missing-is-not-zero, lead-not-finding]
shared_with: []
use_when:
  - confirming a person's role or stake against the official register
  - a registry record exists but the person cannot be found in it
---

# Officer-record reading

The officer record — the register's own listing of who holds which organ
seat, directorship, or stake in an entity — is the corroboration hinge of
the whole subject. Reading it correctly means three things: read *all* of
it, close identity on a strong key, and report the outcome in a vocabulary
that preserves the difference between "the register disagrees" and "the
register could not be asked".

## Read every organ array; one is never the record

Registry payloads structure a company's people into multiple parallel
collections — statutory organs, supervisory and other organs, shareholders
and members, sometimes more than one array per category. All of them are
load-bearing. The measured failure is reading only the obvious array and
concluding "person not present": a director listed under an
other-organs collection, or a stake recorded in a second members array,
makes the person invisible to a single-array read, and the false negative
then renders as "the register does not confirm this tie" — a claim of
conflict manufactured by an incomplete read. Enumerate the payload's
collections once, from the register's documentation and a dump of real
records, and encode the full list in the one shared reading routine.

## Close identity on a strong key; gate the fallback

Names collide. The register usually records a strong disambiguator for each
natural person — date of birth is the common one — and identity is closed on
exact match of that key, in the spirit the beneficial-ownership data
standards formalize: a person claim travels with the attributes that make it
uniquely resolvable, not with a bare name. Three rules structure the match:

- **Exactly one entry matching the strong key = identity confirmed.**
- **Multiple distinct persons sharing the key = ambiguous**, which is a
  conflict outcome, not a confirmation — pick-the-first is fabrication.
- **Zero entries matching, but entries present = the register does not
  confirm this person**, however well the names align.

Old records complicate this: entries predating the register's collection of
the strong key carry none. A name-similarity fallback is legitimate there,
but *gated to exactly the entries whose strong key is null*, and its
conclusions labeled as the weaker evidence class they are. Ungated, the
fallback quietly converts the whole match back into the name-only join the
strong key exists to prevent.

## The three-state outcome vocabulary

Every officer-record check ends in one of three states, and the states are
never collapsed:

- **Registry-confirmed** — the person was positively identified among the
  record's roles or stakes.
- **Conflicting** — the record exists and was read in full, but this person
  could not be identified in it (or the match was ambiguous). This is
  evidence *against* the asserted tie and is surfaced as such.
- **Unconfirmed / could-not-attempt** — the check never happened: the entity
  has no record in this register, the person's strong key is missing from
  your own roster, the fetch failed. This is *no evidence either way*.

The third state subdivides usefully, and the subdivisions are worth carrying
as distinct flags: "entity structurally outside this register" (bodies
created by special statute that the commercial register never holds) is a
permanent limit of the source; "strong key missing on our side" is a gap in
your roster; "record too old to carry the key" is a gap in theirs; "negative
result but some entries carry no key" means the negative is not conclusive —
the person could be among the keyless entries. Each names a different next
action, and a reader who sees only "unconfirmed" can take none of them.

## Confirmation annotates; it never promotes

A registry-confirmed identity is machine corroboration. It attaches
provenance, raises reviewer confidence, and reorders the review queue — it
does not flip the tie to verified. The human gate exists precisely because
the register can confirm that *a* person of that identity holds the role
while the surrounding claim (that the role means what the story says it
means) still needs judgment. Symmetrically, a conflicting outcome does not
auto-delete the tie; it flags it for a human, because the conflict may be
the register's lag rather than the source's error.

## When not to use it

Officer-record reading answers "does the register connect this person to
this entity, and how". It does not answer whether the connection is
beneficial ownership in the legal-threshold sense — declaration-based
beneficial-ownership registers, where they exist, are a different source
with different failure modes (self-reported, threshold-hidden) and need
their own handling. Nor is the technique a substitute for the archive when
the live register returns nothing at all — that absence routes to the
struck-off-entity archive check, not to a "conflicting" verdict.
