---
layer: technique
type: technique
subject: public-work-evidence-bounding
technique: verify-identity-before-crediting-work
status: forged
laws: [uncertainty-resolves-toward-the-candidate, say-only-what-the-record-holds, a-verdict-is-bound-to-what-it-judged]
shared_with: []
use_when: [resolving a candidate-supplied profile link, deciding whether a public account belongs to an applicant, handling an identifier that fails to resolve at screening]
---

# Verify identity before crediting work

Before any public output is read as evidence about a person, the system must
establish that the source *is* that person: a human being, that human being,
and one whose work the account actually represents. Verification precedes
crediting, always, because everything downstream is a claim about whoever the
account turns out to belong to.

The naive implementation resolves an identifier, gets a payload back, and
proceeds. It has established exactly one thing — that the identifier exists.

## The three checks, in order

1. **Does it resolve at all?** A dead, renamed, deleted or mistyped identifier
   is an unresolved state, not an empty one. See
   [absent-signal-versus-unavailable-source](./absent-signal-versus-unavailable-source.md).
2. **Is it a person?** Public platforms host organisations, teams, labs,
   studios, bots, mirrors and shared service accounts alongside individuals,
   and they usually say which — an account type, an entity kind, a profile
   shape. Read it and branch on it. This check is cheap, and skipping it is
   the most expensive mistake in the subject.
3. **Is it *this* person?** Corroborate the account against what the candidate
   themselves supplied and against the entity's own self-description: the
   display name, a linked personal site that also appears on their document,
   an email domain, an employer, a location, an explicit statement of
   ownership. One weak match is a hypothesis; the candidate having supplied
   the link *themselves* is the strongest ordinary signal available, and it
   should be treated as such.

## The organisation case is a wrong-hire failure

When the link resolves to an organisation, the failure is not a validation
nicety missed. Crediting a company's, agency's or lab's entire public
portfolio to one applicant produces a review that is glowing, specific,
detailed, plausible — and about the work of dozens of people. It is more
dangerous than a blank result by an order of magnitude, because a blank result
gets investigated and a glowing one gets acted on.

So the organisation branch is a **hard stop with its own named state**, not a
soft warning appended to a review that still runs. Nothing is credited, no
capability read is produced, and the artifact says plainly that the link
identifies an organisation rather than an individual — which is a fact about
the link, phrased so it reads as a correctable input problem rather than as an
adverse finding about the candidate.

Where the platform makes it possible, the useful recovery is to ask which
contributions within that organisation are theirs, rather than to discard the
evidence entirely. Recovery is a question for the candidate, not an inference
for the system.

## An identifier accepted once must not be rejected later

The quiet, frequent, invisible failure: a candidate supplies an identifier at
application time and a lenient parser accepts it; weeks later a stricter
parser in the screening path rejects the same string — a trailing slash, a
full address where a bare name was expected, mixed case, a query fragment, a
platform's newer URL shape. The candidate is never told. Their strongest
evidence simply stops existing, and the record shows an absence that the
system itself created.

The rule is unification: **one normalisation routine, shared by every entry
point, and its accepting set never shrinks below what was accepted at intake.**
Store the normalised form alongside the raw input the candidate typed, so a
later change of rules can be re-applied to the original rather than to a lossy
derivative. When a stored identifier stops resolving under a new rule, that is
an operations incident to be fixed, never a candidate-facing absence
([a-candidates-process-never-stalls-on-your-constraints](../../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)
is the neighbouring principle; here the cost lands as lost evidence rather
than a blocked action).

## Decision rules

- **When the entity is not a person, credit nothing and name the state.** No
  partial read, no "organisation-level signals" quietly folded into an
  individual assessment.
- **When identity is uncertain, do not credit and do not penalise.** The
  unresolved state is neutral: the assessment proceeds on the other evidence
  exactly as it would have if no link had been supplied
  ([uncertainty-resolves-toward-the-candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate)).
- **When the candidate supplied the link themselves, treat ownership as
  asserted and check only entity kind and plausibility.** Demanding
  cryptographic proof of ownership for a link someone volunteered is ceremony
  that costs candidates and catches nobody.
- **When the system discovered the profile rather than being given it, the bar
  is higher and the default is not to use it.** Name collisions are common,
  and an unsolicited match is a hypothesis about a stranger. If it is used at
  all, it is used as a prompt to ask the candidate, not as evidence.
- **When verification succeeds, bind the verdict to the identifier and the
  moment.** Accounts are renamed, transferred and repurposed; a review is
  bound to what it judged
  ([a-verdict-is-bound-to-what-it-judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged)),
  so record which identifier, resolved to which entity, when.
- **When two candidates resolve to the same account, stop and escalate to a
  human.** That is either a data-entry error or something the system must not
  adjudicate alone.

## Anti-patterns

- **Name matching as verification.** Common names collide constantly, and the
  collision rate is not uniform across naming cultures — so a name-match rule
  fails unevenly across candidates, which makes it a fairness problem as well
  as an accuracy one.
- **Silent fallback to a search.** An identifier that fails to resolve, quietly
  replaced by "the best match we found", credits a stranger's work with no
  trace of the substitution.
- **Verification after the read.** Fetching, analysing and *then* checking the
  entity type means the expensive, persuasive artifact already exists, and
  somebody will use it.
- **Treating a verified identity as a verified attribution.** Establishing
  that the account is theirs says nothing about who wrote what inside it — that
  is [organisation-output-is-not-one-persons-work](./organisation-output-is-not-one-persons-work.md).

## When not to use it

- **When no public source is being read at all.** This technique gates the
  reading of public work; it is not a general identity-proofing standard for
  the candidate record, which is a different subject with different stakes.
- **When a human recruiter is browsing a link manually.** They are performing
  the check themselves, in their head; forcing them through a verification
  workflow adds friction without adding a check. What they still owe is
  writing down which profile they looked at
  ([say-only-what-the-record-holds](../../../_laws.md#say-only-what-the-record-holds)).
