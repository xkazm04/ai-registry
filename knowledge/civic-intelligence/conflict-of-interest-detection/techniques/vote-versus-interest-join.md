---
layer: technique
type: technique
subject: conflict-of-interest-detection
technique: vote-versus-interest-join
status: forged
laws: [lead-not-finding, missing-is-not-zero, every-cap-ships-its-population]
shared_with: []
use_when:
  - joining roll-call votes to officials' registered economic interests
  - designing any decision-versus-interest candidate generator
  - a join's exclusions need to be reported honestly
---

# Vote-versus-interest join

This is the assembly point of the subject: the deterministic join that takes
verified ties, decision records, and the statute-relevance table, and emits
conflict-of-interest *candidates*. Its character matters more than its
cleverness — every clause is a declared, versioned, unit-tested rule; every
exclusion is counted; and the output is framed, everywhere it appears, as
requiring human verification. The join computes coincidence; per
[lead-not-finding](../../_laws.md#lead-not-finding), coincidence is all it
may claim.

## The clause structure

A candidate exists only when every clause holds. A canonical legislative
form has six:

1. **The tie qualifies** — human-reviewed, register-confirmed, with a
   registered role-period start (the corroboration gate). A missing review
   state is pending, never verified: absence of a verdict is not a verdict.
2. **The decision links deterministically to a legal text.** A vote must
   resolve to the bill it decided — primarily through structured agenda
   data, with a declared, narrow textual fallback (a bill-number pattern in
   the vote title) only where structure is absent. An ambiguous linkage — an
   agenda item carrying several bills at once — is **excluded and counted,
   never rescued by the fallback**: an uncertain key must not manufacture a
   candidate. Measure the fallback's actual yield on live data before
   trusting it; a rule that fires zero times is coverage theater.
3. **The text is relevant** — it amends at least one statute in the tie's
   channel rows from the fixed relevance table. No inference beyond the
   table.
4. **The times align** — the vote day falls inside the role's registered
   window, both boundary days inclusive, per the declared alignment rules.
5. **The official took a position.** Only an explicit yes or no forms a
   candidate. Abstention, absence and not-voting are recorded facts about
   participation, but "was absent while a relevant bill passed" is a
   different, weaker insinuation that must not ride in under the same
   framing — a positional vote is the only act that cleanly asserts the
   official exercised the power.
6. **One candidate per tie-vote pair.** Multiple matched statutes aggregate
   into the candidate; they do not multiply rows. The candidate count must
   mean "distinct decision-interest meetings", or every downstream number
   inflates.

Each candidate carries a stable content-derived identifier (so re-derivation
is idempotent and cross-references survive), the full evidence bundle —
person, entity, role, class, window, vote, choice, matched statutes with
their whys — and the join's rule version.

## The coverage ledger is half the output

The join's second product, of equal rank with the candidates, is the
account of everything it did *not* join and why: ties that failed the
review gate, confirmed ties missing a period, votes it could not link,
linkages dropped as ambiguous, voided votes, bills touching no relevant
statute. Two disciplines govern the ledger:

- **Unconsulted is null, not zero.** When a run skips reading an entire
  layer (because an upstream gate already emptied the join), the counts
  over that layer report as *not consulted* rather than zero — "the
  chamber held no votes" is a claim this run never checked, per
  [missing-is-not-zero](../../_laws.md#missing-is-not-zero). Only the
  layers actually read report numbers.
- **Every filter ships its population.** Each exclusion count sits next to
  the total it was drawn from, per
  [every-cap-ships-its-population](../../_laws.md#every-cap-ships-its-population),
  so a reader can see that, say, most votes never linked to a bill — which
  reframes "few candidates" from "few conflicts" to "limited linkage
  coverage", a completely different and more honest headline.

The ledger is also the join's own quality instrument: a clause that
excludes far more than expected is either a data gap to fix or a rule
mis-drawn, and without per-clause counts the difference is invisible.

## Determinism end to end

The join runs over typed inputs with no model in the loop, no database
access inside the logic (pure function over rows — which is what makes
every clause unit-testable in isolation), a deterministic tiebreak for
every data anomaly (duplicate bill numbers, duplicate ballots resolve by a
declared stable rule, so a re-ingest cannot silently reorder results), and
a total, stable output ordering with no unstable remainder. Derive-on-read
is the preferred posture: candidates are recomputed from the ledger on
every read rather than persisted, so there is no stored candidate table to
drift from its inputs, and a rule change propagates everywhere at once
under its new version.

## When not to use it

The join answers one narrow question: did a register-confirmed interest
and a positional vote on channel-governing law meet in time? It is not a
general influence detector — committee work, amendments authored, lobbying
access and informal pressure are all invisible to it, and presenting its
low candidate count as "few conflicts found" overstates its reach. It is
also the wrong shape where the decision and the interest meet directly
(an award to a tied firm needs no legislative join). And do not run it
over unverified ties "just to see" and let the output escape the internal
surface: a candidate generated from a hypothesis is an insinuation with
two unverified steps, which is two too many.
