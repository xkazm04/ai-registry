---
layer: technique
type: technique
subject: public-work-evidence-bounding
technique: organisation-output-is-not-one-persons-work
status: forged
laws: [say-only-what-the-record-holds, a-claim-carries-its-sample-and-its-basis, inference-must-look-like-inference]
shared_with: []
use_when: [reading a portfolio or repository that multiple people contributed to, crediting a publication with several authors, deciding what a team artifact proves about one person]
---

# Organisation output is not one person's work

Identity establishes that an account belongs to a candidate. Attribution is a
separate question: which of the output *behind* that account was produced by
them. Almost all public work of any consequence is collective, and a system
that treats association as authorship will credit one person with a team's
decade.

The unit of attribution is the artifact, not the account. One profile
routinely mixes: work the person wrote alone; work they led with others; work
they contributed a slice to; work they merely copied to keep; work an
employer or agency produced and published under a shared name; and work a
generator produced on their instruction.

## What the record can and cannot separate

Public sources vary enormously in how much attribution they expose, and the
procedure follows what is exposed rather than assuming a shape:

- **Per-change authorship** — where each unit of work names who made it, an
  individual contribution can be isolated and read directly. This is the
  strongest case and it is rarer in an automated read than teams assume,
  because it usually costs a deeper fetch than the evidence budget allows.
- **Role or credit lines** — a portfolio piece stating "art direction: X;
  production: Y", a paper's author order, a project's contributor list. Read
  the role, credit the role, and say which role you read.
- **Derived or copied work** — a fork, a template instantiation, a
  redistributed dataset. The substance is upstream. Its presence evidences
  interest and possibly use; it evidences nothing about authorship.
- **No attribution at all** — a shared account, an agency portfolio, an
  unattributed collection. Here the honest read is *participation*, and only
  participation.

## Procedure

1. **Classify each artifact before reading it for capability**: individually
   authored, contributed to, derived, or unattributed. An unclassifiable
   artifact is unattributed, never individual.
2. **Read the aggregate as exposure, the attributed slice as capability.** A
   profile full of a domain's work supports "sustained engagement with this
   domain" for anyone associated with it. It supports "built this" for nobody
   until something says who built it.
3. **Cap what participation can conclude.** Participation supports familiarity,
   ecosystem fluency, longevity, and the fact that the person operates in the
   area professionally or seriously. It does not support seniority, ownership,
   design authority, or quality.
4. **State the split in the artifact.** The reader must be able to see which
   claims rest on attributed work and which on association
   ([a-claim-carries-its-sample-and-its-basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)).
5. **When attribution is genuinely unknown, ask rather than infer.** "Which
   parts of this were yours?" is a fair, cheap, non-adversarial interview
   question, and the answer is stronger evidence than any parse of the
   artifact. An inference about authorship, if it is made at all, is rendered
   as an inference — never in the grammar reserved for a fact
   ([inference-must-look-like-inference](../../../_laws.md#inference-must-look-like-inference)).

## Decision rules

- **When the account is an organisation, credit nothing to the individual** —
  the hard stop belongs to
  [verify-identity-before-crediting-work](./verify-identity-before-crediting-work.md),
  and this technique governs what happens once the account *is* a person's but
  its contents are not solely theirs.
- **When an artifact is derived from an upstream work, evidence the delta or
  nothing.** A fork with substantial original changes is real contributed work.
  A fork with none is a bookmark, and reading it as authorship is how a
  candidate acquires a famous project on their record.
- **When several people share a credit, do not divide the credit by headcount.**
  Fractional attribution is a fabrication with a numeric shape; say "one of
  four credited contributors" and let the reader judge.
- **When author order carries meaning in the candidate's field, use the field's
  convention and name it.** First and last author positions mean different
  things in different disciplines, and a system that flattens them either
  inflates or erases a contribution.
- **When the artifact's substance was not read, no attribution claim above
  participation is available anyway.** The two bounds compose: an unread body
  cannot tell you who wrote it.
- **When a candidate's own account of their contribution conflicts with what
  the public record suggests, the conflict is a probe, not a verdict.** Route
  it to a human and to a question, never to an adverse automated outcome.

## Anti-patterns

- **Star and follower counts as personal achievement.** Popularity attaches to
  an artifact, is heavily influenced by promotion and timing, and is one of
  the easiest signals to manufacture. It is a fact about attention, not about
  the person.
- **Aggregate activity as individual productivity.** A total contribution count
  spanning collaborative work measures how much the person was *near*, not how
  much they did — and it penalises anyone whose serious work is confidential.
- **The employer's showcase read as the applicant's résumé.** Common when a
  candidate links their team's public page because it is the only public trace
  of work they genuinely did. The right response is to ask what their part
  was, not to credit it all or to discard it all.
- **Crediting the tool.** Generated or scaffolded output published under a
  person's name evidences that they ran the generator. Where a field now
  expects this, the question is what they did *with* it — which, again, is an
  interview question rather than a parse.

## When not to use it

- **When the evidence is a work sample produced under known conditions for
  this process.** Authorship there is governed by the assessment design, not
  by attribution archaeology.
- **When the role's evidence genuinely is collective.** Some roles — a
  producer, a maintainer, a lead — are *about* the collective artifact, and
  demanding an individually authored slice measures the wrong thing. State
  what the role depends on and read for that
  ([public-work-is-optional-evidence-not-a-requirement](./public-work-is-optional-evidence-not-a-requirement.md)).
- **When the only consequence of the split would be to lower a claim you had
  no basis to raise.** If nothing in the read was going to credit the
  candidate anyway, the ceremony adds nothing; say only what the record holds
  ([say-only-what-the-record-holds](../../../_laws.md#say-only-what-the-record-holds))
  and move on.
