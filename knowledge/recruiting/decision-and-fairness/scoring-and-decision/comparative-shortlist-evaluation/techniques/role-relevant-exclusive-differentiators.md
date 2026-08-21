---
layer: technique
type: technique
subject: comparative-shortlist-evaluation
technique: role-relevant-exclusive-differentiators
status: forged
laws: [say-only-what-the-record-holds, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [explaining why one shortlisted candidate stands out, building a side-by-side strengths panel, capping a displayed list of reasons]
---

# Role-relevant exclusive differentiators

The useful output of a shortlist comparison is not the gap between two totals. It
is the answer to *what does this person bring that no one else on this list
brings, and does the role need it?* This technique defines the three conditions a
claimed differentiator must satisfy, and the ordering rule that keeps the
strongest one from being dropped by a display cap.

## Three conditions, all required

A strength qualifies as a differentiator only if it is:

1. **Role-relevant.** It appears in the role's own requirement set. A rare skill
   the role never asked for is trivia. This condition is the one most often
   skipped, because "unique" is computable from the cohort alone and "relevant"
   requires the role definition — so the cheap version ships and recruiters get
   told that a candidate uniquely knows a technology nobody will use.
2. **Actually matched.** The candidate's evidence satisfies it, as recorded, not
   as claimed. A requirement the candidate merely mentions is not a matched
   strength. This is where
   [say only what the record holds](../../../../_laws.md#say-only-what-the-record-holds)
   does its work: a differentiator is a positive assertion about a person made to
   someone deciding their future, and it must be traceable to a recorded match.
3. **Exclusive to them in this cohort.** No rival on the same shortlist matches
   it. Exclusivity is relative to the compared set and nothing else — not the
   applicant pool, not the market, not a historical average — because the reader
   is choosing among these people.

Fail any one and it is a strength, which belongs on the candidate's own
scorecard, not a differentiator, which belongs in the comparison.

Enforce all three at the point of computation even when an upstream stage already
guarantees one of them. If the matched-skills set is *supposed* to contain only
requirements, intersect it with the requirement set anyway. The guarantee is a
property of today's scorer, and the differentiator computation will outlive it —
records saved under an older shape get re-read, and a later scorer that emits
inferred or bonus skills alongside matched ones will start feeding them straight
into the comparison. Re-asserting the contract at the boundary costs one set
lookup and makes role-relevance a property of this module rather than a promise
made elsewhere.

## Matching runs on the requirement, not on the wording

Two candidates who describe the same capability in different vocabulary must not
both be credited with exclusive possession of it. Differentiator computation
therefore keys off a normalized requirement identity, not a display string:
[meaning does not live in a label](../../../../_laws.md#meaning-does-not-live-in-a-label).
The failure is quiet and symmetric — it invents exclusivity where there is none,
and it hides exclusivity that is real when the same underlying requirement is
recorded under two names.

The same discipline applies to the role side. When a role's requirements are
edited or re-labelled, previously computed differentiators are recomputed, not
re-rendered, because they were claims about the old requirement set.

## Must-haves first, and why the ordering is a correctness property

Real interfaces cap these lists — three bullets, four chips, whatever fits. If
the list is assembled in scoring order, or requirement-definition order, or
whatever order the underlying store returned, then the cap silently drops
whichever items overflow. Sooner or later the item it drops is the one
must-have-requirement the candidate uniquely satisfies, and the panel shows three
nice-to-haves instead of the actual reason to hire them.

So the ordering rule is not presentation, it is correctness: **must-have
differentiators are ordered ahead of desirable ones before any cap is applied.**
Within each tier, order by strength of evidence. The invariant to state and test
is that no cap can remove a must-have while a nice-to-have survives.

Where a cap does hide items, say how many were hidden. A truncated list that
looks complete understates the candidate.

## Procedure

1. **Gate on the cohort floor.** With fewer than two candidates every strength is
   vacuously exclusive; the correct output is no differentiator list at all, not
   a full one.
2. **Resolve the role's requirements** into normalized identities, each tagged
   must-have or desirable.
3. **For each candidate, take only matched requirements** — recorded matches,
   with their evidence basis retained.
4. **Intersect against every rival's matched set** on normalized identity, and
   keep what no rival holds.
5. **Sort must-haves first, then by evidence strength.**
6. **Apply the display cap last**, and report the hidden count.
7. **Compute the complement too.** What every candidate on the shortlist lacks is
   the most actionable finding a comparison can produce, because it is a fact
   about the *role definition or the sourcing*, not about the people. A shortlist
   where nobody matches a must-have means the requirement is unrealistic, the
   sourcing missed a channel, or the requirement is mis-specified — and that
   sentence saves more hiring time than any ranking.

## Decision rules

- When a strength is unique but not role-relevant, drop it from the comparison.
  It may appear on the candidate's own profile; it may not appear as a reason to
  prefer them.
- When a strength is role-relevant and matched but held by a rival, it belongs in
  a shared-strengths section if one exists, never in the differentiator list. A
  comparison that lists the same capability under both candidates as what sets
  each apart has said nothing.
- When two candidates match the same requirement at visibly different evidence
  tiers, that is a *strength-of-evidence* difference, not exclusivity. Say it that
  way; do not promote it to a differentiator.
- When the differentiator list is empty for every candidate, say so explicitly.
  "These candidates are not differentiated on the role's requirements" is a real
  and useful verdict, and it should push the reader toward a structured interview
  rather than toward the top row.
- When a differentiator is derived rather than recorded — inferred from a job
  title, a company, a tenure — it is not a differentiator. Inferences do not get
  the grammar of matched evidence.

## When not to use it

Do not use differentiators as the ranking. They explain a comparison; they do not
produce one, and counting them as a tiebreak rewards profile breadth over role
fit — a candidate with five exclusive nice-to-haves is not ahead of one with a
single exclusive must-have.

Do not surface a rival-relative differentiator to a candidate. "You were the only
one who…" and its inverse are claims about other applicants, and candidate-facing
feedback speaks only about the candidate's own record.

Do not compute exclusivity across cohorts or over time. It is scoped to the set
being compared; carrying it forward into a different shortlist makes it a claim
about a pool nobody evaluated.
