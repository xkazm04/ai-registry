---
layer: application
type: application
subject: collective-and-statutory-hiring-governance
technique: machine-ordering-after-independent-reads
stack: spec
status: forged
verified_on: 2026-09-28
refresh_by: 2027-09-28
source: Personnel-Psychology/Pulakos-et-al-1996-abstract+arXiv/2102.09692-abstract+EU/AI-Act-Art-14(4)(b)+EU/CJEU-C-634-21+US-FL/Florida-Bar-open-government-overview-2018
---

# The evidence behind the sequence

**Pin.** Retrieved 2026-09-28. The two research findings are cited from their
abstracts only (Crossref, arXiv). The full papers were not read, and nothing
beyond what the abstract states is claimed here. The legal texts are pinned on
the sibling spec page for the advisory technique. The research does not expire
like a statute, so the clock is a year.

## Why the members' reads come first and are combined mechanically

**Pulakos, Schmitt, Whitney and Smith, "Individual differences in interviewer
ratings: the impact of standardization, consensus discussion, and sampling
error on the validity of a structured interview", Personnel Psychology 49
(1996), doi:10.1111/j.1744-6570.1996.tb01792.x.** The abstract, on 62
interviewers: "the validity of ratings averaged across interviewers compared to
consensus ratings; consensus ratings were shown to have significantly but
probably not practically higher validities." Averaging the independent ratings
gives up nothing that matters. The consensus meeting costs the independence and
buys almost nothing measurable. That is the basis for step 4: the mechanical
combination is the scored output of record, and discussion surfaces evidence.

## Why the machine's ordering comes after them

**Buçinca, Malaya and Gajos, "To Trust or to Think: Cognitive Forcing Functions
Can Reduce Overreliance on AI in AI-assisted Decision-making" (arXiv
2102.09692).** The abstract: "People supported by AI-powered decision support
tools frequently overrely on the AI: they accept an AI's suggestion even when
that suggestion is wrong. Adding explanations to the AI decisions does not
appear to reduce the overreliance". In an experiment (N=199), "cognitive forcing
significantly reduced overreliance compared to the simple explainable AI
approaches. However, there was a trade-off: people assigned the least favorable
subjective ratings to the designs that reduced the overreliance the most."

This is out of the hiring domain, and the abstract does not say which of the
three forcing designs did best. It supports two things only. Explanation alone
does not fix over-reliance, so a well-annotated ordering in the pre-read is not
enough. And a design that makes people commit first will be disliked, which is
the technique's "keep the step cheap" rule.

The legal half of the reason is the weight test: a score the deciders "draw
strongly on" is the decision (CJEU, C-634/21), and oversight must guard against
"automatically relying or over-relying" on a recommendation (AI Act Art.
14(4)(b)). Neither text prescribes a sequence. The sequence is this technique's
answer to how an organisation would ever *know* how strongly its committee drew
on the ordering.

## Where the aggregate must be adopted in public

The Florida Bar's open-government overview (2018) describes a case in which a
selection committee violated the open-meeting law "when the city clerk
unilaterally ranked the proposals based on the committee members' individual
written evaluations; the court held that 'the short-listing was formal action
that was required to be taken at a public meeting'" (Leach-Wells v. City of
Bradenton, 1999). The same overview says members may vote by written ballot
"as long as the votes are made openly at a public meeting, the name of the
person who voted and his or her selection are written on the ballot". The
case concerned procurement proposals, not applicants, and it is read here as
the Bar describes it. The rule it gives the technique is narrow: in an
open-meeting jurisdiction, the mechanical aggregate is computed for the meeting
and adopted there, with scores attributed by name.

## Convergence

Three lanes reached the sequence independently. The training-data lane, blind
to search, recommended revealing the machine "afterwards as one extra, labelled
rater" and said showing an order before independent ratings is poor practice.
The primary-text lane found the automation-bias duty and the weight test. The
counter-evidence lane confirmed independent rating before debrief and found that
mechanical combination matches consensus on validity.
