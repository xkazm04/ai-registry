---
layer: technique
type: technique
subject: remote-capability-probing
technique: verified-behaviour-ledger
status: forged
laws: [unknown-is-not-a-value, claimant-does-not-adjudicate]
shared_with: []
use_when: [a design rests on how a hosted platform behaves and only some of it has been seen running, documentation and the live platform disagree, deciding which claims in a setup guide a reader may rely on]
---

# Verified behaviour ledger

Software built on a platform somebody else runs is designed largely from that
platform's documentation, and a fraction of that documentation is wrong for
the instance actually in use: a property the schema reference lists and the
live validator rejects, an event the guide says fires and the deployment never
delivers, a token scope narrower than the page implies. The design cannot wait
until every claim has been tried, so it is written on a mixture of evidence —
and the naive design document hides the mixture, stating everything in the
same confident present tense.

The technique is a **ledger of claims about remote behaviour**, each tagged
with the strength of its evidence, kept in the document the claims shape, and
rewritten as live runs settle them.

## The three tags

- **Sourced** — the claim quotes or cites a specific page of the platform's
  own documentation, checked on a stated date. It is the platform's claim,
  not an observation.
- **Recalled or unverified** — the claim comes from memory, an older
  version, a forum, or inference, and nobody has checked it against either
  the documentation or the platform. It is a hypothesis carrying a design
  decision, and it is marked as such where the decision is made.
- **Verified** — the claim was observed on the live platform: the date, the
  instance, the identity and role used, and the identifying artefact (a
  request id, a session, a run, a created object) are recorded beside it.

The tags are not a confidence score. They say who made the claim — the
platform's writers, the team's memory, or the platform itself — and only the
last is evidence about the instance
([claimant-does-not-adjudicate](../../../../_laws.md#claimant-does-not-adjudicate):
the documentation is the vendor's claim about its product, and the live run
adjudicates it).

## Procedure

1. **Tag at the point of use.** The tag sits on the sentence or table row
   that relies on the claim, not in a separate appendix nobody re-reads. A
   settings table carries a per-row tag; a section heading may carry a
   default tag (*checked on the documentation on <date> unless marked*).
2. **Keep the unverified list explicit.** Every claim still marked
   unverified is also listed under one heading — what must be confirmed on
   the first live run — so the run has a checklist and the document has an
   honest count of what it does not know
   ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value):
   an unchecked behaviour is not rendered as a fact).
3. **Replace, do not annotate, when a run settles a claim.** A verified
   observation replaces the tagged claim it settles, with its evidence. A
   contradicted claim moves to an *adaptations the live platform required*
   section that quotes the platform's actual response verbatim — the
   rejection message, the event that did not fire — and states the design
   change it forced.
4. **Record partial verification precisely.** A run that exercised two of
   four trigger paths verifies two; the other two stay unverified by name.
   *It works* on one path is not evidence for its siblings.
5. **Record what an outside reader can and cannot see.** When the evidence
   is meant for reviewers without access — signed-out visitors, auditors —
   note which artefacts are public and which are not, verified the same
   way, because a claim nobody else can check is only as good as the
   ledger's word.

## Decision rules

- **A design decision on an unverified claim is allowed and must be
  reversible.** Where the claim fails, the ledger names the decision that
  depends on it, so the adaptation is a known edit rather than a search.
- **When documentation and the live platform disagree, the live platform
  wins for this instance** and the documentation's statement is kept,
  quoted, as the reason the disagreement surprised anyone.
- **Dates are part of the claim.** A sourced claim without the date it was
  checked cannot be re-checked against the page as it changes.

## When not to use

Behaviour of software the team runs and can read is established by reading or
testing it, not by ledger. The ledger is for platforms whose source and
configuration are not available and whose only evidence is their documentation
and their responses.
