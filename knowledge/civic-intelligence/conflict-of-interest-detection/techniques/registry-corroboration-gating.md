---
layer: technique
type: technique
subject: conflict-of-interest-detection
technique: registry-corroboration-gating
status: forged
laws: [lead-not-finding, provenance-or-nothing]
shared_with: []
use_when:
  - deciding which ties may enter an accusatory join
  - ordering a human review queue over money ties
  - a large-money tie rests only on a name match or media mention
---

# Registry-corroboration gating

Ties between officials and entities arrive from weak sources: name matches
across datasets, declarations the official wrote, media mentions, scraped
affiliation lists. Each is a hypothesis about the world. The authoritative
version of that hypothesis lives in the primary registers — the commercial
register that records who owns and directs an entity, with role types and
validity dates. Corroboration gating is the discipline of checking every tie
against that authority and letting the *outcome of the check*, not the size
of the money, decide what the tie is allowed to do next.

## The states, and what each is allowed to do

A tie's corroboration is a first-class field with a small closed vocabulary,
minimally:

- **Registry-confirmed** — the register records the person in the role at
  the entity. The tie is a fact about the register (still not a conflict —
  per [lead-not-finding](../../_laws.md#lead-not-finding) nothing in this
  technique upgrades a lead to a finding; it only grades leads).
- **Unconfirmed** — the check has not run, or ran and found nothing.
  Finding nothing is meaningful but not damning: registers lag, roles
  predate digitization, and identity matching fails. The tie stays a
  hypothesis.
- **Conflicting** — the register contradicts the claimed role. The tie is a
  data-quality lead, not a conflict lead.

Only registry-confirmed ties may enter the accusatory joins — the
vote-versus-interest join, the published money attributions, anything whose
output sits next to a person's name. Unconfirmed ties live on internal
review surfaces where the pending work is to confirm them. This is
[provenance-or-nothing](../../_laws.md#provenance-or-nothing) applied to
relationships instead of numbers: a tie that cannot cite the register does
not get to generate candidates, and a confirmed tie carries the permanent
register address that confirmed it, so any reader can re-run the check.

## Trust gates before money gates — the ordering rule

The counterintuitive core of the technique is a strict ordering claim:
**corroboration gates trust before money gates urgency.** An unconfirmed tie
reaching a hundred times more money than a confirmed one is still the worse
lead, because it is not yet known to be about anything — its enormous
number is an enormous *if*. Concretely, the review queue is ordered by trust
tier first and money second:

1. Registry-confirmed owner-operators,
2. registry-confirmed managers,
3. registry-confirmed stewards,
4. everything else — unconfirmed, conflicting, or check not yet run —
   regardless of money.

Within a tier, money descending. The tier term must *dominate*: implemented
as a sort key, the tier component is scaled beyond any reachable money value
so tiers can never interleave. The alternative — money as one weighted input
among several, corroboration as another — reliably floats some huge
unconfirmed tie to the top, and the queue's most prominent item becomes its
least verified claim. That is exactly the failure the ordering exists to
make impossible, not merely unlikely.

Note what the queue ordering is *not*: it is not the significance score.
"Which lead is the biggest story if true" and "in what order should a human
clear the queue" are different questions with different formulas; this
technique owns the second.

## Procedure

1. **Resolve identity first.** Corroboration presupposes that the person and
   the entity are correctly identified in the register — stable registration
   numbers for entities, and a deliberate person-matching step (name plus
   birth-date or address where available) with its own uncertainty states.
   A confident check against the wrong person is worse than no check.
2. **Check role, not just presence.** The register confirming *some*
   relationship is not confirmation of *the claimed* relationship. Match
   the role type; feed the register's role text back into tie
   classification, which it states more precisely than any scraped source.
3. **Capture the validity period.** The register's from/to dates for the
   role are the temporal spine of every downstream join. A confirmation
   without a period start is incomplete — treat it as failing the gate for
   time-conditioned joins, and count how often that happens.
4. **Record the check itself** — when it ran, against which register
   snapshot, with what result — so "unconfirmed" is distinguishable from
   "never checked", and so a register update can trigger re-checks.

## When not to use it

Gating is for accusatory outputs. Applying the confirmed-only filter to
*exploratory* surfaces — coverage dashboards, data-quality worklists, the
confirmation queue itself — would hide precisely the ties that need work.
The gate sits at the exits toward publication and candidate generation, not
at ingestion. And do not treat the register as infallible ground truth to
*overwrite* other sources: where register and declaration disagree, that
disagreement is preserved and surfaced as its own lead — registers have
errors, lags and capture risks of their own, and the method's honesty
depends on disclosing conflicts between authorities rather than silently
picking a winner.
