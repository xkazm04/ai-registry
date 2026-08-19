---
layer: golden-path
type: golden-path
subject: conflict-of-interest-detection
status: forged
use_when:
  - screening officials' private economic interests against their public power
  - designing red-flag joins between decisions and declared or registered interests
  - ranking conflict-of-interest leads for a human review queue
  - deciding whether an automated match may be published as a conflict
techniques:
  - tie-class-taxonomy
  - registry-corroboration-gating
  - temporal-alignment-of-money-and-role
  - statute-relevance-mapping
  - vote-versus-interest-join
  - triage-signal-scoring
---

# Conflict-of-interest detection

A conflict of interest exists where a public official's private economic
interest meets their public power: they hold a stake in something their
decisions can enrich. Detection is the discipline of finding those meeting
points at population scale — across every official, every registered role,
every flow of public money — and ranking what surfaces so that finite human
attention lands on the leads most worth verifying. It is emphatically *not*
the discipline of deciding that a conflict occurred. That distinction is the
subject's spine, and everything else hangs from it.

The naive reading is seductive because its first version works in an
afternoon: match officials' names against a company register, match those
companies against public contracts, flag every hit. The output looks like a
scandal list. It is actually three superimposed errors — false identity
matches, ties that carry no conflict structure, and coincidences dressed as
causation — sorted by the size of the number rather than the strength of the
evidence, which means the biggest headline is the least verified claim. A
system built this way manufactures accusations at machine speed against
real, named people. The mature discipline inverts every one of those
defaults, and this document names the inversions.

## A coincidence is a fact; a conflict is a verdict

