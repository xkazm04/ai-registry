---
layer: technique
type: technique
subject: accountability-publishing-ethics
technique: public-role-scope-limit
status: forged
laws: [non-partisan-symmetry, provenance-or-nothing]
shared_with: []
use_when: [deciding what a source document contributes to the graph, a research pass surfaces personal-life material, scoping which people and which facts the platform covers]
---

# Public-role scope limit

An accountability platform's moral license comes from a single trade:
officials accept scrutiny of their *public roles* in exchange for public
power. The license does not extend to their private lives, and it does not
extend selectively. This technique turns that principle into two enforceable
boundaries — a **fact boundary** (which facts about a person may enter the
system) and a **population boundary** (which people the method covers) — and
places both at ingestion, where they can be enforced once, rather than at
publication, where they must be re-argued on every surface.

## The fact boundary

The rule: a fact enters the graph only if it concerns the exercise of a
public role — votes, speeches, sponsorships, declared interests, registry
roles in firms, public contracts, public money. Family relationships, health,
religion, lawful private conduct, private finances with no registry nexus to
public money: out of scope, always, even when a source offers them freely.

Enforcement notes:

1. **Filter at ingestion, not at rendering.** Data that "merely sits in the
   store" leaks: through exports, through debug surfaces, through the next
   feature that queries broadly. What must never publish must never persist.
2. **The nexus test for edge cases.** A private fact enters only via a
   registry nexus to public power: a spouse's firm is out of scope *until it
   appears in the official conflict-of-interest declaration or holds public
   contracts* — and then the fact that enters is the declaration or the
   contract, cited to its registry, not the marriage. The private fact rides
   in only as far as the public record itself asserts it.
3. **Web and model research inherit the boundary.** A research agent will
   happily return personal color — hobbies, families, feuds from profiles and
   interviews. The scope limit is part of the research contract: media
   coverage is context at most, primary registries outrank it, and nothing
   outside the public-role boundary lands even as enrichment metadata.
4. **Adjudications are in scope through their public character.** A court
   ruling or sanction concerning conduct in office is a public record about
   the public role. A private lawsuit with no office nexus is not, however
   newsworthy.

## The population boundary

Scope also limits *who*, and the rule is symmetric by construction: **cover
the whole population of the role, or do not cover the role.** Every holder of
the mandate gets the same detectors, the same metrics, the same surfaces. A
platform that analyzes some members — even for innocent reasons like data
availability — has made an editorial selection it cannot defend, and in a
partisan environment every gap will be read as bias. Where coverage is
genuinely partial (one chamber ingested, one term), the boundary is drawn at
role-and-period grain and disclosed, never at person grain.

Two symmetry corollaries live here:

- **Findings surface symmetrically across polarity.** The clean record and
  the diligent legislator get the same surface machinery — equal badge
  weight, equal placement — as the flagged tie. Absence of conflict, verified
  against the registry that could contain it, is a published finding.
- **Detectors run identically across parties.** No per-party thresholds, no
  "focus lists". The strongest answer to a bias accusation is that the
  method, published and versioned, provably cannot see party at the
  detection layer.

## Decision rules

- **When a fact is borderline, ask what record would be cited.** If the only
  citable source is a gossip column, a social profile, or an anonymous claim,
  the fact fails provenance *and* scope together. If a primary registry
  asserts it, the registry's own scope decision (it is a public record) does
  most of the ethical work.
- **Former officials keep public-role coverage for the period of the role.**
  The record of exercised power stays legitimate after the mandate ends;
  new private conduct after leaving office does not enter unless a new public
  role begins.
- **Relatives are never entities of their own.** They may appear as the
  text of a public record (a declaration names them); they get no page, no
  metrics, no follow key. The platform's unit of coverage is the mandate,
  not the family.
- **Refusing out-of-scope material is silent; refusing in-scope material is
  disclosed.** Dropping a private-life fact needs no notice. Excluding an
  in-scope record (a broken row, an unparseable filing) is a coverage gap
  and is counted and disclosed like any other withheld data.

## When not to use it

- Not a shield against the subject's own official acts. "Private" does not
  mean "embarrassing": a vote, a declared interest, or a public contract is
  in scope no matter how personal its consequences feel to the subject.
- Not a substitute for local law. Data-protection and defamation regimes add
  constraints beyond this ethical floor; the technique sets the platform's
  own boundary, and counsel sets the legal one.
