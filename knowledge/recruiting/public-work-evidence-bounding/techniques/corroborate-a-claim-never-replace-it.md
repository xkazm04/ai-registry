---
layer: technique
type: technique
subject: public-work-evidence-bounding
technique: corroborate-a-claim-never-replace-it
status: forged
laws: [absence-of-evidence-is-not-evidence, say-only-what-the-record-holds, inference-must-look-like-inference]
shared_with: []
use_when: [combining a candidate's own account with their public output, writing the evidence block a recruiter reads, deciding what an unverified résumé claim means]
---

# Corroborate a claim, never replace it

Public work earns its place in a hiring process by *confirming* things the
candidate already told you. It is a second, independent, hard-to-fake-in-volume
witness to a claim that already exists in the record. It is not a replacement
record, and the moment it is treated as one, the pipeline starts ranking
people by what they were free to publish.

The distinction is structural, not tonal. A corroborating read produces
statements of the form "the candidate claims X; their public output shows Y,
which supports X". A substituting read produces "their public output shows Y,
therefore X" — and, fatally, "their public output does not show Z, therefore
not Z".

## The three-bucket artifact

A public-work read outputs three buckets and never one. They are different
kinds of statement and they carry different weight:

1. **Corroborated** — a claim in the candidate's record that the public
   evidence supports. The claim's standing rises; the standing it rises *to*
   is the provenance subject's business, not this one's.
2. **Not reached** — a claim the public evidence neither supports nor
   contradicts. This is the largest bucket in a healthy read and it is
   *neutral*. It must be phrased as unverified-by-this-source, never as
   unsupported, doubtful, or missing. The naming here is load-bearing: a
   column headed "unverified" gets read as "suspicious" by a tired recruiter
   at four in the afternoon, and the copy must resist that reading actively.
3. **Unclaimed strength** — a capability the public work evidences that the
   role brief never asked about and the candidate never mentioned. This is
   the genuine upside of reading public work at all: it is the only place in
   the pipeline where evidence flows *outward* from the requisition's
   assumptions, and it is how adjacent-domain candidates stop being filtered
   out by a keyword list.

A fourth possible bucket — public evidence that *contradicts* a claim — is
real but rare, and it is never a finding on its own. It is a probe: something
for a human to ask about, because the innocent explanations (confidential
work, a different name, a rewritten history, a claim about a period the public
record does not cover) outnumber the guilty ones heavily.

## Procedure

1. **Start from the claims, not from the artifacts.** Enumerate what the
   candidate asserted, then ask the public record about each. A read that
   starts from the artifacts produces a description of a profile, not evidence
   about a person, and it has no way to populate the "not reached" bucket at
   all.
2. **Bind each corroboration to the specific artifact and field that carried
   it.** "Supported by sustained activity in three projects over four years"
   is checkable; "supported by their public work" is decoration.
3. **Keep the buckets separate all the way to the surface.** Merging them into
   a single narrative paragraph destroys the distinction the technique exists
   to create — the reader cannot tell which sentences rest on the candidate's
   word and which on the public record.
4. **Weight by role dependence before presenting.** For a research role,
   publications may be the primary corroborating instrument; for a creative
   role, a portfolio may be. For most roles, all three buckets are supporting
   material next to work history and assessment.
5. **Render inference as inference throughout.** A capability read off a
   project name is a hypothesis with a suggested probe, and it must not appear
   in the same grammar as an observed demonstration
   ([inference-must-look-like-inference](../../_laws.md#inference-must-look-like-inference)).

## Decision rules

- **When a claim lands in "not reached", nothing happens to it.** No score
  adjustment, no flag, no downgrade
  ([absence-of-evidence-is-not-evidence](../../_laws.md#absence-of-evidence-is-not-evidence)).
  This rule is violated more often by user-interface design than by scoring
  code: an empty checkmark column is a downgrade rendered in whitespace.
- **When public evidence corroborates a claim, the claim's ceiling is still
  the claim.** Corroboration confirms; it does not upgrade a stated
  familiarity into demonstrated mastery.
- **When public evidence suggests something the candidate never claimed, say
  it as an observation and hand it to a human.** An unclaimed strength is an
  argument for a conversation, not an automatic requalification into a role
  they did not apply for.
- **When public evidence appears to contradict a claim, route to a human with
  both texts and no verdict.** The system's job ends at "these two statements
  differ"; adversarial reading of the candidate's document is the
  authenticity-screening subject's craft, and even there the conclusion is a
  question.
- **When there is no public work at all, the artifact still renders** — with
  every claim in "not reached" and an explicit line that no public evidence
  was supplied or found, which is a neutral condition
  ([public-work-is-optional-evidence-not-a-requirement](public-work-is-optional-evidence-not-a-requirement.md)).

## Anti-patterns

- **The verification column.** A checklist of the candidate's claims with tick
  and cross icons. It converts "we did not see it" into "false" through pure
  visual grammar, and no disclaimer survives the icon.
- **Scoring the corroboration rate.** "62% of claims verified" is a number
  about the visibility of someone's career, computed as though it were a
  number about their honesty.
- **The single narrative.** One fluent paragraph blending the candidate's
  account with the public record so that no reader can separate them.
- **Public-first shortlisting.** Ranking a pool by public output and reading
  the documents afterwards. Everything downstream inherits the availability
  bias, and it cannot be corrected later because the excluded candidates are
  gone.
- **Inventing the gap.** Reporting a missing capability that the candidate's
  own record plainly evidences, because the public source did not happen to
  show it — a claim about a person that nobody made
  ([say-only-what-the-record-holds](../../_laws.md#say-only-what-the-record-holds)).

## When not to use it

- **When the public artifact *is* the assessment instrument** — a portfolio
  review for a role whose output is a portfolio, a publication record for a
  research post. There the public work is primary evidence by design; it is
  still bounded, still attributed, and still not a substitute for the
  interview.
- **When no claims exist yet to corroborate** — a sourcing pass with no
  application on file. Reading public work there produces exposure and
  interest signals for outreach, which is a different and much weaker use, and
  it must not be laundered into an assessment when an application later
  arrives.
