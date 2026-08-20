---
layer: golden-path
type: golden-path
subject: requirement-inflation-control
status: forged
use_when: [a requisition arrives with a long must-have list, deciding whether a stated requirement is genuinely required, auditing a degree or years-of-experience line, a generated draft invented requirements the input never stated]
techniques:
  - ninety-day-outcome-as-the-despec-filter
  - must-have-soft-cap-and-forced-ranking
  - degree-and-tenure-requirement-audit
  - inherited-template-detection
  - never-promote-an-unstated-tool
  - learnable-versus-prerequisite-grading
---

# Requirement inflation control

A requisition inflates the way a document inflates: by accretion, in small
defensible increments, each added by someone with a reason and none removed by
anyone with standing. The end state is a list nobody can satisfy — not because
the work got harder, but because the list stopped being a description of the
work and became a union of everything anyone ever wished for it.

This subject is the discipline that separates **what the job genuinely
requires** from **what the requestor wishes for, inherited, or was handed by a
machine**. It is not the conversation that elicits requirements, and it is not
the artifact that stores them. It is the standard applied to each candidate
requirement at the moment someone proposes calling it required, and the small
number of structural devices — an outcome filter, a cap, a grading axis, a
provenance rule — that make the standard survive contact with a manager who
wants everything.

## Inflation is a ratchet, and the ratchet is economic

The naive reading is that inflated lists come from unreasonable managers. They
almost never do. They come from an asymmetry that operates identically on
reasonable ones:

- **Adding is free at the moment of adding, and expensive later.** A
  must-have costs one clause to write and is paid for months later by a
  recruiter whose search returns eleven people. The person paying is not the
  person spending.
- **Deleting requires standing nobody has.** Removing a line someone else
  wrote — or a predecessor wrote, or the template came with — means asserting
  that a colleague's stated need is not real. Absent an explicit device that
  authorizes deletion, the rational move is always to leave it in.
- **Over-specification feels like risk management.** A bad hire is vivid,
  attributable and remembered; an unfilled requisition is diffuse, blamed on
  "the market", and nobody's fault. So the requestor's private cost function
  genuinely favours a list that is too long, and telling them the list is too
  long does not change that function.
- **Filters multiply, and nobody multiplies them in their head.** Each
  must-have is a conjunctive filter. Twelve individually-plausible ones do not
  describe a rare person; they describe a person who does not exist at the
  offered band. Requestors reason additively about a list that behaves
  multiplicatively, which is why the list always feels reasonable line by
  line and is never reasonable as a whole.

The consequence for practice: **inflation control cannot be a matter of
persuasion.** Any method that depends on convincing the requestor that they
want less will fail against the incentives above. What works is supplying a
*device* — a filter, a cap, an audit, a grading axis — that makes the
deletion decision cheap, attributable to the requestor rather than the
recruiter, and made once rather than re-litigated at every stage.

## The four sources, which need four different controls

