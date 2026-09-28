---
layer: technique
type: technique
subject: compensation-banding-and-market-honesty
technique: price-the-role-not-the-person
status: forged
laws: [a-verdict-is-bound-to-what-it-judged, say-only-what-the-record-holds, inference-must-look-like-inference]
shared_with: []
use_when: [a language model is asked for a pay figure, a pricing prompt is assembled from a record that also describes a candidate, a model-derived band is compared across candidates or offers]
---

# Price the role, not the person

A market band is a claim about a **role in a market**. When a language model
produces the figure, the question it answers is whatever its prompt contained,
and a prompt assembled from a record that also describes a person answers a
different question from the one the band claims to answer.

This is measured, not hypothetical. Audits of general-purpose models asking for
salary figures and negotiation advice for the same role, varying only who is
asking, found the figures move with the asker's name, gender, ethnicity and
migration status. Advice was lower for names associated with women and Black
candidates, and lower for refugees than for expatriates at the same job (Haim,
Salinas and Nyarko, arXiv 2402.14875; Sorokovikova et al., arXiv 2506.10491,
five model families). Two further variables moved the figure as much or more:
whether the prompt spoke as the employer or the employee, and which model
version answered (Geiger et al., arXiv 2409.15567). The same audits found one
reliable counterweight: numeric, decision-relevant anchors in the prompt pulled
the output toward them and away from the demographic drift.

A figure that moves with the person is not a market band with noise. It is a
different quantity wearing the band's label — the price the model associates
with this person, stored in a field that says "comparable roles in this
market" ([a verdict is bound to what it
judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged)).

## The rule: the prompt's inputs are an allow-list of role fields

The pricing prompt is built from an explicit, closed set of role fields — title
or family, seniority anchor, market or region, currency and period from the
market record, and the scope facts that define the role. Everything else is
excluded by construction, not by care:

- **No candidate identity, direct or proxied.** Name, gender, age, nationality,
  origin and photograph are the direct form. The proxies are the ones that leak
  in practice: a CV excerpt, a school, a graduation year, a current or previous
  salary, a location of residence where it differs from the role's location.
  Salary history is a proxy twice over — it carries every past pay gap into the
  new figure, and asking for it is barred outright in several jurisdictions.
- **An allow-list, not a deny-list.** A prompt builder that copies "the record"
  and strips known identity keys will copy the next identity key somebody adds.
  One that reads six named role fields cannot.
- **Fix the voice.** Phrase the request the same way every time, as a
  compensation analyst pricing a role for a market, never as a candidate asking
  what to request or an employer asking what it can offer. The voice shifts the
  figure more than most demographic variables do.
- **Pin the model version on the result.** A band produced by one model version
  is not comparable to one produced by the next without a re-run on fixed
  inputs; the version travels with the figure as part of its basis
  ([say only what the record holds](../../../_laws.md#say-only-what-the-record-holds)).
- **Supply the anchors you hold.** Where a calibrated cell exists, pass its
  figures into the prompt as the reference the model adjusts from. The anchor is
  both the best available evidence and the documented counterweight to drift.

## Pin it with a test that names the fields

The defect this rule prevents is introduced by a helpful refactor — a caller
that starts passing the whole candidate or application record because it is
convenient — and nothing about the output looks wrong afterwards. The test worth
writing feeds the prompt builder a record carrying sentinel identity values
alongside the role fields, captures the assembled prompt, and asserts that no
sentinel appears in it. A test of the band's value cannot catch this; a test of
the prompt's inputs can.

## Where the person legitimately enters

The candidate is not irrelevant to pay. They enter **after** the band, in the
human-owned fields — the approved range, the offer, the negotiation — where a
named person decides where in the band this candidate sits and records why
([every decision names its actor](../../../_laws.md#every-decision-names-its-actor)).
The band says what the role pays in this market; the offer says what this
organisation offers this person. Folding the second into the first launders an
individual decision into a market statistic.

## Decision rules

- When building a pricing prompt, **read named role fields only**; never pass a
  candidate, application or profile record through.
- When a caller needs a figure for a specific candidate, **price the role and
  place the candidate in the band in a separate, owned step**.
- When the prompt has room for a calibrated anchor, **include it**; when none
  exists, the model's figure is an inference and is labelled as one
  ([inference must look like inference](../../../_laws.md#inference-must-look-like-inference)).
- When the model version changes, **re-run a fixed set of roles** and compare
  before the new figures replace the old ones.
- When auditing, **vary identity on fixed roles** and measure the spread; a
  non-zero spread means identity reached the model somewhere.

## When not to use this

- **Candidate-facing negotiation coaching**, where the person is the subject of
  the advice. The rule does not stop the advice depending on the person's own
  stated facts; it does mean the model's demographic drift lands on that person,
  so the same allow-list discipline and a fixed anchor apply with more force,
  not less.
- **A deterministic band read from a benchmark table.** No model is involved and
  nothing can drift; the provenance rules in the neighbouring techniques govern
  it instead.
