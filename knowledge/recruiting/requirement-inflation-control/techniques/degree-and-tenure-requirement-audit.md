---
layer: technique
type: technique
subject: requirement-inflation-control
technique: degree-and-tenure-requirement-audit
status: forged
laws: [meaning-does-not-live-in-a-label, a-claim-carries-its-sample-and-its-basis, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [a degree or years-of-experience line appears in a requisition, auditing proxy requirements before publishing, a team announces it has dropped degree requirements]
---

# The degree and tenure requirement audit

A small family of requirements does disproportionate damage: the degree line,
the years-of-experience floor, the named-employer or named-institution
preference, and the continuous-employment expectation. They share a shape —
each is a *label* standing in for a capability nobody articulated — and they
share a consequence: each correlates with circumstance and with protected
characteristics, so an unjustified one is not merely a slow search but an
exclusion the organization may have to defend.

This technique is the sweep that catches them, run **before** the general
requirement pass, because these are the cheapest lines to remove before they
are written down and the most expensive afterwards.

## Why these four, and not the whole list

They are the requirements most likely to be inherited rather than reasoned,
and the least likely to be challenged, because each carries a surface
plausibility that ends the conversation. "It's a senior role, so five years."
The label is doing all the work and the construct beneath it was never
stated — which is exactly the condition
[meaning-does-not-live-in-a-label](../../_laws.md#meaning-does-not-live-in-a-label)
exists to prohibit: a filter keying off a display string will exclude people
on something nobody decided.

The scale of the degree case settles the argument about whether this is
theoretical. Large-corpus analyses of job postings find degrees demanded at
rates far above the rate at which people *currently doing that work* hold one,
with gaps running to tens of percentage points in some occupations — in the
most-cited example, a supervisory occupation where the posting rate exceeded
the incumbent rate by roughly fifty points. A requirement that the clear
majority of people successfully doing the job do not meet is not a standard
that applicants are failing. It is sediment with a filter attached.

## The audit

Run each candidate proxy through four questions, in order. The first stop wins;
do not run the rest.

1. **Is it legally mandated to perform the work?** A licence, a registration,
   a clearance a jurisdiction requires. If yes, record the specific credential
   and the authority that mandates it, and stop. This is not a proxy, and
   laddering it wastes a turn.
2. **What does the label buy?** Not "why do you want it" — that invites
   justification. "What would someone with the degree be able to do that
   someone without it couldn't?" The answer, when there is one, is the
   construct: the actual requirement, which can now be stated directly and
   evidenced by more than one route.
3. **The incumbent test.** "Of the people currently doing this work well —
   here, or that you've worked with — how many have it?" This is the single
   most productive question in the audit, because the requestor usually
   answers honestly and the answer is usually "about half", and they hear
   themselves say it. Where organizational data exists, look it up rather than
   asking; a rate over real incumbents is evidence, and a recollection is a
   hypothesis
   ([a-claim-carries-its-sample-and-its-basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis)).
4. **The disqualification test.** "Would you decline to interview someone
   otherwise outstanding who lacked exactly this?" A "no, we'd talk to them"
   is a demotion, and it is the requestor's own.

Then convert. A proxy that survives is restated as the construct with an
**evidence set** — the routes by which someone could demonstrate it, of which
the original label is one. "A degree, or equivalent demonstrated experience"
is the weakest possible version of this and should be treated as a placeholder
rather than a result: it leaves the screener with no rule and quietly restores
the original filter in practice.

## The tenure variants

The years figure deserves separate handling because it fails differently. It
is not usually a proxy for a *capability*; it is a proxy for **exposure
count** — how many times someone has seen a thing happen. Two years spanning
four incidents beats six years spanning none, and the requestor almost always
agrees once the question is put that way. So the conversion for a years line
is to name the exposures: "has been through at least one migration of this
size", "has carried on-call for something they built".

The conversion has a mechanical form worth using, because it can be applied
consistently and even automated as a first pass over an existing requirement
list: **strip the tenure and seniority phrasing, then restate what remains as
a demonstrable foundation.** "Three or more years of data-pipeline work"
becomes "demonstrated foundation in data-pipeline work", which someone can
evidence through projects, contributions or a work sample rather than through
elapsed time. Automated stripping is a proposal, never a rewrite: it produces
a candidate restatement the requestor accepts or rejects, and what it removed
stays visible so nobody loses a genuinely intended constraint.

**An experience floor nobody stated must never render as though someone had.**
Where a pipeline needs a years figure and the requisition supplies none, the
figure it derives from seniority is an assumption and has to be labelled as
one wherever it is shown or reasoned from. A rationale asserting a bare
"minimum three years" beside a requisition whose stated minimum is empty is a
self-contradiction the reader cannot detect, and it is
[absence-of-evidence-is-not-evidence](../../_laws.md#absence-of-evidence-is-not-evidence)
in its most ordinary costume: an unstated requirement acquiring the authority
of a stated one by passing through a default.

Two further tenure lines are worth naming because they are rarely graded at
all and act as filters anyway:

- **Continuous employment.** A gap-free history is a proxy for circumstance —
  caregiving, illness, immigration, layoffs, national service. It predicts
  nothing about capability and it excludes a population that is not random.
  It has no place on a requirement list; where it lives in a screener's habits
  rather than in the document, that is the adverse-impact practice's problem,
  and it starts here.
- **Average tenure per role.** "No job-hopping" is a prediction of retention
  made from a document, which is a hypothesis, not a requirement. Where it
  matters it is a probe for the interview, not a filter for the pipeline.

## Removing the line is half the job

The most important finding in the recent literature on this technique is that
the visible change and the real change diverge. Follow-up work on employers who
publicly dropped degree requirements found the change in who actually got
hired to be a small fraction of the change in what the postings said — the
requirement moved from the document into the screening rubric, the search
query and the interviewer's private bar, where it kept filtering and stopped
being auditable.

So the audit is not complete when the line is deleted. It is complete when:

- the **search query** no longer contains the label as a hard clause;
- the **screening rubric** grades the construct and its evidence set, not the
  label;
- the **interview loop** has a question that tests the construct, so an
  interviewer who privately believes the degree matters has something legible
  to be persuaded by;
- the change is **recorded as a change**, with its reason, so the line does
  not silently reappear in the next copy of the description.

An audit that stops at the posting has improved the advertisement and changed
nothing about who gets hired — and it has made the exclusion harder to find,
which is strictly worse than leaving it stated.

## When not to use it

- **On a mandated credential**, per step one. Second-guessing a legal
  requirement reads as second-guessing the law and costs the recruiter
  standing they will need for the lines that matter.
- **On a requirement the requestor has already stated in construct terms.**
  "Someone who has closed books under an audit" is already the construct; there
  is no label to excavate.
- **As a judgment about a specific candidate.** The audit governs what goes on
  the list. It never argues that a particular person's missing degree should be
  overlooked — that is a shortlist conversation, with different evidence and a
  different owner.
- **As a substitute for impact review.** A proxy that survives this audit has
  been *justified*, not cleared: whether the surviving requirement produces
  disparate outcomes at scale is measured downstream, over real selection
  rates, by the adverse-impact practice. This technique's job is to ensure
  that whatever reaches that measurement is at least something someone
  decided.