Treating inflation as one phenomenon produces one blunt intervention ("shorten
the list") that lands on the wrong lines. The sources are distinguishable, and
each has its own tell and its own counter-move.

| Source | Tell | Counter |
| --- | --- | --- |
| **Inheritance** — sediment copied forward from an old description or a peer posting | requirements the requestor cannot explain, that match no ninety-day outcome, and that appear verbatim in unrelated roles | inherited-template-detection |
| **Aspiration** — a wish list built from the ideal hire rather than the needed one | everything is a must; the requestor agrees each is important when asked one at a time | must-have-soft-cap-and-forced-ranking |
| **Proxy** — a label standing in for a capability nobody articulated | a degree, a years figure, a named employer, a tenure pattern | degree-and-tenure-requirement-audit |
| **Machine** — a drafting system promoting its own illustrative examples into requirements | named tools, products or processes in the requirement list that appear nowhere in the source material | never-promote-an-unstated-tool |

The fourth source is new and under-policed. Where role specifications are
drafted by a language model from an intake transcript or a short brief, the
model fills gaps with the most typical content for the role — which is
precisely the inherited sediment of the whole corpus, arriving instantly and
in confident prose. A drafting system without a grounding rule is an
inflation engine with better grammar.

## The despec filter: outcomes decide, and they decide by exclusion

The single highest-yield device is an ordering rule borrowed from intake and
used here as a *test* rather than an elicitation move: state what the person
must have gotten **done** by the end of their first ninety days, then admit as
a must-have only what one of those outcomes cannot be reached without.

Its power is that it converts an argument about importance into a question
about mechanism. "Is a degree important?" has no answer that a requestor and a
recruiter can settle. "Which of these four outcomes becomes impossible without
it?" has exactly one honest answer, and when the answer is "none", the
demotion happens in the requestor's own voice. This is the difference between
a control that works and a control that generates resentment.

The filter's rule is stated as an implication, not a preference: **a must-have
that maps to no ninety-day outcome is a nice-to-have.** Not "is suspicious",
not "should be discussed" — is. The strictness is what makes it cheap to
apply; a hedged filter reopens every line for negotiation.

Underneath the filter sits a grammatical move worth naming on its own: the
**have-to-do reframe**. A specification written as what the person must *have*
is a list of attributes and admits no test; the same specification written as
what they will *deliver* is a small set of objectives that each requirement
has to justify itself against. Five or six deliverables is the working size.
The reframe is what makes the filter answerable, and it is the standing repair
for a requisition that reads as a portrait of a person rather than a
description of work.

The other half of the device is **timing**: push back at intake, not after the
shortlist. The same objection costs a sentence before sourcing and costs the
recruiter's credibility afterwards, because a challenge to the requirements
raised once the pipeline is thin reads as an excuse for a thin pipeline rather
than as advice. Every device in this subject is cheap early and expensive
late, and that ordering is not a matter of convenience — it is what keeps the
recruiter in the advisor seat.

The filter also detects the case where there is no role. A requestor who
cannot state a first-quarter outcome does not have an under-specified
requisition; they have a workload complaint, and the correct output of the
session is that finding rather than a shorter list.

## The must line needs a cap, because past a count people stop discriminating

Requirement grading degrades with list length. Asked to classify twenty items
as must or nice, people classify the first five carefully and the rest by
mood — the list stops being a decision and becomes a transcript of everything
mentioned. A cap restores the decision by making the classification scarce.

Roughly six is the working number for a must-have list, and eight is where
tooling should start objecting. The cap is not sacred; the *existence* of a
cap is. And the response to breaching it is never a silent trim by the
recruiter: ask the requestor to **rank the top three**. People who cannot
classify can almost always order, and a ranking is self-executing — the
demotions fall out of it without anyone having to argue that a line was wrong.

The cap has a second justification that is about the pool rather than the
decision. Long must-have lists suppress applications from exactly the people
the pool most needs, because a meaningful share of applicants read a
requirement list as a rules document and decline to apply unless they meet
every item, while others read it as a wish list and apply at half the bar.
That asymmetry — well attested in self-selection surveys, though the widely
quoted percentages behind it are folklore rather than measurement, and should
be repeated as direction rather than as a number — means a long list does not
merely narrow the pool, it narrows it *non-randomly*. Whether the resulting
pool is still fillable, and how it is measured, belongs to the fillability
forecast practice; the language that deters belongs to the advertising lint.
This subject owns the count.

## Two axes, and only one of them is a filter

The load-bearing distinction is not important-versus-unimportant. It is:

- **Prerequisite** — must exist at hire, because the ninety-day outcome
  arrives before the learning could. A hard filter.
- **Learnable** — acquirable inside the role's ramp by someone with the
  prerequisites. Never a filter; at most a tiebreak, and often better
  expressed as an example than as a criterion.

Every candidate requirement gets graded on that axis, and the grading is a
statement about **time**, not about value. A skill can be highly valuable and
still learnable in three weeks, in which case filtering on it discards good
candidates to save three weeks. Conversely a modest-sounding capability whose
absence blocks a day-thirty outcome is a genuine prerequisite however
unglamorous it is.

The two axes are **independent**, and collapsing them is a common
implementation error with a real cost: systems that derive hardness from the
must/nice grade ("musts are prerequisites, nices are learnable") make the most
diagnostic item in the whole taxonomy — the *learnable must-have* —
inexpressible, and it is precisely the learnable must-have that inflation
control exists to find.

Three consequences follow that practitioners routinely miss:

- **The ratio is a signal about the role, not only about the list.** A role
  whose must-haves are largely learnable is a role that has been specified as
  a person rather than as work; a role with no learnable content at all has
  been specified as a replacement for the person who left. Both readings are
  worth surfacing to the requestor.
- **The partition must fail in one direction only.** Must and nice are
  usually derived from one graded list by a partition rule, and the rule gets
  re-implemented wherever the list is consumed. When one consumer treats an
  unrecognised grade as "must" and another treats it as "nice", an
  off-taxonomy item is simultaneously a hard sourcing filter and a decorative
  preference — and neither reader can see the other's reading. Single-source
  the partition, and make its fallback for anything unrecognised the
  *non-filtering* side, per
  [uncertainty-resolves-toward-the-candidate](../_laws.md#uncertainty-resolves-toward-the-candidate).
  A grade nobody defined must never harden into a gate.
- **A grade a human confirmed outranks a grade a system inferred.** Where a
  requestor's own graded list exists — read back and affirmed in the session —
  a downstream generator may not silently re-grade it. It carries the
  confirmed grades through, and where its own analysis concretely contradicts
  one, it says so as a finding rather than resolving it by overwrite.

## Proxies are where inflation becomes an impact problem

A degree line, a years-of-experience floor, a named-employer preference and a
continuous-employment expectation are not merely over-specification. They are
correlated with circumstance and with protected characteristics, which means
an unjustified one is not a slow search — it is an exclusion the organization
will have to defend. The published evidence on degrees is the clearest case in
the field: postings demanding a degree at rates far above the rate at which
people *currently doing that job* hold one, with the gap running to tens of
points in some occupations. A standard that the majority of successful
incumbents do not meet is not a standard; it is sediment with a filter
attached.

Two disciplines follow. First, proxies get audited **first**, before the
general list, because they are the cheapest to remove before they are written
down and the most expensive to remove afterwards. Second, removing the line
from the posting is not the same as removing it from the decision: follow-up
work on employers who publicly dropped degree requirements found the change in
who actually got hired to be a small fraction of the change in what the
postings said. The control has to reach the screening rubric and the
interviewer's private bar, or it has changed nothing but the advertisement.

## The control is advisory, and the demotion is the requestor's

Every device here is designed so that the recruiter or the drafting system
**reflects a trade-off** and the requestor decides. Never argue a requirement
down; state what it costs and what it buys, and let them keep it. The reason
is partly stance — an advisor who wins arguments stops being consulted — and
partly record: a requirement demoted by the recruiter is a recruiter's
decision wearing a manager's name, and when the search fails or the rejection
is challenged, nobody can say who owned it. Per
[every-decision-names-its-actor](../_laws.md#every-decision-names-its-actor),
a demotion has an author, and it must be the person whose need it was.

The corollary is that a kept-despite-the-filter requirement is a *success* of
the control, not a failure. The device did its job: the trade-off was stated,
the decision was made by the right person, and it is now on the record as
deliberate rather than inherited. Inflation control aims at the unexamined
line, not at a shorter list for its own sake.

## The seams

This subject is one of five that touch a requisition before it is published,
and the boundaries are worth stating because each of the others will happily
absorb this one.

- The **intake conversation** owns the elicitation moves — how a requirement
  is surfaced, how a label is climbed to the construct beneath it, how the
  session is paced and closed. This subject consumes the output of a ladder;
  it does not re-teach the climb. Laddering answers *what does this label
  mean*; inflation control answers *does the meaning belong on the must
  line*.
- The **structured brief** owns the artifact — how a graded requirement is
  stored, versioned, attributed to the turn and the speaker it came from, and
  merged when a second session amends the first. This subject decides the
  grade; that one records it and keeps it auditable.
- **Inclusive advertising** owns the language lint — the phrasing, the
  gendered adjective, the ableist verb, the tone of the requirement section.
  It works on the same list from the other side: it can make a requirement
  read better without making it less exclusionary, which is exactly why the
  count control cannot be delegated to it.
- The **fillability forecast** owns counterfactual pool measurement — what
  the pool looks like with and without a given requirement, before publishing.
  It supplies the number this subject's arguments would otherwise lack; a
  requirement kept after seeing its pool cost is far better decided than one
  kept after a discussion.
- **Adverse-impact review** consumes what survives here. A proxy this subject
  fails to audit becomes that subject's incident.

The practical rule on the seams: when a control needs a *pool number*, it is
the forecast's; when it needs a *word*, it is advertising's; when it needs a
*storage guarantee*, it is the brief's; everything about whether a line
deserves the word "required" is this one's.

## Failure modes this standard exists to prevent

- **The impossible requisition** — twelve conjunctive musts, a search that
  returns nobody, and a market blamed for a specification defect.
- **Sediment with authority** — an inherited line defended in a debrief by
  people who have no idea it was inherited.
- **The silent trim** — a recruiter shortening the list alone between
  sessions, producing a brief the requestor does not recognise and will
  override the moment a candidate is rejected on it.
- **The invented tool** — a generated draft naming a product the input never
  mentioned, which becomes a hard filter three stages downstream because
  nothing marks it as illustration.
- **The learnable filter** — screening out on something the role's own ramp
  would have taught in a fortnight.
- **The paper reset** — the degree line deleted from the posting and retained
  in the screening rubric and the interviewer's head.
- **The two-fallback partition** — the same graded list read as a filter by
  one consumer and as a preference by another, with no reader able to see the
  discrepancy.
- **The cap as a trim** — hitting the limit and dropping the last two items
  by position rather than asking for a ranking.

## The techniques

- [ninety-day-outcome-as-the-despec-filter](techniques/ninety-day-outcome-as-the-despec-filter.md)
  — the outcome set as the admission test for the must line, and what to do
  when there are no outcomes.
- [must-have-soft-cap-and-forced-ranking](techniques/must-have-soft-cap-and-forced-ranking.md)
  — the count control, and the ranking that executes the demotions without an
  argument.
- [degree-and-tenure-requirement-audit](techniques/degree-and-tenure-requirement-audit.md)
  — the proxy sweep, the incumbent test, and why deleting the line is only
  half the job.
- [inherited-template-detection](techniques/inherited-template-detection.md)
  — spotting sediment by its fingerprints before it acquires a defender.
- [never-promote-an-unstated-tool](techniques/never-promote-an-unstated-tool.md)
  — the grounding rule for generated requirement lists, and where illustration
  is allowed to live.
- [learnable-versus-prerequisite-grading](techniques/learnable-versus-prerequisite-grading.md)
  — the time-based axis, the ratio as a role signal, and the one-direction
  fallback.