The machinery in this subject computes *coincidences*: this person held this
role at this firm while this firm received this money, and voted on a rule
governing that money's channel, on a day inside the role's registered
period. Every clause of that sentence is a checkable fact, and deterministic
code can and must establish all of them. What no join can establish is the
*substantive* connection — that the interest moved the decision, or even
that the official knew the interest was in play. That final step is a human
judgment, made lead by lead, and until it is made the system's output is a
**candidate**, rendered only on review surfaces, framed as requiring
verification, never asserted in public-facing copy. This is the
[lead-not-finding](../_laws.md#lead-not-finding) law doing its heaviest
lifting anywhere in the domain: the whole pipeline is an engine for
producing well-evidenced questions, not answers.

The corollary cuts the other way too: because the machine's facts *are*
facts, they are computed by declared, versioned, reviewable rules — never by
a model's judgment call. A candidate exists because a deterministic join
derived it, or it does not exist. Anything softer contaminates the one thing
the pipeline can honestly claim: that its coincidences are real.

## Not every tie is the same conflict

The second inversion is structural: "official linked to entity" is not one
relationship, and treating it as one poisons every downstream number. An
official who owns and operates a private firm that sells to the state is the
canonical conflict shape — the money is personal enrichment in potential. A
board seat is influence without ownership. A supervisory seat on a public or
nonprofit body is oversight — the body's spending is its own public mandate,
and counting it as the official's interest is a false accusation by
arithmetic. A small closed taxonomy of tie classes, applied at ingestion and
carried through every join, score and rendering, is what keeps these apart
([tie-class-taxonomy](techniques/tie-class-taxonomy.md)). Skip it and the
oversight seats — which in measured corpora dominate raw money totals —
drown the real conflicts under institutional noise.

## Trust before urgency

Every tie has two independent qualities that the naive pipeline conflates:
how much money it could reach, and whether it is *real*. A name-matched tie
that no authoritative register has confirmed is a hypothesis; a
register-confirmed role with dates is a fact. The ordering rule that falls
out — and it is the least intuitive rule in the subject — is that
**corroboration gates trust before money gates urgency**: an unconfirmed
tie reaching enormous money must not outrank a confirmed tie reaching modest
money in the review queue, because the first is not yet known to be about
anything. Confirmation against the primary register is therefore a hard
entry gate for the accusatory joins and the top of the review ordering
([registry-corroboration-gating](techniques/registry-corroboration-gating.md)),
not one weighted input among several. Money decides order *within* a trust
tier; it never buys a tie out of one.

## The conflict lives at an intersection, and every axis is a gate

A defensible candidate sits at the intersection of four independently
checkable conditions, and the pipeline expresses each as an explicit gate
with its own counted rejections:

1. **The tie is real** — human-reviewed and register-confirmed, with a
   registered role period ([registry-corroboration-gating](techniques/registry-corroboration-gating.md)).
2. **The interest and the power overlap in time** — the decision falls
   inside the role's registered window, with boundary rules declared, and
   money flows are weighted by how much of them lands inside that window
   ([temporal-alignment-of-money-and-role](techniques/temporal-alignment-of-money-and-role.md)).
3. **The decision governs the interest's channel** — via a fixed, published
   table mapping each channel of public money (contracts, subsidies,
   political donations) to the statutes that regulate it, with no inference
   filling the gaps ([statute-relevance-mapping](techniques/statute-relevance-mapping.md)).
4. **The official actually acted** — a positional choice on the matter, not
   abstention or absence, resolved through a deterministic linkage of the
   decision record to the legal text it touched
   ([vote-versus-interest-join](techniques/vote-versus-interest-join.md)).

The conjunction is deliberately narrow. A narrow, defensible core that
misses subtle conflicts is the correct trade against a broad net that
manufactures them: every gate the pipeline relaxes converts a class of
coincidences into published insinuations. Widening happens by adding
declared rules, one at a time, each versioned — never by loosening a gate
quietly.

## Ranking is two different questions

What surfaces still exceeds review capacity, so ranking is part of the
method — and there are two rankings because there are two questions. *How
significant is this lead?* is answered by a deterministic signal score:
log-scaled money (so an order of magnitude, not a linear amount, moves the
rank), weighted by tie class, lifted by compounding patterns — the same
entity appearing on multiple money channels at once, clusters of
transactions sitting just under regulatory thresholds, alignment of money
with the role window. *In what order should a human clear the queue?* is
answered by trust tiers first, money second, per the rule above. A third
ordering exists for pattern-derived watchlists: by **evidence completeness**
— which lead gives the reviewer the most to work with — because a triage
surface's job is throughput of verdicts, not drama. Conflating these three
orderings is a common and costly design error
([triage-signal-scoring](techniques/triage-signal-scoring.md)).

## Whole population or nothing

Detection covers every official under the method's jurisdiction or it is
not detection — it is targeting. A screen run only against the officials
someone already suspects converts the pipeline into a laundering device for
prior animus, per [non-partisan-symmetry](../_laws.md#non-partisan-symmetry).
Symmetry also governs the nulls: an official with zero candidates is a
result the surface states, and a layer of data the run never consulted is
reported as *not measured*, never as a zero that reads like exoneration.
The method itself — every gate, table, weight and version — is published
beside the results, so a reader can dispute the method rather than suspect
the data.

## Failure modes this standard exists to prevent

- **Accusation by adjacency** — publishing a temporal or registry
  coincidence in the voice of a finding; the defining sin of the naive
  pipeline.
- **The unconfirmed headline** — ranking by money before trust, so the
  biggest claim in the queue is the least verified one.
- **Oversight counted as enrichment** — no tie taxonomy, so supervisory
  seats on public bodies dominate the totals and defame by arithmetic.
- **The elastic relevance net** — inferring decision-to-interest relevance
  case by case instead of from a fixed published table, so the net widens
  exactly when a story is tempting.
- **Ambiguity rescued instead of counted** — forcing an uncertain linkage
  (a decision record that could map to two legal texts) to a best guess
  rather than excluding and counting it.
- **The severity-sorted review queue** — reviewers fed the scariest leads
  first rather than the most trustworthy or most evidenced, burning
  verification capacity on ghosts.
- **The shortlist** — screening a subset and presenting the output as
  systematic.

## The techniques

- [tie-class-taxonomy](techniques/tie-class-taxonomy.md) — the small closed
  vocabulary of official-to-entity relationships, and why ownership,
  management and stewardship must never share a bucket.
- [registry-corroboration-gating](techniques/registry-corroboration-gating.md) —
  confirming ties against authoritative registers; trust tiers before money.
- [temporal-alignment-of-money-and-role](techniques/temporal-alignment-of-money-and-role.md) —
  overlap of the money window with the role window; boundary rules;
  alignment as both gate and weight.
- [statute-relevance-mapping](techniques/statute-relevance-mapping.md) — the
  fixed table from money channels to governing statutes; the anti-inference
  stance.
- [vote-versus-interest-join](techniques/vote-versus-interest-join.md) — the
  multi-clause deterministic join that produces candidates, and the coverage
  ledger of everything it excluded.
- [triage-signal-scoring](techniques/triage-signal-scoring.md) — the three
  orderings (significance, review order, evidence completeness) and the
  deterministic formulas behind them.
