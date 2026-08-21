---
layer: golden-path
type: golden-path
subject: public-work-evidence-bounding
status: forged
use_when: [reading a candidate's public repository or portfolio, designing an automated review of public output, deciding what a public profile proves about a person, writing the scope statement a recruiter reads]
techniques:
  - declare-the-evidence-budget-in-the-artifact
  - verify-identity-before-crediting-work
  - organisation-output-is-not-one-persons-work
  - absent-signal-versus-unavailable-source
  - corroborate-a-claim-never-replace-it
  - public-work-is-optional-evidence-not-a-requirement
---

# Public work evidence bounding

A candidate hands you a link. Behind it sits a code repository, a portfolio, a
publication list, a public profile — output that exists in the world, that
nobody wrote for your hiring process, and that is therefore the most tempting
evidence in the whole pipeline. It looks like proof. It is not a document
about work; it *is* work.

That temptation is the problem this subject governs. Public work is real
evidence and the easiest evidence to over-read, because three separate things
must be true before a single sentence about it is safe, and all three are
usually assumed rather than established:

1. **Identity** — the account, profile or byline belongs to the applicant.
2. **Attribution** — the specific output you are about to credit was produced
   by them, rather than by the organisation, the team, the fork's upstream,
   the co-author, or a generator.
3. **Depth** — you looked at as much as your sentence implies, and no more.

Bounding is the discipline of establishing all three explicitly and then
speaking strictly inside them. A system that skips any one of them still
produces a fluent, confident, useful-sounding paragraph — which is why the
failure survives review. Nothing about a wrong read of public work looks
wrong.

## Reading labels is not reading work

The dominant practical constraint is that automated review of public work
almost never inspects the work. It inspects *labels about* the work: names,
titles, counts, dates, stated languages, topic tags, short descriptions,
introductory text, and the subject lines of changes. That is a legitimate and
often sufficient evidence base — it answers "what does this person work on,
how often, in what ecosystem, for how long" quite well.

What it cannot answer is anything about quality, architecture, correctness,
craft, or difficulty. Those live in the bodies of the work, and the bodies were
not read. The gap between "sustained public activity in this ecosystem"
(supported) and "writes clean, well-structured code" (supported by nothing in
the budget) is the most common over-claim in the domain, and a fluent model
crosses it in the first sentence unless the crossing is forbidden
structurally.

So the practitioner's rule is blunt: **an evidence budget that excludes the
substance of the work forbids every claim about the substance of the work** —
not softens it, not hedges it, forbids it. And because the reader cannot see
the budget, the budget travels *with the finding*, in the artifact, in words
the reader can price ([declare-the-evidence-budget-in-the-artifact](./techniques/declare-the-evidence-budget-in-the-artifact.md)).

## Identity is a gate, not a garnish

Public work is the one evidence class where a matching-looking string is
enough to credit an entire body of output to a stranger. A profile name that
resembles the applicant's, a portfolio domain that appears on their document,
a byline shared with three other researchers — each of these routinely becomes
"their work" without anyone deciding that it is.

Two distinct failure shapes matter. **The wrong person**: names collide,
identifiers are re-registered, someone links a profile that is not theirs — and
a system that credits it has manufactured evidence about a stranger and
attached it to a hiring decision. **The wrong kind of entity**: the link
resolves to an organisation, team, lab or studio rather than a person, and
crediting its portfolio to one applicant is not a validation nicety missed but
a wrong-hire failure with a plausible paper trail, because the resulting review
is glowing, specific, and about dozens of people's work.

Identity verification therefore runs *before* any crediting, and its
unresolved state is a distinct state — not a quiet pass
([verify-identity-before-crediting-work](./techniques/verify-identity-before-crediting-work.md)).
The corollary that teams get wrong: verification must be *stable across the
pipeline*. An identifier the system accepted when the candidate submitted it
must not be rejected by a stricter parser at screening. A candidate whose link
worked on Monday and is "invalid" on Thursday has been failed by your string
handling, and they will never know it happened.

## Shared output has shared authorship

Even with identity settled, attribution is not. Most public work of any size
is collective. A repository under a personal account may be a fork whose
substance is upstream. A portfolio piece may be one contributor's slice of an
agency engagement. A paper's third author may have supplied the dataset. A
profile aggregates everything the person is *associated with*, and association
is not authorship.

Public work supports claims about *participation, sustained engagement, domain
exposure and ecosystem fluency* far more safely than claims about *individual
capability*. Where the record distinguishes personal contribution from
collective output, split it and say which you are reading; where it does not,
say that too and downgrade the claim to what participation alone supports
([organisation-output-is-not-one-persons-work](./techniques/organisation-output-is-not-one-persons-work.md)).

## An absence you observed and an absence you could not observe

Public sources are rate-limited, throttled, private, deleted, renamed,
migrated and occasionally just down. This produces the most dangerous quiet
failure in the subject: a fetch that returned nothing, rendering as a finding
that nothing is there.

"No evidence of this skill in their public work" is a claim about a person.
"Could not read their public work" is a claim about your infrastructure. They
must never share a rendering, a field, or a downstream treatment. A throttled
source that silently becomes an empty result set produces an adverse read
manufactured by your quota
([absent-signal-versus-unavailable-source](./techniques/absent-signal-versus-unavailable-source.md)).

The same distinction has a second, subtler edge that catches mature teams:
when the *question* is drawn from a closed checklist, a negative finding is
scoped to that checklist and to nothing else. "No gaps found" against a fixed
list of ten capabilities means "no gaps among these ten" — and if it renders
as an unqualified "none", the artifact has claimed coverage of a space it
never examined. A bounded question deserves the same honesty as a bounded
input.

## Public work corroborates; it does not substitute

The strongest use of public work is confirmatory. A candidate claims sustained
work in an area; their public output shows sustained activity in that area;
the claim is now corroborated and its standing rises. That is the whole
mechanism, and it is valuable precisely because it is cheap and hard to fake
in volume.

The inversion — public work as the *primary* record, the candidate's own
account as secondary — is where systems go wrong. Public output is a heavily
filtered sample of a career: it omits everything done under confidentiality,
everything under a client's name, everything before the person had a reason to
publish, and everything they chose not to show. A read that treats what is
visible as what exists concludes that a senior engineer of fifteen years is
less accomplished than a student with free evenings.

So the artifact carries three buckets, never one: claims the public work
**corroborates**, claims it **does not reach** (which is different from
contradicts), and capabilities the public work **shows that nobody asked
for** — the third being the genuine upside, because it is the only bucket in
the pipeline that can surface a strength the role definition never thought to
request ([corroborate-a-claim-never-replace-it](./techniques/corroborate-a-claim-never-replace-it.md)).

## Availability is not capability

This is the fairness argument, and it is the one the standard is least willing
to compromise on.

Public work is unevenly available for reasons that have nothing to do with how
good anyone is at their job. It correlates with free time outside working
hours, and therefore with caring responsibilities, second jobs, health, and
disposable income. It correlates with prior employer policy — whole
industries forbid publishing anything, and defence, finance, healthcare and
public-sector work routinely produce fifteen-year careers with zero public
artifacts. It correlates with career stage and with the norms of the specific
professional culture someone trained in.

Therefore:

- **Its presence may raise a claim's standing. Its absence may never lower
  one.** Absent public work returns the assessment to the other evidence
  unchanged; it does not create a gap, a penalty, or a flag.
- **A process that requires public work has narrowed its pool on something
  other than capability** — and it has narrowed it along lines that track
  free time and employer policy, which is a fairness problem wearing a
  meritocratic costume.
- **The weight public work carries is a function of the role.** For research
  roles, publications and citations may be the primary evidence the work
  actually depends on. For creative and design roles, a portfolio may be
  primary. For most others it is supporting evidence, and treating it as
  primary imports a hobbyist filter into a professional decision
  ([public-work-is-optional-evidence-not-a-requirement](./techniques/public-work-is-optional-evidence-not-a-requirement.md)).

## Where this subject ends

Three neighbours own adjacent ground, and duplicating them produces two
standards that drift apart.

- The **general grammar of refusal and honest absence** — how a model is
  instructed to decline a claim, how "could not determine" is rendered, how a
  self-reported confidence is kept from looking like a measurement — belongs
  to the inference-labelling and refusal subject. This subject applies that
  grammar to one evidence class; it does not restate it.
- **What a corroborated public-work claim is *worth*** — where an open-source
  contribution, a personal project or a portfolio piece sits on the evidence
  ladder relative to observed work and professional employment — belongs to
  the evidence-provenance-weighting subject. Bounding decides what may be
  said; the ladder decides what the saying is worth.
- **Adversarial reading of candidate-supplied documents** — stuffing, hidden
  text, implausible spans, instructions smuggled into a file — belongs to the
  authenticity-screening subject. Public work has its own adversarial surface
  (a repository whose introductory text addresses your reviewer directly is a
  prompt-injection vector, and a portfolio can be copied wholesale from
  someone else), but the technique for reading hostile input is theirs, not
  this subject's.

What remains, and remains this subject's alone, is the act of reading public
output as hiring evidence: bounding the look, binding it to a verified person,
splitting collective output from individual contribution, keeping the
unavailable distinct from the absent, and holding the whole to a supporting
role no candidate is obliged to supply.

## Failure modes this standard exists to prevent

- **Implied inspection** — a fluent review of code nobody read, indistinguishable
  in tone and format from one that read it.
- **The organisation's portfolio, one applicant's credit** — the most
  expensive single error in the subject, and the one that reads best.
- **The quota-manufactured gap** — a throttled source rendering as an absence
  of findings, producing an adverse read no human authored.
- **The scoped "none"** — a negative finding against a closed checklist
  rendered as coverage of the whole space.
- **The hobbyist filter** — a pipeline that quietly ranks free evenings above
  fifteen years of confidential work.
- **The handle that stopped working** — an identifier accepted at application
  and rejected at screening, silently costing the candidate their strongest
  evidence.
- **Substitution** — the public sample treated as the career, so everything
  unpublished is read as everything not done.

## The techniques

- [declare-the-evidence-budget-in-the-artifact](./techniques/declare-the-evidence-budget-in-the-artifact.md)
  — the look is bounded on purpose, the bound is derived from the same source
  that builds the request, and it travels with the finding to the reader.
- [verify-identity-before-crediting-work](./techniques/verify-identity-before-crediting-work.md)
  — person-versus-organisation, unresolved as a distinct state, and an
  identifier that stays valid across the whole pipeline.
- [organisation-output-is-not-one-persons-work](./techniques/organisation-output-is-not-one-persons-work.md)
  — splitting collective output from individual contribution, and downgrading
  the claim when the record cannot split it.
- [absent-signal-versus-unavailable-source](./techniques/absent-signal-versus-unavailable-source.md)
  — a claim about the person and a claim about your infrastructure never share
  a rendering; a bounded question never renders an unbounded negative.
- [corroborate-a-claim-never-replace-it](./techniques/corroborate-a-claim-never-replace-it.md)
  — the three-bucket artifact: corroborated, not reached, and the strength
  nobody asked for.
- [public-work-is-optional-evidence-not-a-requirement](./techniques/public-work-is-optional-evidence-not-a-requirement.md)
  — absence never counts against; weight is a function of what the role
  actually depends on.
