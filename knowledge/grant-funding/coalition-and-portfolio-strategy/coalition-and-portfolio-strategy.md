---
layer: golden-path
type: golden-path
subject: coalition-and-portfolio-strategy
status: forged
use_when: [an award floor exceeds an applicant's solo capacity, assembling or evaluating a multi-org application, deciding which matched grants to actually pursue this cycle, a funder signals preference for consortia]
techniques:
  - capacity-floor-detection
  - complementarity-scoring
  - lead-applicant-selection
  - proportional-subgrant-split
  - portfolio-balance-across-difficulty
  - requirement-profile-aggregation
---

# Coalition and portfolio strategy

Matching answers "does this grant fit this applicant?" Strategy answers two harder
questions that matching alone cannot: **what do we do with the grants that don't fit
solo**, and **which of the grants that do fit should we actually pursue with the
capacity we have?** The first question opens the coalition path — turning a hard
"too big for you" into a structured "reachable with partners." The second opens the
portfolio path — treating the application slate as an invested resource with risk,
return, and a capacity constraint, not as a to-do list sorted by deadline.

The naive reading of both is the same mistake: treating each opportunity as an
independent yes/no. A principal practitioner treats opportunities as *composable*
(organizations can combine to clear thresholds one cannot) and *rivalrous* (every
application consumes writing capacity that another application then cannot have).
Both properties are invisible at the single-grant level, which is why single-grant
matching, done perfectly, still leaves most of the value on the table.

## The coalition path: a structured "no" is a lead, not a dead end

The most valuable rejection a matching system produces is the capacity mismatch: the
grant fits the mission, the geography, the applicant type — and the minimum award
exceeds what the organization can responsibly absorb or administer. Funders read an
award floor far above an applicant's annual budget as delivery risk, and they are
usually right to. The naive system reports "ineligible" and moves on. The principal
system recognizes this as the *one* failure mode that partnership structurally cures:
combined capacity can clear a floor no member clears alone.

But a coalition is not a pile of budgets. What converts a set of organizations into a
credible consortium is a chain of judgments, each of which is a technique here:

1. **Detect that the failure is capacity-shaped** and not something partnership
   cannot fix (capacity-floor-detection). A geography fail or an applicant-type fail
   does not become a pass by adding partners; only the capacity gate converts.
2. **Choose partners for what they add, not what they share** (complementarity-
   scoring). Funders fund coalitions to buy *breadth* — a partner who duplicates the
   lead's capabilities adds budget but weakens the story. The scoring must reward
   non-overlap, under a hard sameness constraint (region, population, or system)
   that makes the coalition legible as one intervention.
3. **Name a lead who can carry the weight** (lead-applicant-selection). The lead is
   legally the recipient: fiscally accountable for every member's spending, owner of
   reporting, compliance, and audit exposure. This is an administrative-capacity
   decision, not an honorific, and it must be made before drafting begins because
   the funder underwrites the lead, not the coalition's average.
4. **Split the money by a stated rule, before anyone has leverage**
   (proportional-subgrant-split). A split proposed at assembly time, derived from a
   verifiable measure, is negotiable but never arbitrary. A split negotiated after
   the award is a partnership-destroying fight with money on the table.

The order matters. Complementarity chosen before the capacity gap is measured
produces coalitions nobody needed; a lead chosen after the split is negotiated
produces a lead without the resources to administer; a split invented after the
award produces litigation. Each step consumes the previous step's output.

One more discipline: a proposed coalition that *still* falls short of the floor is
worth surfacing with its shortfall stated — "this gets you to 80% of the floor" is
actionable intelligence (recruit one more partner, or walk away informed) — but it
must never be dressed as reachable. The reachability verdict is binary and honest.

## The portfolio path: applications are investments under a capacity budget

An organization that can write four serious applications a quarter and holds a
matched pipeline of thirty has a portfolio-construction problem whether it admits
it or not. Refusing to choose *is* a choice — usually the implicit strategy of
"whatever deadline is nearest," which systematically overweights urgency and
ignores both odds and payoff.

The portfolio discipline (portfolio-balance-across-difficulty) treats each
candidate application as a position with an expected value (award size × honest
win probability), a cost (writing and relationship effort), and a correlation
with the rest of the slate (funder family, program area, decision timing). The
balance rules that follow from this framing:

- **Mix difficulty tiers deliberately.** All reach applications is a lottery
  ticket; all safe applications caps the organization at incremental money. A
  barbell — a base of approachable awards that keep the lights on, a measured
  number of transformative reaches — outperforms a slate clustered in the middle.
- **Difficulty is per-program, not per-funder.** Award rates within one funder's
  programs routinely vary by an order of magnitude. A funder-level difficulty
  label is an average over things that should never have been averaged.
- **Published rates over thin samples are noise.** A win rate computed over a
  handful of decided outcomes must stay out of the difficulty model; a suppressed
  number is honest, a precise-looking one from three data points is a lie.
- **Coalition opportunities enter the portfolio as their own tier.** They carry
  higher coordination cost and, with some funders, materially better odds — some
  programs are documented to favor consortia heavily over solo applicants. That
  signal, where it exists, changes the expected-value math and belongs in the
  balance decision, not in a footnote.

## Requirement intelligence: the cross-application asset

Every application analyzed teaches something about its funder — what documents
they demand, what attachments recur, what they always ask for. Left per-application,
that intelligence is recomputed and discarded. Aggregated across applications into
a per-funder requirement profile (requirement-profile-aggregation), it becomes
strategy-grade: a funder whose profile shows "audited financials, always" is a
different portfolio position for an organization without audited financials than
its award rate suggests; a coalition's readiness against a funder is the *union*
of the members' gaps against that profile, evaluated before assembly rather than
discovered at submission week.

Aggregation has its own craft — free-text requirements must be normalized so
surface variants of the same demand count as one; frequency must be counted per
application, not per mention, so one verbose analysis cannot manufacture an
"always asks"; and a profile built from two analyses must present itself as the
thin evidence it is.

## Failure modes of the naive reading

- **The dead-ended mismatch** — capacity fails reported as terminal, with the
  coalition path never surfaced. The biggest opportunities are exactly the ones
  most likely to fail the solo capacity gate.
- **The redundant coalition** — partners selected by similarity because similarity
  is easy to measure. The funder reads five near-identical organizations as one
  organization with four passengers.
- **The honorary lead** — lead chosen by seniority, founding role, or who found
  the grant, then crushed by fiscal accountability they lacked the infrastructure
  to carry. The award becomes a compliance incident.
- **The deferred split** — money allocation left "to work out later." Later is
  after the award, when every member has maximum incentive to fight.
- **Deadline-driven portfolio** — the slate assembled by proximity of due dates,
  clustering effort in one difficulty band and one funder family by accident.
- **The averaged funder** — difficulty judged at funder level, masking the
  ten-fold spread between that funder's easiest and hardest programs.
- **Recomputed intelligence** — requirement knowledge extracted per application
  and thrown away, so the tenth application to a funder starts as ignorant as
  the first.

## The techniques

- [capacity-floor-detection](techniques/capacity-floor-detection.md) — recognizing
  when an award floor exceeds solo capacity, and that this fail, uniquely,
  converts to a coalition lead.
- [complementarity-scoring](techniques/complementarity-scoring.md) — ranking
  candidate partners by what they add that the applicant lacks, under a sameness
  constraint that keeps the coalition legible.
- [lead-applicant-selection](techniques/lead-applicant-selection.md) — choosing
  the member who carries fiscal and administrative accountability, on capacity
  grounds, before drafting.
- [proportional-subgrant-split](techniques/proportional-subgrant-split.md) — a
  stated, verifiable allocation rule proposed at assembly time as the anchor for
  negotiation.
- [portfolio-balance-across-difficulty](techniques/portfolio-balance-across-difficulty.md)
  — constructing the application slate across difficulty tiers under a capacity
  budget, with per-program difficulty and honest samples.
- [requirement-profile-aggregation](techniques/requirement-profile-aggregation.md)
  — normalizing and aggregating per-application requirements into per-funder
  "always asks" profiles that feed readiness and portfolio decisions.
