---
layer: technique
type: technique
subject: beneficial-ownership-resolution
technique: name-to-identifier-discipline
status: forged
laws: [lead-not-finding, disclose-never-repair]
shared_with: []
use_when:
  - a source attributes a person to a company by name only
  - tempted to resolve a dirty company name to a registry identifier
---

# Name-to-identifier discipline

Secondary sources — press databases, watchdog feeds, disclosure filings —
routinely attribute a person to a company by free-text name and nothing else.
The name is dirty by nature: the same firm appears with and without its
legal-form suffix, with a comma or without, under a former name, or
abbreviated. The discipline is one sentence with teeth: **the identifier is
the reliable hinge and a name is only a lead — resolve the name through the
register's own search, verify the result, and when no confident resolution
returns, drop the link rather than invent one.**

## The procedure

1. **Normalize for search, not for identity.** Fold diacritics, case, and
   punctuation to widen recall against the register's search endpoint. This
   normalized string is a *query*, never a key — two names that normalize
   identically are still two names.
2. **Search the register; demand corroboration on the hit.** A single result
   whose registered name matches the source name after normalization is a
   candidate. Strengthen it with any second attribute the source carries —
   locality, legal form, sector — before accepting.
3. **Route resolution through an injected resolver, not inline lookups.**
   Keep the resolution step a pluggable dependency of the link-building
   logic so the logic itself stays pure and fixture-testable, and so the
   whole pipeline has exactly one place where names become identifiers —
   one place to audit, one place to fix.
4. **On no confident hit: drop, and count the drop.** The link does not
   enter the graph. The dropped name is preserved as a lead in the run's
   report so a human can chase it; the count of drops ships with the run so
   coverage claims stay honest.

## The blacklist the first incident buys you

Register search does exact-name matching happily against junk. The canonical
incident shape: a source stores a person's occupation loosely as a generic
category label in its company-name field, some real entity in the register
happens to bear that literal label as its registered name, and exact-match
resolution welds every person carrying the label to that one unrelated
entity. In the measured case, dozens of politicians — a fifth of the tie
population — acquired a false edge to a single irrelevant organization, each
edge an accusatory person-to-company claim about a real sitting official.
The fix has two halves, and both are required: a generic-name blacklist at
the resolver (category labels, placeholder strings, legal-form-only names
never resolve), and a purge of the already-written edges, scoped by a safety
gate that deletes only edges positively annotated as the incident's class —
never "everything pointing at that entity".

Decision rules:

- **When a resolved name is shorter than a real company name plausibly is,
  or matches a known category vocabulary, refuse resolution** regardless of
  how exact the match is.
- **When one register entity accumulates links from many unrelated persons
  through the same source field, treat the entity as a junk-name attractor**
  and quarantine the whole cluster for review.
- **When purging false edges, select by the recorded defect annotation, not
  by destination**, and print loudly anything at the destination that the
  gate excluded.

## Namesakes: the person-side twin of the same trap

The name-to-identifier trap has a person-side mirror: sole traders and
single-person firms are registered under the person's own name, so a
name-only join manufactures ties between an official and every namesake
tradesperson in the country. The class is systematic enough to deserve
systematic treatment — such matches never auto-resolve; they enter as leads
gated on a strong identity key (see officer-record reading), and a purge of
the class, once detected, is a normal maintenance operation with the same
annotation-scoped safety gate as above.

## What resolution never does

- It never mints an identifier by similarity, frequency, or "the biggest
  firm of that name". Prominence is not identity.
- It never auto-promotes a resolved link past the human review gate. A
  registry-corroborated resolution raises reviewer confidence and annotates
  provenance; a human decides whether the tie is verified.
- It never silently substitutes a repaired name. If the source string had to
  be altered beyond search-normalization to get a hit, the alteration is a
  judgment call and belongs to a human.

## When not to use it

When the source itself supplies a registry identifier, use the identifier
and checksum-validate it — do not re-resolve the name and risk introducing a
conflict where none existed (though a name/identifier mismatch, when
noticed, is a flag worth surfacing). And when the task is exploratory —
building a candidate pool for human triage rather than graph edges — looser
name matching is legitimate, provided every output is labeled as a lead and
the pool never feeds an automated join.
